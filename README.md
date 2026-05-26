# CryptoPulse AI — Easy Guide

**CryptoPulse AI** is a website on your computer that watches Bitcoin and other crypto prices **live**, draws charts, and tells you when the math looks good to **buy**, **hold**, or **sell** — with suggested prices for entry, profit target, and stop loss.

Think of it like a smart dashboard for crypto. It does **not** move your money for you. **You** decide if you actually buy on an exchange.

---

## What you need first

| Thing | Why |
|--------|-----|
| **A computer** (Windows, Mac, or Linux) | The app runs locally in your browser |
| **Internet** | Live prices come from Binance online |
| **Node.js** (version 18 or newer) | Lets you install and run the app |

### Don’t have Node.js yet?

1. Go to [https://nodejs.org](https://nodejs.org)
2. Download the **LTS** version (the big green button)
3. Install it — keep clicking **Next** (defaults are fine)
4. Restart your computer if the installer asks you to

**Check it worked:** open **Command Prompt** (Windows) or **Terminal** (Mac) and type:

```bash
node -v
```

You should see something like `v20.x.x` or `v22.x.x`. If you get an error, Node isn’t installed correctly yet.

---

## How to start the app (first time)

### Step 1 — Open a terminal in the project folder

**Windows:**

1. Open File Explorer
2. Go to your project folder (for example: `Downloads\Bitcoin`)
3. Click the address bar at the top, type `cmd`, press **Enter**

A black window opens — that’s your terminal.

**Mac:**

1. Open Terminal
2. Type `cd ` (with a space after `cd`)
3. Drag your `Bitcoin` folder into the window
4. Press **Enter**

### Step 2 — Install everything (only needed once)

Copy and paste this, then press **Enter**:

```bash
npm install
```

Wait until it finishes (can take 1–2 minutes). You’ll see a lot of text — that’s normal.

### Step 3 — Start the app

```bash
npm run dev
```

You should see something like:

```text
  ➜  Local:   http://localhost:5173/
```

### Step 4 — Open it in your browser

1. Open **Chrome**, **Edge**, or **Firefox**
2. In the address bar, type: **http://localhost:5173**
3. Press **Enter**

The CryptoPulse AI dashboard should load.

**To stop the app:** go back to the terminal window and press **Ctrl + C**.

**To use it again later:** you only need Step 3 and Step 4 (`npm run dev` → open the link). You don’t need `npm install` every time unless you deleted the folder or got new code.

---

## How to use the app (screen by screen)

### Top bar — scrolling prices

A moving strip shows **live prices** for several coins (BTC, ETH, SOL, etc.) and how much they changed in the last 24 hours.

- **Green** = price went up today  
- **Red** = price went down today  

### Pick a coin

Buttons like **₿ BTC**, **Ξ ETH**, **◎ SOL** — click one to switch what you’re analyzing.

### Big price box

Shows:

- Current **live price**
- **24h change** (% up or down)
- High / low / volume for the day
- **Time buttons:** `1m`, `5m`, `15m`, `1h`, `4h`, `1d` — how zoomed-in the chart is  
  - **1m / 5m** = very short-term (minutes)  
  - **1h / 4h** = medium-term (hours/days)  
  - **1d** = long-term (weeks)

**Refresh** reloads the data if something looks stuck.

### Live chart (left side)

- **Green candles** = price went up in that period  
- **Red candles** = price went down  
- Bars at the bottom = **volume** (how much was traded)  
- **LIVE** tag = price updates in real time  

### AI Signal panel (right side)

This is the main “what should I do?” box.

| Signal | Simple meaning |
|--------|----------------|
| **STRONG BUY** | Lots of indicators agree: conditions look good for buying |
| **BUY** | Leaning positive, but not as strong |
| **HOLD** | Mixed signals — no clear edge; wait or don’t add more |
| **SELL** | Leaning negative — be careful with new buys |
| **STRONG SELL** | Many indicators bearish — risk of drop |

**Confidence %** = how much the indicators agree with each other (higher = more agreement, not a guarantee of profit).

**Entry** = current suggested price to think about buying  
**Target** = where the app’s math suggests taking profit  
**Stop Loss** = price where you’d cut losses if things go wrong  

**R:R ratio** = reward vs risk (e.g. `2:1` means potential gain is about twice the possible loss).

### Quantitative Analysis (below the signal)

A list of **10+ math checks** (RSI, MACD, Bollinger Bands, etc.). Each one votes bullish (+) or bearish (−). You don’t need to memorize them — read the short sentence under each bar to see *why* it voted that way.

### Ready to invest? (bottom)

Shows entry / target / stop again and links to **Binance**, **Coinbase**, and **Kraken** so you can open a real exchange.

**Important:** The app only **suggests**. It does **not** connect to your wallet or bank account.

---

## Simple workflow (what most people do)

1. Start the app (`npm run dev` → open http://localhost:5173)
2. Pick **Bitcoin (BTC)** or another coin
3. Pick a timeframe (**1h** is a good default to start)
4. Read the **AI Signal** and **confidence**
5. Scroll the **Quantitative Analysis** if you want to know *why*
6. If you actually want to trade, use an exchange link — only with money you can afford to lose
7. Set a **stop loss** in your head (or on the exchange) near the app’s stop level

---

## Words you might see (quick dictionary)

| Word | Meaning |
|------|---------|
| **Crypto** | Digital money like Bitcoin |
| **USDT** | A “stablecoin” priced ~$1; prices are often shown as BTC/USDT |
| **Candle / chart** | Price movement over time (green up, red down) |
| **Signal** | The app’s suggestion: buy, hold, or sell |
| **Stop loss** | “If price hits here, I exit to limit losses” |
| **Target** | “If price hits here, I might take profit” |
| **DYOR** | “Do your own research” — don’t trust one app blindly |

---

## Troubleshooting

### “npm is not recognized” or “node is not recognized”

→ Install Node.js from [nodejs.org](https://nodejs.org), restart the computer, try again.

### The page won’t load at localhost:5173

→ Make sure the terminal still shows `npm run dev` running (don’t close that window).  
→ Try **http://127.0.0.1:5173** instead.

### Red error: “Failed to load market data”

→ Check your **internet**.  
→ Binance might be blocked in some countries/networks — try another network or VPN (if legal where you live).  
→ Click **Refresh** on the dashboard.

### Chart is empty or says “Loading…”

→ Wait 10–20 seconds.  
→ Click **Refresh**.  
→ Switch to another coin, then back to BTC.

### Port already in use

→ Another app might be using port 5173. Close other dev servers, or stop the old terminal (Ctrl+C) and run `npm run dev` again.

### `npm install` fails

→ Make sure you’re inside the `Bitcoin` folder (the one with `package.json`).  
→ Try: `npm install` again.  
→ Update Node.js to the latest LTS from [nodejs.org](https://nodejs.org).

---

## Put it online with GitHub Pages (free website)

**Visitors do NOT need Node.js.** Only you need Node on your computer once, to push code to GitHub. GitHub builds the site for you in the cloud.

### How it works (simple)

| Who | Needs Node? |
|-----|-------------|
| **You** (uploading / updating the site) | Only on your PC to test locally — GitHub Actions builds it when you push |
| **Anyone opening your website** | No — they just use Chrome/Safari like any normal site |

GitHub Pages hosts **static files** (HTML, JS, CSS). Your app runs **in the visitor’s browser** and loads live prices from Binance over the internet.

### Steps to publish

1. Create a repo on [GitHub](https://github.com) (e.g. name it `Bitcoin` or `cryptopulse-ai`).
2. Upload this project (or use Git → `git push`).
3. On GitHub: **Settings → Pages → Build and deployment → Source** → choose **GitHub Actions**.
4. Push to the `main` branch. The workflow in `.github/workflows/deploy.yml` runs automatically.
5. After 1–2 minutes, your site is live at:

   **`https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`**

   Example: `https://johndoe.github.io/Bitcoin/`

> If your repo is named `YOUR-USERNAME.github.io` (special user site), the URL is just `https://YOUR-USERNAME.github.io/` — ask if you need help with that case.

### If the site looks broken (blank page)

- Make sure the repo name in the URL matches your GitHub repo name exactly.
- Open the browser **Developer Tools → Console** (F12) and check for errors.

### Will live data work online?

**Usually yes.** The app talks to Binance from the browser. Some countries or school networks block Binance — then charts won’t load (same as any crypto site).

---

## Is this guaranteed to make money?

**No.**

- Crypto prices can crash fast.  
- The app uses **math and patterns**, not magic.  
- **Past patterns don’t promise future results.**  
- This is **not financial advice** — it’s a learning and research tool.  
- Never invest money you need for rent, food, or school.  
- Talk to a parent or adult before trading if you’re under 18.

---

## What’s under the hood (for the curious)

- **React** — builds the user interface  
- **Binance public API** — free live price data (no API key needed)  
- **10+ indicators** combined into one score (RSI, MACD, EMAs, Bollinger Bands, Stochastic, ADX, VWAP, OBV, Hurst exponent, linear regression)  
- **ATR** — used to calculate stop loss and target distances based on volatility  

---

## Quick command cheat sheet

| What you want | Command |
|---------------|---------|
| First-time setup | `npm install` |
| Start the app | `npm run dev` |
| Stop the app | `Ctrl + C` in the terminal |
| Open in browser | http://localhost:5173 |
| Production build | `npm run build` then `npm run preview` |

---

## Need help?

1. Read **Troubleshooting** above  
2. Make sure Node.js and internet work  
3. Try closing the terminal, run `npm run dev` again  

---

**Have fun exploring the charts — and stay safe with real money.**
