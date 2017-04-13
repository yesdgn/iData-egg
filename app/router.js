'use strict';

module.exports = app => {
    app.all('/api/:apiid', 'api.callApi');
    app.all('/wxLogin', 'weixin.login');

    app.post('/upload', 'upload.upload');

    //带模版的excel导出
    app.all('/excel/export2', 'ejsExcel.exportExcel');
};
