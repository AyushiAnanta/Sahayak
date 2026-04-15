import React, { useEffect, useState } from "react";
import { getAdminNotifications } from "../../api/admin";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await getAdminNotifications();
      setNotifications(res.data.data);
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#1f1f23] text-white p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>

      <div className="space-y-4">
        {notifications.map((n) => (
          <div key={n._id} className="bg-[#2a2a2f] p-5 rounded-xl">
            <p>{n.message}</p>
            <p className="text-sm text-gray-400 mt-1">
              {n.notification_type}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}