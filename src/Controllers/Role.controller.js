const { RoleModel } = require('../Models');
const messages = require('../Constants/messages');
const { HTTP_CODES } = require('../Constants/enums');

module.exports = {
  addRole: async (req, res) => {
    try {
      const result = await RoleModel.create(req.body);
      return res.status(HTTP_CODES.CREATED).json({
        success: true,
        message: messages.ROLE_CREATED_SUCCESS,
        data: result,
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

  removeRole: async (req, res) => {
    try {
      const result = await RoleModel.findOneAndDelete({ role: req.body.role }, { new: true });
      return res.status(HTTP_CODES.OK).json({
        success: true,
        message: messages.ROLE_DELETED_SUCCESS,
        data: result,
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
