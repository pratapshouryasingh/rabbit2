import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-t text-center py-3 text-sm text-gray-500">
      © {new Date().getFullYear()} RabbitWellness. All rights reserved.
    </footer>
  );
}
// This footer component provides a simple copyright notice with the current year.