const { UserModel, AttachmentsModel, UserAgentModel, RoleModel } = require('../Models');
const { compare } = require('bcrypt');
const { JWT_SECRET } = require('../Config/config');
const jwt = require('jsonwebtoken');
const messages = require('../Constants/messages');
const { HTTP_CODES } = require('../Constants/enums');
const { escapeRegExp } = require('../Utils/string.utils');

module.exports = {
  signup: async (req, res) => {
    try {
      const existing = await UserModel.findOne({
        $or: [{ email: req.body.email }, { phone: req.body.phone }],
      });
      if (existing) {
        return res.status(HTTP_CODES.BAD_REQUEST).json({
          success: false,
          message: messages.USER_ALREADY_EXISTS,
        });
      }

      if (!req.body.role) {
        const userRole = await RoleModel.findOne({ role: 'User' });
        if (userRole) req.body.role = userRole._id;
      }

      const result = await UserModel.create(req.body);
      const safeUser = result.toObject();
      delete safeUser.password;
      delete safeUser.confirmation_code;

      return res.status(HTTP_CODES.CREATED).json({
        success: true,
        message: messages.USER_CREATED_SUCCESS,
        data: safeUser,
      });
    } catch (error) {
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await UserModel.findOne({ email, is_deleted: false, is_active: true }).populate('role');

      if (!user) {
        return res.status(HTTP_CODES.NOT_FOUND).json({
          success: false,
          message: messages.USER_NOT_REGISTERED,
        });
      }

      const isPasswordCorrect = await compare(password, user.password);
      if (!isPasswordCorrect) {
        return res.status(HTTP_CODES.UNAUTHORIZED).json({
          success: false,
          message: messages.INCORRECT_PASSWORD,
        });
      }

      const token = jwt.sign(
        { email, _id: user._id, role: user.role?.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      if (req.userAgentInfo) {
        const agentPayload = {
          user_id: user._id,
          browser: {
            name: req.userAgentInfo.browser?.name,
            version: req.userAgentInfo.browser?.version,
            type: req.userAgentInfo.browser?.type,
          },
          os: {
            name: req.userAgentInfo.os?.name,
            platform: req.userAgentInfo.os?.platform,
            version: req.userAgentInfo.os?.version,
          },
          device: {
            type: req.userAgentInfo.device?.type,
            isBot: Boolean(req.userAgentInfo.device?.isBot),
          },
          source: req.userAgentInfo.source,
          last_login: new Date(),
          is_current: true,
        };
        await UserAgentModel.create(agentPayload).catch(() => {});
      }

      const safeUser = user.toObject();
      delete safeUser.password;
      delete safeUser.confirmation_code;

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.USER_LOGIN_SUCCESS,
        data: { user: safeUser, token },
      });
    } catch (error) {
      console.error('login error:', error);
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  },

  sendOtp: async (req, res) => {
    try {
      const { phone } = req.body;
      if (!phone) {
        return res.status(HTTP_CODES.BAD_REQUEST).json({
          success: false,
          message: messages.VALIDATION_ERROR,
          errors: ['phone is required'],
        });
      }

      let user = await UserModel.findOne({ phone, is_deleted: false });

      if (!user) {
        // Auto-create a guest user for phone-only auth
        const userRole = await RoleModel.findOne({ role: 'User' });
        const tempPassword = Math.random().toString(36).slice(-8);
        user = await UserModel.create({
          phone,
          first_name: 'User',
          last_name: phone.slice(-4),
          email: `${phone}@flick.app`,
          password: tempPassword,
          country_code: '+91',
          role: userRole?._id,
          gender: 'male',
        });
      }

      // Generate 4-digit OTP and store in confirmation_code
      const otp = String(Math.floor(1000 + Math.random() * 9000));
      user.confirmation_code = otp;
      await user.save({ validateBeforeSave: false });

      // In production: send OTP via SMS. For dev, return OTP in response.
      const response = {
        success: true,
        message: messages.OTP_SENT,
        data: { phone },
      };

      if (process.env.NODE_ENV !== 'production') {
        response.data.otp = otp; // Dev only
      }

      return res.status(HTTP_CODES.OK).json(response);
    } catch (error) {
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  },

  verifyOtp: async (req, res) => {
    try {
      const { phone, otp } = req.body;
      if (!phone || !otp) {
        return res.status(HTTP_CODES.BAD_REQUEST).json({
          success: false,
          message: messages.VALIDATION_ERROR,
          errors: ['phone and otp are required'],
        });
      }

      const user = await UserModel.findOne({ phone, is_deleted: false, is_active: true }).populate('role');

      if (!user) {
        return res.status(HTTP_CODES.NOT_FOUND).json({
          success: false,
          message: messages.PHONE_NOT_FOUND,
        });
      }

      if (String(user.confirmation_code) !== String(otp)) {
        return res.status(HTTP_CODES.UNAUTHORIZED).json({
          success: false,
          message: messages.OTP_INVALID,
        });
      }

      // Clear OTP after use
      user.confirmation_code = null;
      await user.save({ validateBeforeSave: false });

      const token = jwt.sign(
        { phone, _id: user._id, role: user.role?.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      const safeUser = user.toObject();
      delete safeUser.password;
      delete safeUser.confirmation_code;

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.OTP_VERIFIED,
        data: { user: safeUser, token },
      });
    } catch (error) {
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await UserModel.findOne({ _id: req.user._id, is_deleted: false, is_active: true })
        .populate('role', 'role')
        .select('-password -confirmation_code -__v');

      if (!user) {
        return res.status(HTTP_CODES.NOT_FOUND).json({
          success: false,
          message: messages.USER_NOT_REGISTERED,
        });
      }

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.USER_PROFILE_FETCHED,
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

  updateProfile: async (req, res) => {
    try {
      const allowed = ['first_name', 'last_name', 'gender', 'address', 'profile_pic'];
      const updates = {};
      allowed.forEach(field => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      });

      const user = await UserModel.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true }
      ).select('-password -confirmation_code -__v');

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.USER_PROFILE_UPDATED,
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

  disableUser: async (req, res) => {
    try {
      const result = await UserModel.findByIdAndUpdate(
        req.body._id,
        { is_active: false },
        { new: true }
      );
      if (!result) {
        return res.status(HTTP_CODES.BAD_REQUEST).json({
          success: false,
          message: messages.USER_DISABLE_ERROR,
        });
      }
      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.USER_DISABLED_SUCCESS,
        data: result,
      });
    } catch (error) {
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  },

  addAttachments: async (req, res) => {
    try {
      const files = req.files;
      if (!files || !Array.isArray(files) || files.length === 0) {
        return res.status(HTTP_CODES.BAD_REQUEST).json({
          success: false,
          message: messages.EXTENSION_NOT_FOUND,
        });
      }

      const results = await Promise.all(
        files.map(file =>
          AttachmentsModel.create({
            file_name: file.originalname,
            file_type: file.mimetype,
            file_size: `${(Number(file.size) / 1024).toFixed(2)} KB`,
            file_url: `/uploads/${file.filename}`,
            uploaded_at: new Date(),
          })
        )
      );

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.ATTACHMENTS_ADDED_SUCCESS,
        data: results.map(r => ({
          _id: r._id,
          file_name: r.file_name,
          file_type: r.file_type,
          file_size: r.file_size,
          file_url: r.file_url,
        })),
      });
    } catch (error) {
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  },

  removeAttachments: async (req, res) => {
    try {
      const result = await AttachmentsModel.findOne({ _id: req.params?.id });
      if (!result) {
        return res.status(HTTP_CODES.NOT_FOUND).json({
          success: false,
          message: messages.ATTACHMENT_NOT_FOUND,
        });
      }
      await AttachmentsModel.deleteOne({ _id: req.params.id });
      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.ATTACHMENT_REMOVED_SUCCESS,
      });
    } catch (error) {
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error: error.message,
      });
    }
  },

  getUsers: async (req, res) => {
    try {
      const { search = '', page = 1, limit = 20 } = req.query;

      const criteria = {
        is_deleted: false,
        is_active: true,
        _id: { $ne: req.user._id },
      };

      if (search) {
        const s = escapeRegExp(search);
        criteria.$or = [
          { first_name: { $regex: s, $options: 'i' } },
          { last_name: { $regex: s, $options: 'i' } },
          { email: { $regex: s, $options: 'i' } },
        ];
      }

      const users = await UserModel.find(criteria)
        .select('_id first_name last_name email profile_pic status phone createdAt')
        .sort({ createdAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));

      const total = await UserModel.countDocuments(criteria);

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: 'Users fetched successfully',
        data: users,
        pagination: { total, page: parseInt(page), limit: parseInt(limit) },
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
