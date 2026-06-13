const RfidTag = require('../models/RfidTag');

const rfidTagController = {
  /** Create a new tag batch */
  async create(req, res) {
    try {
      const { quantity } = req.body;
      if (!quantity) {
        return res.status(400).json({ success: false, message: 'quantity is required' });
      }
      const tagBatch = await RfidTag.create({ quantity });
      return res.status(201).json({ success: true, data: tagBatch });
    } catch (err) {
      console.error('Create RFID tag batch error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  /** Get all tag batches */
  async list(req, res) {
    try {
      const tags = await RfidTag.findAll();
      return res.json({ success: true, data: tags });
    } catch (err) {
      console.error('List RFID tag batches error:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

module.exports = rfidTagController;
