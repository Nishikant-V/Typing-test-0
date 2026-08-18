# TypeSpeed

A minimal, focused typing speed test built with React, TypeScript, and Vite.

## Stack

- React 19 + TypeScript
- Vite 8
- Plain CSS (no UI framework, no Tailwind)

## Features (so far)

- Random passage selection from a curated set
- Real-time character-by-character comparison (correct / incorrect / current / untyped)
- Backspace support with correct state recalculation
- Test lifecycle: idle → running → finished
- Clean `useReducer`-based typing engine with pure utility functions

## Project structure

```
src/
├── components/    # TypingArea, Header
├── hooks/         # useTyping
├── types/         # CharState, TestState, CharDisplay
├── utils/         # buildDisplay (pure fn)
└── data/          # passages + getRandomPassage
```

## Getting started

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
