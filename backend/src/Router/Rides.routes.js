const { RidesController } = require('../Controllers');
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

router.get(
  '/history',
  auth({ isTokenRequired: true, usersAllowed: [ROLE.USER, ROLE.ADMIN] }),
  RidesController.getRideHistory
);

router.get(
  '/:id',
  auth({ isTokenRequired: true, usersAllowed: ['*'] }),
  RidesController.getRide
);

router.patch(
  '/update-status',
  auth({ isTokenRequired: true, usersAllowed: ['*'] }),
  RidesController.updateRideStatus
);

router.post(
  '/rate',
  auth({ isTokenRequired: true, usersAllowed: [ROLE.USER] }),
  RidesController.rateRide
);

module.exports = router;
