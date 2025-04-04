const express = require('express');
const db = require('../models/db.js');
const asyncHandler = require('express-async-handler');

const router = express.Router();

router.post(
    '/',
    authenticateToken,
    asyncHandler(async (req, res) => {
        const results = await db.getCandidates();
        res.json({ results, signature });
    })
);

module.exports = router;
