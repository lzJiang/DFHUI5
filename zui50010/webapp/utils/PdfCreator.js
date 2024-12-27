sap.ui.define([
	"zui50010/utils/jsPdfUtil",
	"zui50010/font/font",
], function (jsPdfUtil, font) {
	"use strict";

	return {

		data: null,

		createPdfDoc: function (data) {
			this.data = data;
			// jsPdfUtil.initialize();
			// this.createsctzd();
			// jsPdfUtil.finish();
			// jsPdfUtil.doc.output("dataurlnewwindow");
			var title = "<center><h3>" + data.title +"</h3></center>";
			var wind = window.open("","PrintWindow");
			wind.document.write(title);
			wind.print();
		},

		openFile: function () {
			jsPdfUtil.openFile();
		},

		saveFile: function (fileName) {
			jsPdfUtil.saveFile(fileName);
		},

		createContent: function () {
			jsPdfUtil.doc.setFontSize(24).setFontStyle("normal");
			jsPdfUtil.writeTextCenter("Testpage");
			jsPdfUtil.addLine();
			jsPdfUtil.doc.setFontSize(16).setFontStyle("normal");
			jsPdfUtil.writeTextCenter("Margins (Top/Bot/Left/Right): " + jsPdfUtil.marginTop + "/" + jsPdfUtil.marginBot + "/" + jsPdfUtil.marginLeft + "/" + jsPdfUtil.marginRight);
			jsPdfUtil.addLine();
			jsPdfUtil.writeTextLeft("Left justified text");
			jsPdfUtil.writeTextCenter("Centered text");
			jsPdfUtil.writeTextRight("Right justified text");
			jsPdfUtil.doc.setFontSize(20).setFontStyle("bold");
			jsPdfUtil.writeTextLeft("Left bold underlined text size 20.", { bUnderline: true });
			jsPdfUtil.writeTextCenter("Center bold underlined text size 20.", { bUnderline: true });
			jsPdfUtil.writeTextRight("Right bold underlined text size 20.", { bUnderline: true });
			jsPdfUtil.doc.setFontSize(16).setFontStyle("normal");
			jsPdfUtil.addLine(3);
			jsPdfUtil.writeTextLeft("Above: 3 empty lines added. Below: 1 added line + Full and partial lines.");
			jsPdfUtil.addLine();
			jsPdfUtil.uline();
			jsPdfUtil.addLine();
			jsPdfUtil.uline({ xPos: 50 }); //Line starting at 50 mm and ends at right margin
			jsPdfUtil.addLine();
			jsPdfUtil.uline({ width: 50 }); //Line starting at left margin with length 50 mm
			jsPdfUtil.uline({ xPos: 100, width: 50 }); //Line written on same yPos as previous. Line starting at 100mm with length 50 mm
			jsPdfUtil.addLine();
			jsPdfUtil.uline({ width: 50, isCentered: true }); //Centered line with length 50 mm
			jsPdfUtil.writeTextLeft("Left justified text, wordwrapped to max width 50 mm.", { maxWidth: 50 });
			jsPdfUtil.writeTextCenter("Centered text, wordwrapped to max width 60 mm.", { maxWidth: 60 });
			jsPdfUtil.writeTextRight("Right justified text, wordwrapped to max width 70 mm.", { maxWidth: 70 });
			jsPdfUtil.addLine();
			jsPdfUtil.writeTextLeft("Left justified text, maxWidth 50 mm with border and padding 2 mm", { maxWidth: 50, hasBorder: true, padding: 2 });
			jsPdfUtil.writeTextLeft("Left justified text, maxWidth 50 mm with border and padding 3 mm and xPos=30", { maxWidth: 50, xPos: 30, hasBorder: true, padding: 3 });
			jsPdfUtil.newPage();
			jsPdfUtil.writeTextLeft("<NewPage>");
			jsPdfUtil.writeTextCenter("Centered text, maxWidth: 60 mm with border and padding 4 mm", { maxWidth: 60, hasBorder: true, padding: 4 });
			jsPdfUtil.writeTextCenter("Centered text, maxWidth: 60 mm with border and padding 4 mm and xPos=40", { maxWidth: 60, xPos: 40, hasBorder: true, padding: 4 });
			jsPdfUtil.writeTextCenter("Some arbitrary text");
			jsPdfUtil.addLine();
			jsPdfUtil.writeTextRight("Right justified text, maxWidth: 60 mm with border and padding 4 mm", { maxWidth: 60, hasBorder: true, padding: 4 });
			jsPdfUtil.writeTextRight("Right justified text, maxWidth: 60 mm with border and padding 4 mm and xPos=40", { maxWidth: 60, xPos: 40, hasBorder: true, padding: 4 });

			jsPdfUtil.newPage();
			jsPdfUtil.writeTextLeft("Left justified image:");
			jsPdfUtil.incYPos(2);
			jsPdfUtil.writeImageLeft("/images/Skyline.jpg", { width: 100, height: 55 });

			jsPdfUtil.writeTextCenter("Centered image:");
			jsPdfUtil.incYPos(2);
			jsPdfUtil.writeImageCenter("/images/Skyline.jpg", { width: 100, height: 55 });

			jsPdfUtil.writeTextRight("Right justified image:");
			jsPdfUtil.incYPos(2);
			jsPdfUtil.writeImageRight("/images/Skyline.jpg", { width: 100, height: 55 });

			jsPdfUtil.writeTextLeft("Images with default size on same line:");
			jsPdfUtil.incYPos(2);
			jsPdfUtil.writeImageLeft("/images/Skyline.jpg", { bNoInc: true });
			jsPdfUtil.writeImageCenter("/images/Skyline.jpg", { bNoInc: true });
			jsPdfUtil.writeImageRight("/images/Skyline.jpg", { bNoInc: true });


		},

		createsctzd: function () {
			jsPdfUtil.writeTextCenter(data.title);
			jsPdfUtil.addLine();
			jsPdfUtil.doc.setFontSize(10)
			var line1 = data.scpc + "                " + data.scjh + "                " + data.jhksrq;
			var line2 = "批准人：" + data.pzr + "             " + "审核人：" + data.shr + "             " + "制单人：" + data.zdr;
			jsPdfUtil.writeTextLeft(line1,{xPos:15});						
			jsPdfUtil.doc.autoTable({
				startY: 40,
				tableWidth: 'auto',
				columnWidth: 'auto',
				columnStyles: {
					col1: { halign: 'center', cellWidth: 20 },
					col2: { halign: 'center', cellWidth: 70 },
					col3: { halign: 'center', cellWidth: 20 },
					col4: { halign: 'center', cellWidth: 70 }
				},
				styles: { font: "simhei", fontSize: 10},
				theme: "grid",
				body: [
					{
						col1: '项目',
						col2: { content: '内容', colSpan: 2 },
						col3: '项目',
						col4: { content: '内容', colSpan: 2 }
					},
					{
						col1: '产品规格',
						col2: { content: data.cpgg, colSpan: 2 },
						col3: '预计完工时间',
						col4: { content: data.yjwgsj, colSpan: 2 }
						
					},
					{
						col1: { content: '原料投入' },
						col2: { content: data.yltr, colSpan: 2,  },
						col3: { content: '辅料投入' },
						col4: { content: data.fltr, colSpan: 2  }
					},
					{
						col1: '计划生产量',
						col2: { content: data.jhscl, colSpan: 2 },
						col3: '包材投入',
						col4: { content: data.bctr, colSpan: 2 }
					}
				],
				columns: [
					{ dataKey: 'col1' },
					{ dataKey: 'col2' },
					{ dataKey: 'col3' },
					{ dataKey: 'col4' }
				],

			});
			jsPdfUtil.writeTextLeft(line2,{xPos:15});	
		},
		bodyRows:function (rowCount) {
			rowCount = rowCount || 10
			var body = []
			for (var j = 1; j <= rowCount; j++) {
			  body.push({
				id: j,
				name: faker.name.findName(),
				email: faker.internet.email(),
				city: faker.address.city(),
				expenses: faker.finance.amount(),
			  })
			}
			return body
		  }


	};
}
);