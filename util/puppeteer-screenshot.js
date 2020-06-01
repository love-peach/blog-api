const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const rp = require('request-promise');

const { checkDirExist } = require('./upload-helper');

/**
 * @description 屏幕截图
 */
const screenshot = async (params) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
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

  const webPageInfo = await page.evaluate(() => {
    const elements = [...document.querySelectorAll('meta')];
    const metaDescEle = elements.filter(ele => typeof ele.name !== 'undefined' && ele.name.toLowerCase() === 'description')[0];
    const desc = metaDescEle ? metaDescEle.content : '';
    const { title } = document;
    return {
      title,
      metaDesc: desc,
    };
  });

  await browser.close();

  return {
    path: screenshotpath,
    ...webPageInfo,
  };
};

/**
 * @description 上传屏幕截图
 */
const uploadScreenshot = async (filePath, token, origin) => {
  const file = await fs.createReadStream(filePath);
  const fileItemNameArr = filePath.split('/');
  const fileItemName = fileItemNameArr[fileItemNameArr.length - 1];

  const options = {
    method: 'POST',
    uri: `${origin}/api/upload`,
    formData: {
      usedFor: 'screenshot',
      fileItemName,
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
