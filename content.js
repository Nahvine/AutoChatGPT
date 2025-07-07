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

      // Sau khi gửi, thực hiện copy Section X
      setTimeout(() => {
        copySectionAndSendToBackground(sent);
      }, 1000); // Đợi 1s để nội dung xuất hiện

      if (sent < count) {
        setTimeout(() => {
          sendMessage();
        }, 3500);
      }
    }

    sendMessage();
  }

  if (request.action === "collectAllSections") {
    collectAllSections();
    sendResponse({success: true});
    return true;
  }
});

function copySectionAndSendToBackground(sectionNumber) {
  // Tìm Section X
  const sectionSelector = `strong[data-start="0"]`;
  const allSections = Array.from(document.querySelectorAll(sectionSelector));
  let targetSection = null;
  for (const s of allSections) {
    if (s.textContent.trim() === `Section ${sectionNumber}`) {
      targetSection = s;
      break;
    }
  }
  console.log('[AutoChatGPT] Tìm Section', sectionNumber, '=>', !!targetSection);
  if (!targetSection) return;

  // Lấy div cha lớn nhất chứa markdown
  let container = targetSection.closest('.markdown');
  if (!container) container = targetSection.closest('div');
  console.log('[AutoChatGPT] Container:', container);
  if (!container) return;

  // Lọc các phần tử cần copy
  let copyLines = [];
  let skip = false;
  for (const el of container.children) {
    // Bỏ qua đoạn đầu tiên là Section X
    if (el.querySelector && el.querySelector('strong[data-start="0"]')) continue;
    // Bỏ qua blockquote
    if (el.tagName === 'BLOCKQUOTE') continue;
    // Bỏ qua đoạn có "Wind-Down (300 words)"
    if (el.textContent.includes('Wind-Down (300 words)')) continue;
    // Bỏ qua đoạn có [Word count: ...]
    if (/\[Word count:/.test(el.textContent)) continue;
    // Bỏ qua "End of script. Sweet dreams."
    if (el.textContent.includes('End of script. Sweet dreams.')) continue;
    // Bỏ qua các đoạn trống
    if (el.textContent.trim() === '') continue;
    copyLines.push(el.textContent.trim());
  }
  console.log('[AutoChatGPT] Section', sectionNumber, 'copyLines:', copyLines);
  const sectionText = copyLines.join('\n');
  if (sectionText) {
    console.log('[AutoChatGPT] Gửi về background:', {sectionNumber, sectionText});
    // Chia nhỏ nếu quá dài
    const CHUNK_SIZE = 10000;
    if (sectionText.length > CHUNK_SIZE) {
      let part = 0;
      for (let i = 0; i < sectionText.length; i += CHUNK_SIZE) {
        const chunk = sectionText.slice(i, i + CHUNK_SIZE);
        chrome.runtime.sendMessage({
          action: 'saveSectionTextChunk',
          sectionNumber,
          part,
          chunk
        });
        part++;
      }
    } else {
      chrome.runtime.sendMessage({
        action: 'saveSectionText',
        sectionNumber,
        sectionText
      });
    }
  }
}

function collectAllSections() {
  // Tìm tất cả Section X
  const sectionSelector = `strong[data-start="0"]`;
  const allSections = Array.from(document.querySelectorAll(sectionSelector));
  let collected = 0;
  for (const s of allSections) {
    // Lấy số thứ tự Section X
    const match = s.textContent.trim().match(/^Section (\d+)$/);
    if (!match) continue;
    const sectionNumber = parseInt(match[1], 10);
    // Lấy div cha lớn nhất chứa markdown
    let container = s.closest('.markdown');
    if (!container) container = s.closest('div');
    if (!container) continue;
    // Duyệt đệ quy toàn bộ cây con để lấy text
    let copyLines = [];
    function collectTextRecursive(node, buffer) {
      // Bỏ qua blockquote
      if (node.nodeType === 1 && node.tagName === 'BLOCKQUOTE') return '';
if (node.nodeType === 1 && node.matches && node.matches('strong[data-start=\"0\"]')) return '';
      // Nếu là element, duyệt các con
      if (node.nodeType === 1) {
        let isParagraph = ['P', 'LI', 'DIV', 'UL', 'OL', 'BR'].includes(node.tagName);
        let localBuffer = '';
        for (const child of node.childNodes) {
          localBuffer += collectTextRecursive(child, '');
        }
        if (isParagraph && localBuffer.trim() !== '') {
          buffer += localBuffer + '\n';
        } else {
          buffer += localBuffer;
        }
        return buffer;
      } else if (node.nodeType === 3) { // text node
        let text = node.textContent;
        if (!text || !text.trim()) return '';
        text = text.trim();
        // Bỏ qua các dòng không mong muốn
        if (
          text.includes('Wind-Down (Final 300 Words)') ||
          text.includes('Wind-Down (300 words)') ||
          /\[Final word count:.*\]/i.test(text) ||
          /\[Word count:.*\]/i.test(text) ||
          text.includes('End of script. Sweet dreams.')
        ) return '';
        return text + ' ';
      }
      return '';
    }
    let rawText = collectTextRecursive(container, '');
    // Xử lý hậu kỳ: loại bỏ các dòng chỉ chứa dấu câu . , ! ? ; :
    let lines = rawText.split(/\n+/).map(line => line.trim());
    let filtered = [];
    for (let i = 0; i < lines.length; ++i) {
      // Nếu dòng chỉ là dấu câu . , ! ? ; : thì nối vào dòng trước đó
      if (/^[.,!?:;]+$/.test(lines[i]) && filtered.length > 0) {
        filtered[filtered.length - 1] = filtered[filtered.length - 1].replace(/\s+$/, '') + lines[i];
      } else if (lines[i] !== '') {
        filtered.push(lines[i]);
      }
    }
    const sectionText = filtered.join('\n');
    if (sectionText) {
      // Chia nhỏ nếu quá dài
      const CHUNK_SIZE = 10000;
      if (sectionText.length > CHUNK_SIZE) {
        let part = 0;
        for (let i = 0; i < sectionText.length; i += CHUNK_SIZE) {
          const chunk = sectionText.slice(i, i + CHUNK_SIZE);
          chrome.runtime.sendMessage({
            action: 'saveSectionTextChunk',
            sectionNumber,
            part,
            chunk
          });
          part++;
        }
      } else {
        chrome.runtime.sendMessage({
          action: 'saveSectionText',
          sectionNumber,
          sectionText
        });
      }
      collected++;
    }
  }
  console.log('[AutoChatGPT] Đã collect', collected, 'sections');
}
