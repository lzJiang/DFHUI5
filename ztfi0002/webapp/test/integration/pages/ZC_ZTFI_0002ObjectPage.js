sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'ztfi0002',
            componentId: 'ZC_ZTFI_0002ObjectPage',
            contextPath: '/ZC_ZTFI_0002'
        },
        CustomPageDefinitions
    );
});