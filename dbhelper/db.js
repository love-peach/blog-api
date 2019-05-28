const mongoose = require('mongoose');
const config = require('../config');

mongoose.Promise = global.Promise;

/**
 * 连接
 */
mongoose.connect(config.database, {
  useNewUrlParser: true,
  config: {
    autoIndex: false,
  },
});

/**
 * 连接成功
 */
mongoose.connection.on('connected', () => {
  console.log(`Mongoose 已连接数据库 ${config.database}`);
});

/**
 * 连接异常
 */
mongoose.connection.on('error', (err) => {
  console.log(`Mongoose 连接出错: ${err}`);
});

/**
 * 连接断开
 */
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose 连接关闭');
});

module.exports = mongoose;
