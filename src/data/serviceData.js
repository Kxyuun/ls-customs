// Base/starting prices for each service. This is the single source of
// truth for pricing across the whole app: the Home page's "Starting From"
// prices and the Booking page's base prices both read from here, so they
// can never drift out of sync. Additional services picked in Booking add
// on top of a chosen base price — see serviceOptions below.
export var serviceDetails = {
  'auto-care': {
    kicker: 'Routine Maintenance',
    title: 'Auto Care',
    price: 3500,
    items: [
      'Engine oil and filter change',
      'Tire rotation and pressure check',
      'Brake fluid, coolant, and transmission fluid top-up',
      'Battery health check',
      'Multi-point visual inspection'
    ]
  },
  'core-fix': {
    kicker: 'Damage Repairs',
    title: 'Core Fix',
    price: 4000,
    items: [
      'Engine diagnostics and repair',
      'Transmission repair or replacement',
      'Brake system repair (pads, rotors, lines)',
      'Electrical system troubleshooting and fixes',
      'Follow-up test drive after repair'
    ]
  },
  'vehicle-mod': {
    kicker: 'Modifications',
    title: 'Vehicle Mod',
    price: 23000,
    items: [
      'Custom paint jobs and wraps',
      'Body kit installation',
      'Engine performance upgrades',
      'Suspension and exhaust modifications',
      'Consultation on parts compatibility before work starts'
    ]
  },
  'body-work': {
    kicker: 'Structure Repair',
    title: 'Body Work',
    price: 25000,
    items: [
      'Dent and scratch removal',
      'Panel replacement after collision',
      'Frame straightening',
      'Rust treatment and repainting',
      'Photo documentation before and after'
    ]
  },
  'consultation': {
    kicker: 'Not Sure What You Need?',
    title: 'Consultation',
    price: 0,
    items: [
      'A technician inspects your vehicle in person',
      "We walk you through what's actually wrong",
      'You get an honest recommendation, no pressure to upsell',
      'Free — you only pay if you decide to book a service after'
    ]
  }
};

// Flat list built from serviceDetails above, in the shape the Booking page
// needs (a value label + price + the matching detail key for the "What's
// Included" modal). Home.js reads serviceDetails[key].price directly for
// its "Starting From" prices, so both pages always show the same numbers.
export var serviceOptions = [
  { value: 'Auto Care', price: serviceDetails['auto-care'].price, detail: 'auto-care' },
  { value: 'Core Fix', price: serviceDetails['core-fix'].price, detail: 'core-fix' },
  { value: 'Vehicle Mod', price: serviceDetails['vehicle-mod'].price, detail: 'vehicle-mod' },
  { value: 'Body Work', price: serviceDetails['body-work'].price, detail: 'body-work' },
  { value: 'Not Sure? Get a Consultation', price: serviceDetails['consultation'].price, detail: 'consultation' }
];

export default serviceDetails;
