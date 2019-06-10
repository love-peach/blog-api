const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const mongoosePaginate = require('../plugins/mongoose-paginate');

const schema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
    required: [true, '文章 title 必须'],
  }, // 标题
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, '文章 author 必须'],
    ref: 'User',
  },
  content: {
    type: String,
    required: [true, '文章 content 必须'],
  },
  poster: String, // 海报
  tag: [{
    type: mongoose.Schema.Types.ObjectId,
    required: [true, '文章 tagValue 必须'],
    ref: 'Tag',
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, '文章 categoryValue 必须'],
    ref: 'Category',
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
  }],
  status: {
    type: Boolean,
    default: true,
  }, // 状态
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

schema
  .virtual('posterUrl')
  .get(function () {
    return `https://${this.poster}`;
  });

schema.virtual('posterObj', {
  ref: 'Upload',
  localField: 'poster',
  foreignField: 'path',
  justOne: true,
});


// schema.virtual('categoryObj', {
//   ref: 'Category',
//   localField: 'categoryValue',
//   foreignField: 'value',
//   justOne: true,
// });

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
schema.plugin(uniqueValidator);

module.exports = mongoose.model('Blog', schema);
