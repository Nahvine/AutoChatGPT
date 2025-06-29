# 🧠 Auto Chat Sender – Chrome Extension

Auto Chat Sender is a lightweight Chrome extension that lets you automatically send a text prompt to a web-based input field (like ChatGPT or other AI interfaces) multiple times, with a small delay between each send.

---

## 🚀 Features

- Auto-inserts and sends any custom prompt
- Adjustable number of times to send
- Automatically waits for the input box and send button to be ready
- Lightweight and works on any site with a `.ProseMirror` input element (e.g., ChatGPT)

---

## 🛠 Installation

1. Download or clone this repository to your local machine.
2. Open Google Chrome and go to `chrome://extensions/`.
3. Enable **Developer mode** (top right corner).
4. Click **"Load unpacked"** and select the folder containing the extension files.
5. The extension icon should now appear in your toolbar.

---

## 📦 File Structure

'''
AutoChatSender/
├── background.js # Background script to send prompts
├── popup.js # Handles popup UI actions
├── popup.html # UI for the extension popup
├── manifest.json # Chrome extension config
├── README.md # You're reading this!
└── images/ # Icons used in extension
├── icon16.png
├── icon48.png
└── icon128.png
'''

---

## 💡 How to Use

1. Click on the **Auto ChatGPT** extension icon in your Chrome toolbar.
2. Enter your desired **prompt** in the textbox.
3. Enter the **number of times** you want the message to be sent.
4. Click **Send**.
5. The extension will:
   - Automatically find the input box (`.ProseMirror`)
   - Fill in your prompt
   - Wait for the send button to become active
   - Click it and repeat the process until done

---

## 🎯 Targeted Use Case

This extension was originally designed for automating ChatGPT inputs, but it can be adapted to any site using a `.ProseMirror` contenteditable element.

---

## ⚠️ Notes & Limitations

- This tool uses DOM-based automation. If the website structure changes (e.g., class names), it may need adjustment.
- Meant for development, testing, and personal productivity – not for spamming or abuse.
- Avoid using on websites where automation violates terms of service.

---

## 📥 Customization Tips

- Want to adapt it for a different site? Just update the `document.querySelector` in `background.js` to match your input field.
- Want to support dark mode or animations in UI? You can tweak the CSS inside `popup.html`.

---

## 🧑‍💻 Author

Made with ❤️ by a GenZ developer who loves automation, creativity, and clean UI.

---

## 📜 License

MIT License – free to use, modify, and share.
