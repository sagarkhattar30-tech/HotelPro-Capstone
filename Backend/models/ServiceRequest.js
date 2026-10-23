const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema({
  guestName: { type: String, required: true },
  guestEmail: { type: String, required: true },
  roomNumber: { type: String, required: true },
  serviceType: {
    type: String,
    enum: ['Housekeeping', 'Room Service Food', 'Maintenance', 'Luggage Assistance', 'Concierge & Transport', 'Extra Amenities'],
    required: true
  },
  details: { type: String, required: true },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Requested', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Requested'
  },
  assignedStaff: { type: String, default: 'Unassigned' },
  requestedAt: { type: Date, default: Date.now },
  completedAt: { type: Date }
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);
