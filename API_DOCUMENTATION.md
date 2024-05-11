#### APIs
### `GET /api/companies/`
Lists all companies.

**Response:**

- `200 OK` on success, with an array of companies as the response body.

### `GET /api/companies/`
Retrieves a list of companies, optionally filtered by tech sectors and main office locations.

**Query Parameters:**

- `tech_sectors`: integer, optional
- `hq_main_offices`: integer, optional

**Response:**

- `200 OK` on success, with the list of companies as the response body.
- `400 Bad Request` if the query parameters are invalid.

### `GET /api/companies/`
Retrieves a list of companies, optionally filtered by company name.

**Query Parameters:**

- `company`: string, optional

**Response:**

- `200 OK` on success, with the list of companies as the response body.
- `400 Bad Request` if the query parameter is invalid.

### `GET /api/companies/{id}`
Retrieves a company by its ID.

**Path Parameters:**

- `id`: integer, required

**Response:**

- `200 OK` on success, with the requested company object as the response body.
- `404 Not Found` if no company with the given ID exists.

### `GET /api/finance-stages/`
Retrieves all finance stages.

**Response:**

- `200 OK` on success, with an array of finance stages as the response body.

### `GET /api/entities/`
Retrieves all entities.

**Response:**

- `200 OK` on success, with an array of entities as the response body.

### `GET /api/main-offices/`
Lists all main offices.

**Response:**

- `200 OK` on success, with an array of main offices as the response body.

### `GET /api/tech-sectors/`
Retrieves all technology sectors.

**Response:**

- `200 OK` on success, with an array of tech sectors as the response body.

### `GET /api/companies-for-model-training`
Retrieves companies for model training purposes.

**Response:**

- `200 OK` on success, with an array of companies as the response body.

### `GET /api/interestId/interestName`
Retrieves interest details by name.

**Query Parameters:**

- `name`: string, required

**Response:**

- `200 OK` on success, with interest details as the response body.
- `400 Bad Request` if the name is not provided.

### `GET /api/interests/`
Lists all interests.

**Response:**

- `200 OK` on success, with an array of interests as the response body.

### `GET /api/users/`
Lists all users.

**Response:**

- `200 OK` on success, with an array of users as the response body.

### `GET /api/users/{id}`
Retrieves a user by ID.

**Path Parameters:**

- `id`: integer, required

**Response:**

- `200 OK` on success, with the requested user object as the response body.
- `404 Not Found` if no user with the given ID exists.

### `POST /api/users/`
Creates a user.

**Response:**

- `200 OK` on success, with new user created.
- `404 Not Found`

### `PATCH /api/users/{id}`
Updates a user's profile by ID.

**Path Parameters:**

- `id`: integer, required

**Response:**

- `200 OK` on success, with the updated user object as the response body.
- `404 Not Found` if no user with the given ID exists.

### `POST /api/login/`
Authenticates a user and provides a token.

**Request Body:**

- `username`: string, required
- `password`: string, required

**Response:**

- `200 OK` on success, with the token details as the response body.
- `401 Unauthorized` if the credentials are incorrect.

### `POST /api/token/refresh/`
Refreshes an authentication token.

**Request Body:**

- `refresh_token`: string, required

**Response:**

- `200 OK` on success, with the new token as the response body.
- `401 Unauthorized` if the token is invalid.

### `GET /api/access/user-id`
Grants access based on user ID.

**Response:**

- `200 OK` on success, with access details as the response body.

### `GET /api/semantic-search-portfolio-companies/`

Performs a semantic search on portfolio companies.

**Query Parameters:**

- `query`: string, required. The search query to perform. For example, "AI and machine learning company in the healthcare sector".

**Response:**

- `200 OK` on success, with a list of portfolio companies name that match the search query as the response body.
- `400 Bad Request` if the `query` parameter is missing or invalid.
tionally filtered by tech sectors and main office locations.
