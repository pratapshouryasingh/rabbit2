import React from 'react';
import ChatBot from './components/ChatBot';
import Header from './components/Header';
import Footer from './components/Footer';


export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex flex-1 px-6 py-4 gap-6">
        {/* ChatBot Section */}
        <div className="flex-1">
          <ChatBot />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
