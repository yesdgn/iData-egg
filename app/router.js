'use strict';

module.exports = app => {
    app.all('/api/:apiid', 'api.callApi');
};
