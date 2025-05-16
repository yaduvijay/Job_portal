# Express API Documentation

This API provides functionality for user management, company management, job management, and application management. Below is an overview of the available routes and their usage.

## Routes

### User Routes

#### POST `/register`
- **Description**: Registers a new user.
- **Body**: 
  - `fullName` (String)
  - `email` (String)
  - `password` (String)
  - `phoneNumber` (String)
  - `role` (String)
  - `gender` (String)
- **Controller**: `registerUser`

#### POST `/login`
- **Description**: Logs a user into the system.
- **Body**: 
  - `email` (String)
  - `password` (String)
- **Controller**: `loginUser`

#### POST `/logout`
- **Description**: Logs the user out (requires authentication).
- **Middleware**: `authenticateToken`
- **Controller**: `logoutUser`

#### GET `/profile`
- **Description**: Retrieves the profile of the authenticated user.
- **Middleware**: `authenticateToken`
- **Controller**: `getUserProfile`

#### PATCH `/profile/update`
- **Description**: Updates the profile of the authenticated user.
- **Middleware**: `authenticateToken`
- **Controller**: `updateUserProfile`

#### GET `/users`
- **Description**: Retrieves all users (requires authentication).
- **Middleware**: `authenticateToken`
- **Controller**: `getAllUsers`

#### DELETE `/users/:id`
- **Description**: Deletes a user by ID (requires authentication).
- **Middleware**: `authenticateToken`
- **Controller**: `deleteUserById`

#### GET `/admin/users`
- **Description**: Retrieves all users for admin access (requires authentication).
- **Middleware**: `authenticateToken`
- **Controller**: `getAllUsersAdmin`

---

### Company Routes

#### GET `/companies`
- **Description**: Retrieves all companies.
- **Controller**: `getAllCompanies`

#### GET `/companies/:id`
- **Description**: Retrieves a company by ID.
- **Controller**: `getCompanyById`

#### POST `/register`
- **Description**: Creates a new company (requires authentication).
- **Middleware**: `authenticateToken`
- **Controller**: `createCompany`

#### GET `/my/companies`
- **Description**: Retrieves all companies created by the authenticated user.
- **Middleware**: `authenticateToken`
- **Controller**: `getMyCompanies`

#### GET `/my/companies/:id`
- **Description**: Retrieves a specific company created by the authenticated user.
- **Middleware**: `authenticateToken`
- **Controller**: `getMyCompanyById`

#### PATCH `/companies/:id`
- **Description**: Updates a company by ID (requires authentication).
- **Middleware**: `authenticateToken`
- **Controller**: `updateCompanyById`

#### DELETE `/companies/:id`
- **Description**: Deletes a company by ID (requires authentication).
- **Middleware**: `authenticateToken`
- **Controller**: `deleteCompanyById`

---

### Job Routes

#### GET `/jobs`
- **Description**: Retrieves all jobs.
- **Controller**: `getAllJobs`

#### GET `/jobs/:id`
- **Description**: Retrieves a job by ID.
- **Controller**: `getJobById`

#### POST `/jobs/add`
- **Description**: Creates a new job (requires authentication).
- **Middleware**: `authenticateToken`
- **Controller**: `createJob`

#### PATCH `/jobs/:id`
- **Description**: Updates a job by ID (requires authentication).
- **Middleware**: `authenticateToken`
- **Controller**: `updateJobById`

#### DELETE `/jobs/:id`
- **Description**: Deletes a job by ID (requires authentication).
- **Middleware**: `authenticateToken`
- **Controller**: `deleteJobById`

#### GET `/my/jobs`
- **Description**: Retrieves all jobs posted by the authenticated user.
- **Middleware**: `authenticateToken`
- **Controller**: `getMyJobs`

#### GET `/my/jobs/:id`
- **Description**: Retrieves a specific job posted by the authenticated user.
- **Middleware**: `authenticateToken`
- **Controller**: `getMyJobById`

---

### Application Routes

#### GET `/apply/:id`
- **Description**: Allows a user to apply for a job (requires authentication).
- **Middleware**: `authenticateToken`
- **Controller**: `applyForJob`

#### GET `/my-applications`
- **Description**: Retrieves all applications submitted by the authenticated user.
- **Middleware**: `authenticateToken`
- **Controller**: `getAllApplicationsByUser`

#### GET `/my/applications`
- **Description**: Retrieves all applications (requires authentication).
- **Middleware**: `authenticateToken`
- **Controller**: `getAllApplications`

#### GET `/my/applications/:id`
- **Description**: Retrieves a specific application by ID.
- **Middleware**: `authenticateToken`
- **Controller**: `getMyApplicantsById`

#### PATCH `/update-status/:id`
- **Description**: Updates the status of an application by ID (requires authentication).
- **Middleware**: `authenticateToken`
- **Controller**: `updateApplicationStatus`

---

## Middleware

- **authenticateToken**: Verifies the JWT token provided in the Authorization header for protected routes.
