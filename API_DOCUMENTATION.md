# Rose Camellia API Documentation

**Backend API for Lost Pet Reunion Board**

Base URL: `http://localhost:3000/api`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Posts (Lost/Found/Sighting)](#posts)
3. [Verification System](#verification-system)
4. [Comments](#comments)
5. [Images](#images)
6. [Users](#users)
7. [Error Handling](#error-handling)

---

## Authentication

### Register User

**POST** `/auth/register`

Create a new user account.

**Request Body:**

```json
{
  "username": "john_doe",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "contactNumber": "+1234567890" // optional
}
```

**Password Requirements:**

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Response (201):**

```json
{
  "message": "User registered successfully",
  "user": {
    "username": "john_doe",
    "name": "John Doe",
    "email": "john@example.com",
    "contactNumber": "+1234567890"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Login

**POST** `/auth/login`

Login with existing account.

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**

```json
{
  "message": "Login successful",
  "user": {
    "username": "john_doe",
    "name": "John Doe",
    "email": "john@example.com",
    "contactNumber": "+1234567890"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Create Guest User

**POST** `/auth/guest`

Create a guest account for quick posting (no password required).

**Request Body:**

```json
{
  "name": "Anonymous",
  "email": "guest@example.com",
  "contactNumber": "+9876543210" // optional
}
```

**Response (201):**

```json
{
  "message": "Guest user created",
  "user": {
    "username": "guest_1771095872118_zvjz6c90b",
    "name": "Anonymous",
    "email": "guest@example.com",
    "contactNumber": "+9876543210",
    "isGuest": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note:** Guest tokens expire in 24 hours (vs 7 days for registered users).

---

### Verify Token

**GET** `/auth/verify`

Verify if a JWT token is still valid.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "valid": true,
  "user": {
    "username": "john_doe",
    "name": "John Doe",
    "email": "john@example.com",
    "contactNumber": "+1234567890",
    "isGuest": false,
    "verified": "unverified"
  }
}
```

---

## Posts

### Create Post

**POST** `/posts`

Create a lost/found/sighting post.

**Headers:**

```
Authorization: Bearer <token> // optional but recommended
Content-Type: application/json
```

**Request Body:**

```json
{
  "authorUsername": "john_doe", // optional for guest posts
  "postType": "lost", // "lost" | "found" | "sighting"
  "title": "Lost Golden Retriever in Central Park",
  "description": "My golden retriever Buddy went missing near Central Park. Very friendly, responds to his name.",
  "petName": "Buddy", // optional
  "petType": "Dog", // optional
  "breed": "Golden Retriever", // optional
  "color": "Golden", // optional
  "size": "Large", // optional
  "location": "Central Park, NYC",
  "latitude": 40.785091, // optional
  "longitude": -73.968285, // optional
  "lostFoundDate": "2024-02-10T10:00:00Z",
  "contactEmail": "john@example.com", // optional (overrides user email)
  "contactPhone": "+1234567890", // optional
  "reward": 200 // optional, in dollars
}
```

**Response (201) - For Lost Pets:**

```json
{
  "id": "d0e9ddd1-b3da-4fd9-9f73-48cbf4d231ff",
  "createdAt": "2026-02-14T19:04:35.434Z",
  "postType": "lost",
  "title": "Lost Golden Retriever in Central Park",
  "petName": "Buddy",
  "verificationCode": "Q8K-GS9",
  "verificationMessage": "⚠️ IMPORTANT: Save this code! Share it only with someone who has found your pet to verify ownership."
  // ... other fields
}
```

**⚠️ IMPORTANT:** The `verificationCode` is only returned when creating a lost pet post. Save it immediately! It won't be shown again in public listings.

---

### Get All Posts

**GET** `/posts`

Retrieve posts with optional filtering.

**Query Parameters:**

- `postType` - Filter by type: `lost`, `found`, or `sighting`
- `resolved` - Filter by status: `true` or `false`
- `petType` - Filter by pet type (e.g., "Dog", "Cat")
- `location` - Search by location (partial match)
- `search` - Search in title, description, petName
- `limit` - Number of posts per page (default: 50)
- `offset` - Pagination offset (default: 0)

**Example:**

```
GET /posts?postType=lost&resolved=false&limit=10
```

**Response (200):**

```json
{
  "posts": [
    {
      "id": "d0e9ddd1-b3da-4fd9-9f73-48cbf4d231ff",
      "postType": "lost",
      "title": "Lost Golden Retriever in Central Park",
      "petName": "Buddy",
      "location": "Central Park, NYC",
      "hasVerification": true,
      // verificationCode is NOT included (security)
      "User": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "ImageUrls": [...],
      "_count": {
        "Comments": 5
      }
    }
  ],
  "pagination": {
    "total": 45,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

---

### Get Post by ID

**GET** `/posts/:id`

Get detailed information about a specific post.

**Response (200):**

```json
{
  "id": "d0e9ddd1-b3da-4fd9-9f73-48cbf4d231ff",
  "postType": "lost",
  "title": "Lost Golden Retriever in Central Park",
  "description": "Full description...",
  "petName": "Buddy",
  "hasVerification": true, // Indicates verification available
  "User": {...},
  "ImageUrls": [...],
  "Comments": [...]
}
```

**Note:** `verificationCode` is never included in this response for security.

---

### Update Post

**PUT** `/posts/:id`

Update an existing post.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:** (all fields optional)

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "location": "New location"
}
```

---

### Mark Post as Resolved

**PATCH** `/posts/:id/resolve`

Mark a post as resolved (pet found/reunited).

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "id": "...",
  "resolved": true,
  "resolvedAt": "2026-02-14T19:05:06.494Z"
}
```

---

### Delete Post

**DELETE** `/posts/:id`

Delete a post and all associated images.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "message": "Post deleted successfully"
}
```

---

## Verification System

### Get Verification Code (Owner Only)

**GET** `/posts/:id/verification-code?username=john_doe`

Retrieve the verification code for your own post.

**Query Parameters:**

- `username` - Your username (required)

**Response (200):**

```json
{
  "postId": "d0e9ddd1-b3da-4fd9-9f73-48cbf4d231ff",
  "postTitle": "Lost Golden Retriever in Central Park",
  "verificationCode": "Q8K-GS9",
  "message": "Share this code only with someone who claims to have found your pet"
}
```

**Response (403) - If not owner:**

```json
{
  "error": "You can only view your own verification code"
}
```

---

### Verify Ownership Code

**POST** `/posts/:id/verify`

Verify if someone is the real pet owner by checking their code.

**Request Body:**

```json
{
  "code": "Q8K-GS9"
}
```

**Response (200) - Correct Code:**

```json
{
  "verified": true,
  "message": "✅ Verified! This person is the pet owner.",
  "ownerInfo": {
    "name": "John Doe",
    "contactEmail": "john@example.com",
    "contactPhone": "+1234567890"
  },
  "petInfo": {
    "title": "Lost Golden Retriever in Central Park",
    "petName": "Buddy"
  }
}
```

**Response (200) - Wrong Code:**

```json
{
  "verified": false,
  "message": "❌ Invalid code. This person may not be the real owner.",
  "warning": "Do not share pet details or location with this person."
}
```

**UI Flow:**

1. Owner creates lost pet post → Gets code `ABC-123`
2. Finder contacts owner claiming they found pet
3. Owner asks: "What's the verification code?"
4. Finder provides code
5. Owner/Finder enters code on your UI → Calls this endpoint
6. If verified ✅ → Show owner contact info
7. If failed ❌ → Show warning

---

## Comments

### Create Comment

**POST** `/comments`

Add a comment to a post.

**Headers:**

```
Authorization: Bearer <token> // optional
Content-Type: application/json
```

**Request Body:**

```json
{
  "postId": "d0e9ddd1-b3da-4fd9-9f73-48cbf4d231ff",
  "authorUsername": "john_doe", // optional for guest
  "content": "I think I saw this dog near 5th Avenue!"
}
```

**Response (201):**

```json
{
  "id": "6accb192-6bf2-411f-8cbb-cff7605d7c5e",
  "postId": "d0e9ddd1-b3da-4fd9-9f73-48cbf4d231ff",
  "authorUsername": "john_doe",
  "content": "I think I saw this dog near 5th Avenue!",
  "createdAt": "2026-02-14T19:04:54.821Z",
  "User": {
    "username": "john_doe",
    "name": "John Doe",
    "isGuest": false
  }
}
```

---

### Get Comments for Post

**GET** `/comments/post/:postId`

Retrieve all comments for a specific post.

**Response (200):**

```json
[
  {
    "id": "...",
    "content": "I think I saw this dog!",
    "createdAt": "2026-02-14T19:04:54.821Z",
    "User": {
      "name": "John Doe",
      "isGuest": false
    }
  }
]
```

---

### Update Comment

**PUT** `/comments/:id`

Update your own comment.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "content": "Updated comment text"
}
```

---

### Delete Comment

**DELETE** `/comments/:id`

Delete a comment.

**Headers:**

```
Authorization: Bearer <token>
```

---

## Images

### Upload Image

**POST** `/images`

Upload an image for a post.

**Headers:**

```
Authorization: Bearer <token> // optional
Content-Type: multipart/form-data
```

**Form Data:**

- `image` - Image file (max 5MB, images only)
- `postId` - Post ID
- `isPrimary` - "true" or "false" (optional, default false)

**Example (JavaScript):**

```javascript
const formData = new FormData();
formData.append("image", fileInput.files[0]);
formData.append("postId", "d0e9ddd1-b3da-4fd9-9f73-48cbf4d231ff");
formData.append("isPrimary", "true");

fetch("/api/images", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});
```

**Response (201):**

```json
{
  "id": "abc123",
  "postId": "d0e9ddd1-b3da-4fd9-9f73-48cbf4d231ff",
  "url": "https://supabase-storage-url/image.jpg",
  "isPrimary": true
}
```

---

### Get Images for Post

**GET** `/images/post/:postId`

Get all images for a specific post (ordered by primary first).

---

### Set Primary Image

**PATCH** `/images/:id/primary`

Mark an image as the primary/main image for a post.

---

### Delete Image

**DELETE** `/images/:id`

Delete an image from storage and database.

---

## Users

### Get User Profile

**GET** `/users/:username`

Get user profile and their posts.

**Response (200):**

```json
{
  "username": "john_doe",
  "name": "John Doe",
  "email": "john@example.com",
  "contactNumber": "+1234567890",
  "createdAt": "2026-02-14T19:04:28.004Z",
  "isGuest": false,
  "Post": [...]
}
```

---

### Get User's Posts

**GET** `/users/:username/posts`

Get all posts by a specific user.

**Query Parameters:**

- `resolved` - Filter: `true` or `false`

**Example:**

```
GET /users/john_doe/posts?resolved=false
```

---

### Update User Profile

**PUT** `/users/:username`

Update your own profile.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "New Name",
  "email": "newemail@example.com",
  "contactNumber": "+1234567890"
}
```

---

### Change Password

**PUT** `/users/:username/password`

Change your password.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewSecurePass456"
}
```

---

### Delete Account

**DELETE** `/users/:username`

Delete your account and all associated data.

**Headers:**

```
Authorization: Bearer <token>
```

---

## Error Handling

### Standard Error Response

```json
{
  "error": "Error message here"
}
```

### Validation Error Response

```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate email/username)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Rate Limiting

**Guest User Creation:** 3 per IP per 15 minutes  
**Authentication:** 10 requests per IP per 15 minutes  
**General API:** 100 requests per IP per minute

When rate limited:

```json
{
  "error": "Too many requests. Please try again later."
}
```

---

## Authentication Flow

```
1. User Registration/Login → Receive JWT token
2. Store token securely (localStorage/sessionStorage)
3. Include in all authenticated requests:
   Authorization: Bearer <token>
4. Token expires → User must login again
5. Guest tokens expire in 24h, user tokens in 7 days
```

---

## Dates & Timestamps

All dates are in ISO 8601 format with UTC timezone:

```
2026-02-14T19:04:35.434Z
```

Convert to local timezone on frontend as needed.

---

## Best Practices

1. **Always validate user input** before sending to API
2. **Handle errors gracefully** - show user-friendly messages
3. **Store JWT securely** - never expose in URLs
4. **Show loading states** during API calls
5. **Implement retry logic** for failed requests
6. **Cache verification codes** locally if needed
7. **Confirm before deleting** posts/comments
8. **Sanitize user-generated content** before displaying

---

## Example: Complete Post Creation Flow

```javascript
// 1. User fills form and uploads image
const createPost = async (formData) => {
  // Create post
  const postResponse = await fetch('/api/posts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      authorUsername: currentUser.username,
      postType: 'lost',
      title: 'Lost Golden Retriever',
      description: '...',
      location: 'Central Park',
      lostFoundDate: new Date().toISOString()
    })
  });

  const post = await postResponse.json();

  // IMPORTANT: Save verification code if it's a lost pet
  if (post.verificationCode) {
    alert(`SAVE THIS CODE: ${post.verificationCode}`);
    // Store locally or show prominently to user
  }

  // Upload image
  const imageFormData = new FormData();
  imageFormData.append('image', imageFile);
  imageFormData.append('postId', post.id);
  imageFormData.append('isPrimary', 'true');

  await fetch('/api/images', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: imageFormData
  });

  return post;
};


**Last Updated:** February 14, 2026
```
