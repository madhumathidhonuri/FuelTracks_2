const exportUtils = require('../utils/export.utils');

const exportData = async (data, format, options = {}) => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  const { columns, sheetName, title, subtitle, dateRange } = options;

  switch (format) {
    case 'excel':
    case 'xlsx':
      return exportUtils.exportToExcel(data, sheetName || 'Report');

    case 'csv':
      return Buffer.from(exportUtils.exportToCSV(data));

    case 'pdf':
      if (!columns) throw new Error('Columns required for PDF export');
      return exportUtils.exportToPDF(data, columns, { title, subtitle, dateRange });

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
};

const getExportHeaders = (format) => {
  const headers = {
    excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    pdf: 'application/pdf',
  };
  return headers[format] || 'application/octet-stream';
};

const getExportFilename = (prefix, format, dateRange) => {
  const date = new Date().toISOString().split('T')[0];
  const range = dateRange ? `_${dateRange.from}_to_${dateRange.to}` : '';
  return `${prefix}_${date}${range}.${format}`;
};

module.exports = {
  exportData,
  getExportHeaders,
  getExportFilename,
};