/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - phone
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the user
 *         email:
 *           type: string
 *           format: email
 *           description: The email of the user
 *         phone:
 *           type: string
 *           description: The phone number of the user
 *         password:
 *           type: string
 *           format: password
 *           description: The password of the user
 *         role:
 *           type: string
 *           description: Reference to the user's role
 *         is_active:
 *           type: boolean
 *           default: true
 *           description: Whether the user account is active
 *         is_deleted:
 *           type: boolean
 *           default: false
 *           description: Whether the user account is deleted
 *         attachments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Attachment'
 *           description: User's attachments
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Attachment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the attachment
 *         file_name:
 *           type: string
 *           description: Original name of the file
 *         file_type:
 *           type: string
 *           description: MIME type of the file
 *         file_size:
 *           type: string
 *           description: Size of the file in KB
 *         file_url:
 *           type: string
 *           description: URL/path of the uploaded file
 *         uploaded_at:
 *           type: string
 *           format: date-time
 *           description: When the file was uploaded
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */

/**
 * @swagger
 * /api/v1/user/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - phone
 *               - password
 *               - role
 *               - first_name
 *               - last_name
 *               - country_code
 *               - gender
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: tisha@yopmail.com
 *               phone:
 *                 type: string
 *                 example: "1234567893"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "Password123!"
 *               first_name:
 *                 type: string
 *                 example: "Tisha"
 *               last_name:
 *                 type: string
 *                 example: "Chandara"
 *               role:
 *                 type: string
 *                 example: "683fe6bf8763c9a0892c7724"
 *               address:
 *                 type: string
 *                 example: "123 Main Street, City, State"
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 example: "female"
 *               profile_pic:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/profile.jpg"
 *               country_code:
 *                 type: string
 *                 example: "+1"
 *               is_authorized_rider:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: User created successfully
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
 *                   example: "User created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     first_name:
 *                       type: string
 *                       example: "Tisha"
 *                     last_name:
 *                       type: string
 *                       example: "Chandara"
 *                     email:
 *                       type: string
 *                       example: "tisha@yopmail.com"
 *                     phone:
 *                       type: string
 *                       example: "1234567893"
 *                     role:
 *                       type: string
 *                       example: "683fe6bf8763c9a0892c7724"
 *                     address:
 *                       type: string
 *                       example: "123 Main Street, City, State"
 *                     gender:
 *                       type: string
 *                       example: "female"
 *                     profile_pic:
 *                       type: string
 *                       example: "https://example.com/profile.jpg"
 *                     country_code:
 *                       type: string
 *                       example: "+1"
 *                     is_authorized_rider:
 *                       type: boolean
 *                       example: false
 *                     status:
 *                       type: string
 *                       example: "offline"
 *                     is_active:
 *                       type: boolean
 *                       example: true
 *                     is_deleted:
 *                       type: boolean
 *                       example: false
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "User already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 *                 error:
 *                   type: object
 */

/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Password123!
 *     responses:
 *       201:
 *         description: Login successful
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
 *                   example: User logged in Successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     token:
 *                       type: string
 *       404:
 *         description: User not found or incorrect password
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/user/add-attachments:
 *   post:
 *     summary: Add attachments to user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Attachments added successfully
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
 *                   example: Attachments added successfully
 *       400:
 *         description: No files uploaded
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/user/remoe-attachments/{id}:
 *   delete:
 *     summary: Remove an attachment
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Attachment ID
 *     responses:
 *       200:
 *         description: Attachment removed successfully
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
 *                   example: Attachment removed successfully
 *       404:
 *         description: Attachment not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/user/disable-user:
 *   patch:
 *     summary: Disable a user account (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - _id
 *             properties:
 *               _id:
 *                 type: string
 *                 description: ID of the user to disable
 *     responses:
 *       200:
 *         description: User disabled successfully
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
 *                   example: User Disabled
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Error disabling user
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
