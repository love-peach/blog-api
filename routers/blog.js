const router = require('koa-router')();
const blogController = require('../controllers/blog');

// 查
router.get('/', blogController.find);

// 查 动态路由
router.get('/:id', blogController.detail);

// 增
router.post('/', blogController.add);

// 改
router.put('/:id', blogController.update);

// 删
router.del('/:id', blogController.delete);

module.exports = router;
