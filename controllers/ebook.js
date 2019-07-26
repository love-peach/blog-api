const {
  spiderForHome, spiderForSearch, spiderForInfo, spiderForChapter, spiderForCategory, spiderForRank,
} = require('../util/puppeteer-ebook');

/**
 * 首页数据 返回各分类下排名前10书，上周强推9，本周强推前4
 */
exports.home = async (ctx) => {
  const url = 'https://www.qu.la/';
  const result = await spiderForHome(url);
  ctx.body = result;
};

/**
 * 按分类查书名
 */
exports.category = async (ctx) => {
  const { categoryType } = ctx.params;
  const origin = 'https://www.qu.la/';
  const url = `${origin}/${categoryType}`;
  const result = await spiderForCategory(url);
  ctx.body = result;
};

/**
 * 按关键字查书名
 */
exports.search = async (ctx) => {
  const reqQuery = ctx.request.query;
  const origin = 'https://sou.xanbhx.com/search';
  const defaultQuery = 'siteid=qula';
  const wdQuery = encodeURIComponent(reqQuery.wd);
  const url = `${origin}?${defaultQuery}&q=${wdQuery}`;
  const result = await spiderForSearch(url);
  ctx.body = result;
};


/**
 * 排行榜
 */
exports.rank = async (ctx) => {
  const url = 'https://www.qu.la/paihangbang/';
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
  const origin = 'https://www.qu.la/book';
  const url = `${origin}/${bookId}`;
  const result = await spiderForInfo(url);
  ctx.body = result;
};

/**
 * 查看章节 bookId: 书名；chapterId: 章节；
 */
exports.chapter = async (ctx) => {
  const { bookId, chapterId } = ctx.params;
  const origin = 'https://www.qu.la/book';
  const url = `${origin}/${bookId}/${chapterId}.html`;
  const result = await spiderForChapter(url);
  ctx.body = result;
};
