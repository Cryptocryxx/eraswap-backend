import requests
import json
import urllib.parse

# Dein TMDb API Schlüssel
API_KEY = 'cd150a8d07e7ab834f30ac004870b6a6'

# TMDb Basis-URL
BASE_URL = "https://api.themoviedb.org/3"

# Liste der 50 Weihnachtsfilme
movie_names = [
    "Home Alone", "Harry Potter and the Philosopher's Stone", "Harry Potter and the Chamber of Secrets", 
    "Harry Potter and the Prisoner of Azkaban", "Harry Potter and the Goblet of Fire", 
    "Harry Potter and the Order of the Phoenix", "Harry Potter and the Half-Blood Prince", 
    "Harry Potter and the Deathly Hallows – Part 1", "Harry Potter and the Deathly Hallows – Part 2",
    "Elf", "The Polar Express", "Dashing Through the Snow", "Best. Christmas. Ever!",
    "The Naughty Nine", "A Christmas Carol", "It's a Wonderful Life", "A Christmas Story Christmas",
    "A Merry Scottish Christmas", "Mystic Christmas", "What Happens Later", "It's A Wonderful Knife",
    "A Charlie Brown Christmas", "The Grinch", "Jingle Jangle: A Christmas Journey", "The Christmas Chronicles",
    "Family Switch", "A Boy Called Christmas", "The Princess Switch", "The Santa Clause", "Love Actually",
    "The Holiday", "The Nightmare Before Christmas", "National Lampoon's Christmas Vacation",
    "The Christmas Chronicles 2", "Scrooged", "Gremlins", "Die Hard", "Krampus", "Arthur Christmas", 
    "The Muppet Christmas Carol", "Frosty the Snowman", "Rudolph the Red-Nosed Reindeer", "The Polar Express",
    "The Bishop's Wife", "The Best Man Holiday", "Holiday Affair", "The Family Stone", "Deck the Halls",
    "A Very Harold & Kumar Christmas", "The Grinch", "Bad Santa", 
    "Four Christmases", "The Holiday Calendar", "Last Christmas", "The Christmas Box", "Silent Night",
    "Love the Coopers", "Christmas with the Kranks", "The Star", "The Man Who Invented Christmas", 
    "Christmas Inheritance", "Christmas Chronicles", "My Dad's Christmas Date", "How the Grinch Stole Christmas"
]

def get_movie_details(movie_name):
    """Gibt die Film-ID, das Poster-URL und Trailer-URL für einen Filmnamen zurück."""
    # URL-kodierter Filmname
    encoded_movie_name = urllib.parse.quote(movie_name)
    
    search_url = f"{BASE_URL}/search/movie?api_key={API_KEY}&query={encoded_movie_name}"
    response = requests.get(search_url)
    data = response.json()

    if data['results']:
        # Holen des ersten Films aus den Ergebnissen
        movie = data['results'][0]
        movie_id = movie['id']
        poster_path = movie.get('poster_path')
        
        # Trailer-Abfrage
        trailer_url = get_trailer(movie_id)
        
        if poster_path:
            poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}"
            return movie_id, poster_url, trailer_url
        else:
            print(f"Kein Poster für den Film '{movie_name}' gefunden.")
            return movie_id, None, trailer_url
    else:
        print(f"Kein Film mit dem Namen '{movie_name}' gefunden.")
        return None, None, None

def get_trailer(movie_id):
    """Holt die Trailer-URL für einen Film basierend auf seiner ID."""
    video_url = f"{BASE_URL}/movie/{movie_id}/videos?api_key={API_KEY}"
    response = requests.get(video_url)
    data = response.json()

    if data['results']:
        # Trailer Video-Link finden
        for video in data['results']:
            if video['type'] == 'Trailer':
                youtube_url = f"https://www.youtube.com/watch?v={video['key']}"
                return youtube_url
    return None

def save_to_json(movie_name, poster_url, trailer_url):
    """Speichert den Filmnamen, das Poster-URL und das Trailer-URL in einer JSON-Datei."""
    data = {}
    try:
        # Falls die Datei schon existiert, lade die bestehenden Daten
        with open('movie_details2.json', 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        pass
    
    # Füge den neuen Eintrag hinzu
    data[movie_name] = {
        "poster": poster_url,
        "trailer": trailer_url
    }

    # Speichern der Daten in der JSON-Datei
    with open('movie_details2.json', 'w') as f:
        json.dump(data, f, indent=4)
    print(f"Details für '{movie_name}' gespeichert!")

def main():
    for movie_name in movie_names:
        movie_id, poster_url, trailer_url = get_movie_details(movie_name)
        
        if movie_id:
            if poster_url or trailer_url:
                save_to_json(movie_name, poster_url, trailer_url)
            else:
                print(f"Kein Poster oder Trailer für den Film '{movie_name}' gefunden.")
        else:
            print(f"Film-ID konnte nicht ermittelt werden.")

if __name__ == '__main__':
    main()
