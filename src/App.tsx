import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import TypingArea from './components/TypingArea';
import { StatsHistory } from './components/StatsHistory';
import { getResults, clearResults } from './utils';
import type { StoredTestResult } from './types';
import './App.css';

const App: React.FC = () => {
  const [history, setHistory] = useState<StoredTestResult[]>(() => getResults());

  const handleResultSaved = useCallback(() => {
    setHistory(getResults());
  }, []);

  const handleClearHistory = useCallback(() => {
    clearResults();
    setHistory([]);
  }, []);

  return (
    <div className="app">
      <Header />

      <main className="main" id="main-content">
        <div className="container">
          <div className="intro">
            <h1 className="intro__heading">Typing speed test</h1>
            <p className="intro__desc">
              Measure your speed and accuracy. No account required.
            </p>
          </div>

          <TypingArea history={history} onResultSaved={handleResultSaved} />

          <StatsHistory history={history} onClearHistory={handleClearHistory} />
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
