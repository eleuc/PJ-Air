module.exports = {
  apps: [
    {
      name: 'pj-air-backend-staging',
      cwd: './backend',
      script: 'dist/src/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3101,
        DATABASE_PATH: '../database-staging.sqlite',
        FRONTEND_URL: 'https://staging.jhoanes.com'
      }
    },
    {
      name: 'pj-air-frontend-staging',
      cwd: './frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3100,
        NEXT_PUBLIC_API_URL: 'https://staging.jhoanes.com/api'
      }
    }
  ]
};