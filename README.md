# Crowsnest:

Crowsnest will be an all in one platform for sports team management, communication, scoring, statistics, and more.

For now it is focused on college sailing, as it is an area that is lacking in products with these features. However, in the future crowsnest will be expanded to support many other sports.

## Current features:

### Ranking:

All scores from techscore in 2022 onward have been scraped to our database and analyzed with our modified elo ranking system to create a system for ranking college sailors.

[All teams ranking](https://7fi.github.io/crowsnest/rankings/team)

There are several pages that can be explored including rankings for the top 100 skippers and crews, rankings for sailors within teams, and individual pages for each sailor.

### Team management

Any individual can create/delete an account in the system.

An individual can create a team, or request to join other teams. If the user owns a team, they can manage requests or teammembers by adding/removing them from the team.

Events can be created by a user, and associated with one of their teams. A teammember can rsvp for an event on their team.

## Planned features:

### Scoring:

Users will be able to create events for their sport, and enter in scores / data associated with these events. These scores will then be accesible live by the public (depending on the settings of the event), and used for statistical analysis.

### Stats:

Users will be able to view statistics about their individual/team perfromance based on the scores entered into the system.

---

### TO-DO:

website:

- [x] Elo change vs partners
- [x] Venue list and frequency

features:

- [_] sailor v sailor comparison
- [_] regatta page

scraper:

- [x] fix unknown partners
- [x] Huskies being marked as on both Northeastern and U Conn if sailed in a regatta together (same with MMA and KP)
- [x] Duplicate sailors being counted twice if sailed for different boats
- [_] wind condition support? (with google places api and historical weather data)

elo calc:

- [_] fix skipping small regattas
- [_] sailors with multiple teams show up on both team pages if sailed in most recent season
- [_] implement 25 races vs out of conference for top 100
