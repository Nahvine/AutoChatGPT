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
  if (request.action === "saveSectionText") {
    chrome.storage.local.get({sections: []}, (data) => {
      const sections = data.sections || [];
      const exists = sections.find(s => s.sectionNumber === request.sectionNumber);
      if (!exists) {
        sections.push({
          sectionNumber: request.sectionNumber,
          sectionText: request.sectionText
        });
        sections.sort((a, b) => a.sectionNumber - b.sectionNumber);
        chrome.storage.local.set({sections});
      }
    });
    return;
  }
  if (request.action === "saveSectionTextChunk") {
    chrome.storage.local.get({sectionChunks: {}}, (data) => {
      const sectionChunks = data.sectionChunks || {};
      const key = String(request.sectionNumber);
      if (!sectionChunks[key]) sectionChunks[key] = [];
      sectionChunks[key][request.part] = request.chunk;
      chrome.storage.local.set({sectionChunks});
    });
    return;
  }
  if (request.action === "getAllSections") {
    chrome.storage.local.get({sections: [], sectionChunks: {}}, (data) => {
      let sections = data.sections || [];
      const sectionChunks = data.sectionChunks || {};
      for (const key in sectionChunks) {
        if (!sectionChunks.hasOwnProperty(key)) continue;
        const chunks = sectionChunks[key];
        if (Array.isArray(chunks) && chunks.length > 0) {
          const sectionNumber = parseInt(key, 10);
          const sectionText = chunks.join("");
          if (!sections.find(s => s.sectionNumber === sectionNumber)) {
            sections.push({ sectionNumber, sectionText });
          }
        }
      }
      sections.sort((a, b) => a.sectionNumber - b.sectionNumber);
      sendResponse({sections});
    });
    return true;
  }
  if (request.action === "clearSections") {
    chrome.storage.local.set({sections: [], sectionChunks: {}}, () => {
      sendResponse({success: true});
    });
    return true;
  }
});
