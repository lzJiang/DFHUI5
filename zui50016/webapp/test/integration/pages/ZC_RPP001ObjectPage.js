sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'zui50016',
            componentId: 'ZC_RPP001ObjectPage',
            contextPath: '/ZC_RPP001'
        },
        CustomPageDefinitions
    );
});