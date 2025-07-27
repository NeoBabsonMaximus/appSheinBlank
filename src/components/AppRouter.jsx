// App Router - Determines which app to show based on environment
import React from 'react';
import { ENV_CONFIG } from '../config/environment';

// Import both apps
import AdminApp from '../views/AdminApp';
import ClienteApp from '../views/ClienteApp';

const AppRouter = () => {
  console.log('🔀 AppRouter - Tipo de app:', ENV_CONFIG.APP_TYPE);
  console.log('🔀 AppRouter - Es admin?:', ENV_CONFIG.IS_ADMIN_APP);
  console.log('🔀 AppRouter - Es cliente?:', ENV_CONFIG.IS_CLIENT_APP);

  if (ENV_CONFIG.IS_CLIENT_APP) {
    return <ClienteApp />;
  }
  
  // Default to admin app
  return <AdminApp />;
};

export default AppRouter;
