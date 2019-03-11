const router = require('koa-router')();

router.get('/', async (ctx) => {
  ctx.body = { name: '123' };
});

module.exports = router;
