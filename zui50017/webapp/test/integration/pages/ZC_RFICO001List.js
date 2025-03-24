sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'zui50017',
            componentId: 'ZC_RFICO001List',
            contextPath: '/ZC_RFICO001'
        },
        CustomPageDefinitions
    );
});