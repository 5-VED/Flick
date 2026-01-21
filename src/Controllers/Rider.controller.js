const { UserModel, RidesModel, RiderModel } = require('../Models');
const messages = require('../Constants/messages');
const { HTTP_CODES } = require('../Constants/enums');
const logger = require('../Utils/logger.utils');

module.exports = {
  registerRider: async (req, res) => {
    try {
      const vehicle_photos = req.files?.vehicle_photo || [];
      if (vehicle_photos.length === 0) {
        return res.status(HTTP_CODES.BAD_REQUEST).json({
          success: false,
          message: messages.VEHICLE_IMAGES_REQUIRED,
        });
      }

      const vehicle_photo = vehicle_photos.map(photo => photo.path);

      // Extract required fields with validation
      const { vehicle_details, bank_details, driving_liscence_no, adhaar_card_no, pan_card_no } =
        req.body;
      const adhaar_card_photo = req.files?.adhaar_card_photo?.[0]?.path;
      const pan_card_photo = req.files?.pan_card_photo?.[0]?.path;

      // Validate required files
      if (!adhaar_card_photo || !pan_card_photo) {
        return res.status(HTTP_CODES.BAD_REQUEST).json({
          success: false,
          message: messages.REQUIRED_DOCUMENTS_MISSING,
        });
      }

      const payload = {
        user_id: req.user._id,
        vehicle_details,
        bank_details,
        driving_liscence_no,
        adhaar_card_no,
        adhaar_card_photo,
        pan_card_no,
        pan_card_photo,
        vehicle_photo,
      };

      // Run all validations concurrently (including user existence check)
      const [
        userExists,
        existingRider,
        existingVehicle,
        existingLicense,
        existingAadhaar,
        existingPan,
      ] = await Promise.all([
        UserModel.findById(req.user._id).lean(),
        RiderModel.findOne({ user_id: req.user._id }).lean(),
        RiderModel.findOne({ 'vehicle_details.vehicle_no': vehicle_details?.vehicle_no }).lean(),
        RiderModel.findOne({ driving_liscence_no }).lean(),
        RiderModel.findOne({ adhaar_card_no }).lean(),
        RiderModel.findOne({ pan_card_no }).lean(),
      ]);

      // Check if user exists
      if (!userExists) {
        return res.status(HTTP_CODES.NOT_FOUND).json({
          success: false,
          message: messages.USER_NOT_REGISTERED,
        });
      }

      // Check for conflicts using a more efficient approach
      const conflicts = [
        { condition: existingRider, message: messages.RIDER_ALREADY_EXISTS },
        { condition: existingVehicle, message: messages.VEHICLE_ALREADY_REGISTERED },
        { condition: existingLicense, message: messages.DRIVING_LICENSE_ALREADY_EXISTS },
        { condition: existingAadhaar, message: messages.AADHAAR_ALREADY_EXISTS },
        { condition: existingPan, message: messages.PAN_ALREADY_EXISTS },
      ];

      const conflict = conflicts.find(c => c.condition);
      if (conflict) {
        return res.status(HTTP_CODES.CONFLICT).json({
          success: false,
          message: conflict.message,
        });
      }

      const newRider = await RiderModel.create(payload);

      // Populate user details in response
      const populatedRider = await RiderModel.findById(newRider._id)
        .populate('user_id', 'name email phone_number')
        .select('-__v');

      return res.status(HTTP_CODES.CREATED).json({
        success: true,
        message: messages.RIDER_REGISTERED_SUCCESS,
        data: populatedRider,
      });
    } catch (error) {
      logger.error('Error registering user:->', error);
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  },

  getRiderProfile: async (req, res) => {
    try {
      if (!userWithRider) {
        return res.status(HTTP_CODES.NOT_FOUND).json({
          success: false,
          message: messages.RIDER_NOT_FOUND, // More specific message
          data: userWithRider,
        });
      }

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.RIDER_PROFILE_FETCHED,
        data: {},
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
};
