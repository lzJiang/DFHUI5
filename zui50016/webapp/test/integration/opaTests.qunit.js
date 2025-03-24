sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'zui50016/test/integration/FirstJourney',
		'zui50016/test/integration/pages/ZC_RPP001List',
		'zui50016/test/integration/pages/ZC_RPP001ObjectPage',
		'zui50016/test/integration/pages/ZC_RPP001_ITEM_1ObjectPage'
    ],
    function(JourneyRunner, opaJourney, ZC_RPP001List, ZC_RPP001ObjectPage, ZC_RPP001_ITEM_1ObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('zui50016') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheZC_RPP001List: ZC_RPP001List,
					onTheZC_RPP001ObjectPage: ZC_RPP001ObjectPage,
					onTheZC_RPP001_ITEM_1ObjectPage: ZC_RPP001_ITEM_1ObjectPage
                }
            },
            opaJourney.run
        );
    }
);