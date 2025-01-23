import React, { useState, useEffect } from 'react';

export default function LoadingScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []); // Only run once on mount

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-stone-900/80 backdrop-blur-sm animate-fade-in z-50">
      <div className="flex flex-col items-center animate-fade-in rounded-[1rem] overflow-hidden">
        <img src="/ugs-logo.png" alt="UGS Logo" className="mb-4 sm:w-1/4 w-1/2 rounded-lg overflow-hidden" />
      
      </div>
    </div>
  );
} 