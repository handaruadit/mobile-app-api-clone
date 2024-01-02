module.exports = {
  '*.{ts,tsx}': (filenames) => [
    'npm run lint:fix',
    'npm run prettier:write',
    'git add .',
    'npm run typecheck'
  ]
};
