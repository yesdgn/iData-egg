'use strict';

module.exports = app => {
  app.beforeStart(function* () {
    // 应用会等待这个函数执行完成才启动
    console.log('===================WEB服务开始===================');
    yield app.runSchedule('update_cache');
  });
};
