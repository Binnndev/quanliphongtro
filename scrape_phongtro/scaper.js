const scapeCategory = async (browser, url) => {
  try {
    let page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector(".category-item");
  } catch (error) {
    console.log("lỗi ở scape category", +error);
  }
};
