const router = require('koa-router')();
const controller = require('../controllers/resourceType');

// 查
router.get('/', controller.find);

// 查 动态路由
router.get('/:id', controller.detail);

// 增
router.post('/', controller.add);

// 改
router.put('/:id', controller.update);

// 删
router.del('/:id', controller.delete);

module.exports = router;
