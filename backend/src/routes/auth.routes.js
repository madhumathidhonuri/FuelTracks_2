const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate, schemas } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/login', validate(schemas.login), authController.login);
router.post('/refresh-token', validate(schemas.refreshToken), authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);

module.exports = router;