'use strict';

const moment = require('moment');
const returnInfo = require('../returnInfo.js');
module.exports = app => {
    return class UploadService extends app.Service {
        * upload2fileDB(fileParam) {
            const curTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            let result1 = yield app.mysql.insert('dgn_upload_file', { FormID: fileParam.formData.formFileID, FileID: fileParam.fileID, UploadFileName: fileParam.oldFileName, NewFileName: fileParam.dbPathName +  fileParam.fileName, UploadUserID: fileParam.formData.userID, UploadTime: curTime, FileType: fileParam.fileType });
            if (result1.affectedRows <= 0)
            { throw new Error(JSON.stringify(returnInfo.api.e8000)); }
            return { returnCode: 0, result: 'success', resultDescribe: '插入成功' };
        }

        * upload2imgDB(fileParam) {
            const curTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            let result1 = yield app.mysql.insert('dgn_upload_file_images', { FileID: fileParam.fileID, ImageFileName: fileParam.dbPathName + fileParam.otherFileName, ImageType: fileParam.ImageType });
            if (result1.affectedRows <= 0)
            { throw new Error(JSON.stringify(returnInfo.api.e8000)); }
            return { returnCode: 0, result: 'success', resultDescribe: '插入成功' };
        }

    }
};
