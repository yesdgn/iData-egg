'use strict';

module.exports = (options, app) => {
    return function* sqlInjection(next) {
        const body = this.body;
        const query = this.query;
        let params = body ? body : query;
  console.log(params);
    };
};