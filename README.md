# Auto ChatGPT Extension

A Chrome extension to automatically send prompts and collect responses from ChatGPT, with advanced features for bulk copying and filtering of content.

## Features

- **Auto Send Prompt**: Send a custom prompt to ChatGPT multiple times automatically.
- **Collect Text**: Collect all visible Section X responses from the current ChatGPT page with a single click.
- **Smart Filtering**: Automatically removes unwanted lines such as "Wind-Down (300 words)", "[Word count: ...]", "End of script. Sweet dreams.", and more.
- **Handles Large Data**: Supports collecting and copying very large responses (100,000+ characters) by chunking and reassembling data.
- **Preserves Structure**: Recursively collects text from all elements, including lists (`ul`, `li`), paragraphs, and more, while keeping punctuation and formatting correct.
- **Character Count**: Displays the total number of characters collected for easy verification.
- **User Guidance**: Reminds users to scroll all sections into view before collecting to ensure complete data capture.
- **Copy All**: One-click to copy all collected text to clipboard.
- **Clear**: Quickly clear all collected data.

## Installation

1. Download or clone this repository.
2. Go to `chrome://extensions/` in your Chrome browser.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the project folder.
5. The extension icon will appear in your Chrome toolbar.

## Usage

1. **Open ChatGPT** in your browser and generate your desired content (e.g., multiple "Section X" responses).
2. **Scroll through all sections** you want to collect, making sure they are visible on the page (ChatGPT may not render all content if you haven't scrolled).
3. Click the extension icon to open the popup.
4. Use the **Send** button to auto-send prompts (optional).
5. Click **Collect Text** to gather all visible Section X responses.
6. Review the collected text in the "Collected Sections" area.
7. See the **character count** below the text area.
8. Click **Copy All** to copy everything to your clipboard.
9. Use **Clear** to remove all collected data.

## Filtering & Extraction Logic

- Only collects content from sections labeled as `Section X` (where X is a number).
- Filters out lines containing:
  - `Wind-Down (Final 300 Words)` or `Wind-Down (300 words)`
  - `[Word count: ...]` or `[Final word count: ...]` (any number)
  - `End of script. Sweet dreams.`
  - Any blockquote elements
  - The initial `Section X` label itself
- Recursively extracts text from all child elements, including lists and paragraphs.
- Ensures punctuation (.,!?:;) is not separated onto its own line.

## Permissions

- `scripting`, `activeTab`, `storage`, and `<all_urls>` are required for script injection, tab access, and data storage.

## Troubleshooting

- **Missing or incomplete data?**
  - Make sure you have scrolled through all the content you want to collect so it is visible in the DOM.
  - Wait for ChatGPT to finish rendering before clicking Collect Text.
- **Character count lower than expected?**
  - Some content may not be loaded if you haven't scrolled. Try scrolling to the bottom and collecting again.
- **Copy All not working?**
  - Make sure you have granted clipboard permissions to Chrome.

## Development Notes

- The extension uses chunked messaging and background storage to handle very large responses.
- Filtering and text extraction logic is implemented in the content script for maximum accuracy.
- The UI is designed for clarity and ease of use, with clear feedback and instructions.

## License

MIT
