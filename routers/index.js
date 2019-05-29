const router = require('koa-router')();

const home = require('./home');
const user = require('./user');
const blog = require('./blog');
const tag = require('./tag');
const category = require('./category');
const upload = require('./upload');

router.prefix('/api');

router.use('', home.routes(), home.allowedMethods());
router.use('/users', user.routes(), user.allowedMethods());
router.use('/blogs', blog.routes(), blog.allowedMethods());
router.use('/categories', category.routes(), category.allowedMethods());
router.use('/tags', tag.routes(), tag.allowedMethods());
router.use('/upload', upload.routes(), upload.allowedMethods());

module.exports = router;
