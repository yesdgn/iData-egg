'use strict';
const co = require('co');

module.exports = app => {
    app.mysql.query = co.wrap(app.mysql.query);
    //SQL语句有参数必须使用replaceParam替换掉“和\ ，并且SQL以‘’起始和结尾。
    return class Api extends app.Service {
        async getRouterArrConfig() {
            let results = await app.mysql.query('select RouteName,ApiExecSql,ApiExecConditionSql,IsOpen,ApiID,ApiType,AutoGenerateSqlTableName,IsAllowRoleRight from dgn_router_api where IsValid=1 and IsDelete=0;');
            app.routerArr = this.getRouterArr(results);
        }
        async authSessionkey(sessionkey) {
            let sessionkeyParam = this.ctx.helper.replaceParam(sessionkey)
            let results = await app.mysql.query('select  AccessToken  from dgn_access_token where   AccessToken="' + sessionkeyParam + '"  and now()<=ExpireTime');
            return results;
        }
        async authRolePermission(sessionkey) {
            let sessionkeyParam = this.ctx.helper.replaceParam(sessionkey)
            let results = await app.mysql.query('select  AccessToken  from dgn_access_token where   AccessToken="' + sessionkeyParam + '"  and now()<=ExpireTime');
            return results;
        }
        getRouterArr(results) {
            let ApiTable = {};
            for (let i = 0; i < results.length; i++) {
                ApiTable[results[i].ApiID] = results[i];
            }
            return ApiTable
        }

    }
};
