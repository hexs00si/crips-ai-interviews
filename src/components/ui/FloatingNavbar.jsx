import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import useAuth from '@/features/auth/hooks/useAuth';
import { UserMenu } from './UserMenu';
import { MobileMenu } from './MobileMenu';
import { navItems } from '@/data/navigation';

export function FloatingNavbar({ className }) {
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY);

      if (scrollDifference > 10) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setVisible(false);
        } else {
          setVisible(true);
        }
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on escape key & handle body scroll
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const isActiveRoute = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: 'easeInOut'
            }}
            className={cn(
              'fixed top-4 inset-x-0 w-full max-w-4xl mx-auto z-50',
              className
            )}
          >
            {/* Main Nav Container - Remove overflow constraints from here */}
            <nav className="relative bg-white/80 backdrop-blur-md border border-white/20 rounded-lg shadow-lg">
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center justify-between relative px-8 py-3">
                {/* Left Section: Logo */}
                <div className="flex-1 flex justify-start">
                  <Link
                    to="/"
                    className="text-xl font-black text-gray-900 hover:text-primary-600 transition-colors"
                  >
                    Crisp
                  </Link>
                </div>

                {/* Center Section: Navigation Items */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="flex items-center space-x-8">
                    {navItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.link}
                        className={cn(
                          'relative px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap',
                          isActiveRoute(item.link)
                           ? 'text-primary-600'
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                        )}
                      >
                        {item.name}
                        {isActiveRoute(item.link) && (
                          <motion.div
                            layoutId="navbar-indicator"
                            className="absolute inset-0 bg-primary-100 rounded-md -z-10"
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Right Section: Auth - This is where UserMenu lives */}
                <div className="flex-1 flex justify-end">
                  {isLoading ? (
                    <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  ) : isAuthenticated ? (
                    <UserMenu />
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLoginClick}
                      className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Login
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Mobile Navigation */}
              <div className="md:hidden flex items-center justify-between px-4 py-3">
                {/* Left: Mobile Menu Button */}
                <div className="flex justify-start">
                    <button
                      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                      className="p-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors"
                      aria-label="Toggle mobile menu"
                    >
                      {isMobileMenuOpen ? (
                        <X className="h-5 w-5" />
                      ) : (
                        <Menu className="h-5 w-5" />
                      )}
                    </button>
                </div>

                {/* Center: Logo/Brand */}
                <div className="flex justify-center">
                    <Link
                      to="/"
                      className="text-lg font-black text-gray-900"
                    >
                      Crisp
                    </Link>
                </div>

                {/* Right: Placeholder for spacing */}
                <div className="flex justify-end">
                    <div className="w-9 h-9" />
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navItems={navItems}
        isActiveRoute={isActiveRoute}
      />
    </>
  );
}