'use strict';

const sendToWormhole = require('stream-wormhole');
const fs = require('fs');
const moment = require('moment');

module.exports = app => {
  class UploadController extends app.Controller {
    * upload() {

      const parts = this.ctx.multipart();
      let part;
      while ((part = yield parts) != null) {

        if (part.length) {
          // arrays are busboy fields
          console.log('field: ' + part[0]);
          console.log('value: ' + part[1]);
          console.log('valueTruncated: ' + part[2]);
          console.log('fieldnameTruncated: ' + part[3]);
        } else {
          if (!part.filename) {
            // 这时是用户没有选择文件就点击了上传(part 是 file stream，但是 part.filename 为空)
            // 需要做出处理，例如给出错误提示消息
            throw new Error(JSON.stringify({ "returnCode": -1, "returnDescribe": "没有选择文件", items: [{ "result": "fail", "resultDescribe": "没有选择文件" }] }))
            return;
          }
          // otherwise, it's a stream
          console.log('field: ' + part.fieldname);
          console.log('filename: ' + part.filename);
          console.log('encoding: ' + part.encoding);
          console.log('mime: ' + part.mime);
          // 文件处理，上传到云存储等等
          let result;
          try {
            result = yield this.writeFile(part);
          } catch (err) {
            // 必须将上传的文件流消费掉，要不然浏览器响应会卡死
            yield sendToWormhole(part);
            throw new Error(JSON.stringify({ "returnCode": -1, "returnDescribe": "上传文件出错", items: [{ "result": "fail", "resultDescribe": err.message }] }))
          }
          console.log(result);
        }
      }
      this.ctx.body = { "returnCode": 0, "returnDescribe": "上传成功", items: [{ "result": "success", "resultDescribe": "上传成功" }] }
    }

    * writeFile(part) {
      const pathName = app.config.iData.upoladPath + '/' + moment(new Date()).format('YYYY/MM') + '/';
      if (fs.existsSync(pathName)) {
        console.log('已经创建过此更新目录了');
      } else {
        fs.mkdirSync(pathName);

        console.log('更新目录已创建成功\n');
      }
      const filename = pathName + this.ctx.helper.getRand(5) + '-' + part.filename;
      const stream = fs.createWriteStream(filename);
      part.pipe(stream);
    };

  }
  return UploadController;
};