# Pokemon Battle Simulator

## Overview

A web-based Pokemon battle simulator that allows players to enter a Pokemon name and engage in turn-based battles against computer-controlled opponents. The application fetches Pokemon data from external APIs and provides an interactive battle experience with visual feedback and battle logging.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Single Page Application (SPA)**: Uses vanilla JavaScript with DOM manipulation for dynamic content updates
- **CSS Framework**: Bootstrap 5 for responsive design and UI components
- **State Management**: JavaScript class-based architecture (`PokemonBattleGame`) manages game state including battle phases (setup, battle, finished)
- **Event-Driven Design**: User interactions handled through event listeners for input fields, buttons, and keyboard events

### Backend Architecture
- **Web Framework**: Flask (Python) serving as a lightweight web server
- **Template Engine**: Jinja2 templates for HTML rendering
- **Session Management**: Flask sessions with configurable secret key from environment variables
- **Static File Serving**: Flask's built-in static file handling for CSS, JavaScript, and assets

### Game Logic Design
- **Turn-Based Battle System**: Alternating player and computer turns with state tracking
- **Random Computer Opponent**: Predefined list of 25 Pokemon for computer selection
- **Battle Phases**: Three distinct game states (setup, battle, finished) with UI transitions
- **Battle Logging**: Event tracking system for battle history and user feedback

### Data Management
- **External API Integration**: Designed to fetch Pokemon data from external sources (likely PokeAPI)
- **Client-Side Data Handling**: Pokemon stats and battle information managed in browser memory
- **No Persistent Storage**: Stateless application with session-based temporary data only

## External Dependencies

### Frontend Dependencies
- **Bootstrap 5.3.0**: UI framework for responsive design and components
- **Font Awesome 6.4.0**: Icon library for visual elements and battle interface
- **External Pokemon API**: Integration planned for fetching Pokemon data, stats, and sprites

### Backend Dependencies
- **Flask**: Python web framework for server-side functionality
- **Python Standard Library**: Built-in modules for logging, environment variables, and OS operations

### Development Environment
- **Python Runtime**: Server-side execution environment
- **Static Asset Serving**: CSS and JavaScript files served through Flask's static file handler
- **Environment Configuration**: Configurable session secrets and debug settings