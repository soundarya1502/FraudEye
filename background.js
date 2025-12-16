// extension/background.js
chrome.runtime.onInstalled.addListener(() => {
  console.log('FraudEye extension installed');
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === "SAVE_TOKEN_FROM_PAGE" && message.token) {
    chrome.storage.local.set({ fraudeye_token: message.token }, () => {
      console.log("FraudEye token saved to chrome.storage:", message.token);
      sendResponse({ ok: true });
    });

    // Tell Chrome we will respond asynchronously
    return true;
  }
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Auto scan handler
  if (message.type === "AUTO_SCAN_REQUEST") {
    chrome.storage.local.get(["fraudeye_token"], async (store) => {
      const token = store.fraudeye_token;

      const body = {
        url: message.url,
        contentSnippet: message.contentSnippet,
        source: message.source,
      };

      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      try {
        const res = await fetch("http://localhost:5000/api/scans", {
          method: "POST",
          headers,
          body: JSON.stringify(body),
        });

        const data = await res.json();
        sendResponse({ ok: true, data });
      } catch (err) {
        console.error("Auto-scan failed:", err);
        sendResponse({ ok: false, error: err.message });
      }
    });

    return true; // async response
  }
});
