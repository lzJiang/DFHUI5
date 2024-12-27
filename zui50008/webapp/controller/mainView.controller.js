sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "zui50008/model/odataUtil",
    "sap/ui/model/Sorter",
    "zui50008/model/formatter",
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
    'sap/m/p13n/Engine',
    'sap/m/p13n/SelectionController',
    'sap/m/p13n/SortController',
    'sap/m/p13n/GroupController',
    'sap/m/p13n/MetadataHelper',
    'sap/ui/core/library',
    'sap/m/table/ColumnWidthController'
], (BaseController, Controller, JSONModel, MessageToast, MessageBox, odataUtil, Sorter, formatter,
    exportLibrary, Spreadsheet, Engine, SelectionController, SortController, GroupController, MetadataHelper,
    CoreLibrary, ColumnWidthController) => {
    "use strict";

    var EdmType = exportLibrary.EdmType;
    return BaseController.extend("zui50008.controller.mainView", {
        currentType: null,
        confirm: null,
        formatter: formatter,
        onInit() {
            this.getView().setModel(new JSONModel({
                productionplant: "1100"
            }), "dataModel");
            this.getView().setModel(new JSONModel({
                currentType: "显示",
                enableSave: false
            }), "appModel");
            this._ODataModel = this.getOwnerComponent().getModel("odataModel");
            this._ResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },
        onDataSearch: function () {
            var that = this;
            MessageBox.confirm(
                "确认查询，将清空下方表格数据！", {
                title: "确认",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction == MessageBox.Action.YES) {
                        that._onDataSearch();
                    }
                }
            }
            );

        },
        _onDataSearch: function () {
            var that = this;
            var searchData = this.getView().getModel("searchModel").oData;
            var RequestParameter = searchData;
            var req = that.setReq("PP0006", RequestParameter);
            that.globalBusyOn();
            odataUtil.create(that._ODataModel, req).then(function (result) {
                var type = result.Returncode;
                var message = result.Returnmessage;
                var returnResult = result.Returnresult;
                if ("S" == type) {
                    var data = JSON.parse(returnResult);
                    if (data && data.length > 0) {
                        data.forEach(function (item) {
                            if (item.plannedorderisfirm == 'X') {
                                item.plannedorderisfirm_bool = true;
                            } else {
                                item.plannedorderisfirm_bool = false;
                            }
                            item.editable = false;
                        });
                    }
                    that.getView().getModel("dataModel").setProperty("/data", data);
                    that.getView().getModel("appModel").setProperty("/currentType", "显示");
                    that.getView().getModel("appModel").setProperty("/enalbeSave", false);
                    MessageToast.show(message);
                    that.globalBusyOff();
                } else {
                    that.getView().getModel("dataModel").setProperty("/data", []);
                    that.getView().getModel("appModel").setProperty("/currentType", "显示");
                    that.getView().getModel("appModel").setProperty("/enalbeSave", false);
                    MessageToast.show(message);
                    that.globalBusyOff();
                }
            }).catch(function (err) {
                MessageToast.show("接口调用异常，请联系管理员！");
                that.globalBusyOff();
                console.log(err);
            });
        },
        onScll:function (params) {
            var productionplant = this.getView().getModel("dataModel").getProperty("/productionplant");
            if (this.isEmpty(productionplant)) {
                MessageToast.show("请先选择工厂！");
                return;
            }
            sessionStorage.setItem("productionplant", productionplant);
            window.location.href = "/ui#zui50004-maintain"; 
        },
        onWwll:function (params) {
            var productionplant = this.getView().getModel("dataModel").getProperty("/productionplant");
            if (this.isEmpty(productionplant)) {
                MessageToast.show("请先选择工厂！");
                return;
            }
            sessionStorage.setItem("productionplant", productionplant);
            window.location.href = "/ui#zui50005-maintain"; 
        },
        onQtll:function (params) {
            var productionplant = this.getView().getModel("dataModel").getProperty("/productionplant");
            if (this.isEmpty(productionplant)) {
                MessageToast.show("请先选择工厂！");
                return;
            }
            sessionStorage.setItem("productionplant", productionplant);
            window.location.href = "/ui#zui50006-maintain"; 
        },
        onQttl:function (params) {
            var productionplant = this.getView().getModel("dataModel").getProperty("/productionplant");
            if (this.isEmpty(productionplant)) {
                MessageToast.show("请先选择工厂！");
                return;
            }
            sessionStorage.setItem("productionplant", productionplant);
            window.location.href = "/ui#zui50007-maintain"; 
        },
        onLlgl:function (params) {
            var productionplant = this.getView().getModel("dataModel").getProperty("/productionplant");
            if (this.isEmpty(productionplant)) {
                MessageToast.show("请先选择工厂！");
                return;
            }
            sessionStorage.setItem("productionplant", productionplant);
            window.location.href = "/ui#zui50009-maintain"; 
        },
        isEmpty: function (obj) {
            if (typeof obj == "undefined" || obj == null || obj == "" || obj == 0) {
                return true;
            } else {
                return false;
            }
        }
    });
});