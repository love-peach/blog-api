const router = require('koa-router')();

const home = require('./home');
const blog = require('./blog');

router.prefix('/api');

router.use('/', home.routes(), home.allowedMethods());
router.use('/blogs', blog.routes(), blog.allowedMethods());

module.exports = router;
