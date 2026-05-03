const { UserModel, RidesModel, RiderModel, DisputeModel, RoleModel } = require('../Models');
const messages = require('../Constants/messages');
const { HTTP_CODES, RIDE_STATUS } = require('../Constants/enums');

module.exports = {
  getStats: async (req, res) => {
    try {
      const [
        totalCustomers,
        totalRiders,
        totalRides,
        completedRides,
        cancelledRides,
        ongoingRides,
        openDisputes,
        recentRides,
      ] = await Promise.all([
        UserModel.countDocuments({ is_deleted: false, is_active: true }),
        RiderModel.countDocuments({ is_deleted: false }),
        RidesModel.countDocuments({ is_deleted: false }),
        RidesModel.countDocuments({ status: RIDE_STATUS.COMPLETED }),
        RidesModel.countDocuments({ status: RIDE_STATUS.CANCELLED }),
        RidesModel.countDocuments({ status: { $in: [RIDE_STATUS.ACCEPTED, RIDE_STATUS.ONTHEWAY, RIDE_STATUS.STARTED, RIDE_STATUS.ARRIVED] } }),
        DisputeModel.countDocuments({ status: 'Open', is_deleted: false }),
        RidesModel.find({ is_deleted: false }).sort({ createdAt: -1 }).limit(5)
          .populate('boked_by', 'first_name last_name'),
      ]);

      const fareAgg = await RidesModel.aggregate([
        { $match: { status: RIDE_STATUS.COMPLETED } },
        { $group: { _id: null, totalRevenue: { $sum: '$fare' } } },
      ]);
      const totalRevenue = fareAgg[0]?.totalRevenue || 0;

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.ADMIN_STATS_FETCHED,
        data: {
          totalCustomers,
          totalRiders,
          totalRides,
          completedRides,
          cancelledRides,
          ongoingRides,
          openDisputes,
          totalRevenue,
          recentRides,
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

  getCustomers: async (req, res) => {
    try {
      const { search = '', page = 1, limit = 20, status } = req.query;

      const criteria = { is_deleted: false };
      if (status === 'active') criteria.is_active = true;
      if (status === 'blocked') criteria.is_active = false;

      if (search) {
        const s = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        criteria.$or = [
          { first_name: { $regex: s, $options: 'i' } },
          { last_name: { $regex: s, $options: 'i' } },
          { email: { $regex: s, $options: 'i' } },
          { phone: { $regex: s, $options: 'i' } },
        ];
      }

      const [users, total] = await Promise.all([
        UserModel.find(criteria)
          .select('-password -confirmation_code')
          .populate('role', 'role')
          .sort({ createdAt: -1 })
          .skip((parseInt(page) - 1) * parseInt(limit))
          .limit(parseInt(limit)),
        UserModel.countDocuments(criteria),
      ]);

      // Attach ride counts
      const userIds = users.map(u => u._id);
      const rideCounts = await RidesModel.aggregate([
        { $match: { boked_by: { $in: userIds } } },
        { $group: { _id: '$boked_by', total: { $sum: 1 }, totalFare: { $sum: '$fare' } } },
      ]);
      const rideMap = {};
      rideCounts.forEach(r => { rideMap[r._id.toString()] = r; });

      const enriched = users.map(u => ({
        ...u.toObject(),
        totalRides: rideMap[u._id.toString()]?.total || 0,
        totalSpent: rideMap[u._id.toString()]?.totalFare || 0,
      }));

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.ADMIN_CUSTOMERS_FETCHED,
        data: enriched,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
      });
    } catch (error) {
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  },

  getRiders: async (req, res) => {
    try {
      const { search = '', page = 1, limit = 20 } = req.query;

      const criteria = { is_deleted: false };

      const riders = await RiderModel.find(criteria)
        .populate('user_id', 'first_name last_name email phone profile_pic is_active createdAt')
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));

      const total = await RiderModel.countDocuments(criteria);

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.ADMIN_RIDERS_FETCHED,
        data: riders,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
      });
    } catch (error) {
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  },

  getAllRides: async (req, res) => {
    try {
      const { page = 1, limit = 20, status, search } = req.query;

      const criteria = { is_deleted: false };
      if (status && status !== 'all') criteria.status = status;

      const [rides, total] = await Promise.all([
        RidesModel.find(criteria)
          .populate('boked_by', 'first_name last_name phone email')
          .populate('captain', 'first_name last_name phone')
          .sort({ createdAt: -1 })
          .skip((parseInt(page) - 1) * parseInt(limit))
          .limit(parseInt(limit)),
        RidesModel.countDocuments(criteria),
      ]);

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.ADMIN_RIDES_FETCHED,
        data: rides,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
      });
    } catch (error) {
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  },

  getDisputes: async (req, res) => {
    try {
      const { page = 1, limit = 20, status } = req.query;

      const criteria = { is_deleted: false };
      if (status && status !== 'all') criteria.status = status;

      const [disputes, total] = await Promise.all([
        DisputeModel.find(criteria)
          .populate('raised_by', 'first_name last_name phone email')
          .populate('against', 'first_name last_name phone')
          .populate('ride_id', 'pickup_location drop_location fare status')
          .sort({ createdAt: -1 })
          .skip((parseInt(page) - 1) * parseInt(limit))
          .limit(parseInt(limit)),
        DisputeModel.countDocuments(criteria),
      ]);

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.ADMIN_DISPUTES_FETCHED,
        data: disputes,
        pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
      });
    } catch (error) {
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  },

  updateUserStatus: async (req, res) => {
    try {
      const { user_id, is_active } = req.body;
      const user = await UserModel.findByIdAndUpdate(
        user_id,
        { is_active },
        { new: true }
      ).select('-password -confirmation_code');

      if (!user) {
        return res.status(HTTP_CODES.NOT_FOUND).json({ success: false, message: messages.USER_NOT_REGISTERED });
      }

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.USER_STATUS_UPDATED,
        data: user,
      });
    } catch (error) {
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  },

  verifyRider: async (req, res) => {
    try {
      const { rider_id, is_verified } = req.body;
      const rider = await RiderModel.findByIdAndUpdate(
        rider_id,
        { doc_verified: is_verified },
        { new: true }
      ).populate('user_id', 'first_name last_name email phone');

      if (!rider) {
        return res.status(HTTP_CODES.NOT_FOUND).json({ success: false, message: messages.RIDER_NOT_FOUND });
      }

      if (is_verified) {
        await UserModel.findByIdAndUpdate(rider.user_id, { is_authorized_rider: true });
      }

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.RIDER_VERIFIED,
        data: rider,
      });
    } catch (error) {
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  },

  resolveDispute: async (req, res) => {
    try {
      const { dispute_id, status, resolution_note } = req.body;
      const dispute = await DisputeModel.findByIdAndUpdate(
        dispute_id,
        { status, resolution_note, resolved_by: req.user._id, resolved_at: new Date() },
        { new: true }
      );

      if (!dispute) {
        return res.status(HTTP_CODES.NOT_FOUND).json({ success: false, message: 'Dispute not found' });
      }

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: 'Dispute updated successfully',
        data: dispute,
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
