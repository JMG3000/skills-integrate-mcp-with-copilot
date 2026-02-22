# Mergington High School Activities API

A super simple FastAPI application that allows students to view and sign up for extracurricular activities.

## Features

- View all available extracurricular activities
- Register, login, and logout with session cookies
- Sign up for activities as an authenticated user

## Getting Started

1. Install the dependencies:

   ```
   pip install fastapi uvicorn
   ```

2. Run the application:

   ```
   python app.py
   ```

3. Open your browser and go to:
   - API documentation: http://localhost:8000/docs
   - Alternative documentation: http://localhost:8000/redoc

## API Endpoints

| Method | Endpoint                                                          | Description                                                         |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| POST   | `/auth/register?email=user@mergington.edu&password=secret123`    | Register a new user                                                 |
| POST   | `/auth/login?email=user@mergington.edu&password=secret123`       | Login and create a session cookie                                  |
| POST   | `/auth/logout`                                                    | Logout and clear session                                            |
| GET    | `/auth/me`                                                        | Return current authenticated user                                   |
| GET    | `/activities`                                                     | Get all activities with their details and current participant count |
| POST   | `/activities/{activity_name}/signup`                             | Sign up current authenticated user for an activity                  |
| DELETE | `/activities/{activity_name}/unregister`                          | Unregister current authenticated user from an activity              |

## Data Model

The application uses a simple data model with meaningful identifiers:

1. **Activities** - Uses activity name as identifier:

   - Description
   - Schedule
   - Maximum number of participants allowed
   - List of student emails who are signed up

2. **Students** - Uses email as identifier:
   - Name
   - Grade level

All users, sessions, and activities are stored in memory, which means data will be reset when the server restarts.
