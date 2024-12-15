from bs4 import BeautifulSoup
import requests
import httpx
import asyncio
import polars as pl  # Import Polars instead of pandas
import numpy as np
import time
import os
from concurrent.futures import ProcessPoolExecutor

def getRaceNums(oldNums, scoresLen):
    newNums = []
    if oldNums == [['']]:
        newNums = list(range(1, scoresLen + 1))
    elif len(oldNums) > 0:
        for i, num in enumerate(oldNums):
            if len(num) > 1:
                for j in range(int(num[0]), int(num[1]) + 1):
                    newNums.append(j)
            else:
                newNums.append(int(num[0]))
    return newNums

def makeRaceSeries(score, team, raceNum, division, name, position, partner, venue, regatta, teams, date, teamlink):
    raceSeries = {
        'raceID': "" + regatta + "/" + str(raceNum) + division,
        "Score": score if isinstance(score, int) else len(teams) + 1,
        "Date": date,
        "Div": division,
        "Sailor": name,
        "Position": position,
        "Partner": partner,
        "Team": team,
        "Teamlink": teamlink,
        "Venue": venue,
        "Regatta": regatta,
        "Teams": teams
    }
    return raceSeries

async def cleanup_semaphore(semaphore):
    if semaphore.locked():
        # Forcefully release if it was accidentally left locked
        semaphore.release()
        print("Semaphore was released manually.")

async def fetchData(client, semaphore, regattaID, link, scoring):
    retries = 5
    backoff = 1
    for attempt in range(retries):
        try:
            async with semaphore:  # Limit concurrent requests
                # full scores
                url = f"https://scores.collegesailing.org/{link}/full-scores/"
                page = await client.get(url)
                fullScores = BeautifulSoup(page.content, 'html.parser')
                page.raise_for_status()  # Raise HTTPError for bad responses (4xx, 5xx)

                # sailors
                url = f"https://scores.collegesailing.org/{link}/sailors/"
                page = await client.get(url)
                sailors = BeautifulSoup(page.content, 'html.parser')
                page.raise_for_status()  # Raise HTTPError for bad responses (4xx, 5xx)
        except httpx.ConnectTimeout as e:
            print(f"Connection timeout when fetching {url}. Retrying... ({attempt + 1}/{retries})")
            await asyncio.sleep(backoff)  # Wait before retrying
            backoff *= 2  # Exponential backoff
        except httpx.ReadError as e:
            print(f"Read error when fetching {url}. Retrying... ({attempt + 1}/{retries})")
            await asyncio.sleep(backoff)  # Wait before retrying
            backoff *= 2  # Exponential backoff
        except httpx.HTTPStatusError as e:
            print(f"HTTP error {e.response.status_code} when fetching {url}. Skipping...")
            await cleanup_semaphore(semaphore)
            return None
        except httpx.RequestError as e:
            print(f"Request error {e}. Skipping...")
            await cleanup_semaphore(semaphore)
            return None
    await cleanup_semaphore(semaphore)
    return {'regattaID': regattaID, 'fullScores': fullScores, "sailors": sailors, 'scoring':regattaID}

def processData(soup):
    finalRaces = []
    
    regatta = soup['regattaID']
    fullScores = soup['fullScores']
    sailors = soup['sailors']
    scoring = soup['scoring']
    
    if len(fullScores.find_all('table', class_="results")) == 0: 
        print(f"no scores entered for {regatta}, skipping")
        return
    
    scoreData = fullScores.find_all('table', class_="results")[0].contents[1].contents
    header = fullScores.find('table', class_="results").find_all('th', class_="right")
    raceCount = int(header[len(header) - 2].text)
        
    numDivisions = 1
    if scoreData[1]['class'][0] == 'divB' and scoreData[2]['class'][0] == 'totalrow':
        numDivisions = 2
    if scoreData[2]['class'][0] == 'divC':
        numDivisions = 3

    teamCount = int(len(scoreData) / (numDivisions + 1))
    
    teamHomes = [(scoreData[(k*(numDivisions + 1)) - (numDivisions + 1)].find('a').text) for k in range(teamCount)]
    
    host = fullScores.find("span", itemprop='location').text
    date = fullScores.find("time").attrs['datetime']
    date = date[:10]
    
    if scoring == "Combined":
        teamHomes = teamHomes * numDivisions

    for i in range(1, teamCount):
        teamHome = scoreData[(i*(numDivisions + 1)) - (numDivisions + 1)].find('a').text
        teamName = scoreData[(i*(numDivisions + 1)) - (numDivisions + 1) + 1].contents[2].text
        teamLink = scoreData[(i*(numDivisions + 1)) - (numDivisions + 1)].find('a')['href']
        teamScores = {'A': [], 'B': [], 'C':[]}

        teamScores["A"] = [int(scoreData[(i*(numDivisions + 1)) - (numDivisions + 1)].contents[j].text) for j in range(4, (4 + raceCount)) if scoreData[(i*(numDivisions + 1)) - (numDivisions + 1)].contents[j].text.isdigit()]
        if numDivisions > 1:
            teamScores["B"] = [int(scoreData[(i*(numDivisions + 1)) - (numDivisions + 1) + 1].contents[j].text) for j in range(4, (4 + raceCount)) if scoreData[(i*(numDivisions + 1)) - (numDivisions + 1) + 1].contents[j].text.isdigit()]
        if numDivisions > 2:
            teamScores["C"] = [int(scoreData[(i*(numDivisions + 1)) - (numDivisions + 1) + 2].contents[j].text) for j in range(4, (4 + raceCount)) if scoreData[(i*(numDivisions + 1)) - (numDivisions + 1) + 2].contents[j].text.isdigit()]

        teamNameEls = [i for i in sailors.find_all('td', class_="teamname") if i.text == teamName and i.previous_sibling.find('a')['href'] == teamLink]
        
        if len(teamNameEls) == 0:
            print("team name entered wrong. Skipping team", teamName, regatta)
            continue
        
        teamNameEl = teamNameEls[0]

        index = 0
        row = teamNameEl.parent
        
        skippers = []
        crews = []
        
        while row is not None and row['class'][0] != "topborder" and row['class'][0] != "reserves-row" or index == 0:
            curRow = row
            while curRow.find_all('td', class_="division-cell") == []:
                curRow = curRow.previous_sibling
            division = curRow.find_all('td', class_="division-cell")[0].text

            skipper = row.contents[len(row.contents) - 4]
            skipperName = skipper.text.split(" '", 1)[0]

            crew = row.contents[len(row.contents) - 2]
            crewName = crew.text.split(" '", 1)[0]
            
            if skipperName != "" and skipperName != "No show":
                skipperRaceNums = skipper.next_sibling.text.split(",")
                skippers.append({'name': skipperName, 'races': getRaceNums([i.split("-", 1) for i in skipperRaceNums], len(teamScores[division])), 'div': division})
            
            if crewName != "":
                crewRaceNums = crew.next_sibling.text.split(",")
                crews.append({'name': crewName, 'races': getRaceNums([i.split("-", 1) for i in crewRaceNums], len(teamScores[division])), 'div': division})
                
            row = row.next_sibling
            index += 1
        
        # Remove duplicates for same person in both skipper and crew
        for skipper in skippers:
            for crew in crews:
                for i, race in enumerate(skipper['races']):
                    if skipper['name'] == crew['name'] and race in crew['races'] and skipper['div'] == crew['div']:
                        skippers.remove(skipper)
                        crews.remove(crew)
                        print('removed duplicate skipper/crew', skipper['name'], crew['name'], regatta)
                        break
                      
        for skipper in skippers:
            for i, score in enumerate(teamScores[skipper['div']]):
                    if i + 1 in skipper['races']:
                        for race in finalRaces:
                            if race['raceID'] == f"{regatta}/{str(i + 1)}{skipper['div']}":
                                if race['Sailor'] == skipper['name'] and race['Div'] == skipper['div']:
                                    print("found illegal duplicate skipper:", skipper['name'], regatta)
                                    finalRaces = [s for s in finalRaces if not s.equals(race)]
                                    skipper['races'].remove(i+1)

        for crew in crews:            
            for i, score in enumerate(teamScores[crew['div']]):
                    if i + 1 in crew['races']:
                        for race in finalRaces:
                            if race['raceID'] == f"{regatta}/{str(i + 1)}{crew['div']}":
                                if race['Sailor'] == crew['name'] and race['Div'] == crew['div']:
                                    print("found illegal duplicate crew:", crew['name'], regatta)
                                    finalRaces = [s for s in finalRaces if not s.equals(race)]
                                    crew['races'].remove(i+1)
        
        
        # update skippers and crews once all rows for a team are done.
        for skipper in skippers:
            partners = [crew['name'] for race in skipper['races'] for crew in crews if crew['div'] == skipper['div'] and race in crew['races']]
            for i, score in enumerate(teamScores[skipper['div']]):
                if i + 1 in skipper['races']:
                    partner = partners[skipper['races'].index(i + 1)] if skipper['races'].index(i + 1) < len(partners) else "Unknown"
                    finalRaces.append(makeRaceSeries(score, teamHome, i + 1, skipper['div'], skipper['name'], "Skipper", partner, host,regatta,[t for t in teamHomes], date, teamLink))
                        
        for skipper in skippers:
            for i, score in enumerate(teamScores[skipper['div']]):
                if i + 1 in skipper['races']:
                    partner = "Unknown"
                    partners = [crew['name'] for race in skipper['races'] for crew in crews if crew['div'] == skipper['div'] and race in crew['races']]
                    if skipper['races'].index(i + 1) < len(partners):
                        partner = partners[skipper['races'].index(i + 1)]
                    finalRaces.append(makeRaceSeries(score, teamHome, i + 1, skipper['div'], skipper['name'], "Skipper", partner, host, regatta, [t for t in teamHomes], date, teamLink))

        for crew in crews:
            for i, score in enumerate(teamScores[crew['div']]):
                if i + 1 in crew['races']:
                    partner = "Unknown"
                    partners = [skipper['name'] for race in crew['races'] for skipper in skippers if skipper['div'] == crew['div'] and race in skipper['races']]
                    if crew['races'].index(i + 1) < len(partners):
                        partner = partners[crew['races'].index(i + 1)]
                    finalRaces.append(makeRaceSeries(score, teamHome, i + 1, crew['div'], crew['name'], "Crew", partner, host, regatta, [t for t in teamHomes], date, teamLink))

        skippers = []
        crews = []

    return finalRaces

async def process_in_process(executor, result):
    loop = asyncio.get_event_loop()
    try:
        output = await loop.run_in_executor(executor, processData, result)
        return output
    except Exception as e:
        print("ERROR:", e)
        raise

async def getBatch(client, regattaKeys, regattaValues, semaphore, executor):
    tasks = []
    for i, regatta in enumerate(regattaValues):
        regattaID = regattaKeys[i]
        tasks.append(fetchData(client, semaphore, regattaID, regatta['link'], regatta['scoring']))
    results = await asyncio.gather(*tasks)
    
    tasks = [process_in_process(executor, regatta) for regatta in results]
    rows = await asyncio.gather(*tasks)
    return rows

async def main(regattas):
    async with httpx.AsyncClient(timeout=httpx.Timeout(None, connect=15.0, read=10.0)) as client:
        allRows = []
        batchSize = 100
        semaphore = asyncio.Semaphore(batchSize)
        executor = ProcessPoolExecutor()  # Process pool for CPU-bound work
        
        for j in range(0, len(regattas.values()), batchSize):
            print(f"Processing batch {j // batchSize + 1}...")
            batchKeys = list(regattas.keys())[j:j + batchSize]
            batchRegattas = list(regattas.values())[j:j + batchSize]
            results = await getBatch(client, batchKeys, batchRegattas, semaphore, executor)
            allRows.extend(results)
        return allRows

if __name__ == "__main__":
    # seasons = ['f24', 's24', 'f23', 's23', 'f22', 's22', 'f21', 's21', 'f20', 's20']
    seasons = ['f24']
    
    # Initialize an empty Polars DataFrame
    df_races = pl.DataFrame()
    try:
        df_races = pl.read_csv("racesasdfsa.csv")
    except:
        df_races = pl.DataFrame(
            {"Score": [], "Div": [], "Sailor": [], "Position": [], "Partner": [], "Venue": [], "Regatta": [], "Teams": []}
        )

    regattas = {}
    for season in seasons:
        url = f"https://scores.collegesailing.org/{season}/"
        page = requests.get(url)
        listSoup = BeautifulSoup(page.content, 'html.parser')
        
        tbody = listSoup.find('table', class_="season-summary").find('tbody')
        
        for link in tbody.find_all("a", href=True):
            if (season + "/" + link['href']) not in df_races['Regatta'].to_list():
                scoring = link.parent.next_sibling.next_sibling.next_sibling.text
                if scoring in ["3 Divisions", "2 Divisions", "Combined"]:
                    regattas[season + "/" + link['href']] = {"link": season + "/" + link['href'], "scoring": scoring}

    # Process batches of regattas
    start = time.time()
    totalRows = asyncio.run(main(regattas))
    totalRows = [sub for row in totalRows for sub in row]  # Flatten the list of results
    df_races = pl.DataFrame(totalRows)  # Create a Polars DataFrame with the results
    
    df_races.write_json(f"racespolars.csv")  # Save to CSV using Polars

    end = time.time()
    print(f"{int((end - start) // 60)}:{int((end - start) % 60)}")
