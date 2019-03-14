# 博客后台API

这是一个用 `node` `koa2` `mongodb` `pm2` 搭建的纯后台项目，只提供 `API` 接口。

目标：实现一个符合 `restful api` 风格的后台。

技术拆解：

- `es6+` 采用最新的 JS 语法编写。
- `node` 列一下
- `koa2` 启服务
- `mongodb` 数据库
- `pm2` 保持启动

## 启动项目

首先，启动数据库 `mongod`，接着另启一个终端，输入 `mongo` 若有反应 证明数据库启动成功。

然后，启动这个后台项目 `npm run dev`；

## 简单测试接口

```sh
curl -H 'Content-Type: application/json' -X POST -d '{"title":"新增一篇博客","author":"机器人"}' http://localhost:3000/api/blogs
```

## 目录结构

```sh
.
├── bin/-----------------启动目录
├── config/--------------配置文件
├── controllers/---------controller层
├── dbhelper/------------数据库的增删查改方法
├── error/---------------错误表
├── middleware/----------中间件
├── models/--------------models层
├── plugins/-------------插件 数据库分页插件等
├── routers/-------------路由
├── util/----------------工具方法
├── .editorconfig--------统一编辑器格式
├── .eslintrc.js---------eslint
├── .gitignore-----------忽略文件
├── app.js---------------入口文件
├── package.json---------项目依赖配置
└── README.md------------项目说明
```

## 收获

### express koa koa2 之间的不同点。

之前有用 express 写过类似的 demo ，这次一边学习，一边做博客，对这些发展有一些认识。

**相同之处**

首先，这三个都是构建 web 服务的 node 框架，基础的 api 语法 写法几乎相同，而且都是 AJ 大神 （不查不知道，一查吓一跳，厉害）主导设计的。

**不同之处**

我对于这三个框架的不同之处，认识最大的一点就是异步任务的写法上的不同。其实，这也同步的映射了 js 语法，在异步上的不同。

`express` 通过回调嵌套 `callback()` 或者 `Promise` 对象实现异步任务，这同时对应了 `es5`。

> Promise 它由社区最早提出和实现，ES6 将其写进了语言标准

所以，我认为 `es5` 时期，已经可以使用 `Promise`。

```js
// callback
fs.readFile(fileA, 'utf-8', function (err, data) {
  console.log(data.toString());
  fs.readFile(fileB, 'utf-8', function (err, data) {
    console.log(data.toString());
  });
});

// Promise
var readFile = require('fs-readfile-promise');

readFile(fileA)
.then(function (data) {
  console.log(data.toString());
})
.then(function () {
  return readFile(fileB);
})
.then(function (data) {
  console.log(data.toString());
})
.catch(function (err) {
  console.log(err);
});
```

> 可以看到，Promise 的写法只是回调函数的改进，使用then方法以后，异步任务的两段执行看得更清楚了。

`koa` 通过 `Generator` 函数 以及 `yield` 表达式 实现异步, 这同时对应了 `es6`。

```js
function* taskGenerator() {
  yield 'task1';
  yield 'task2';
  return 'ending';
}

var taskG = taskGenerator();

taskG.next()
// { value: 'task1', done: false }

taskG.next()
// { value: 'task2', done: false }

taskG.next()
// { value: 'ending', done: true }

taskG.next()
// { value: undefined, done: true }
```

可以看到 Generator + yield 的方式需要手动的一步一步去执行下去，不太方便，因此，一般需要某种可以自动执行流程的`执行器`，搭配着一起使用。比如 `Thunk 函数` 和 [co 模块](https://github.com/tj/co) 模块。

```js
const fs = require('fs');

const readFile = function (fileName) {
  return new Promise(function (resolve, reject) {
    fs.readFile(fileName, function(error, data) {
      if (error) return reject(error);
      resolve(data);
    });
  });
};

const gen = function* () {
  const f1 = yield readFile('/etc/fstab');
  const f2 = yield readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};
```

```js
var gen = function* () {
  var f1 = yield readFile('/etc/fstab');
  var f2 = yield readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};

var co = require('co');
co(gen);
```

`koa2` 通过 `async` `await` 实现异步，这同时对应着 `es7`

```js
const asyncReadFile = async function () {
  const f1 = await readFile('/etc/fstab');
  const f2 = await readFile('/etc/shells');
  console.log(f1.toString());
  console.log(f2.toString());
};
```

> 它就是 Generator 函数的语法糖。

### RESTful API

> REST全称是Representational State Transfer，中文意思是表述（编者注：通常译为表征）性状态转移。

要实现 `RESTful API` 非常简单，只有满足一些特定的 `约束条件` 和 `原则`。

我自己对于 restful 风格的认识，更加粗暴：通过 `get`、`post`、`put`、`delete`，请求方式，实现数据库的 `增`、`删`、`查`、`改`。

我认为它的约定大于它的定义，使得 api 在设计上有了一定的规范和原则，语义更加明确，清晰。

参考 [githut api](https://api.github.com/)

### mongoose exec() 与 then() 区别

之所以将它们写在一起，是因为在查询的时候，好像 `Modal.find().then()` 和 `Modal.find().exec()` 好像都可以。但到底是用 `exex` 还是 `then` 呢？这就需要对这两个方法有所了解。

mongoose 的所有查询操作返回的结果都是 `query` ，mongoose 封装的一个对象，并非一个完整的 promise，而且与 ES6 标准的 promise 有所出入，因此在使用 mongoose 的时候，一般加上这句 `mongoose.Promise = global.Promise;`。回到问题，因为 `query` 也是一个不完整的 promise 因此，可以使用 `.then()` 方法。而 `exec()` 会返回一个完整的 Promise 对象。

而且，在本项目中，约定在有关数据操作的方法中 也就是 `/dbhelper/` 文件中的方法，都返回 `.exec()` 之后的 Promise。

*需要注意的是 分页插件本身返回的就是 Promise 因此 Model.paginate 不需要 exec()。*

*Model.create 返回的也是 Promise 不需要 exec()*

## 参考资料

[es6](http://es6.ruanyifeng.com/)

[koa官网](https://koajs.com/)

[koa中文网站](https://koa.bootcss.com/)

[廖雪峰koa简介](https://www.liaoxuefeng.com/wiki/001434446689867b27157e896e74d51a89c25cc8b43bdb3000/001434501579966ab03decb0dd246e1a6799dd653a15e1b000)

[廖雪峰REST介绍](https://www.liaoxuefeng.com/wiki/001434446689867b27157e896e74d51a89c25cc8b43bdb3000/001473590199114b8523ba038dd4359a16ad0bbd3c8a1f2000)

[狼叔-桑世龙koa-generator](https://github.com/17koa/koa-generator/)

[「新手向」koa2从起步到填坑](https://www.jianshu.com/p/6b816c609669)

[koa+mongoose实现简单增删改查接口](https://www.cnblogs.com/junhua/p/7714572.html)

[Mongoose全面理解](https://www.cnblogs.com/jayruan/p/5123754.html)

[mongoose-paginate](https://github.com/edwardhotchkiss/mongoose-paginate)

[RESTful API 最佳实践](http://www.ruanyifeng.com/blog/2018/10/restful-api-best-practices.html)

