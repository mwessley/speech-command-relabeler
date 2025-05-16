# generate_split_metadata.py
import os
import json

# Use Google's provided testing split list
with open('speech_commands_v0.02/testing_list.txt') as f:
    test_files = set(line.strip().split('/')[-1] for line in f)

metadata = {}
for root, dirs, files in os.walk('speech_commands_v0.02'):
    for fname in files:
        if fname.endswith('.wav'):
            split = 'test' if fname in test_files else 'train'
            metadata[fname] = split

with open('split_metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)
