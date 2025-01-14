sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/ui/model/Sorter',
    'sap/m/MessageBox',
    "sap/m/MessageToast",
    "./BaseController",
    "zui50013/model/odataUtil",
    'sap/m/p13n/Engine',
    'sap/m/p13n/SelectionController',
    'sap/m/p13n/SortController',
    'sap/m/p13n/GroupController',
    'sap/m/p13n/FilterController',
    'sap/m/p13n/MetadataHelper',
    'sap/m/ColumnListItem',
    'sap/m/Text',
    'sap/ui/core/library',
    'sap/m/table/ColumnWidthController',
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
], function (JSONModel, Controller, Filter, FilterOperator, Sorter, MessageBox, MessageToast, BaseController, odataUtil,
    Engine, SelectionController, SortController, GroupController, FilterController, MetadataHelper, ColumnListItem, Text, coreLibrary,
    ColumnWidthController, exportLibrary, Spreadsheet) {
    "use strict";

    var EdmType = exportLibrary.EdmType;
    return BaseController.extend("zui50013.controller.List", {
        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();
            this._bDescendingSort = false;
            var startdate = new Date();
            startdate.setDate(startdate.getDate() - 7);
            var startdatestr = startdate.toISOString().substring(0, 10);
            var downloadurl = "";
            if (window.location.host == "my200828.s4hana.sapcloud.cn") {
                downloadurl = window.location.origin + "/sap/opu/odata4/sap/zui_zt_batch_config_o4/srvd/sap/zui_zt_batch_config_o4/0001/config(UUID=ff065470-9146-1edf-b2d4-525c69550e9d,IsActiveEntity=true)/Template"
            }else if(window.location.host == "my200836.s4hana.sapcloud.cn"){
                downloadurl = window.location.origin + "/sap/opu/odata4/sap/zui_zt_batch_config_o4/srvd/sap/zui_zt_batch_config_o4/0001/config(UUID=ff065470-9146-1edf-b2b3-9e2696c66e9d,IsActiveEntity=true)/Template"
            }else if(window.location.host == "my200868.s4hana.sapcloud.cn"){
                downloadurl = window.location.origin + "/sap/opu/odata4/sap/zui_zt_batch_config_o4/srvd/sap/zui_zt_batch_config_o4/0001/config(UUID=7f9e9fb1-5c96-1eef-b2d4-63f704badac2,IsActiveEntity=true)/Template"
            }
            this.getView().setModel(new JSONModel({
                plndorderplannedstartdatestart: startdatestr
            }), "searchModel");
            this.setGolbalModel(new JSONModel({
                data: ""
            }), "dataModel");
            this.getGolbalModel("dataModel").setSizeLimit(10000);
            this.getView().setModel(new JSONModel({
                currentType: "显示",
                displayType: false,
                uploadType: true,
                enableSave: false,
                downloadurl: downloadurl
            }), "appModel");
            this.getView().setModel(new JSONModel(
                {
                    Collection: [
                        {
                            key: "upload",
                            text: "导入"
                        },
                        {
                            key: "query",
                            text: "查询"
                        }
                    ]
                }), "cboxModel");
            this._ODataModel = this.getOwnerComponent().getModel("odataModel");
            this._ResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },
        onListItemPress: function (oEvent) {
            var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1),
                // itemPath = oEvent.getSource().getSelectedItem().getBindingContext("dataModel").getPath(),
                itemPath = oEvent.getParameters().listItem.getBindingContext("dataModel").getPath(),
                item = itemPath.split("/")[2];

            this.oRouter.navTo("detail", { layout: oNextUIState.layout, item: item });
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
            var req = that.setReq("PP0021", RequestParameter);
            that.globalBusyOn();
            odataUtil.create(that._ODataModel, req).then(function (result) {
                var type = result.Returncode;
                var message = result.Returnmessage;
                var returnResult = result.Returnresult;
                if ("S" == type) {
                    var data = JSON.parse(returnResult);
                    if (data && data.length > 0) {
                        data.forEach(function (item) {
                            if (item.flag == 'S') {
                                item.status = "Success";
                                item.statusicon = "sap-icon://sys-enter-2";
                            } else {
                                item.status = "Error";
                                item.statusicon = "sap-icon://error";
                            }
                        });
                    }
                    that.getView().getModel("dataModel").setProperty("/data", data);
                    MessageToast.show(message);
                    that.globalBusyOff();
                } else {
                    that.getView().getModel("dataModel").setProperty("/data", []);
                    MessageToast.show(message);
                    that.globalBusyOff();
                }
            }).catch(function (err) {
                MessageToast.show("接口调用异常，请联系管理员！");
                that.globalBusyOff();
                console.log(err);
            });
        },
        onUpload: function (oEvent) {
            var payload = oEvent.getParameter("payload");
            var that = this;
            that._onUpload(payload);

        },
        _onUpload: function (payload) {
            if (payload && payload.length > 0) {

            } else {
                MessageToast.show("未获取到有效数据！");
                return;
            }
            var that = this;
            that.globalBusyOn();
            var data = this.getView().getModel("dataModel").getProperty("/data");
            data = [];
            //抬头数据
            for (let index = 0; index < payload.length; index++) {
                if (payload[index].__rowNum__ < 2) {
                    continue;
                }
                if (payload[index].outbillno.sheetName == "HEADER") {
                    let head = {};
                    head.outbillno = that.getExcelCellData(payload[index].outbillno);
                    head.productionplant = that.getExcelCellData(payload[index].productionplant);
                    head.product = that.getExcelCellData(payload[index].product);
                    head.plndorderplannedstartdate = that.getExcelCellData(payload[index].plndorderplannedstartdate);
                    head.plndorderplannedenddate = that.getExcelCellData(payload[index].plndorderplannedenddate);
                    head.plannedtotalqtyinbaseunit = that.getExcelCellData(payload[index].plannedtotalqtyinbaseunit);
                    head.yy1_plannebatch_pla = that.getExcelCellData(payload[index].yy1_plannebatch_pla);
                    head.plannedorderlongtext = that.getExcelCellData(payload[index].plannedorderlongtext);
                    data.push(head)
                }
            }
            that.getView().getModel("dataModel").setProperty("/data", data);
            that.globalBusyOff();
        },
        onSave: function (oEvent) {
            var that = this;
            MessageBox.confirm(
                "确认创建计划订单！", {
                title: "确认",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction == MessageBox.Action.YES) {
                        that._onSave();
                    }
                }
            }
            );

        },
        _onSave: async function () {
            var that = this;
            var data = this.getView().getModel("dataModel").getProperty("/data");
            var selectItem = that.getSelectItem();
            if (!selectItem.length > 0) {
                MessageToast.show("请先选中要处理的项目");
                return;
            }
            for (let index = 0; index < selectItem.length; index++) {
                const selectOneItem = selectItem[index];
                let selectOneItemArr = [];
                selectOneItemArr.push(selectOneItem);
                var RequestParameter = selectOneItem;
                var req = that.setReq("PP0022", RequestParameter);
                that.globalBusyOn();
                await odataUtil.create(that._ODataModel, req).then(function (result) {
                    var type = result.Returncode;
                    var message = result.Returnmessage;
                    var returnResult = result.Returnresult;
                    if ("S" == type) {
                        var returndata = JSON.parse(returnResult);
                        if (returndata) {
                            data.forEach(function (dataitem) {
                                if (dataitem.outbillno == returndata.outbillno) {
                                    dataitem.flag = returndata.flag;
                                    dataitem.msg = returndata.msg;
                                    dataitem.plannedorder = returndata.plannedorder;
                                    if (dataitem.flag == 'S') {
                                        dataitem.status = "Success";
                                        dataitem.statusicon = "sap-icon://sys-enter-2";
                                    } else {
                                        dataitem.status = "Error";
                                        dataitem.statusicon = "sap-icon://error";
                                    }
                                }
                            });
                        }
                        that.getView().getModel("dataModel").setProperty("/data", data);
                        MessageToast.show("处理完成，处理明细请查看行信息！");
                        that.globalBusyOff();
                    } else {
                        MessageToast.show(message);
                        that.globalBusyOff();
                    }
                }).catch(function (err) {
                    MessageToast.show("接口调用异常，请联系管理员！");
                    that.globalBusyOff();
                    console.log(err);
                });
            }
        },
        getSelectItem: function () {
            var that = this;
            var data = this.getView().getModel("dataModel").getProperty("/data");
            var selectIndex = this.getView().byId("dataModelTable").getSelectedItems();
            var selectItem = [];
            if (selectIndex && selectIndex.length > 0) {
                selectIndex.forEach(function (listItem) {
                    var path = listItem.getBindingContext("dataModel").getPath();
                    var rowData = that.getView().getModel("dataModel").getProperty(path);
                    let item = that.cloneObj(rowData);
                    selectItem.push(item);
                });
            }
            return selectItem;
        },
        setReq: function (Requestcode, RequestParameter) {
            var Uuid = this.uuid();
            var req = {
                Uuid: Uuid,
                Requestcode: Requestcode,
                Requestparameter: JSON.stringify(RequestParameter),
                Returncode: "",
                Returnmessage: "",
                Returnresult: ""
            };
            return req;
        },
        isEmpty: function (obj) {
            if (typeof obj == "undefined" || obj == null || obj == "" || obj == 0) {
                return true;
            } else {
                return false;
            }
        },
        cloneObj: function (obj) {
            var that = this;
            var newObj = {};
            if (obj instanceof Array) {
                newObj = [];
            }
            for (var key in obj) {
                var val = obj[key];
                //newObj[key] = typeof val === 'object' ? arguments.callee(val) : val; //arguments.callee 在哪一个函数中运行，它就代表哪个函数, 一般用在匿名函数中。  
                newObj[key] = typeof val === 'object' ? that.cloneObj(val) : val;
            }
            return newObj;
        },
        getExcelCellData: function (cell) {
            let o;
            if (!this.isEmpty(cell)) {
                o = cell.formattedValue;
            } else {
                o = "";
            }
            return o;
        },
        onSelectionChange: function (oEvent) {
            let control = oEvent.getSource();
            let getParameter = oEvent.getParameter();
            let itemKey = control.getSelectedItem().getKey();
            if (itemKey == "upload") {
                this.getView().getModel("appModel").setProperty("/displayType", false);
                this.getView().getModel("appModel").setProperty("/uploadType", true);
            } else {
                this.getView().getModel("appModel").setProperty("/displayType", true);
                this.getView().getModel("appModel").setProperty("/uploadType", false);
            }

        },
        createColumnConfig: function () {
            return [
                {
                    type: EdmType.String,
                    label: "消息",
                    property: "msg"
                },
                {
                    type: EdmType.String,
                    label: "导入计划号",
                    property: "outbillno"
                },
                {
                    type: EdmType.String,
                    label: "SAP计划订单号",
                    property: "plannedorder"
                },
                {
                    type: EdmType.String,
                    label: "工厂",
                    property: "productionplant"
                },
                {
                    type: EdmType.String,
                    label: "产品",
                    property: "product"
                },
                {
                    type: EdmType.String,
                    label: "计划开始日期",
                    property: "plndorderplannedstartdate"
                },
                {
                    type: EdmType.String,
                    label: "计划结束日期",
                    property: "plndorderplannedenddate"
                },
                {
                    type: EdmType.String,
                    label: "数量",
                    property: "plannedtotalqtyinbaseunit"
                },
                {
                    type: EdmType.String,
                    label: "计划批次",
                    property: "yy1_plannebatch_pla"
                },
                {
                    type: EdmType.String,
                    label: "备注",
                    property: "plannedorderlongtext"
                }
            ];
        },
        onExport: function () {
            var aCols, oBinding, oSettings, oSheet, oTable;

            oTable = this.byId('dataModelTable');
            oBinding = oTable.getBinding('items');
            aCols = this.createColumnConfig();

            oSettings = {
                workbook: { columns: aCols },
                dataSource: oBinding
            };

            oSheet = new Spreadsheet(oSettings);
            oSheet.build()
                .then(function () {
                    MessageToast.show('导出完成');
                }).finally(function () {
                    oSheet.destroy();
                });
        }

    });
});
