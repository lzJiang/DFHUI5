sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'ztfi0002',
            componentId: 'ZC_ZTFI_0002List',
            contextPath: '/ZC_ZTFI_0002'
        },
        CustomPageDefinitions
    );
});