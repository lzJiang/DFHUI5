sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'zztodataconfig/test/integration/FirstJourney',
		'zztodataconfig/test/integration/pages/ZC_ZT_ODATA_CONFIGList',
		'zztodataconfig/test/integration/pages/ZC_ZT_ODATA_CONFIGObjectPage'
    ],
    function(JourneyRunner, opaJourney, ZC_ZT_ODATA_CONFIGList, ZC_ZT_ODATA_CONFIGObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('zztodataconfig') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheZC_ZT_ODATA_CONFIGList: ZC_ZT_ODATA_CONFIGList,
					onTheZC_ZT_ODATA_CONFIGObjectPage: ZC_ZT_ODATA_CONFIGObjectPage
                }
            },
            opaJourney.run
        );
    }
);