const router = require('koa-router')();

const home = require('./home');
const blog = require('./blog');
const tag = require('./tag');

router.prefix('/api');

router.use('', home.routes(), home.allowedMethods());
router.use('/blogs', blog.routes(), blog.allowedMethods());
router.use('/tags', tag.routes(), tag.allowedMethods());

module.exports = router;
