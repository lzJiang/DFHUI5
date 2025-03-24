sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'zui50016',
            componentId: 'ZC_RPP001List',
            contextPath: '/ZC_RPP001'
        },
        CustomPageDefinitions
    );
});