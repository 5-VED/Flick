const UserController = require('../Controllers/User.controller');
const auth = require('../Middlewares/Auth.middleware');
const { MAXATTACHMENTS, ROLE } = require('../Constants/enums');
const upload = require('../Middlewares/File.middleware');
const {
  loginSchema,
  signupSchema,
  addAttachmentsSchema,
  removeAttachmentsSchema,
  disableUserSchema,
} = require('../Validators/User.validator');

const { validateRequest } = require('../Middlewares/Validlidator.middleware');

const router = require('express').Router();

router.post('/signup', validateRequest(signupSchema), UserController.signup);

router.post('/login', validateRequest(loginSchema), UserController.login);

router.post(
  '/add-attachments',
  auth({
    isTokenRequired: true,
    usersAllowed: [ROLE.USER],
  }),
  upload.array('file', MAXATTACHMENTS),
  validateRequest(addAttachmentsSchema),
  UserController.addAttachments
);

router.delete(
  '/remove-attachments/:id',
  auth({
    isTokenRequired: true,
    usersAllowed: [ROLE.USER],
  }),
  validateRequest(removeAttachmentsSchema),
  UserController.removeAttachments
);

router.patch(
  '/disable-user',
  auth({ isTokenRequired: true, usersAllowed: [ROLE.ADMIN] }),
  validateRequest(disableUserSchema),
  UserController.disableUser
);

module.exports = router;
