import os
import requests
import io
import zipfile
from github import Github
from dotenv import load_dotenv

load_dotenv()
ACCESS_TOKEN = os.getenv("GITHUB_TOKEN")

LANGUAGE = 'python'
NUM_REPOS = 100
OUTPUT_DIR = "python_code"

if __name__ == "__main__":
    file_count = 0
    if not ACCESS_TOKEN:
        print("Error: Please provide your GitHub personal access token.")
    else:
        if not os.path.exists(OUTPUT_DIR):
            os.makedirs(OUTPUT_DIR)
            
        g = Github(ACCESS_TOKEN)
        
        print(f"Finding the top {NUM_REPOS} most-starred '{LANGUAGE}' repositories...")
        
        repositories = g.search_repositories(
            query=f'language:{LANGUAGE}',
            sort='stars',
            order='desc'
        )
        
        print("\n--- Starting Download ---")

        for i, repo in enumerate(repositories):
            if i >= NUM_REPOS:
                break
            
            print(f"Downloading {repo.full_name}...")
            try:
                archive_url = repo.get_archive_link("zipball")
                
                r = requests.get(archive_url, stream=True)
                r.raise_for_status()
                
                with zipfile.ZipFile(io.BytesIO(r.content)) as z:
                    for filename in z.namelist():
                        if filename.endswith('.py') and '/.' not in filename:
                            file_content = z.read(filename).decode('utf-8', errors='ignore')
                            
                            local_filename = f"{repo.full_name.replace('/', '_')}_{os.path.basename(filename)}"
                            output_path = os.path.join(OUTPUT_DIR, local_filename)
                            
                            with open(output_path, 'w', encoding='utf-8') as f:
                                f.write(file_content)
                            file_count += 1
            
            except Exception as e:
                print(f"  -> Failed to download or process {repo.full_name}: {e}")

    print(f"\n--- Download Finished ---")
    print(f"Saved {file_count} Python files to the '{OUTPUT_DIR}' directory.")