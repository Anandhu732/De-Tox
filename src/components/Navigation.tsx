import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Target, Trophy, Info, Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home', color: 'text-pink-400' },
    { path: '/game', icon: Target, label: 'Play Game', color: 'text-green-400' },
    { path: '/leaderboard', icon: Trophy, label: 'Scores', color: 'text-yellow-400' },
    { path: '/about', icon: Info, label: 'About', color: 'text-blue-400' },
  ];

  return (
    <nav className="bg-gradient-to-r from-purple-900 via-pink-900 to-red-900 border-b-4 border-yellow-400 relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 transform hover:scale-110 transition-transform"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-red-500 rounded-lg animate-spin">
              <Target className="w-6 h-6 text-white m-1" />
            </div>
            <span className="text-white font-black text-lg sm:text-xl transform rotate-1 hidden sm:block">
              Focus? Never!
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-lg text-sm font-bold transform transition-all duration-200 hover:scale-105 hover:rotate-1 ${
                      isActive
                        ? 'bg-white text-purple-900 shadow-lg'
                        : `text-white hover:bg-white hover:bg-opacity-20 ${item.color} hover:shadow-md`
                    }`}
                  >
                    <Icon className="inline w-4 h-4 mr-1" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:text-yellow-400 transform hover:scale-110 transition-all"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-black bg-opacity-90 border-t-2 border-yellow-400">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-base font-bold transform transition-all ${
                    isActive
                      ? 'bg-white text-purple-900 animate-pulse'
                      : `text-white hover:bg-white hover:bg-opacity-20 ${item.color}`
                  }`}
                >
                  <Icon className="inline w-5 h-5 mr-2" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;