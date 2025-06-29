chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sendPrompt") {
    const { prompt, count } = request;
    let sent = 0;

    function sendMessage() {
      if (sent >= count) return;

      const input = document.querySelector('.ProseMirror');
      if (!input) {
        console.warn("❌ Input field not found! Waiting...");
        setTimeout(sendMessage, 500);
        return;
      }

      input.focus();
      document.execCommand("selectAll", false, null);
      document.execCommand("delete", false, null);
      document.execCommand("insertText", false, prompt);
      input.dispatchEvent(new Event("input", { bubbles: true }));

      waitForSendButtonReadyThenClick();
    }

    function waitForSendButtonReadyThenClick() {
      if (sent >= count) return;

      const sendBtn = document.querySelector('button[data-testid="send-button"]');
      if (!sendBtn || sendBtn.disabled) {
        setTimeout(waitForSendButtonReadyThenClick, 500);
        return;
      }

      sendBtn.click();
      sent++;
      console.log(`✅ Sent ${sent}/${count} times`);

      if (sent < count) {
        setTimeout(() => {
          sendMessage();
        }, 3500);
      }
    }

    sendMessage();
  }
});
