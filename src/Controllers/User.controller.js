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
      const payload = await UserModel.findOne({ email: req.body.email, phone: req.body.phone });
      if (payload) {
        return res.status(HTTP_CODES.BAD_REQUEST).json({
          success: false,
          message: messages.USER_ALREADY_EXISTS,
        });
      }

      if (!req.body.role) {
        const userRole = await RoleModel.findOne({ role: 'User' });
        if (userRole) {
          req.body.role = userRole._id;
        }
      }

      const result = await UserModel.create(req.body);

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.USER_CREATED_SUCCESS,
        data: result,
      });
    } catch (error) {
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error,
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
        error,
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
          data: {},
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
        error,
      });
    }
  },

  removeAttachments: async (req, res) => {
    try {
      const result = AttachmentsModel.findOne({ _id: req.params?.id });

      if (!result) {
        return res.status(HTTP_CODES.NOT_FOUND).json({
          success: false,
          message: messages.ATTACHMENT_NOT_FOUND,
          data: {},
        });
      }
      console.log(req.params.id);
      await AttachmentsModel.deleteOne({ _id: req.params.id });
      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.ATTACHMENT_REMOVED_SUCCESS,
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
        .select('_id first_name last_name email profile_pic status')
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: 'Users fetched successfully',
        data: users,
      });
    } catch (error) {
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error,
      });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await UserModel.findOne({
        email,
        is_deleted: false,
        is_active: true,
      });

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

      const token = jwt.sign({ email, _id: user._id, role: user.role }, JWT_SECRET, {
        expiresIn: '2d',
      });

      if (req.userAgentInfo) {
        const payload = {
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
            type: req.userAgentInfo.os?.type,
          },
          device: {
            type: req.userAgentInfo.device?.type,
            isBot: Boolean(req.userAgentInfo.device?.isBot),
          },
          source: req.userAgentInfo.source,
          last_login: new Date(),
          is_current: true,
        };

        await UserAgentModel.create(payload);
      }

      return res.status(HTTP_CODES.CREATED).json({
        success: true,
        message: messages.USER_LOGIN_SUCCESS,
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(HTTP_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: messages.INTERNAL_SERVER_ERROR,
        error,
      });
    }
  },
};
