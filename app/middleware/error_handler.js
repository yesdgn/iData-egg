'use strict';

module.exports = () => {
    return function* errorHandler(next) {
        try {
            yield next;
        } catch (err) {
            // 注意：自定义的错误统一处理函数捕捉到错误后也要 `app.emit('error', err, this)`
            // 框架会统一监听，并打印对应的错误日志
            this.app.emit('error', err, this);
            // 自定义错误时异常返回的格式
            if (this.helper.isJson(err.message)) {
                this.body = JSON.parse(err.message);
            }
            else { this.body = { 'returnCode': 7000, 'result': 'fail', 'returnDescribe': err.message }; }
        }
    };


};
