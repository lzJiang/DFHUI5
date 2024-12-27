/* =========================================================== */
/* App 格式实现（Utility for formatting values）               */
/* =========================================================== */
sap.ui.define([
	"sap/ui/core/format/DateFormat", "sap/ui/core/format/NumberFormat", "sap/ui/core/Component"
], function(DateFormat, NumberFormat, Component) {
	"use strict";

	// 获取资源包
	function fnGetBundle(oControl) {
		return (oControl.getModel("i18n") || sap.ui.component(Component.getOwnerIdFor(oControl)).getModel("i18n"))
			.getResourceBundle();
	}

	var fnDateAgoFormatter = DateFormat.getDateInstance({
			style: "medium",
			strictParsing: true,
			relative: true
		}),
		fnAmountFormatter = NumberFormat.getCurrencyInstance(),
		fnDeliveryDateFormatter = DateFormat
		.getDateInstance({
			style: "medium"
		});

	var me = {

		// 转换UIC配置
		convertUIC: function(aUIC) {
			if (!jQuery.isArray(aUIC)) {
				return;
			}
			var oUIC = {};
			for (var i = 0; i < aUIC.length; i++) {
				var sAttr = aUIC[i].Ueid;
				oUIC[sAttr] = {
					Setf: aUIC[i].Setf,
					Visible: aUIC[i].Visible,
					Editable: aUIC[i].Editable,
					Require: aUIC[i].Require
				};
			}
			return oUIC;
		},

		// 设置元素VER属性(Visible,Editable,Require)
		setElementVER: function(v) {
			if (v) {
				return v;
			}
			return false;
		},

		// 设置元素状态属性(valueState)
		setElementVERvS: function(r) {
			if (r) {
				return "Error";
			}
			return "None";
		},

		// 设置Table表上元素VERS属性(Visible,Editable,Require,valueState)
		setElementTVERvS: function(r, g) {
			if (r && r[g]) {
				return "Error";
			}
			return "None";
		},

		// 日期格式化
		dateString: function(value) {
			if (value != "" && value != null) {
				var year = value.substring(0, 4);
				var month = value.substring(4, 6);
				var day = value.substring(6, 8);
				return year + "-" + month + "-" + day;
			} else {
				return value;
			}
		},
		// 日期格式化
		dateString1: function(value) {
			if ("0000-00-00" == value) {
				return "";
			}
			return this.cusReplaceAll(value, "-", "");

		},
		cusReplaceAll: function(str, oldVal, newVal) {
			while (str.indexOf(oldVal) > -1) {
				str = str.replace(oldVal, newVal);
			}
			return str;
		},

		// 时间格式化
		timeString: function(value) {
			if (value != "" && value != null) {
				var hour = value.substring(0, 2);
				var minute = value.substring(2, 4);
				var seconds = value.substring(4, 6);
				return hour + ":" + minute + ":" + seconds;
			} else {
				return value;
			}
		},

		// 去后导零
		deleteRightZero: function(v) // 去后导零
			{
				if (v === null || v === undefined || v === 0 || v === "0") {
					v = 0;
				}
				return parseFloat(v);
			},

		// 去前导零
		deleteLeftZero: function(v) // 去前导零
			{
				if (v === null || v === undefined || v === 0 || v === "0") {
					v = "0";
				}
				return v.replace(/^0+/, "");
			},

		// 展示信息
		showMessage: function(v) {
			if (v > 0) {
				return true;
			}
			return false;
		},

		daysAgo: function(dDate) {
			if (!dDate) {
				return "";
			}
			return fnDateAgoFormatter.format(dDate);
		},

		// 时间格式化
		customTime: function(value) {
			if (value && value.ms) {
				var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
					pattern: "HH:mm:ss"
				});
				var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
				var timeStr = timeFormat.format(new Date(value.ms + TZOffsetMs));

				return timeStr;
			}
		},

		// 当前日期格式成string类型
		yyyymmdd: function(day) {
			var mm = day.getMonth() + 1;
			var dd = day.getDate();
			return [day.getFullYear(),
				(mm > 9 ? '' : '0') + mm,
				(dd > 9 ? '' : '0') + dd
			].join('');
		},

		// 日期格式化
		date: function(value) {
			if (value) {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
					pattern: "yyyy-MM-dd"
				});
				return oDateFormat.format(new Date(value));
			} else {
				return value;
			}
		},

		checkBoxSelected: function(v) {
			return Boolean(v);
		},

		getElementVER: function(v) {
			if (v) {
				return v;
			}
			return false;
		},

		getElementVERvS: function(r) {
			if (r) {
				return "Error";
			}
			return "None";
		},

		getElementTVERvS: function(r, g) {
			if (r[g] != undefined) {
				return "Error";
			}
			return "None";
		},
		sfrkText: function(sfrk) {
			switch (sfrk) {
				case "X":
					return "";
				default:
					return "";
			}
		},
		statuText: function(zstatu) {
			switch (zstatu) {
				case "F":
					return "×";
				case "T":
					return "√";
				default:
					return zstatu;
			}
		},
		zjstatuText: function(zstatu) {
			switch (zstatu) {
				case "":
					return "未质检";
				case "S":
					return "合格";
				case "F":
					return "不合格";
				default:
					return zstatu;
			}
		},
		pjsText: function(val) {
			switch (val) {
				case "PJS":
					return "Q";
				default:
					return val;
			}
		},
		getQueryVariable: function(variable) {
			var query = window.location.search.substring(1);
			var vars = query.split("&");
			for (var i = 0; i < vars.length; i++) {
				var pair = vars[i].split("=");
				if (pair[0] == variable) {
					return pair[1];
				}
			}
			return (false);
		},
		/*
		 * Searches for a descendant of the given node that is an Element which is focusable, visible, and editable.
		 *
		 * @param {Element} oContainer Node to search for a focusable descendant
		 * @returns {Element} Element node that is focusable, visible and editable or null
		 */
		findEditableInput: function(oContainer) {
			return jQuery(oContainer).find('input, textarea')
				.not(
					'input[readonly],textarea[readonly],input[type=hidden],input[type=button],input[type=submit],input[type=reset],input[type=image],button'
				)
				.filter(':enabled:visible:first')[0];
		},

		/*
		 * Returns a descendant of the given node that is an Element which is focusable, visible, editable and not hidden.
		 *
		 * @param {Element} oContainer Node to search for a focusable descendant
		 * @returns {Element} Element node that is focusable, visible and editable or null
		 * @alias module:sap/ui/dom/getFirstEditableInput
		 * @since 1.72
		 * @private
		 * @ui5-restricted
		 */
		getFirstEditableInput: function(oContainer) {
			if (!oContainer || this.isHidden(oContainer)) {
				return null;
			}

			return this.findEditableInput(oContainer);
		},
		isHidden: function(oElem) {
			return (oElem.offsetWidth <= 0 && oElem.offsetHeight <= 0) || jQuery.css(oElem, 'visibility') === 'hidden';
		},
		fomatFloatTwo: function(src) {
			return Math.round(src * Math.pow(10, 2)) / Math.pow(10, 2);
		}

	};

	return me;
});