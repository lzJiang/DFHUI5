sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'ztfi0006',
            componentId: 'ZC_ZTFI_0006ObjectPage',
            contextPath: '/ZC_ZTFI_0006'
        },
        CustomPageDefinitions
    );
});