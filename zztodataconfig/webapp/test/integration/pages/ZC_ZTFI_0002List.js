sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'zztodataconfig',
            componentId: 'ZC_ZT_ODATA_CONFIGList',
            contextPath: '/ZC_ZT_ODATA_CONFIG'
        },
        CustomPageDefinitions
    );
});