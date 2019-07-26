const router = require('koa-router')();

const urlPrefix = 'localhost:3000/api';

router.get('/', async (ctx) => {
  ctx.body = {
    upload_url: `${urlPrefix}/upload`,
    users_url: `${urlPrefix}/users`,
    blogs_url: `${urlPrefix}/blogs`,
    categories_url: `${urlPrefix}/categories`,
    tags_url: `${urlPrefix}/tags`,
    resourcesType_url: `${urlPrefix}/resources_types`,
    resources_url: `${urlPrefix}/resources`,
    comments_url: `${urlPrefix}/comments`,
    replys_url: `${urlPrefix}/replys`,
    ebook: `${urlPrefix}/ebook`,
  };
});

module.exports = router;
