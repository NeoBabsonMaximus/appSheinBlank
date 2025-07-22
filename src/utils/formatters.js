// Utility Functions for Data Formatting
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  let cleaned = ('' + phoneNumber).replace(/\D/g, '');

  // Remove common Mexican prefixes
  if (cleaned.startsWith('044') || cleaned.startsWith('045')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('01')) {
    cleaned = cleaned.substring(2);
  }

  // If already has country code, remove it to keep only 10 digits
  if (cleaned.startsWith('52') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }

  // Return only the 10-digit number
  return cleaned;
};

export const generateUniqueToken = () => {
  return crypto.randomUUID();
};
