// NotificationBadge Component - Badge with counter for navigation
import React from 'react';

const NotificationBadge = ({ count, className = "" }) => {
  if (count === 0) return null;

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <div className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium shadow-sm ${className}`}>
      {displayCount}
    </div>
  );
};

export default NotificationBadge;
