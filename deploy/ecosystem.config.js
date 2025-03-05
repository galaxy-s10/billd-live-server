module.exports = {
  apps: [
    {
      name: 'billd-live-server',
      exec_mode: 'fork',
      instances: '1',
      script: './dist/index.js',
      watch: false,
      env: {
        NODE_APP_RELEASE_PROJECT_NAME: 'billd-live-serve',
        NODE_APP_RELEASE_PROJECT_ENV: 'prod',
        NODE_APP_RELEASE_PROJECT_PORT: '4200',
      },
    },
  ],
};
