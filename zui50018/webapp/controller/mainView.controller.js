sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "zui50018/model/odataUtil",
    "sap/ui/model/Sorter",
    "zui50018/model/formatter",
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
    return BaseController.extend("zui50018.controller.mainView", {
        currentType: null,
        confirm: null,
        formatter: formatter,
        onInit() {
            var claimsuccesstimestart = new Date();
            claimsuccesstimestart.setDate(claimsuccesstimestart.getDate() - 7);
            var claimsuccesstimestartstr = claimsuccesstimestart.toISOString().substring(0, 10);
            claimsuccesstimestartstr.replaceAll("-", "");
            this.getView().setModel(new JSONModel({
                extend1: "",
                transactionserialnumber: "",
                companycode: "",
                merchantcode: "",
                claimsuccesstimestart: claimsuccesstimestartstr,
                claimsuccesstimeend: ""
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
            var req = that.setReq("FI0003", RequestParameter);
            that.globalBusyOn();
            odataUtil.create(that._ODataModel, req).then(function (result) {
                var type = result.Returncode;
                var message = result.Returnmessage;
                var returnResult = result.Returnresult;
                if ("S" == type) {
                    var data = JSON.parse(returnResult);
                    if (data && data.length > 0) {
                        data.forEach(function (item) {
                            item.accountingdocumenturl = "/ui#AccountingDocument-manageV2&/C_ManageJournalEntryTP(CompanyCode='" + item.companycode + "',FiscalYear='" + item.fiscalyear + "',AccountingDocument='" + item.accountingdocument + "')";
                            if (item.flag == 'S') {
                                item.flagIcon = "Success";
                            } else if (item.flag == 'E') {
                                item.flagIcon = "Error";
                            }
                        });
                    }
                    that.getView().getModel("dataModel").setProperty("/data", data);
                    // that.getView().getModel("appModel").setProperty("/currentType", "显示");
                    // that.getView().getModel("appModel").setProperty("/enableSave", false);
                    MessageToast.show(message);

                    that.globalBusyOff();
                } else {
                    that.getView().getModel("dataModel").setProperty("/data", []);
                    // that.getView().getModel("appModel").setProperty("/currentType", "显示");
                    // that.getView().getModel("appModel").setProperty("/enableSave", false);
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
                        // if (!that.isEmpty(item.yy1_check) && that.isEmpty(item.orderisdelivered)) {
                        if (that.isEmpty(item.orderisdelivered)) {
                            item.editable = true;
                        }
                    });
                    that.getView().getModel("dataModel").setProperty("/data", data);
                }
            }
        },
        onSave: function (oEvent) {
            var that = this;
            MessageBox.confirm(
                "确认重处理！", {
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
                // let selectOneItemArr = [];
                // selectOneItemArr.push(selectOneItem);
                var RequestParameter = selectOneItem;
                var req = that.setReq("FI0004", RequestParameter);
                that.globalBusyOn();
                await odataUtil.create(that._ODataModel, req).then(function (result) {
                    var type = result.Returncode;
                    var message = result.Returnmessage;
                    var returnResult = result.Returnresult;
                    if ("S" == type) {
                        var returndata = JSON.parse(returnResult);
                        var returnitem = returndata;
                        data.forEach(function (dataitem) {
                            if (dataitem.transactionserialnumber == returnitem.transactionserialnumber) {
                                dataitem.flag = returnitem.flag;
                                dataitem.msg = returnitem.msg;
                                dataitem.accountingdocument = returnitem.accountingdocument;
                                dataitem.fiscalyear = returnitem.fiscalyear;
                                dataitem.reversedaccountingdocument = returnitem.reversedaccountingdocument;
                                dataitem.reversedfiscalyear = returnitem.reversedfiscalyear;
                                dataitem.companycode = returnitem.companycode;
                                dataitem.glaccount = returnitem.glaccount;
                                dataitem.housebank = returnitem.housebank;
                                dataitem.housebankaccount = returnitem.housebankaccount;
                                dataitem.transactioncurrency = returnitem.transactioncurrency;
                                dataitem.updated_date = returnitem.updated_date;
                                dataitem.updated_by = returnitem.updated_by;
                                dataitem.accountingdocumenturl = "/ui#AccountingDocument-manageV2&/C_ManageJournalEntryTP(CompanyCode='" + dataitem.companycode + "',FiscalYear='" + dataitem.fiscalyear + "',AccountingDocument='" + dataitem.accountingdocument + "')";
                                if (dataitem.flag == 'S') {
                                    dataitem.flagIcon = "Success";
                                } else if (dataitem.flag == 'E') {
                                    dataitem.flagIcon = "Error";
                                }
                            }
                        });
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
            // var RequestParameter = selectItem;
            // var req = that.setReq("PP0003", RequestParameter);
            // that.globalBusyOn();
            // odataUtil.create(that._ODataModel, req).then(function (result) {
            //     var type = result.Returncode;
            //     var message = result.Returnmessage;
            //     var returnResult = result.Returnresult;
            //     if ("S" == type) {
            //         var returndata = JSON.parse(returnResult);
            //         if (returndata && returndata.length > 0) {
            //             returndata.forEach(function (returnitem) {
            //                 data.forEach(function (dataitem) {
            //                     if (dataitem.manufacturingorder == returnitem.manufacturingorder) {
            //                         dataitem.flag = returnitem.flag;
            //                         dataitem.msg = returnitem.msg;
            //                         if (dataitem.flag == 'S') {
            //                             dataitem.flagIcon = "Success";
            //                         } else {
            //                             dataitem.flagIcon = "Error";
            //                         }
            //                         dataitem.status = that.setItemStatus(dataitem);
            //                     }
            //                 });
            //             });
            //         }
            //         that.getView().getModel("dataModel").setProperty("/data", data);
            //         // MessageToast.show("处理完成，处理明细请查看行信息！");
            //         that.globalBusyOff();
            //     } else {
            //         MessageToast.show(message);
            //         that.globalBusyOff();
            //     }
            // }).catch(function (err) {
            //     MessageToast.show("接口调用异常，请联系管理员！");
            //     that.globalBusyOff();
            //     console.log(err);
            // });

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
                    item.editable = "";
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
                var val = obj[key] == null ? "" : obj[key];
                //newObj[key] = typeof val === 'object' ? arguments.callee(val) : val; //arguments.callee 在哪一个函数中运行，它就代表哪个函数, 一般用在匿名函数中。  
                newObj[key] = typeof val === 'object' ? cloneObj(val) : val;
            }
            return newObj;
        },
        _registerForP13n: function () {
            const oTable = this.byId("_IDGenTable");
            this.oMetadataHelper = new MetadataHelper([
                {
                    key: "msg_col",
                    label: "消息",
                    path: "msg"
                },
                {
                    key: "transactionserialnumber_col",
                    label: "交易流水号",
                    path: "transactionserialnumber"
                },
                {
                    key: "accountingdocument_col",
                    label: "会计凭证号",
                    path: "accountingdocument"
                },
                {
                    key: "reversedaccountingdocument_col",
                    label: "冲销会计凭证号",
                    path: "reversedaccountingdocument"
                },
                {
                    key: "extend1_col",
                    label: "款项性质",
                    path: "extend1"
                },
                {
                    key: "paymentnaturedetail_col",
                    label: "款项细分",
                    path: "paymentnaturedetail"
                },
                {
                    key: "accountno_col",
                    label: "银行账号",
                    path: "accountno"
                },
                {
                    key: "claimamount_col",
                    label: "认领金额",
                    path: "claimamount"
                },
                {
                    key: "claimsuccesstime_col",
                    label: "认领日期",
                    path: "claimsuccesstime"
                },
                {
                    key: "createbyname_col",
                    label: "创建人姓名",
                    path: "createbyname"
                },
                {
                    key: "banktransactiondate_col",
                    label: "交易日期",
                    path: "banktransactiondate"
                },
                {
                    key: "bankserialnumber_col",
                    label: "银行流水号",
                    path: "bankserialnumber"
                },
                {
                    key: "digest_col",
                    label: "摘要",
                    path: "digest"
                },
                {
                    key: "merchantcode_col",
                    label: "客商编号",
                    path: "merchantcode"
                },
                {
                    key: "merchantname_col",
                    label: "客商名称",
                    path: "merchantname"
                },
                {
                    key: "remark_col",
                    label: "备注",
                    path: "remark"
                },
                {
                    key: "companycode_col",
                    label: "公司代码",
                    path: "companycode"
                },
                {
                    key: "glaccount_col",
                    label: "银行科目",
                    path: "glaccount"
                },
                {
                    key: "housebank_col",
                    label: "开户行",
                    path: "housebank"
                },
                {
                    key: "housebankaccount_col",
                    label: "开户行账户",
                    path: "housebankaccount"
                },
                {
                    key: "transactioncurrency_col",
                    label: "币种",
                    path: "transactioncurrency"
                },
                {
                    key: "created_date_col",
                    label: "接收日期",
                    path: "created_date"
                },
                {
                    key: "updated_date_col",
                    label: "处理日期",
                    path: "updated_date"
                },
                {
                    key: "updated_by_col",
                    label: "处理人",
                    path: "updated_by"
                }
            ]);

            this._mIntialWidth = {
                "msg_col": "4rem",
                "transactionserialnumber_col": "10rem",
                "accountingdocument_col": "8rem",
                "reversedaccountingdocument_col": "8rem",
                "extend1_col": "10rem",
                "paymentnaturedetail_col": "8rem",
                "accountno_col": "8rem",
                "claimamount_col": "8rem",
                "claimsuccesstime_col": "8rem",
                "createbyname_col": "8rem",
                "banktransactiondate_col": "8rem",
                "bankserialnumber_col": "8rem",
                "digest_col": "10rem",
                "merchantcode_col": "6rem",
                "merchantname_col": "10rem",
                "remark_col": "10rem",
                "companycode_col": "6rem",
                "glaccount_col": "8rem",
                "housebank_col": "6rem",
                "housebankaccount_col": "6rem",
                "transactioncurrency_col": "6rem",
                "created_date_col": "8rem",
                "updated_date_col": "8rem",
                "updated_by_col": "8rem"
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
                    property: "msg"
                },
                {
                    type: EdmType.String,
                    label: "交易流水号",
                    property: "transactionserialnumber"
                },
                {
                    type: EdmType.String,
                    label: "会计凭证号",
                    property: "accountingdocument"
                },
                {
                    type: EdmType.String,
                    label: "冲销会计凭证号",
                    property: "reversedaccountingdocument"
                },
                {
                    type: EdmType.String,
                    label: "款项性质",
                    property: "extend1"
                },
                {
                    type: EdmType.String,
                    label: "款项细分",
                    property: "paymentnaturedetail"
                },
                {
                    type: EdmType.String,
                    label: "银行账号",
                    property: "accountno"
                },
                {
                    type: EdmType.String,
                    label: "认领金额",
                    property: "claimamount"
                },
                {
                    type: EdmType.String,
                    label: "认领日期",
                    property: "claimsuccesstime"
                },
                {
                    type: EdmType.String,
                    label: "创建人姓名",
                    property: "createbyname"
                },
                {
                    type: EdmType.String,
                    label: "交易日期",
                    property: "banktransactiondate"
                },
                {
                    type: EdmType.String,
                    label: "银行流水号",
                    property: "bankserialnumber"
                },
                {
                    type: EdmType.String,
                    label: "摘要",
                    property: "digest"
                },
                {
                    type: EdmType.String,
                    label: "客商编号",
                    property: "merchantcode"
                },
                {
                    type: EdmType.String,
                    label: "客商名称",
                    property: "merchantname"
                },
                {
                    type: EdmType.String,
                    label: "备注",
                    property: "remark"
                },
                {
                    type: EdmType.String,
                    label: "公司代码",
                    property: "companycode"
                },
                {
                    type: EdmType.String,
                    label: "银行科目",
                    property: "glaccount"
                },
                {
                    type: EdmType.String,
                    label: "开户行",
                    property: "housebank"
                },
                {
                    type: EdmType.String,
                    label: "开户行账户",
                    property: "housebankaccount"
                },
                {
                    type: EdmType.String,
                    label: "币种",
                    property: "transactioncurrency"
                },
                {
                    type: EdmType.String,
                    label: "接收日期",
                    property: "created_date"
                },
                {
                    type: EdmType.String,
                    label: "处理日期",
                    property: "updated_date"
                },
                {
                    type: EdmType.String,
                    label: "处理人",
                    property: "updated_by"
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
                    MessageToast.show('Spreadsheet export has finished');
                }).finally(function () {
                    oSheet.destroy();
                });
        }
    });
});