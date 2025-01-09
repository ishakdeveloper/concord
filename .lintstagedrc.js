module.exports = {
  '*.{js,jsx,ts,tsx}': 'eslint --fix',
  '*.{js,jsx,ts,tsx,json,md,yml,yaml}': 'prettier --write',
  '*.{ex,exs}': 'mix format',
};
