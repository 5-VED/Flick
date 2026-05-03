const { UserModel, RidesModel } = require('../Models');
const messages = require('../Constants/messages');
const { HTTP_CODES, ROLE, RIDE_STATUS } = require('../Constants/enums');

module.exports = {
  bookRide: async (req, res) => {
    try {
      const {
        pickup_location,
        drop_location,
        pickup_location_coords,
        drop_locatin_coords,
        vehicle_type,
        fare,
        fare_breakdown,
        payment_method,
      } = req.body;

      if (!pickup_location || !drop_location) {
        return res.status(HTTP_CODES.BAD_REQUEST).json({
          success: false,
          message: messages.VALIDATION_ERROR,
          errors: ['pickup_location and drop_location are required'],
        });
      }

      const payload = {
        boked_by: req.user._id,
        pickup_location,
        drop_location,
        pickup_location_coords: pickup_location_coords || {},
        drop_locatin_coords: drop_locatin_coords || {},
        vehicle_type: vehicle_type || 'Bike',
        fare: fare || 0,
        fare_breakdown: fare_breakdown || {},
        payment_method: payment_method || 'Cash',
        status: RIDE_STATUS.REQUESTED,
      };

      const ride = await RidesModel.create(payload);

      return res.status(HTTP_CODES.CREATED).json({
        success: true,
        message: messages.RIDE_BOOKED_SUCCESSFULLY,
        data: ride,
      });
    } catch (error) {
      console.error('bookRide error:', error);
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  },

  cancelRide: async (req, res) => {
    try {
      const { ride_id, reason } = req.body;

      if (!ride_id || !reason) {
        return res.status(HTTP_CODES.BAD_REQUEST).json({
          success: false,
          message: messages.VALIDATION_ERROR,
          errors: ['Ride ID and reason are required'],
        });
      }

      const ride = await RidesModel.findById(ride_id);

      if (!ride) {
        return res.status(HTTP_CODES.NOT_FOUND).json({
          success: false,
          message: messages.RIDE_NOT_FOUND,
        });
      }

      const userRole = req.user.role;
      const userId = req.user._id;

      if (userRole === ROLE.USER && ride.boked_by.toString() !== userId.toString()) {
        return res.status(HTTP_CODES.FORBIDDEN).json({
          success: false,
          message: messages.UNAUTHORIZED_ACCESS,
        });
      }

      if (userRole === ROLE.RIDER && ride.rider_id && ride.rider_id.toString() !== userId.toString()) {
        return res.status(HTTP_CODES.FORBIDDEN).json({
          success: false,
          message: messages.UNAUTHORIZED_ACCESS,
        });
      }

      ride.status = RIDE_STATUS.CANCELLED;
      ride.cancellation_reason = reason;
      ride.cancelled_by = userId;
      ride.cancelled_at = new Date();
      await ride.save();

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.RIDE_CANCELLED_SUCCESSFULLY,
        data: ride,
      });
    } catch (error) {
      console.error('cancelRide error:', error);
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  },

  getRide: async (req, res) => {
    try {
      const { id } = req.params;
      const ride = await RidesModel.findById(id)
        .populate('boked_by', 'first_name last_name phone email profile_pic')
        .populate('captain', 'first_name last_name phone profile_pic');

      if (!ride) {
        return res.status(HTTP_CODES.NOT_FOUND).json({
          success: false,
          message: messages.RIDE_NOT_FOUND,
        });
      }

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: 'Ride fetched successfully',
        data: ride,
      });
    } catch (error) {
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  },

  getRideHistory: async (req, res) => {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const userId = req.user._id;

      const criteria = {
        boked_by: userId,
        is_deleted: false,
      };

      if (status && status !== 'all') {
        criteria.status = status;
      }

      const rides = await RidesModel.find(criteria)
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .populate('captain', 'first_name last_name phone profile_pic');

      const total = await RidesModel.countDocuments(criteria);

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.RIDE_HISTORY_FETCHED,
        data: rides,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  },

  updateRideStatus: async (req, res) => {
    try {
      const { ride_id, status, trip_distance, trip_duration } = req.body;

      if (!ride_id || !status) {
        return res.status(HTTP_CODES.BAD_REQUEST).json({
          success: false,
          message: messages.VALIDATION_ERROR,
          errors: ['ride_id and status are required'],
        });
      }

      const validStatuses = Object.values(RIDE_STATUS);
      if (!validStatuses.includes(status)) {
        return res.status(HTTP_CODES.BAD_REQUEST).json({
          success: false,
          message: messages.VALIDATION_ERROR,
          errors: [`status must be one of: ${validStatuses.join(', ')}`],
        });
      }

      const ride = await RidesModel.findById(ride_id);
      if (!ride) {
        return res.status(HTTP_CODES.NOT_FOUND).json({
          success: false,
          message: messages.RIDE_NOT_FOUND,
        });
      }

      ride.status = status;
      if (status === RIDE_STATUS.STARTED) ride.start_time = new Date();
      if (status === RIDE_STATUS.COMPLETED) {
        ride.end_time = new Date();
        if (trip_distance) ride.trip_distance = trip_distance;
        if (trip_duration) ride.trip_duration = trip_duration;
      }

      await ride.save();

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.RIDE_STATUS_UPDATED,
        data: ride,
      });
    } catch (error) {
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  },

  rateRide: async (req, res) => {
    try {
      const { ride_id, rating, review, tip, payment_method } = req.body;

      if (!ride_id || !rating) {
        return res.status(HTTP_CODES.BAD_REQUEST).json({
          success: false,
          message: messages.VALIDATION_ERROR,
          errors: ['ride_id and rating are required'],
        });
      }

      const ride = await RidesModel.findById(ride_id);
      if (!ride) {
        return res.status(HTTP_CODES.NOT_FOUND).json({
          success: false,
          message: messages.RIDE_NOT_FOUND,
        });
      }

      if (ride.boked_by.toString() !== req.user._id.toString()) {
        return res.status(HTTP_CODES.FORBIDDEN).json({
          success: false,
          message: messages.UNAUTHORIZED_ACCESS,
        });
      }

      ride.rating = rating;
      if (review) ride.review = review;
      if (tip) ride.tip = tip;
      if (payment_method) ride.payment_method = payment_method;

      await ride.save();

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.RIDE_RATED_SUCCESSFULLY,
        data: ride,
      });
    } catch (error) {
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  },
};
