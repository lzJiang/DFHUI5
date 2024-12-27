/*
 * @Company: Hand
 * @Author: Chronos Shih
 * @Date: 2019-01-28 21:32:25
 * @LastEditors: Chronos Shih
 * @LastEditTime: 2019-01-30 11:46:41
 */

sap.ui.define(["sap/ui/core/mvc/Controller", "sap/ui/core/UIComponent", "sap/ui/core/routing/History", "sap/m/BusyDialog"], function (
	Controller, UIComponent, History, BusyDialog) {
	"use strict";

	return Controller.extend("ZYSXD.controller.BaseController", {
		globalBusyDialog: new BusyDialog(),
		globalBusyOn: function () {
			if (!this.globalBusyDialog) {
				this.globalBusyDialog = new sap.m.BusyDialog();
			}
			this.globalBusyDialog.open();
		},

		globalBusyOff: function () {
			if (this.globalBusyDialog) {
				this.globalBusyDialog.close();
			}
		},
		getEventBus: function () {
			return this.getOwnerComponent().getEventBus();
		},

		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		getModel: function (sName) {
			return this.getView().getModel(sName) || this.getOwnerComponent().getModel(sName);
		},

		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		getResourceBundle: function () {
			return this.getOwnerComponent()
				.getModel("i18n")
				.getResourceBundle();
		},

		setBusy: function (s) {
			this.getModel().setProperty("/appProperties/busy", s);
		},

		clone: function (obj, sub) {
			var o;
			if (obj.constructor === Object) {
				o = new obj.constructor();
			} else {
				o = new obj.constructor(obj.valueOf());
			}
			for (var key in obj) {
				if (o[key] !== obj[key]) {
					if (typeof obj[key] === "object") {
						o[key] = this.clone(obj[key]);
					} else {
						o[key] = obj[key];
					}
				}
			}
			o.toString = obj.toString;
			o.valueOf = obj.valueOf;
			return o;
		},

		navTo: function (sName) {
			this.getRouter().navTo(sName);
		},

		onNavBack: function () {
			if (History.getInstance().getPreviousHash() !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("", {}, true);
			}
		},
		uuid: function () {
			var s = [];
			var hexDigits = "0123456789abcdef";
			for (var i = 0; i < 36; i++) {
				s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
			}
			s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
			s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
			s[8] = s[13] = s[18] = s[23] = "-";

			var uuid = s.join("");
			return uuid;
		}

	});
});