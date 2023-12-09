/** @format */
import crawler from "../controllers/crawlerController";
const controller = require("../controllers/userController");

const adminRoute = (app) => {
  app.get("/admin", controller.adminBoard);
  app.post("/admin/crawler/start", crawler.initiateCrawling);
  app.post("/admin/crawler/stop", crawler.stopCrawler);
  app.post("/admin/crawler/addwebsite", crawler.addCrawlingWebsite);
};

export default adminRoute;
