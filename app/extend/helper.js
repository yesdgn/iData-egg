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
        let body = ctx.body || {};
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
};
