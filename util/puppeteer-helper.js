const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const rp = require('request-promise');

const { checkDirExist } = require('../util/upload-helper');

/**
 * @description 屏幕截图
 */
const screenshot = async (params) => {
  const browser = await puppeteer.launch({
    defaultViewport: {
      width: 1280,
      height: 768,
    },
  });
  const page = await browser.newPage();
  // await page.setViewport({});
  await page.goto(params.url);
  const dir = path.join(__dirname, '../public/screenshot');
  const screenshotpath = `${dir}/${params.name}.jpg`;
  checkDirExist(dir);
  await page.screenshot({ path: screenshotpath });
  await browser.close();

  return screenshotpath;
};

/**
 * @description 上传屏幕截图
 */
const uploadScreenshot = async (filePath, token, origin) => {
  const file = await fs.createReadStream(filePath);
  const options = {
    method: 'POST',
    uri: `${origin}/api/upload`,
    formData: {
      usedFor: 'screenshot',
      file: {
        value: file,
        options: {},
      },
    },
    headers: {
      Authorization: token,
    },
  };
  return new Promise((resolve, reject) => {
    rp(options)
      .then((body) => {
        resolve(JSON.parse(body));
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  screenshot,
  uploadScreenshot,
};
