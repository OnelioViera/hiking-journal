'use client';

import Link from 'next/link';
import { useAuth, SignInButton, SignOutButton, UserButton } from '@clerk/nextjs';
import { Mountain, Menu, X, Home, Settings } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { isSignedIn, isLoaded } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Mountain className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">Hiking Journal</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {isLoaded && isSignedIn && (
              <>
                <Link 
                  href="/" 
                  className="text-gray-600 hover:text-green-600 transition-colors nav-item"
                  style={{ fontWeight: 500 }}
                >
                  <Home className="h-4 w-4 inline mr-1" />
                  Home
                </Link>
                <Link 
                  href="/entries" 
                  className="text-gray-600 hover:text-green-600 transition-colors nav-item"
                  style={{ fontWeight: 500 }}
                >
                  Journal
                </Link>
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-green-600 transition-colors nav-item"
                  style={{ fontWeight: 500 }}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/entries/new" 
                  className="text-gray-600 hover:text-green-600 transition-colors nav-item"
                  style={{ fontWeight: 500 }}
                >
                  New Entry
                </Link>
                <Link 
                  href="/settings" 
                  className="text-gray-600 hover:text-green-600 transition-colors nav-item"
                  style={{ fontWeight: 500 }}
                >
                  <Settings className="h-4 w-4 inline mr-1" />
                  Settings
                </Link>
              </>
            )}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoaded ? (
              <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
            ) : isSignedIn ? (
              <div className="flex items-center space-x-4">
                <UserButton />
                <SignOutButton>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors btn-text">
                    Sign Out
                  </button>
                </SignOutButton>
              </div>
            ) : (
              <SignInButton>
                <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors btn-text">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              {isLoaded && isSignedIn && (
                <>
                  <Link 
                    href="/" 
                    className="text-gray-600 hover:text-green-600 transition-colors nav-item"
                    style={{ fontWeight: 500 }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Home className="h-4 w-4 inline mr-1" />
                    Home
                  </Link>
                  <Link 
                    href="/entries" 
                    className="text-gray-600 hover:text-green-600 transition-colors nav-item"
                    style={{ fontWeight: 500 }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Journal
                  </Link>
                  <Link 
                    href="/dashboard" 
                    className="text-gray-600 hover:text-green-600 transition-colors nav-item"
                    style={{ fontWeight: 500 }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/entries/new" 
                    className="text-gray-600 hover:text-green-600 transition-colors nav-item"
                    style={{ fontWeight: 500 }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    New Entry
                  </Link>
                  <Link 
                    href="/settings" 
                    className="text-gray-600 hover:text-green-600 transition-colors nav-item"
                    style={{ fontWeight: 500 }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="h-4 w-4 inline mr-1" />
                    Settings
                  </Link>
                </>
              )}
              
              {isSignedIn ? (
                <div className="pt-4 border-t">
                  <UserButton />
                  <SignOutButton>
                    <button
                      onClick={() => setIsMenuOpen(false)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors w-full btn-text mt-2"
                    >
                      Sign Out
                    </button>
                  </SignOutButton>
                </div>
              ) : (
                <SignInButton>
                  <button
                    onClick={() => setIsMenuOpen(false)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors w-full btn-text"
                  >
                    Sign In
                  </button>
                </SignInButton>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 