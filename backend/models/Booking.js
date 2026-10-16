// Booking model: one customer appointment. Linked to the customer by email.
// referenceCode is unique (LSC-######); status follows the workflow in routes/bookings.js.
const { Schema, model } = require('mongoose');
const toJSON = require('./toJSON');

const bookingSchema = new Schema(
  {
    referenceCode: { type: String, required: true, unique: true }, // e.g. LSC-284917
    customerEmail: { type: String, required: true, lowercase: true },
    customerName: String,
    vehicle: { type: String, enum: ['Sedan', 'SUV', 'Motorcycle'] },
    baseService: String,
    additionalServices: [String],
    services: [String], // base service + add-ons; built by the server from pricing.js
    date: String, // YYYY-MM-DD
    timeSlot: String, // e.g. "10:00 AM"
    payment: { type: String, enum: ['GCash', 'Maya', 'Cash'] },
    totalEstimate: Number,
    status: {
      type: String,
      enum: ['pending', 'progress', 'ready', 'done', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);
bookingSchema.index({ customerEmail: 1 });
bookingSchema.index({ date: 1 });
toJSON(bookingSchema);
module.exports = model('Booking', bookingSchema);
