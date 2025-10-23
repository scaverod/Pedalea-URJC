# Project: URJC pedalea

## Project Overview
`URJC pedalea` is a responsive web application designed to promote bicycle usage within the Universidad Rey Juan Carlos (URJC) community. It enables users to create, share, and discover cycling routes, manage suggestions and critical points, rate routes, and participate in a gamification system.

**Key Technologies:**
*   **Backend:** Node.js with Express.js
*   **Database:** SQLite (initial)
*   **Frontend:** HTML5, CSS, JavaScript
*   **Mapping:** OpenStreetMap with an open-source routing engine (e.g., OSRM/GraphHopper/Valhalla)

## Building and Running

### Installation
To install the project dependencies, navigate to the project root directory and run:
```bash
npm install
```

### Running the Application
*   **Production Mode:**
    ```bash
    npm start
    ```
*   **Development Mode (with nodemon for auto-restarts):**
    ```bash
    npm run dev
    ```

### Running Tests
To execute the test suite using Jest, run:
```bash
npm test
```

## Development Conventions

*   **Backend Framework:** Node.js with Express.js is used for the server-side logic.
*   **Database:** SQLite is the initial database choice.
*   **Frontend:** The application is a responsive web application built with HTML5, CSS, and JavaScript.
*   **Styling:** Adheres to URJC's corporate visual identity, including specific color palettes and typography.
*   **Internationalization:** The application supports both Spanish (ES) and English (EN).
*   **Testing:** Jest is used for running unit and integration tests.
