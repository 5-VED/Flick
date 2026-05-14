/**
 * @swagger
 * components:
 *   schemas:
 *     Ride:
 *       type: object
 *       required:
 *         - pickup_location
 *         - pickup_location_coords
 *         - drop_locatin_coords
 *       properties:
 *         boked_by:
 *           type: string
 *           description: ID of the user who booked the ride
 *         pickup_location:
 *           type: string
 *           description: Pickup location address
 *         pickup_location_coords:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *               description: Latitude of pickup location
 *             longitude:
 *               type: number
 *               description: Longitude of pickup location
 *         drop_locatin_coords:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *               description: Latitude of drop location
 *             longitude:
 *               type: number
 *               description: Longitude of drop location
 *         captain:
 *           type: string
 *           description: ID of the rider assigned to the ride
 *         status:
 *           type: string
 *           enum: [REQUESTED, REJECTED, ONTHEWAY, ARRIVED, CANCELLED, COMPLETED]
 *           description: Current status of the ride
 *         start_time:
 *           type: string
 *           format: date-time
 *           description: Time when the ride started
 *         end_time:
 *           type: string
 *           format: date-time
 *           description: Time when the ride ended
 *
 *     CancelRideRequest:
 *       type: object
 *       required:
 *         - ride_id
 *         - reason
 *       properties:
 *         ride_id:
 *           type: string
 *           description: ID of the ride to cancel
 *         reason:
 *           type: string
 *           description: Reason for cancelling the ride
 */

/**
 * @swagger
 * tags:
 *   name: Rides
 *   description: Ride management endpoints
 */

/**
 * @swagger
 * /api/rides/book-ride:
 *   post:
 *     summary: Book a new ride
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Ride'
 *     responses:
 *       201:
 *         description: Ride booked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Ride'
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/rides/cancel-ride:
 *   put:
 *     summary: Cancel an existing ride
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancelRideRequest'
 *     responses:
 *       200:
 *         description: Ride cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request - Invalid input data
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - User not authorized to cancel this ride
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Internal server error
 */
