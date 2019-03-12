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
curl -H 'Content-Type: application/json' -X POST -d '{"title":"新增一篇博客","author":"机器人"}' http://localhost:3000/api/blog
```

## 目录结构

```sh
.
├── bin/-----------------启动目录
├── config/--------------配置文件
├── controllers/---------controller层
├── dbhaper/-------------数据库的增删查改方法
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
