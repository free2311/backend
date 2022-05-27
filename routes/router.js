const express = require("express");
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login',async (req, res) => {
    await authController.login(req,res);
});

router.post('/register',async (req, res) => {
    await authController.register(req,res);
});

module.exports = router;
