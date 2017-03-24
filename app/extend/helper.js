'use strict';
const lodash = require('lodash');
const CryptoJS = require('crypto-js');
module.exports = {
    // this 是 helper 对象，在其中可以调用其他 helper 方法
    // this.ctx => context 对象
    // this.app => application 对象
    ifNull(obj) {
        if (obj === undefined) return true;
        if (lodash.isNull(obj)) return true;
        if (lodash.isString(obj) && obj === '') return true;
        if (lodash.isArray(obj) && obj.length === 0) return true;
        if (lodash.isPlainObject(obj) && lodash.size(obj) <= 0) return true;
        if (lodash.isNaN(obj)) return true;
        if (lodash.isNil(obj)) return true;
        return false;
    },
    isJson(obj) {
        try {
            let jsonObj = JSON.parse(obj);
            let isjson = typeof (jsonObj) == "object" && Object.prototype.toString.call(jsonObj).toLowerCase() == "[object object]" && !jsonObj.length;
            return isjson;
        }
        catch (e) {
            return false;
        }
    },
    reqArgs(ctx, name, defaultValue) {
        // let params = ctx.params || {};
        let body = ctx.request.body || {};
        let query = ctx.query || {};

        let args = arguments.length === 1
            ? 'name'
            : 'name, default';
        //  if (null != params[name] && params.hasOwnProperty(name)) return params[name];
        if (null != body[name]) return body[name];
        if (null != query[name]) return query[name];
        return defaultValue;
    },
    checkUrl(paramsObj) {
        let params = paramsObj;
        let stringC = '';
        let stringB = '';
        let urlsign = params.sign;

        let stringA = lodash.chain(params)
            .omit(['sign'])
            .keys()
            .sortBy()
            .value();

        stringA.map((key) => {
            if (this.ctx.helper.ifNull(params[key])) {
                stringB = (this.ctx.helper.ifNull(stringB) ? '' : stringB + '&') + key + '=' + params[key];
            }
            else {
                stringC = (this.ctx.helper.ifNull(stringC) ? '' : stringC + '&') + key + '=' + encodeURIComponent(params[key]);
            }
            return;
        })

        let sign = lodash.toUpper(CryptoJS.MD5(stringC).toString());
        return urlsign == sign;
    },
    replaceParam(reqParam) {
        if (this.ctx.helper.ifNull(reqParam))
            return '';
        if (!lodash.isString(reqParam)) { return reqParam; }
        let Param = reqParam.replace(/['"\\]/gi, function (txt, key) {
            return '\\' + txt;
        })
        return Param;
    },
    replaceJsonParam(reqJsonParams) {
        // if (this.ctx.helper.ifNull(reqJsonParams))
        //     return {};
        let Params = lodash.mapValues(reqJsonParams, function (value, key) {
            return this.ctx.helper.replaceParam(value);
        }.bind(this));
        return Params;
    },
    queryFormat(query, values) {
        if (!values) return query;
        let sqlreplace = query.replace(/\{\$req[n]?.(.*?)\}/gi, function (txt, key) {
            let keyitem = key.split('.');
            if (keyitem.length > 1)   //SQL中有类似于{$req.filter.goodname} 这样形式的变量。 filter为传入的参数名，goodsname为filter参数中的项目 要求filter是{}
            {
                if (Object.prototype.hasOwnProperty.call(values, keyitem[0]) && !this.ctx.helper.ifNull(values[keyitem[0]])) {
                    let keyjson = JSON.parse(values[keyitem[0]]);
                    return (keyjson[keyitem[1]] ? keyjson[keyitem[1]] : '');
                }
                else
                { return ''; }
            }

            if (Object.prototype.hasOwnProperty.call(values, key)) {
                if (txt.substr(0, 6) === '{$reqn' && values[key] == '')    // 当变量为{$reqn.}时， 参数值为''就替换为null 方便数据库像数字列无法插入''
                { return null; }
                else {
                    return this.ctx.helper.replaceParam(values[key]);
                }
            }
            return txt;
        }.bind(this));
        console.log('-----------------------------------------------------------------------------------------------------------------------------------------------------');
        console.log(sqlreplace);
        return sqlreplace;
    },
};
