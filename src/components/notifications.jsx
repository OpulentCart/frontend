import React from "react";

const NotificationIcon = ({ count }) => {
  return (
    <div className="relative">
      <span className="text-2xl">🔔</span>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
};

export default NotificationIcon;
