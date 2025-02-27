sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "zui50002/model/odataUtil",
    "sap/ui/model/Sorter",
    "zui50002/model/formatter",
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
    return BaseController.extend("zui50002.controller.mainView", {
        currentType: null,
        confirm: null,
        formatter: formatter,
        onInit() {
            var plndorderplannedstartdate = new Date();
            plndorderplannedstartdate.setDate(plndorderplannedstartdate.getDate() - 7);
            var plndorderplannedstartdatestr = plndorderplannedstartdate.toISOString().substring(0, 10);
            this.getView().setModel(new JSONModel({
                plndorderplannedstartdate: plndorderplannedstartdatestr
            }), "searchModel");
            this.getView().setModel(new JSONModel({
                data: ""
            }), "dataModel");
            this.getView().getModel("dataModel").setSizeLimit(10000);
            this.getView().setModel(new JSONModel({
                currentType: "显示",
                enableSave: false
            }), "appModel");
            this._ODataModel = this.getOwnerComponent().getModel("odataModel");
            this._ResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            this._registerForP13n();
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
                    that.getView().getModel("appModel").setProperty("/enableSave", false);
                    MessageToast.show(message);
                    that.globalBusyOff();
                } else {
                    that.getView().getModel("dataModel").setProperty("/data", []);
                    that.getView().getModel("appModel").setProperty("/currentType", "显示");
                    that.getView().getModel("appModel").setProperty("/enableSave", false);
                    MessageToast.show(message);
                    that.globalBusyOff();
                }
            }).catch(function (err) {
                MessageToast.show("接口调用异常，请联系管理员！");
                that.globalBusyOff();
                console.log(err);
            });
        },
        onEdit: function (oEvent) {
            var that = this;
            if (this.getView().getModel("appModel").getProperty("/currentType") == "显示") {
                that.getView().getModel("appModel").setProperty("/enableSave", true);
                this.getView().getModel("appModel").setProperty("/currentType", "更改");
                var data = this.getView().getModel("dataModel").getProperty("/data");
                if (data && data.length > 0) {
                    data.forEach(function (item) {
                            item.editable = true;
                    });
                    that.getView().getModel("dataModel").setProperty("/data", data);
                }
            }
        },
        onSave: function (oEvent) {
            var that = this;
            MessageBox.confirm(
                "确认保存！", {
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
                var RequestParameter = selectOneItemArr;
                var req = that.setReq("PP0007", RequestParameter);
                that.globalBusyOn();
                await odataUtil.create(that._ODataModel, req).then(function (result) {
                    var type = result.Returncode;
                    var message = result.Returnmessage;
                    var returnResult = result.Returnresult;
                    if ("S" == type) {
                        var returndata = JSON.parse(returnResult);
                        if (returndata && returndata.length > 0) {
                            returndata.forEach(function (returnitem) {
                                data.forEach(function (dataitem) {
                                    if (dataitem.plannedorder == returnitem.plannedorder) {
                                        dataitem.yy1_flag = returnitem.yy1_flag;
                                        dataitem.yy1_msg = returnitem.yy1_msg;
                                        dataitem.lastchangedbyuser = returnitem.lastchangedbyuser;
                                        dataitem.lastchangedate = returnitem.lastchangedate;
                                        if (dataitem.yy1_flag == 'S') {
                                            dataitem.flagIcon = "Success";
                                        } else {
                                            dataitem.flagIcon = "Error";
                                        }
                                    }
                                });
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
            var showItemDataIndex = this.getView().byId("_IDGenTable").getBinding("rows").aIndices;
            var selectIndex = this.getView().byId("_IDGenTable").getSelectedIndices();
            var selectItem = [];
            if (selectIndex && selectIndex.length > 0) {
                selectIndex.forEach(function (index) {
                    // var path = that.getView().byId("_IDGenTable").getRows()[index].getRowBindingContext().getPath();
                    var path = "/data/" + showItemDataIndex[index];
                    var rowData = that.getView().getModel("dataModel").getProperty(path);
                    let item = that.cloneObj(rowData);
                    if (item.plannedorderisfirm_bool == true) {
                        item.plannedorderisfirm = "X";
                    } else {
                        item.plannedorderisfirm = "";
                    }
                    delete item.plannedorderisfirm_bool;
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
                    key: "productionplant_col",
                    label: "工厂",
                    path: "productionplant"
                },
                {
                    key: "plannedorder_col",
                    label: "计划订单",
                    path: "plannedorder"
                },
                {
                    key: "material_col",
                    label: "物料",
                    path: "material"
                },
                {
                    key: "productname_col",
                    label: "物料描述",
                    path: "productname"
                },
                {
                    key: "totalquantity_col",
                    label: "计划数量",
                    path: "totalquantity"
                },
                {
                    key: "productionunit_col",
                    label: "单位",
                    path: "productionunit"
                },
                {
                    key: "yy1_plannebatch_pla_col",
                    label: "计划批次",
                    path: "yy1_plannebatch_pla"
                },
                {
                    key: "plndorderplannedstartdate_col",
                    label: "计划开始日期",
                    path: "plndorderplannedstartdate"
                },
                {
                    key: "plndorderplannedenddate_col",
                    label: "计划结束日期",
                    path: "plndorderplannedenddate"
                },
                {
                    key: "mrpcontroller_col",
                    label: "MRP控制者",
                    path: "mrpcontroller"
                },
                {
                    key: "mrpgroup_col",
                    label: "MRP组",
                    path: "mrpgroup"
                },
                {
                    key: "productionversion_col",
                    label: "生产版本",
                    path: "productionversion"
                },
                {
                    key: "plannedorderisfirm_col",
                    label: "固定标识",
                    path: "plannedorderisfirm"
                },
                {
                    key: "lastchangedbyuser_col",
                    label: "更改人",
                    path: "lastchangedbyuser"
                },
                {
                    key: "lastchangedate_col",
                    label: "更改日期",
                    path: "lastchangedate"
                }
            ]);

            this._mIntialWidth = {
                "yy1_msg_col": "4rem",
                "productionplant_col": "4rem",
                "plannedorder_col": "6rem",
                "material_col": "6rem",
                "productname_col": "8rem",
                "totalquantity_col": "6rem",
                "productionunit_col": "4rem",
                "yy1_plannebatch_pla_col": "8rem",
                "plndorderplannedstartdate_col": "10rem",
                "plndorderplannedenddate_col": "10rem",
                "mrpcontroller_col": "4rem",
                "mrpgroup_col": "4rem",
                "productionversion_col": "4rem",
                "plannedorderisfirm_bool_col": "4rem",
                "lastchangedbyuser_col": "6rem",
                "lastchangedate_col": "6rem"
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
                    label: "消息",
                    property: "yy1_msg"
                },
                {
                    type: EdmType.String,
                    label: "工厂",
                    property: "productionplant"
                },
                {
                    type: EdmType.String,
                    label: "计划订单",
                    property: "plannedorder"
                },
                {
                    type: EdmType.String,
                    label: "物料",
                    property: "material"
                },
                {
                    type: EdmType.String,
                    label: "物料描述",
                    property: "productname"
                },
                {
                    type: EdmType.String,
                    label: "计划数量",
                    property: "totalquantity"
                },
                {
                    type: EdmType.String,
                    label: "单位",
                    property: "productionunit"
                },
                {
                    type: EdmType.String,
                    label: "计划批次",
                    property: "yy1_plannebatch_pla"
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
                    label: "MRP控制者",
                    property: "mrpcontroller"
                },
                {
                    type: EdmType.String,
                    label: "MRP组",
                    property: "mrpgroup"
                },
                {
                    type: EdmType.String,
                    label: "生产版本",
                    property: "productionversion"
                },
                {
                    type: EdmType.String,
                    label: "固定标识",
                    property: "plannedorderisfirm"
                },
                {
                    type: EdmType.String,
                    label: "更改人",
                    property: "lastchangedbyuser"
                },
                {
                    type: EdmType.String,
                    label: "更改日期",
                    property: "lastchangedate"
                }];
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
        }
    });
});