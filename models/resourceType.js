const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const mongoosePaginate = require('../plugins/mongoose-paginate');

const schema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, '资源 name 必须'],
  },
  status: {
    type: Boolean,
    default: true,
  },
  rank: {
    type: Number,
    default: 0,
  },
  resource: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
  }],
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
});

// schema.virtual('resourceArray', {
//   ref: 'Resource',
//   localField: 'resource',
//   foreignField: '_id',
//   justOne: false,
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

module.exports = mongoose.model('ResourceType', schema);
