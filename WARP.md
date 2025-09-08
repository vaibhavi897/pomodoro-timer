# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
This is a vanilla JavaScript Pomodoro timer web application that helps users stay productive using the Pomodoro Technique. The application features a modern glassmorphism design with timer functionality, session tracking, and customizable settings.

## Development Commands

### Running the Application
```bash
# Run with live reload (recommended for development)
npm run dev

# Run simple static server
npm run start

# Or open directly in browser (no server needed)
# Double-click index.html
```

### Installing Dependencies
```bash
npm install
```

Note: This project has minimal dependencies - only development servers for local testing.

## Application Architecture

### Core Structure
The application follows a single-page application (SPA) pattern with vanilla JavaScript:
- **index.html**: Main HTML structure with timer UI and settings panel
- **script.js**: Contains the `PomodoroTimer` class that manages all timer logic
- **styles.css**: CSS with custom properties for theming and glassmorphism design
- **package.json**: Simple configuration with dev server scripts

### Key Components

#### PomodoroTimer Class (`script.js`)
The main application logic is contained in a single ES6 class with these responsibilities:
- **Timer Management**: Start/pause/reset functionality with setInterval-based countdown
- **Mode Switching**: Work (25min), Short Break (5min), Long Break (15min) modes
- **Session Tracking**: Counts completed work sessions and determines break types
- **Progress Visualization**: Updates SVG circular progress ring
- **Settings Persistence**: localStorage for timer durations and session counts
- **Notifications**: Browser notifications and audio alerts
- **Keyboard Shortcuts**: Space (play/pause), R (reset)

#### UI Architecture
- **Circular Progress Ring**: SVG-based with stroke-dasharray animation
- **Mode Selector**: Button group for switching between work/break modes  
- **Settings Panel**: Grid layout with number inputs for duration customization
- **Responsive Design**: CSS Grid and Flexbox with mobile breakpoints

#### State Management
Timer state is managed entirely within the PomodoroTimer class:
- Current mode (work/shortBreak/longBreak)
- Time remaining in seconds
- Running/paused state
- Session completion counter
- Custom duration settings (persisted in localStorage)

#### Color System
Uses CSS custom properties for consistent theming:
- Work mode: `#ff6b6b` (red)
- Short break: `#4ade80` (green) 
- Long break: `#6b8bff` (blue)
- Progress ring color changes based on current mode

## Key Implementation Details

### Timer Logic
- Sessions follow 4:1 ratio - every 4th work session triggers a long break
- Timer continues counting down even when browser tab is not active
- Page title updates with remaining time when running
- Automatic mode switching after session completion

### Persistence
- Timer settings stored in `localStorage` as `pomodoroSettings` JSON
- Session count stored as `pomodoroSessions` string
- Settings auto-save on change, session count saves every 30 seconds and on page unload

### Browser APIs Used
- **Notifications API**: For desktop notifications when tab not active
- **Web Audio API**: Plays embedded notification sound
- **Page Visibility API**: Updates browser title with countdown
- **localStorage**: Persists user settings and session progress

### Styling Architecture
- Uses CSS custom properties for consistent theming
- Glassmorphism design with backdrop-filter effects
- Responsive grid layouts that collapse on mobile
- SVG animations for progress ring with CSS transforms

## File Modification Guidelines

When editing this codebase:
- **script.js**: All timer logic is in the PomodoroTimer class - methods are clearly separated by functionality
- **styles.css**: Uses CSS custom properties at `:root` for easy color/spacing changes
- **index.html**: SVG progress ring requires coordinated changes to both HTML structure and JavaScript calculations if modifying
- Settings changes should update both the UI and localStorage persistence
- Color scheme changes require updates in both CSS custom properties and JavaScript `modeColors` object
