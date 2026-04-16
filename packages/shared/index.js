// @autocare/shared — barrel export

// Validation
export {
  monthLabels,
  normalizeEmail,
  normalizePhoneNumber,
  buildUsername,
  formatDate,
  formatMonthYear,
  cloneDate,
  calculateAge,
  getPasswordChecks,
  isPasswordValid,
  validateEmail,
  validatePhoneNumber,
  validateBirthday,
  validatePassword,
  validateLoginForm,
} from './utils/validation.js';

// Theme / Colors
export { brand, semantic, light, dark, radius } from './theme/colors.js';

// Decision Support
export {
  getMaintenanceAlerts,
  getRecommendation,
  getVehicleSummary,
} from './services/decisionSupport.js';

// API Client
export { auth, setBaseUrl } from './services/api.js';

// Mock Data
export {
  vehicles,
  appointments,
  timelineEvents,
  jobOrders,
  servicesCatalog,
  loyaltyAccounts,
  shopProducts,
  SHOPS,
  TECHNICIANS,
  rewardCatalog,
  redemptionLog,
  salesInvoices,
  monthlyRevenue,
  bookingVolume,
  peakHourData,
} from './services/mockData.js';
