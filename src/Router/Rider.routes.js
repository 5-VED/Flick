const { RidesController, RiderController } = require('../Controllers');
const auth = require('../Middlewares/Auth.middleware');
const { ROLE } = require('../Constants/enums');
const router = require('express').Router();
const upload = require('../Middlewares/File.middleware');

router.post(
  '/register',
  auth({ isTokenRequired: true, usersAllowed: [ROLE.USER] }),
  upload.fields([
    { name: 'adhaar_card_photo', maxCount: 1 },
    { name: 'pan_card_photo', maxCount: 1 },
    { name: 'vehicle_photo', maxCount: 5 },
  ]),
  RiderController.registerRider
);

router.get(
  '/get-rider-profile',
  auth({ isTokenRequired: true, usersAllowed: [ROLE.USER] }),
  RiderController.getRiderProfile
);

module.exports = router;
