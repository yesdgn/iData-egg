'use strict';

const moment = require('moment');
const returnInfo = require('../returnInfo.js');
const gm = require('gm').subClass({
    imageMagick: true
});
module.exports = app => {
    return class GMService extends app.Service {
        * writeFile(part, pathName, fileName, formData) {
            gm(part)
                .write(pathName + fileName, function (err) {
                    if (!err) {
                        if (formData.thumbSize) {
                            gm(pathName + fileName)
                                .size(function (err, size) {
                                    const newSize = formData.thumbSize;
                                    const maxwh = size.width > size.height ? size.width : size.height;
                                    const r = maxwh / newSize;
                                    const newWidth = size.width / r;
                                    const newHeight = size.height / r;
                                    gm(pathName + fileName) //缩略图
                                        .resize(newWidth, newHeight)
                                        .noProfile()
                                        .write(pathName + '/t_' + fileName, function (err) {
                                            if (err) {
                                                throw new Error(JSON.stringify(returnInfo.upload.e5002))
                                                return;
                                            }
                                        })

                                })
                        }
                        if (formData.watermark) {
                            gm(pathName + fileName)
                                .size(function (err, size) {
                                    gm(pathName + fileName)
                                        .font("simsun", 12)
                                        .drawText(size.width - 235, size.height - 50, formData.watermark)
                                        .write(pathName + '/w_' + fileName, function (err) {
                                            if (err) {
                                                throw new Error(JSON.stringify(returnInfo.upload.e5002))
                                                return;
                                            }
                                        })
                                })
                        }
                    }
                });
        }


    }

};
