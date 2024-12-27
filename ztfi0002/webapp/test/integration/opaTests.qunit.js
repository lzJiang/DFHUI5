sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'ztfi0002/test/integration/FirstJourney',
		'ztfi0002/test/integration/pages/ZC_ZTFI_0002List',
		'ztfi0002/test/integration/pages/ZC_ZTFI_0002ObjectPage'
    ],
    function(JourneyRunner, opaJourney, ZC_ZTFI_0002List, ZC_ZTFI_0002ObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('ztfi0002') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheZC_ZTFI_0002List: ZC_ZTFI_0002List,
					onTheZC_ZTFI_0002ObjectPage: ZC_ZTFI_0002ObjectPage
                }
            },
            opaJourney.run
        );
    }
);