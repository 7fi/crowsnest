import numpy as np
import math
import pandas as pd

class Sailor:
    def __init__(self, name, team, position, rating=1500, rd=350, vol=0.06, tau=0.5):
        # Default values for a new player
        self.name = name
        self.team = team
        self.position = position
        self.rating = rating
        self.rd = rd
        self.vol = vol
        self.tau = tau  # System constant for volatility adjustment

        # Pre-compute scaling factor
        self.q = np.log(10) / 400
        self.q2 = np.pow(self.q, 2)
        self.pi2 = (math.pi ** 2)

    def _g(self, rd):
        """G function as per Glicko-2 system."""
        return 1 / np.sqrt((1 + 3 * self.q2 * np.pow(rd,2)) / self.pi2)

    def _E(self, rating, opponent_rating, g):
        """E function as per Glicko-2 system."""
        clamped_diff = max(-800, min((rating - opponent_rating), 800))
        return 1 / (1 + math.exp(-g * clamped_diff * self.q))

    def _update_volatility(self, delta, variance):
        """Update player's volatility."""
        a = np.log(self.vol ** 2)
        A = a
        epsilon = 0.000001

        if delta ** 2 > self.rd ** 2 + variance:
            B = np.log(delta ** 2 - self.rd ** 2 - variance)
        else:
            k = 1
            while self._f(a - k * np.sqrt(self.tau ** 2), delta, variance) < 0:
                k += 1
            B = a - k * np.sqrt(self.tau ** 2)

        fA = self._f(A, delta, variance)
        fB = self._f(B, delta, variance)

        while abs(B - A) > epsilon:
            C = A + (A - B) * fA / (fB - fA)
            fC = self._f(C, delta, variance)
            if fC * fB < 0:
                A = B
                fA = fB
            else:
                fA /= 2
            B = C
            fB = fC

        return math.exp(A / 2)

    def _f(self, x, delta, variance):
        """Intermediate function used for volatility calculation."""
        exp_x = math.exp(x)
        term1 = exp_x * (delta ** 2 - self.rd ** 2 - variance - exp_x)
        term2 = 2 * (variance + self.rd ** 2 + exp_x) ** 2
        return (term1 / term2) - ((x - math.log(self.vol ** 2)) / (self.tau ** 2))

    def update(self, opponents):
        """
        Update rating, RD, and volatility based on match results.

        Args:
            opponents: List of tuples containing (opponent_rating, opponent_rd, score).
                       `score` is 1 for a win, 0 for a loss, and 0.5 for a draw.
        """
        # Convert to Glicko-2 scale
        rating = (self.rating - 1500) / 173.7178
        rd = self.rd / 173.7178

        # Step 2: Compute variance
        variance = 0
        for opponent_rating, opponent_rd, score in opponents:
            opponent_rating = (opponent_rating - 1500) / 173.7178
            opponent_rd = opponent_rd / 173.7178
            g = self._g(opponent_rd)
            E = self._E(rating, opponent_rating, g)
            variance += (g ** 2) * E * (1 - E)
        variance = 1 / variance

        # Step 3: Compute delta
        delta = 0
        for opponent_rating, opponent_rd, score in opponents:
            opponent_rating = (opponent_rating - 1500) / 173.7178
            opponent_rd = opponent_rd / 173.7178
            g = self._g(opponent_rd)
            E = self._E(rating, opponent_rating, g)
            delta += g * (score - E)
        delta *= variance

        # Step 4: Update volatility
        new_vol = self._update_volatility(delta, variance)

        # Step 5: Update rating deviation
        rd_star = np.sqrt(rd ** 2 + new_vol ** 2)
        new_rd = 1 / np.sqrt((1 / rd_star ** 2) + (1 / variance))

        # Step 6: Update rating
        new_rating = rating + new_rd ** 2 * sum(
            self._g((opponent_rd / 173.7178)) * (score - self._E(rating, (opponent_rating / 173.7178), self._g(opponent_rd)))
            for opponent_rating, opponent_rd, score in opponents
        )

        # Convert back to original scale
        self.rating = 173.7178 * new_rating + 1500
        self.rd = 173.7178 * new_rd
        self.vol = new_vol

def setup():
  df_races = pd.read_csv("races.csv",converters={"Teams": lambda x: [y.strip().split("'")[1] for y in x.strip("[]").split(", ")]})

  df_races['Ratio'] = 1 - (df_races['Score'] / df_races['Teams'].apply(len))
  df_races["Ratio"] = df_races["Ratio"].astype(float)
  df_races['numTeams'] = df_races['Teams'].apply(len)
  df_races['raceNum'] = df_races['raceID'].apply(lambda id: int(id.split("/")[2][:-1]))

  df_races['Date'] = df_races['Date'].apply(lambda date: (int(date.split("-")[0]), int(date.split("-")[1]), int(date.split("-")[2])))
  df_races = df_races.sort_values(['Date', 'raceNum']).reset_index(drop=True)

  people = {}
  for p in df_races['Sailor'].unique():
    team = df_races.loc[df_races['Sailor'] == p]['Team'].iat[0] if len(df_races.loc[df_races['Sailor'] == p]['Team']) > 0 else "Unknown"
    pos = df_races.loc[df_races['Sailor'] == p]['Position'].iat[0] if len(df_races.loc[df_races['Sailor'] == p]['Position']) > 0 else "Unknown"
    people[p] = Sailor(p, team, pos)
    
  return (df_races, people)
  
def doElo(df_races, people):
  for i,race in enumerate(df_races['raceID'].unique()):
    if i % 100 == 0:
      print(f"Currently analyzing {i}/{len(df_races['raceID'].unique())}")
    scores = df_races.loc[df_races['raceID'] == race]
    
    sailors = scores['Sailor']
    if len(sailors) == 0:
      continue
    
    globalAvg = sum([p.rating for p in people.values()]) / len(people.keys())
    regattaAvg = sum([people[p].rating for p in sailors]) / len(sailors)
    multiplier = regattaAvg / globalAvg
    
    rating_changes = {}
    for sailor, actual_score in zip(sailors, df_races['Score']):
      sailorScore = scores.loc[sailors == sailor]['Score'].iat[0]
      sailorElo = people[sailor]
      
      # scores.loc[sailors == sailor, 'Elo'] = sailorElo
      partner = scores.loc[scores['Sailor'] == sailor, 'Partner'].iat[0]
      
      # Calculate AvgOpp (average rating of all other sailors)
      # opponents = [people[o].rating for o in sailors if o != sailor and o != partner]
      # avg_opp_rating = 1500
      # if len(opponents) > 0:
      partnerRating = 0 if partner == 'Unknown' else (people[partner].rating / len(sailors))
      avg_opp_rating = regattaAvg - (sailorElo.rating / len(sailors)) - partnerRating
      
      # Calculate expected performance using Elo formula
      ratingDiff = min(avg_opp_rating - sailorElo.rating, 1500) 
      expected_score = 1 / (1 + 10 ** (ratingDiff / 100))
      
      # Calculate rating change based on actual vs expected (32 is scaling facor)
      delta_rating = 32 * multiplier * (actual_score - expected_score)
      rating_changes[sailor] = delta_rating
      
      for other, oScore in zip([people[p] for p in sailors], scores['Score']):
        delta = sailorScore - oScore
        delta = 1 if delta < 0 else 0
        
        sailorElo.update([(other.rating, other.rd, delta)])

    for sailor, delta in rating_changes.items():
      people[sailor].rating += delta
    
      # scores.loc[scores['Sailor'] == sailor,'Elo'] = sailorElo
      # print(sailorElo)
      
    # Dont update main elo until all new elos are calculated
    # for sailor in scores['Sailor']:
      # df_elo.loc[df_elo[0] == sailor,1] = scores.loc[scores['Sailor'] == sailor, 'Elo']
  return people
    
def adjustRange(people):
  #Adjust range
  ratings = [people[p].rating for p in people.keys()]
  lowest = min(ratings)
  highest = max(ratings)

  scale = 10000 / (highest - lowest)
  offset = 0 - (lowest * scale)

  for p in people.values():
    p.rating = p.rating * scale + offset
    
    
  df_elo = pd.DataFrame(columns=['Sailor','Team','Position', 'Elo', 'RD', 'vol'])
  for p in people.values():
    # print(p.name, p.rating)
    df_elo.loc[len(df_elo)] = [p.name, p.team, p.position, p.rating, p.rd, p.vol]
  df_elo = df_elo.sort_values('Elo', ascending=False)
  df_elo.reset_index(drop=True, inplace=True)

  df_elo.to_csv("elo9.csv", index=False)
    
if __name__ == "__main__":
  df, people = setup()
  people = doElo(df, people)
  adjustRange(people)
    