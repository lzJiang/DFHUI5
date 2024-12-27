sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'ztfi0001',
            componentId: 'ZC_ZTFI_0001ObjectPage',
            contextPath: '/ZC_ZTFI_0001'
        },
        CustomPageDefinitions
    );
});