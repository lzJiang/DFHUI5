sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'zztodataconfig',
            componentId: 'ZC_ZT_ODATA_CONFIGObjectPage',
            contextPath: '/ZC_ZT_ODATA_CONFIG'
        },
        CustomPageDefinitions
    );
});