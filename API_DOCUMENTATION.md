#### APIs
### 1. `POST /api/login/`
Authenticates a user and provides a token.

**Request Body:**

- `username`: string, required
- `password`: string, required

**Response:**

- `200 OK` on success, with the token details as the response body.
- `401 Unauthorized` if the credentials are incorrect.

### 2. `POST /api/token/refresh/`
Refreshes an authentication token.

**Request Body:**

- `refresh_token`: string, required

**Response:**

- `200 OK` on success, with the new token as the response body.
- `401 Unauthorized` if the token is invalid.

### 3. `POST /api/users/`
Creates a user.

**Response:**

- `200 OK` on success, with new user created.
- `404 Not Found`

### 4. `GET /api/users/{id}`
Retrieves a user by ID.

**Path Parameters:**

- `id`: integer, required

**Response:**

- `200 OK` on success, with the requested user object as the response body.
- `404 Not Found` if no user with the given ID exists.

### 5. `GET /api/access/user-id`
Grants access based on user ID.

**Response:**

- `200 OK` on success, with access details as the response body.

### 6. `PATCH /api/users/{id}`
Updates a user's profile by ID.

**Path Parameters:**

- `id`: integer, required

**Response:**

- `200 OK` on success, with the updated user object as the response body.
- `404 Not Found` if no user with the given ID exists.

### 7. `GET /api/users/`
Lists all users.

**Response:**

- `200 OK` on success, with an array of users as the response body.

### 8. `GET /api/interests/`
Lists all interests.

**Response:**

- `200 OK` on success, with an array of interests as the response body.

### 9. `GET /api/interestId/interestName`
Retrieves interest details by name.

**Query Parameters:**

- `name`: string, required

**Response:**

- `200 OK` on success, with interest details as the response body.
- `400 Bad Request` if the name is not provided.

### 10. `GET /api/companies-for-model-training`
Retrieves companies for model training purposes.

**Response:**

- `200 OK` on success, with an array of companies as the response body.

### 11. `GET /api/companies/`
Lists all companies.

**Response:**

- `200 OK` on success, with an array of companies as the response body.

### 12. `GET /api/companies/{id}`
Retrieves a company by its ID.

**Path Parameters:**

- `id`: integer, required

**Response:**

- `200 OK` on success, with the requested company object as the response body.
- `404 Not Found` if no company with the given ID exists.

### 13. `GET /api/companies/`
Retrieves a list of companies, optionally filtered by company name.

**Query Parameters:**

- `company`: string, optional

**Response:**

- `200 OK` on success, with the list of companies as the response body.
- `400 Bad Request` if the query parameter is invalid.

### 14. `GET /api/tech-sectors/`
Retrieves all technology sectors.

**Response:**

- `200 OK` on success, with an array of tech sectors as the response body.

### 15. `GET /api/main-offices/`
Lists all main offices.

**Response:**

- `200 OK` on success, with an array of main offices as the response body.

### 16. `GET /api/entities/`
Retrieves all entities.

**Response:**

- `200 OK` on success, with an array of entities as the response body.

### 17. `GET /api/finance-stages/`
Retrieves all finance stages.

**Response:**

- `200 OK` on success, with an array of finance stages as the response body.

### 18. `GET /api/companies/`
Retrieves a list of companies, optionally filtered by tech sectors and main office locations.

**Query Parameters:**

- `tech_sectors`: integer, optional
- `hq_main_offices`: integer, optional

**Response:**

- `200 OK` on success, with the list of companies as the response body.
- `400 Bad Request` if the query parameters are invalid.

### 19. `GET /api/semantic-search-portfolio-companies/`

Performs a semantic search on portfolio companies.

**Query Parameters:**

- `query`: string, required. The search query to perform. For example, "AI and machine learning company in the healthcare sector".

**Response:**

- `200 OK` on success, with a list of portfolio companies name that match the search query as the response body.
- `400 Bad Request` if the `query` parameter is missing or invalid.
tionally filtered by tech sectors and main office locations.
