/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
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
 *           description: PUC validity date
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
 *     RiderRegistration:
 *       type: object
 *       required:
 *         - vehicle_details
 *         - bank_details
 *         - driving_liscence_no
 *         - adhaar_card_no
 *         - pan_card_no
 *       properties:
 *         vehicle_details:
 *           $ref: '#/components/schemas/VehicleDetails'
 *         bank_details:
 *           $ref: '#/components/schemas/BankDetails'
 *         driving_liscence_no:
 *           type: string
 *           description: Driving license number
 *         adhaar_card_no:
 *           type: string
 *           description: Aadhaar card number
 *         pan_card_no:
 *           type: string
 *           description: PAN card number
 *     RiderResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user_id:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone_number:
 *                   type: string
 *             vehicle_details:
 *               $ref: '#/components/schemas/VehicleDetails'
 *             bank_details:
 *               $ref: '#/components/schemas/BankDetails'
 *             driving_liscence_no:
 *               type: string
 *             adhaar_card_no:
 *               type: string
 *             adhaar_card_photo:
 *               type: string
 *             pan_card_no:
 *               type: string
 *             pan_card_photo:
 *               type: string
 *             on_duty:
 *               type: boolean
 *               default: false
 *             rating:
 *               type: number
 *               default: 0
 *             total_rides:
 *               type: number
 *               default: 0
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           default: false
 *         message:
 *           type: string
 *         errors:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * tags:
 *   name: Rider
 *   description: Rider management and ride operations
 */

/**
 * @swagger
 * /api/v1/rider/register:
 *   post:
 *     summary: Register a new rider
 *     description: Register a new rider profile with vehicle and document details
 *     tags: [Rider]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               vehicle_details:
 *                 $ref: '#/components/schemas/VehicleDetails'
 *               bank_details:
 *                 $ref: '#/components/schemas/BankDetails'
 *               driving_liscence_no:
 *                 type: string
 *               adhaar_card_no:
 *                 type: string
 *               pan_card_no:
 *                 type: string
 *               adhaar_card_photo:
 *                 type: string
 *                 format: binary
 *               pan_card_photo:
 *                 type: string
 *                 format: binary
 *               vehicle_photo:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       201:
 *         description: Rider registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RiderResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - Duplicate entry
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
