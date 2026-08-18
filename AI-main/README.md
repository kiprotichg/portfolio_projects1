# Nexus AI Hackathon Chatbot

A full-stack chatbot application organized with frontend and backend separation.

## Project Structure

```
hackathon chatbot/
├── frontend/                 # Frontend assets
│   └── templates/           # HTML templates
│       └── index.html       # Main application interface
│   └── static/              # Static assets (CSS, JS, images)
└── backend/                 # Backend application
    ├── app.py               # Main Flask application
    ├── routes/              # API route handlers
    │   ├── auth.py          # Authentication routes
    │   ├── chat.py          # Chat functionality
    │   ├── api.py           # Utility API routes
    │   └── conversion.py    # Document conversion routes
    ├── models/              # Database models
    ├── services/            # Business logic services
    ├── requirements.txt     # Python dependencies
    ├── .env                 # Environment variables
    ├── .env.example         # Environment variables template
    └── *.db                 # Database files
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Set up environment variables:
   ```bash
   copy .env.example .env
   # Edit .env with your configuration
   ```

6. Run the application:
   ```bash
   python app.py
   ```

The application will be available at `http://localhost:5000`

### Frontend

The frontend consists of HTML templates served by the Flask application. The main interface is located in `frontend/templates/index.html`.

## API Endpoints

- `/` - Main application interface
- `/api/chat` - Chat functionality
- `/auth/*` - Authentication endpoints
- `/system/*` - System utility endpoints
- `/api/convert/*` - Document conversion endpoints
- `/routes` - List all available routes (debug endpoint)

## Development

The application is organized with clear separation between frontend and backend:

- **Frontend**: Contains only presentation layer (HTML, CSS, JavaScript)
- **Backend**: Contains all server-side logic, APIs, and business logic

This structure allows for easier maintenance and potential future separation into independent frontend and backend services.
