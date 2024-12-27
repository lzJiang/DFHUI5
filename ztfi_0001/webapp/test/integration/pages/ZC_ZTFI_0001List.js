sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'ztfi0001',
            componentId: 'ZC_ZTFI_0001List',
            contextPath: '/ZC_ZTFI_0001'
        },
        CustomPageDefinitions
    );
});