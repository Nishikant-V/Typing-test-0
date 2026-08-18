import React from 'react';
import Header from './components/Header';
import TypingArea from './components/TypingArea';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <Header />

      <main className="main" id="main-content">
        <div className="container">
          {/*
            Brand intro: deliberately compact.
            The h1 is small because the typing area — not this text — is the hero.
            Hierarchy: wordmark (header) → h1 label → TypingArea (visual center).
          */}
          <div className="intro">
            <h1 className="intro__heading">Typing speed test</h1>
            <p className="intro__desc">
              Measure your speed and accuracy. No account required.
            </p>
          </div>

          <TypingArea />
        </div>
      </main>

      <footer className="footer" role="contentinfo">
        <div className="container">
          <p className="footer__text">TypeSpeed &mdash; {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
