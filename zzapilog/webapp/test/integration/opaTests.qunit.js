sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'zzapilog/test/integration/FirstJourney',
		'zzapilog/test/integration/pages/logList',
		'zzapilog/test/integration/pages/logObjectPage'
    ],
    function(JourneyRunner, opaJourney, logList, logObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('zzapilog') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onThelogList: logList,
					onThelogObjectPage: logObjectPage
                }
            },
            opaJourney.run
        );
    }
);