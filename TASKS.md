## 0. Redis utils
**Contributor: Mostafa**

**Description:**
Inside the folder `utils`, create a file `redis.js` that contains the class `RedisClient`.

`RedisClient` should have:
- The constructor that creates a client to Redis.
- Any error of the Redis client must be displayed in the console (you should use `on('error')` of the Redis client).
- A function `isAlive` that returns `true` when the connection to Redis is successful, otherwise `false`.
- An asynchronous function `get` that takes a string key as argument and returns the Redis value stored for this key.
- An asynchronous function `set` that takes a string key, a value, and a duration in seconds as arguments to store it in Redis (with an expiration set by the duration argument).
- An asynchronous function `del` that takes a string key as argument and removes the value in Redis for this key.

After the class definition, create and export an instance of `RedisClient` called `redisClient`.

## 1. MongoDB utils
**Contributor: Fady (davenchy)**

**Description:**
Inside the folder `utils`, create a file `db.js` that contains the class `DBClient`.

`DBClient` should have:
- The constructor that creates a client to MongoDB:
  - `host`: from the environment variable `DB_HOST` or default: `localhost`
  - `port`: from the environment variable `DB_PORT` or default: `27017`
  - `database`: from the environment variable `DB_DATABASE` or default: `files_manager`
- A function `isAlive` that returns `true` when the connection to MongoDB is successful, otherwise `false`.
- An asynchronous function `nbUsers` that returns the number of documents in the `users` collection.
- An asynchronous function `nbFiles` that returns the number of documents in the `files` collection.

After the class definition, create and export an instance of `DBClient` called `dbClient`.

## 2. First API
**Contributor: Mostafa**

**Description:**
Inside `server.js`, create the Express server:

- It should listen on the port set by the environment variable `PORT` or by default `5000`.
- It should load all routes from the file `routes/index.js`.

Inside the folder `routes`, create a file `index.js` that contains all endpoints of our API:

- `GET /status` => `AppController.getStatus`
- `GET /stats` => `AppController.getStats`

Inside the folder `controllers`, create a file `AppController.js` that contains the definition of the 2 endpoints:

- `GET /status` should return if Redis is alive and if the DB is alive too by using the 2 utils created previously: `{ "redis": true, "db": true }` with a status code 200.
- `GET /stats` should return the number of users and files in DB: `{ "users": 12, "files": 1231 }` with a status code 200.
  - The `users` collection must be used for counting all users.
  - The `files` collection must be used for counting all files.


## 3. Create a new user
**Contributor: Fady (davenchy)**

**Description:**
In the file `routes/index.js`, add a new endpoint:

- `POST /users` => `UsersController.postNew`

Inside the `controllers` folder, add a file `UsersController.js` that contains the new endpoint:

- `POST /users` should create a new user in DB:
  - To create a user, you must specify an `email` and a `password`.
  - If the `email` is missing, return an error `Missing email` with a status code 400.
  - If the `password` is missing, return an error `Missing password` with a status code 400.
  - If the `email` already exists in DB, return an error `Already exist` with a status code 400.
  - The password must be stored after being hashed in SHA1.
  - The endpoint should return the new user with only the `email` and the `id` (auto-generated by MongoDB) with a status code 201.
  - The new user must be saved in the `users` collection:
    - `email`: same as the value received
    - `password`: SHA1 value of the value received


## 4. Authenticate a user
**Contributor: Mostafa**

**Description:**
In the file `routes/index.js`, add 3 new endpoints:

- `GET /connect` => `AuthController.getConnect`
- `GET /disconnect` => `AuthController.getDisconnect`
- `GET /users/me` => `UserController.getMe`

Inside the `controllers` folder, add a file `AuthController.js` that contains the new endpoints:

- `GET /connect` should sign in the user by generating a new authentication token:
  - By using the header `Authorization` and the technique of Basic auth (Base64 of the `<email>:<password>`), find the user associated with this email and password (remember: we are storing the SHA1 of the password).
  - If no user is found, return an error `Unauthorized` with a status code 401.
  - Otherwise:
    - Generate a random string (using `uuidv4`) as a token.
    - Create a key: `auth_<token>`.
    - Use this key for storing in Redis (by using the `redisClient` created previously) the user ID for 24 hours.
    - Return this token: `{ "token": "155342df-2399-41da-9e8c-458b6ac52a0c" }` with a status code 200.

- `GET /disconnect` should sign out the user based on the token:
  - Retrieve the user based on the token.
  - If not found, return an error `Unauthorized` with a status code 401.
  - Otherwise, delete the token in Redis and return nothing with a status code 204.

Inside the file `controllers/UsersController.js`, add a new endpoint:

- `GET /users/me` should retrieve the user based on the token used:
  - Retrieve the user based on the token.
  - If not found, return an error `Unauthorized` with a status code 401.
  - Otherwise, return the user object (email and id only).


## 5. First file
**Contributor: Fady (davenchy)**

**Description:**
In the file `routes/index.js`, add a new endpoint:

- `POST /files` => `FilesController.postUpload`

Inside the `controllers` folder, add a file `FilesController.js` that contains the new endpoint:

- `POST /files` should create a new file in DB and on disk:
  - Retrieve the user based on the token.
    - If not found, return an error `Unauthorized` with a status code 401.
  - To create a file, you must specify:
    - `name`: as filename
    - `type`: either `folder`, `file`, or `image`
    - `parentId`: (optional) as ID of the parent (default: 0 -> the root)
    - `isPublic`: (optional) as boolean to define if the file is public or not (default: false)
    - `data`: (only for type=file|image) as Base64 of the file content
  - If the `name` is missing, return an error `Missing name` with a status code 400.
  - If the `type` is missing or not part of the list of accepted types, return an error `Missing type` with a status code 400.
  - If the `data` is missing and `type != folder`, return an error `Missing data` with a status code 400.
  - If the `parentId` is set:
    - If no file is present in DB for this `parentId`, return an error `Parent not found` with a status code 400.
    - If the file present in DB for this `parentId` is not of type `folder`, return an error `Parent is not a folder` with a status code 400.
  - The user ID should be added to the document saved in DB as the owner of the file.
  - If the `type` is `folder`, add the new file document in the DB and return the new file with a status code 201.
  - Otherwise:
    - All files will be stored locally in a folder (to create automatically if not present):
      - The relative path of this folder is given by the environment variable `FOLDER_PATH`.
      - If this variable is not present or empty, use `/tmp/files_manager` as the storing folder path.
    - Create a local path in the storing folder with filename a UUID.
    - Store the file in clear (data contains the Base64 of the file) in this local path.
    - Add the new file document in the collection `files` with these attributes:
      - `userId`: ID of the owner document (owner from the authentication)
      - `name`: same as the value received
      - `type`: same as the value received
      - `isPublic`: same as the value received
      - `parentId`: same as the value received - if not present: 0
      - `localPath`: for a type=file|image, the absolute path to the file saved locally
    - Return the new file with a status code 201.


## 6. Get and list file
**Contributor: Mostafa**

**Description:**
In the file `routes/index.js`, add 2 new endpoints:

- `GET /files/:id` => `FilesController.getShow`
- `GET /files` => `FilesController.getIndex`

In the file `controllers/FilesController.js`, add the 2 new endpoints:

- `GET /files/:id` should retrieve the file document based on the ID:
  - Retrieve the user based on the token.
    - If not found, return an error `Unauthorized` with a status code 401.
    - If no file document is linked to the user and the ID passed as parameter, return an error `Not found` with a status code 404.
    - Otherwise, return the file document.

- `GET /files` should retrieve all user file documents for a specific `parentId` and with pagination:
  - Retrieve the user based on the token.
    - If not found, return an error `Unauthorized` with a status code 401.
  - Based on the query parameters `parentId` and `page`, return the list of file documents:
    - `parentId`: No validation needed. If not linked to any user folder, return an empty list. Default is 0 (the root).
    - Pagination: Each page should have a maximum of 20 items. Page query parameter starts at 0 for the first page. Page 1 means the second page (from the 20th to the 40th), etc. Pagination can be done using MongoDB's aggregate function.



## 7. File publish/unpublish
**Contributor: fady (davenchy)**

**Description:**
In the file `routes/index.js`, add 2 new endpoints:

- `PUT /files/:id/publish` => `FilesController.putPublish`
- `PUT /files/:id/unpublish` => `FilesController.putUnpublish`

In the file `controllers/FilesController.js`, add the 2 new endpoints:

- `PUT /files/:id/publish` should set `isPublic` to `true` on the file document based on the ID:
  - Retrieve the user based on the token.
    - If not found, return an error `Unauthorized` with a status code 401.
    - If no file document is linked to the user and the ID passed as parameter, return an error `Not found` with a status code 404.
    - Otherwise, update the value of `isPublic` to `true` and return the file document with a status code 200.

- `PUT /files/:id/unpublish` should set `isPublic` to `false` on the file document based on the ID:
  - Retrieve the user based on the token.
    - If not found, return an error `Unauthorized` with a status code 401.
    - If no file document is linked to the user and the ID passed as parameter, return an error `Not found` with a status code 404.
    - Otherwise, update the value of `isPublic` to `false` and return the file document with a status code 200.


## 8. File data
**Contributor: Mostafa**

**Description:**
In the file `routes/index.js`, add one new endpoint:

- `GET /files/:id/data` => `FilesController.getFile`

In the file `controllers/FilesController.js`, add the new endpoint:

- `GET /files/:id/data` should return the content of the file document based on the ID:
  - If no file document is linked to the ID passed as parameter, return an error `Not found` with a status code 404.
  - If the file document (folder or file) is not public (`isPublic: false`) and no user is authenticated or not the owner of the file, return an error `Not found` with a status code 404.
  - If the type of the file document is `folder`, return an error `A folder doesn't have content` with a status code 400.
  - If the file is not locally present, return an error `Not found` with a status code 404.
  - Otherwise:
    - By using the module `mime-types`, get the MIME-type based on the name of the file.
    - Return the content of the file with the correct MIME-type.


## 9. Image Thumbnails
**Contributor: Fady (davenchy)**

**Description:**
Update the endpoint `POST /files` to start background processing for generating thumbnails for a file of type `image`:

**Create a Bull queue:**
   - Name: `fileQueue`
 
**Add a job to the queue:**
   - When a new image is stored (in local and in DB), add a job with `userId` and `fileId`.

**Create a file `worker.js`:**
   - Use the module `Bull` to create the `fileQueue`.
   - Process the queue:
     - If `fileId` is not present in the job, raise an error `Missing fileId`.
     - If `userId` is not present in the job, raise an error `Missing userId`.
     - If no document is found in DB based on `fileId` and `userId`, raise an error `File not found`.
     - Use the module `image-thumbnail` to generate 3 thumbnails with widths: 500, 250, and 100.
       - Store each result in the same location as the original file by appending `_<width size>`.

**Update the endpoint `GET /files/:id/data` to accept a query parameter `size`:**
   - `size` can be 500, 250, or 100.
   - Based on `size`, return the correct local file.
   - If the local file doesn’t exist, return an error `Not found` with a status code 404.
 

## Contribution Summary

### Mostafa
Mostafa developed the `RedisClient` class for Redis utility and set up the Express server in `server.js`. He also created the API endpoints for status and statistics, as well as the authentication, file retrieval, and file listing functionalities.

### Fady (davenchy)
Fady created the `DBClient` class for MongoDB utility and implemented user management features including handling file upload, publishing/unpublishing, and set up background processing for image thumbnails with Bull queue. Fady also enhance code readability and structure and does a lot of debugging to solve code problems.
