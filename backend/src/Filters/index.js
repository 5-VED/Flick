const Engine = require('./FilterEngine');
const unreadFilter = require('./System/unread.filter');




module.exports = {
    Engine,
    SystemFilters: {
        [unreadFilter.key]: unreadFilter
    }
};
