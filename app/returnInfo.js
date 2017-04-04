'use strict';

module.exports = {
    'db': {
        'e2000': { 'returnCode': 2000, 'result': 'fail', 'returnDescribe': 'DB连接异常' },
        'e2001': { 'returnCode': 2001, 'result': 'fail', 'returnDescribe': 'DB执行错误' },
        'e2002': { 'returnCode': 2002, 'result': 'fail', 'returnDescribe': 'DB执行错误' },
    },
    'app': {
        'e4000': { 'returnCode': 4000, 'result': 'fail', 'returnDescribe': '不支持的路由' },
    },
    'api': {
        'e1000': { 'returnCode': 1000, 'result': 'fail', 'returnDescribe': '没有该API接口' },
        'e1002': { 'returnCode': 1002, 'result': 'fail', 'returnDescribe': '请检查ApiTable配置' },
        'e1004': { 'returnCode': 1004, 'result': 'fail', 'returnDescribe': '您的账号可能在其他地方登录,您已下线。' },
        'e1003': { 'returnCode': 1003, 'result': 'fail', 'returnDescribe': 'sessionkey未传入' },
        'e1005': { 'returnCode': 1005, 'result': 'fail', 'returnDescribe': '参数验证错误' },
        'e1006': { 'returnCode': 1006, 'result': 'fail', 'returnDescribe': '时间戳验证错误' },
        'e1007': { 'returnCode': 1007, 'result': 'fail', 'returnDescribe': '非法调用' },
        'e1008': { 'returnCode': 1008, 'result': 'fail', 'returnDescribe': '发生未知异常' },
        'e1009': { 'returnCode': 0, 'returnDescribe': '数据没有改变,不需要保存', items: [{ 'result': 'success', 'resultDescribe': '数据没有改变,不需要保存' }] },
        'e1010': { 'returnCode': 1010, 'result': 'fail', 'returnDescribe': 'sign未传入' },   
        'e1011': { 'returnCode': 1011, 'result': 'fail', 'returnDescribe': 'API调用需要验证角色权限,但未配置。' },    
        'e1012': { 'returnCode': 1012, 'result': 'fail', 'returnDescribe': 'userid未传入' },   
},
    'upload': {
        'e5000': { 'returnCode': 5000, 'result': 'fail', 'returnDescribe': '不支持的文件格式' },
        'e5001': { 'returnCode': 5001, 'result': 'fail', 'returnDescribe': '缺少参数，需要userid,imgguid' },
        'e5002': { 'returnCode': 5002, 'result': 'fail', 'returnDescribe': '文件处理发生错误' },
        'e5003': { 'returnCode': 5003, 'result': 'fail', 'returnDescribe': '上传发生错误' },
        'e5004': { 'returnCode': 5004, 'result': 'fail', 'returnDescribe': '上传保存数据发生错误' },
        'e5005': { 'returnCode': 0, 'returnDescribe': '导入提交成功,请稍候观察数据', items: [{ 'result': 'success', 'resultDescribe': '导入提交成功,请稍候观察数据' }] },
    },
    'download': {
        'e6000': { 'returnCode': 0, 'result': 'success', 'returnDescribe': '导出成功' },
        'e6001': { 'returnCode': 6001, 'result': 'fail', 'returnDescribe': '导出失败' },
    },
    'other': {
        'e7000': { 'returnCode': 7001, 'result': 'fail', 'returnDescribe': '未知错误' },
    },
    'login':{
        'e8000': { 'returnCode': 8000, 'result': 'fail', 'returnDescribe': '账号已注册' },
    }
};
