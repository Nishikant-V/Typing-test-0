import React from 'react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header" role="banner">
      <div className="header__inner">
        {/* Wordmark — the only element in the header intentionally */}
        <a href="/" className="header__wordmark" aria-label="TypeSpeed — home">
          typespeed
        </a>
      </div>
    </header>
  );
};

export default Header;
