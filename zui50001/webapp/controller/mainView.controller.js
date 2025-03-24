sap.ui.define([
    "./BaseController",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "zui50001/model/odataUtil",
    "sap/ui/model/Sorter",
    "zui50001/model/formatter",
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
    return BaseController.extend("zui50001.controller.mainView", {
        currentType: null,
        confirm: null,
        formatter: formatter,
        onInit() {
            var mfgorderplannedstartdate = new Date();
            mfgorderplannedstartdate.setDate(mfgorderplannedstartdate.getDate() - 7);
            var mfgorderplannedstartdatestr = mfgorderplannedstartdate.toISOString().substring(0, 10);
            mfgorderplannedstartdatestr.replaceAll("-", "");
            this.getView().setModel(new JSONModel({
                productionplant: "1100",
                manufacturingorder: "",
                material: "",
                manufacturingordertype: "",
                yy1_mfgbatch_ord: "",
                mfgorderplannedstartdate: mfgorderplannedstartdatestr,
                mfgorderplannedenddate: "",
                productname: "",
                status:""
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
            var req = that.setReq("PP0002", RequestParameter);
            that.globalBusyOn();
            odataUtil.create(that._ODataModel, req).then(function (result) {
                var type = result.Returncode;
                var message = result.Returnmessage;
                var returnResult = result.Returnresult;
                if ("S" == type) {
                    var data = JSON.parse(returnResult);
                    if (data && data.length > 0) {
                        data.forEach(function (item) {
                            item.editable = false;
                            item.manufacturingorderurl = "/ui#ManufacturingOrderItem-manage&/ManageOrders/C_ManageProductionOrder('" + item.manufacturingorder + "')/sap-iapp-state";
                            item.status = that.setItemStatus(item);
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
                var req = that.setReq("PP0003", RequestParameter);
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
                                    if (dataitem.manufacturingorder == returnitem.manufacturingorder) {
                                        dataitem.yy1_flag = returnitem.yy1_flag;
                                        dataitem.yy1_msg = returnitem.yy1_msg;
                                        if (dataitem.yy1_flag == 'S') {
                                            dataitem.flagIcon = "Success";
                                        } else {
                                            dataitem.flagIcon = "Error";
                                        }
                                        dataitem.status = that.setItemStatus(dataitem);
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
            //                         dataitem.yy1_flag = returnitem.yy1_flag;
            //                         dataitem.yy1_msg = returnitem.yy1_msg;
            //                         if (dataitem.yy1_flag == 'S') {
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
        onRelease: function () {
            var that = this;
            MessageBox.confirm(
                "确认下达！", {
                title: "确认",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction == MessageBox.Action.YES) {
                        that._onRelease();
                    }
                }
            }
            );
        },
        _onRelease: async function () {
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
                var req = that.setReq("PP0004", RequestParameter);
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
                                    if (dataitem.manufacturingorder == returnitem.manufacturingorder) {
                                        dataitem.yy1_sendwms = returnitem.yy1_sendwms;
                                        dataitem.orderiscreated = returnitem.orderiscreated;
                                        dataitem.orderisreleased = returnitem.orderisreleased;
                                        dataitem.mfgorderactualreleasedate = returnitem.mfgorderactualreleasedate;
                                        dataitem.yy1_flag = returnitem.yy1_flag;
                                        dataitem.yy1_msg = returnitem.yy1_msg;
                                        if (dataitem.yy1_flag == 'S') {
                                            dataitem.flagIcon = "Success";
                                        } else {
                                            dataitem.flagIcon = "Error";
                                        }
                                        dataitem.status = that.setItemStatus(dataitem);
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
                    that.getView().getModel("dataModel").setProperty("/data", []);
                    that.globalBusyOff();
                    console.log(err);
                });
            }
        },
        onSendWms: function () {
            var that = this;
            MessageBox.confirm(
                "确认推送WMS！", {
                title: "确认",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction == MessageBox.Action.YES) {
                        that._onSendWms();
                    }
                }
            }
            );
        },
        _onSendWms: async function () {
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
                var req = that.setReq("PP0005", RequestParameter);
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
                                    if (dataitem.manufacturingorder == returnitem.manufacturingorder) {
                                        dataitem.yy1_sendwms = returnitem.yy1_sendwms;
                                        dataitem.yy1_flag = returnitem.yy1_flag;
                                        dataitem.yy1_msg = returnitem.yy1_msg;
                                        if (dataitem.yy1_flag == 'S') {
                                            dataitem.flagIcon = "Success";
                                        } else {
                                            dataitem.flagIcon = "Error";
                                        }
                                        dataitem.status = that.setItemStatus(dataitem);
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
                    that.getView().getModel("dataModel").setProperty("/data", []);
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
        setItemStatus: function (item) {
            item.status = "";
            if (item.orderiscreated == "X") {
                item.status = item.status + "【创建】";
            }
            if (item.orderisreleased == "X") {
                item.status = item.status + "【下达】";
            }
            if (item.yy1_sendbpm == "X") {
                item.status = item.status + "【已推BPM】";
            }
            if (item.yy1_approvestatus == "N") {
                item.status = item.status + "【BPM拒绝】";
            }
            if (item.yy1_approvestatus == "Y" && !this.isEmpty(item.yy1_check)) {
                item.status = item.status + "【BPM通过】";
            }
            if (item.yy1_sendwms == "X") {
                item.status = item.status + "【已推WMS】";
            }
            if (item.orderisdelivered == "X") {
                item.status = item.status + "【交货已完成】";
            }
            if (item.orderistechnicallycompleted == "X") {
                item.status = item.status + "【技术完成】";
            }
            if (item.orderisll== "X") {
                item.status = item.status + "【已领料】";
            }
            return item.status;
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
                var val = obj[key] == null ? "":obj[key];
                //newObj[key] = typeof val === 'object' ? arguments.callee(val) : val; //arguments.callee 在哪一个函数中运行，它就代表哪个函数, 一般用在匿名函数中。  
                newObj[key] = typeof val === 'object' ? cloneObj(val) : val;
            }
            return newObj;
        },
        onScrqChange: function (oEvent) {
            //生产日期改变时，若有效期为空，则设置默认值
            var controller = oEvent.getSource();
            var getParameters = oEvent.getParameters();
            const spath = controller.getParent().getBindingContext("dataModel").getPath();
            var item = this.getView().getModel("dataModel").getProperty(spath);
            if (!this.isEmpty(item.yy1_mfgdate) && this.isEmpty(item.yy1_expdate)) {
                this.setDefaultExpdate(item);
            }
        },
        setDefaultExpdate: function (item) {
            if (this.isEmpty(item.totalshelflife)) {
                return;
            }
            var currentDate = new Date(item.yy1_mfgdate);
            switch (item.shelflifeexpirationdateperiod) {
                case "":
                    currentDate.setDate(currentDate.getDate() + item.totalshelflife);
                    item.yy1_expdate = currentDate.toISOString().substring(0, 10);
                    break;
                case "1":
                    currentDate.setDate(currentDate.getDate() + item.totalshelflife * 7);
                    item.yy1_expdate = currentDate.toISOString().substring(0, 10);
                    break;
                case "2":
                    currentDate.setMonth(currentDate.getMonth() + item.totalshelflife);
                    item.yy1_expdate = currentDate.toISOString().substring(0, 10);
                    break;
                case "3":
                    currentDate.setFullYear(currentDate.getFullYear() + item.totalshelflife);
                    item.yy1_expdate = currentDate.toISOString().substring(0, 10);
                    break;
                default:
                    break;
            }
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
                    key: "manufacturingorder_col",
                    label: "订单",
                    path: "manufacturingorder"
                },
                {
                    key: "manufacturingordertypename_col",
                    label: "订单类型",
                    path: "manufacturingordertypename"
                },
                {
                    key: "status_col",
                    label: "订单状态",
                    path: "status"
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
                    key: "mfgorderplannedtotalqty_col",
                    label: "订单数量",
                    path: "mfgorderplannedtotalqty"
                },
                {
                    key: "productionunit_col",
                    label: "单位",
                    path: "productionunit"
                },
                {
                    key: "mfgorderplannedstartdate_col",
                    label: "开始日期",
                    path: "mfgorderplannedstartdate"
                },
                {
                    key: "mfgorderplannedenddate_col",
                    label: "结束日期",
                    path: "mfgorderplannedenddate"
                },
                {
                    key: "yy1_mfgbatch_ord_col",
                    label: "生产批次",
                    path: "yy1_mfgbatch_ord"
                },
                {
                    key: "yy1_mfgdate_col",
                    label: "生产日期",
                    path: "yy1_mfgdate"
                },
                {
                    key: "yy1_expdate_col",
                    label: "有效期",
                    path: "yy1_expdate"
                },
                {
                    key: "mfgorderactualreleasedate_col",
                    label: "下达日期",
                    path: "mfgorderactualreleasedate"
                },
                {
                    key: "lastchangedbyuser_col",
                    label: "更改人",
                    path: "lastchangedbyuser"
                },
                {
                    key: "mfgordercreationdate_col",
                    label: "创建日期",
                    path: "mfgordercreationdate"
                },
                {
                    key: "yy1_plannebatch_ord_col",
                    label: "计划批次",
                    path: "yy1_plannebatch_ord"
                },
                {
                    key: "yy1_approve_col",
                    label: "批准人",
                    path: "yy1_approve"
                },
                {
                    key: "yy1_approveTime_col",
                    label: "批准时间",
                    path: "YY1_approveTime"
                },
                {
                    key: "yy1_check_col",
                    label: "审批人",
                    path: "yy1_check"
                },
                {
                    key: "yy1_checktime_col",
                    label: "审批时间",
                    path: "yy1_checktime"
                }
            ]);

            this._mIntialWidth = {
                "yy1_msg_col": "4rem",
                "productionplant_col": "4rem",
                "manufacturingorder_col": "6rem",
                "manufacturingordertypename_col": "6rem",
                "status_col": "6rem",
                "material_col": "6rem",
                "productname_col": "8rem",
                "mfgorderplannedtotalqty_col": "6rem",
                "productionunit_col": "4rem",
                "mfgorderplannedstartdate_col": "10rem",
                "mfgorderplannedenddate_col": "10rem",
                "yy1_mfgbatch_ord_col": "8rem",
                "yy1_mfgdate_col": "10rem",
                "yy1_expdate_col": "10rem",
                "mfgorderactualreleasedate_col": "6rem",
                "lastchangedbyuser_col": "4rem",
                "mfgordercreationdate_col": "6rem",
                "yy1_plannebatch_ord_col": "6rem",
                "yy1_approve_col": "6rem",
                "yy1_approveTime_col": "6rem",
                "yy1_check_col": "6rem",
                "yy1_checktime_col": "6rem"
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
                    label: "工厂",
                    property: "productionplant"
                },
                {
                    type: EdmType.String,
                    label: "订单",
                    property: "manufacturingorder"
                },
                {
                    type: EdmType.String,
                    label: "订单类型",
                    property: "manufacturingordertypename"
                },
                {
                    type: EdmType.String,
                    label: "订单状态",
                    property: "status"
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
                    label: "订单数量",
                    property: "mfgorderplannedtotalqty"
                },
                {
                    type: EdmType.String,
                    label: "单位",
                    property: "productionunit"
                },
                {
                    type: EdmType.String,
                    label: "开始日期",
                    property: "mfgorderplannedstartdate"
                },
                {
                    type: EdmType.String,
                    label: "结束日期",
                    property: "mfgorderplannedenddate"
                },
                {
                    type: EdmType.String,
                    label: "生产批次",
                    property: "yy1_mfgbatch_ord"
                },
                {
                    type: EdmType.String,
                    label: "生产日期",
                    property: "yy1_mfgdate"
                },
                {
                    type: EdmType.String,
                    label: "有效期",
                    property: "yy1_expdate"
                },
                {
                    type: EdmType.String,
                    label: "下达日期",
                    property: "mfgorderactualreleasedate"
                },
                {
                    type: EdmType.String,
                    label: "更改人",
                    property: "lastchangedbyuser"
                },
                {
                    type: EdmType.String,
                    label: "创建日期",
                    property: "mfgordercreationdate"
                },
                {
                    type: EdmType.String,
                    label: "计划批次",
                    property: "yy1_plannebatch_ord"
                },
                {
                    type: EdmType.String,
                    label: "批准人",
                    property: "yy1_approve"
                },
                {
                    type: EdmType.String,
                    label: "批准时间",
                    property: "YY1_approveTime"
                },
                {
                    type: EdmType.String,
                    label: "审批人",
                    property: "yy1_check"
                },
                {
                    type: EdmType.String,
                    label: "审批时间",
                    property: "yy1_checktime"
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
        },
        onPrint: function () {
            var that = this;
            MessageBox.confirm(
                "确认打印！", {
                title: "确认",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction == MessageBox.Action.YES) {
                        that._onPrint();
                    }
                }
            }
            );

            // PdfCreator.openFile();
        },
        _onPrint: async function () {
            var that = this;
            var data = this.getView().getModel("dataModel").getProperty("/data");
            var selectItem = that.getSelectItem();
            var printItem = [];
            if (!selectItem.length > 0) {
                MessageToast.show("请先选中要打印的项目");
                return;
            }
            // if (selectItem.length > 1) {
            //     MessageToast.show("请先选中单个要打印的项目");
            //     return;
            // }
            var printItems = [];
            var RequestParameter = selectItem;
            var req = that.setReq("PP0009", RequestParameter);
            that.globalBusyOn();
            odataUtil.create(that._ODataModel, req).then(function (result) {
                var type = result.Returncode;
                var message = result.Returnmessage;
                var returnResult = result.Returnresult;
                if ("S" == type) {
                    var returndata = JSON.parse(returnResult);
                    if (returndata && returndata.length > 0) {
                        returndata.forEach(function (returnitem) {
                            data.forEach(function (dataitem) {
                                if (dataitem.manufacturingorder == returnitem.manufacturingorder) {
                                    dataitem.yy1_flag = returnitem.flag;
                                    dataitem.yy1_msg = returnitem.msg;
                                    if (dataitem.yy1_flag == 'S') {
                                        dataitem.flagIcon = "Success";
                                        printItems.push(returnitem);
                                        // that.createPdfDoc(returnitem);
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
                    if (printItems.length > 0) {
                        if (printItems.length == 1) {
                            that.createPdfDoc(printItems[0]);
                        } else {
                            that.createPdfDocs(printItems);
                        }
                    }
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
        createPdfDoc: function (data) {
            var scpc = "生产批次：" + data.scpc;
            var scjh = "生产计划：" + data.scjh;
            var pzr = "批准人：" + data.pzr;
            var shr = "审核人：" + data.shr;
            var zdr = "制单人：" + data.zdr;
            var wind = window.open("/sap/bc/ui5_ui5/sap/zui50001/print/print.html", "PrintWindow", "");
            // wind.document.write(title);
            // wind.print();
            // wind.close();
            wind.onload = function () {
                wind.document.getElementById('title').textContent = data.title;
                wind.document.getElementById('scpc').textContent = scpc;
                wind.document.getElementById('scjh').textContent = scjh;
                wind.document.getElementById('jhksrq').textContent = data.jhksrq;
                wind.document.getElementById('cpgg').textContent = data.cpgg;
                wind.document.getElementById('yjwgsj').textContent = data.yjwgsj;
                wind.document.getElementById('yltr').innerHTML = data.yltr;
                wind.document.getElementById('fltr').innerHTML = data.fltr;
                wind.document.getElementById('jhscsl').textContent = data.jhscsl;
                wind.document.getElementById('bctr').innerHTML = data.bctr;
                wind.document.getElementById('pzr').textContent = pzr;
                wind.document.getElementById('shr').textContent = shr;
                wind.document.getElementById('zdr').textContent = zdr;
                var filename = "D:/" + data.manufacturingorder + ".pdf";
                wind.print(); // 触发打印
                // wind.close(); // 关闭窗口
                wind.onbeforeprint = function () {
                    // 在用户准备打印时的回调函数
                    // 可以在这里设置一些打印前的状态或者进行其他操作
                };

                wind.onafterprint = function () {
                    // 在用户完成打印操作后的回调函数
                    // 这里可以关闭浏览器标签或窗口
                    wind.close();
                };
            };
        },
        //批量打印
        createPdfDocs: function (printItems) {
            var count = 0;
            var data = printItems[0];
            var that = this;
            //首页数据
            var scpc = "生产批次：" + data.scpc;
            var scjh = "生产计划：" + data.scjh;
            var pzr = "批准人：" + data.pzr;
            var shr = "审核人：" + data.shr;
            var zdr = "制单人：" + data.zdr;
            this.wind = null;
            this.wind = window.open("/sap/bc/ui5_ui5/sap/zui50001/print/print.html", "PrintWindow", "");
            that.wind.onload = function () {
                that.wind.document.getElementById('title').textContent = data.title;
                that.wind.document.getElementById('scpc').textContent = scpc;
                that.wind.document.getElementById('scjh').textContent = scjh;
                that.wind.document.getElementById('jhksrq').textContent = data.jhksrq;
                that.wind.document.getElementById('cpgg').textContent = data.cpgg;
                that.wind.document.getElementById('yjwgsj').textContent = data.yjwgsj;
                that.wind.document.getElementById('yltr').innerHTML = data.yltr;
                that.wind.document.getElementById('fltr').innerHTML = data.fltr;
                that.wind.document.getElementById('jhscsl').textContent = data.jhscsl;
                that.wind.document.getElementById('bctr').innerHTML = data.bctr;
                that.wind.document.getElementById('pzr').textContent = pzr;
                that.wind.document.getElementById('shr').textContent = shr;
                that.wind.document.getElementById('zdr').textContent = zdr;
                printItems.forEach(function (item) {
                    count = count + 1;
                    if (count > 1) {
                        that.addPage(item);
                    }
                });
                that.wind.print(); // 触发打印
                that.wind.onbeforeprint = function () {
                    // 在用户准备打印时的回调函数
                    // 可以在这里设置一些打印前的状态或者进行其他操作
                };
                that.wind.onafterprint = function () {
                    // 在用户完成打印操作后的回调函数
                    // 这里可以关闭浏览器标签或窗口
                    that.wind.close();
                };
            };
        },
        addPage: function (data) {
            var that = this;
            var scpc = "生产批次：" + data.scpc;
            var scjh = "生产计划：" + data.scjh;
            var pzr = "批准人：" + data.pzr;
            var shr = "审核人：" + data.shr;
            var zdr = "制单人：" + data.zdr;
            var body = that.wind.document.getElementById('content');
            var scrwd = that.wind.document.createElement('div');
            scrwd.innerHTML = '<center style="margin-top: 60px;" class="nextpage"><h3>' + data.title + '</h3></center>'
                + '<center>'
                + '<table class="tftable noborder"><col style="width: 33%;"><col style="width: 34%;"><col style="width: 33%;">'
                + '<tr><td>' + scpc + '</td><td>' + scjh + '</td><td>' + data.jhksrq + '</td></tr>'
                + '</table>'
                + '<table class="tftable"><col style="width: 10%;"><col style="width: 30%;"><col style="width: 10%;"><col style="width: 30%;">'
                + '<tr><td>项目</td><td>内容</td><td>项目</td><td>内容</td></tr>'
                + '<tr height=60px><td>产品规格</td><td>' + data.cpgg + '</td><td>预计完工时间</td><td>' + data.yjwgsj + '</td></tr>'
                + '<tr height=150px><td>原料投入</td><td>' + data.yltr + '</td><td>辅料投入</td><td>' + data.fltr + '</td></tr>'
                + '<tr height=150px><td>计划生产数量</td><td>' + data.jhscsl + '</td><td>包材投入</td><td>' + data.bctr + '</td></tr>'
                + '</table>'
                + '<table class="tftable noborder"><col style="width: 33%;"><col style="width: 34%;"><col style="width: 33%;">'
                + '<tr><td>' + pzr + '</td><td>' + shr + '</td><td>' + zdr + '</td></tr>'
                + '</table>'
                + '</center>';
            body.appendChild(scrwd);
        },
        onSendBpm: function () {
            var that = this;
            MessageBox.confirm(
                "确认推送BPM！", {
                title: "确认",
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                    if (oAction == MessageBox.Action.YES) {
                        that._onSendBpm();
                    }
                }
            }
            );
        },
        _onSendBpm: async function () {
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
                var req = that.setReq("PP0017", RequestParameter);
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
                                    if (dataitem.manufacturingorder == returnitem.manufacturingorder) {
                                        dataitem.yy1_sendbpm = returnitem.yy1_sendbpm;
                                        dataitem.yy1_flag = returnitem.yy1_flag;
                                        dataitem.yy1_msg = returnitem.yy1_msg;
                                        if (dataitem.yy1_flag == 'S') {
                                            dataitem.flagIcon = "Success";
                                        } else {
                                            dataitem.flagIcon = "Error";
                                        }
                                        dataitem.status = that.setItemStatus(dataitem);
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
                    that.getView().getModel("dataModel").setProperty("/data", []);
                    that.globalBusyOff();
                    console.log(err);
                });
            }
        }
    });
});