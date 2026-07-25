/**
 * @swagger
 * components:
 *   schemas:
 *     Ride:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         boked_by:
 *           type: string
 *           description: ID of the user who booked the ride
 *         captain:
 *           type: string
 *           description: ID of the rider assigned to the ride
 *         pickup_location:
 *           type: string
 *           description: Pickup location address
 *         drop_location:
 *           type: string
 *           description: Drop location address
 *         pickup_location_coords:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *             longitude:
 *               type: number
 *         drop_locatin_coords:
 *           type: object
 *           properties:
 *             latitude:
 *               type: number
 *             longitude:
 *               type: number
 *         vehicle_type:
 *           type: string
 *           example: Bike
 *         fare:
 *           type: number
 *         fare_breakdown:
 *           type: object
 *           properties:
 *             base_fare:
 *               type: number
 *             distance_fare:
 *               type: number
 *             platform_fee:
 *               type: number
 *             gst:
 *               type: number
 *         payment_method:
 *           type: string
 *           enum: [Cash, UPI, Wallet]
 *         status:
 *           type: string
 *           enum: [Requested, Accepted, Rejected, Cancelled, Started, Arrived, OnTheWay, Completed]
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         review:
 *           type: string
 *         tip:
 *           type: number
 *         trip_distance:
 *           type: number
 *           description: Distance in km
 *         trip_duration:
 *           type: number
 *           description: Duration in minutes
 *         cancellation_reason:
 *           type: string
 *         cancelled_by:
 *           type: string
 *         cancelled_at:
 *           type: string
 *           format: date-time
 *         start_time:
 *           type: string
 *           format: date-time
 *         end_time:
 *           type: string
 *           format: date-time
 *
 *     FareEstimateRequest:
 *       type: object
 *       required:
 *         - pickup_coords
 *         - drop_coords
 *       properties:
 *         pickup_coords:
 *           type: object
 *           required:
 *             - latitude
 *             - longitude
 *           properties:
 *             latitude:
 *               type: number
 *               example: 28.6139
 *             longitude:
 *               type: number
 *               example: 77.2090
 *         drop_coords:
 *           type: object
 *           required:
 *             - latitude
 *             - longitude
 *           properties:
 *             latitude:
 *               type: number
 *               example: 28.7041
 *             longitude:
 *               type: number
 *               example: 77.1025
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
 *           description: Reason for cancelling
 *
 *     RateRideRequest:
 *       type: object
 *       required:
 *         - ride_id
 *         - rating
 *       properties:
 *         ride_id:
 *           type: string
 *         rating:
 *           type: number
 *           minimum: 1
 *           maximum: 5
 *         review:
 *           type: string
 *         tip:
 *           type: number
 *         payment_method:
 *           type: string
 *           enum: [Cash, UPI, Wallet]
 */

/**
 * @swagger
 * tags:
 *   name: Rides
 *   description: Ride booking, tracking, and management
 */

/**
 * @swagger
 * /api/v1/rides/estimate:
 *   post:
 *     summary: Estimate fare for a ride
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FareEstimateRequest'
 *     responses:
 *       200:
 *         description: Fare estimate fetched
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
 *                   example: Fare estimate fetched successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     distance:
 *                       type: number
 *                       description: Distance in km
 *                     duration:
 *                       type: number
 *                       description: Duration in minutes
 *                     estimates:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           category:
 *                             type: string
 *                           total_fare:
 *                             type: number
 *                           base_fare:
 *                             type: number
 *                           distance_fare:
 *                             type: number
 *                           platform_fee:
 *                             type: number
 *                           gst:
 *                             type: number
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/rides/book-ride:
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
 *             type: object
 *             required:
 *               - pickup_location
 *               - drop_location
 *             properties:
 *               pickup_location:
 *                 type: string
 *                 example: Connaught Place, New Delhi
 *               drop_location:
 *                 type: string
 *                 example: India Gate, New Delhi
 *               pickup_location_coords:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *               drop_locatin_coords:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *               vehicle_type:
 *                 type: string
 *                 example: Bike
 *               fare:
 *                 type: number
 *                 example: 150
 *               fare_breakdown:
 *                 type: object
 *               payment_method:
 *                 type: string
 *                 enum: [Cash, UPI, Wallet]
 *                 example: Cash
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Ride booked successfully
 *                 data:
 *                   $ref: '#/components/schemas/Ride'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/rides/cancel-ride:
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Ride cancelled successfully
 *                 data:
 *                   $ref: '#/components/schemas/Ride'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to cancel this ride
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/rides/history:
 *   get:
 *     summary: Get ride history for the authenticated user
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Requested, Accepted, Rejected, Cancelled, Started, Arrived, OnTheWay, Completed]
 *         description: Filter by ride status
 *     responses:
 *       200:
 *         description: Ride history fetched
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
 *                   example: Ride history fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ride'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/rides/{id}:
 *   get:
 *     summary: Get ride details by ID
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Ride ID
 *     responses:
 *       200:
 *         description: Ride details fetched
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
 *                   example: Ride fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/Ride'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/rides/update-status:
 *   patch:
 *     summary: Update ride status
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ride_id
 *               - status
 *             properties:
 *               ride_id:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Requested, Accepted, Rejected, Cancelled, Started, Arrived, OnTheWay, Completed]
 *               trip_distance:
 *                 type: number
 *                 description: Trip distance in km (for Completed status)
 *               trip_duration:
 *                 type: number
 *                 description: Trip duration in minutes (for Completed status)
 *     responses:
 *       200:
 *         description: Ride status updated
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
 *                   example: Ride status updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Ride'
 *       400:
 *         description: Validation error or invalid status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/rides/rate:
 *   post:
 *     summary: Rate a completed ride
 *     tags: [Rides]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RateRideRequest'
 *     responses:
 *       200:
 *         description: Ride rated successfully
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
 *                   example: Ride rated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Ride'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Cannot rate someone else's ride
 *       404:
 *         description: Ride not found
 *       500:
 *         description: Internal server error
 */
