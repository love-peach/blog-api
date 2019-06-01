const fs = require('fs');
const path = require('path');
const COS = require('cos-nodejs-sdk-v5');
const cosConfig = require('../config/cos.config');
const tool = require('../util/tool');

// 使用永久密钥创建实例
const cos = new COS({
  SecretId: cosConfig.SecretId,
  SecretKey: cosConfig.SecretKey,
});

/**
 * @description 检查文件类型 是不是允许的类型
 */
const checkFileType = fileType => cosConfig.allowFileTypes.includes(fileType);

/**
 * @description 生成文件分类的文件夹名称
 */
const getFileTypeDir = (fileType) => {
  let fileDirName = 'files';
  cosConfig.fileDirNames.forEach((item) => {
    if (fileType.indexOf(item) > -1) {
      fileDirName = item;
    }
  });
  return fileDirName;
};

/**
 * @description 生成文件夹名称
 */
const getFileDateDir = () => {
  const date = new Date();
  let month = Number.parseInt(date.getMonth(), 10) + 1;
  month = month.toString().length > 1 ? month : `0${month}`;
  const day = date.getDate() > 10 ? date.getDate() : `0${date.getDate()}`;
  const dir = `${date.getFullYear()}${month}${day}`;
  return dir;
};

/**
 * @description 生成文件夹名称
 */
const getUploadDirName = fileType => `${getFileTypeDir(fileType)}/${getFileDateDir()}`;

/**
 * @description 检查文件夹路径是否存在，如果不存在则创建文件夹 递归创建目录 同步方法
 */
const checkDirExist = (dirname) => {
  if (fs.existsSync(dirname)) {
    return true;
  }
  if (checkDirExist(path.dirname(dirname))) {
    fs.mkdirSync(dirname);
    return true;
  }
  return true;
};

/**
 * @description 腾讯云对象存储
 */
const uploader = async (ctx) => {
  const params = ctx.request.body;
  const { file } = ctx.request.files;

  const fileKey = !tool.isEmptyObject(params) && params.isAvatar.toString() === 'true' ? `/avatar/${file.name}` : `/${getUploadDirName(file.type)}/${file.name}`;

  return new Promise((resolve, reject) => {
    cos.sliceUploadFile({
      Bucket: cosConfig.bucketName,
      Region: cosConfig.bucketRegion,
      Key: fileKey,
      FilePath: file.path,
    }, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
};

module.exports = {
  checkFileType,
  getFileTypeDir,
  getFileDateDir,
  getUploadDirName,
  checkDirExist,
  cosUploader: uploader,
};
