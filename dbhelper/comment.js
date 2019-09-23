const Model = require('../models/comment');

// TODO: 此文件中最好返回 Promise。通过 .exec() 可以返回 Promise。
// 需要注意的是 分页插件本身返回的就是 Promise 因此 Model.paginate 不需要 exec()。
// Model.create 返回的也是 Promise

const populateObj = [
  {
    path: 'blogObj',
    select: 'title',
  },
  {
    path: 'from',
    select: 'userName avatar',
    match: { userName: 'admin' },
  },
  {
    path: 'reply',
    populate: [
      {
        path: 'from',
        select: 'userName avatar',
      },
      {
        path: 'to',
        select: 'userName avatar',
      },
    ],
  },
];

/**
 * 查找全部
 */
exports.findAll = () => Model.find().populate(populateObj).exec();

/**
 * 查找多个 筛选
 */
exports.findSome = (data) => {
  const {
    blogId, from, content, status = true, page = 1, limit = 10, sort = '-createdAt',
  } = data;
  const query = {};
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: sort || '-createdAt',
    populate: populateObj,
  };

  if (status !== 'all') {
    query.status = status === true || status === 'true';
  }

  if (blogId) {
    query.blogId = blogId;
  }

  if (from) {
    query.from = from;
  }

  if (content) {
    query.content = { $regex: new RegExp(content, 'i') };
  }

  const result = Model.paginate(query, options);

  return result;
};

/**
 * 查找单个 详情
 */
exports.findById = id => Model.findById(id).populate(populateObj).exec();

/**
 * 新增
 */
exports.add = data => Model.create(data);

/**
 * 更新
 */
// TODO: 当更新一个不存在的 合法id 时，会返回 204
exports.update = (data) => {
  const { id, ...restData } = data;
  return Model.findOneAndUpdate({ _id: id }, {
    ...restData,
  }, {
    new: true, // 返回修改后的数据
  }).exec();
};


/**
 * 更新回复 reply。当新增一条回复时，更新评论的 reply。
 */
// TODO: 当更新一个不存在的 合法id 时，会返回 204
exports.updateReply = (data) => {
  const { commentId, replyId } = data;
  return Model.findOneAndUpdate({ _id: commentId }, {
    $push: {
      reply: replyId,
    },
  }, {
    new: true, // 返回修改后的数据
  }).exec();
};


/**
 * 删除回复 reply。当删除一条回复时，更新评论的 reply。
 */
// TODO: 当更新一个不存在的 合法id 时，会返回 204
exports.deleteReply = (data) => {
  const { commentId, replyId } = data;
  return Model.findOneAndUpdate({ _id: commentId }, {
    $pull: {
      reply: replyId,
    },
  }, {
    new: true, // 返回修改后的数据
  }).exec();
};

/**
 * 删除
 */
exports.delete = id => Model.findByIdAndDelete(id).exec();
