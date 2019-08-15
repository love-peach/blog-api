const fs = require('fs');
const path = require('path');
const COS = require('cos-nodejs-sdk-v5');
const OSS = require('ali-oss');
const cosConfig = require('../config/cos.config');
const ossConfig = require('../config/oss.config');

const IS_PROD = ['production', 'prod', 'pro'].includes(process.env.NODE_ENV);

// 使用永久密钥创建实例
const cos = new COS({
  SecretId: cosConfig.SecretId,
  SecretKey: cosConfig.SecretKey,
});

// 云账号AccessKey有所有API访问权限，建议遵循阿里云安全最佳实践，部署在服务端使用RAM子账号或STS，部署在客户端使用STS。
const client = new OSS({
  accessKeyId: ossConfig.AccessKeyID,
  accessKeySecret: ossConfig.AccessKeySecret,
  region: ossConfig.region,
  bucket: IS_PROD ? ossConfig.bucket : ossConfig.bucketDev,
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

const getFileKey = (file, usedFor = '') => {
  const fileTypeDir = getFileTypeDir(file.type);
  let fileKey = '';
  // poster avatar screenshot
  switch (usedFor) {
    case 'poster':
      fileKey = `${fileTypeDir}/poster/${getFileDateDir()}`;
      break;
    case 'avatar':
      fileKey = `${fileTypeDir}/avatar/${getFileDateDir()}`;
      break;
    case 'screenshot':
      fileKey = `${fileTypeDir}/screenshot`;
      break;
    default:
      fileKey = `${fileTypeDir}/${getFileDateDir()}`;
  }
  return fileKey;
};

/**
 * @description 腾讯云对象存储
 */
const tengxunUploader = async (file, params) => {
  const fileKey = `${getFileKey(file, params.usedFor)}/${file.name}`;

  return new Promise((resolve, reject) => {
    cos.sliceUploadFile({
      Bucket: IS_PROD ? cosConfig.bucketName : cosConfig.bucketNameDev,
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


/**
 * @desc 阿里云对象存储
 */
const aliOssUploader = async (file, params) => {
  const fileKey = `${getFileKey(file, params.usedFor)}/${file.name}`;
  return new Promise((resolve, reject) => {
    client
      .put(fileKey, file.path)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  getFileKey,
  checkFileType,
  getFileTypeDir,
  getFileDateDir,
  checkDirExist,
  tengxunCosUploader: tengxunUploader,
  aliOssUploader,
};
