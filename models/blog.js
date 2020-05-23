const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const mongoosePaginate = require('../plugins/mongoose-paginate');

const schema = new mongoose.Schema({
  title: {
    type: String,
    unique: true,
    required: [true, '必填字段'],
  }, // 标题
  author: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, '必填字段'],
    ref: 'User',
  },
  content: {
    type: String,
    required: [true, '必填字段'],
  },
  poster: {
    type: String,
    // required: [true, '必填字段'],
  }, // 海报
  tag: [{
    type: mongoose.Schema.Types.ObjectId,
    required: [true, '必填字段'],
    ref: 'Tag',
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, '必填字段'],
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
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  downloadTimes: { // 下载次数
    type: Number,
    default: 0,
  },
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  toJSON: { virtuals: true },
});

schema.virtual('authorObj', {
  ref: 'User',
  localField: 'author',
  foreignField: '_id',
  justOne: true,
});

schema.virtual('likesArray', {
  ref: 'User',
  localField: 'likes',
  foreignField: '_id',
  justOne: true,
});


schema.virtual('categoryObj', {
  ref: 'Category',
  localField: 'category',
  foreignField: '_id',
  justOne: true,
});

schema.virtual('tagArray', {
  ref: 'Tag',
  localField: 'tag',
  foreignField: '_id',
  justOne: false,
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
schema.plugin(uniqueValidator);

module.exports = mongoose.model('Blog', schema);
