import urllib.request

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

def download(url, path):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response, open(path, 'wb') as f:
            f.write(response.read())
        print(f"Success: {path}")
    except Exception as e:
        print(f"Failed {url}: {e}")

download('https://upload.wikimedia.org/wikipedia/commons/e/ec/ASTRON_logo.svg', 'c:/Users/gefer/Downloads/BINGO-Telescope-site/public/images/abdus/astron-logo.svg')
download('https://upload.wikimedia.org/wikipedia/commons/e/e0/Logo_Observatoire_radioastronomique_de_Nancay.svg', 'c:/Users/gefer/Downloads/BINGO-Telescope-site/public/images/abdus/nancay-logo.svg')
