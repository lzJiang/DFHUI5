sap.ui.define([
	"zui50001/libs/jspdfumdmin",
	"zui50001/font/font",
], function (jspdfmin153,font) {
	"use strict";
	// jQuery.sap.require("zui50001/libs/jspdfmin153");
	// jQuery.sap.require("zui50001/libs/jspdfpluginautotablemin");
	return {

		//Find jsPDF source on https://cdnjs.com/libraries/jspdf

		getJsPdfDoc: function () {
			jQuery.sap.require("zui50001/libs/jspdfpluginautotable");
			var doc = new jspdf.jsPDF();
			doc.addFileToVFS('simhei-normal.ttf', font.font);
			doc.addFont('simhei-normal.ttf', 'simhei', 'normal');
			doc.setFont('simhei');
			return doc;
		}

	};
}
);