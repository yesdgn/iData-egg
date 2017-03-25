'use strict';
const returnInfo = require('./returnInfo.js');
module.exports = app => {
    class EjsExcel extends app.Controller {
        async  exportExcel() {
            let data = [[{ "dpt_des": "开发部", "doc_dt": "2013-09-09", "doc": "a001" }]
                , [{ "pt": "pt1", "des": "des1", "due_dt": "2013-08-07", "des2": "2013-12-07" }
                , { "pt": "pt1", "des": "des1", "due_dt": "2013-09-14", "des2": "des21" }]];
            let excelTemplateFileName = app.config.iData.exportsPath+'/template/导出excel模版.xlsx';
            let exportTime=Date.now();
            let exportExcelFileName = app.config.iData.exportsPath+'/download/商品资料'+ '_' + exportTime + '.xlsx';
            let downloadExcelFileName = app.config.iData.downloadPath+'/download/商品资料'+ '_' + exportTime + '.xlsx';
            const excelBuf = await this.ctx.service.ejsExcel.exportExcel(data, excelTemplateFileName, exportExcelFileName);
            this.ctx.body = {"returnCode":0,"result":"success","returnDescribe":"导出成功", url:downloadExcelFileName};
        }
    }
    return EjsExcel;
};
