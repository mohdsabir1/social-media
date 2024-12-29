'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-semibold text-indigo-600">
           <Image 
             src="/full_logo.png" 
             alt="Logo" 
             width={100} 
             height={40} 
             priority
             style={{ width: 'auto', height: 'auto' }}
           />
          </Link>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="relative w-8 h-8">
                <Image
                  src={user?.profilePicture || '/default-avatar.png'}
                  alt={user?.fullName || 'User'}
                  fill
                  sizes="(max-width: 768px) 32px, 32px"
                  className="rounded-full object-cover"
                />
              </div>
              <svg className="w-4 h-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={async () => {
                    setIsOpen(false);
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/login';
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
