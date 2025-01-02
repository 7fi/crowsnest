from openskill.models import PlackettLuce
import pandas as pd
import numpy as np
import time

baseElo = 500

class Sailor:
    def __init__(self, name, year, link, teams, pos, seasons=[], rank=0, rating=baseElo, races=[]):
        self.name = name
        self.year = year
        self.link = link
        self.teams = teams
        self.pos = pos
        self.rank = rank
        self.seasons = seasons
        self.races = []
        self.r = model.rating(rating, rating / 3, name)
        self.avgRatio = 0
        
    def rerate(self, rating):
        self.r = model.rating(rating.mu, rating.sigma, self.name)
        
    def __repr__(self):
        return f"{self.name}: {self.teams}, {self.pos} {str(self.r)} {self.races}"

class Team:
    def __init__(self, name, link, members=[]):
        self.name = name
        self.link = link
        self.members = members
        
def adjust_race_id(row):
    if row['Scoring'] == 'Combined':
        return row['raceID'][:-1]  # Remove the last character (A/B) for combined scoring
    return row['raceID']

# Function to add a sailor to the dictionary
def add_sailor(group, seasons_group, years_group, links_group, role):
    for sailor, teams in group.items():
        if f"{sailor}/{role}" not in people.keys():
            # If no teams are associated, set "Unknown"
            teams = teams if len(teams) > 0 else ["Unknown"]

            # Retrieve the precomputed seasons
            seasons = seasons_group.get(sailor, [])
            year = years_group.get(sailor, [])
            link = links_group.get(sailor, [])
            
            # Add the sailor to the people dictionary
            people[f"{sailor}/{role}"] = Sailor(sailor, year, link, teams, role, list(seasons))


if __name__ == '__main__':
    # with cProfile.Profile() as profile:

        start = time.time()
        print("Started at ", start)

        model = PlackettLuce(balance=False)

        try:
            df_s = pd.read_json("sailorsasf.json")
        except:
            df_s = pd.DataFrame(columns=['Sailor'])
            
        people = {}

        for sailor in list(df_s['Sailor'].unique()):
            # print(sailor)
            positions = df_s.loc[df_s['Sailor'] == sailor, 'Pos']
            for pos in positions:
                teams = df_s.loc[(df_s['Sailor'] == sailor)& (df_s['Pos'] == pos), 'Teams'].iat[0]
                seasons = df_s.loc[(df_s['Sailor'] == sailor) & (df_s['Pos'] == pos), 'Seasons'].iat[0]
                year = df_s.loc[(df_s['Sailor'] == sailor) & (df_s['Pos'] == pos), 'GradYear'].iat[0]
                link = df_s.loc[(df_s['Sailor'] == sailor) & (df_s['Pos'] == pos), 'Link'].iat[0]
                rating = df_s.loc[(df_s['Sailor'] == sailor) & (df_s['Pos'] == pos), 'Elo'].iat[0]
                rank = df_s.loc[(df_s['Sailor'] == sailor) & (df_s['Pos'] == pos), 'Rank'].iat[0]
                races = df_s.loc[(df_s['Sailor'] == sailor) & (df_s['Pos'] == pos), 'Races'].iat[0]
                people[sailor + "/" + pos] = Sailor(sailor, year, link, teams, pos, seasons, rank, rating, races)

        #create people
        # converters={"Teams": lambda x: [y.strip().split("'")[1] for y in x.strip("[]").split(", ")]}
        df_races = pd.read_json("races_new.json")
        df_races['raceNum'] = df_races['raceID'].apply(lambda id: int(id.split("/")[2][:-1]))  # Numeric part
        df_races['raceDiv'] = df_races['raceID'].apply(lambda id: id.split("/")[2][-1])  # Division part (e.g., 'A', 'B')

        df_races_full = df_races.sort_values(['Date', 'raceNum', 'raceDiv']).reset_index(drop=True)

        df_races_skipper = df_races_full.loc[df_races_full['Position'].str.contains('Skipper')].sort_values(['Date', 'raceNum']).reset_index(drop=True) # filter for skippers
        df_races_crew = df_races_full.loc[df_races_full['Position'].str.contains('Crew')].sort_values(['Date', 'raceNum']).reset_index(drop=True) # filter for skippers

        # people = {}

        # Pre-group the data for skippers and crews
        skipper_groups = df_races_skipper.groupby('Sailor')['Team'].unique()
        crew_groups = df_races_crew.groupby('Sailor')['Team'].unique()

        # Precompute seasons for skippers and crew
        skipper_seasons = (
            df_races_skipper.assign(Season=df_races_skipper['raceID'].str.split('/').str[0])
            .groupby('Sailor')['Season']
            .unique()
        )

        crew_seasons = (
            df_races_crew.assign(Season=df_races_crew['raceID'].str.split('/').str[0])
            .groupby('Sailor')['Season']
            .unique()
        )

        skipper_years = (
            df_races_skipper.assign(Season=df_races_skipper['raceID'].str.split('/').str[0])
            .groupby('Sailor')['GradYear']
            .unique()
        )

        crew_years = (
            df_races_crew.assign(Season=df_races_crew['raceID'].str.split('/').str[0])
            .groupby('Sailor')['GradYear']
            .unique()
        )

        skipper_links = (
            df_races_skipper.assign(Season=df_races_skipper['raceID'].str.split('/').str[0])
            .groupby('Sailor')['Link']
            .unique()
        )

        crew_links = (
            df_races_crew.assign(Season=df_races_crew['raceID'].str.split('/').str[0])
            .groupby('Sailor')['Link']
            .unique()
        )

        
        # Add skippers and crew
        add_sailor(skipper_groups, skipper_seasons, skipper_years, skipper_links, 'Skipper')
        add_sailor(crew_groups, crew_seasons, crew_years, crew_links, 'Crew')

        i = 0

        # for type, df_races in zip(['/Skipper'], [df_races_skipper]):
        for type, df_races in zip(['/Skipper', '/Crew'], [df_races_skipper, df_races_crew]):
            # df_races = df_races.loc[df_races['raceID'].apply(lambda id: id.split("/")[0] == 'f24')]
            df_races['adjusted_raceID'] = df_races.apply(adjust_race_id, axis=1) # to make combined division combined
            grouped = df_races.groupby(['Date', 'Regatta', 'adjusted_raceID'], sort=False)

            for (date, regatta, race), scores in grouped:
                scores = scores.sort_values(by=['raceNum', 'raceDiv'])

                if i % 1000 == 0:
                    print(f"Currently analyzing race {i}/{len(df_races['raceID'].unique()) * 2} Regatta:{regatta}, Date:{date}")
                i += 1

                sailors = scores['Sailor']
                if sailors.empty:
                    continue
                if np.isnan(list(scores['Score'])[0]): # B division did not complete the set
                    continue

                # Recalculate global average
                globalAvg = sum([p.r.mu for p in people.values()]) / len(people)

                # Compute regatta average
                regattaAvg = sum([people[p + type].r.mu for p in sailors]) / len(sailors)
                multiplier = (regattaAvg / globalAvg)

                # Initialize racers and ratings
                racers = [people[p + type] for p in sailors]
                
                for p in racers:
                    if len(p.races) > 0:
                        days = (date - sorted(p.races, key=lambda r: r['date'])[-1]['date']).days
                        if p.r.sigma < baseElo // 3:
                            # number of weeks since last competition, scaled by amount it would take to get back to default if a player skipped a season
                            # should be 0 if they competed last week
                            p.r.sigma += ((days // 7) - 1) * ((baseElo / 3) / 10)
                            if p.r.sigma > baseElo // 3:
                                p.r.sigma = baseElo // 3
                
                startingElos = [r.r.ordinal() for r in racers]
                ratings = [[r.r] for r in racers]

                # Skip races with fewer than 2 participants
                if len(ratings) < 2:
                    print(regatta, "did not have enough sailors??")
                    continue

                # Rate using the model
                ratings = model.rate(ratings, list(scores['Score']), weights=[[multiplier]] * len(ratings))

                predictions = model.predict_rank(ratings)

                # Update racers' ratings
                for racer, new_rating in zip(racers, ratings):
                    racer.r = new_rating[0]

                # Calculate changes
                changes = [racers[i].r.ordinal() - startingElos[i] for i in range(len(racers))]

                # Update sailors' race data
                for idx, sailor in enumerate(sailors):
                    sailor_obj = people[sailor + type]
                    sailor_obj.races.append({
                        'score': int(scores.loc[scores['Sailor'] == sailor, 'Score'].iat[0]),
                        'predicted': predictions[idx][0],
                        'ratio': 1 - ((int(scores.loc[scores['Sailor'] == sailor, 'Score'].iat[0]) - 1) / (len(ratings) - 1)), 
                        'change':changes[idx],
                        'regAvg':regattaAvg,
                        'newRating':sailor_obj.r.ordinal(),
                        'date':date,
                        'partner':scores.loc[scores['Sailor'] == sailor, 'Partner'].iat[0],
                        'venue':scores.loc[(scores['Sailor'] == sailor) & (scores['adjusted_raceID'] == race), 'Venue'].iat[0],
                        'raceID': scores['raceID'].iat[0],
                        'scoring': scores.loc[(scores['Sailor'] == sailor) & (scores['adjusted_raceID'] == race), 'Scoring'].iat[0]
                    })
                    
        # Filter sailors who have 'f24' in their seasons list
        eligible_sailors = [p for p in people.values() if 'f24' in p.seasons]

        for pos in ["Skipper", "Crew"]:
            for i,s in enumerate(sorted([p for p in eligible_sailors if p.pos == pos], key=lambda p: p.r.ordinal(), reverse=True)):
                s.rank = i + 1

        allRows = []
        for p in list(people.values()):
            if len(p.races) > 0:
                avgRatio = float(np.array([r['ratio'] for r in p.races]).mean())
                p.avgRatio = avgRatio
                allRows.append([p.name, p.year, p.link, p.rank, p.teams, p.pos, p.r.ordinal(), avgRatio, p.r.sigma, p.seasons, p.races])
            
        df_sailors = pd.DataFrame(allRows, columns=['Sailor','GradYear', 'Link', 'Rank', 'Teams', 'Pos', 'Elo','avgRatio','Sigma', 'Seasons', 'Races'])

        df_sailors.to_json('sailorsexperiment12.json', index=False)

        end = time.time()
        print(f"{int((end-start) // 60)}:{int((end-start) % 60)}")
    
    # result = pstats.Stats(profile)
    # result.sort_stats(pstats.SortKey.TIME)
    # result.print_stats()
    # result.dump_stats("openskilldump.prof")