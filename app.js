const Koa = require('koa');

const path = require('path');

const app = new Koa();
const json = require('koa-json');
const onerror = require('koa-onerror');
const koaBody = require('koa-body');
const logger = require('koa-logger');

const responseFormatter = require('./middleware/response_formatter');
const routers = require('./routers/index');

const { getUploadDirName, checkDirExist } = require('./util/upload-helper');

require('./dbhelper/db');

// error handler
onerror(app);

// middlewares
app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, 'public/upload/'), // 设置文件上传目录 后期可以改成缓存目录
    keepExtensions: true, // 保持文件的后缀
    maxFieldsSize: 1 * 1024 * 1024, // 文件上传大小
    onFileBegin: (name, file) => { // 文件上传前的设置
      // 最终要保存到的文件夹目录
      const dir = path.join(__dirname, `public/upload/${getUploadDirName(file.type)}`);
      // 检查文件夹是否存在如果不存在则新建文件夹
      checkDirExist(dir);
      // 重新覆盖 file.path 属性
      // eslint-disable-next-line
      file.path = `${dir}/${file.name}`;
    },
  },
}));
app.use(json());
app.use(logger());

// logger
// app.use(async (ctx, next) => {
//   const start = new Date();
//   await next();
//   const ms = new Date() - start;
//   console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
// });

// response formatter
app.use(responseFormatter('/api'));

// routers
app.use(routers.routes()).use(routers.allowedMethods());

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx);
});

module.exports = app;
