from flask import Flask, request, jsonify, render_template
import os
import json

server = Flask(__name__, static_folder="static", template_folder="templates")

DATA_FILE = "notes.json"

# Ensure the notes file exists
if not os.path.exists(DATA_FILE):
    with open(DATA_FILE, 'w') as f:
        json.dump({}, f)

@server.route('/')
def index():
    return render_template('index.html')

@server.route('/api/notes', methods=['GET'])
def get_notes():
    with open(DATA_FILE, 'r') as f:
        notes = json.load(f)
    return jsonify(notes)

@server.route('/api/notes', methods=['POST'])
def save_note():
    data = request.json
    date = data.get('date')
    note = data.get('note')

    if not date or not note:
        return jsonify({"success": False, "error": "Date or note missing"}), 400

    with open(DATA_FILE, 'r') as f:
        notes = json.load(f)
    notes[date] = note
    with open(DATA_FILE, 'w') as f:
        json.dump(notes, f, indent=4)

    return jsonify({"success": True}), 200

@server.route('/api/notes', methods=['DELETE'])
def delete_note():
    data = request.json
    date = data.get('date')

    if not date:
        return jsonify({"success": False, "error": "Date not provided"}), 400

    with open(DATA_FILE, 'r') as f:
        notes = json.load(f)

    if date in notes:
        del notes[date]
        with open(DATA_FILE, 'w') as f:
            json.dump(notes, f, indent=4)
        print(f"Deleted note for date: {date}")  # Debugging statement
        return jsonify({"success": True}), 200
    else:
        print(f"Note not found for date: {date}")  # Debugging statement
        return jsonify({"success": False, "error": "Note not found"}), 404

if __name__ == '__main__':
    server.run(debug=True)