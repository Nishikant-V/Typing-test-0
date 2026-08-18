import React from 'react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header" role="banner">
      <div className="header__inner">
        <a href="/" className="header__brand" aria-label="TypeSpeed — home">
          <span className="header__wordmark">TypeSpeed</span>
          <span className="header__tag">v1.0</span>
        </a>
      </div>
    </header>
  );
};

export default Header;
