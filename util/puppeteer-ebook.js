/* eslint-disable prefer-destructuring */
const puppeteer = require('puppeteer');


const spiderForAuthor = async (url) => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(url);

  const result = await page.evaluate(() => {
    const table = document.querySelector('table');
    const rows = table.rows;

    const works = [];

    for (let i = 0; i < rows.length; i++) { // --循环所有的行
      const cells = rows[i].cells;
      const bookEle = cells[1].querySelector('a');
      const dataArray = cells[1].innerText.replace(/\s{1,}/g, '\n').split('\n');
      works.push({
        poster: cells[0].querySelector('a img').src,
        name: bookEle.innerText,
        bookId: bookEle.href.split('.')[2].split('/')[1],
        author: dataArray[2],
        brief: dataArray.slice(4).join(''),
      });
    }
    return works;
  });

  await browser.close();
  return result;
};

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
    const elements = [...document.querySelectorAll('#main ul li')].slice(1);
    let data = [];
    data = elements.map((ele) => {
      const authorEle = ele.querySelector('span.s4 a');
      const bookEle = ele.querySelector('span.s2 a');
      const chapterEle = ele.querySelector('span.s3 a');

      return {
        // category: ele.querySelector('span.s1').innerText,
        // status: ele.querySelector('span.s7').innerText,
        author: authorEle.innerText,
        authorId: authorEle.href.split('.')[2].split('/')[2],
        name: bookEle.innerText,
        bookId: bookEle.href.split('.')[2].split('/')[1],
        lastChapter: chapterEle.innerText,
        chapterId: chapterEle.href.split('.')[2].split('/')[2],
        updateTime: ele.querySelector('span:last-child').innerText,
      };
    });
    return data;
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
          bookId: chapterEle.href.split('.')[2].split('/')[1],
          chapterId: chapterEle.href.split('.')[2].split('/')[2],
        });
      }
    });

    const authorEle = document.querySelector('#info > p a');

    data.chaptersList = chaptersList;
    data.poster = document.querySelector('#fmimg > img').src;
    data.name = document.querySelector('#info > h1').innerText;
    data.author = authorEle.innerText;
    data.authorId = authorEle.href.split('.')[2].split('/')[2];
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
    const prevHref = document.querySelector('.bottem2 a:nth-child(2)').href;
    const nextHref = document.querySelector('.bottem2 a:nth-child(4)').href;
    const chaptersDirectoryHref = document.querySelector('.mulu').href;

    const prevChapterId = prevHref.split('.')[2].split('/')[2];
    const nextChapterId = nextHref.split('.')[2].split('/')[2];

    data.title = document.querySelector('.bookname > h1').innerText;
    data.bookId = chaptersDirectoryHref.split('.')[2].split('/')[1];
    data.chapterPrevId = prevChapterId || '';
    data.chapterNextId = nextChapterId || '';
    data.content = `${contentStr.replace(/\s{1,}/g, '\n').split('\n').slice(0, -1).join('</p><p>')
      .slice(4)}</p>`;
    return data;
  });
  await browser.close();
  return result;
};

const spiderForCategory = async (url) => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(url);

  const result = await page.evaluate(() => {
    const data = {};
    const hotListEle = [...document.querySelectorAll('#hotcontent .item')];
    const newListEle = [...document.querySelectorAll('#newscontent .l ul li')];
    const clickRankEle = [...document.querySelectorAll('#newscontent .r ul li')];

    data.hotList = hotListEle.map((ele) => {
      const authorEle = ele.querySelector('dl > dt > a:first-child');
      const bookEle = ele.querySelector('dl > dt > a:last-child');
      return {
        poster: ele.querySelector('.image img').src,
        author: authorEle.innerText,
        authorId: authorEle.href.split('.')[2].split('/')[2],
        brief: ele.querySelector('dl > dd').innerText,
        name: bookEle.innerText,
        bookId: bookEle.href.split('.')[2].split('/')[1],
      };
    });

    data.newList = newListEle.map((ele) => {
      const authorEle = ele.querySelector('span.s4 > a');
      const bookEle = ele.querySelector('span.s2 > a');
      const chapterEle = ele.querySelector('span.s3 > a');
      return {
        category: ele.querySelector('span.s1').innerText,
        author: authorEle.innerText,
        authorId: authorEle.href.split('.')[2].split('/')[2],
        name: bookEle.innerText,
        bookId: bookEle.href.split('.')[2].split('/')[1],
        lastChapter: chapterEle.innerText,
        chapterId: chapterEle.href.split('.')[2].split('/')[2],
        updateTime: ele.querySelector('span.s5').innerText,
      };
    });

    data.clickRank = clickRankEle.map((ele) => {
      const authorEle = ele.querySelector('span.s5 > a');
      const bookEle = ele.querySelector('span.s2 > a');
      return {
        category: ele.querySelector('span.s1').innerText,
        author: authorEle.innerText,
        authorId: authorEle.href.split('.')[2].split('/')[2],
        name: bookEle.innerText,
        bookId: bookEle.href.split('.')[2].split('/')[1],
      };
    });

    data.newListTitle = document.querySelector('#newscontent .l > h2').innerText;
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
    // headless: false,
    // waitUntil: 'domcontentloaded',
    waitUntil: 'load',
    timeout: 0,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-extensions'],
  });
  console.log(url, 'url21212');
  const page = await browser.newPage();
  const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/63.0.3239.84 Chrome/63.0.3239.84 Safari/537.36";

  // await page.setUserAgent(UA),
  await page.goto(url, {
    timeout: 0,
  });

  page.on('console', msg => console.log('PAGE LOG:', ...msg.args));
  // await page.goto('https://www.baidu.com/');

  // await page.waitForSelector('#main')

  const result = await page.evaluate(() => {
    const data = {};
    const hotListEle = [...document.querySelectorAll('#hotcontent .l .item')];
    const tjListEle = [...document.querySelectorAll('#hotcontent .r li')];
    const rankListEle = [...document.querySelectorAll('.content')];
    const lastUpdateEle = [...document.querySelectorAll('#newscontent .l li')];
    const lastRecordEle = [...document.querySelectorAll('#newscontent .r li')];

    console.log(hotListEle);

    data.hotList = hotListEle.map((ele) => {
      const authorEle = ele.querySelector('dl > dt > span');
      const bookEle = ele.querySelector('.image a');
      return {
        poster: ele.querySelector('img').src,
        author: authorEle.innerText,
        //authorId: authorEle.href.split('.')[2].split('/')[2],
        name: bookEle.title,
        bookId: bookEle.href.split('.')[2].split('/')[1],
        brief: ele.querySelector('dl > dd').innerText,
      };
    });

    // data.tjList = tjListEle.map((ele) => {
    //   const categoryEle = ele.querySelector('span.s1');
    //   const authorEle = ele.querySelector('span.s5');
    //   const bookEle = ele.querySelector('span.s2 > a');

    //   return {
    //     category: categoryEle.innerText,
    //     author: authorEle.innerText,
    //     //authorId: authorEle.href.split('.')[2].split('/')[2],
    //     name: bookEle.innerText,
    //     bookId: bookEle.href.split('.')[2].split('/')[1],
    //   };
    // });

    // data.rankList = rankListEle.map((ele) => {
    //   const topEle = ele.querySelector('.top');
    //   const topBookEle = topEle.querySelector('.image a');
    //   return {
    //     category: ele.querySelector('h2').innerText,
    //     top: {
    //       poster: topEle.querySelector('img').src,
    //       name: topBookEle.title,
    //       bookId: topBookEle.href.split('.')[2].split('/')[1],
    //       brief: topEle.querySelector('dl > dd').innerText,
    //     },
    //     list: [...ele.querySelectorAll('ul li')].map((child) => {
    //       const bookEle = child.querySelector('a');
    //       //const authorEle = child.querySelector('a:last-child');
    //       return {
    //         author: child.lastChild.textContent.slice(1),
    //         // authorId: authorEle.href.split('.')[2].split('/')[2],
    //         name: bookEle.innerText,
    //         bookId: bookEle.href.split('.')[2].split('/')[1],
    //       };
    //     }),
    //   };
    // });

    // data.lastUpdate = lastUpdateEle.map((ele) => {
    //   const authorEle = ele.querySelector('span.s4');
    //   const bookEle = ele.querySelector('span.s2 > a');
    //   const chapterEle = ele.querySelector('span.s3 > a');
    //   const categoryEle = ele.querySelector('span.s1');
    //   return {
    //     category: categoryEle.innerText,
    //     author: authorEle.innerText,
    //     // authorId: authorEle.href.split('.')[2].split('/')[2],
    //     name: bookEle.innerText,
    //     bookId: bookEle.href.split('.')[2].split('/')[1],
    //     lastChapter: chapterEle.innerText,
    //     chapterId: chapterEle.href.split('.')[2].split('/')[2],
    //     updateTime: ele.querySelector('span.s5').innerText,
    //   };
    // });

    // data.lastRecord = lastRecordEle.map((ele) => {
    //   const authorEle = ele.querySelector('span.s5');
    //   const bookEle = ele.querySelector('span.s2 > a');
    //   const categoryEle = ele.querySelector('span.s1');
    //   return {
    //     category: categoryEle.innerText,
    //     author: authorEle.innerText,
    //     // authorId: authorEle.href.split('.')[2].split('/')[2],
    //     name: bookEle.innerText,
    //     bookId: bookEle.href.split('.')[2].split('/')[1],
    //   };
    // });

    // data.lastUpdateTitle = document.querySelector('#newscontent .l > h2').innerText;
    // data.lastRecordTitle = document.querySelector('#newscontent .r > h2').innerText;

    // data.lastRecordTitle = document.getElementById('hotcontent').textContent

    return data;
  }).catch(err => {
    console.log(err, 'err1321313')
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
  spiderForAuthor,
};
