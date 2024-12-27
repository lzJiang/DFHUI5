sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "zui50007/model/odataUtil",
    "sap/ui/model/Sorter",
    "zui50007/model/formatter",
    'sap/ui/export/library',
    'sap/ui/export/Spreadsheet',
    'sap/m/p13n/Engine',
    'sap/m/p13n/SelectionController',
    'sap/m/p13n/SortController',
    'sap/m/p13n/GroupController',
    'sap/m/p13n/MetadataHelper',
    'sap/ui/core/library',
    'sap/m/table/ColumnWidthController',
    'sap/ui/core/Fragment'
], (BaseController, Controller, JSONModel, MessageToast, MessageBox, odataUtil, Sorter, formatter,
    exportLibrary, Spreadsheet, Engine, SelectionController, SortController, GroupController, MetadataHelper,
    CoreLibrary, ColumnWidthController, Fragment) => {
    "use strict";

    var EdmType = exportLibrary.EdmType;
    return BaseController.extend("zui50007.controller.mainView", {
        currentType: null,
        confirm: null,
        formatter: formatter,
        onInit() {
            var productionplant = sessionStorage.getItem("productionplant");
            this.getView().setModel(new JSONModel({
                cpname: "",
                productionplant: productionplant,
                manufacturingorderList: [],
                yy1_mfgbatch_ordList: []
            }), "searchModel");
            this.getView().setModel(new JSONModel({
                data: []
            }), "dataModel");
            this.getView().setModel(new JSONModel({
                ProductCollection: []
            }), "valuehelpModel");
            this.getView().setModel(new JSONModel({
                currentType: "显示",
                enableSave: false
            }), "appModel");
            this._ODataModel = this.getOwnerComponent().getModel("odataModel");
            this._ResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
            this._registerForP13n();
        },
        _onItemSearch: async function (item, path) {
            var that = this;
            var searchData = this.getView().getModel("searchModel").oData;
            var setitem = {
                zjname: "",
                requestedqtyunit: "",
                zjunit: "",
                sykc: ""
            }
            if (this.isEmpty(item.zj)) {
                return;
            }
            var RequestParameter = {
                productionplant: searchData.productionplant,
                zj: item.zj,
                storagelocation: this.isEmpty(item.storagelocationto) ? "" : item.storagelocationto
            };
            var req = that.setReq("PP0012", RequestParameter);
            await odataUtil.create(that._ODataModel, req).then(function (result) {
                var type = result.Returncode;
                var message = result.Returnmessage;
                var returnResult = result.Returnresult;
                if ("S" == type) {
                    var data = JSON.parse(returnResult);
                    if (!that.isEmpty(data.zjname)) {
                        setitem.zjname = data.zjname;
                    };
                    if (!that.isEmpty(data.requestedqtyunit)) {
                        setitem.requestedqtyunit = data.requestedqtyunit;
                    };
                    if (!that.isEmpty(data.zjunit)) {
                        setitem.zjunit = data.zjunit;
                    };
                    if (!that.isEmpty(data.sykc)) {
                        setitem.sykc = data.sykc;
                    };
                }
                item.zjname = setitem.zjname;
                item.requestedqtyunit = setitem.requestedqtyunit;
                item.zjunit = setitem.zjunit;
                item.sykc = setitem.sykc;
                that.getView().getModel("dataModel").setProperty(path, item);
            }).catch(function (err) {
                item.zjname = setitem.zjname;
                item.requestedqtyunit = setitem.requestedqtyunit;
                item.zjunit = setitem.zjunit;
                item.sykc = setitem.sykc;
                that.getView().getModel("dataModel").setProperty(path, item);
                MessageToast.show("接口调用异常，请联系管理员！");
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
                "是否生成领料单！", {
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
            } else {
                var checkSave = this.checkSave(selectItem);
                if (checkSave.flag == 'E') {
                    MessageToast.show(checkSave.message);
                    return;
                }
            }
            var RequestParameter = {
                zllno: "",
                zlllx: "04",
                zllzt: "NEW",
                productionplant: this.getView().getModel("searchModel").getProperty("/productionplant"),
                zsendwms: "",
                zcreate_date: "",
                zcreate_time: "",
                zcreate_user: "",
                zupdate_date: "",
                zupdate_time: "",
                zupdate_user: "",
                itemd: selectItem
            };
            var req = that.setReq("PP0014", RequestParameter);
            that.globalBusyOn();
            odataUtil.create(that._ODataModel, req).then(function (result) {
                var type = result.Returncode;
                var message = result.Returnmessage;
                var returnResult = result.Returnresult;
                if ("S" == type) {
                    var returndata = JSON.parse(returnResult);
                    var returnitemd = returndata.itemd;
                    if (returnitemd && returnitemd.length > 0) {
                        returnitemd.forEach(function (returnitem) {
                            data.forEach(function (dataitem) {
                                if (dataitem.zllitemno == returnitem.zllitemno
                                ) {
                                    dataitem.yy1_flag = returndata.yy1_flag;
                                    dataitem.yy1_msg = returndata.yy1_msg;
                                    if (dataitem.yy1_flag == 'S') {
                                        dataitem.flagIcon = "Success";
                                        dataitem.zllno = returndata.zllno;
                                        dataitem.zcreate_date = returndata.zcreate_date;
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
                    key: "zjunit_col",
                    label: "单位",
                    path: "zjunit"
                },
                {
                    key: "requestedqty_col",
                    label: "申请数量",
                    path: "requestedqty"
                },
                {
                    key: "batch_col",
                    label: "WMS批次",
                    path: "batch"
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
                    key: "sykc_col",
                    label: "线边仓剩余库存",
                    path: "sykc"
                },
                {
                    key: "zcreate_date_col",
                    label: "创建日期",
                    path: "zcreate_date"
                }
            ]);

            this._mIntialWidth = {
                "yy1_msg_col": "4rem",
                "zllno_col": "6rem",
                "zllitemno_col": "6rem",
                "productionplant_col": "4rem",
                "zj_col": "6rem",
                "zjname_col": "10rem",
                "zjunit_col": "4rem",
                "requestedqty_col": "6rem",
                "batch_col": "10rem",
                "zcjtext_col": "8rem",
                "storagelocationto_col": "10rem",
                "storagelocationname_col": "6rem",
                "sykc_col": "8rem",
                "zcreate_date_col": "8rem"
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
                    label: "单位",
                    property: "zjunit"
                },
                {
                    type: EdmType.String,
                    label: "申请数量",
                    property: "requestedqty"
                },
                {
                    type: EdmType.String,
                    label: "WMS批次",
                    property: "batch"
                },
                {
                    type: EdmType.String,
                    label: "车间",
                    property: "zcjtext"
                },
                {
                    type: EdmType.String,
                    label: "发出地点",
                    property: "storagelocationto"
                },
                {
                    type: EdmType.String,
                    label: "接收地点",
                    property: "storagelocationname"
                },
                {
                    type: EdmType.String,
                    label: "线边仓剩余库存",
                    property: "sykc"
                },
                {
                    type: EdmType.String,
                    label: "创建日期",
                    property: "zcreate_date"
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
        onAddLine: function (oEvent) {
            var data = this.getView().getModel("dataModel").getProperty("/data");
            var searchData = this.getView().getModel("searchModel").oData;
            var newitem = {
                productionplant: searchData.productionplant
            }
            data.push(newitem);
            this._resetitemno(data);
            this.getView().getModel("dataModel").setProperty("/data", data);
        },
        onDelLine: function (oEvent) {
            var data = this.getView().getModel("dataModel").getProperty("/data");
            var showItemDataIndex = this.getView().byId("_IDGenTable").getBinding("rows").aIndices;
            var selectIndex = this.getView().byId("_IDGenTable").getSelectedIndices();
            var delIndexArr = [];
            if (selectIndex && selectIndex.length > 0) {
                selectIndex.forEach(function (selectIndex) {
                    var delIndex = showItemDataIndex[selectIndex];
                    delIndexArr.push(delIndex);
                })
            }
            data = data.filter((element, index) => !delIndexArr.includes(index));
            this._resetitemno(data);
            this.getView().getModel("dataModel").setProperty("/data", data);
        },
        _resetitemno: function (data) {
            let itemno = 0;
            if (data && data.length > 0) {
                data.forEach(function (dataitem) {
                    itemno = itemno + 1;
                    dataitem.zllitemno = itemno;
                })
            }
        },
        onzjChange: function (oEvent) {
            var selectItem = oEvent.getSource().oParent;
            var path = selectItem.getBindingContext("dataModel").getPath();
            var item = this.getView().getModel("dataModel").getProperty(path);
            this._onItemSearch(item, path);
        },
        onstoragelocationChange: function (oEvent) {
            var selectItem = oEvent.getSource().oParent;
            var path = selectItem.getBindingContext("dataModel").getPath();
            var item = this.getView().getModel("dataModel").getProperty(path);
            this._onsetcj(oEvent);
            this._onItemSearch(item, path);
        },
        _onsetcj: function (oEvent) {
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
           this.getView().getModel("dataModel").setProperty(zcjpath,zcj);
           this.getView().getModel("dataModel").setProperty(zcjtextpath,zcjtext);
        },
        checkSave: function (selectedItem) {
            var that = this;
            var checkSave = {
                flag: "S",
                message: ""
            }
            selectedItem.forEach(function (item) {
                if (!that.isEmpty(item.zllno)) {
                    checkSave.flag = 'E';
                    checkSave.message = '行号' + item.zllitemno + '已生成领料单，请勿重复处理';
                    return;
                }
            });
            return checkSave;
        },

        onValueHelpRequest: function (oEvent) {
            var sInputValue = oEvent.getSource().getValue(),
                oView = this.getView();
            this._helppath = oEvent.getSource().getBindingContext("dataModel").getPath();
            if (!this._pValueHelpDialog) {
                this._pValueHelpDialog = Fragment.load({
                    id: oView.getId(),
                    name: "zui50007.view.productValueHelpDialog",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }
            this._pValueHelpDialog.then(function (oDialog) {
                // // Create a filter for the binding
                // oDialog.getBinding("items").filter([new Filter("productname", FilterOperator.Contains, sInputValue)]);
                // // Open ValueHelpDialog filtered by the input's value
                oDialog.open();
            });
        },
        onProductValueHelpSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var that = this;
            var searchData = this.getView().getModel("searchModel").oData;
            var RequestParameter = {
                product: this.isEmpty(sValue) ? "" : sValue,
                productname: this.isEmpty(sValue) ? "" : sValue
            };
            var req = that.setReq("PP0016", RequestParameter);
            that.globalBusyOn();
            odataUtil.create(that._ODataModel, req).then(function (result) {
                var type = result.Returncode;
                var message = result.Returnmessage;
                var returnResult = result.Returnresult;
                if ("S" == type) {
                    var data = JSON.parse(returnResult);
                    that.getView().getModel("valuehelpModel").setProperty("/ProductCollection", data);
                    that.globalBusyOff();
                } else {
                    that.getView().getModel("valuehelpModel").setProperty("/ProductCollection", []);
                    MessageToast.show(message);
                    that.globalBusyOff();
                }
            }).catch(function (err) {
                that.getView().getModel("valuehelpModel").setProperty("/ProductCollection", []);
                MessageToast.show("接口调用异常，请联系管理员！");
                that.globalBusyOff();
                console.log(err);
            });
        },

        onProductValueHelpClose: function (oEvent) {
            var oSelectedItem = oEvent.getParameter("selectedItem");
            if (!oSelectedItem) {
                return;
            }
            var path = this._helppath + "/zj";
            this.getView().getModel("dataModel").setProperty(path, oSelectedItem.getTitle());
            var item = this.getView().getModel("dataModel").getProperty(this._helppath);
            this._onItemSearch(item, this._helppath);
        }
    });
});