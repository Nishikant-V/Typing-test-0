# TypeSpeed

A minimal, focused typing speed test built with React, TypeScript, and Vite.

## Stack

- React 19 + TypeScript
- Vite 8
- Plain CSS (no UI framework, no Tailwind)

## Features

- **Random Passage Selection**: Curated typing passages.
- **Real-Time Character Feedback**: State-based character highlighting (`correct`, `incorrect`, `current`, `untyped`).
- **Timestamp-Based Timer**: Accurate 15s, 30s, and 60s mode options.
- **Live Metrics**: Real-time WPM, Accuracy (%), Correct/Incorrect character counts, and countdown timer.
- **Polished Results Experience**: Dedicated finish view with Net WPM hero, Raw WPM, Accuracy, Correct/Incorrect breakdown, and test time.
- **Keyboard Shortcut**: Press `Enter` (or click `Restart Test`) to immediately generate a new test and focus input.
- **Backspace & Error Handling**: Recalculates state cleanly without artificial error inflation.
- **Test Lifecycle**: `idle` → `running` → `finished`.
- **Clean Architecture**: Custom hooks (`useTyping`), pure utilities (`calculateMetrics`, `buildDisplay`), and explicit TypeScript types.

## Project Structure

```
src/
├── components/    # TypingArea, ResultsDisplay, Header
├── hooks/         # useTyping
├── types/         # CharState, TestState, TestDuration, TypingMetrics
├── utils/         # buildDisplay, calculateMetrics
└── data/          # passages + getRandomPassage
```

## Getting Started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
