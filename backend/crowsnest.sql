DROP DATABASE IF EXISTS crowsnest;
CREATE DATABASE IF NOT EXISTS crowsnest;
USE crowsnest;

DROP TABLE IF EXISTS Teams;
CREATE TABLE Teams(
  teamID varchar(50) PRIMARY KEY,
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
  sailorID varchar(50) PRIMARY KEY,
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

DROP TABLE IF EXISTS SailorTSLinks;
CREATE TABLE SailorTSLinks (
    sailorID varchar(50),
    techscoreID INT,
    techscoreLink varchar(100),
    PRIMARY KEY (sailorID, techscoreLink)
);

DROP TABLE IF EXISTS SailorTeams;
CREATE TABLE SailorTeams(
    sailorID varchar(50),
    teamID varchar(50),
    season char(3),
    position char(7),
    raceCount INT,
    PRIMARY KEY(sailorID,teamID, season, position)
#     CONSTRAINT FOREIGN KEY (sailorID) REFERENCES Sailors(sailorID),
#     CONSTRAINT FOREIGN KEY (teamID) REFERENCES Teams(teamID)
);

DROP TABLE IF EXISTS SailorFollows;
CREATE TABLE SailorFollows(
  sailorID varchar(50),
  sailorName varchar(50),
  userID char(32),
  PRIMARY KEY(sailorID, userID),
  CONSTRAINT FOREIGN KEY (sailorID) REFERENCES Sailors(sailorID),
  CONSTRAINT FOREIGN KEY (userID) references Users(userID)
);

DROP TABLE IF EXISTS SailorRivals;
CREATE TABLE SailorRivals(
    sailorID varchar(100),
    rivalID varchar(50),
    rivalName varchar(100),
    rivalTeam varchar(50),
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
    sailorID varchar(50),
    partnerID varchar(50),
    partnerName varchar(100),
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
    sailorID varchar(50),
    partnerID varchar(50),
    partnerName varchar(100),
    opponentTeam varchar(50),
    opponentNick varchar(50),
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
    userID char(32) PRIMARY KEY,
    username varchar(30),
    displayName varchar(50),
    techscoreLink varchar(100) DEFAULT '',
    techscoreID INT DEFAULT 0,
    photoURL varchar(200),
    deleted BOOLEAN DEFAULT FALSE,
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

INSERT INTO HomePageStats( numSailors, numScores, numTeams, exclaimText)
VALUES ( 0,0,0,'We\'re back!');