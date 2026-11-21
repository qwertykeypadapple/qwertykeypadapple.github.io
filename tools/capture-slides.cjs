// Captures each project's site as a short set of slides for the cinema screens.
//   NODE_PATH=../site-mapper/node_modules node tools/capture-slides.cjs [name ...]
// Writes images/slides/<name>-<n>.jpg (1024x576) and images/slides/index.json ({ name: count }).
// Render-hosted sites sleep: open them in a browser first so they are awake.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const G = "https://qwertykeypadapple.github.io/";
// how: "scroll" = one slide per screenful; "deck" = right arrow between slides; "enter" = press Enter between slides
const SITES = [
  ["flwr-viz", G + "flwr-viz/", "scroll"],
  ["investor-connect", "https://investor-connect-051f.onrender.com/", "scroll"],
  ["fedpbc-demo", G + "fedpbc-demo/", "scroll"],
  ["federation-quest", G + "federation-quest/", "enter"],
  ["fedmse-arcade", G + "fedmse-arcade/", "scroll"],
  ["flprogress-explained", G + "flprogress-explained/", "scroll"],
  ["neural-debris-solution", G + "neural-debris-solution/attempt-map.html", "scroll"],
  ["thinking-outside-the-box", "https://nukkadai.onrender.com/", "scroll"],
  ["pokewords", "https://pokewords.onrender.com/", "scroll"],
  ["logic-bench", "https://logic-bench.onrender.com/", "scroll"],
  ["fedaml-pitch", G + "fedaml-decks/", "deck"],
  ["fedaml-results", G + "fedaml-decks/results.html", "deck"],
  ["battery-pitch-deck", G + "battery-pitch-deck/", "deck"],
  ["bearing-collective", G + "bearing-collective/", "deck"],
  ["ask-the-vibration", G + "ask-the-vibration/", "deck"],
];
const MAX = 8;
(async () => {
  const only = process.argv.slice(2);
  const dir = path.join(__dirname, "..", "images", "slides"); fs.mkdirSync(dir, { recursive: true });
  const indexFile = path.join(dir, "index.json");
  const index = fs.existsSync(indexFile) ? JSON.parse(fs.readFileSync(indexFile, "utf8")) : {};
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  for (const [name, url, how] of SITES.filter(([n]) => !only.length || only.includes(n))) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
    try {
      await page.goto(url, { waitUntil: "load", timeout: 150000 });
      await page.waitForTimeout(3000);
      const seen = new Set(); let n = 0;
      const snap = async () => {
        const buf = await page.screenshot({ type: "jpeg", quality: 80 });
        const h = crypto.createHash("md5").update(buf).digest("hex");
        if (seen.has(h)) return false; seen.add(h);
        fs.writeFileSync(path.join(dir, `${name}-${++n}.jpg`), buf); return true;
      };
      if (how === "scroll") {
        const total = await page.evaluate(() => document.documentElement.scrollHeight);
        const steps = Math.min(MAX, Math.ceil(total / 720));
        for (let i = 0; i < steps; i++) { await page.evaluate((y) => window.scrollTo(0, y), i * 720); await page.waitForTimeout(900); await snap(); }
      } else {
        for (let i = 0; i < MAX; i++) {
          await snap();
          await page.keyboard.press(how === "deck" ? "ArrowRight" : "Enter");
          await page.waitForTimeout(1600);
        }
      }
      index[name] = n; console.log(name, n);
    } catch (e) { console.log(name, "FAILED", e.message.split("\n")[0]); }
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(indexFile, JSON.stringify(index, null, 1));
})();
