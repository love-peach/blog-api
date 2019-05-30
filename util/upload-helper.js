const fs = require('fs');

/**
 * @description 生成文件夹名称
 */
exports.getUploadDirName = () => {
  const date = new Date();
  let month = Number.parseInt(date.getMonth(), 10) + 1;
  month = month.toString().length > 1 ? month : `0${month}`;
  const dir = `${date.getFullYear()}${month}${date.getDate()}`;
  return dir;
};

/**
 * @description 检查文件夹路径是否存在，如果不存在则创建文件夹
 */
exports.checkDirExist = (p) => {
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p);
  }
};
