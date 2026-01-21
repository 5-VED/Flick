const { UserModel } = require('../Models');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../Config/config');

const auth = ({ isTokenRequired = true, usersAllowed = [] }) => {
  return async (req, res, next) => {
    try {
      const token = (req.header('x-auth-token') || req.header('Authorization'))?.replace(
        /Bearer +/g,
        ''
      );

      if (isTokenRequired && !token) {
        return res.status(400).json({
          success: false,
          message: 'Access Restricted',
          data: {},
        });
      }

      if (!isTokenRequired && !token) return next();

      let decoded = jwt.verify(token, JWT_SECRET);

      if (!decoded._id) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized',
          data: {},
        });
      }

      const user = await UserModel.findOne({
        _id: decoded._id,
        is_active: true,
      }).populate('role');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid Token',
          data: {},
        });
      }

      req.user = {
        ...decoded,
        // ...user,
        // id: (user?._id),
        role: user?.role?.role,
        email: user?.email,
      };

      if (req?.user?.role === 'Admin' || usersAllowed.includes('*')) {
        return next();
      }

      if (usersAllowed.includes(req?.user?.role)) return next();

      return res.status(401).json({
        success: false,
        message: 'Invalid Token',
        data: {},
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        data: error,
      });
    }
  };
};

module.exports = auth;
