const { UserModel, RidesModel, AddressModel } = require('../Models');
const messages = require('../Constants/messages');
const { HTTP_CODES } = require('../Constants/enums');
const geocoding = require('../Utils/geocoding.util');
const { IPINFO_TOKEN, IPINFO_URL } = require('../Config/config');

module.exports = {
  bookRide: async (req, res) => {
    try {
      // const current_location = await fetch(`${IPINFO_URL}`, {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Bearer ${IPINFO_TOKEN}`
      //   }
      // });

      // const data = await current_location.json();
      // if (!data.loc) {
      //   return res.status(HTTP_CODES.BAD_REQUEST).json({
      //     success: false,
      //     message: messages.LOCATION_NOT_FOUND,
      //   });
      // }

      // const [lat, long] = data.loc.split(',');
      // const address = await geocoding.forward_geocoding(lat, long);

      // const addressPayload = {
      //   user_id: req.user._id,
      //   city: address?.components?.city,
      //   state: address?.components?.state,
      //   country: address?.components?.country,
      //   postal_code: address?.components?.postcode,
      //   location: {
      //     type: 'Point',
      //     coordinates: [lat, long],
      //   },
      // };

      // await AddressModel.create(addressPayload);

      const { pickup_location, drop_location, pickup_location_coords, drop_locatin_coords } =
        req.body;

      if (!pickup_location) {
        const { latitude, longitude } = pickup_location_coords;
        const response = await geocoding.forward_geocoding(latitude, longitude);
        if (!response) {
          return res.status(HTTP_CODES.BAD_REQUEST).json({
            success: false,
            message: messages.LOCATION_NOT_FOUND,
          });
        }
        payload.pickup_location = response[0].formatted_address;
      }

      if (!drop_location) {
        const { latitude, longitude } = drop_locatin_coords;
        const response = await geocoding.forward_geocoding(latitude, longitude);
        if (!response) {
          return res.status(HTTP_CODES.BAD_REQUEST).json({
            success: false,
            message: messages.LOCATION_NOT_FOUND,
          });
        }
        payload.drop_location = response[0].formatted_address;
      }

      payload.boked_by = req.user._id;

      console.log(' ========= Payload for ride booking:-------->', req.body);
      const ride = await RidesModel.create(req.body);

      // Start findin rider
      // Once rider confirms the ride semd notification to the user
      // Change status of the ride to ONTHEWAY

      return res.status(HTTP_CODES.CREATED).json({
        success: true,
        message: messages.RIDE_BOOKED_SUCCESSFULLY,
        data: ride,
      });
    } catch (error) {
      console.log(error);
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error,
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

      // Check if the user has permission to cancel this ride
      const userRole = req.user.role;
      const userId = req.user._id;

      if (userRole === ROLE.USER && ride.user_id.toString() !== userId.toString()) {
        return res.status(HTTP_CODES.FORBIDDEN).json({
          success: false,
          message: messages.UNAUTHORIZED_ACCESS,
        });
      }

      if (userRole === ROLE.RIDER && ride.rider_id.toString() !== userId.toString()) {
        return res.status(HTTP_CODES.FORBIDDEN).json({
          success: false,
          message: messages.UNAUTHORIZED_ACCESS,
        });
      }

      // Update ride status
      ride.status = 'CANCELLED';
      ride.cancellation_reason = reason;
      ride.cancelled_by = userId;
      ride.cancelled_at = new Date();

      await ride.save();

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.RIDE_CANCELLED_SUCCESSFULLY,
      });
    } catch (error) {
      console.error('Error in cancelRide:', error);
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  },

  // getRiderProfile: async (req, res) => {
  //   try {
  //     const { email } = req.query;

  //     const [userWithRider] = await UserModel.aggregate([
  //       {
  //         $match: { email },
  //       },
  //       {
  //         $lookup: {
  //           from: 'Rider',
  //           localField: '_id',
  //           foreignField: 'user_id',
  //           as: 'rider',
  //         },
  //       },
  //       {
  //         $unwind: {
  //           path: '$rider',
  //           preserveNullAndEmptyArrays: false, // This will exclude users without riders
  //         },
  //       },
  //       {
  //         $project: {
  //           _id: 1,
  //           email: 1,
  //           name: 1,
  //           rider: 1,
  //         },
  //       },
  //     ]);

  //     if (!userWithRider) {
  //       return res.status(HTTP_CODES.NOT_FOUND).json({
  //         success: false,
  //         message: messages.RIDER_NOT_FOUND, // More specific message
  //       });
  //     }

  //     return res.status(HTTP_CODES.OK).json({
  //       success: true,
  //       message: messages.RIDER_PROFILE_FETCHED,
  //       data: {
  //         user: {
  //           id: userWithRider._id,
  //           email: userWithRider.email,
  //           name: userWithRider.name,
  //         },
  //         rider: userWithRider.rider,
  //       },
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       message: messages.INTERNAL_SERVER_ERROR,
  //       error,
  //     });
  //   }
  // },
};
