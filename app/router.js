'use strict';

module.exports = app => {
    app.all('/api/:apiid', 'api.callApi');

    //带模版的excel导出
    app.all('/excel/export2', 'ejsExcel.exportExcel');
};
