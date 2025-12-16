# API Endpoints - eraswap-backend

This document lists all HTTP endpoints implemented in this repository, their methods, URL paths, expected request parameters/payloads, typical responses, errors, middleware in use, and the controller + model files that implement them.

Notes
- Base router mounting: Check `app.js` to see how these routers are mounted (commonly under `/api` or `/items`, etc.). The router files live in `routers/` and the logic in `controllers/`.
- Logging middleware: `routers/logMiddleware.js` is applied to most routers (it logs request method + URL).
- File uploads: `middleware/upload.js` configures `multer`. Item image endpoints accept `multipart/form-data` with fields `icon` and `pictures`.

---

## Items
Files: `routers/itemsRouter.js`, `controllers/itemsController.js`, `models/item.js`

- **GET /**
  - Path: `/items` (router path; actual mounted path depends on `app.js`)
  - Method: GET
  - Query params: `page` (int), `limit` (int), `q` (search string), `category`, `minPrice`, `maxPrice`, `sort` (e.g. `price:asc`)
  - Success: 200
    - JSON: `{ data: [Item], meta: { total, page, limit, pages } }`
  - Errors: 500 on server error

- **GET /:id**
  - Path: `/items/:id`
  - Method: GET
  - URL params: `id` (item id)
  - Success: 200 → Item JSON
  - Errors: 404 if not found, 500 on server error

- **GET /category/:category**
  - Path: `/items/category/:category`
  - Method: GET
  - URL params: `category`
  - Query params: same pagination/filtering as GET /
  - Success: 200 → `{ data: [Item], meta: {...} }`
  - Notes: This endpoint only returns items that are not attached to an order (items with `order_id = null`).

- **POST /**
  - Path: `/items`
  - Method: POST
  - Middleware: `upload.fields([{ name: 'icon', maxCount: 1 }, { name: 'pictures', maxCount: 10 }])` — accepts `multipart/form-data` images
  - Body (JSON or multipart form fields): `name` (required), `price` (required, numeric), `description?`, `category?`, `listedbyid?`. Files: `icon` (single image) and `pictures` (array of images).
  - Success: 201 → created Item
  - Errors: 400 for validation (missing name/price), 400+ on upload errors, 500 on other errors
  - Notes: Icon file is processed to create a thumbnail via `utils/imageHelpers.js`; URLs are served under `/static/uploads`.

- **PUT /:id** and **PATCH /:id**
  - Path: `/items/:id`
  - Method: PUT or PATCH
  - Middleware: same `upload.fields(...)` as POST
  - Body: partial fields to update; `price` must be numeric if provided. Files allowed (icon/pictures) — previous local files are deleted when replaced.
  - Success: 200 → updated Item
  - Errors: 400 for invalid payload, 404 if item not found, 500 on other errors

- **DELETE /:id**
  - Path: `/items/:id`
  - Method: DELETE
  - Action: deletes the item row and removes local files referenced in `icon` and `pictures` if they point to local `/static/uploads/...` files.
  - Success: 200 `{ message: 'Item deleted' }`
  - Errors: 404 if not found, 500 on server error

- **PATCH /:id/stock**
  - Path: `/items/:id/stock`
  - Method: PATCH
  - Body: `{ delta: number }` — positive to increase, negative to decrease
  - Action: adjusts `quantity` or `stock` field on the item (if present). If the model has neither, returns 400.
  - Success: 200 → item
  - Errors: 400 for missing/invalid delta or no stock field, 404 item not found, 500 server error

Model: `models/item.js` fields include `name`, `description`, `weight`, `price`, `icon`, `pictures` (JSON), `category`.

---

## Users
Files: `routers/usersRouter.js`, `controllers/usersController.js`, `models/user.js`

- **POST /register**
  - Path: `/users/register`
  - Method: POST
  - Body: `{ username, email, password, firstName?, lastName?, birthday?, role? }`
  - Action: Creates user (password hashed). Creates associated `Inventory` and `Cart`, generates a 5-digit verification code and emails it via `logging/mail.js`.
  - Success: 201 → created User (includes `verification_code` field set server-side)
  - Errors: 408 if email already registered (per code), 400 on other validation errors

- **PUT /verify**
  - Path: `/users/verify`
  - Method: PUT
  - Body: `{ email, code }`
  - Action: Checks `verification_code` and marks `verified=true` when it matches
  - Success: 200 `{ message: 'User verified successfully' }`
  - Errors: 404 user not found, 400 invalid code, 500 server error

- **POST /login**
  - Path: `/users/login`
  - Method: POST
  - Body: `{ email? or username, password }`
  - Action: verifies credentials via bcrypt. If not verified, resends verification code and returns 409 with notice.
  - Success: 200 `{ message: 'Login successful', user }` (user object returned)
  - Errors: 404 user not found, 401 invalid password, 409 not verified
  - Notes: No JWT/session is created by the current implementation — authentication is a simple check and returns the user object.

- **GET /profile/:userid**
  - Path: `/users/profile/:userid`
  - Method: GET
  - Success: 200 → user object
  - Errors: 404 if not found

- **GET /listings/:userid**
  - Path: `/users/listings/:userid`
  - Method: GET
  - Success: 200 → array of `Item` rows where `listedbyid = userid`

- **PUT /profile/:userid**
  - Path: `/users/profile/:userid`
  - Method: PUT
  - Body: fields to update (if `password` provided, it will be hashed into `password_hash`)
  - Success: 200 → updated user
  - Errors: 404 if user not found, 500 on failure

- **DELETE /:userid**
  - Path: `/users/:userid`
  - Method: DELETE
  - Success: 200 `{ message: 'User deleted' }`

- **GET /:userid/coins**
  - Path: `/users/:userid/coins`
  - Method: GET
  - Success: 200 `{ coins: number }`

- **POST /:userid/coins**
  - Path: `/users/:userid/coins`
  - Method: POST
  - Body: `{ amount: number }`
  - Action: increments user's `coins` by `amount` and returns updated coin count

- **GET /:userid/level**
  - Path: `/users/:userid/level`
  - Method: GET
  - Success: 200 `{ level: number }`

- **POST /:userid/exp**
  - Path: `/users/:userid/exp`
  - Method: POST
  - Body: `{ amount: number }`
  - Action: adds `exp`, and runs simple level-up logic (100 exp per level)
  - Success: 200 `{ level, exp }`

Model: `models/user.js` fields include `username`, `email`, `verified`, `verification_code`, `password_hash`, `firstName`, `lastName`, `birthday`, `coins`, `level`, `exp`, `role`.

---

## Orders
Files: `routers/ordersRouter.js`, `controllers/ordersController.js`, `models/order.js`, `models/item.js`, `models/user.js`

- **POST /from-cart/:cartId**
  - Path: `/orders/from-cart/:cartId`
  - Method: POST
  - Action: Transactionally converts a cart into an `Order`:
    - Loads `Cart`, `CartItem` rows, loads `Item` rows referenced, creates `Order`, sets `item.order_id = order.id` for each item, deletes cart_items rows, commits.
  - Success: 201 → full order (includes Items and User)
  - Errors: 404 cart not found, 400 cart empty, 500 for DB errors. Transaction rollback is used on failure.

- **GET /:orderId**
  - Path: `/orders/:orderId`
  - Method: GET
  - Success: 200 → Order JSON (includes Items and User subset)
  - Errors: 404 if not found

- **GET /user/:userId**
  - Path: `/orders/user/:userId`
  - Method: GET
  - Success: 200 → array of Orders for the user

- **GET /user/:userId/items**
  - Path: `/orders/user/:userId/items`
  - Method: GET
  - Description: Returns all `Item` rows belonging to orders placed by the given user. Implementation first collects the user's order IDs, then returns items where `order_id` is in that set.
  - Success: 200 → array of Item objects (empty array if user has no orders)

- **GET /**
  - Path: `/orders`
  - Method: GET
  - Query params: `userId` (optional) to filter
  - Success: 200 → array of orders

Model: `models/order.js` has `id`, `timestamp`; Orders are associated to `User` and contain `Item`s via `item.order_id`.

---

## Carts
Files: `routers/cartsRouter.js`, `controllers/cartsController.js`, `models/cart.js`, `models/cartItem.js`, `models/item.js`

- **POST /**
  - Path: `/carts`
  - Method: POST
  - Body: `{ userId }`
  - Success: 201 → created Cart
  - Errors: 400 missing userId, 404 user not found

- **GET /:cartId**
  - Path: `/carts/:cartId`
  - Method: GET
  - Success: 200 → Cart (includes Items via join)
  - Errors: 404 if not found

- **POST /:cartId/items**
  - Path: `/carts/:cartId/items`
  - Method: POST
  - Body: `{ itemId }`
  - Action: creates a `cart_items` row (unique constraint prevents duplicates)
  - Success: 200 → updated Cart (includes Items)
  - Errors: 400 missing itemId, 404 cart/item not found, 409 item already in cart

- **DELETE /:cartId/items/:itemId**
  - Path: `/carts/:cartId/items/:itemId`
  - Method: DELETE
  - Success: 200 → updated Cart
  - Errors: 404 if cart item not found

- **DELETE /:cartId**
  - Path: `/carts/:cartId`
  - Method: DELETE
  - Action: clears the cart by destroying `cart_items` rows for the cart
  - Success: 200 `{ message: 'Cart cleared' }`

---

## Inventory
Files: `routers/inventoryRouter.js`, `controllers/inventoryController.js`, `models/inventory.js`, `models/inventoryItem.js`, `models/item.js`

- **GET /:inventoryId**
  - Path: `/inventory/:inventoryId`
  - Method: GET
  - Success: 200 → Inventory (includes Items)

- **POST /:inventoryId/items**
  - Path: `/inventory/:inventoryId/items`
  - Method: POST
  - Body: `{ itemId }`
  - Action: creates `inventory_items` row; returns 409 if already present
  - Success: 200 → updated Inventory

- **DELETE /:inventoryId/items/:itemId**
  - Path: `/inventory/:inventoryId/items/:itemId`
  - Method: DELETE
  - Success: 200 → updated Inventory

---

## Logs / Email
Files: `routers/logRouter.js`, `controllers/logController.js`, `utils/email.js` (and `logging/mail.js`)

- **POST /email**
  - Path: `/log/email` (router path depends on mounting)
  - Method: POST
  - Body: `{ toMail, fromMail, header, body }`
  - Action: calls `utils/email.sendEmail(...)` and returns the result
  - Success: 200 with mail result, 500 on failure

- **POST /**
  - Path: `/log/` (router path depends on mounting)
  - Method: POST
  - Body: `{ user, door, body }`
  - Action: appends a log line to a per-door logfile in `logging/logs/door<door>.log`

---

## Middleware and Uploads
- `routers/logMiddleware.js`: logs request method + URL via `logging/logger.js`.
- `middleware/upload.js`: multer storage configured at `uploads/items`, allows images (`jpg/png/webp/gif`), 6MB per file.

## Helpful file references
- Routers: `routers/*.js`
- Controllers: `controllers/*.js`
- Models: `models/*.js`
- Uploads served under `/static/uploads` (see `controllers/itemsController.js` for details)

---

If you'd like, I can:
- Generate example `curl` commands for each endpoint
- Add an OpenAPI (Swagger) spec file based on this documentation
- Create a `docs/` folder and split endpoints into separate per-resource markdown files

Tell me which next step you prefer.
