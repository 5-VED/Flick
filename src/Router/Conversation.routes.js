const { ConversationController } = require('../Controllers');
const auth = require('../Middlewares/Auth.middleware');
const { ROLE } = require('../Constants/enums');

const router = require('express').Router();

router.post(
  '/add-conversation',
  auth({
    isTokenRequired: true,
    usersAllowed: [ROLE.USER, ROLE.ADMIN],
  }),
  ConversationController.addConversation
);

router.get(
  '/get',
  auth({
    isTokenRequired: true,
    usersAllowed: [ROLE.USER],
  }),
  ConversationController.getConversation
);

router.get(
  '/get-all',
  auth({
    isTokenRequired: true,
    usersAllowed: [ROLE.USER],
  }),
  ConversationController.getConversations
);

router.put(
  '/edit',
  auth({
    isTokenRequired: true,
    usersAllowed: [ROLE.USER, ROLE.ADMIN],
  }),
  ConversationController.editConversation
);

router.put(
  '/delete',
  auth({
    isTokenRequired: true,
    usersAllowed: [ROLE.USER, ROLE.ADMIN],
  }),
  ConversationController.deleteConversation
);

module.exports = router;
