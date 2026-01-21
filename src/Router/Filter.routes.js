const express = require('express');
const auth = require('../Middlewares/Auth.middleware');
const { ROLE } = require('../Constants/enums');
const router = express.Router();
const { FilterController } = require('../Controllers');

router.post('/',
    auth({
        iisTokenRequired: true,
        usersAllowed: [ROLE.USER]
    }),
    FilterController.createFilter
)

router.post('/apply',
    auth({
        isTokenRequired: true,
        usersAllowed: [ROLE.USER, ROLE.ADMIN, ROLE.SUPER_ADMIN]
    }),
    FilterController.filterData
)

module.exports = router;
