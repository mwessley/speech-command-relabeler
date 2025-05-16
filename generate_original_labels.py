# generate_original_labels.py
import os
import json

base_dir = 'speech_commands_v0.02'
original_labels = {}

for label in os.listdir(base_dir):
    full_path = os.path.join(base_dir, label)
    if os.path.isdir(full_path):
        for fname in os.listdir(full_path):
            if fname.endswith('.wav'):
                original_labels[fname] = label

with open('original_labels.json', 'w') as f:
    json.dump(original_labels, f, indent=2)
