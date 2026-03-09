module.exports = {
  apps: [
    {
      name: 'pj-air-backend',
      cwd: './backend',
      script: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        DATABASE_PATH: '../database.sqlite',
        FRONTEND_URL: 'http://203.161.50.109'
      }
    },
    {
      name: 'pj-air-frontend',
      cwd: './frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_API_URL: 'http://203.161.50.109:3001'
      }
    }
  ]
};
