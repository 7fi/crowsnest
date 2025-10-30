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

CREATE TABLE Teams(
  teamID char(50) PRIMARY KEY,
  teamName varchar(50),
  topFleetRating INT,
  topWomenRating INT,
  topTeamRating INT,
  topWomenTeamRating INT,
  avgRatio INT,
  region char(8),
  link varChar(100)
);

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
    # add techscore links... New table?
    # add seasons? don't want to join with races every time
    year char(6),
    crossLinks INT,
    outLinks INT,
    lastUpdate DATETIME DEFAULT CURRENT_TIMESTAMP() ON UPDATE CURRENT_TIMESTAMP()
);

CREATE TABLE SailorTeams(
    sailorID char(50),
    teamID char(50),
    PRIMARY KEY(sailorID,teamID),
    CONSTRAINT FOREIGN KEY (sailorID) REFERENCES Sailors(sailorID),
    CONSTRAINT FOREIGN KEY (teamID) REFERENCES Teams(teamID)
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
    PRIMARY KEY(season, regatta, raceNumber, division, sailorID),
    CONSTRAINT FOREIGN KEY (sailorID) REFERENCES Sailors(sailorID)
);

CREATE TABLE TRScores(
    season char(4),
    regatta varchar(100),
    raceNumber INT,
    sailorID char(50),
    partnerID char(50),
    score INT,
    penalty varchar(50),
    position char(7),
    date DATETIME,
    scoring char(12),
    venue varchar(40),
    PRIMARY KEY(season,regatta,raceNumber,sailorID),
    CONSTRAINT FOREIGN KEY (sailorID) REFERENCES Sailors(sailorID)
);