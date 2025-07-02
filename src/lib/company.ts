
import type { Company } from './types';

// This serves as the initial default profile for first-time users.
// After first use, settings will be loaded from local storage.
export const COMPANY_PROFILE: Company = {
  name: 'Codelits Studio Pvt. Ltd.',
  address: 'Kathmandu, Nepal',
  pan: '123456789',
  footerNote: 'Codelits Studio Pvt. Ltd. is a PAN registered company.',
  logoUrl: 'https://placehold.co/150x50.png',
};
