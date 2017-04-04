'use strict';

module.exports = appInfo => {
    const config = {
        "keys": appInfo.name + '_LKJLK980asdsfdghgk',
        "mysql": {
            // database configuration
            client: {
                // host
                host: '127.0.0.1',
                // port
                port: '3306',
                // username
                user: 'dgn',
                // password
                password: 'wildsoul',
                // database
                database: 'dgn_db',
                supportBigNumbers: true,
                bigNumberStrings: true,
                dateStrings: true,
                multipleStatements: true,
                queryFormat:this.queryFormat
            },
            // load into app, default is open
            app: true,
            // load into agent, default is close
            agent: false,
        },
        "middleware": ['errorHandler', 'reqParams'],
        "errorHandler": {
            // 非 `/api/` 路径不在这里做错误处理，留给默认的 onerror 插件统一处理
            match: '/api',
        },
        "security": {
            csrf: {
                enable: false,
            },
        },
        "iData": {
            exportsPath: './app/public/exports',
            downloadPath: 'public/exports',
            wxXCX: {
                Appid: 'wx867b09a45b9d69f9',
                AppSecret: '5c5d388e6f871badcb6aaad954cafaa1'
            }
        },
    };
    
    return config;
};


function queryFormat(query, values) {
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
    }