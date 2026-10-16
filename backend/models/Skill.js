const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'General',
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    degree: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Drop legacy single-field unique index on name if it exists to allow department-specific skills
mongoose.connection.on('open', async () => {
  try {
    const collection = mongoose.connection.collection('skills');
    const indexes = await collection.indexes();
    const hasLegacyNameIndex = indexes.some((idx) => idx.name === 'name_1');
    if (hasLegacyNameIndex) {
      await collection.dropIndex('name_1');
      console.log('[Skill Model] Dropped legacy unique index name_1');
    }
  } catch (err) {
    // Ignore error if index doesn't exist
  }
});

module.exports = mongoose.model('Skill', skillSchema);
