const mongoose = require('mongoose');
const mongoosePaginate = require('../plugins/mongoose-paginate');

const schema = new mongoose.Schema({
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: [true, '评论 blogId 必须'],
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '评论 from 必须'],
  },
  content: {
    type: String,
    required: [true, '评论 content 必须'],
  },
  status: {
    type: Boolean,
    default: false,
  }, // 状态
  reply: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reply',
  }],
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  toJSON: { virtuals: true },
});

schema.virtual('blogObj', {
  ref: 'Blog',
  localField: 'blogId',
  foreignField: '_id',
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

module.exports = mongoose.model('Comment', schema);
