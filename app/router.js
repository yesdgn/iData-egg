'use strict';

module.exports = app => {
  app.get('/', 'home.index');
  app.all('/api/:apiid', 'api.callApi');
};
