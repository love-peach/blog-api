const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');
const mongoosePaginate = require('../plugins/mongoose-paginate');
const tool = require('../util/tool');

const SALT_WORK_FACTOR = 10;

const schema = new mongoose.Schema({
  userName: {
    type: String,
    unique: true,
    required: [true, '必填字段'],
  }, // 账户名
  nicName: String, // 昵称
  password: {
    type: String,
    required: [true, '必填字段'],
  }, // 密码
  email: {
    type: String,
    unique: true,
    match: [tool.validatorsExp.email, '邮箱格式不正确'],
    required: [true, '必填字段'],
  }, // 邮箱
  phone: {
    type: String,
    unique: true,
    match: [tool.validatorsExp.phone, '手机号码格式不正确'],
  }, // 手机号
  avatar: String, // 头像 跟 upload 的 path 关联
  briefDesc: String, // 个人说明
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  toJSON: { virtuals: true },
});

schema
  .virtual('avatarUrl')
  .get(function () {
    return this.avatar ? `${this.avatar}` : '';
  });

// 自动增加版本号
/* Mongoose 仅在您使用时更新版本密钥save()。如果您使用update()，findOneAndUpdate()等等，Mongoose将不会 更新版本密钥。
作为解决方法，您可以使用以下中间件。参考 https://mongoosejs.com/docs/guide.html#versionKey */

schema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate();
  if (update.__v != null) {
    delete update.__v;
  }
  const keys = ['$set', '$setOnInsert'];
  Object.keys(keys).forEach((key) => {
    if (update[key] != null && update[key].__v != null) {
      delete update[key].__v;
      if (Object.keys(update[key]).length === 0) {
        delete update[key];
      }
    }
  });
  update.$inc = update.$inc || {};
  update.$inc.__v = 1;
});


// 在给 schema 添加方法时，不能用 箭头函数，否则会造成上下文绑定的问题！
schema.pre('save', function (next) {
  const user = this;
  const hash = bcrypt.hashSync(user.password, SALT_WORK_FACTOR);
  user.password = hash;
  next();
});

schema.statics.getPasswordHash = function (password) {
  return bcrypt.hashSync(password, SALT_WORK_FACTOR);
};

// 实现登录验证时的密码验证
schema.statics.comparePassword = function (_password, password) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(_password, password, (err, isMatch) => {
      if (!err) resolve(isMatch);
      else reject(err);
    });
  });
};

schema.plugin(mongoosePaginate);
schema.plugin(uniqueValidator);

module.exports = mongoose.model('User', schema);
