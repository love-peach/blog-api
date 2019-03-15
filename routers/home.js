const router = require('koa-router')();

const urlPrefix = 'localhost:3000/api';

router.get('/', async (ctx) => {
  ctx.body = {
    users_url: `${urlPrefix}/users`,
    blogs_url: `${urlPrefix}/blogs`,
    categories_url: `${urlPrefix}/categories`,
    tags_url: `${urlPrefix}/tags`,
    resources_url: `${urlPrefix}/resources`,
  };
});

module.exports = router;
