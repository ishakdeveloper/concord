export const generateNormalizedUsername = (
  displayName: string
): {
  normalizedName: string;
  displayName: string;
} => {
  // Keep original display name
  const cleanDisplayName = displayName.trim();

  // Create normalized username:
  // 1. Convert to lowercase
  // 2. Remove special characters and spaces
  // 3. Limit to alphanumeric
  const normalizedName = displayName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '');

  // Ensure we have valid values
  if (!normalizedName) {
    throw new Error('Invalid username');
  }

  return {
    normalizedName,
    displayName: cleanDisplayName,
  };
};
