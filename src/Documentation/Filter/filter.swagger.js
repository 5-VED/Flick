/**
 * @swagger
 * components:
 *   schemas:
 *     Filter:
 *       type: object
 *       required:
 *         - name
 *         - entity
 *         - fields
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *           description: Name of the filter
 *         entity:
 *           type: string
 *           description: Entity type to filter (e.g., user, conversation, message)
 *         fields:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 description: Field name to filter on
 *               operator:
 *                 type: string
 *                 enum: [eq, ne, gt, gte, lt, lte, in, nin, contains, between]
 *               value:
 *                 type: any
 *                 description: Value to compare against
 *         logic:
 *           type: string
 *           enum: [AND, OR]
 *           default: AND
 *
 *     FilterApplyRequest:
 *       type: object
 *       properties:
 *         key:
 *           type: string
 *           description: Name of a system filter
 *         filter_id:
 *           type: string
 *           description: ID of a stored filter
 *         filter_def:
 *           type: object
 *           description: Inline filter definition
 *           properties:
 *             name:
 *               type: string
 *             entity:
 *               type: string
 *             fields:
 *               type: array
 *               items:
 *                 type: object
 *             logic:
 *               type: string
 *         entity:
 *           type: string
 *           description: Entity to apply filter on
 */

/**
 * @swagger
 * tags:
 *   name: Filters
 *   description: Dynamic data filtering system
 */

/**
 * @swagger
 * /api/v1/filter/:
 *   post:
 *     summary: Create a new filter
 *     tags: [Filters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Filter'
 *     responses:
 *       201:
 *         description: Filter created successfully
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
 *                   example: Filter created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Filter'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/filter/apply:
 *   post:
 *     summary: Apply a filter and retrieve filtered data
 *     tags: [Filters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FilterApplyRequest'
 *     responses:
 *       200:
 *         description: Data filtered successfully
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
 *                   example: Data filtered successfully
 *                 data:
 *                   type: array
 *                 meta:
 *                   type: object
 *                   properties:
 *                     filter_applied:
 *                       type: string
 *       400:
 *         description: Invalid filter or unsupported entity
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Filter not found
 *       500:
 *         description: Internal server error
 */
