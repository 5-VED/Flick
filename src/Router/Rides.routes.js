const { RoleController, RidesController } = require('../Controllers');
const auth = require('../Middlewares/Auth.middleware');
const { ROLE } = require('../Constants/enums');
const router = require('express').Router();

router.post(
  '/book-ride',
  auth({ isTokenRequired: true, usersAllowed: [ROLE.USER, ROLE.ADMIN] }),
  RidesController.bookRide
);

router.put(
  '/cancel-ride',
  auth({ isTokenRequired: true, usersAllowed: ['*'] }),
  RidesController.cancelRide
);

module.exports = router;
