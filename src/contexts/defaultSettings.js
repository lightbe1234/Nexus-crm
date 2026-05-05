export const defaultSettings = {
  company: {
    name: 'Stitch Marketing Agency',
    email: 'hello@stitch.agency',
    phone: '+1 (555) 000-0000',
    address: '123 Creative Suite, Digital Valley, CA',
    website: 'https://stitch.agency',
    taxId: 'TX-99887766'
  },
  system: {
    name: 'Stitch ERP',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    theme: 'light'
  },
  financial: {
    currency: 'USD',
    currencySymbol: '$',
    precision: 2,
    taxRate: 15,
    invoicePrefix: 'INV-'
  },
  notifications: {
    email: true,
    inApp: true,
    taskAlerts: true,
    dueReminders: true
  }
};
