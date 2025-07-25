// Environment Configuration
export const ENV_CONFIG = {
  // App identifier for Firebase collections structure
  APP_ID: process.env.NODE_ENV === 'production' ? 'shein-blank-prod' : 'dev-local-app-id',
  
  // Admin user ID (should be the same for both environments)
  ADMIN_USER_ID: 'zpVKGnsFlGM3scVLT6GTSVQGjTr2',
  
  // Environment info
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  // Firebase collections structure
  getCollectionPath: (userId, collection, isPublic = false) => {
    const appId = ENV_CONFIG.APP_ID;
    if (isPublic) {
      return `artifacts/${appId}/public/data/${collection}`;
    }
    return `artifacts/${appId}/users/${userId}/${collection}`;
  }
};

export default ENV_CONFIG;
