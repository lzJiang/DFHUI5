sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'zui50017',
            componentId: 'ZC_RFICO001ObjectPage',
            contextPath: '/ZC_RFICO001'
        },
        CustomPageDefinitions
    );
});