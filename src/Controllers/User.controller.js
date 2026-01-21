const { UserModel, AttachmentsModel, UserAgentModel, RoleModel } = require('../Models');
const { compare } = require('bcrypt');
const { JWT_SECRET } = require('../Config/config');
const jwt = require('jsonwebtoken');
const messages = require('../Constants/messages');
const { HTTP_CODES } = require('../Constants/enums');

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
      const attachments = req.files;

      if (!attachments || !Array.isArray(attachments)) {
        return res.status(HTTP_CODES.BAD_REQUEST).json({
          success: false,
          message: messages.EXTENSION_NOT_FOUND,
          data: {},
        });
      }

      attachments.forEach(async element => {
        let payload = {};
        payload['file_name'] = element?.originalname;
        payload['file_type'] = element?.mimetype;
        payload['file_size'] = Number(element?.size) / 1024 + ' Kb';
        payload['file_url'] = element?.path;
        payload['uploaded_at'] = element?.uploaded_at;
        await AttachmentsModel.create(payload);
      });

      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.ATTACHMENTS_ADDED_SUCCESS,
        data: {},
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
