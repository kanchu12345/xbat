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

  // 1. Core Price Ticker State (Fallback Base Prices)
  const tickerItems = {
    btc: { price: 92450.75, change: 4.82, decimal: 2 },
    eth: { price: 3422.50, change: 2.15, decimal: 2 },
    sol: { price: 184.65, change: -1.48, decimal: 2 },
    link: { price: 17.82, change: 6.74, decimal: 2 },
    bnb: { price: 612.40, change: 0.85, decimal: 2 }
  };

  const binanceSymbols = {
    'BTCUSDT': 'btc',
    'ETHUSDT': 'eth',
    'SOLUSDT': 'sol',
    'LINKUSDT': 'link',
    'BNBUSDT': 'bnb'
  };

  // Helper to render all price nodes in the DOM (main & marquee duplicates)
  const renderAllPrices = () => {
    Object.keys(tickerItems).forEach(key => {
      const priceEl = document.getElementById(`${key}-price`);
      const priceDupEl = document.getElementById(`${key}-price-dup`);
      const changeEl = document.getElementById(`${key}-change`);
      const changeDupEl = document.getElementById(`${key}-change-dup`);
      
      const priceVal = tickerItems[key].price;
      const changeVal = tickerItems[key].change;
      const sign = changeVal >= 0 ? '+' : '';
      const decimalCount = tickerItems[key].decimal;

      const priceText = `$${priceVal.toLocaleString('en-US', {
        minimumFractionDigits: decimalCount,
        maximumFractionDigits: decimalCount
      })}`;
      const changeText = `${sign}${changeVal.toFixed(2)}%`;

      // Update Main Nodes
      if (priceEl && changeEl) {
        priceEl.textContent = priceText;
        changeEl.textContent = changeText;
        
        if (changeVal >= 0) {
          changeEl.className = 'ticker-green ml-1';
          priceEl.className = 'text-slate-100 font-semibold font-mono';
        } else {
          changeEl.className = 'ticker-orange ml-1';
          priceEl.className = 'text-orange-400 font-semibold font-mono';
        }
      }

      // Update Duplicate Nodes for Seamless Loop
      if (priceDupEl && changeDupEl) {
        priceDupEl.textContent = priceText;
        changeDupEl.textContent = changeText;

        if (changeVal >= 0) {
          changeDupEl.className = 'ticker-green ml-1';
          priceDupEl.className = 'text-slate-100 font-semibold font-mono';
        } else {
          changeDupEl.className = 'ticker-orange ml-1';
          priceDupEl.className = 'text-orange-400 font-semibold font-mono';
        }
      }
    });
  };

  // 2. Live Binance Public API Sync
  const fetchRealMarketPrices = async () => {
    try {
      const symbolsParam = encodeURIComponent(JSON.stringify(Object.keys(binanceSymbols)));
      const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${symbolsParam}`);
      
      if (!response.ok) throw new Error("API rate-limiting or network error");
      
      const data = await response.json();
      
      data.forEach(item => {
        const key = binanceSymbols[item.symbol];
        if (key) {
          tickerItems[key].price = parseFloat(item.lastPrice);
          tickerItems[key].change = parseFloat(item.priceChangePercent);
        }
      });

      renderAllPrices();
    } catch (error) {
      console.warn("Binance API unavailable. Seamlessly running on local simulated matching engine.", error);
    }
  };

  // 3. Local Micro-Fluctuation Simulation (Animates price ticking between API syncs)
  const simulateMicroFluctuation = () => {
    Object.keys(tickerItems).forEach(key => {
      // Simulate minor institutional ticks (+/- 0.02% max)
      const percentShift = (Math.random() - 0.5) * 0.0004;
      tickerItems[key].price *= (1 + percentShift);

      // Trigger brief price container glow flash on active tick
      const priceEl = document.getElementById(`${key}-price`);
      if (priceEl && Math.random() > 0.75) {
        const glowColor = tickerItems[key].change >= 0 ? "rgba(0,230,118,0.3)" : "rgba(255,109,0,0.3)";
        priceEl.style.transition = "text-shadow 0.2s ease";
        priceEl.style.textShadow = `0 0 8px ${glowColor}`;
        setTimeout(() => {
          priceEl.style.textShadow = "none";
        }, 300);
      }
    });

    renderAllPrices();
  };

  // Initialize: Fetch actual Binance prices immediately, then re-fetch every 15 seconds
  fetchRealMarketPrices();
  setInterval(fetchRealMarketPrices, 15000);

  // Micro-fluctuations run every 2.5 seconds to keep the visual grid feeling active
  setInterval(simulateMicroFluctuation, 25000 / 10);

  // 4. Animated Stats Counter Engine (Social Proof Trigger)
  const statsElements = document.querySelectorAll(".stat-counter");
  
  const animateCounter = (element) => {
    const target = parseFloat(element.getAttribute("data-target"));
    const suffix = element.getAttribute("data-suffix") || "";
    const isFloat = element.getAttribute("data-float") === "true";
    const duration = 2000;
    const frameRate = 1000 / 60;
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const count = () => {
      frame++;
      const progress = frame / totalFrames;
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic Ease Out
      
      let currentVal = target * easeProgress;
      
      if (isFloat) {
        element.textContent = `${currentVal.toFixed(1)}${suffix}`;
      } else {
        element.textContent = `${Math.floor(currentVal).toLocaleString()}${suffix}`;
      }

      if (frame < totalFrames) {
        requestAnimationFrame(count);
      } else {
        if (isFloat) {
          element.textContent = `${target.toFixed(1)}${suffix}`;
        } else {
          element.textContent = `${target.toLocaleString()}${suffix}`;
        }
      }
    };

    count();
  };

  // Trigger stats animations on scroll entry
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  statsElements.forEach(el => counterObserver.observe(el));

  // 5. Dynamic Accordion FAQs
  const faqQuestions = document.querySelectorAll(".faq-header");
  
  faqQuestions.forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      const content = btn.nextElementSibling;
      const arrow = btn.querySelector(".faq-arrow");
      
      const isOpen = item.classList.contains("faq-open");

      // Close all other accordions for seamless navigation
      document.querySelectorAll(".faq-item").forEach(otherItem => {
        otherItem.classList.remove("faq-open");
        otherItem.querySelector(".faq-content").style.maxHeight = null;
        otherItem.querySelector(".faq-arrow").style.transform = "rotate(0deg)";
      });

      if (!isOpen) {
        item.classList.add("faq-open");
        content.style.maxHeight = `${content.scrollHeight}px`;
        arrow.style.transform = "rotate(180deg)";
      }
    });
  });

  // 6. Systems online mock member increment
  const memberCounter = document.getElementById("live-member-counter");
  if (memberCounter) {
    setInterval(() => {
      if (Math.random() > 0.65) {
        const currentText = memberCounter.textContent.replace(/,/g, '');
        const currentCount = parseInt(currentText, 10);
        const increment = Math.floor(Math.random() * 2) + 1;
        memberCounter.textContent = (currentCount + increment).toLocaleString();
        
        memberCounter.style.color = "var(--neon-green)";
        setTimeout(() => {
          memberCounter.style.color = "inherit";
        }, 1000);
      }
    }, 7000);
  }
});
