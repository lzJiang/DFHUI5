sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "zui50009/model/odataUtil",
    "sap/ui/model/Sorter",
    "zui50009/model/formatter",
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
    return BaseController.extend("zui50009.controller.mainView", {
        currentType: null,
        confirm: null,
        formatter: formatter,
        onInit() {
            var zcreate_datestart = new Date();
            zcreate_datestart.setDate(zcreate_datestart.getDate() - 7);
            var zcreate_datestart = zcreate_datestart.toISOString().substring(0, 10);
            var productionplant = sessionStorage.getItem("productionplant");
            this.getView().setModel(new JSONModel({
                zcreate_datestart: zcreate_datestart,
                productionplant: productionplant,
            }), "searchModel");
            this.getView().setModel(new JSONModel({
                data: ""
            }), "dataModel");
            this.getView().setModel(new JSONModel({
                currentType: "显示",
                enableSave: false
            }), "appModel");
            this._ODataModel = this.getOwnerComponent().getModel("odataModel");
            this._ResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            this._registerForP13n();
        },
        onReset: function () {
            var that = this;
            MessageBox.confirm(
                "确认重置，将清空查询条件！", {
                title: "确认",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction == MessageBox.Action.YES) {
                        var zcreate_datestart = new Date();
                        zcreate_datestart.setDate(zcreate_datestart.getDate() - 7);
                        var zcreate_datestart = zcreate_datestart.toISOString().substring(0, 10);
                        var productionplant = sessionStorage.getItem("productionplant");
                        that.getView().setModel(new JSONModel({
                            zcreate_datestart: zcreate_datestart,
                            productionplant: productionplant,
                        }), "searchModel");
                    }
                }
            }
            );

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
            var req = that.setReq("PP0013", RequestParameter);
            that.globalBusyOn();
            odataUtil.create(that._ODataModel, req).then(function (result) {
                var type = result.Returncode;
                var message = result.Returnmessage;
                var returnResult = result.Returnresult;
                if ("S" == type) {
                    var data = JSON.parse(returnResult);
                    if (data && data.length > 0) {
                        data.forEach(function (item) {
                            switch (item.zlllx) {
                                case "01":
                                    item.zlllxtext = "生产领料";
                                    break;
                                case "02":
                                    item.zlllxtext = "委外领料";
                                    break;
                                case "03":
                                    item.zlllxtext = "其他领料";
                                    break;
                                case "04":
                                    item.zlllxtext = "其他退料";
                                    break;
                                default:
                                    break;
                            };
                            that.setZllzttext(item);
                        });
                    }
                    that.getView().getModel("dataModel").setProperty("/data", data);
                    that.getView().getModel("appModel").setProperty("/currentType", "显示");
                    MessageToast.show(message);
                    that.globalBusyOff();
                } else {
                    that.getView().getModel("dataModel").setProperty("/data", []);
                    that.getView().getModel("appModel").setProperty("/currentType", "显示");
                    MessageToast.show(message);
                    that.globalBusyOff();
                }
            }).catch(function (err) {
                MessageToast.show("接口调用异常，请联系管理员！");
                that.globalBusyOff();
                console.log(err);
            });
        },
        onSendwms: function (oEvent) {
            var that = this;
            MessageBox.confirm(
                "是否下发WMS！", {
                title: "确认",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction == MessageBox.Action.YES) {
                        that._onSendwms();
                    }
                }
            }
            );

        },
        _onSendwms: async function () {
            var that = this;
            var data = this.getView().getModel("dataModel").getProperty("/data");
            var data = this.getView().getModel("dataModel").getProperty("/data");
            var selectItem = that.getSelectItem();
            if (!selectItem.length > 0) {
                MessageToast.show("请先选中要处理的项目");
                return;
            } else {

            }
            var RequestParameter = selectItem;
            var req = that.setReq("PP0018", RequestParameter);
            that.globalBusyOn();
            odataUtil.create(that._ODataModel, req).then(function (result) {
                var type = result.Returncode;
                var message = result.Returnmessage;
                var returnResult = result.Returnresult;
                if ("S" == type) {
                    var returnitemd = JSON.parse(returnResult);
                    if (returnitemd && returnitemd.length > 0) {
                        returnitemd.forEach(function (returnitem) {
                            data.forEach(function (dataitem) {
                                if (dataitem.zllno == returnitem.zllno
                                ) {
                                    dataitem.yy1_flag = returnitem.yy1_flag;
                                    dataitem.yy1_msg = returnitem.yy1_msg;
                                    if (dataitem.yy1_flag == 'S') {
                                        dataitem.flagIcon = "Success";
                                        dataitem.zllzt = returnitem.zllzt;
                                        that.setZllzttext(dataitem);
                                        dataitem.wmsno = returnitem.wmsno;
                                    } else {
                                        dataitem.flagIcon = "Error";
                                    }
                                }
                            });
                        });
                    }

                    that.getView().getModel("dataModel").setProperty("/data", data);
                    // MessageToast.show("处理完成，处理明细请查看行信息！");
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
        },
        onDelete: function (oEvent) {
            var that = this;
            MessageBox.confirm(
                "是否删除单据！", {
                title: "确认",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction == MessageBox.Action.YES) {
                        that._onDelete();
                    }
                }
            }
            );

        },
        _onDelete: async function () {
            var that = this;
            var data = this.getView().getModel("dataModel").getProperty("/data");
            var data = this.getView().getModel("dataModel").getProperty("/data");
            var selectItem = that.getSelectItem();
            if (!selectItem.length > 0) {
                MessageToast.show("请先选中要处理的项目");
                return;
            } else {

            }
            var RequestParameter = selectItem;
            var req = that.setReq("PP0015", RequestParameter);
            that.globalBusyOn();
            odataUtil.create(that._ODataModel, req).then(function (result) {
                var type = result.Returncode;
                var message = result.Returnmessage;
                var returnResult = result.Returnresult;
                if ("S" == type) {
                    var returnitemd = JSON.parse(returnResult);
                    if (returnitemd && returnitemd.length > 0) {
                        returnitemd.forEach(function (returnitem) {
                            data.forEach(function (dataitem) {
                                if (dataitem.zllno == returnitem.zllno
                                ) {
                                    dataitem.yy1_flag = returnitem.yy1_flag;
                                    dataitem.yy1_msg = returnitem.yy1_msg;
                                    if (dataitem.yy1_flag == 'S') {
                                        dataitem.flagIcon = "Success";
                                        dataitem.zllzt = returnitem.zllzt;
                                        that.setZllzttext(dataitem);
                                    } else {
                                        dataitem.flagIcon = "Error";
                                    }
                                }
                            });
                        });
                    }

                    that.getView().getModel("dataModel").setProperty("/data", data);
                    // MessageToast.show("处理完成，处理明细请查看行信息！");
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
        },
        getSelectItem: function () {
            var that = this;
            var data = this.getView().getModel("dataModel").getProperty("/data");
            var showItemDataIndex = this.getView().byId("_IDGenTable").getBinding("rows").aIndices;
            var selectIndex = this.getView().byId("_IDGenTable").getSelectedIndices();
            var selectItem = [];
            if (selectIndex && selectIndex.length > 0) {
                selectIndex.forEach(function (index) {
                    // var path = that.getView().byId("_IDGenTable").getRows()[index].getRowBindingContext().getPath()
                    var path = "/data/" + showItemDataIndex[index];
                    var rowData = that.getView().getModel("dataModel").getProperty(path);
                    let item = that.cloneObj(rowData);
                    delete item.editable;
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
            var newObj = {};
            if (obj instanceof Array) {
                newObj = [];
            }
            for (var key in obj) {
                var val = obj[key];
                //newObj[key] = typeof val === 'object' ? arguments.callee(val) : val; //arguments.callee 在哪一个函数中运行，它就代表哪个函数, 一般用在匿名函数中。  
                newObj[key] = typeof val === 'object' ? cloneObj(val) : val;
            }
            return newObj;
        },
        _registerForP13n: function () {
            const oTable = this.byId("_IDGenTable");
            this.oMetadataHelper = new MetadataHelper([
                {
                    key: "yy1_msg_col",
                    label: "消息",
                    path: "yy1_msg"
                },
                {
                    key: "zllno_col",
                    label: "领料单号",
                    path: "zllno"
                },
                {
                    key: "zllitemno_col",
                    label: "行号",
                    path: "zllitemno"
                },
                {
                    key: "zlllxtext_col",
                    label: "领料类型",
                    path: "zlllxtext"
                },
                {
                    key: "zllzttext_col",
                    label: "单据状态",
                    path: "zllzttext"
                },
                {
                    key: "productionplant_col",
                    label: "工厂",
                    path: "productionplant"
                },
                {
                    key: "zj_col",
                    label: "组件物料",
                    path: "zj"
                },
                {
                    key: "zjname_col",
                    label: "组件描述",
                    path: "zjname"
                },
                {
                    key: "zjgroupname_col",
                    label: "物料类型",
                    path: "zjgroupname"
                },
                {
                    key: "requestedqty_col",
                    label: "申请数量",
                    path: "requestedqty"
                },
                {
                    key: "zjunit_col",
                    label: "单位",
                    path: "zjunit"
                },
                {
                    key: "zcjtext_col",
                    label: "车间",
                    path: "zcjtext"
                },
                {
                    key: "storagelocationto_col",
                    label: "发出地点",
                    path: "storagelocationto"
                },
                {
                    key: "storagelocationname_col",
                    label: "接收地点",
                    path: "storagelocationname"
                },
                {
                    key: "manufacturingorder_col",
                    label: "生产订单",
                    path: "manufacturingorder"
                },
                {
                    key: "yy1_mfgbatch_ord_col",
                    label: "生产批次",
                    path: "yy1_mfgbatch_ord"
                },
                {
                    key: "cp_col",
                    label: "产品",
                    path: "cp"
                },
                {
                    key: "cpname_col",
                    label: "产品描述",
                    path: "cpname"
                },
                {
                    key: "purchaseorder_col",
                    label: "采购订单",
                    path: "purchaseorder"
                },
                {
                    key: "purchaseorderitem_col",
                    label: "采购单行",
                    path: "purchaseorderitem"
                },
                {
                    key: "subcontractor_col",
                    label: "供应商",
                    path: "subcontractor"
                },
                {
                    key: "zcreate_date_col",
                    label: "创建日期",
                    path: "zcreate_date"
                },
                {
                    key: "zhlbz_col",
                    label: "含量备注",
                    path: "zhlbz"
                },
                {
                    key: "zbz_col",
                    label: "备注",
                    path: "zbz"
                },
                {
                    key: "batch_col",
                    label: "WMS批次",
                    path: "batch"
                },
                {
                    key: "zcy_col",
                    label: "差异",
                    path: "zcy"
                }
            ]);

            this._mIntialWidth = {
                "yy1_msg_col": "4rem",
                "zllno_col": "6rem",
                "zllitemno_col": "5rem",
                "zlllxtext_col": "6rem",
                "zllzttext_col": "6rem",
                "productionplant_col": "4rem",
                "zj_col": "6rem",
                "zjname_col": "10rem",
                "zjgroupname_col": "8rem",
                "requestedqty_col": "6rem",
                "zjunit_col": "4rem",
                "zcjtext_col": "6rem",
                "storagelocationto_col": "6rem",
                "storagelocationname_col": "6rem",
                "manufacturingorder_col": "8rem",
                "yy1_mfgbatch_ord_col": "8rem",
                "cp_col": "8rem",
                "cpname_col": "8rem",
                "purchaseorder_col": "8rem",
                "purchaseorderitem_col": "6rem",
                "subcontractor_col": "8rem",
                "zcreate_date_col": "8rem",
                "zhlbz_col": "10rem",
                "zbz_col": "10rem",
                "batch_col": "10rem",
                "zcy_col": "6rem"
            };

            Engine.getInstance().register(oTable, {
                helper: this.oMetadataHelper,
                controller: {
                    Columns: new SelectionController({
                        targetAggregation: "columns",
                        control: oTable
                    }),
                    Sorter: new SortController({
                        control: oTable
                    }),
                    Groups: new GroupController({
                        control: oTable
                    }),
                    ColumnWidth: new sap.m.table.ColumnWidthController({
                        control: oTable
                    })
                }
            });

            Engine.getInstance().attachStateChange(this.handleStateChange.bind(this));
        },
        openPersoDialog: function (oEvt) {
            const oTable = this.byId("_IDGenTable");

            Engine.getInstance().show(oTable, ["Columns", "Sorter"], {
                contentHeight: "35rem",
                contentWidth: "32rem",
                source: oEvt.getSource()
            });
        },

        onColumnHeaderItemPress: function (oEvt) {
            const oTable = this.byId("_IDGenTable");
            const sPanel = oEvt.getSource().getIcon().indexOf("sort") >= 0 ? "Sorter" : "Columns";

            Engine.getInstance().show(oTable, [sPanel], {
                contentHeight: "35rem",
                contentWidth: "32rem",
                source: oTable
            });
        },

        onSort: function (oEvt) {
            const oTable = this.byId("_IDGenTable");
            const sAffectedProperty = this._getKey(oEvt.getParameter("column"));
            const sSortOrder = oEvt.getParameter("sortOrder");

            //Apply the state programatically on sorting through the column menu
            //1) Retrieve the current personalization state
            Engine.getInstance().retrieveState(oTable).then(function (oState) {

                //2) Modify the existing personalization state --> clear all sorters before
                oState.Sorter.forEach(function (oSorter) {
                    oSorter.sorted = false;
                });
                oState.Sorter.push({
                    key: sAffectedProperty,
                    descending: sSortOrder === sap.ui.core.SortOrder.Descending
                });

                //3) Apply the modified personalization state to persist it in the VariantManagement
                Engine.getInstance().applyState(oTable, oState);
            });
        },

        onColumnMove: function (oEvt) {
            const oTable = this.byId("_IDGenTable");
            const oAffectedColumn = oEvt.getParameter("column");
            const iNewPos = oEvt.getParameter("newPos");
            const sKey = this._getKey(oAffectedColumn);
            oEvt.preventDefault();

            Engine.getInstance().retrieveState(oTable).then(function (oState) {

                const oCol = oState.Columns.find(function (oColumn) {
                    return oColumn.key === sKey;
                }) || {
                    key: sKey
                };
                oCol.position = iNewPos;

                Engine.getInstance().applyState(oTable, {
                    Columns: [oCol]
                });
            });
        },

        _getKey: function (oControl) {
            return oControl.data("p13nKey");
        },

        handleStateChange: function (oEvt) {
            const oTable = this.byId("_IDGenTable");
            const oState = oEvt.getParameter("state");

            if (!oState) {
                return;
            }

            oTable.getColumns().forEach(function (oColumn) {

                const sKey = this._getKey(oColumn);
                const sColumnWidth = oState.ColumnWidth[sKey];

                oColumn.setWidth(sColumnWidth || this._mIntialWidth[sKey]);

                oColumn.setVisible(false);
                oColumn.setSortOrder(sap.ui.core.SortOrder.None);
            }.bind(this));

            oState.Columns.forEach(function (oProp, iIndex) {
                const oCol = this.byId("_IDGenTable").getColumns().find((oColumn) => oColumn.data("p13nKey") === oProp.key);
                oCol.setVisible(true);

                oTable.removeColumn(oCol);
                oTable.insertColumn(oCol, iIndex);
            }.bind(this));

            const aSorter = [];
            oState.Sorter.forEach(function (oSorter) {
                const oColumn = this.byId("_IDGenTable").getColumns().find((oColumn) => oColumn.data("p13nKey") === oSorter.key);
                /** @deprecated As of version 1.120 */
                oColumn.setSorted(true);
                oColumn.setSortOrder(oSorter.descending ? sap.ui.core.SortOrder.Descending : sap.ui.core.SortOrder.Ascending);
                aSorter.push(new Sorter(this.oMetadataHelper.getProperty(oSorter.key).path, oSorter.descending));
            }.bind(this));
            oTable.getBinding("rows").sort(aSorter);
        },

        onColumnResize: function (oEvt) {
            const oColumn = oEvt.getParameter("column");
            const sWidth = oEvt.getParameter("width");
            const oTable = this.byId("_IDGenTable");

            const oColumnState = {};
            oColumnState[this._getKey(oColumn)] = sWidth;

            Engine.getInstance().applyState(oTable, {
                ColumnWidth: oColumnState
            });
        },
        createColumnConfig: function () {
            return [
                {
                    type: EdmType.String,
                    label: "消息",
                    property: "yy1_msg"
                },
                {
                    type: EdmType.String,
                    label: "领料单号",
                    property: "zllno"
                },
                {
                    type: EdmType.String,
                    label: "行号",
                    property: "zllitemno"
                },
                {
                    type: EdmType.String,
                    label: "领料类型",
                    property: "zlllxtext"
                },
                {
                    type: EdmType.String,
                    label: "单据状态",
                    property: "zllzttext"
                },
                {
                    type: EdmType.String,
                    label: "工厂",
                    property: "productionplant"
                },
                {
                    type: EdmType.String,
                    label: "组件物料",
                    property: "zj"
                },
                {
                    type: EdmType.String,
                    label: "组件描述",
                    property: "zjname"
                },
                {
                    type: EdmType.String,
                    label: "物料类型",
                    property: "zjgroupname"
                },
                {
                    type: EdmType.String,
                    label: "申请数量",
                    property: "requestedqty"
                },
                {
                    type: EdmType.String,
                    label: "单位",
                    property: "zjunit"
                },
                {
                    type: EdmType.String,
                    label: "车间",
                    property: "zcjtext"
                },
                {
                    type: EdmType.String,
                    label: "领用地点",
                    property: "storagelocationname"
                },
                {
                    type: EdmType.String,
                    label: "生产订单",
                    property: "manufacturingorder"
                },
                {
                    type: EdmType.String,
                    label: "生产批次",
                    property: "yy1_mfgbatch_ord"
                },
                {
                    type: EdmType.String,
                    label: "采购订单",
                    property: "purchaseorder"
                },
                {
                    type: EdmType.String,
                    label: "采购单行",
                    property: "purchaseorderitem"
                },
                {
                    type: EdmType.String,
                    label: "创建日期",
                    property: "zcreate_date"
                },
                {
                    type: EdmType.String,
                    label: "WMS批次",
                    property: "batch"
                },
                {
                    type: EdmType.String,
                    label: "差异",
                    property: "zcy"
                }
            ];
        },
        onExport: function () {
            var aCols, oBinding, oSettings, oSheet, oTable;

            oTable = this.byId('_IDGenTable');
            oBinding = oTable.getBinding('rows');
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
        },
        onstoragelocationChange: function (oEvent) {
            var selectItem = oEvent.getSource().oParent;
            var key = oEvent.getParameters().selectedItem.getKey();
            var zcj;
            var zcjtext;
            switch (key) {
                case "1005":
                    zcj = "CTZJCJ";
                    zcjtext = "固体制剂车间";
                    break;
                case "1006":
                    zcj = "BZCJ";
                    zcjtext = "包装车间";
                    break;
                case "1007":
                    zcj = "HQCJ";
                    zcjtext = "红曲车间";
                    break;
                case "1008":
                    zcj = "KFYCJ";
                    zcjtext = "口服液车间";
                    break;
                case "1009":
                    zcj = "RJNCJ";
                    zcjtext = "软胶囊车间";
                    break;
            };
            var path = selectItem.getBindingContext("dataModel").getPath();
            var zcjpath = path + "/zcj";
            var zcjtextpath = path + "/zcjtext";
            this.getView().getModel("dataModel").setProperty(zcjpath, zcj);
            this.getView().getModel("dataModel").setProperty(zcjtextpath, zcjtext);
        },
        checkDelete: function (selectedItem) {
            var that = this;
            var data = this.getView().getModel("dataModel").getProperty("/data");
            selectedItem.forEach(function (item) {
                data.forEach(function (dataItem) {
                    dataItem.flagIcon = "";
                    dataItem.yy1_flag = "";
                    dataItem.yy1_msg = "";
                    if (dataItem.zllno == item.zllno) {
                        if (item.zllzt !== 'NEW') {
                            dataitem.yy1_flag = 'E';
                            dataitem.yy1_msg = '领料单' + item.zllno + "状态非【新建】，无法删除";
                            dataitem.flagIcon = "Error";
                        }
                    }
                })
            });
            let newSelectedItem = array.filter(selectedItem => item.yy1_flag !== 'E');
            selectedItem = newSelectedItem;
            this.getView().getModel("dataModel").setProperty("/data", data);
        },
        setZllzttext: function (dataItem) {
            switch (dataItem.zllzt) {
                case "NEW":
                    dataItem.zllzttext = "新建";
                    break;
                case "RELEASE":
                    dataItem.zllzttext = "下发WMS";
                    break;
                case "DELETE":
                    dataItem.zllzttext = "删除";
                    break;
                default:
                    break;
            }
        }
    });
});