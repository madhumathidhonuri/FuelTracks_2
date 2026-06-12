const reportService = require('../services/report.service');
const Vehicle = require('../models/Vehicle');
const Organization = require('../models/Organization');
const { exportData, getExportHeaders, getExportFilename } = require('../services/export.service');

const getConsolidated = async (req, res) => {
  try {
    const { vehicleId, from, to } = req.query;
    if (!vehicleId || !from || !to) return res.status(400).json({ success: false, message: 'vehicleId, from, to required' });

    const vehicle = await Vehicle.findById(vehicleId);
    const report = await reportService.getConsolidatedReport(vehicleId, from, to, vehicle?.organization_id);
    return res.json({ success: true, data: report });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate consolidated report' });
  }
};

const getOverspeed = async (req, res) => {
  try {
    const { vehicleId, from, to } = req.query;
    if (!from || !to) return res.status(400).json({ success: false, message: 'from and to required' });

    const report = await reportService.getOverspeedReport(vehicleId, from, to);
    return res.json({ success: true, data: report });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate overspeed report' });
  }
};

const getStoppage = async (req, res) => {
  try {
    const { vehicleId, from, to } = req.query;
    if (!vehicleId || !from || !to) return res.status(400).json({ success: false, message: 'vehicleId, from, to required' });

    const stops = await reportService.getStoppageReport(vehicleId, from, to);
    return res.json({ success: true, data: stops });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate stoppage report' });
  }
};

const getTripHistory = async (req, res) => {
  try {
    const { vehicleId, from, to } = req.query;
    if (!vehicleId || !from || !to) return res.status(400).json({ success: false, message: 'vehicleId, from, to required' });

    const trips = await reportService.getTripHistoryReport(vehicleId, from, to);
    return res.json({ success: true, data: trips });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate trip history report' });
  }
};

const getRouteSummary = async (req, res) => {
  try {
    const { vehicleId, from, to } = req.query;
    if (!vehicleId || !from || !to) return res.status(400).json({ success: false, message: 'vehicleId, from, to required' });

    const summary = await reportService.getRouteSummary(vehicleId, from, to);
    return res.json({ success: true, data: summary });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to generate route summary' });
  }
};

const exportReport = async (req, res) => {
  try {
    const { data, format, filename, columns, title, subtitle, dateRange } = req.body;
    if (!data || !format) return res.status(400).json({ success: false, message: 'data and format required' });

    const buffer = await exportData(data, format, { columns, sheetName: filename, title, subtitle, dateRange });
    const contentType = getExportHeaders(format);
    const name = getExportFilename(filename || 'report', format, dateRange);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
    return res.send(buffer);
  } catch (err) {
    console.error('Export error:', err);
    return res.status(500).json({ success: false, message: 'Export failed: ' + err.message });
  }
};

module.exports = { getConsolidated, getOverspeed, getStoppage, getTripHistory, getRouteSummary, exportReport };