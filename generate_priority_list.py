import pandas as pd
import json
import os
import sys

def extract_filenames_from_csv(csv_path):
    try:
        df = pd.read_csv(csv_path)

        # Search for the first column with .wav entries
        for col in df.columns:
            if df[col].astype(str).str.contains('.wav', case=False).any():
                print(f"✅ Using column '{col}' from {os.path.basename(csv_path)}")
                return df[col].dropna().apply(lambda x: os.path.basename(str(x).strip())).tolist()

        print(f"⚠️ No .wav path found in {csv_path}")
        return []

    except Exception as e:
        print(f"❌ Error reading {csv_path}: {e}")
        return []


def generate_priority_list(csv_files, output_path="data/priority_audio_list.json"):
    all_filenames = set()
    for csv in csv_files:
        filenames = extract_filenames_from_csv(csv)
        all_filenames.update(filenames)

    sorted_filenames = sorted(all_filenames)
    with open(output_path, 'w') as f:
        json.dump(sorted_filenames, f, indent=2)
    print(f"✅ Saved {len(sorted_filenames)} priority files to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python generate_priority_list.py file1.csv file2.csv ...")
        sys.exit(1)
    generate_priority_list(sys.argv[1:])
