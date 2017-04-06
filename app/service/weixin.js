'use strict';

const co = require('co');
const CryptoJS = require('crypto-js');
module.exports = app => {
    app.mysql.select = co.wrap(app.mysql.select);
    app.mysql.query = co.wrap(app.mysql.query);
    return class WeiXinService extends app.Service {
        async login(reqParams) {
            if (!reqParams.logintype || !reqParams.usertype || !reqParams.appid) {
                throw new Error(JSON.stringify({ "returnCode": -1, "returnDescribe": "登录失败", items: [{ "result": "fail", "resultDescribe": "请检查传入参数" }] }))
                return;
            }
            let res = await this.ctx.curl(`https://api.weixin.qq.com/sns/jscode2session?appid=${app.config.iData.wxXCX.Appid}&secret=${app.config.iData.wxXCX.AppSecret}&js_code=${reqParams.code}&grant_type=authorization_code`, {
                dataType: 'json',
            });
            if (res.data.openid) {
                const results = await app.mysql.query(`select 1 from dgn_login_type a inner join dgn_user b on a.userid=b.userid   
			        where  a.LoginID='${res.data.openid}'  and b.usertype=${reqParams.usertype} `);
                if (results.length === 0) {
                    let wxUserInfo = JSON.parse(reqParams.wxUserInfo);
                    let params = {
                        loginid: res.data.openid,
                        logintype: reqParams.logintype,
                        usertype: reqParams.usertype,
                        nickname: wxUserInfo.nickName,
                        checkcode: 'nocheck',
                        password: CryptoJS.SHA1('dgn').toString(),  //默认密码dgn
                        sessionkey: res.data.session_key,
                        appid: reqParams.appid
                    };
                    const result = await this.service.user.reg(params);
                    return result;
                }
                else {
                    let params = {
                        loginid: res.data.openid,
                        logintype: reqParams.logintype,
                        usertype: reqParams.usertype,
                        checkcode: 'nocheck',
                        password: CryptoJS.SHA1('dgn').toString(),  //默认密码dgn
                        sessionkey: res.data.session_key,
                        appid: reqParams.appid
                    };
                    const result = await this.service.user.login(params);
                    return result;
                }
            }
            else {
                throw new Error(JSON.stringify({ "returnCode": -1, "returnDescribe": "登录失败", items: [{ "result": "fail", "resultDescribe": res.data.errmsg }] }))
                return;
            }

        }





    }
};
