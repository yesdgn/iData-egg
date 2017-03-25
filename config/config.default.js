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
            },
            // load into app, default is open
            app: true,
            // load into agent, default is close
            agent: false,
        },
        "middleware": ['errorHandler', 'sqlInjection'],
        "errorHandler": {
            // 非 `/api/` 路径不在这里做错误处理，留给默认的 onerror 插件统一处理
            match: '/api',
        },
        "sqlInjection": {
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
        }

    };

    return config;
};

