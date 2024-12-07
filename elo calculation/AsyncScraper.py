from bs4 import BeautifulSoup
import requests
import httpx
import asyncio
import pandas as pd
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
    raceSeries = pd.Series()
    raceSeries['raceID'] = "" + regatta + "/" + str(raceNum) + division
    if isinstance(score, int):
        raceSeries["Score"] = score
    else:
        raceSeries["Score"] = len(teams) + 1
    raceSeries["Date"] = date
    raceSeries["Div"] = division
    raceSeries["Sailor"] = name
    raceSeries["Position"] = position
    raceSeries["Partner"] = partner
    raceSeries["Team"] = team
    raceSeries["Teamlink"] = teamlink
    raceSeries["Venue"] = venue
    raceSeries["Regatta"] = regatta
    raceSeries["Teams"] = teams
    return raceSeries

async def cleanup_semaphore(semaphore):
    if semaphore.locked():
        # Forcefully release if it was accidentally left locked
        semaphore.release()
        print("Semaphore was released manually.")

async def fetchData(client, semaphore,regattaID, link, scoring):
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
    
    scoreData = fullScores.find_all('table', class_="results")[
        0].contents[1].contents
    # sailorData = sailors.find('table', class_="sailors").contents[1].contents
    header = fullScores.find(
        'table', class_="results").find_all('th', class_="right")
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

    # loop through teams

    for i in range(1, teamCount):
        teamHome = scoreData[(i*(numDivisions + 1)) - (numDivisions + 1)].find('a').text
        teamName = scoreData[(i*(numDivisions + 1)) - (numDivisions + 1) + 1].contents[2].text
        teamLink = scoreData[(i*(numDivisions + 1)) - (numDivisions + 1)].find('a')['href']
        teamScores = {'A': [], 'B': [], 'C':[]}

        teamScores["A"] = [int(scoreData[(i*(numDivisions + 1)) - (numDivisions + 1)].contents[j].text) for j in range(
            4, (4 + raceCount)) if scoreData[(i*(numDivisions + 1)) - (numDivisions + 1)].contents[j].text.isdigit()]
        if numDivisions > 1:
            teamScores["B"] = [int(scoreData[(i*(numDivisions + 1)) - (numDivisions + 1) + 1].contents[j].text) for j in range(
                4, (4 + raceCount)) if scoreData[(i*(numDivisions + 1)) - (numDivisions + 1) + 1].contents[j].text.isdigit()]
        if numDivisions > 2:
            teamScores["C"] = [int(scoreData[(i*(numDivisions + 1)) - (numDivisions + 1) + 2].contents[j].text) for j in range(
                4, (4 + raceCount)) if scoreData[(i*(numDivisions + 1)) - (numDivisions + 1) + 2].contents[j].text.isdigit()]

        # teamNameEls = [i.parent for i in sailors.find_all('a') if i['href'] == teamLink] # this actually doesnt work because what if teams have two boats...
        teamNameEls = [i for i in sailors.find_all('td', class_="teamname") if i.text == teamName]
        
        if len(teamNameEls) == 0:
            print("team name entered wrong. Skipping team", teamName, regatta)
            continue
        
        teamNameEl = teamNameEls[0]

        rowClass = teamNameEl.parent['class'][1]

        index = 0
        row = teamNameEl.parent
        
        prevSkipper = ""
        prevCrew = ""
        
        # skipperName = ""
        
        # crewName = ""
        
        # only chooses active sailor rows
        while row.next_sibling is not None and row['class'][0] != "topborder" and row['class'][0] != "reserves-row" or index == 0:
            curRow = row
            while curRow.find_all('td', class_="division-cell") == []:
                curRow = curRow.previous_sibling
            division = curRow.find_all('td', class_="division-cell")[0].text

            # Get Skipper
            skipper = row.contents[len(row.contents) - 4]
            skipperName = skipper.text.split(" '", 1)[0]
            
            if skipperName == "No show":
                skipperName = ""

            # Get Crew
            crew = row.contents[len(row.contents) - 2]
            crewName = crew.text.split(" '", 1)[0]
            
            if crewName == "No show":
                crewName = ""
            
            if skipperName != "" and crewName != "":
                skipperRaceNums = skipper.next_sibling.text.split(",")
                skipperRaceNums = getRaceNums([i.split("-", 1) for i in skipperRaceNums], len(teamScores[division]))
                if len(skipperRaceNums) == 0:
                    print(f"skipper {skipperName} sailed no races? skipping")
                    row = row.next_sibling
                    index += 1
                    continue
                
                crewRaceNums = crew.next_sibling.text.split(",")
                crewRaceNums = getRaceNums([i.split("-", 1) for i in crewRaceNums], len(teamScores[division]))
                
                if len(crewRaceNums) == 0:
                    print(f"crew {crewName} sailed no races? skipping")
                    row = row.next_sibling
                    index += 1
                    continue
                
                
                skipperPartners = [(crewName if curRace in crewRaceNums else "Unknown") for curRace in range(1, skipperRaceNums[-1] + 1)]
                crewPartners = [(skipperName if curRace in skipperRaceNums else "Unknown") for curRace in range(1, crewRaceNums[-1] + 1)]
                
                for i, score in enumerate(teamScores[division]):
                    if i + 1 in skipperRaceNums:
                        finalRaces.append(makeRaceSeries(score, teamHome, i + 1, division, skipperName, "Skipper", skipperPartners[i], host,regatta,[t for t in teamHomes], date, teamLink))
                    if i + 1 in crewRaceNums:
                        finalRaces.append(makeRaceSeries(score, teamHome, i + 1, division, crewName, "Crew", crewPartners[i], host,regatta,[t for t in teamHomes],date, teamLink))
                
                prevSkipper = skipperName
                prevCrew = crewName
            
            elif skipperName != "":
                raceNums = skipper.next_sibling.text.split(",")
                raceNums = getRaceNums([i.split("-", 1) for i in raceNums], len(teamScores[division]))

                # need to implement previous persion if unknown
                # previous implementation doesn't work anymore becase it relied on changing a person's races. 
                # now have to edit the dataframe if we use same approach.

                for i, score in enumerate(teamScores[division]):
                    if i + 1 in raceNums:
                        finalRaces.append(makeRaceSeries(score, teamHome, i + 1, division, skipperName, "Skipper", "Unknown", host,regatta,[t for t in teamHomes],date, teamLink))
                
                        
                prevSkipper = skipperName
                
            elif crewName != "":
                raceNums = crew.next_sibling.text.split(",")
                raceNums = getRaceNums([i.split("-", 1) for i in raceNums], len(teamScores[division]))
                
                # still need prev person
                for i, score in enumerate(teamScores[division]):
                    if i + 1 in raceNums:
                        finalRaces.append(makeRaceSeries( score, teamHome, i + 1, division, crewName, "Crew", "Unknown", host,regatta,[t for t in teamHomes],date, teamLink))
    
                    
                prevCrew = crewName

            row = row.next_sibling
            index += 1
        # update skippers and crews
        
        for i, score in enumerate(teamScores[division]):
                    if i + 1 in skipperRaceNums:
                        finalRaces.append(makeRaceSeries(score, teamHome, i + 1, division, skipperName, "Skipper", skipperPartners[i], host,regatta,[t for t in teamHomes], date, teamLink))
                    if i + 1 in crewRaceNums:
                        finalRaces.append(makeRaceSeries(score, teamHome, i + 1, division, crewName, "Crew", crewPartners[i], host,regatta,[t for t in teamHomes],date, teamLink))

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
    async with httpx.AsyncClient(timeout=httpx.Timeout(None,connect=15.0, read=10.0)) as client:
        allRows = []
        batchSize = 100
        semaphore = asyncio.Semaphore(batchSize)
        executor = ProcessPoolExecutor()  # Process pool for CPU-bound work
        
        for j in range (0, len(regattas.values()), batchSize):
            print(f"Processing batch {j // batchSize + 1}...")
            batchKeys = list(regattas.keys())[j:j + batchSize]
            batchRegattas = list(regattas.values())[j:j + batchSize]
            results = await getBatch(client,batchKeys, batchRegattas, semaphore, executor)
            allRows.extend(results)
        return allRows

if __name__ == "__main__":
    
    # seasons = ['f24', 's24', 'f23', 's23', 'f22','s22']
    seasons = ['f24']

    df_races = pd.DataFrame()
    try:
        df_races = pd.read_csv("races123.csv")
    except:
        df_races = pd.DataFrame(columns=["Score", "Div", "Sailor", "Position", "Partner", "Venue", "Regatta", "Teams"])

    regattas = {}
    for season in seasons:
        url = f"https://scores.collegesailing.org/{season}/"
        page = requests.get(url)
        listSoup = BeautifulSoup(page.content, 'html.parser')
        
        tbody = listSoup.find('table', class_="season-summary").find('tbody')
        
        for link in tbody.find_all("a", href=True):
            if (season + "/" + link['href']) not in df_races['Regatta'].unique():
                scoring = link.parent.next_sibling.next_sibling.next_sibling.text
                if (scoring == "3 Divisions" or scoring == "2 Divisions" or scoring == "Combined"):
                    regattas[season + "/" + link['href']] = {"link":season + "/" + link['href'], "scoring":scoring}

    # regattas = {'f24/fall-pacific-coast':{'link':'f24/fall-pacific-coast','scoring':'3 Divisions'}}
    start = time.time()
    totalRows = asyncio.run(main(regattas))
    totalRows = [sub for row in totalRows for sub in row]
    df_races = pd.DataFrame(totalRows)
    df_races.to_csv(f"asyncracestest.csv", index=False)

    end = time.time()
    print(f"{int((end-start) // 60)}:{int((end-start) % 60)}")