sap.ui.define([
    "sap/m/MessageToast"
], function (MessageToast) {
    'use strict';

    return {
        CustomAction: function (oEvent) {
            MessageToast.show("Custom handler invoked.");
        },
        openSpreadsheetUploadDialog: async function (event) {
            this.editFlow.getView().setBusyIndicatorDelay(0);
            this.editFlow.getView().setBusy(true);
            this.spreadsheetUpload = await this.editFlow.getView()
                .getController()
                .getAppComponent()
                .createComponent({
                    usage: "spreadsheetImporter",
                    async: true,
                    settings: {
                        columns: ['Bankn', 'Bukrs', 'Hbkid', 'Hktid', 'Prctr']
                    },
                    componentData: {
                        context: this,
                    },
                });
            this.spreadsheetUpload.setActivateDraft(true)
            this.spreadsheetUpload.openSpreadsheetUploadDialog();
            this.editFlow.getView().setBusy(false);
        }
    };
});
