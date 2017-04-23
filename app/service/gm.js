'use strict';

const moment = require('moment');
const returnInfo = require('../returnInfo.js');
const gm = require('gm').subClass({
    imageMagick: true
});
module.exports = app => {
    return class GMService extends app.Service {
        * writeFile(part, fileParam) {
            let fileid = this.ctx.helper.getRandom(5);
            fileParam.fileID = fileid;
            gm(part)
                .write(fileParam.pathName + fileParam.fileName, function (err) {
                    if (!err) {
                        if (fileParam.formData.thumbSize) {
                            gm(fileParam.pathName + fileParam.fileName)
                                .size(function (err, size) {
                                    const newSize = fileParam.formData.thumbSize;
                                    const maxwh = size.width > size.height ? size.width : size.height;
                                    const r = maxwh / newSize;
                                    const newWidth = size.width / r;
                                    const newHeight = size.height / r;
                                    gm(fileParam.pathName + fileParam.fileName) //缩略图
                                        .resize(newWidth, newHeight)
                                        .noProfile()
                                        .write(fileParam.pathName + '/t_' + fileParam.fileName, function (err) {
                                            if (err) {
                                                throw new Error(JSON.stringify(returnInfo.upload.e5002))
                                                return;
                                            }
                                        })

                                })
                        }
                        if (fileParam.formData.watermark) {
                            gm(fileParam.pathName + fileParam.fileName)
                                .size(function (err, size) {
                                    gm(fileParam.pathName + fileParam.fileName)
                                        .font("simsun", 12)
                                        .drawText(size.width - 235, size.height - 50, fileParam.formData.watermark)
                                        .write(fileParam.pathName + '/w_' + fileParam.fileName, function (err) {
                                            if (err) {
                                                throw new Error(JSON.stringify(returnInfo.upload.e5002))
                                                return;
                                            }
                                        })
                                })
                        }
                    }
                });

            const sourceFileName=fileParam.fileName;
            yield this.ctx.service.upload.upload2fileDB(fileParam);
            if (fileParam.formData.thumbSize) {
                fileParam.otherFileName = 't_' + sourceFileName;
                fileParam.ImageType = 2;
                yield this.ctx.service.upload.upload2imgDB(fileParam);
            }
            if (fileParam.formData.watermark) {
                fileParam.otherFileName = 'w_' + sourceFileName;
                fileParam.ImageType = 3;
                yield this.ctx.service.upload.upload2imgDB(fileParam);
            }
        }



    }


};

