sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'ztfi0006',
            componentId: 'ZC_ZTFI_0006List',
            contextPath: '/ZC_ZTFI_0006'
        },
        CustomPageDefinitions
    );
});