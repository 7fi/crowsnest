import pandas as pd
import requests
from bs4 import BeautifulSoup
import time
from playwright.sync_api import sync_playwright

df_races = pd.read_json("races_new.json")
teamCodes = {}

with sync_playwright() as p:
    # Launch the browser (you can use 'chromium', 'firefox', or 'webkit')
    browser = p.chromium.launch(headless=True)  # headless=False to see the browser
    
    for i,team in enumerate(list(df_races['Team'].unique())):
        # Create a new page
        page = browser.new_page()
        
        teamLink = df_races.loc[df_races['Team'] == team, 'Teamlink'].iloc[0]
        url = f"https://scores.collegesailing.org/schools/{teamLink.split("/")[2]}"

        # Go to the page
        page.goto(url)
        time.sleep(2)

        # Wait for a specific element that indicates the page is fully loaded (adjust to match your page)
        # page.wait_for_selector('.page-info-value', timeout=10000)  # Wait for an element to appear
        # page.wait_for_selector('.page-info-value', timeout=10000)  # Wait for 3rd element in the list to appear

        # Now that the page is fully loaded, get the content of the second element of the class
        element = page.query_selector_all('.page-info-value')[1]  # Select the 2nd element with the class

        # If you need the HTML content of that element, you can extract it like this:
        html_content = element.inner_html() 
        print(html_content)
        teamCodes[team] = html_content

        # Now that the page is fully loaded, get the page content
        content = page.content()

        # Now you can parse the dynamic content
        # print(soup.prettify())
            
        # teamPage = BeautifulSoup(page.content(), 'html.parser')
        
        # try:
        #     region = teamPage.find('span', class_="page-info-value").contents[0].contents[0]
        #     teamCode = teamPage.find_all('span', class_="page-info-key")
        # except:
        #     print(url)
        #     continue
        
        # print(teamCode)
    

    # Close the browser
    browser.close()
    
print(teamCodes)