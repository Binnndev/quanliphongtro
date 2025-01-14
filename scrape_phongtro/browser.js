const puppeteer = require("puppeteer");

const startBrowser = async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ["--disable-setuid-sanbox"],
      ignoreHTTPSErrors: true,
    });

    return browser;
  } catch (error) {
    console.log("Không tạo được browser", error);
  }
};

module.exports = startBrowser();
