/* eslint-disable prefer-destructuring */
const puppeteer = require('puppeteer');

/**
 * @desc 按照关键字搜索爬虫
 */
const spiderForSearch = async (url) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(url);

  const result = await page.evaluate(() => {
    const elements = [...document.querySelectorAll('#search-main > .search-list li')].slice(1);
    return elements.map(ele => ({
      category: ele.querySelector('span.s1').innerText,
      name: ele.querySelector('span.s2 > a').innerText,
      lastChapter: ele.querySelector('span.s3 > a').innerText,
      author: ele.querySelector('span.s4').innerText,
      updateTime: ele.querySelector('span.s6').innerText,
      status: ele.querySelector('span.s7').innerText,
      bookId: ele.querySelector('span.s3 > a').href.split('.')[2].split('/')[2],
      chapterId: ele.querySelector('span.s3 > a').href.split('.')[2].split('/')[3],
    }));
  });
  await browser.close();
  return result;
};

/**
 * @desc 根据ID爬取书信息，包括 书名，作者，简介，章节目录
 */
const spiderForInfo = async (url) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(url);

  const result = await page.evaluate(() => {
    const data = {};
    const chaptersList = [];
    let indexTemp = -1;
    const chaptersListEle = [...document.querySelectorAll('#list dl dt,dd')];

    // 获取分类章节列表
    chaptersListEle.forEach((ele) => {
      if (ele.tagName === 'DT') {
        indexTemp += 1;
        chaptersList[indexTemp] = {};
        chaptersList[indexTemp].category = ele.innerText;
        chaptersList[indexTemp].list = [];
      } else {
        const chapterEle = ele.querySelector('a');
        chaptersList[indexTemp].list.push({
          title: chapterEle.innerText,
          bookId: chapterEle.href.split('.')[2].split('/')[2],
          chapterId: chapterEle.href.split('.')[2].split('/')[3],
        });
      }
    });

    data.chaptersList = chaptersList;
    data.poster = document.querySelector('#fmimg > img').src;
    data.name = document.querySelector('#info > h1').innerText;
    data.author = document.querySelector('#info > p').innerText.split('：')[1];
    data.brief = document.querySelector('#intro').innerText;
    data.updateTime = document.querySelector('#info p:nth-child(4)').innerText.split('：')[1];
    return data;
  });
  await browser.close();
  return result;
};

const spiderForChapter = async (url) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(url);

  const result = await page.evaluate(() => {
    const data = {};
    const contentStr = document.querySelector('#content').innerText;
    const prevHref = document.querySelector('#A1').href;
    const nextHref = document.querySelector('#A3').href;
    const chaptersDirectoryHref = document.querySelector('#A2').href;
    data.title = document.querySelector('.bookname > h1').innerText;
    data.bookId = chaptersDirectoryHref.split('.')[2].split('/')[2];
    data.chapterPrevId = prevHref.split('.')[2].split('/')[3] ? prevHref.split('.')[2].split('/')[3] : '';
    data.chapterNextId = nextHref.split('.')[2].split('/')[3] ? nextHref.split('.')[2].split('/')[3] : '';
    data.content = `${contentStr.replace(/\s{1,}/g, '\n').split('\n').slice(0, -1).join('</p><p>')
      .slice(4)}</p>`;
    return data;
  });
  await browser.close();
  return result;
};

const spiderForCategory = async (url) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(url);

  const result = await page.evaluate(() => {
    const data = {};
    const hotListEle = [...document.querySelectorAll('#hotcontent .item')];
    const newListEle = [...document.querySelectorAll('#newscontent .l ul li')];
    const clickRankEle = [...document.querySelectorAll('#newscontent .r ul li')];
    const hotList = hotListEle.map(ele => ({
      poster: ele.querySelector('.image img').src,
      name: ele.querySelector('dl > dt > a').innerText,
      author: ele.querySelector('dl > dt > span').innerText,
      brief: ele.querySelector('dl > dd').innerText,
      bookId: ele.querySelector('.image a').href.split('.')[2].split('/')[2],
    }));

    const newList = newListEle.map(ele => ({
      category: ele.querySelector('span.s1').innerText,
      name: ele.querySelector('span.s2 > a').innerText,
      lastChapter: ele.querySelector('span.s3 > a').innerText,
      author: ele.querySelector('span.s4').innerText,
      updateTime: ele.querySelector('span.s5').innerText,
      bookId: ele.querySelector('span.s3 > a').href.split('.')[2].split('/')[2],
      chapterId: ele.querySelector('span.s3 > a').href.split('.')[2].split('/')[3],
    }));

    const clickRank = clickRankEle.map(ele => ({
      category: ele.querySelector('span.s1').innerText,
      name: ele.querySelector('span.s2 > a').innerText,
      author: ele.querySelector('span.s5').innerText,
      bookId: ele.querySelector('span.s2 > a').href.split('.')[2].split('/')[2],
    }));

    data.hotList = hotList;
    data.newList = newList;
    data.newListTitle = document.querySelector('#newscontent .l > h2').innerText;
    data.clickRank = clickRank;
    data.clickRankTitle = document.querySelector('#newscontent .r > h2').innerText;
    return data;
  });
  await browser.close();
  return result;
};

const spiderForRank = async (url) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(url);

  const result = await page.evaluate(() => {
    const topListEle = [...document.querySelectorAll('.index_toplist')];
    return topListEle.map(ele => ({
      title: ele.querySelector('.toptab > span').innerText,
      rankFinal: [...ele.querySelectorAll('.topbooks:nth-child(1) > ul li')].map(child => ({
        name: child.querySelector('a').innerText,
        date: child.querySelector('span.hits').innerText,
        bookId: child.querySelector('a').href.split('.')[2].split('/')[2],
      })),
      rankMonth: [...ele.querySelectorAll('.topbooks:nth-child(2) > ul li')].map(child => ({
        name: child.querySelector('a').innerText,
        date: child.querySelector('span.hits').innerText,
        bookId: child.querySelector('a').href.split('.')[2].split('/')[2],
      })),
      rankWeek: [...ele.querySelectorAll('.topbooks:nth-child(3) > ul li')].map(child => ({
        name: child.querySelector('a').innerText,
        date: child.querySelector('span.hits').innerText,
        bookId: child.querySelector('a').href.split('.')[2].split('/')[2],
      })),
    }));
  });
  await browser.close();
  return result;
};

const spiderForHome = async (url) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(url);

  const result = await page.evaluate(() => {
    const data = {};
    const hotListEle = [...document.querySelectorAll('#hotcontent .l .item')];
    const tjListEle = [...document.querySelectorAll('#hotcontent .r ul li')];
    const rankListEle = [...document.querySelectorAll('.content')];
    const lastUpdateEle = [...document.querySelectorAll('#newscontent .l ul li')];
    const lastRecordEle = [...document.querySelectorAll('#newscontent .r ul li')];

    data.hotList = hotListEle.map(ele => ({
      poster: ele.querySelector('.image img').src,
      name: ele.querySelector('dl > dt > a').innerText,
      author: ele.querySelector('dl > dt > span').innerText,
      brief: ele.querySelector('dl > dd').innerText,
      bookId: ele.querySelector('.image a').href.split('.')[2].split('/')[2],
    }));

    data.tjList = tjListEle.map(ele => ({
      category: ele.querySelector('span.s1').innerText,
      name: ele.querySelector('span.s2 > a').innerText,
      author: ele.querySelector('span.s5').innerText,
      bookId: ele.querySelector('span.s2 > a').href.split('.')[2].split('/')[2],
    }));

    data.rankList = rankListEle.map(ele => ({
      category: ele.querySelector('h2').innerText,
      top: {
        poster: ele.querySelector('.top > .image img').src,
        name: ele.querySelector('.top dl > dt a').innerText,
        brief: ele.querySelector('.top dl > dd').innerText,
        bookId: ele.querySelector('.top dl > dt a').href.split('.')[2].split('/')[2],
      },
      list: [...ele.querySelectorAll('ul li')].map(child => ({
        name: child.innerText.split('/')[0].trim(),
        author: child.innerText.split('/')[1].trim(),
        bookId: child.querySelector('a').href.split('.')[2].split('/')[2],
      })),
    }));

    data.lastUpdate = lastUpdateEle.map(ele => ({
      category: ele.querySelector('span.s1').innerText,
      name: ele.querySelector('span.s2 > a').innerText,
      lastChapter: ele.querySelector('span.s3 > a').innerText,
      author: ele.querySelector('span.s4').innerText,
      updateTime: ele.querySelector('span.s5').innerText,
      bookId: ele.querySelector('span.s3 > a').href.split('.')[2].split('/')[2],
      chapterId: ele.querySelector('span.s3 > a').href.split('.')[2].split('/')[3],
    }));

    data.lastRecord = lastRecordEle.map(ele => ({
      category: ele.querySelector('span.s1').innerText,
      name: ele.querySelector('span.s2 > a').innerText,
      author: ele.querySelector('span.s5').innerText,
      bookId: ele.querySelector('span.s2 > a').href.split('.')[2].split('/')[2],
    }));

    data.lastUpdateTitle = document.querySelector('#newscontent .l > h2').innerText;
    data.lastRecordTitle = document.querySelector('#newscontent .r > h2').innerText;

    return data;
  });
  await browser.close();
  return result;
};

module.exports = {
  spiderForHome,
  spiderForSearch,
  spiderForInfo,
  spiderForChapter,
  spiderForCategory,
  spiderForRank,
};
