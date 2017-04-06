'use strict';

const co = require('co');
const moment = require('moment');
const CryptoJS = require('crypto-js');
const returnInfo = require('../returnInfo.js');
module.exports = app => {
    app.mysql.insert = co.wrap(app.mysql.insert);
    app.mysql.delete = co.wrap(app.mysql.delete);
    app.mysql.query = co.wrap(app.mysql.query);
    app.mysql.beginTransactionScope = co.wrap(app.mysql.beginTransactionScope);
    return class LoginService extends app.Service {
        async login(data) {
            let sqlStr = `select b.userid,b.password from dgn_login_type a inner join dgn_user b on a.userid=b.userid   
			        where  a.LoginID='{$req.loginid}' and a.logintype={$req.logintype} and b.usertype={$req.usertype} 
                    and b.isValid=1 and b.IsDelete=0 and b.isAllowLogon=1 
                    and curdate()>=b.startdate and curdate()<=b.enddate `;
            sqlStr = this.ctx.helper.queryFormat(sqlStr, data);
            const result = await app.mysql.query(sqlStr);
            if (result.length > 0 && result[0].userid && result[0].password && result[0].password == CryptoJS.SHA1(data.password + result[0].userid).toString()) {
                let accessToken = this.ctx.helper.generateUUID();
                let expireTime = moment(new Date()).add(5, 'days').format('YYYY-MM-DD HH:mm:ss');
                let result1 = await app.mysql.delete('dgn_access_token', {userid: result[0].userid ,appid:data.appid});
                result1 = await app.mysql.insert('dgn_access_token', { UserID: result[0].userid, AppID: data.appid, AccessToken: accessToken, ExpireTime: expireTime, wx_unionid: data.loginid, wx_session_key: data.sessionkey });
                return { returnCode: 0, result: 'success', resultDescribe: '登录成功', accessToken: accessToken, userID: result[0].userid };
            }
            else {
                return { returnCode: -1, result: 'fail', resultDescribe: '用户名或密码错误' };
            }

        }
        async reg(data) {
            const result = await app.mysql.beginTransactionScope(async function (conn) {
                conn.insert = co.wrap(conn.insert);
                // don't commit or rollback by yourself
                const userid = this.ctx.helper.getRand(5);
                const userImages = this.ctx.helper.getRand(5);
                const curTime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                const startTime = moment(new Date()).format('YYYY-MM-DD');
                const endTime = moment(new Date()).add(10, 'years').format('YYYY-MM-DD');
                const password = CryptoJS.SHA1(data.password + userid).toString();
                let result1 = await conn.insert('dgn_person', { UserID: userid, Code: data.nickname, Name: data.nickname, CreateTime: curTime, UserImages: userImages, wx_unionid: data.loginid });
                if (result1.affectedRows <= 0)
                { throw new Error(JSON.stringify(returnInfo.api.e8000)); }
                result1 = await conn.insert('dgn_user', { UserID: userid, PassWord: password, UserType: data.usertype, StartDate: startTime, EndDate: endTime, IsAllowLogon: 1, IsValid: 1, CreateTime: curTime });
                if (result1.affectedRows <= 0)
                { throw new Error(JSON.stringify(returnInfo.api.e8000)); }
                result1 = await conn.insert('dgn_login_type', { UserID: userid, LoginID: userid, NickName: data.nickname, LoginType: 1 });
                if (result1.affectedRows <= 0)
                { throw new Error(JSON.stringify(returnInfo.api.e8000)); }
                result1 = await conn.insert('dgn_login_type', { UserID: userid, LoginID: data.loginid, NickName: data.nickname, LoginType: data.logintype });
                if (result1.affectedRows <= 0)
                { throw new Error(JSON.stringify(returnInfo.api.e8000)); }
                result1 = await conn.insert('dgn_role_user', { UserID: userid, RoleID: '147357647778729163', Isvalid: 1 });
                if (result1.affectedRows <= 0)
                { throw new Error(JSON.stringify(returnInfo.api.e8000)); }
                let expireTime = moment(new Date()).add(5, 'days').format('YYYY-MM-DD HH:mm:ss');
                let accessToken = this.ctx.helper.generateUUID();
                result1 = await conn.insert('dgn_access_token', { UserID: userid, AppID: data.appid, AccessToken: accessToken, ExpireTime: expireTime, wx_unionid: data.loginid, wx_session_key: data.sessionkey });
                if (result1.affectedRows <= 0)
                { throw new Error(JSON.stringify(returnInfo.api.e8000)); }
                return { returnCode: 0, result: 'success', resultDescribe: '注册成功', accessToken: accessToken, userID: userid };
            }.bind(this), this.ctx);
            return result;
        }
    }
};
