// Color map for Presidio entity types — used to render colored pills.
export interface EntityStyle {
  bg: string;
  text: string;
  ring: string;
}

const DEFAULT: EntityStyle = {
  bg: 'bg-zinc-100 dark:bg-zinc-800',
  text: 'text-zinc-700 dark:text-zinc-200',
  ring: 'ring-zinc-300/60 dark:ring-zinc-700/60',
};

const STYLES: Record<string, EntityStyle> = {
  // People & orgs
  PERSON:        { bg: 'bg-blue-100 dark:bg-blue-900/40',     text: 'text-blue-800 dark:text-blue-200',     ring: 'ring-blue-300/60' },
  ORGANIZATION:  { bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-800 dark:text-indigo-200', ring: 'ring-indigo-300/60' },
  NRP:           { bg: 'bg-indigo-100 dark:bg-indigo-900/40', text: 'text-indigo-800 dark:text-indigo-200', ring: 'ring-indigo-300/60' },
  // Contact
  PHONE_NUMBER:  { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-800 dark:text-emerald-200', ring: 'ring-emerald-300/60' },
  EMAIL_ADDRESS: { bg: 'bg-purple-100 dark:bg-purple-900/40',   text: 'text-purple-800 dark:text-purple-200',   ring: 'ring-purple-300/60' },
  URL:           { bg: 'bg-purple-100 dark:bg-purple-900/40',   text: 'text-purple-800 dark:text-purple-200',   ring: 'ring-purple-300/60' },
  IP_ADDRESS:    { bg: 'bg-purple-100 dark:bg-purple-900/40',   text: 'text-purple-800 dark:text-purple-200',   ring: 'ring-purple-300/60' },
  // Locations
  ADDRESS:       { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-800 dark:text-amber-200', ring: 'ring-amber-300/60' },
  LOCATION:      { bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-800 dark:text-amber-200', ring: 'ring-amber-300/60' },
  // Dates
  DATE:          { bg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-800 dark:text-pink-200', ring: 'ring-pink-300/60' },
  DATE_TIME:     { bg: 'bg-pink-100 dark:bg-pink-900/40', text: 'text-pink-800 dark:text-pink-200', ring: 'ring-pink-300/60' },
  // Financial
  CREDIT_CARD:   { bg: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-800 dark:text-rose-200', ring: 'ring-rose-300/60' },
  IBAN_CODE:     { bg: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-800 dark:text-rose-200', ring: 'ring-rose-300/60' },
  US_BANK_NUMBER:{ bg: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-800 dark:text-rose-200', ring: 'ring-rose-300/60' },
  CRYPTO:        { bg: 'bg-rose-100 dark:bg-rose-900/40', text: 'text-rose-800 dark:text-rose-200', ring: 'ring-rose-300/60' },
  // Government / tax IDs
  US_SSN:        { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-200', ring: 'ring-red-300/60' },
  US_ITIN:       { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-200', ring: 'ring-red-300/60' },
  US_PASSPORT:   { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-200', ring: 'ring-red-300/60' },
  US_DRIVER_LICENSE: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-200', ring: 'ring-red-300/60' },
  UK_NHS:        { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-200', ring: 'ring-red-300/60' },
  AU_TFN:        { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-200', ring: 'ring-red-300/60' },
  AU_ABN:        { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-200', ring: 'ring-red-300/60' },
  AU_ACN:        { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-200', ring: 'ring-red-300/60' },
  AU_MEDICARE:   { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-200', ring: 'ring-red-300/60' },
  IN_PAN:        { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-200', ring: 'ring-red-300/60' },
  IN_AADHAAR:    { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-200', ring: 'ring-red-300/60' },
  IN_VEHICLE_REGISTRATION: { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-200', ring: 'ring-red-300/60' },
  IN_VOTER:      { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-200', ring: 'ring-red-300/60' },
  IN_PASSPORT:   { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-200', ring: 'ring-red-300/60' },
  SG_NRIC_FIN:   { bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-800 dark:text-red-200', ring: 'ring-red-300/60' },
  // Medical
  MEDICAL_LICENSE: { bg: 'bg-teal-100 dark:bg-teal-900/40', text: 'text-teal-800 dark:text-teal-200', ring: 'ring-teal-300/60' },
};

export function styleFor(type: string): EntityStyle {
  return STYLES[type] ?? DEFAULT;
}
