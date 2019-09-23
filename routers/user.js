const router = require('koa-router')();
const controller = require('../controllers/user');

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

// 用户注册
router.post('/changePwd', controller.changePwd);

// 用户注册
router.post('/signup', controller.signUp);

// 用户登录
router.post('/signin', controller.signIn);

// 用户登出
router.post('/signout', controller.signOut);

module.exports = router;
