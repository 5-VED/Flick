/**
 * @swagger
 * components:
 *   schemas:
 *     VehicleDetails:
 *       type: object
 *       required:
 *         - vehicle_no
 *         - vehicle_rc_no
 *         - puc_certificate_no
 *         - puc_validity
 *       properties:
 *         vehicle_no:
 *           type: string
 *           description: Vehicle registration number
 *         vehicle_rc_no:
 *           type: string
 *           description: Vehicle RC number
 *         puc_certificate_no:
 *           type: string
 *           description: PUC certificate number
 *         puc_validity:
 *           type: string
 *           format: date
 *           description: PUC validity date
 *
 *     BankDetails:
 *       type: object
 *       required:
 *         - ifsc_code
 *         - account_no
 *         - bank_name
 *       properties:
 *         ifsc_code:
 *           type: string
 *           description: Bank IFSC code
 *         account_no:
 *           type: string
 *           description: Bank account number
 *         bank_name:
 *           type: string
 *           description: Bank name
 *
 *     RiderProfile:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user_id:
 *           type: object
 *           properties:
 *             first_name:
 *               type: string
 *             last_name:
 *               type: string
 *             email:
 *               type: string
 *             phone:
 *               type: string
 *             profile_pic:
 *               type: string
 *             is_active:
 *               type: boolean
 *         vehicle_details:
 *           $ref: '#/components/schemas/VehicleDetails'
 *         bank_details:
 *           $ref: '#/components/schemas/BankDetails'
 *         driving_liscence_no:
 *           type: string
 *         adhaar_card_no:
 *           type: string
 *         pan_card_no:
 *           type: string
 *         adhaar_card_photo:
 *           type: string
 *         pan_card_photo:
 *           type: string
 *         vehicle_photos:
 *           type: array
 *           items:
 *             type: string
 *         on_duty:
 *           type: boolean
 *           default: false
 *         doc_verified:
 *           type: boolean
 *           default: false
 *         rating:
 *           type: number
 *           default: 0
 *         total_rides:
 *           type: number
 *           default: 0
 *         is_active:
 *           type: boolean
 *         is_deleted:
 *           type: boolean
 */

/**
 * @swagger
 * tags:
 *   name: Rider
 *   description: Rider registration and profile management
 */

/**
 * @swagger
 * /api/v1/rider/register:
 *   post:
 *     summary: Register as a new rider
 *     description: Register a rider profile with vehicle documents, bank details, and uploaded photos
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - vehicle_details
 *               - bank_details
 *               - driving_liscence_no
 *               - adhaar_card_no
 *               - pan_card_no
 *             properties:
 *               vehicle_details:
 *                 type: string
 *                 description: JSON string of VehicleDetails object
 *                 example: '{"vehicle_no":"DL-01-AB-1234","vehicle_rc_no":"RC123456789","puc_certificate_no":"PUC123456","puc_validity":"2026-12-31"}'
 *               bank_details:
 *                 type: string
 *                 description: JSON string of BankDetails object
 *                 example: '{"ifsc_code":"SBIN0001234","account_no":"12345678901","bank_name":"State Bank of India"}'
 *               driving_liscence_no:
 *                 type: string
 *                 example: DL-01234567890
 *               adhaar_card_no:
 *                 type: string
 *                 example: 1234-5678-9012
 *               pan_card_no:
 *                 type: string
 *                 example: ABCDE1234F
 *               adhaar_card_photo:
 *                 type: string
 *                 format: binary
 *                 description: Aadhaar card photo (file upload)
 *               pan_card_photo:
 *                 type: string
 *                 format: binary
 *                 description: PAN card photo (file upload)
 *               vehicle_photo:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Vehicle photos (up to 5 files)
 *     responses:
 *       201:
 *         description: Rider registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Rider registered successfully
 *                 data:
 *                   $ref: '#/components/schemas/RiderProfile'
 *       400:
 *         description: Validation error or duplicate entry
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Conflict - Rider already exists for this user
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/rider/get-rider-profile:
 *   get:
 *     summary: Get rider profile for the authenticated user
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rider profile fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Rider profile fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/RiderProfile'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Rider not found
 *       500:
 *         description: Internal server error
 */
