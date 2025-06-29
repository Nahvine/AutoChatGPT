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
