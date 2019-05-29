const mongoose = require('mongoose');
const mongoosePaginate = require('../plugins/mongoose-paginate');

const schema = new mongoose.Schema({
  path: {
    type: String,
    required: [true, '文件 路径 必须'],
  },
  name: {
    type: String,
    required: [true, '文件 名字 必须'],
  },
  status: { // 上架状态
    type: Boolean,
    default: true,
  },
  remark: String,
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
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

module.exports = mongoose.model('Upload', schema);
