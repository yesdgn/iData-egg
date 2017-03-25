'use strict';
const co = require('co');
const lodash = require('lodash');
module.exports = app => {
    app.mysql.query = co.wrap(app.mysql.query);
    //SQL语句有参数必须使用replaceParam替换掉“和\ ，并且SQL以‘’起始和结尾。
    return class ApiService extends app.Service {
        async getRouterArrConfig() {
            const results = await app.mysql.query('select RouteName,ApiExecSql,ApiExecConditionSql,IsOpen,ApiID,ApiType,AutoGenerateSqlTableName,IsAllowRoleRight from dgn_router_api where IsValid=1 and IsDelete=0;');
            app.routerArr = lodash.keyBy(results, 'ApiID');
        }
        async authSessionkey(dgnReqParams) {
            const results = await app.mysql.query('select  AccessToken  from dgn_access_token where  userid='+dgnReqParams.userid+" and AccessToken='" + dgnReqParams.sessionkey + "'  and now()<=ExpireTime");
            return results;
        }
        async authRolePermission(routerApi,dgnReqParams) {
            //此处有可能输入错误的userid导致没有任何记录出现， 反而会被认为是有权限操作，所以验证sessionkey的时候加入了userid的验证 两者都正确才能通过sessionkey的验证。
            const sqlstr = routerApi.ApiExecSql;
            let ConditionSql = lodash.trim(routerApi.ApiExecConditionSql);
            const apiRightSql = ' select "您没有权限执行此操作"  as ErrorMessage from dgn_router_api m where IsValid=0  and apiid= ' + routerApi.ApiID + ' and  not exists  (select 1 from dgn_role_user a	 inner join dgn_role_rights b on a.RoleID=b.RoleID	  where a.UserID=' + dgnReqParams.userid + ' and 	b.dataid=m.RouteID )';
            if (ConditionSql && ConditionSql != '') {
                ConditionSql = apiRightSql + ' union all ' + ConditionSql;
            }
            else {
                ConditionSql = apiRightSql;
            }
            const results = await app.mysql.query(ConditionSql);
            return results;
        }
        async dbExecSql(sqlStr) {
            const results = await app.mysql.query(sqlStr);
            return results;
        }


    }
};
