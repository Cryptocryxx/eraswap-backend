import json
import re

# Pfad zur Eingabedatei
input_file = "germanDictionary.json"
# Pfad zur Ausgabedatei
output_file = "cleanedDictionary2.json"

def clean_word(word):
    # Entferne hochgestellte "2" und dann "1"
    word = re.sub(r'₂', '', word)  # Entferne hochgestellte "2"
    word = re.sub(r'¹', '', word)  # Entferne hochgestellte "1"
    return word

try:
    # Datei laden
    with open(input_file, "r", encoding="utf-8") as file:
        data = json.load(file)

    # Bereinige die Wörter und extrahiere nur die Wörter ohne Bindestrich
    cleaned_data = [clean_word(word) for word in data.keys() if "-" not in word]

    # Bereinigte Daten in eine neue Datei schreiben
    with open(output_file, "w", encoding="utf-8") as file:
        json.dump(cleaned_data, file, ensure_ascii=False, indent=4)

    print(f"Bereinigte Daten wurden erfolgreich in '{output_file}' gespeichert.")

except FileNotFoundError:
    print(f"Die Datei '{input_file}' wurde nicht gefunden.")
except json.JSONDecodeError:
    print(f"Die Datei '{input_file}' enthält ungültiges JSON.")
