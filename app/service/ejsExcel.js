'use strict';

const ejsExcel = require('ejsexcel');
const fs = require('fs');
module.exports = app => {

    return class EjsExcelService extends app.Service {
        async exportExcel(exportData, excelTemplateFileName, exportExcelFileName) {
            //获得Excel模板的buffer对象
            let exlBuf = await fs.readFileSync(excelTemplateFileName);
            //数据源

            //用数据源(对象)data渲染Excel模板
            await ejsExcel.renderExcelCb(exlBuf, exportData, async function (err, exlBuf2) {
                if (err) {
                    throw new Error(err);
                    return;
                }
                await fs.writeFileSync(exportExcelFileName, exlBuf2);
            });
        }




    }
};
