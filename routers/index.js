const router = require('koa-router')();

const home = require('./home');
const user = require('./user');
const blog = require('./blog');
const tag = require('./tag');
const category = require('./category');
const upload = require('./upload');
const resource = require('./resource');
const resourceType = require('./resourceType');
const comment = require('./comment');
const reply = require('./reply');
const ebook = require('./ebook');

router.prefix('/api');

router.use('', home.routes(), home.allowedMethods());
router.use('/users', user.routes(), user.allowedMethods());
router.use('/blogs', blog.routes(), blog.allowedMethods());
router.use('/comments', comment.routes(), comment.allowedMethods());
router.use('/replys', reply.routes(), reply.allowedMethods());
router.use('/categories', category.routes(), category.allowedMethods());
router.use('/tags', tag.routes(), tag.allowedMethods());
router.use('/upload', upload.routes(), upload.allowedMethods());
router.use('/resources', resource.routes(), resource.allowedMethods());
router.use('/resourceTypes', resourceType.routes(), resourceType.allowedMethods());
router.use('/ebooks', ebook.routes(), ebook.allowedMethods());

module.exports = router;
