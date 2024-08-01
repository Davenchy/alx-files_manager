# Files Manager - ALX Backend Team Project

## Overview

This project is a summary of the ALX back-end trimester,
covering essential concepts like authentication, NodeJS, MongoDB, Redis,
pagination, and background processing. The objective is to build a simple
platform to upload and view files with the following features:

- User authentication via a token

- List all files

- Upload a new file

- Change permission of a file

- View a file

- Generate thumbnails for images

This project is designed for learning purposes to assemble each piece and
build a full product.

## Table of Contents

- [Features](#features)
- [Concepts Covered](#concepts-covered)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Technologies](#technologies)
- [License](#license)
- [Authors](#authors)

## Features

1. **User Authentication**: Users can authenticate via tokens.

2. **File Management**:

      - List all files

      - Upload new files

      - Change file permissions

      - View files

      - Generate thumbnails for images

## Concepts Covered

- **Creating an API with Express**: Learn how to set up and manage routes,
    handle requests and responses, and create a robust API using Express.js.

- **User Authentication**: Implement token-based authentication to secure
    the platform.

- **Data Storage in MongoDB**: Store and manage file data in MongoDB.

- **Temporary Data Storage in Redis**: Use Redis for caching and temporary
    data storage.

- **Background Processing**: Set up and use a background worker for tasks like
    generating thumbnails for images.

## Project Structure

> This is an initial template, probably will be changed later.

```plaintext
├── src
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── services
│   ├── workers
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── tests
```

- `src/controllers`: Contains the controller logic for handling requests.
- `src/models`: Contains Mongoose schemas for MongoDB.
- `src/routes`: Defines the API endpoints.
- `src/services`: Contains business logic and utilities.
- `src/workers`: Contains background worker scripts.
- `src/app.js`: Main application setup.
- `src/server.js`: Server configuration and startup.
- `.env.example`: Example environment variables file.
- `tests`: Contains test cases for the application.

## Setup

### Prerequisites

- Node.js
- MongoDB
- Redis

### Installation

1. Clone the repository:

```bash
git clone --depth=1 https://github.com/Davenchy/alx-files_manager.git
cd alx-files_manager
```

2. Install dependencies:

```bash
npm install
# or using bun node package manager
bun install
```

3. Set up environment variables:

Rename the `.env.example` file to `.env` and update the values accordingly.

4. Start MongoDB and Redis servers:

Make sure MongoDB and Redis are running on your system.

5. Start the application:

```bash
npm start
```

## Usage

### Running the Server

To start the server, use:

```bash
npm start
```

The server will run on `http://localhost:3000` by default.

### Running Tests

To run the tests, use:

```bash
npm test
```

## API Documentation

### Endpoints

- `POST /api/register`: Register a new user
- `POST /api/login`: Authenticate a user
- `GET /api/data`: Retrieve data from MongoDB
- `POST /api/data`: Store data in MongoDB
- `GET /api/temp-data`: Retrieve temporary data from Redis
- `POST /api/temp-data`: Store temporary data in Redis

## Technologies

- **Express.js**: Web framework for Node.js
- **MongoDB**: NoSQL database for data storage
- **Redis**: In-memory data structure store for temporary data
- **Node.js**: JavaScript runtime environment
- **Mongoose**: ODM for MongoDB
- **Bull**: Redis-based queue for background jobs

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE)
file for details.

## Authors

- **Fadi Asaad (Davenchy)**: [Github](https://github.com/Davenchy) [LinkedIn](https://www.linkedin.com/in/fadi-asaad)

- **Mostafa Elmasry**: [Github](https://github.com/M1-Elmasry) [LinkedIn](https://www.linkedin.com/in/mostafa-elmasry-847097251)

---

Feel free to reach out if you have any questions or need further assistance.
Happy coding!
