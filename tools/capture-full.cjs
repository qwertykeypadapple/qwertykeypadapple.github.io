// Full-length previews for the "vision" that rises out of each book. Run with:
//   NODE_PATH=../site-mapper/node_modules node tools/capture-full.cjs [name ...]
const { chromium } = require("playwright");
const path = require("path");
const G = "https://qwertykeypadapple.github.io/";
const shots = [
  ["flwr-viz", G + "flwr-viz/"],
  ["investor-connect", "https://investor-connect-051f.onrender.com/"],
  ["fedpbc-demo", G + "fedpbc-demo/"],
  ["federation-quest", G + "federation-quest/"],
  ["fedmse-arcade", G + "fedmse-arcade/"],
  ["flprogress-explained", G + "flprogress-explained/"],
  ["thinking-outside-the-box", "https://nukkadai.onrender.com/"],
  ["pokewords", "https://pokewords.onrender.com/"],
  ["logic-bench", "https://logic-bench.onrender.com/"],
];
(async () => {
  const only = process.argv.slice(2);
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  for (const [name, url] of shots.filter(([n]) => !only.length || only.includes(n))) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    try {
      const res = await page.goto(url, { waitUntil: "load", timeout: 150000 });   // Render can take a minute to wake
      await page.waitForTimeout(4000);
      const h = Math.min(3600, await page.evaluate(() => document.documentElement.scrollHeight));
      await page.screenshot({ path: path.join(__dirname, "..", "images", "full", name + ".png"), clip: { x: 0, y: 0, width: 1280, height: Math.max(800, h) }, fullPage: true });
      console.log(name, res && res.status(), h);
    } catch (e) { console.log(name, "FAILED", e.message.split("\n")[0]); }
    await page.close();
  }
  await browser.close();
})();
