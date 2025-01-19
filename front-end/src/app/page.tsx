'use client';

import dynamic from 'next/dynamic';

const Map = dynamic(
  () => import('@/components/Map'),
  { 
    loading: () => (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <p className="text-lg">Loading map...</p>
      </div>
    ),
    ssr: false 
  }
);

export default function Home() {
  return (
    <div className="fixed inset-0 overflow-hidden">
      <Map />
    </div>
  );
}
