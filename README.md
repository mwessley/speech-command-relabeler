Here's a complete and clear `README.md` for your speech commands relabeling app:

---

## 📢 Speech Commands Relabeling Web App

This is a simple web-based tool to **relabel the [Google Speech Commands dataset](https://www.tensorflow.org/datasets/catalog/speech_commands)**. It helps identify mislabeled audio clips and automatically tracks labeling statistics and corrections for both training and test sets.

---

### 🚀 Features

* ✅ Web interface to listen and relabel audio clips
* ✅ Multiple choice relabeling
* ✅ Shows original label for comparison
* ✅ Automatically logs to `relabels.csv`
* ✅ Tracks:

  * Total relabels
  * Correction rate
  * Train/test split stats
  * Per-label correction accuracy
* ✅ Download relabels as CSV
* ✅ Simple Flask + HTML/JS stack (no dependencies beyond Flask)

---

### 🧰 Prerequisites

* Python 3
* pip

---

### 📦 Setup Instructions

1. **Clone this repo** (or copy files into a folder):

   ```bash
   git clone <your-repo-url>
   cd relabel_app
   ```

2. **Download and extract the dataset**:

   ```bash
   wget http://download.tensorflow.org/data/speech_commands_v0.02.tar.gz
   tar -xzf speech_commands_v0.02.tar.gz
   ```

3. **Copy `.wav` files to `/audio/` folder**:

   ```bash
   mkdir audio
   find speech_commands_v0.02 -type f -name "*.wav" -exec cp {} audio/ \;
   ```

4. **Generate metadata files**:

   ```bash
   python generate_split_metadata.py
   python generate_original_labels.py
   ```

5. **Install Flask and run the app**:

   ```bash
   pip install flask
   python app.py
   ```

6. **Open the app** in your browser:

   ```
   http://localhost:5000
   ```

---

### 📁 File Structure

```
relabel_app/
├── app.py                   # Flask backend
├── audio/                   # All WAV files
├── labels.json              # In-progress relabels (JSON)
├── relabels.csv             # All relabels + metadata
├── original_labels.json     # Original labels from dataset
├── split_metadata.json      # Maps each file to train/test
├── generate_original_labels.py
├── generate_split_metadata.py
└── static/
    ├── index.html           # Web UI
    ├── script.js            # UI logic
    └── styles.css           # Optional styling
```

---

### 📊 Example Statistics Output

```
Total labeled: 128
Corrected: 32
Train corrected: 22 / 100
Test corrected: 10 / 28

Per-label corrections:
yes: 5/20 corrected
no: 2/18 corrected
up: 3/14 corrected
...
```

---

### 📤 Export Relabels

Click the **Download CSV** button in the app, or access directly:

```
http://localhost:5000/api/export
```

---

### 🛠️ Customization Ideas

* Add user login
* Visual charts with D3.js or Chart.js
* Track per-user relabeling accuracy
* Filter by label or confidence
* Integrate audio spectrograms

---

### 📄 License

MIT — do anything you want, just don't remove attribution.

---

Let me know if you want this in a `ZIP` or deployed online!
