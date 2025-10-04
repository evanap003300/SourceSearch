import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from urllib.robotparser import RobotFileParser
from typing import List, Optional

BASE_URL = "https://github.com/evanap003300/Search_Engine/tree/main/frontend"

def get_html(url: str) -> Optional[str]:
    """Fetches the HTML content of a URL."""
    try:
        response = requests.get(url)
        response.raise_for_status()

        html_content = response.text
        return html_content
    except requests.RequestException as e:
        print(f"Error fetching URL {url}: {e}")
        return None

def get_links_from_html(html: str) -> List[str]:
    """Parses HTML and extracts all hyperlink URLs."""
    soup = BeautifulSoup(html, 'html.parser')
    links = []

    for link_tag in soup.find_all('a', href=True):
        links.append(link_tag['href'])

    return links

def run():
    urls_to_visit = [BASE_URL]
    visited_urls = set()
    crawl_limit = 20
    crawled_data = {}

    rp = RobotFileParser()
    rp.set_url(urljoin(BASE_URL, 'robots.txt'))
    rp.read()

    print("--- Starting Crawler ---")

    while urls_to_visit and len(visited_urls) < crawl_limit:
        current_url = urls_to_visit.pop(0)

        if current_url in visited_urls:
            continue
        
        if not rp.can_fetch('*', current_url):
            print(f"Skipping (disallowed by robots.txt): {current_url}")
            continue
        
        print(f"Crawling: {current_url}")
        visited_urls.add(current_url)
        html_content = get_html(current_url)
        
        if html_content:
            soup = BeautifulSoup(html_content, 'html.parser')
            
            page_title = soup.title.string if soup.title else "No Title Found"
            page_text = soup.get_text(separator=' ', strip=True)
            crawled_data[current_url] = {
                'title': page_title,
                'text': page_text
            }
            
            links = get_links_from_html(html_content)
            for link in links:
                absolute_url = urljoin(current_url, link)
                if absolute_url not in visited_urls:
                    urls_to_visit.append(absolute_url)
    
    print(f"\n--- Crawler Finished ---")
    print(f"Visited {len(visited_urls)} unique pages.")

if __name__ == '__main__':
    run()