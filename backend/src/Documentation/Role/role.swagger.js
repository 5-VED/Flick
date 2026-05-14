/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       required:
 *         - role
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the role
 *         role:
 *           type: string
 *           description: The name of the role
 *           enum: [ADMIN, USER]
 *         is_active:
 *           type: boolean
 *           default: true
 *           description: Whether the role is active
 *         is_deleted:
 *           type: boolean
 *           default: false
 *           description: Whether the role is deleted
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: When the role was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: When the role was last updated
 */

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management API
 */

/**
 * @swagger
 * /api/v1/role/add-role:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *                 description: Name of the role to create
 *     responses:
 *       201:
 *         description: Role created successfully
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
 *                   example: Role created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       400:
 *         description: Invalid role name
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/role/remove-role:
 *   delete:
 *     summary: Remove a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [ADMIN, USER]
 *                 description: Name of the role to remove
 *     responses:
 *       200:
 *         description: Role removed successfully
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
 *                   example: Role deleted successfully
 *                 data:
 *                   $ref: '#/components/schemas/Role'
 *       400:
 *         description: Invalid role name
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Role not found
 *       500:
 *         description: Internal server error
 */
