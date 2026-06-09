// Premium Interactive Dashboard Engine & Live Market Feed //

document.addEventListener("DOMContentLoaded", () => {
  // Inject configuration dynamically from config.js
  if (typeof APEX_CONFIG !== 'undefined') {
    const primaryCTA = document.getElementById("primary-cta-button");
    const secondaryCTA = document.getElementById("secondary-cta-button");
    
    // Set default initial fallback links
    if (primaryCTA) primaryCTA.href = APEX_CONFIG.telegramLink;
    if (secondaryCTA) secondaryCTA.href = APEX_CONFIG.telegramLink;

    // Fetch and parse the live link from Google Sheets if configured
    if (APEX_CONFIG.googleSheetCsvUrl && !APEX_CONFIG.googleSheetCsvUrl.includes("PLACEHOLDER")) {
      fetch(APEX_CONFIG.googleSheetCsvUrl)
        .then(response => {
          if (!response.ok) throw new Error("Google Sheets CSV offline");
          return response.text();
        })
        .then(csvText => {
          // Parse CSV: find the first token that starts with http
          const tokens = csvText.split(/[\r\n,]+/);
          const liveUrl = tokens.find(t => t.trim().startsWith("http"));
          if (liveUrl) {
            const cleanUrl = liveUrl.trim();
            if (primaryCTA) primaryCTA.href = cleanUrl;
            if (secondaryCTA) secondaryCTA.href = cleanUrl;
            console.log("Telegram URL synced live from Google Sheets: ", cleanUrl);
          }
        })
        .catch(error => {
          console.warn("Google Sheet sync failed. Running on stable fallback link.", error);
        });
    }

    const statusTextEl = document.getElementById("live-status-text");
    if (statusTextEl) statusTextEl.textContent = APEX_CONFIG.systemsStatus;

    const memberCounter = document.getElementById("live-member-counter");
    if (memberCounter) {
      memberCounter.textContent = APEX_CONFIG.initialOnlineMembers.toLocaleString();
    }
  }

  // Features removed per user request
});
