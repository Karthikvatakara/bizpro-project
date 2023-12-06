const ejs = require('ejs');
const pdf = require('html-pdf');
const fs = require('fs');
const excel = require('./excel')

module.exports ={

  downloadPdf : (req,res,orders,startDate,endDate,totalSales)=>{
    const template = fs.readFileSync('./validator/template.ejs', 'utf-8');
    
    console.log(orders,"in the pdf");
    console.log(totalSales,"totalsales");
    const html = ejs.render(template, { orders, startDate, endDate, totalSales });
    
    const pdfOptions = {  
        format: 'Letter',
        orientation: 'portrait',
    };
    
    pdf.create(html, pdfOptions).toFile(`public/SRpdf/sales-report-${startDate}-${endDate}.pdf`, (err, response) => {
        if (err) return console.log(err);
        res.status(200).download(response.filename);
    });
    },

    downloadExcel: (req, res, orders, startDate, endDate, totalSales) => {
        const wb = excel.generateExcel(orders, startDate, endDate, totalSales);
    
        // Save Excel file
        const excelFileName = `public/SRexcel/sales-report-${startDate}-${endDate}.xlsx`;
        wb.write(excelFileName, (err, stats) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Error generating Excel file');
          }
    
          // Download the Excel file
          res.status(200).download(excelFileName);
        });
      },

}