const labels = [
  "yes", "no", "up", "down", "left", "right", "on", "off", "stop", "go",
  "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
  "bed", "bird", "cat", "dog", "happy", "house", "marvin", "sheila", "tree", "wow",
  "backward", "forward", "follow", "learn", "visual", "unknown"
];
const metadataTags = [
  "cut", "humming", "noisy", "noisy (other words)", "silent",
  "distorted mic", "audible but very (silent)", "nothing"
];

let waveSurfer = null;
let audioList = [];
let currentIndex = 0;
let labeledFiles = new Set();
let previousIndices = [];

async function fetchAudioList() {
  const res = await fetch('/api/audio-list');
  audioList = await res.json();

  // Load existing labeled files
  const labelRes = await fetch('/data/labels.json'); // served as static fallback
  const labelData = await labelRes.json();
  labeledFiles = new Set(Object.keys(labelData));

  createButtons();
  // audioList = audioList.sort(() => Math.random() - 0.5); // shuffle
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

  while (currentIndex < audioList.length && labeledFiles.has(audioList[currentIndex])) {
    console.log("Auto-skipping labeled file:", audioList[currentIndex]);
    currentIndex++;
  }

  if (currentIndex >= audioList.length) {
    alert("All files are labeled or skipped.");
    return;
  }

  const filename = audioList[currentIndex];
  const audioUrl = `/api/audio/${filename}`;

  const audio = document.getElementById('audio');
  audio.src = audioUrl;
  audio.play();

  fetch(`/api/original-label/${filename}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('originalLabel').innerText = data.original_label;
    });

  // Initialize WaveSurfer once
  if (!waveSurfer) {
    waveSurfer = WaveSurfer.create({
      container: '#waveform',
      waveColor: '#dcdcdc',
      progressColor: '#222',
      height: 80
    });
  }

  // Load and play
  waveSurfer.load(audioUrl);
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

  const tbody = document.querySelector('#statsTable tbody');
  tbody.innerHTML = '';

  if (stats.per_label) {
    Object.entries(stats.per_label).forEach(([label, data]) => {
      const accuracy = data.total > 0
        ? ((data.total - data.corrected) / data.total * 100).toFixed(1)
        : '—';

      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${label}</td>
        <td>${data.total}</td>
        <td>${data.corrected}</td>
        <td>${accuracy}</td>
      `;
      tbody.appendChild(row);
    });
  }
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

function createMetadataButtons() {
  const container = document.getElementById('commentButtons');
  if (!container) {
    console.error("commentButtons div not found!");
    return;
  }

  container.innerHTML = '<b>Tags:</b><br>';
  metadataTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.innerText = tag;
    btn.onclick = () => toggleTag(btn, tag);
    btn.dataset.active = "false";
    container.appendChild(btn);
  });
}

function toggleTag(button, tag) {
  if (button.dataset.active === "false") {
    button.style.backgroundColor = "#ccc";
    button.dataset.active = "true";
  } else {
    button.style.backgroundColor = "";
    button.dataset.active = "false";
  }
}

function markAsUnknown() {
  submitLabel("unknown");
}

function getActiveTags() {
  return Array.from(document.querySelectorAll('#commentButtons button'))
    .filter(btn => btn.dataset.active === "true")
    .map(btn => btn.innerText);
}

async function submitLabel(label) {
  const filename = audioList[currentIndex];
  const comment = document.getElementById('commentField').value;
  const tags = getActiveTags();

  await fetch('/api/save-label', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, label, comment, tags })
  });

  labeledFiles.add(filename);
  previousIndices.push(currentIndex);
  currentIndex++;
  document.getElementById('commentField').value = '';
  createMetadataButtons(); // reset tags
  loadAudio();
  updateStats();
}

function goBack() {
  if (previousIndices.length > 0) {
    currentIndex = previousIndices.pop();
    loadAudio();
  } else {
    alert("No previous audio to go back to.");
  }
}

window.onload = () => {
  fetchAudioList();
  createMetadataButtons();
  updateStats();
};

