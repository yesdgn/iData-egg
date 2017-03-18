'use strict';

module.exports = appInfo => {
  const config = {};

  // should change to your own
  config.keys = appInfo.name + '_OUI0809jllkjPOIj190';
  config.mysql = {
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
    },
    // load into app, default is open
    app: true,
    // load into agent, default is close
    agent: false,
  };
  return config;
};
