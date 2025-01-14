const scapeController = async (browserInstance) => {
  try {
    let browser = await browserInstance;
    // gọi hàm cạo ở file s scape
  } catch (e) {
    console.log("Lỗi ở scrape controller", +e);
  }
};

module.exports = scapeController;
