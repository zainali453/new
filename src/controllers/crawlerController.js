/** @format */
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
import db from "../models";
const CrawlerData = db.crawlerData;
const CrawlerWebsite = db.crawlerWebsite;
var browser, page;

const createBrowser = async (req, res, next) => {
  if (!isBrowserOpen()) {
    try {
      browser = await puppeteer.launch({
        headless: false,
        args: ["--window-size=1366,768"],
        defaultViewport: { width: 1366, height: 768 },
      });
      if (!browser) {
        res.status(500).send("Internal Server Error");
        return false;
      }
    } catch (e) {
      res.status(500).send("Internal Server Error");
      return false;
    }
  }
  const pages = await browser.pages();
  if (pages.length > 0) page = pages[0];
  else page = await browser.newPage();
  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });
  return true;
};

const initiateCrawling = async (req, res, next) => {
  if (await createBrowser(req, res, next)) {
    res.send("Crawler Started");
    try {
      const crawlerWebsites = await getCrawlerWebsiteUrls();
      console.log("All URLs:", crawlerWebsites);
      var i = 0;
      var websiteIndex = 0;
      while (
        true &&
        crawlerWebsites &&
        crawlerWebsites[websiteIndex].url &&
        crawlerWebsites[websiteIndex].id
      ) {
        //Going To The Website Url To Get Scholarships
        await page.goto(crawlerWebsites[websiteIndex].url + "?page=" + i);

        //Checking For Return Button
        const returnButton = await page.$x('//*[@id="app"]/div[1]/span/a');
        if (returnButton.length > 0) break;

        //Getting Only Scholarship Links
        const hrefs = await page.evaluate(() => {
          const anchors = document.querySelectorAll("a");
          return Array.from(anchors, (a) => a.href);
        });
        //Filtering The Links Because We need Only The Scholarship Links
        const filteredHrefs = hrefs.filter((href) => {
          const parsedUrl = new URL(href);
          const pathSegments = parsedUrl.pathname.split("/").filter(Boolean);
          return (
            pathSegments.length >= 2 &&
            pathSegments[pathSegments.length - 2] === "scholarship"
          );
        });

        filteredHrefs.map(async (url) => {
          const crawlerData = new CrawlerData({
            scholarshipUrl: url,
            source: [crawlerWebsites[websiteIndex].id],
          });
          await crawlerData.save();
        });
        i = i + 1;
      }
    } catch (error) {
      console.log(error);
    }
  }
};

const isBrowserOpen = () => browser && browser.isConnected();

const addCrawlingWebsite = async (req, res, next) => {
  if (req.body && req.body.url && req.body.websitename) {
    // Check if the URL already exists
    CrawlerWebsite.findOne({ url: req.body.url })
      .exec()
      .then((existingWebsite) => {
        if (existingWebsite) {
          // URL already exists, return a 400 response
          res.status(400).send({ message: "URL Must Be Unique" });
          throw "URL Must Be Unique";
        }

        // URL is unique, create a new CrawlerWebsite
        const newCrawlerWebsite = new CrawlerWebsite({
          url: req.body.url,
          websiteName: req.body.websitename,
        });

        return newCrawlerWebsite.save();
      })
      .then(() => {
        res.send("CrawlerWebsite saved successfully");
      })
      .catch((error) => {
        console.error("Error:", error);
        if (error !== "URL Must Be Unique") {
          res.status(500).send({ message: "Internal Server Error" });
        }
      });
  } else {
    res.status(400).send({ message: "Request Is Not Complete" });
  }
};
const stopCrawler = async (req, res, next) => {
  if (isBrowserOpen()) {
    try {
      await browser.close();
      res.send("Crawler Stopped");
    } catch (e) {
      res.status(500).send("Internal Server Error");
    }
  } else {
    res.send("Crawler is already Stopped");
  }
};

const getCrawlerWebsiteUrls = async () => {
  const crawlerWebsites = await CrawlerWebsite.find({})
    .exec()
    .then((res) => {
      return res;
    })
    .catch((error) => {
      console.error("Error:", error);
      return "";
    });
  return crawlerWebsites;
};
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default { initiateCrawling, stopCrawler, addCrawlingWebsite };
