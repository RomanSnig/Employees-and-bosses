const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const {checkToken} = require('../middlewares/token.middleware');
router
    .post('/refresh', authController.refresh)

    .post('/login', authController.login)

    .get('/logout', checkToken(), authController.logout);

module.exports = router;
