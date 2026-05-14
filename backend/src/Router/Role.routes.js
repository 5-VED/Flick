const { RoleController } = require('../Controllers');
const auth = require('../Middlewares/Auth.middleware');
const { ROLE } = require('../Constants/enums');

const router = require('express').Router();

router.post(
  '/add-role',
  auth({ isTokenRequired: true, usersAllowed: ROLE.SUPER_ADMIN }),
  RoleController.addRole
);

router.delete(
  '/remove-role',
  auth({ isTokenRequired: true, usersAllowed: ROLE.SUPER_ADMIN }),
  RoleController.removeRole
);

module.exports = router;
