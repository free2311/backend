const express = require("express");
const router = express.Router();
const authController = require('../controllers/authController');

/* router.post('/login', async (req, res) => {
    await authController.login(req, res);
});

router.post('/register', async (req, res) => {
    await authController.register(req, res);
}); */


/**Enviar Correos */
router.get('/sendemail', async (req, res) => {
    await authController.sendFirstEmail(req, res);
});

router.post('/renovar/:id', async (req, res) => {
    await authController.sendSecondEmail(req, res);
});

/* router.get('/viewemail/', async (req, res) => {
    res.render("index", { titulo: "inicio EJS" });

}); */

router.post('/getdatos', async (req, res) => {
    await authController.getname(req, res);


});
/************************************** */

router.get('/', async (req, res) => {
    res.send("Welcome api");
});


module.exports = router;
