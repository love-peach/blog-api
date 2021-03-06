
const {
  spiderForHome, spiderForSearch, spiderForInfo, spiderForChapter, spiderForCategory, spiderForRank, spiderForAuthor,
} = require('../util/puppeteer-ebook');

// const ebookOrigin = 'https://www.52bqg.com/';
const ebookOrigin = 'http://www.shuquge.com/';

/**
 * 首页数据 返回各分类下排名前10书，上周强推9，本周强推前4
 */
exports.home = async (ctx) => {
  const url = ebookOrigin;
  const result = await spiderForHome(url);
  ctx.body = result;
};

/**
 * 按分类查书名
 */
exports.category = async (ctx) => {
  const { categoryType } = ctx.params;
  // http://www.shuquge.com/category/1_1.html
  const url = `${ebookOrigin}category/${categoryType}.html`;
  const result = await spiderForCategory(url);
  ctx.body = result;
};

/**
 * 按关键字查书名
 */
exports.search = async (ctx) => {
  const reqQuery = ctx.request.query;
  const value = reqQuery.wd;
  // http://www.shuquge.com/search.php

  const result = await spiderForSearch(`${ebookOrigin}search.php`, value);
  ctx.body = result;
};


/**
 * 排行榜
 */
exports.rank = async (ctx) => {
  // http://www.shuquge.com/top.html
  const url = `${ebookOrigin}top.html`;
  const result = await spiderForRank(url);
  ctx.body = result;
};

/**
 * 排行榜 完本
 */
exports.rankFinish = async (ctx) => {
  const url = 'https://www.qu.la/wanbenxiaoshuo/';
  const result = await spiderForRank(url);
  ctx.body = result;
};

/**
 * 查 根据 id 查书详情 包括 书名，作者，连载状态，简介，章节目录
 */
exports.info = async (ctx) => {
  const { bookId } = ctx.params;
  // http://www.shuquge.com/txt/63542/index.html
  const url = `${ebookOrigin}txt/${bookId}/index.html`;
  const result = await spiderForInfo(url);
  ctx.body = result;
};

/**
 * 查看章节 bookId: 书名；chapterId: 章节；
 */
exports.chapter = async (ctx) => {
  const { bookId, chapterId } = ctx.params;
  // http://www.shuquge.com/txt/63542/9645082.html
  const url = `${ebookOrigin}txt/${bookId}/${chapterId}.html`;
  const result = await spiderForChapter(url);
  ctx.body = result;
};


/**
 * 查看章节 bookId: 书名；chapterId: 章节；
 */
exports.author = async (ctx) => {
  const { authorId } = ctx.params;
  const origin = 'http://www.bequge.cc/';
  const url = `${origin}author/${authorId}/`;
  const result = await spiderForAuthor(url);
  ctx.body = result;
};
