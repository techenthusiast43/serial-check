import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { RegisterPage } from './pages/RegisterPage';
import { VerifyPage } from './pages/VerifyPage';
import { MyProductsPage } from './pages/MyProductsPage';

export type PageId = 'home' | 'register' | 'verify' | 'my-products';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  const [activeSerialForVerify, setActiveSerialForVerify] = useState<string>('');
  
  // Dark mode state with system preference & local storage persistence
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('serialcheck_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('serialcheck_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('serialcheck_theme', 'light');
    }
  }, [isDarkMode]);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleNavigate = (page: PageId, initialSerial?: string) => {
    if (initialSerial) {
      setActiveSerialForVerify(initialSerial);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Navigation */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
        {currentPage === 'register' && <RegisterPage onNavigate={handleNavigate} />}
        {currentPage === 'verify' && (
          <VerifyPage
            initialSerial={activeSerialForVerify}
            onNavigate={handleNavigate}
          />
        )}
        {currentPage === 'my-products' && <MyProductsPage onNavigate={handleNavigate} />}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

