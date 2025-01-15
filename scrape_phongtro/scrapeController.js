const scapers = require("./scaper");

const scapeController = async (browserInstance) => {
  const url = "https://phongtro123.com/";
  try {
    let browser = await browserInstance;
    // gọi hàm cạo ở file s scape
    let categories = scapers.scapeCategory(browser, url);
  } catch (e) {
    console.log("Lỗi ở scrape controller", +e);
  }
};

module.exports = scapeController;
