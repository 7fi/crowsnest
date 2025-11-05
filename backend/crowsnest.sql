DROP DATABASE IF EXISTS crowsnest;
CREATE DATABASE IF NOT EXISTS crowsnest;
USE crowsnest;

# CREATE TABLE Races (
#     season char(4),
#     regatta varchar(100),
#     raceNumber INT,
#     division char(1),
#     PRIMARY KEY(season,regatta,raceNumber,division)
# );

DROP TABLE IF EXISTS Teams;
CREATE TABLE Teams(
  teamID char(50) PRIMARY KEY,
  teamName varchar(50),
  topFleetRating INT,
  topWomenRating INT,
  topTeamRating INT,
  topWomenTeamRating INT,
  avgRating INT,
  avgRatio FLOAT,
  region char(8),
  link varChar(100)
);

DROP TABLE IF EXISTS Sailors;
CREATE TABLE Sailors(
  sailorID char(50) PRIMARY KEY,
  name varchar(50),
  gender char(2),
  sr INT,
  cr INT,
  wsr INT,
  wcr INT,
  tsr INT,
  tcr INT,
  wtsr INT,
  wtcr INT,
    sRank INT,
    cRank INT,
    wsRank INT,
    wcRank INT,
    tsRank INT,
    tcRank INT,
    wtsRank INT,
    wtcRank INT,
    avgSkipperRatio FLOAT,
    avgCrewRatio FLOAT,
    # add techscore links... New table?
    # add seasons? don't want to join with races every time
    year char(6),
    crossLinks INT,
    outLinks INT,
    lastUpdate DATETIME DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()
);

DROP TABLE IF EXISTS SailorTeams;
CREATE TABLE SailorTeams(
    sailorID char(50),
    teamID char(50),
    season char(3),
    position char(7),
    raceCount INT,
    PRIMARY KEY(sailorID,teamID, season, position),
    CONSTRAINT FOREIGN KEY (sailorID) REFERENCES Sailors(sailorID),
    CONSTRAINT FOREIGN KEY (teamID) REFERENCES Teams(teamID)
);

DROP TABLE IF EXISTS SailorFollows;
CREATE TABLE SailorFollows(
  sailorID char(50),
  sailorName char(50),
  userID char(32),
  PRIMARY KEY(sailorID, userID),
  CONSTRAINT FOREIGN KEY (sailorID) REFERENCES Sailors(sailorID)
#,CONSTRAINT FOREIGN KEY (userID) references Users(userID)
);



DROP TABLE IF EXISTS SailorRivals;
CREATE TABLE SailorRivals(
    sailorID char(100),
    rivalID char(50),
    rivalName char(100),
    rivalTeam char(50),
    position char(10),
    season char(3),
    raceCount SMALLINT,
    winCount SMALLINT,
    PRIMARY KEY (sailorID, rivalID, position, season),
    CONSTRAINT FOREIGN KEY (sailorID) REFERENCES Sailors(sailorID)
#     CONSTRAINT FOREIGN KEY (rivalID) REFERENCES Sailors(sailorID)
);

DROP TABLE IF EXISTS FleetScores;
CREATE TABLE FleetScores(
    season char(4),
    regatta varchar(100),
    raceNumber INT,
    division char(1),
    sailorID char(50),
    partnerID char(50),
    partnerName char(100),
    score INT,
    predicted INT,
    ratio float,
    penalty varchar(50),
    position char(7),
    date DATETIME,
    scoring char(12),
    venue varchar(40),
    boat varchar(30),
    ratingType char(4),
    oldRating int,
    newRating int,
    regAvg int,
    PRIMARY KEY(season, regatta, raceNumber, division, sailorID),
    CONSTRAINT FOREIGN KEY (sailorID) REFERENCES Sailors(sailorID)
);

DROP TABLE IF EXISTS TRScores;
CREATE TABLE TRScores(
    season char(4),
    regatta varchar(100),
    raceNumber INT,
    round varchar(30),
    sailorID char(50),
    partnerID char(50),
    partnerName char(100),
    opponentTeam char(50),
    opponentNick char(50),
    score char(10),
    outcome char(4),
    predicted char(4),
    penalty varchar(50),
    position char(7),
    date DATETIME,
    venue varchar(40),
    boat varchar(30),
    ratingType char(4),
    oldRating int,
    newRating int,
    regAvg int,
    PRIMARY KEY(season, regatta, raceNumber, sailorID),
    CONSTRAINT FOREIGN KEY (sailorID) REFERENCES Sailors(sailorID)
);

DROP TABLE IF EXISTS Users;
CREATE TABLE Users(
    userID char(32),
    username varchar(30),
    displayName varchar(50),
    techscoreLink varchar(100),
    techscoreID INT,
    photoURL varchar(200),
    pro BOOLEAN DEFAULT FALSE
);

DROP TABLE IF EXISTS HomePageStats;
CREATE TABLE HomePageStats(
    id INT PRIMARY KEY DEFAULT 1,
    numSailors INT DEFAULT 0,
    numScores INT DEFAULT 0,
    numTeams INT DEFAULT 0,
    exclaimText tinytext,
    lastUpdate DATETIME DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()
);