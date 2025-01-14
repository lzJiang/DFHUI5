sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(JSONModel, Filter, FilterOperator) {
	"use strict";

	return {
		//通用接口调用方法
		create: function(odataModel, req) {
			return new Promise(function(resolve, reject) {
				var paras = {
					success: function(data) {
						resolve(data);
					},
					error: function(error) {
						reject("接口调用异常!");
					}
				};
				odataModel.create("/ZC_ZT_UI5_ODATA", req, paras);
			});
		}
	};
});