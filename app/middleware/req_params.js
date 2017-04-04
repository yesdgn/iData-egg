'use strict';

module.exports = (options, app) => {
    return function* reqParams(next) {
        const body = this.request.body;
        const query = this.query;
        let params = this.helper.ifNull(body) ? query : body;
        this.dgnReqParams = params;
        yield next;
    };
};
