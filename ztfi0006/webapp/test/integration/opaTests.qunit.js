sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'ztfi0006/test/integration/FirstJourney',
		'ztfi0006/test/integration/pages/ZC_ZTFI_0006List',
		'ztfi0006/test/integration/pages/ZC_ZTFI_0006ObjectPage'
    ],
    function(JourneyRunner, opaJourney, ZC_ZTFI_0006List, ZC_ZTFI_0006ObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('ztfi0006') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheZC_ZTFI_0006List: ZC_ZTFI_0006List,
					onTheZC_ZTFI_0006ObjectPage: ZC_ZTFI_0006ObjectPage
                }
            },
            opaJourney.run
        );
    }
);