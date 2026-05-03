const UserController = require('../Controllers/User.controller');
const auth = require('../Middlewares/Auth.middleware');
const { MAXATTACHMENTS, ROLE } = require('../Constants/enums');
const upload = require('../Middlewares/File.middleware');
const { loginSchema, signupSchema } = require('../Validators/User.validator');
const { validateRequest } = require('../Middlewares/Validlidator.middleware');

const router = require('express').Router();

router.post('/signup', validateRequest(signupSchema), UserController.signup);

router.post('/login', validateRequest(loginSchema), UserController.login);

router.post('/send-otp', UserController.sendOtp);

router.post('/verify-otp', UserController.verifyOtp);

router.get(
  '/profile',
  auth({ isTokenRequired: true, usersAllowed: ['*'] }),
  UserController.getProfile
);

router.patch(
  '/profile',
  auth({ isTokenRequired: true, usersAllowed: ['*'] }),
  UserController.updateProfile
);

router.post(
  '/add-attachments',
  auth({ isTokenRequired: true, usersAllowed: [ROLE.USER] }),
  upload.array('file', MAXATTACHMENTS),
  UserController.addAttachments
);

router.delete(
  '/remove-attachments/:id',
  auth({ isTokenRequired: true, usersAllowed: [ROLE.USER] }),
  UserController.removeAttachments
);

router.patch(
  '/disable-user',
  auth({ isTokenRequired: true, usersAllowed: [ROLE.ADMIN] }),
  UserController.disableUser
);

router.get(
  '/list',
  auth({ isTokenRequired: true, usersAllowed: [ROLE.USER, ROLE.ADMIN] }),
  UserController.getUsers
);

module.exports = router;
