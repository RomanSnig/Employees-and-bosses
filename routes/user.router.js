const router = require('express').Router();
const config = require('../configs/config');
const userController = require('../controllers/user.controller');
const {checkToken} = require('../middlewares/token.middleware');
const {checkRole} = require('../middlewares/check-role.middleware');

router.use(checkToken([config.ADMIN_ROLE, config.CHIEF_ROLE, config.WORKER_ROLE]), checkRole([config.ADMIN_ROLE, config.CHIEF_ROLE, config.WORKER_ROLE]));

router
    .post('/', userController.createNewUser)

    .patch('/', userController.updateUserChief)

    .get('/:id', userController.getUserById)

    .get('/', userController.getAllUsers);

module.exports = router;
