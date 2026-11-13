// Screenshots each project's live site into ../images. Run with:
//   NODE_PATH=../site-mapper/node_modules node tools/capture.cjs [name ...]
const { chromium } = require("playwright");
const path = require("path");

const shots = [
  ["fedpbc-demo", "https://fedpbc-demo.onrender.com/"],
  ["federation-quest", "https://federation-quest.onrender.com/"],
  ["thinking-outside-the-box", "https://thinking-outside-the-box.onrender.com/"],
  ["samhita-health", "https://samhita-health.onrender.com/"],
  ["pokewords", "https://pokewords.onrender.com/"],
  ["daily-mind", "https://daily-mind.onrender.com/"],
  ["fedbank-india", process.env.FEDBANK_URL || "http://127.0.0.1:5186/"],
  ["neural-debris-solution", "https://qwertykeypadapple.github.io/neural-debris-solution/"],
];

(async () => {
  const only = process.argv.slice(2);
  const browser = await chromium.launch();
  await Promise.all(
    shots
      .filter(([name]) => !only.length || only.includes(name))
      .map(async ([name, url]) => {
        const page = await browser.newPage({ viewport: { width: 1280, height: 860 } });
        try {
          // Render's free tier can take a minute to wake a sleeping site.
          const res = await page.goto(url, { waitUntil: "load", timeout: 150000 });
          await page.waitForTimeout(3500);
          await page.screenshot({
            path: path.join(__dirname, "..", "images", name + ".jpg"),
            type: "jpeg",
            quality: 82,
          });
          console.log(name, res && res.status(), await page.title());
        } catch (e) {
          console.log(name, "FAILED", e.message.split("\n")[0]);
        }
        await page.close();
      })
  );
  await browser.close();
})();
