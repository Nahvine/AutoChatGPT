chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "injectAndSend") {
    chrome.scripting.executeScript(
      {
        target: { tabId: request.tabId },
        files: ["content.js"]
      },
      () => {
        chrome.tabs.sendMessage(request.tabId, {
          action: "sendPrompt",
          prompt: request.prompt,
          count: request.count
        });
      }
    );
  }
});
