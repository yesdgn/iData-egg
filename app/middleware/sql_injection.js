'use strict';

module.exports = (options, app) => {
    return function* sqlInjection(next) {
        const body = this.request.body;
        const query = this.query;
        let params = this.helper.ifNull(body) ? query : body;
        //this.dgnReqParams = this.helper.replaceJsonParam(params);
        this.dgnReqParams = params;
        yield next;
    };
};
