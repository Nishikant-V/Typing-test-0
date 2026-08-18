# TypeSpeed

A refined, high-performance typing speed test application built with a modern Apple Liquid Glass material design.

## Features

- **Typing Engine**: Real-time character-level feedback, error tracking, and backspace handling.
- **Timer Modes**: 15s, 30s, and 60s test durations using accurate timestamp-based measurement.
- **Live & Post-Test Metrics**: Real-time Net WPM, Raw WPM, Accuracy (%), and character counts.
- **Light & Dark Theme**: Multi-tier Liquid Glass material system with a persistent theme toggle (`localStorage` persistence with `prefers-color-scheme` fallback).
- **Personal Statistics & History**: Persistent local test history (`localStorage`), personal best tracking, and aggregate performance analytics.
- **Widened Ergonomic Layout**: 1600px desktop canvas with protected passage measure (`68ch`) for optimal typing focus.

## Tech Stack

- **Framework & Language**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Styling**: Vanilla CSS (CSS Modules & Custom Properties)

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser.

3. **Build for production**:
   ```bash
   npm run build
   ```
