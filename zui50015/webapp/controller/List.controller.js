sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/ui/model/Sorter',
    'sap/m/MessageBox',
    "sap/m/MessageToast",
    "./BaseController",
    "zui50015/model/odataUtil",
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
    return BaseController.extend("zui50015.controller.List", {
        onInit: function () {
            this.oRouter = this.getOwnerComponent().getRouter();
            this._bDescendingSort = false;
            var startdate = new Date();
            startdate.setDate(startdate.getDate() - 7);
            var startdatestr = startdate.toISOString().substring(0, 10);
            var downloadurl = "";
            if (window.location.host == "my200828.s4hana.sapcloud.cn") {
                downloadurl = window.location.origin + "/sap/opu/odata4/sap/zui_zt_batch_config_o4/srvd/sap/zui_zt_batch_config_o4/0001/config(UUID=13a5f927-8f84-1edf-babb-8f56af3f8eaf,IsActiveEntity=true)/Template"
            } else if (window.location.host == "my200836.s4hana.sapcloud.cn") {
                downloadurl = window.location.origin + "/sap/opu/odata4/sap/zui_zt_batch_config_o4/srvd/sap/zui_zt_batch_config_o4/0001/config(UUID=ff065470-9146-1edf-b2b3-9e2696c66e9d,IsActiveEntity=true)/Template"
            } else if (window.location.host == "my200868.s4hana.sapcloud.cn") {
                downloadurl = window.location.origin + "/sap/opu/odata4/sap/zui_zt_batch_config_o4/srvd/sap/zui_zt_batch_config_o4/0001/config(UUID=f3b079cb-bf92-1eef-bb9c-750fbb8f7a69,IsActiveEntity=true)/Template"
            }
            this.getView().setModel(new JSONModel({
                created_datestart: startdatestr
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
            var req = that.setReq("SD0001", RequestParameter);
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
            var posnr = 0.
            //数据
            for (let index = 0; index < payload.length; index++) {
                if (payload[index].__rowNum__ < 2) {
                    continue;
                }
                if (!this.isEmpty(payload[index].purchaseorderbycustomer) && payload[index].purchaseorderbycustomer.sheetName == "SHEET1") {
                    let head = {};
                    posnr = posnr + 1.
                    head.purchaseorderbycustomer = that.getExcelCellData(payload[index].purchaseorderbycustomer);
                    head.underlyingpurchaseorderitem = posnr;
                    head.salesordertype = that.getExcelCellData(payload[index].salesordertype);
                    head.soldtoparty = that.getExcelCellData(payload[index].soldtoparty);
                    head.salesorganization = that.getExcelCellData(payload[index].salesorganization);
                    head.material = that.getExcelCellData(payload[index].material);
                    head.maktx = that.getExcelCellData(payload[index].maktx);
                    head.productionplant = that.getExcelCellData(payload[index].productionplant);
                    head.batchwms = that.getExcelCellData(payload[index].batchwms);
                    head.requestedquantityunit = that.getExcelCellData(payload[index].requestedquantityunit);
                    head.requestedquantity = that.getExcelCellData(payload[index].requestedquantity);
                    head.dj = that.getExcelCellData(payload[index].dj);
                    head.conditionratevalue = that.getExcelCellData(payload[index].conditionratevalue);
                    head.location = that.getExcelCellData(payload[index].location);
                    data.push(head)
                }
            }
            that.getView().getModel("dataModel").setProperty("/data", data);
            that.globalBusyOff();
        },
        onSave: function (oEvent) {
            var that = this;
            MessageBox.confirm(
                "确认创建销售订单！", {
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
            // for (let index = 0; index < selectItem.length; index++) {
            // const selectOneItem = selectItem[index];
            // let selectOneItemArr = [];
            // selectOneItemArr.push(selectOneItem);
            var RequestParameter = selectItem;
            var req = that.setReq("SD0002", RequestParameter);
            that.globalBusyOn();
            await odataUtil.create(that._ODataModel, req).then(function (result) {
                var type = result.Returncode;
                var message = result.Returnmessage;
                var returnResult = result.Returnresult;
                if ("S" == type) {
                    var returndata = JSON.parse(returnResult);
                    if (returndata && returndata.length > 0) {
                        data.forEach(function (dataitem) {
                            for (let index = 0; index < returndata.length; index++) {
                                const returndataitem = returndata[index];
                                if (dataitem.purchaseorderbycustomer == returndataitem.purchaseorderbycustomer
                                    && dataitem.underlyingpurchaseorderitem == returndataitem.underlyingpurchaseorderitem
                                ) {
                                    dataitem.flag = returndataitem.flag;
                                    dataitem.msg = returndataitem.msg;
                                    dataitem.salesorder = returndataitem.salesorder;
                                    dataitem.salesorderitem = returndataitem.salesorderitem;
                                    dataitem.created_date = returndataitem.created_date;
                                    dataitem.created_by = returndataitem.created_by;
                                    if (dataitem.flag == 'S') {
                                        dataitem.status = "Success";
                                        dataitem.statusicon = "sap-icon://sys-enter-2";
                                    } else {
                                        dataitem.status = "Error";
                                        dataitem.statusicon = "sap-icon://error";
                                    }
                                }
                            }

                        });
                    }
                    that.getView().getModel("dataModel").setProperty("/data", data);
                    MessageToast.show(message);
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
            // }
        },
        getSelectItem: function () {
            var that = this;
            var data = this.getView().getModel("dataModel").getProperty("/data");
            var selectIndex = this.getView().byId("dataModelTable").getSelectedItems();
            var allItems = this.getView().byId("dataModelTable").getItems();
            var selectHead = [];
            if (selectIndex && selectIndex.length > 0) {
                selectIndex.forEach(function (listItem) {
                    var path = listItem.getBindingContext("dataModel").getPath();
                    var rowData = that.getView().getModel("dataModel").getProperty(path);
                    let purchaseorderbycustomer = rowData.purchaseorderbycustomer;
                    let find = false;
                    for (let index = 0; index < selectHead.length; index++) {
                        const head = selectHead[index];
                        if (!that.isEmpty(head) && head == purchaseorderbycustomer) {
                            find = true;
                        }
                    }
                    if (!find) {
                        selectHead.push(purchaseorderbycustomer);
                    }
                });
            }
            var selectItem = [];
            if (selectHead && selectHead.length > 0) {
                for (let index = 0; index < selectHead.length; index++) {
                    const purchaseorderbycustomer = selectHead[index];
                    allItems.forEach(function (listItem) {
                        var path = listItem.getBindingContext("dataModel").getPath();
                        var rowData = that.getView().getModel("dataModel").getProperty(path);
                        if (!that.isEmpty(rowData.purchaseorderbycustomer) && rowData.purchaseorderbycustomer == purchaseorderbycustomer) {
                            listItem.setSelected(true);
                            let item = that.cloneObj(rowData);
                            selectItem.push(item);
                        }
                    });
                }

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
                    label: "外围订单号",
                    property: "purchaseorderbycustomer"
                },
                {
                    type: EdmType.String,
                    label: "SAP订单号",
                    property: "salesorder"
                },
                {
                    type: EdmType.String,
                    label: "SAP订单类型",
                    property: "salesordertype"
                },
                {
                    type: EdmType.String,
                    label: "客户编号",
                    property: "soldtoparty"
                },
                {
                    type: EdmType.String,
                    label: "SAP销售组织",
                    property: "salesorganization"
                },
                {
                    type: EdmType.String,
                    label: "产品编号",
                    property: "material"
                },
                {
                    type: EdmType.String,
                    label: "产品描述",
                    property: "maktx"
                },
                {
                    type: EdmType.String,
                    label: "货主",
                    property: "productionplant"
                },
                {
                    type: EdmType.String,
                    label: "批次编号",
                    property: "batchwms"
                },
                {
                    type: EdmType.String,
                    label: "数量",
                    property: "requestedquantity"
                },
                {
                    type: EdmType.String,
                    label: "销售单位",
                    property: "requestedquantityunit"
                },
                {
                    type: EdmType.String,
                    label: "单价",
                    property: "dj"
                },
                {
                    type: EdmType.String,
                    label: "含税总价",
                    property: "conditionratevalue"
                },
                {
                    type: EdmType.String,
                    label: "存储地点",
                    property: "location"
                },
                {
                    type: EdmType.String,
                    label: "导入日期",
                    property: "created_date"
                },
                {
                    type: EdmType.String,
                    label: "导入用户",
                    property: "created_by"
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
