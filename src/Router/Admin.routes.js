const { AdminController } = require('../Controllers');
const auth = require('../Middlewares/Auth.middleware');
const { ROLE } = require('../Constants/enums');
const router = require('express').Router();

const adminAuth = auth({ isTokenRequired: true, usersAllowed: [ROLE.ADMIN, ROLE.SUPER_ADMIN] });

router.get('/stats', adminAuth, AdminController.getStats);
router.get('/customers', adminAuth, AdminController.getCustomers);
router.get('/riders', adminAuth, AdminController.getRiders);
router.get('/rides', adminAuth, AdminController.getAllRides);
router.get('/disputes', adminAuth, AdminController.getDisputes);
router.patch('/update-user-status', adminAuth, AdminController.updateUserStatus);
router.patch('/verify-rider', adminAuth, AdminController.verifyRider);
router.patch('/resolve-dispute', adminAuth, AdminController.resolveDispute);

module.exports = router;
