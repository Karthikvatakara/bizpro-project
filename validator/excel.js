const excel = require('excel4node');

module.exports = {
  generateExcel: (orders, startDate, endDate, totalSales) => {
    const wb = new excel.Workbook();
    const ws = wb.addWorksheet('Sales Report');

    // Add headers
    const headers = ['User ID', 'Order ID', 'Date', 'Total Amount', 'Payment Method'];
    headers.forEach((header, colIndex) => {
      ws.cell(1, colIndex + 1).string(header);
    });

    // Add data
    orders.forEach((order, rowIndex) => {
      ws.cell(rowIndex + 2, 1).string('<%= order.userId.userUuid %>'); // Ensure userId is a string
      ws.cell(rowIndex + 2, 2).string(`#ORD-${order.orderUuid}`);
      
      // Format date
      const formattedDate = new Date(order.OrderDate).toLocaleDateString('en-US');
      ws.cell(rowIndex + 2, 3).string(formattedDate);
      
      ws.cell(rowIndex + 2, 4).number(Number(order.TotalPrice.toFixed(2))); // Ensure it's a number
      ws.cell(rowIndex + 2, 5).string(order.PaymentMethod);
    });

    // Set up total sales row
    const totalSalesRow = orders.length + 2;
    ws.cell(totalSalesRow, 4).string('Total Sales:');
    ws.cell(totalSalesRow, 5).number(Number(totalSales.length > 0 ? totalSales[0].totalSales : 0)); // Ensure it's a number

    return wb;
  },
};
