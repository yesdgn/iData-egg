'use strict';

module.exports = {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  schedule: {
    cron: '0 0 */1 * * *',
    type: 'all', // 指定所有的 worker 都需要执行
  },
  // task 是真正定时任务执行时被运行的函数，第一个参数是一个匿名的 Context 实例
  async task(ctx) {
    console.warn('===================定时任务执行开始===================');
    const res = await ctx.service.api.getRouterArrConfig();
  },
};
