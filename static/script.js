const labels = [
  "yes", "no", "up", "down", "left", "right", "on", "off", "stop", "go",
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "bed", "bird", "cat", "dog", "happy", "house", "marvin", "sheila", "tree", "wow",
  "backward", "forward", "follow", "learn", "visual", "unknown"
];

let audioList = [];
let currentIndex = 0;
let labeledFiles = new Set();

async function fetchAudioList() {
  const res = await fetch('/api/audio-list');
  audioList = await res.json();

  // Load existing labeled files
  const labelRes = await fetch('/labels.json'); // served as static fallback
  const labelData = await labelRes.json();
  labeledFiles = new Set(Object.keys(labelData));

  createButtons();
  loadAudio();
}

function createButtons() {
  const container = document.getElementById('labelButtons');
  container.innerHTML = '';
  labels.forEach(label => {
    const btn = document.createElement('button');
    btn.innerText = label;
    btn.onclick = () => submitLabel(label);
    container.appendChild(btn);
  });

  // Add skip button
  const skipBtn = document.createElement('button');
  skipBtn.innerText = "Skip";
  skipBtn.style.marginLeft = '10px';
  skipBtn.onclick = () => {
    console.log("Skipping:", audioList[currentIndex]);
    currentIndex++;
    loadAudio();
  };
  container.appendChild(skipBtn);
}

function loadAudio() {
  if (currentIndex >= audioList.length) {
    alert("Finished all files.");
    return;
  }

  // Auto-skip if already labeled
  while (currentIndex < audioList.length && labeledFiles.has(audioList[currentIndex])) {
    console.log("Auto-skipping labeled file:", audioList[currentIndex]);
    currentIndex++;
  }

  if (currentIndex >= audioList.length) {
    alert("All files are labeled or skipped.");
    return;
  }

  const filename = audioList[currentIndex];
  const audio = document.getElementById('audio');
  audio.src = `/api/audio/${filename}`;
  audio.play();

  fetch(`/api/original-label/${filename}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('originalLabel').innerText =
        `Original label: ${data.original_label}`;
    });
}

async function submitLabel(label) {
  const filename = audioList[currentIndex];
  console.log("Submitting:", filename, label);

  await fetch('/api/save-label', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, label })
  });

  labeledFiles.add(filename);
  currentIndex++;
  loadAudio();
  updateStats();
}

async function updateStats() {
  const res = await fetch('/api/stats');
  const stats = await res.json();

  let out = `Total labeled: ${stats.total}
Corrected: ${stats.corrected}
Train corrected: ${stats.train_corrected} / ${stats.train_total}
Test corrected: ${stats.test_corrected} / ${stats.test_total}\n\n`;

  if (stats.per_label) {
    out += `Per-label corrections:\n`;
    for (const [label, data] of Object.entries(stats.per_label)) {
      out += `${label}: ${data.corrected}/${data.total}\n`;
    }
  }

  document.getElementById('stats').innerText = out;
}

function downloadCSV() {
  window.location.href = '/api/export';
}

function acceptOriginalLabel() {
  const filename = audioList[currentIndex];
  fetch(`/api/original-label/${filename}`)
    .then(res => res.json())
    .then(data => {
      const label = data.original_label;
      submitLabel(label);
    });
}

fetchAudioList();
updateStats();
