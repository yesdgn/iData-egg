'use strict';

const moment = require('moment');
const returnInfo = require('../returnInfo.js');
module.exports = app => {
    return class UploadService extends app.Service {
        * upload2db(data) {
            // don't commit or rollback by yourself
            const fileid = this.ctx.helper.getRandom(5);
            const curTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
            let result1 = yield app.mysql.insert('dgn_upload_file', { FormID: userid, FileID: fileid, UploadFileName: data.nickname, NewFileName: 2, UploadUserID: userImages, UploadTime: curTime, FileType: 22 });
            if (result1.affectedRows <= 0)
            { throw new Error(JSON.stringify(returnInfo.api.e8000)); }


            return { returnCode: 0, result: 'success', resultDescribe: '注册成功', accessToken: accessToken, userID: userid };

            return result;
        }
    }
};
