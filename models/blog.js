const mongoose = require('mongoose');

const mongoosePaginate = require('../plugins/mongoose-paginate');

const schema = new mongoose.Schema({
  title: String, // 标题
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }, // 作者
  content: String, // 原数据
  poster: String, // 海报
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
  }], // 标签
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }, // 分类
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  status: String, // 状态
  viewed: { // 浏览过
    type: Number,
    default: 0,
  },
  likes: {
    type: Array,
    default: [],
  },
  downloadTimes: { // 下载次数
    type: Number,
    default: 0,
  },
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

schema.virtual('posterObj', {
  ref: 'Upload',
  localField: 'poster',
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

module.exports = mongoose.model('Blog', schema);
