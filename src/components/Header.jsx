import React from 'react';

export default function Header() {
  return (
    <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-blue-600 text-2xl"></span>
        <h1 className="text-xl font-bold text-blue-700">RabbitWellness</h1>
      </div>
      <div className="text-green-600 font-medium text-sm">✅ Online & Ready</div>
    </header>
  );
}
