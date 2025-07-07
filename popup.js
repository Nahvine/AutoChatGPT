document.getElementById("sendBtn").addEventListener("click", () => {
  const prompt = document.getElementById("prompt").value;
  const count = parseInt(document.getElementById("count").value);

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    chrome.runtime.sendMessage({
      action: "injectAndSend",
      tabId: tab.id,
      prompt,
      count
    });
  });
});

// Hiển thị các section đã thu thập
function updateCollectedSections() {
  chrome.runtime.sendMessage({action: "getAllSections"}, (res) => {
    if (!res || !res.sections) return;
    console.log('[AutoChatGPT][popup] Nhận sections:', res.sections);
    const text = res.sections.map(s => s.sectionText).join("\n\n---\n\n");
    document.getElementById("collectedSections").value = text;
    document.getElementById("charCount").textContent = `Collected: ${text.length.toLocaleString()} characters`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateCollectedSections();
  document.getElementById("copyAllBtn").addEventListener("click", () => {
    const text = document.getElementById("collectedSections").value;
    if (text) {
      console.log('[AutoChatGPT][popup] Copy All:', text);
      navigator.clipboard.writeText(text);
    }
  });
  document.getElementById("clearBtn").addEventListener("click", () => {
    chrome.runtime.sendMessage({action: "clearSections"}, () => {
      console.log('[AutoChatGPT][popup] Đã clear sections');
      updateCollectedSections();
    });
  });
  document.getElementById("collectBtn").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      // Đầu tiên inject content.js
      chrome.runtime.sendMessage({
        action: "injectAndSend",
        tabId: tab.id,
        prompt: "",
        count: 0
      }, () => {
        // Đợi 300ms rồi mới gửi message collectAllSections
        setTimeout(() => {
          chrome.tabs.sendMessage(tab.id, { action: "collectAllSections" }, (res) => {
            console.log('[AutoChatGPT][popup] Đã collect all sections:', res);
            setTimeout(updateCollectedSections, 500);
          });
        }, 300);
      });
    });
  });
});
