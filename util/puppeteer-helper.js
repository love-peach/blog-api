const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');
const rp = require('request-promise');

const { checkDirExist } = require('../util/upload-helper');

/**
 * @description 屏幕截图
 */
const screenshot = async (params) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
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
const uploadScreenshot = (filePath, token, origin) => {
  // form.append('usedFor', 'screenshot');

  // const headers = form.getHeaders();
  // headers.Authorization = `Bearer ${token}`;

  const options = {
    method: 'POST',
    uri: '/api/upload',
    formData: {
      usedFor: 'screenshot',
      file: {
        value: fs.createReadStream(filePath),
      },
    },
    headers: {
      Authorization: token,
    },
  };

  rp(options)
    .then((body) => {
      console.log(1);
      // POST succeeded...
    })
    .catch((err) => {
      console.log(2);

      // POST failed...
    });
};

module.exports = {
  screenshot,
  uploadScreenshot,
};
