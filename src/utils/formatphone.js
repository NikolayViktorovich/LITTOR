export const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const withoutCountryCode = cleaned.startsWith('7') ? cleaned.slice(1) : cleaned;
  if (withoutCountryCode.length === 0) return '';
  let formatted = '+7';
  if (withoutCountryCode.length > 0) {
    formatted += ' ' + withoutCountryCode.slice(0, 3);
  }
  if (withoutCountryCode.length > 3) {
    formatted += ' ' + withoutCountryCode.slice(3, 6);
  }
  if (withoutCountryCode.length > 6) {
    formatted += ' ' + withoutCountryCode.slice(6, 10);
  }
  return formatted;
};
