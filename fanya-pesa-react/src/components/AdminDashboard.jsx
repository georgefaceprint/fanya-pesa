import React from 'react';

export default function AdminDashboard({ user }) {
    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl p-10">
            <h2 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">Admin Control Center</h2>
            <p className="text-gray-500">System-wide management tools for {user.name}.</p>
        </div>
    );
}
