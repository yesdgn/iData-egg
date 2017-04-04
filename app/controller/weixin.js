'use strict';

module.exports = app => {
    class WeiXin extends app.Controller {
        async  login() {
            let result = await this.ctx.service.weixin.login(this.ctx.dgnReqParams);
            console.log(result);
            this.ctx.body = result;
        }
    }
    return WeiXin;
};
