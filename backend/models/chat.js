const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: String,
    required: true
  }],
  type: {
    type: String,
    enum: ['private', 'group', 'channel'],
    default: 'private'
  },
  name: String,
  avatar: String,
  lastMessage: {
    content: String,
    senderId: String,
    createdAt: Date
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

chatSchema.index({ participants: 1 });
chatSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
