sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'ztfi0001/test/integration/FirstJourney',
		'ztfi0001/test/integration/pages/ZC_ZTFI_0001List',
		'ztfi0001/test/integration/pages/ZC_ZTFI_0001ObjectPage'
    ],
    function(JourneyRunner, opaJourney, ZC_ZTFI_0001List, ZC_ZTFI_0001ObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('ztfi0001') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheZC_ZTFI_0001List: ZC_ZTFI_0001List,
					onTheZC_ZTFI_0001ObjectPage: ZC_ZTFI_0001ObjectPage
                }
            },
            opaJourney.run
        );
    }
);