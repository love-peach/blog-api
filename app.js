const Koa = require('koa');

const path = require('path');

const app = new Koa();
const json = require('koa-json');
const onerror = require('koa-onerror');
const koaBody = require('koa-body');
const logger = require('koa-logger');

const responseFormatter = require('./middleware/response_formatter');
const routers = require('./routers/index');

require('./dbhelper/db');

// error handler
onerror(app);

console.log(path.join(__dirname, 'public/upload/'), 121);

// middlewares
app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: path.join(__dirname, 'public/upload/'), // 设置文件上传目录
    keepExtensions: true, // 保持文件的后缀
    maxFieldsSize: 200 * 1024 * 1024, // 文件上传大小
    // onFileBegin: (name, file) => { // 文件上传前的设置
    //   console.log(`name: ${name}`);
    //   console.log(file);
    // },
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
