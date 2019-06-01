const mongoose = require('mongoose');
const mongoosePaginate = require('../plugins/mongoose-paginate');
const tool = require('../util/tool');

const schema = new mongoose.Schema({
  userName: String, // 用户名
  password: String, // 密码
  phone: {
    type: String,
    match: [tool.validatorsExp.phone, '手机号码格式不正确'],
  }, // 手机号
  email: {
    type: String,
    match: [tool.validatorsExp.email, '邮箱格式不正确'],
  }, // 邮箱
  avatar: String, // 头像 跟 upload 的 path 关联
  createdAt: { // 创建日期
    type: Date,
    default: Date.now(),
  },
  updatedAt: { // 更新日期
    type: Date,
    default: Date.now(),
  },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  toJSON: { virtuals: true },
});

schema.virtual('avatarObj', {
  ref: 'Upload',
  localField: 'avatar',
  foreignField: 'path',
  justOne: true,
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

schema.plugin(mongoosePaginate);

module.exports = mongoose.model('User', schema);
