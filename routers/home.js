const router = require('koa-router')();

router.get('/', async (ctx) => {
  ctx.body = {
    blogs_url: 'localhost:3000/api/blogs',
  };
});

module.exports = router;
