import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { FaHome, FaUtensils, FaUser, FaSignInAlt, FaSignOutAlt, FaCog, FaBars, FaTimes } from 'react-icons/fa';
import '../../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Gestione dello scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Chiudi i menu quando si cambia pagina
  useEffect(() => {
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [location]);

  // Chiudi i menu quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo e Brand */}
        <Link to="/" className="nav-brand">
          <img src="/logo.png" alt="TableTalk Logo" className="nav-logo" />
          <span>TableTalk</span>
        </Link>

        {/* Menu Desktop */}
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
              <FaHome /> Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/meals" className={`nav-link ${location.pathname === '/meals' ? 'active' : ''}`}>
              <FaUtensils /> Pasti
            </Link>
          </li>

          {user ? (
            <li className="nav-item user-menu">
              <button className="user-menu-button" onClick={toggleUserMenu}>
                <FaUser /> {user.username}
              </button>
              <div className={`user-menu-dropdown ${isUserMenuOpen ? 'active' : ''}`}>
                <Link to="/profile" className="user-menu-item">
                  <FaUser /> Profilo
                </Link>
                <Link to="/settings" className="user-menu-item">
                  <FaCog /> Impostazioni
                </Link>
                <button onClick={handleLogout} className="user-menu-item">
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </li>
          ) : (
            <li className="nav-item">
              <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>
                <FaSignInAlt /> Login
              </Link>
            </li>
          )}
        </ul>

        {/* Menu Mobile Button */}
        <button className="mobile-menu-button" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Menu Mobile */}
        <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <div className="mobile-menu-header">
            <Link to="/" className="nav-brand" onClick={toggleMobileMenu}>
              <img src="/logo.png" alt="TableTalk Logo" className="nav-logo" />
              <span>TableTalk</span>
            </Link>
            <button className="mobile-menu-close" onClick={toggleMobileMenu}>
              <FaTimes />
            </button>
          </div>

          <div className="mobile-menu-items">
            <Link to="/" className="mobile-menu-item" onClick={toggleMobileMenu}>
              <FaHome /> Home
            </Link>
            <Link to="/meals" className="mobile-menu-item" onClick={toggleMobileMenu}>
              <FaUtensils /> Pasti
            </Link>

            {user ? (
              <>
                <Link to="/profile" className="mobile-menu-item" onClick={toggleMobileMenu}>
                  <FaUser /> Profilo
                </Link>
                <Link to="/settings" className="mobile-menu-item" onClick={toggleMobileMenu}>
                  <FaCog /> Impostazioni
                </Link>
                <button onClick={() => { handleLogout(); toggleMobileMenu(); }} className="mobile-menu-item">
                  <FaSignOutAlt /> Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="mobile-menu-item" onClick={toggleMobileMenu}>
                <FaSignInAlt /> Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 