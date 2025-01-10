module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation
        'style', // Formatting
        'refactor', // Code restructuring
        'test', // Tests
        'chore', // Maintenance
        'perf', // Performance
        'ci', // CI/CD
        'build', // Build
        'revert', // Revert changes
      ],
    ],
    'type-case': [2, 'always', ['lower-case', 'lowercase']],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
  },
};
