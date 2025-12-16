// extension/contentScript.js

// Provide a simple helper to get currently selected text
// --- Helper: Get selected text ---
function getSelectedText() {
  const selection = window.getSelection();
  return selection ? selection.toString().trim() : '';
}

// --- Detect if this page is an article/news-like page ---
function isArticlePage() {
  const url = window.location.href.toLowerCase();

  // Simple keyword heuristics
  const keywords = ["news", "article", "story", "post", "blog", "press"];
  if (keywords.some((k) => url.includes(k))) return true;

  // If body text is long enough
  const text = document.body.innerText || "";
  return text.length > 1000;
}

// --- Extract main readable text ---
function extractMainText() {
  let text = "";

  // Try the largest <p> or <article> text blocks
  const article = document.querySelector("article");
  if (article) text = article.innerText;

  if (!text || text.length < 500) {
    const paragraphs = [...document.querySelectorAll("p")];
    text = paragraphs
      .map((p) => p.innerText.trim())
      .filter((p) => p.length > 50)
      .join("\n\n");
  }

  return text.slice(0, 5000); // safe limit
}

// --- Auto-scan once per page ---
let alreadyScanned = false;

function autoScanPage() {
  if (alreadyScanned) return;
  alreadyScanned = true;

  if (!isArticlePage()) return;

  const snippet = extractMainText();
  if (!snippet || snippet.length < 200) return; // too short

  chrome.runtime.sendMessage(
    {
      type: "AUTO_SCAN_REQUEST",
      url: window.location.href,
      contentSnippet: snippet,
      source: "autoscan",
    },
    (resp) => {
      console.log("Auto-scan response:", resp);
    }
  );
}

// Trigger auto-scan after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(autoScanPage, 1500);
});

// --- Existing code: send page info to popup ---
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === "GET_PAGE_INFO") {
    const pageInfo = {
      url: window.location.href,
      title: document.title,
      selection: getSelectedText(),
    };
    sendResponse({ success: true, pageInfo });
  }
  return false;
});

// --- Existing code: receive token from dashboard ---
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  const data = event.data || {};
  if (data.source === "fraudeye-webapp" && data.type === "FRAUDEYE_TOKEN") {
    chrome.runtime.sendMessage(
      { type: "SAVE_TOKEN_FROM_PAGE", token: data.token },
      () => {}
    );
  }
});
