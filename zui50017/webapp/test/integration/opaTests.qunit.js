sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'zui50017/test/integration/FirstJourney',
		'zui50017/test/integration/pages/ZC_RFICO001List',
		'zui50017/test/integration/pages/ZC_RFICO001ObjectPage'
    ],
    function(JourneyRunner, opaJourney, ZC_RFICO001List, ZC_RFICO001ObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('zui50017') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheZC_RFICO001List: ZC_RFICO001List,
					onTheZC_RFICO001ObjectPage: ZC_RFICO001ObjectPage
                }
            },
            opaJourney.run
        );
    }
);