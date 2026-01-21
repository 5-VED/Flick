const bcrypt = require('bcrypt');

module.exports = {
  applyPreHooks: schema => {
    schema.pre('save', function (next) {
      const user = this;
      if (!user.isModified('password')) return next();
      user.password = bcrypt.hashSync(user.password, 10);
      next();
    });

    schema.pre('save', function () {
      const user = this;
      const confirmationCode = Math.floor(100000 + Math.random() * 900000);
      user.confirmation_code = confirmationCode;
    });

    schema.virtual('full_name').get(function () {
      return `${this.first_name} ${this.last_name}`;
    });
  },

  applyPostHooks: schema => { },

  createIndexes: async (schema, indexes = []) => {
    try {
      if (!Array.isArray(indexes) || indexes.length === 0) {
        console.log('No indexes provided to create');
        return;
      }

      for (const index of indexes) {
        await schema.index(index);
      }

      console.log('Successfully created all indexes');
    } catch (error) {
      console.error('Error creating indexes:', error.message);
      throw error;
    }
  },
};
