const XLSX = require('xlsx');
const PDFDocument = require('pdfkit');
const { stringify } = require('csv-stringify/sync');

const formatDataForExport = (data, columns) => {
  if (!data || data.length === 0) return [];
  return data.map(row => {
    const formatted = {};
    columns.forEach(col => {
      let value = row[col.key];
      if (col.transform && typeof col.transform === 'function') {
        value = col.transform(value, row);
      }
      formatted[col.label] = value ?? '';
    });
    return formatted;
  });
};

const exportToExcel = (data, sheetName = 'Report') => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const colWidths = Object.keys(data[0] || {}).map(key => ({
    wch: Math.max(key.length, ...data.map(row => String(row[key] || '').length)) + 2
  }));
  worksheet['!cols'] = colWidths;

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return buffer;
};

const exportToCSV = (data) => {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const csv = stringify(data, { header: true });
  return csv;
};

const exportToPDF = (data, columns, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: options.title || 'FuelTracks Report',
          Author: options.author || 'FuelTracks',
        },
      });

      const buffers = [];
      doc.on('data', chunk => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      doc.fontSize(18).font('Helvetica-Bold').text(options.title || 'FuelTracks Report', { align: 'center' });
      doc.moveDown(0.5);

      if (options.subtitle) {
        doc.fontSize(11).font('Helvetica').fillColor('#666').text(options.subtitle, { align: 'center' });
        doc.moveDown(0.5);
      }

      if (options.dateRange) {
        doc.fontSize(10).fillColor('#888').text(options.dateRange, { align: 'center' });
        doc.moveDown();
      }

      const tableTop = doc.y;
      const colWidths = columns.map(c => (options.pageWidth || 515) / columns.length);
      let currentY = tableTop;

      doc.fontSize(9).font('Helvetica-Bold').fillColor('#333');
      let xPos = 40;
      columns.forEach((col, i) => {
        doc.text(col.label || col.key, xPos, currentY, { width: colWidths[i] });
        xPos += colWidths[i];
      });
      currentY += 18;

      doc.moveTo(40, currentY - 4, 40 + colWidths.reduce((a, b) => a + b, 0)).lineTo(40 + colWidths.reduce((a, b) => a + b, 0), currentY - 4).stroke('#ddd');

      doc.fontSize(8).font('Helvetica').fillColor('#555');

      data.forEach((row, rowIndex) => {
        if (currentY > 750) {
          doc.addPage();
          currentY = 40;
        }

        xPos = 40;
        columns.forEach((col, i) => {
          let value = row[col.key];
          if (col.transform && typeof col.transform === 'function') {
            value = col.transform(value, row);
          }
          const cellText = String(value ?? '').substring(0, 30);
          doc.text(cellText, xPos, currentY, { width: colWidths[i] });
          xPos += colWidths[i];
        });
        currentY += 16;

        if (rowIndex < data.length - 1) {
          doc.moveTo(40, currentY - 4).lineTo(40 + colWidths.reduce((a, b) => a + b, 0), currentY - 4).stroke('#eee');
        }
      });

      doc.moveDown(2);
      doc.fontSize(8).fillColor('#999').text(`Generated on ${new Date().toLocaleString('en-IN')} - FuelTracks Fleet Management`, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = {
  formatDataForExport,
  exportToExcel,
  exportToCSV,
  exportToPDF,
};