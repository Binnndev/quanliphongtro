const startBrowser = require("./browser");
const scapeController = require("./scrapeController");

let browser = startBrowser();
scapeController(browser);
