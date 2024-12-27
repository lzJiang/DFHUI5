sap.ui.define(['jquery.sap.global'],
	function(jQuery) {
	"use strict";

	// Very simple page-context personalization
	// persistence service, not for productive use!
	var oldVarietyPersoService = {

		oData : {
			_persoSchemaVersion: "1.0",
			aColumns : [
				{
					id: "oldVarietyApp-itemTable-col1",
					order: 1,
					text: "编辑室",
					visible: true
				},
				{
					id: "oldVarietyApp-itemTable-col2",
					order: 2,
					text: "部门分类",
					visible: true
				},
				{
					id: "oldVarietyApp-itemTable-col3",
					order: 3,
					text: "考核分类",
					visible: true
				},
				{
					id: "oldVarietyApp-itemTable-col4",
					order: 4,
					text: "指定金额（万元）",
					visible: true
				},
				{
					id: "oldVarietyApp-itemTable-col5",
					order: 5,
					text: "销售收入（万元）",
					visible: true
				},
				{
					id: "oldVarietyApp-itemTable-col6",
					order: 6,
					text: "补未完成定额（万元）",
					visible: true
				},
				{
					id: "oldVarietyApp-itemTable-col7",
					order: 7,
					text: "指标完成值（万元）",
					visible: true
				}
			]
		},

		oResetData : {
			_persoSchemaVersion: "1.0",
			aColumns : [
				{
					id: "oldVarietyApp-itemTable-col1",
					order: 1,
					text: "编辑室",
					visible: true
				},
				{
					id: "oldVarietyApp-itemTable-col2",
					order: 2,
					text: "部门分类",
					visible: true
				},
				{
					id: "oldVarietyApp-itemTable-col3",
					order: 3,
					text: "考核分类",
					visible: true
				},
				{
					id: "oldVarietyApp-itemTable-col4",
					order: 4,
					text: "指定金额（万元）",
					visible: true
				},
				{
					id: "oldVarietyApp-itemTable-col5",
					order: 5,
					text: "销售收入（万元）",
					visible: true
				},
				{
					id: "oldVarietyApp-itemTable-col6",
					order: 6,
					text: "补未完成定额（万元）",
					visible: true
				},
				{
					id: "oldVarietyApp-itemTable-col7",
					order: 7,
					text: "指标完成值（万元）",
					visible: true
				}
			]
		},


		getPersData : function () {
			var oDeferred = new jQuery.Deferred();
			if (!this._oBundle) {
				this._oBundle = this.oData;
			}
			oDeferred.resolve(this._oBundle);
			// setTimeout(function() {
			// 	oDeferred.resolve(this._oBundle);
			// }.bind(this), 2000);
			return oDeferred.promise();
		},

		setPersData : function (oBundle) {
			var oDeferred = new jQuery.Deferred();
			this._oBundle = oBundle;
			oDeferred.resolve();
			return oDeferred.promise();
		},

		getResetPersData : function () {
			var oDeferred = new jQuery.Deferred();

			// oDeferred.resolve(this.oResetData);

			setTimeout(function() {
				oDeferred.resolve(this.oResetData);
			}.bind(this), 2000);

			return oDeferred.promise();
		},

		resetPersData : function () {
			var oDeferred = new jQuery.Deferred();

			//set personalization
			this._oBundle = this.oResetData;

			//reset personalization, i.e. display table as defined
			//this._oBundle = null;

			oDeferred.resolve();

			// setTimeout(function() {
			// 	this._oBundle = this.oResetData;
			// 	oDeferred.resolve();
			// }.bind(this), 2000);

			return oDeferred.promise();
		},

		//this caption callback will modify the TablePersoDialog' entry for the 'Weight' column
		//to 'Weight (Important!)', but will leave all other column names as they are.
		getCaption : function (oColumn) {
			if (oColumn.getHeader() && oColumn.getHeader().getText) {
				if (oColumn.getHeader().getText() === "Weight") {
					return "Weight (Important!)";
				}
			}
			return null;
		},

		getGroup : function(oColumn) {
			if ( oColumn.getId().indexOf('productCol') != -1 ||
					oColumn.getId().indexOf('supplierCol') != -1) {
				return "Primary Group";
			}
			return "Secondary Group";
		}
	};

	return oldVarietyPersoService;

});