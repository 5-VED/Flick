const { ConversationController } = require('../Controllers');
const auth = require('../Middlewares/Auth.middleware');
const { ROLE } = require('../Constants/enums');

const router = require('express').Router();

router.post(
  '/add-conversation',
  auth({
    isTokenRequired: true,
    usersAllowed: [ROLE.USER, ROLE.ADMIN, ROLE.RIDER],
  }),
  ConversationController.addConversation
);

router.get(
  '/direct',
  auth({
    isTokenRequired: true,
    usersAllowed: [ROLE.USER, ROLE.RIDER],
  }),
  ConversationController.getOrCreateDirectConversation
);

router.get(
  '/get',
  auth({
    isTokenRequired: true,
    usersAllowed: [ROLE.USER, ROLE.RIDER],
  }),
  ConversationController.getConversation
);

router.get(
  '/get-all',
  auth({
    isTokenRequired: true,
    usersAllowed: [ROLE.USER, ROLE.RIDER],
  }),
  ConversationController.getConversations
);

router.put(
  '/edit',
  auth({
    isTokenRequired: true,
    usersAllowed: [ROLE.USER, ROLE.ADMIN, ROLE.RIDER],
  }),
  ConversationController.editConversation
);

router.put(
  '/delete',
  auth({
    isTokenRequired: true,
    usersAllowed: [ROLE.USER, ROLE.ADMIN, ROLE.RIDER],
  }),
  ConversationController.deleteConversation
);

module.exports = router;
