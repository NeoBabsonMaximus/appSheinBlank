// Cliente App Component - Standalone client application
import React, { useState } from 'react';
import UserLoginPage from './UserLoginPage';
import UserDashboard from './UserDashboard';

const ClienteApp = () => {
  const [user, setUser] = useState(null);

  const handleLogin = (phoneNumber) => {
    setUser({ phoneNumber });
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <UserLoginPage onLogin={handleLogin} />;
  }

  return (
    <UserDashboard 
      phoneNumber={user.phoneNumber} 
      onLogout={handleLogout} 
    />
  );
};

export default ClienteApp;
