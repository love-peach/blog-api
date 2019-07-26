const router = require('koa-router')();
const controller = require('../controllers/ebook');


// 首页数据 返回各分类下排名前10书，上周强推9，本周强推前4
router.get('/', controller.home);

// 按分类查书名
router.get('/category/:categoryType', controller.category);

// 按关键字查书名
router.get('/search', controller.search);


// 排行榜
router.get('/rank', controller.rank);

// 排行榜 完本
router.get('/rank/finish', controller.rankFinish);

// 查 根据 id 查书详情 包括 书名，作者，连载状态，简介，章节目录
router.get('/info/:bookId', controller.info);

// 查看章节 bookId: 书名；chapterId: 章节；
router.get('/chapter/:bookId/:chapterId', controller.chapter);

module.exports = router;
