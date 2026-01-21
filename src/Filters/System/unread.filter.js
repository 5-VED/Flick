const enums = require("../../Constants/enums");

module.exports = {
    key: 'unread',
    name: 'Unread',
    entity: 'conversation',
    system: true,
    defination: () => ({
        name: "Unread",
        entity: "conversation",
        fields: [{
            field: "total_unread_messages",
            operator: enums.OPERATORS.gt,
            value: "0"
        }],
        logic: enums.LOGIC.AND
    })
}