// extension/popup.js
const pageUrlEl = document.getElementById("pageUrl");
const snippetEl = document.getElementById("snippet");
const analyzeBtn = document.getElementById("analyzeBtn");
const resultCard = document.getElementById("resultCard");
const resultBadge = document.getElementById("resultBadge");
const credScore = document.getElementById("credScore");
const scoreBar = document.getElementById("scoreBar");
const explanationBox = document.getElementById("explanation");
const errorBox = document.getElementById("errorBox");
const autoScanTag = document.getElementById("autoScanTag");

const openDashboard = document.getElementById("openDashboard");
const saveToken = document.getElementById("saveToken");

function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove("hidden");
}

function hideError() {
  errorBox.classList.add("hidden");
}

function applyBadge(label) {
  if (label === "fake") resultBadge.style.background = "var(--fake)";
  else if (label === "real") resultBadge.style.background = "var(--real)";
  else resultBadge.style.background = "var(--uncertain)";

  resultBadge.textContent = label;
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function fetchPageInfo() {
  const tab = await getActiveTab();
  if (!tab) return;

  chrome.tabs.sendMessage(
    tab.id,
    { type: "GET_PAGE_INFO" },
    (response) => {
      if (response?.pageInfo) {
        const info = response.pageInfo;
        pageUrlEl.textContent = info.url;
        if (info.selection) snippetEl.value = info.selection;
      }
    }
  );
}

async function getToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["fraudeye_token"], (data) => {
      resolve(data.fraudeye_token || null);
    });
  });
}

async function analyze() {
  hideError();
  resultCard.classList.add("hidden");

  const snippet = snippetEl.value.trim();
  if (!snippet) return showError("Please paste or select text.");

  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing...";

  try {
    const token = await getToken();

    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch("http://localhost:5000/api/scans", {
      method: "POST",
      headers,
      body: JSON.stringify({
        url: pageUrlEl.textContent,
        contentSnippet: snippet,
        source: "extension",
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    const scan = data.scan;

    // Apply UI changes
    applyBadge(scan.resultLabel);
    credScore.textContent = `${scan.credibilityScore}/100`;
    scoreBar.style.width = `${scan.credibilityScore}%`;

    explanationBox.textContent =
      scan.mlMeta?.explanation?.join("\n") || "No explanation provided.";

    resultCard.classList.remove("hidden");

  } catch (err) {
    showError(err.message || "Analysis failed.");
  }

  analyzeBtn.disabled = false;
  analyzeBtn.textContent = "Analyze";
}

document.getElementById("analyzeBtn").addEventListener("click", analyze);

openDashboard.addEventListener("click", () => {
  chrome.tabs.create({ url: "http://localhost:3000" });
});

saveToken.addEventListener("click", () => {
  const t = prompt("Paste FraudEye token:");
  if (t) chrome.storage.local.set({ fraudeye_token: t }, () => alert("Token saved!"));
});

fetchPageInfo();
