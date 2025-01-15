const scapeCategory = (browser, url) =>
  new Promise(async (resolve, reject) => {
    try {
      let page = await browser.newPage(); // Mở tab mới
      console.log(">> Mở tab mới ... ");
      await page.goto(url); // Truy cập URL
      console.log(">> Truy cập vào ... " + url);

      // Chờ thẻ <nav class="pt123__nav"> xuất hiện
      await page.waitForSelector("nav.pt123__nav");
      console.log(">> Website đã load xong ...");

      // Lấy dữ liệu từ các mục trong <nav class="pt123__nav">
      const dataCategory = await page.$$eval(
        "nav.pt123__nav > ul > li",
        (els) => {
          return els
            .map((el) => {
              const aTag = el.querySelector("a"); // Tìm thẻ <a>
              return aTag
                ? {
                    category: aTag.innerText.trim(), // Lấy tên danh mục
                    link: aTag.href, // Lấy link
                  }
                : null; // Nếu không có thẻ <a>
            })
            .filter(Boolean); // Loại bỏ các mục null
        }
      );

      console.log(dataCategory);

      await page.close();
      console.log(">> Đóng tab ...");
      resolve(dataCategory); // Trả về dữ liệu danh mục
    } catch (error) {
      console.log("Lỗi ở scapeCategory:", error);
      reject(error);
    }
  });

module.exports = {
  scapeCategory,
};
