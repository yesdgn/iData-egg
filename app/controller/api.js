'use strict';

const returnInfo = require('./returnInfo.js');
const lodash = require('lodash');
let routerApi = {};

module.exports = app => {
    class ApiController extends app.Controller {
        //调用API入口
        async  callApi() {
            const { ctx, service } = this;
            routerApi = app.routerArr[ctx.params['apiid']];
            this.check();
            await this.Authentication();
            ctx.body = routerApi;
        }

        //普通检测
        check() {
            if (!routerApi)
            { throw new Error(JSON.stringify(returnInfo.api.e1000)); }

            let timestamp = this.ctx.helper.reqArgs(this.ctx, 'timestamp');
            let UTCtime = Math.round(new Date().getTime() / 1000)
            if (timestamp && (UTCtime - timestamp) > 5)  //5分钟有效期
            { throw new Error(JSON.stringify(returnInfo.api.e1006)); }
        }
        //检测权限
        async Authentication() {
            if (routerApi.IsOpen == '1') return;
            let sessionkey = this.ctx.helper.reqArgs(this.ctx, 'sessionkey');
            if (!sessionkey) { throw new Error(JSON.stringify(returnInfo.api.e1003)); }
            // let sign = this.ctx.helper.reqArgs(this.ctx, 'sign');
            // if (!sign) { throw new Error(JSON.stringify(returnInfo.api.e1010)); }
            // if ((this.ctx.method == 'GET' && !this.ctx.helper.checkUrl(this.ctx.query)) || (this.ctx.method == 'POST' && !this.ctx.helper.checkUrl(this.ctx.body)))
            // { throw new Error(JSON.stringify(returnInfo.api.e1005)); }
            const AccessToken = await this.ctx.service.api.authSessionkey(sessionkey);
            if (AccessToken.length!==1 || AccessToken[0].AccessToken!== sessionkey )
            { throw new Error(JSON.stringify(returnInfo.api.e1004));}
           // this.logger.debug('current AccessToken: %j', AccessToken[0].AccessToken);
            if (routerApi.IsAllowRoleRight==1)
            {   
                 await this.ctx.service.api.authRolePermission(routerApi);
            }

        }


    }
    return ApiController;
};
