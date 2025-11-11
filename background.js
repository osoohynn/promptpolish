// background.js - Service worker for PromptPolish

chrome.commands.onCommand.addListener((command) => {
  if (command === 'polish-prompt') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'POLISH_SHORTCUT' });
      }
    });
  }
});

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  // Extension installed
});
