// Screenshots each project's live site into ../images. Run with:
//   NODE_PATH=../site-mapper/node_modules node tools/capture.cjs [name ...]
const { chromium } = require("playwright");
const path = require("path");

const shots = [
  ["flwr-viz", "https://qwertykeypadapple.github.io/flwr-viz/"],
  ["fedpbc-demo", "https://fedpbc-demo.onrender.com/"],
  ["federation-quest", "https://federation-quest.onrender.com/"],
  ["thinking-outside-the-box", "https://nukkadai.onrender.com/"],
  ["investor-connect", "https://investor-connect-051f.onrender.com/"],
  ["samhita-health", "https://samhita-health.onrender.com/"],
  ["fedmse-arcade", "https://qwertykeypadapple.github.io/fedmse-arcade/"],
  ["flpro", "https://qwertykeypadapple.github.io/flprogress-explained/"],
  ["deck-fedaml", "https://qwertykeypadapple.github.io/fedaml-decks/"],
  ["deck-fedaml-results", "https://qwertykeypadapple.github.io/fedaml-decks/results.html"],
  ["deck-battery", "https://qwertykeypadapple.github.io/battery-pitch-deck/"],
  ["deck-bearing", "https://qwertykeypadapple.github.io/bearing-collective/"],
  ["deck-vibration", "https://qwertykeypadapple.github.io/ask-the-vibration/"],
  ["logic-bench", "https://logic-bench.onrender.com/"],
  ["pokewords", "https://pokewords.onrender.com/"],
  ["daily-mind", "https://daily-mind.onrender.com/"],
  ["fedbank-india", process.env.FEDBANK_URL || "http://127.0.0.1:5186/"],
  ["neural-debris-solution", "https://qwertykeypadapple.github.io/neural-debris-solution/"],
];

(async () => {
  const only = process.argv.slice(2);
  const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
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
