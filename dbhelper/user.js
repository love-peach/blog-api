const Model = require('../models/user');
const ApiError = require('../error/api_error');

// TODO: 此文件中最好返回 Promise。通过 .exec() 可以返回 Promise。
// 需要注意的是 分页插件本身返回的就是 Promise 因此 Model.paginate 不需要 exec()。
// Model.create 返回的也是 Promise

const populateObj = [
  // {
  //   path: 'avatarObj',
  //   select: 'path name',
  // },
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
    page = 1, limit = 10, sort = '-createdAt',
  } = data;
  const query = {};
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: sort || '-createdAt',
    populate: populateObj,
  };

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
 * 注册
 */
exports.signUp = (data) => {
  const { userName } = data;

  return new Promise((resolve, reject) => {
    Model.findOne({ userName })
      .then((res) => {
        if (res) {
          reject(new ApiError('UserExist', '用户名已存在'));
        } else {
          resolve(Model.create(data));
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * 登录
 */
exports.signIn = async (data) => {
  const user = await Model.findOne({ userName: data.userName }).exec();
  if (user) {
    const isMatch = await Model.comparePassword(data.password, user.password);
    if (isMatch) {
      return user._doc;
    }
    // return isMatch;
    throw new ApiError('PasswordNotMatch', '账号或密码不匹配');
  }
  throw new ApiError('UserNotExist', '用户名不存在');
};

/**
 * 更新
 */
// TODO: 当更新一个不存在的 合法id 时，会返回 204
exports.update = (data) => {
  const { id, password, ...restData } = data;
  // 更新的时候 不会触发 pre('save') 中间件 所以需要手动生成一个新的加密 hash 保存起来
  const newData = {
    ...restData,
  };
  if (password) {
    newData.password = Model.getPasswordHash(password);
  }
  return Model.findOneAndUpdate({ _id: id }, newData, {
    new: true, // 返回修改后的数据
  }).exec();
};

/**
 * 删除
 */
exports.delete = id => Model.findByIdAndDelete(id).exec();
