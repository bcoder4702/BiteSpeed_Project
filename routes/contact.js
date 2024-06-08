// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contact');

// Identify endpoint
router.post('/identify', contactController.identify);

module.exports = router;
