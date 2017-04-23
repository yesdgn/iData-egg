'use strict';

const sendToWormhole = require('stream-wormhole');
const fs = require('fs');
const moment = require('moment');
const gm = require('gm').subClass({
  imageMagick: true
});

module.exports = app => {
  class UploadController extends app.Controller {
    * upload() {
      const parts = this.ctx.multipart();
      let formData = {};
      let pathName;
      let dbPathName;
      let part;
      dbPathName = moment(new Date()).format('YYYYMM');
      pathName = app.config.iData.upoladPath + '/' + dbPathName;
      if (fs.existsSync(pathName)) {
      } else {
        fs.mkdirSync(pathName);
      }
      dbPathName = dbPathName + '/' + moment(new Date()).format('DD') + '/';
      pathName = app.config.iData.upoladPath + '/' + dbPathName
      if (fs.existsSync(pathName)) {
      } else {
        fs.mkdirSync(pathName);
      }


      while ((part = yield parts) != null) {
        if (part.length) {
          // arrays are busboy fields
          // console.log('field: ' + part[0]);
          // console.log('value: ' + part[1]);
          // console.log('valueTruncated: ' + part[2]);
          // console.log('fieldnameTruncated: ' + part[3]);
          formData[part[0]] = part[1];
        } else {
          if (!part.filename) {
            // 这时是用户没有选择文件就点击了上传(part 是 file stream，但是 part.filename 为空)
            // 需要做出处理，例如给出错误提示消息
            throw new Error(JSON.stringify({ "returnCode": -1, "returnDescribe": "没有选择文件", items: [{ "result": "fail", "resultDescribe": "没有选择文件" }] }))
            return;
          }
          // otherwise, it's a stream
          // console.log('field: ' + part.fieldname);
          // console.log('filename: ' + part.filename);
          // console.log('encoding: ' + part.encoding);
          // console.log('mime: ' + part.mime);
          // 文件处理，上传到云存储等等

          try {

            const filename = this.ctx.helper.getRandom(5) + '-' + part.filename;
            const fileid = this.ctx.helper.getRandom(5);

            let fileParam = {
              pathName: pathName,
              fileName: filename,
              formData: formData,
              dbPathName: dbPathName,
              oldFileName: part.filename,
              fileType: part.mimeType,
              fileID : fileid
            }
            const mimeType = ['image/jpeg', 'image/png'];
            if (mimeType.includes(part.mimeType)) {
              yield this.ctx.service.gm.writeFile(part, fileParam);
            }
            else {
              const stream = fs.createWriteStream(pathName + filename);
              part.pipe(stream);
              yield this.ctx.service.upload.upload2fileDB(fileParam);
            }
          } catch (err) {
            // 必须将上传的文件流消费掉，要不然浏览器响应会卡死
            yield sendToWormhole(part);
            throw new Error(JSON.stringify({ "returnCode": -1, "returnDescribe": "上传文件出错", items: [{ "result": "fail", "resultDescribe": err.message }] }))
          }
          //  console.log(fileName);
        }
      }
      this.ctx.body = { "returnCode": 0, "returnDescribe": "上传成功", items: [{ "result": "success", "resultDescribe": "上传成功" }] }
    }
  }
  return UploadController;

};