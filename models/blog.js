const mongoose = require('mongoose');
const mongoosePaginate = require('../plugins/mongoose-paginate');

const schema = new mongoose.Schema({
  title: String, // 标题
  author: String, // 作者
  content: String, // 原数据
  poster: String, // 海报
  tag: Array, // 标签
  // tagArr: Array, // 标签-数组
  category: String, // 分类
  categoryName: String, // 分类-显示
  status: String, // 状态
  statusName: String, // 状态-显示
  viewed: { // 浏览过
    type: Number,
    default: 0,
  },
  likeCount: { // 喜欢
    type: Number,
    default: 0,
  },
  commentCount: { // 评论数
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
  offState: { // 上架状态
    type: Boolean,
    default: true,
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
});

schema.plugin(mongoosePaginate);
// mongoosePaginate(schema);

module.exports = mongoose.model('Blog', schema);
