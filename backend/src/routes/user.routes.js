const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { validate, schemas } = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

router.use(authenticate, requireAdmin);

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', validate(schemas.createUser), userController.createUser);
router.put('/:id', validate(schemas.updateUser), userController.updateUser);
router.delete('/:id', userController.deleteUser);
router.post('/:id/groups', validate(schemas.addUsersToGroup), userController.addUserToGroups);

module.exports = router;