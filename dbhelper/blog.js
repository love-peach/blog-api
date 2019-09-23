const Model = require('../models/blog');

// TODO: 此文件中最好返回 Promise。通过 .exec() 可以返回 Promise。
// 需要注意的是 分页插件本身返回的就是 Promise 因此 Model.paginate 不需要 exec()。
// Model.create 返回的也是 Promise

const populateObj = [
  {
    path: 'authorObj',
    select: 'userName avatar',
  },
  {
    path: 'categoryObj',
    select: 'name value',
  },
  {
    path: 'tagArray',
    select: 'name value',
  },
  {
    path: 'likesArray',
    select: 'userName avatar',
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
    keyword, title, category, author, tag, likes, status = true, page = 1, limit = 10, sort = '-createdAt',
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

  if (title) {
    query.title = { $regex: new RegExp(title, 'i') };
  }

  if (category) {
    query.category = category;
  }

  if (tag) {
    const objType = Object.prototype.toString.call(tag);
    if (objType === '[object Array]') {
      query.tag = { $all: tag };
      // query.tag = { $elemMatch: { $in: tag } };
    } else {
      query.tag = { $elemMatch: { $eq: tag } };
    }
  }

  if (likes) {
    query.likes = { $elemMatch: { $eq: likes } };
  }

  if (author) {
    query.author = author;
  }

  // 关键字模糊查询 标题 和 content
  if (keyword) {
    const reg = new RegExp(keyword, 'i');
    const fuzzyQueryArray = [{ content: { $regex: reg } }];
    if (!title) {
      fuzzyQueryArray.push({ title: { $regex: reg } });
    }
    query.$or = fuzzyQueryArray;
  }

  return Model.paginate(query, options);
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
  console.log(data, 'data');
  return Model.findOneAndUpdate({ _id: id }, {
    ...restData,
  }, {
    new: true, // 返回修改后的数据
  }).exec();
};

/**
 * 浏览次数 +1
 */
exports.viewCountIncrement = id => Model.findOneAndUpdate({ _id: id }, { $inc: { viewed: 1 } }, {
  new: true,
}).exec();

/**
 * 喜欢
 */
// TODO: 当更新一个不存在的 合法id 时，会返回 204
exports.like = (data) => {
  const { blogId, userId } = data;
  return Model.findOneAndUpdate({ _id: blogId }, {
    $push: {
      likes: userId,
    },
  }, {
    new: true, // 返回修改后的数据
  }).exec();
};

/**
 * 取消喜欢
 */
// TODO: 当更新一个不存在的 合法id 时，会返回 204
exports.unlike = (data) => {
  const { blogId, userId } = data;
  return Model.findOneAndUpdate({ _id: blogId }, {
    $pull: {
      likes: userId,
    },
  }, {
    new: true, // 返回修改后的数据
  }).exec();
};

/**
 * 删除
 */
exports.delete = id => Model.findByIdAndDelete(id).exec();
