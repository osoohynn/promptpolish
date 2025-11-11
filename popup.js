// popup.js - Target AI selection only

let selectedTarget = 'gpt';

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
});

async function loadSettings() {
  const data = await chrome.storage.local.get(['targetAI']);
  selectedTarget = data.targetAI || 'gpt';
  updateTargetButtons();
}

function setupEventListeners() {
  document.querySelectorAll('.target-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      selectedTarget = btn.dataset.target;
      updateTargetButtons();
      await chrome.storage.local.set({ targetAI: selectedTarget });
    });
  });
}

function updateTargetButtons() {
  document.querySelectorAll('.target-btn').forEach(btn => {
    if (btn.dataset.target === selectedTarget) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}
