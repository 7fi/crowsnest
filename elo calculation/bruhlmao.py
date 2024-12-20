import os
from bs4 import BeautifulSoup
import pandas as pd

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
  
# need to deal with redress
def parseScore(scoreString):
    if scoreString.text.isdigit():
        return int(scoreString.text)
    elif scoreString.has_attr('title'):
        return int(scoreString['title'][1:-1].split(",")[0].split(":")[0])

def makeRaceSeries(score, team, raceNum, division, name, link, gradYear, position, partner, venue, regatta, teams, date, teamlink):
    raceSeries = pd.Series()
    raceSeries['raceID'] = "" + regatta + "/" + str(raceNum) + division
    if isinstance(score, int):
        raceSeries["Score"] = score
    else:
        raceSeries["Score"] = len(teams) + 1
    raceSeries["Date"] = date
    raceSeries["Div"] = division
    raceSeries["Sailor"] = name
    raceSeries["Link"] = link
    raceSeries["GradYear"] = gradYear
    raceSeries["Position"] = position
    raceSeries["Partner"] = partner
    raceSeries["Team"] = team
    raceSeries["Teamlink"] = teamlink
    raceSeries["Venue"] = venue
    raceSeries["Regatta"] = regatta
    raceSeries["Teams"] = teams
    return raceSeries
  
def processData(soup):
    if soup is None:
        print("None soup...")
        return []

    finalRaces = []
    regatta = soup['regattaID']
    fullScores = soup['fullScores']
    sailors = soup['sailors']
    scoring = soup['scoring']

    # Validate the scores table
    scores_table = fullScores.find_all('table', class_="results")
    if not scores_table:
        print(f"no scores entered for {regatta}, skipping")
        return []

    # Extract race counts and other metadata
    scores_table = scores_table[0]
    scoreData = scores_table.contents[1].contents
    header = scores_table.find_all('th', class_="right")
    raceCount = int(header[-2].text)

    # Determine the number of divisions
    numDivisions = 1
    if scoreData[1]['class'][0] == 'divB' and scoreData[2]['class'][0] == 'totalrow':
        numDivisions = 2
    if scoreData[2]['class'][0] == 'divC':
        numDivisions = 3

    # Compute team count and homes
    teamCount = int(len(scoreData) / (numDivisions + 1))
    teamHomes = [
        scoreData[(k * (numDivisions + 1)) - (numDivisions + 1)].find('a').text
        for k in range(teamCount)
    ]

    host = fullScores.find("span", itemprop='location').text
    date = fullScores.find("time").attrs['datetime'][:10]

    if scoring == "Combined":
        teamHomes *= numDivisions

    # Process each team
    for i in range(1, teamCount + 1):
        base_index = (i * (numDivisions + 1)) - (numDivisions + 1)
        teamHome = scoreData[base_index].find('a').text
        teamName = scoreData[base_index + 1].contents[2].text
        teamLink = scoreData[base_index].find('a')['href']
        teamScores = {div: [] for div in ["A", "B", "C"]}

        # Extract scores for each division
        teamScores["A"] = [parseScore(scoreData[base_index].contents[j]) for j in range(4, 4 + raceCount)]
        if numDivisions > 1:
            teamScores["B"] = [parseScore(scoreData[base_index + 1].contents[j]) for j in range(4, 4 + raceCount)]
        if numDivisions > 2:
            teamScores["C"] = [parseScore(scoreData[base_index + 2].contents[j]) for j in range(4, 4 + raceCount)]

        # Locate the sailors for this team
        teamNameEls = [
            i for i in sailors.find_all('td', class_="teamname")
            if i.text == teamName and i.previous_sibling.find('a')['href'] == teamLink
        ]

        if not teamNameEls:
            print(f"Team name entered wrong. Skipping team {teamName}, regatta {regatta}")
            continue

        teamNameEl = teamNameEls[0]
        row = teamNameEl.parent

        # Process sailor information
        skippers, crews = processSailors(row, sailors, teamScores, regatta, numDivisions)

        # Remove illegal duplicates (skippers/crews in same boat simultaneously)
        removeIllegalDuplicates(skippers, crews, finalRaces, regatta, teamScores)

        # Add races for skippers
        addRaces(skippers, teamScores, finalRaces, teamHome, "Skipper", host, regatta, teamHomes, date, teamLink)

        # Add races for crews
        addRaces(crews, teamScores, finalRaces, teamHome, "Crew", host, regatta, teamHomes, date, teamLink)

    return finalRaces


def processSailors(row, sailors, teamScores, regatta, numDivisions):
    skippers = []
    crews = []
    index = 0

    while row and row['class'][0] not in {"topborder", "reserves-row"} or index == 0:
        index += 1
        division = row.find('td', class_="division-cell").text

        skipper = row.contents[-4]
        skipperName, skipperYear, skipperLink = extractSailorInfo(skipper)

        crew = row.contents[-2]
        crewName, crewYear, crewLink = extractSailorInfo(crew)

        if skipperName and skipperName != "No show":
            skippers.append({
                'name': skipperName, 'year': skipperYear, 'link': skipperLink,
                'races': getRaceNums(parseRaces(skipper.next_sibling.text), len(teamScores[division])),
                'div': division
            })

        if crewName and crewName != "No show":
            crews.append({
                'name': crewName, 'year': crewYear, 'link': crewLink,
                'races': getRaceNums(parseRaces(crew.next_sibling.text), len(teamScores[division])),
                'div': division
            })

        row = row.next_sibling

    return skippers, crews


def extractSailorInfo(cell):
    name = cell.text.split(" '")[0]
    year = cell.text.split(" '")[-1] if " '" in cell.text else None
    link = cell.find('a')['href'].split("/")[2] if cell.find('a') else None
    return name, year, link


def parseRaces(race_string):
    return [i.split("-", 1) for i in race_string.split(",")]


def addRaces(sailors, teamScores, finalRaces, teamHome, position, host, regatta, teamHomes, date, teamLink):
    for sailor in sailors:
        for i, score in enumerate(teamScores[sailor['div']]):
            if i + 1 in sailor['races']:
                finalRaces.append(makeRaceSeries(
                    score, teamHome, i + 1, sailor['div'], sailor['name'],
                    sailor['link'], sailor['year'], position, "Unknown",
                    host, regatta, teamHomes, date, teamLink
                ))


def removeIllegalDuplicates(skippers, crews, finalRaces, regatta, teamScores):
    for sailor in skippers + crews:
        for i, race in enumerate(sailor['races']):
            for existing_race in finalRaces:
                if existing_race['raceID'] == f"{regatta}/{race}{sailor['div']}" and existing_race['Sailor'] == sailor['name']:
                    sailor['races'].remove(race)


if __name__ == "__main__":
  link = "f24/oberg"
  
  if os.path.exists(f"pages/{link}-fullscores.html") and os.path.exists(f"pages/{link}-sailors.html"):
        with open(f"pages/{link}-fullscores.html", "r") as f:
            fullScores = BeautifulSoup(f.read(), 'html.parser')
        with open(f"pages/{link}-sailors.html", "r") as f:
            sailors = BeautifulSoup(f.read(), 'html.parser')
  print(processData({'regattaID': link, 'fullScores': fullScores, "sailors": sailors, 'scoring':"2 Divisions"}))