# GangaTv Backend Documentation

> This document describes the current backend implementation in this repo (Express + MongoDB + ImageKit + JWT cookies).

---

## 1) Tech Stack
- **Node.js / Express** (REST API)
- **MongoDB** with **Mongoose**
- **JWT authentication** stored in an **HTTP cookie** (`token`)
- **bcrypt** for password hashing
- **ImageKit** for image upload/delete
- **multer** for file uploads (memory storage)

---

## 2) Entry Point & App Wiring

### `Backend/server.js`
- Imports the Express app from `./src/app.js`
- Connects to MongoDB via `./src/confid/db.config.js`
- Starts listening on `process.env.PORT`

### `Backend/src/app.js`
Sets up middleware and mounts routers:
- `express.json()`
- `cookie-parser`

Routes mounted:
- `POST/GET/… /api/auth` → `src/router/auth.router.js`
- `GET/POST/… /api/news` → `src/router/news.router.js`
- `GET/POST/… /api/settings` → `src/router/website.setting.router.js`

---

## 3) Project Structure (src)
- `src/router/`
  - `auth.router.js`
  - `news.router.js`
  - `website.setting.router.js`
- `src/controller/`
  - `auth.controller.js`
  - `news.controller.js`
  - `website.setting.controller.js`
- `src/middleware/`
  - `auth.middleware.js` (JWT cookie verification + role checks)
  - `multer.middleware.js` (in-memory upload + size limit)
- `src/models/`
  - `user.Schema.js`
  - `news.Schema.js`
  - `Website.setting.Schema.js`
- `src/services/`
  - `imagekit.service.js` (upload/delete helpers)
- `src/utility/`
  - `jsonWebToken.utility.js` (JWT signing)
- `src/confid/`
  - `db.config.js` (Mongo connection)
  - `imagekit.config.js` (ImageKit client config)

---

## 4) Authentication (JWT in cookie)

### 4.1 JWT Creation: `src/utility/jsonWebToken.utility.js`
When registering/logging in, the backend signs a JWT with payload:
- `id`: `user._id`
- `role`: `user.role` (`admin` or `editor`)
- `email`: `user.email`

JWT settings:
- `expiresIn`: `"7d"`
- Signed with: `process.env.JWT_SECRET`

### 4.2 Cookie Name & Max Age
- Cookie name: **`token`**
- Cookie maxAge in register/login controllers: `1000*60*60824`
  - (As coded; exact duration equals that expression.)

### 4.3 Middleware: `src/middleware/auth.middleware.js`
Usage pattern:
```js
auth('admin', 'editor')
```
Behavior:
1. Reads token from `req.cookies.token`
2. If missing → `401 { message: "Token required" }`
3. Verifies JWT with `process.env.JWT_SECRET`
4. Checks `decoded.role` is included in allowed roles
   - If not allowed → `403 { message: "Access denied" }`
5. On success:
   - attaches `req.user = decoded`
   - calls `next()`

If JWT verification fails → `401 { message: "Invalid token" }`

> Note: the middleware does not read an Authorization header; it strictly uses the cookie.

---

## 5) Auth API: `src/router/auth.router.js`
Base path: **`/api/auth`**

### 5.1 Register
**POST** `/api/auth/register`

Controller: `RegisterUser`

Expected JSON body:
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "admin|editor"
}
```
Behavior:
- Checks if a user already exists by `email`
- Hashes password with bcrypt salt rounds `10`
- Creates user document
- Signs JWT and sets `token` cookie

Responses:
- `201` success:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": { }
}
```
- `400` if user exists:
```json
{
  "success": false,
  "message": "User already exists"
}
```
- `500` on server errors:
```json
{ "success": false, "message": "<error message>" }
```

### 5.2 Login
**POST** `/api/auth/login`

Controller: `LoginUser`

Expected JSON body:
```json
{
  "email": "string",
  "password": "string"
}
```
Behavior:
- Finds user by email
- Compares password using bcrypt
- On success signs JWT and sets `token` cookie

Responses:
- `200` success:
```json
{
  "success": true,
  "message": "Login successful",
  "user": { }
}
```
- `404` user not found
- `401` invalid credentials
- `500` on errors

---

## 6) News API: `src/router/news.router.js`
Base path: **`/api/news`**

### 6.1 Create News (thumbnail upload)
**POST** `/api/news/`

Middleware chain:
- `auth('admin', 'editor')`
- `upload.single('thumbnail')` (multer)
- `createNews`

Request format:
- **multipart/form-data**
- Form field for image: **`thumbnail`**
- Other fields (from `req.body`):

Body fields:
- `title` (required)
- `summary` (required)
- `description` (required)
- `category` (required; must match schema enum)
- `status` (optional; schema enum)
- `tags` (optional)
  - Code expects `tags` as a comma-separated string and converts via:
  `req.body.tags?.split(",") || []`

Behavior:
- If `req.file` exists, uploads thumbnail to ImageKit:
  - folder: **`/ganga-tv`**
  - uses `file.buffer` and `file.originalname`
- Saves:
  - `thumbnail` (ImageKit `url`)
  - `thumbnailFileId` (ImageKit `fileId`)
- Sets:
  - `editor: req.user.id`

Responses:
- `201` success:
```json
{
  "success": true,
  "data": { "_id": "...", "title": "...", "thumbnail": "..." }
}
```
- `500` on errors

### 6.2 Get All News
**GET** `/api/news/`

No auth.

Behavior:
- `News.find()`
- `.populate('editor', 'name email')`
- `.sort({ createdAt: -1 })`

Response:
```json
{
  "success": true,
  "count": <number>,
  "data": [ ... ]
}
```

### 6.3 Get News by ID
**GET** `/api/news/:id`

No auth.

Behavior:
- Finds by `req.params.id`
- `populate('editor', 'name email')`
- `404` if not found

Response:
```json
{
  "success": true,
  "data": { ... }
}
```

### 6.4 Update News
**PUT** `/api/news/:id`

Middleware:
- `auth('admin', 'editor')`

Behavior:
- `News.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })`

Notes:
- The update implementation does **not** handle thumbnail replacement (no multer upload in this route).

Responses:
- `200` success with updated doc
- `404` if not found
- `500` on errors

### 6.5 Delete News (and delete ImageKit thumbnail)
**DELETE** `/api/news/:id`

Middleware:
- `auth('admin')`

Behavior:
- Finds news by id
- If `thumbnailFileId` exists, deletes from ImageKit
- Deletes MongoDB document

Response:
```json
{
  "success": true,
  "message": "News and image deleted successfully"
}
```

### 6.6 Filter: Get News by Category
**GET** `/api/news/category/:category`

No auth.

Behavior:
- `News.find({ category: req.params.category })`
- `populate('editor', 'name')`

Response:
```json
{
  "success": true,
  "count": <number>,
  "data": [ ... ]
}
```

### 6.7 Filter: Get News by Editor
**GET** `/api/news/editor/:editorId`

No auth.

Behavior:
- `News.find({ editor: req.params.editorId })`
- `populate('editor', 'name email')`

Response same pattern as above.

---

## 7) Settings API: `src/router/website.setting.router.js`
Base path: **`/api/settings`**

### 7.1 Get Settings (Public)
**GET** `/api/settings/`

No auth.

Controller: `getSettings`
- `Setting.findOne()`

Response:
```json
{
  "success": true,
  "data": { }
}
```

### 7.2 Create Settings (Admin Only, first time)
**POST** `/api/settings/`

Middleware chain:
- `auth('admin')`
- `upload.fields([{ name: 'logo' }, { name: 'banner' }])`
- `createSettings`

Request format:
- **multipart/form-data**
- File fields:
  - `logo` (max 1)
  - `banner` (max 1)
- Text fields:
  - `websiteName`
  - `footerText`
  - `youtube`, `facebook`, `instagram`, `linkedin`, `twitter`

Behavior:
- Checks `Setting.findOne()` and rejects if already exists (`400`)
- Uploads images to ImageKit (if provided)
  - stores `logo`, `logoFileId`
  - stores `banner`, `bannerFileId`

### 7.3 Update Settings (Admin Only)
**PUT** `/api/settings/`

Middleware chain:
- `auth('admin')`
- `upload.fields([{ name: 'logo' }, { name: 'banner' }])`
- `updateSettings`

Behavior:
- Ensures there is a settings document (`findOne()` else create empty `new Setting()`)
- If new `logo` provided:
  - deletes old ImageKit file using stored `logoFileId` (if present)
  - uploads new image and updates `logo` + `logoFileId`
- Same for `banner`
- Updates text fields using `req.body.<field> || currentValue`

---

## 8) Mongoose Data Models

### 8.1 User Model: `src/models/user.Schema.js`
Collection model: `User`

Fields:
- `name`: `String`, required
- `email`: `String`, required, **unique**
- `password`: `String`, required (stored as bcrypt hash)
- `role`: `String`, enum: `['admin','editor']`, default: `editor`
- `profileImage`: `String`
- `isActive`: `Boolean`, default `true`

Options:
- `timestamps: true`

### 8.2 News Model: `src/models/news.Schema.js`
Collection model: `News`

Fields:
- `title`: `String`, required, trim
- `summary`: `String`, required
- `description`: `String`, required
- `category`: `String`, enum of:
  - `politics`, `sports`, `business`, `technology`, `education`, `health`,
    `entertainment`, `local`, `national`, `international`
  - required
- `thumbnail`: `String` (ImageKit URL)
- `thumbnailFileId`: `String` (ImageKit fileId)
- `tags`: array of strings
- `status`: `String`, enum `['draft','published','rejected']`, default `draft`
- `editor`: `ObjectId` ref `User`, required
- `publishedAt`: `Date`

Hooks:
- `pre('save')`:
  - if `status === 'published'` and `!publishedAt` → set `publishedAt = new Date()`

Options:
- `timestamps: true`

### 8.3 Settings Model: `src/models/Website.setting.Schema.js`
Collection model: `Setting`

Fields:
- `websiteName`: `String`, default `"Ganga TV"`
- `logo`: `String` (ImageKit URL)
- `logoFileId`: `String`
- `banner`: `String` (ImageKit URL)
- `bannerFileId`: `String`
- `footerText`: `String`
- Social links:
  - `youtube`, `facebook`, `instagram`, `linkedin`, `twitter`: all `String`

Options:
- `timestamps: true`

---

## 9) Middleware & Utilities

### 9.1 Multer Upload: `src/middleware/multer.middleware.js`
- Storage: `multer.memoryStorage()`
- Limits:
  - `fileSize: 5 * 1024 * 1024` (5MB)

Implication:
- Uploaded files exist in memory as `req.file.buffer` (used by ImageKit service)

### 9.2 ImageKit Service: `src/services/imagekit.service.js`
- `uploadImage(file)`
  - calls `imagekit.upload({
      file: file.buffer,
      fileName: `${Date.now()}-${file.originalname}`,
      folder: '/ganga-tv'
    })`
  - returns ImageKit response containing `url` and `fileId` (as used by controllers)

- `deleteImage(fileId)`
  - `imagekit.deleteFile(fileId)`

### 9.3 ImageKit Client Config: `src/confid/imagekit.config.js`
Uses env vars:
- `IMAGEKIT_PUBLIC_KEY`
- `IMAGEKIT_PRIVATE_KEY`
- `IMAGEKIT_URL_ENDPOINT`

---

## 10) Database Configuration: `src/confid/db.config.js`
Creates Mongo connection using Mongoose.

Current code behavior:
- Connects to MongoDB Atlas via a 
process.env.DB_URI
  

Implication:
- For production, this should be moved into environment variables.

---

## 11) Environment Variables Required (.env)
From code usage:
- `PORT` (server listen port)
- `JWT_SECRET` (used to sign/verify JWT)
- `IMAGEKIT_PUBLIC_KEY`
- `IMAGEKIT_PRIVATE_KEY`
- `IMAGEKIT_URL_ENDPOINT`


---

## 12) Common Response Shapes
Across controllers:
- Success responses typically include:
  - `success: true`
  - `data: <document or array>` (or `count`)
- Error responses typically include:
  - `success: false` (sometimes absent)
  - `message: <string>`

---

## 13) Notes / Observations (based on current code)
- News thumbnail update is **not supported** via the current `PUT /api/news/:id` route (no multer upload).
- Settings images can be updated; when updating logo/banner, the code deletes old ImageKit files first (if `logoFileId` / `bannerFileId` exist).
- Authentication is cookie-only (`req.cookies.token`).
- `Backend/src/controller/website.setting.controller.js` currently exports `updateSettings` twice (file contains duplicated `module.exports` blocks). Despite that, the final export includes `getSettings`, `createSettings`, `updateSettings`.

---

## 14) Quick API Endpoint Summary

### Auth
- `POST /api/auth/register` (no auth)
- `POST /api/auth/login` (no auth)

### News
- `POST /api/news/` (admin/editor) + multipart `thumbnail`
- `GET /api/news/`
- `GET /api/news/:id`
- `PUT /api/news/:id` (admin/editor)
- `DELETE /api/news/:id` (admin)
- `GET /api/news/category/:category`
- `GET /api/news/editor/:editorId`

### Settings
- `GET /api/settings/` (public)
- `POST /api/settings/` (admin) + multipart `logo` + `banner`
- `PUT /api/settings/` (admin) + multipart (optional `logo`/`banner`)

