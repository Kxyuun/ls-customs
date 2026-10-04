// Booking-flow content that isn't a service or a price (those live in
// serviceData.js). Kept in one place so Home and Book can't drift apart.
export var vehicleOptions = [
  { value: 'Sedan', sub: 'Compact / Midsize' },
  { value: 'SUV', sub: 'Crossover / Pickup' },
  { value: 'Motorcycle', sub: 'All sizes' }
];

export var payOptions = ['GCash', 'Maya', 'Cash'];

// Existing requirements never make vehicle type change a price (totals are
// service base price + add-ons only), so the copy says so instead of implying
// the job is priced per vehicle.
export var vehicleStepSub = "Tell us if it's a sedan, SUV, or motorcycle so we know what's rolling in. Vehicle type doesn't change the starting prices shown.";

export var pricingNote = 'Prices shown are starting prices. The final amount is on your invoice before work begins.';
