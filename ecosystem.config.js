// ecosystem.config.js

module.exports = {
  apps: [
    {
      name: 'batari-core-api',
      script: 'dist/src/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      dotenv: '.env', // Explicitly load .env file
      env: {
        NODE_ENV: 'production'
      },
      development_env: {
        NODE_ENV: 'development'
      },
      staging_env: {
        NODE_ENV: 'staging'
      }
    }
  ]
};
