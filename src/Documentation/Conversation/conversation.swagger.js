/**
 * @swagger
 * components:
 *   schemas:
 *     Conversation:
 *       type: object
 *       required:
 *         - name
 *         - participants
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the conversation
 *         name:
 *           type: string
 *           description: The name of the conversation
 *         is_group_chat:
 *           type: boolean
 *           description: Whether this is a group chat
 *           default: false
 *         created_by:
 *           type: string
 *           description: The ID of the user who created the conversation
 *         total_unread_messages:
 *           type: number
 *           description: Total number of unread messages
 *           default: 0
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of participant IDs
 *         last_message:
 *           type: string
 *           description: The last message in the conversation
 *           default: "Hello"
 *         is_active:
 *           type: boolean
 *           description: Whether the conversation is active
 *           default: true
 *         is_deleted:
 *           type: boolean
 *           description: Whether the conversation is deleted
 *           default: false
 */

/**
 * @swagger
 * tags:
 *   name: Conversations
 *   description: Conversation management API
 */

/**
 * @swagger
 * /api/v1/conversation/add-conversation:
 *   post:
 *     summary: Create a new group conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - participants
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the group conversation
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of participant IDs
 *     responses:
 *       201:
 *         description: Group conversation created successfully
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
 *                   example: Group conversation created successfully
 *                 data:
 *                   $ref: '#/components/schemas/Conversation'
 *       400:
 *         description: Name already exists
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/conversation/get:
 *   get:
 *     summary: Get a conversation by ID
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: conversation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the conversation to retrieve
 *     responses:
 *       200:
 *         description: Conversation retrieved successfully
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
 *                   example: Conversation retrieved successfully
 *                 data:
 *                   $ref: '#/components/schemas/Conversation'
 *       400:
 *         description: Conversation ID is required
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/conversation/edit:
 *   put:
 *     summary: Edit a conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: conversation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the conversation to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name for the conversation
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Updated array of participant IDs
 *     responses:
 *       200:
 *         description: Conversation updated successfully
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
 *                   example: Conversation updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Conversation'
 *       400:
 *         description: Conversation ID is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/conversation/delete:
 *   put:
 *     summary: Delete a conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: conversation_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the conversation to delete
 *     responses:
 *       200:
 *         description: Conversation deleted successfully
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
 *                   example: Conversation deleted successfully
 *       400:
 *         description: Conversation ID is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Internal server error
 */
