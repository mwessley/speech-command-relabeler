from flask import Flask, request, jsonify, send_from_directory
import os, json, csv

app = Flask(__name__, static_folder='static', static_url_path='/static')
AUDIO_FOLDER = 'audio'
LABELS_FILE = 'labels.json'
RELABELED_CSV = 'relabels.csv'
ORIGINAL_LABELS_FILE = 'original_labels.json'
SPLIT_METADATA_FILE = 'split_metadata.json'

def load_json(filepath):
    try:
        with open(filepath, 'r') as f:
            return json.load(f)
    except:
        return {}

original_labels = load_json(ORIGINAL_LABELS_FILE)
split_metadata = load_json(SPLIT_METADATA_FILE)

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/api/audio-list')
def get_audio_list():
    files = [f for f in os.listdir(AUDIO_FOLDER) if f.endswith('.wav')]
    print(f"Found {len(files)} audio files")
    return jsonify(files)

@app.route('/api/audio/<filename>')
def serve_audio(filename):
    print(f"Serving audio file: {filename}")
    return send_from_directory(AUDIO_FOLDER, filename)

@app.route('/api/original-label/<filename>')
def get_original_label(filename):
    label = original_labels.get(filename, "unknown")
    print(f"Original label for {filename}: {label}")
    return jsonify({"original_label": label})

@app.route('/api/save-label', methods=['POST'])
def save_label():
    data = request.json
    filename = data.get('filename')
    new_label = data.get('label')
    if not filename or not new_label:
        return 'Invalid', 400

    labels = load_json(LABELS_FILE)
    labels[filename] = new_label
    with open(LABELS_FILE, 'w') as f:
        json.dump(labels, f, indent=2)

    orig = original_labels.get(filename, 'unknown')
    split = split_metadata.get(filename, 'unknown')
    corrected = orig != new_label

    write_header = not os.path.exists(RELABELED_CSV)
    with open(RELABELED_CSV, 'a', newline='') as csvfile:
        writer = csv.writer(csvfile)
        if write_header:
            writer.writerow(['filename', 'original_label', 'new_label', 'split', 'corrected'])
        writer.writerow([filename, orig, new_label, split, corrected])

    print(f"Labeled: {filename} as {new_label} (original: {orig}, corrected: {corrected})")
    return 'OK'

@app.route('/api/stats')
def stats():
    try:
        with open(RELABELED_CSV, 'r') as f:
            reader = csv.DictReader(f)
            stats = {
                'total': 0,
                'corrected': 0,
                'train_corrected': 0,
                'test_corrected': 0,
                'train_total': 0,
                'test_total': 0,
                'per_label': {}
            }
            for row in reader:
                stats['total'] += 1
                if row['split'] == 'train':
                    stats['train_total'] += 1
                elif row['split'] == 'test':
                    stats['test_total'] += 1

                if row['corrected'] == 'True':
                    stats['corrected'] += 1
                    if row['split'] == 'train':
                        stats['train_corrected'] += 1
                    elif row['split'] == 'test':
                        stats['test_corrected'] += 1

                label = row['original_label']
                stats['per_label'].setdefault(label, {'corrected': 0, 'total': 0})
                stats['per_label'][label]['total'] += 1
                if row['corrected'] == 'True':
                    stats['per_label'][label]['corrected'] += 1
            return jsonify(stats)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/labels.json')
def serve_labels_json():
    return send_from_directory('.', 'labels.json')

@app.route('/api/export')
def export_csv():
    try:
        return send_from_directory('.', RELABELED_CSV, as_attachment=True)
    except:
        return "No CSV found", 404

if __name__ == '__main__':
    print("Running Flask server at http://localhost:8080")
    app.run(debug=True, port=8080)
