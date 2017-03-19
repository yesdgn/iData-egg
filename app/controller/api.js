'use strict';

const returnInfo = require('./returnInfo.js');
const lodash = require('lodash');
let routerApi = {};

module.exports = app => {
    class ApiController extends app.Controller {
        //调用API入口
        async  callApi() {
            routerApi = app.routerArr[this.ctx.params['apiid']];
            this.check();
            await this.Authentication();
            const results = await this.dbExec();
            const resultsJson = this.transformJson(routerApi.ApiType, results, this.ctx.dgnReqParams);
            if (routerApi.ApiType == 'FORM_LIST_EXPORT') {
               // excel.exportExcel(req, res, args, resultsJson);
               console.log('导出excel');
            }
            else
            { this.ctx.body = resultsJson; }
        }

        //普通检测
        check() {
            if (!routerApi)
            { throw new Error(JSON.stringify(returnInfo.api.e1000)); }
            let timestamp = this.ctx.dgnReqParams['timestamp'];
            let UTCtime = Math.round(new Date().getTime() / 1000)
            if (timestamp && (UTCtime - timestamp) > 5)  //5分钟有效期
            { throw new Error(JSON.stringify(returnInfo.api.e1006)); }
        }
        //检测权限
        async Authentication() {
            if (routerApi.IsOpen == '1') return;
            let sessionkey = this.ctx.dgnReqParams['sessionkey'];
            if (!sessionkey) { throw new Error(JSON.stringify(returnInfo.api.e1003)); }
            let userid = this.ctx.dgnReqParams['userid'];
            if (!userid) { throw new Error(JSON.stringify(returnInfo.api.e1012)); }
            let sign = this.ctx.dgnReqParams['sign'];
            if (!sign) { throw new Error(JSON.stringify(returnInfo.api.e1010)); }
            // if ((this.ctx.method == 'GET' && !this.ctx.helper.checkUrl(this.ctx.query)) || (this.ctx.method == 'POST' && !this.ctx.helper.checkUrl(this.ctx.body)))
            // { throw new Error(JSON.stringify(returnInfo.api.e1005)); }
            // const AccessToken = await this.ctx.service.api.authSessionkey(this.ctx.dgnReqParams);
            // if (AccessToken.length!==1 || AccessToken[0].AccessToken!== sessionkey )
            // { throw new Error(JSON.stringify(returnInfo.api.e1004));}
            // this.ctx.logger.debug('current AccessToken: %j', AccessToken[0].AccessToken);
            if (routerApi.IsAllowRoleRight == 1) {
                const results = await this.ctx.service.api.authRolePermission(routerApi, this.ctx.dgnReqParams);
                if (results.length > 0) {
                    throw new Error(JSON.stringify({ "returnCode": -1, "returnDescribe": "角色权限受控", items: [{ "result": "fail", "resultDescribe": results[0].ErrorMessage }] }))
                }
            }

        }

        async  dbExec() {
            if (routerApi.ApiType == 'FORM_LIST_READ')   //列表读语句
            {
                let sqls = this.generateListSqlStr(this.ctx.dgnReqParams, routerApi.ApiExecSql);
                if (sqls === null) { throw new Error(JSON.stringify(returnInfo.api.e1007)); }
                const results = await this.ctx.service.api.dbExecSql(sqls);
                return results;
            }
            else if (routerApi.ApiType == 'FORM_READ' || routerApi.ApiType == 'FORM_LIST_EXPORT' || routerApi.ApiType == 'FORM_DELETE')   // 单据读取语句
            {
                const results = await this.ctx.service.api.dbExecSql(routerApi.ApiExecSql);
                return results;
            }
            else if (routerApi.ApiType == 'FORM_SAVE')   //自动生成单据保存语句
            {
                let sqls = this.generateSaveSqlStr(this.ctx.dgnReqParams, routerApi.AutoGenerateSqlTableName);
                if (sqls === null) { throw new Error(JSON.stringify(returnInfo.api.e1007)); }
                if (sqls === '') { throw new Error(JSON.stringify(returnInfo.api.e1009)); }
                const results = await this.ctx.service.api.dbExecSql(sqls);
                return results;
            }
            else {
                const results = await this.ctx.service.api.dbExecSql(routerApi.ApiExecSql);
                return results;
            }
        }
        //动态生成保存SQL
        generateSaveSqlStr(args, tableNameStr) {
            var tablenameArr = tableNameStr.split(",");
            var jsonData = JSON.parse(args.jsonData);
            var sql = '';
            var abort = false;
            tablenameArr.map(function (tablename, tableIndex) {
                var jsonTableData = [];
                if (abort) { return; }
                if (jsonData[tableIndex] == undefined)
                { return sql }
                else if (lodash.isArray(jsonData[tableIndex]))
                { jsonTableData = jsonData[tableIndex]; }
                else { jsonTableData.push(jsonData[tableIndex]); }   //不是数组则认为是对象，转换为数组 方便统一处理
                jsonTableData.map(function (row) {
                    if (abort) { return; }
                    var field = '';
                    for (var col in row) {
                        if (col != 'ID' && col != 'DgnOperatorType') {
                            let colvalue = dgn.replacestr(row[col]);
                            if (colvalue === true)
                            { colvalue = 1; }
                            else if (colvalue === false)
                            { colvalue = 0; }
                            colvalue = colvalue === '' ? null : '"' + colvalue + '"';
                            field = field + (field == '' ? '`' : ',`') + col + '`=' + colvalue;
                        }
                    }
                    var dataID = row.ID;
                    // 只允许数字与undefined(新增只能是undefined) 如果非数字有可能是SQL注入行为
                    if (isNaN(dataID) && dataID !== undefined)
                    { abort = true; return; }
                    if (dgn.ifNull(row.ID) && row.DgnOperatorType == 'ADD') {
                        sql = sql + ' insert into ' + tablename + ' set ' + field + ';';
                    }
                    else if (row.ID && row.DgnOperatorType == 'UPDATE') {
                        sql = sql + ' update ' + tablename + ' set ' + field + ' where ID=' + row.ID + ';';
                    }
                    else if (row.ID && row.DgnOperatorType == 'DELETE') {
                        sql = sql + ' delete from ' + tablename + ' where ID=' + row.ID + ';';
                    }
                    else
                    { return; }
                })
            })
            if (abort) { return null }
            return sql
        }
        //动态生成列表SQL
        generateListSqlStr(args, sqlArrs) {
            var sqlArray = sqlArrs.split(";");
            var pageSize = args.pageSize ? args.pageSize : 10;
            var curPage = args.curPage ? args.curPage : 1;
            var sql = '';
            var abort = false;
            sqlArray.map(function (sqlStr, index) {
                if (lodash.trim(sqlStr) != '') {
                    if (abort) { return; }
                    sql = sql + 'select count(1) TotalCount from (' + sqlStr + ') T ;';
                    sql = sql + '\n\r' + sqlStr + ' limit ' + curPage + ',' + pageSize + ';';
                }
            })
            if (abort) { return null }
            return sql
        }
        //转换SQL返回的结果集
        transformJson(ApiType, results, args) {
            var resultsJsonObject = { "returnCode": 0 };
            if (ApiType == 'SQL') {
                resultsJsonObject.items = results;
                return resultsJsonObject;
            }
            else if (ApiType == 'FORM_LIST_READ')  //  读列表SQL语句  固定会有两条SQL语句（第一条为列表总记录数）
            {
                resultsJsonObject.items = {};
                for (var i = 0; i < results.length; i++) {
                    resultsJsonObject.items['item' + i] = results[i];
                }
                return resultsJsonObject;
            }
            else if (ApiType == 'FORM_READ')  // 自动生成读SQL语句
            {
                resultsJsonObject.items = {};
                if (lodash.isArray(results[0])) //有两条SQL语句返回与一条SQL语句返回不一样 所以要判断一下
                {
                    for (var i = 0; i < results.length; i++) {
                        resultsJsonObject.items['item' + i] = results[i];
                    }
                }
                else {
                    resultsJsonObject.items['item0'] = results;
                }
                return resultsJsonObject;
            }
            else if (ApiType == 'FORM_SAVE')  // 自动生成保存SQL语句
            {
                if (results.insertId && results.insertId > 0)
                { resultsJsonObject.items = [{ result: "success", resultDescribe: "保存成功", insertId: results.insertId }]; }
                else { resultsJsonObject.items = [{ result: "success", resultDescribe: "保存成功" }]; }
                return resultsJsonObject;
            }
            else if (ApiType == 'FORM_DELETE')  //  删除SQL语句
            {
                resultsJsonObject.items = [{ result: "success", resultDescribe: "删除成功" }];
                return resultsJsonObject;
            }
            else if (ApiType == 'PROC_S')  // 只有一个查询返回对象
            {
                resultsJsonObject.items = results[0];
                return resultsJsonObject;
            }
            else if (ApiType == 'PROC_M') // 有多个查询返回对象
            {
                resultsJsonObject.items = {};
                for (var i = 0; i < results.length - 1; i++) {
                    //var item={};
                    //item['item'+i]=results[i];
                    resultsJsonObject.items['item' + i] = results[i];
                }

                return resultsJsonObject;
            }
            else if (ApiType == 'FORM_LIST_EXPORT')  //  导出列表SQL语句
            {
                resultsJsonObject.items = results;
                return resultsJsonObject;
            }
            else if (ApiType == 'TREE')  // 返回树对象
            {
                var treeJson = {};
                var result;
                if (results.length === 2 && results[1].serverStatus)
                { result = results[0]; }
                else
                { result = results; }
                buildTreeJson(result, args.rootValue, treeJson, args.nodeColName, args.parentNodeColName);
                resultsJsonObject.items = treeJson.children || [];
                return resultsJsonObject;
            }
            else
            { return results; }
        }
        //构建Tree的Json结构
        buildTreeJson(results, rootValue, parentObject, nodeColName, parentNodeColName) {
            var childItem = results.filter((x, index) => {
                return (x[parentNodeColName] == rootValue)
            })
            if (childItem.length > 0) {
                parentObject['children'] = childItem;
            }

            for (y in childItem) {
                buildTreeJson(results, childItem[y][nodeColName], parentObject.children[y], nodeColName, parentNodeColName);
            }
            return;
        }


    }
    return ApiController;
};
