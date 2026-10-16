// Server-side price table. The server computes every booking total itself and
// never trusts a total sent by the browser.
// KEEP IN SYNC with src/data/serviceData.js in the frontend (same names/prices).
// Names are the booking labels ("Auto Care", ...). A number = flat price;
// an object = price per vehicle type.
const SERVICE_PRICES = {
  'Auto Care': 3500,
  'Core Fix': 4000,
  'Vehicle Mod': 23000,
  'Body Work': 25000,
  // PLACEHOLDER prices - the owner must confirm these.
  'Car Wash': { Sedan: 350, SUV: 500, Motorcycle: 200 },
  'Not Sure? Get a Consultation': 0,
};
const CONSULTATION = 'Not Sure? Get a Consultation';

function priceOf(service, vehicle) {
  const p = SERVICE_PRICES[service];
  if (p === undefined) return null;
  return typeof p === 'number' ? p : (p[vehicle] !== undefined ? p[vehicle] : null);
}

// Returns { services, total } or { error }.
function priceBooking(vehicle, baseService, additional) {
  const extras = Array.isArray(additional) ? additional.map(String) : [];
  if (priceOf(baseService, vehicle) === null) return { error: 'Unknown service' };
  if (baseService === CONSULTATION && extras.length) return { error: 'Consultation cannot have add-ons' };
  if (new Set(extras).size !== extras.length || extras.includes(baseService)) {
    return { error: 'Duplicate service' };
  }
  const all = [baseService].concat(extras);
  let total = 0;
  for (const s of all) {
    if (s === CONSULTATION && s !== baseService) return { error: 'Consultation cannot be an add-on' };
    const p = priceOf(s, vehicle);
    if (p === null) return { error: 'Unknown service' };
    total += p;
  }
  return { services: all, total };
}

module.exports = { priceBooking, SERVICE_PRICES };
