// Utility Functions for Data Formatting
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  let cleaned = ('' + phoneNumber).replace(/\D/g, '');

  if (cleaned.startsWith('044') || cleaned.startsWith('045')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('01')) {
    cleaned = cleaned.substring(2);
  }

  if (cleaned.startsWith('52')) {
    return '+' + cleaned;
  }

  if (cleaned.length === 10) {
    return '+' + cleaned;
  }

  return cleaned;
};

export const generateUniqueToken = () => {
  return crypto.randomUUID();
};
