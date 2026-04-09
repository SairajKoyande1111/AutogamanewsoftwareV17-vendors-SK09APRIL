module.exports = {
  apps: [{
    name: 'autogarage-crmnew',
    script: 'dist/index.cjs',
    env: {
      NODE_ENV: 'production',
      PORT: 3004,
      MONGODB_URI: 'mongodb://localhost:27017/autogarage_crm_new'
    }
  }]
};