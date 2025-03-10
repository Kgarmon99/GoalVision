# 2025 Goals Tracking Platform API Documentation

This document provides comprehensive information about the REST API endpoints available in the 2025 Goals Tracking Platform. It covers request parameters, response formats, error codes, and authentication requirements.

## API Overview

The 2025 Goals Tracking Platform API is a RESTful API that allows you to interact with the platform's data programmatically. The API uses standard HTTP methods (GET, POST, PATCH, DELETE) and returns responses in JSON format.

### Base URL

All API endpoints are relative to the base URL of your deployment. For local development, this is typically:

```
http://localhost:5000
```

### API Conventions

- All endpoints return HTTP status codes indicating success or failure
- Success responses include the requested data in JSON format
- Error responses include an error message and appropriate HTTP status code
- All requests and responses are in JSON format
- Dates are represented in ISO 8601 format (e.g., "2025-12-31")

### Authentication

Currently, the API does not require authentication. Future versions may implement authentication mechanisms as needed.

## Endpoints

### Goals

#### Get All Goals

Retrieves a list of all goals.

**Endpoint:**
```
GET /api/goals
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Revenue Goal",
    "current": 25,
    "target": 100,
    "unit": "M",
    "color": "primary",
    "deadline": "2025-12-31"
  },
  {
    "id": 2,
    "name": "User Acquisition",
    "current": 75000,
    "target": 250000,
    "unit": "",
    "color": "blue",
    "deadline": "2025-06-30"
  }
]
```

**Status Codes:**
- 200: Success
- 500: Server error

#### Get Goal by ID

Retrieves a specific goal by its ID.

**Endpoint:**
```
GET /api/goals/:id
```

**Parameters:**
- `id`: The ID of the goal to retrieve

**Response:**
```json
{
  "id": 1,
  "name": "Revenue Goal",
  "current": 25,
  "target": 100,
  "unit": "M",
  "color": "primary",
  "deadline": "2025-12-31"
}
```

**Status Codes:**
- 200: Success
- 404: Goal not found
- 500: Server error

#### Create Goal

Creates a new goal.

**Endpoint:**
```
POST /api/goals
```

**Request Body:**
```json
{
  "name": "New Revenue Goal",
  "current": 0,
  "target": 150,
  "unit": "M",
  "color": "green",
  "deadline": "2025-12-31"
}
```

**Response:**
```json
{
  "id": 3,
  "name": "New Revenue Goal",
  "current": 0,
  "target": 150,
  "unit": "M",
  "color": "green",
  "deadline": "2025-12-31"
}
```

**Status Codes:**
- 201: Created
- 400: Invalid request body
- 500: Server error

#### Update Goal

Updates an existing goal.

**Endpoint:**
```
PATCH /api/goals/:id
```

**Parameters:**
- `id`: The ID of the goal to update

**Request Body:**
```json
{
  "current": 50,
  "color": "blue"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Revenue Goal",
  "current": 50,
  "target": 100,
  "unit": "M",
  "color": "blue",
  "deadline": "2025-12-31"
}
```

**Status Codes:**
- 200: Success
- 400: Invalid request body
- 404: Goal not found
- 500: Server error

#### Delete Goal

Deletes a goal.

**Endpoint:**
```
DELETE /api/goals/:id
```

**Parameters:**
- `id`: The ID of the goal to delete

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- 200: Success
- 404: Goal not found
- 500: Server error

### Metrics

#### Get All Metrics

Retrieves a list of all metrics.

**Endpoint:**
```
GET /api/metrics
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Annual Recurring Revenue",
    "value": "25M",
    "previousValue": "20M",
    "trend": 25,
    "trendDirection": "up",
    "category": "revenue"
  },
  {
    "id": 2,
    "name": "Customer Retention",
    "value": "85%",
    "previousValue": "82%",
    "trend": 3.66,
    "trendDirection": "up",
    "category": "growth"
  }
]
```

**Status Codes:**
- 200: Success
- 500: Server error

#### Get Metrics by Category

Retrieves metrics filtered by category.

**Endpoint:**
```
GET /api/metrics/category/:category
```

**Parameters:**
- `category`: The category to filter by (e.g., "revenue", "growth")

**Response:**
```json
[
  {
    "id": 1,
    "name": "Annual Recurring Revenue",
    "value": "25M",
    "previousValue": "20M",
    "trend": 25,
    "trendDirection": "up",
    "category": "revenue"
  },
  {
    "id": 3,
    "name": "Average Revenue Per User",
    "value": "$250",
    "previousValue": "$200",
    "trend": 25,
    "trendDirection": "up",
    "category": "revenue"
  }
]
```

**Status Codes:**
- 200: Success
- 500: Server error

#### Create Metric

Creates a new metric.

**Endpoint:**
```
POST /api/metrics
```

**Request Body:**
```json
{
  "name": "Customer Acquisition Cost",
  "value": "$50",
  "previousValue": "$65",
  "trend": -23.08,
  "trendDirection": "down",
  "category": "efficiency"
}
```

**Response:**
```json
{
  "id": 4,
  "name": "Customer Acquisition Cost",
  "value": "$50",
  "previousValue": "$65",
  "trend": -23.08,
  "trendDirection": "down",
  "category": "efficiency"
}
```

**Status Codes:**
- 201: Created
- 400: Invalid request body
- 500: Server error

#### Update Metric

Updates an existing metric.

**Endpoint:**
```
PATCH /api/metrics/:id
```

**Parameters:**
- `id`: The ID of the metric to update

**Request Body:**
```json
{
  "value": "$45",
  "previousValue": "$50",
  "trend": -10,
  "trendDirection": "down"
}
```

**Response:**
```json
{
  "id": 4,
  "name": "Customer Acquisition Cost",
  "value": "$45",
  "previousValue": "$50",
  "trend": -10,
  "trendDirection": "down",
  "category": "efficiency"
}
```

**Status Codes:**
- 200: Success
- 400: Invalid request body
- 404: Metric not found
- 500: Server error

### Goal Status

#### Get All Goal Statuses

Retrieves a list of all goal statuses.

**Endpoint:**
```
GET /api/goal-statuses
```

**Response:**
```json
[
  {
    "id": 1,
    "goalId": 1,
    "goalName": "Revenue Goal",
    "status": "on-track"
  },
  {
    "id": 2,
    "goalId": 2,
    "goalName": "User Acquisition",
    "status": "needs-attention"
  }
]
```

**Status Codes:**
- 200: Success
- 500: Server error

#### Update Goal Status

Updates an existing goal status.

**Endpoint:**
```
PATCH /api/goal-statuses/:id
```

**Parameters:**
- `id`: The ID of the goal status to update

**Request Body:**
```json
{
  "status": "off-track"
}
```

**Response:**
```json
{
  "id": 1,
  "goalId": 1,
  "goalName": "Revenue Goal",
  "status": "off-track"
}
```

**Status Codes:**
- 200: Success
- 400: Invalid request body
- 404: Goal status not found
- 500: Server error

#### Create Goal Status

Creates a new goal status.

**Endpoint:**
```
POST /api/goal-statuses
```

**Request Body:**
```json
{
  "goalId": 3,
  "goalName": "New Revenue Goal",
  "status": "on-track"
}
```

**Response:**
```json
{
  "id": 3,
  "goalId": 3,
  "goalName": "New Revenue Goal",
  "status": "on-track"
}
```

**Status Codes:**
- 201: Created
- 400: Invalid request body
- 500: Server error

### Tasks

#### Get All Tasks

Retrieves a list of all execution tasks.

**Endpoint:**
```
GET /api/tasks
```

**Response:**
```json
[
  {
    "id": 1,
    "task": "Launch revenue optimization campaign",
    "owner": "John Doe",
    "ownerAvatar": "/images/profiles/john-doe.png",
    "goalCategory": "Revenue Goal",
    "categoryColor": "primary",
    "dueDate": "2025-06-15",
    "status": "in-progress",
    "weekId": 24
  },
  {
    "id": 2,
    "task": "Complete user research survey",
    "owner": "Jane Smith",
    "ownerAvatar": "/images/profiles/jane-smith.png",
    "goalCategory": "User Acquisition",
    "categoryColor": "blue",
    "dueDate": "2025-06-10",
    "status": "done",
    "weekId": 24
  }
]
```

**Status Codes:**
- 200: Success
- 500: Server error

#### Get Tasks by Week

Retrieves execution tasks filtered by week.

**Endpoint:**
```
GET /api/tasks/week/:weekId
```

**Parameters:**
- `weekId`: The ID of the week to filter by

**Response:**
```json
[
  {
    "id": 1,
    "task": "Launch revenue optimization campaign",
    "owner": "John Doe",
    "ownerAvatar": "/images/profiles/john-doe.png",
    "goalCategory": "Revenue Goal",
    "categoryColor": "primary",
    "dueDate": "2025-06-15",
    "status": "in-progress",
    "weekId": 24
  },
  {
    "id": 2,
    "task": "Complete user research survey",
    "owner": "Jane Smith",
    "ownerAvatar": "/images/profiles/jane-smith.png",
    "goalCategory": "User Acquisition",
    "categoryColor": "blue",
    "dueDate": "2025-06-10",
    "status": "done",
    "weekId": 24
  }
]
```

**Status Codes:**
- 200: Success
- 500: Server error

#### Get Task by ID

Retrieves a specific task by its ID.

**Endpoint:**
```
GET /api/tasks/:id
```

**Parameters:**
- `id`: The ID of the task to retrieve

**Response:**
```json
{
  "id": 1,
  "task": "Launch revenue optimization campaign",
  "owner": "John Doe",
  "ownerAvatar": "/images/profiles/john-doe.png",
  "goalCategory": "Revenue Goal",
  "categoryColor": "primary",
  "dueDate": "2025-06-15",
  "status": "in-progress",
  "weekId": 24
}
```

**Status Codes:**
- 200: Success
- 404: Task not found
- 500: Server error

#### Create Task

Creates a new execution task.

**Endpoint:**
```
POST /api/tasks
```

**Request Body:**
```json
{
  "task": "Develop email marketing strategy",
  "owner": "Alex Johnson",
  "ownerAvatar": "/images/profiles/alex-johnson.png",
  "goalCategory": "Revenue Goal",
  "categoryColor": "primary",
  "dueDate": "2025-06-20",
  "status": "in-progress",
  "weekId": 24
}
```

**Response:**
```json
{
  "id": 3,
  "task": "Develop email marketing strategy",
  "owner": "Alex Johnson",
  "ownerAvatar": "/images/profiles/alex-johnson.png",
  "goalCategory": "Revenue Goal",
  "categoryColor": "primary",
  "dueDate": "2025-06-20",
  "status": "in-progress",
  "weekId": 24
}
```

**Status Codes:**
- 201: Created
- 400: Invalid request body
- 500: Server error

#### Update Task

Updates an existing execution task.

**Endpoint:**
```
PATCH /api/tasks/:id
```

**Parameters:**
- `id`: The ID of the task to update

**Request Body:**
```json
{
  "status": "done"
}
```

**Response:**
```json
{
  "id": 1,
  "task": "Launch revenue optimization campaign",
  "owner": "John Doe",
  "ownerAvatar": "/images/profiles/john-doe.png",
  "goalCategory": "Revenue Goal",
  "categoryColor": "primary",
  "dueDate": "2025-06-15",
  "status": "done",
  "weekId": 24
}
```

**Status Codes:**
- 200: Success
- 400: Invalid request body
- 404: Task not found
- 500: Server error

#### Delete Task

Deletes an execution task.

**Endpoint:**
```
DELETE /api/tasks/:id
```

**Parameters:**
- `id`: The ID of the task to delete

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- 200: Success
- 404: Task not found
- 500: Server error

### Subtasks

#### Get All Subtasks

Retrieves a list of all subtasks.

**Endpoint:**
```
GET /api/subtasks
```

**Response:**
```json
[
  {
    "id": 1,
    "parentTaskId": 1,
    "description": "Research competitors' pricing",
    "completed": true,
    "createdAt": "2025-06-01T12:00:00Z",
    "priority": "high"
  },
  {
    "id": 2,
    "parentTaskId": 1,
    "description": "Design new pricing page",
    "completed": false,
    "createdAt": "2025-06-02T12:00:00Z",
    "priority": "medium"
  }
]
```

**Status Codes:**
- 200: Success
- 500: Server error

#### Get Subtasks by Parent Task

Retrieves subtasks filtered by parent task.

**Endpoint:**
```
GET /api/subtasks/parent/:parentTaskId
```

**Parameters:**
- `parentTaskId`: The ID of the parent task to filter by

**Response:**
```json
[
  {
    "id": 1,
    "parentTaskId": 1,
    "description": "Research competitors' pricing",
    "completed": true,
    "createdAt": "2025-06-01T12:00:00Z",
    "priority": "high"
  },
  {
    "id": 2,
    "parentTaskId": 1,
    "description": "Design new pricing page",
    "completed": false,
    "createdAt": "2025-06-02T12:00:00Z",
    "priority": "medium"
  }
]
```

**Status Codes:**
- 200: Success
- 500: Server error

#### Get Subtask by ID

Retrieves a specific subtask by its ID.

**Endpoint:**
```
GET /api/subtasks/:id
```

**Parameters:**
- `id`: The ID of the subtask to retrieve

**Response:**
```json
{
  "id": 1,
  "parentTaskId": 1,
  "description": "Research competitors' pricing",
  "completed": true,
  "createdAt": "2025-06-01T12:00:00Z",
  "priority": "high"
}
```

**Status Codes:**
- 200: Success
- 404: Subtask not found
- 500: Server error

#### Create Subtask

Creates a new subtask.

**Endpoint:**
```
POST /api/subtasks
```

**Request Body:**
```json
{
  "parentTaskId": 1,
  "description": "Implement A/B testing for pricing page",
  "priority": "high"
}
```

**Response:**
```json
{
  "id": 3,
  "parentTaskId": 1,
  "description": "Implement A/B testing for pricing page",
  "completed": false,
  "createdAt": "2025-06-05T12:00:00Z",
  "priority": "high"
}
```

**Status Codes:**
- 201: Created
- 400: Invalid request body
- 500: Server error

#### Update Subtask

Updates an existing subtask.

**Endpoint:**
```
PATCH /api/subtasks/:id
```

**Parameters:**
- `id`: The ID of the subtask to update

**Request Body:**
```json
{
  "completed": true
}
```

**Response:**
```json
{
  "id": 2,
  "parentTaskId": 1,
  "description": "Design new pricing page",
  "completed": true,
  "createdAt": "2025-06-02T12:00:00Z",
  "priority": "medium"
}
```

**Status Codes:**
- 200: Success
- 400: Invalid request body
- 404: Subtask not found
- 500: Server error

#### Delete Subtask

Deletes a subtask.

**Endpoint:**
```
DELETE /api/subtasks/:id
```

**Parameters:**
- `id`: The ID of the subtask to delete

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- 200: Success
- 404: Subtask not found
- 500: Server error

### Weeks

#### Get All Weeks

Retrieves a list of all weeks.

**Endpoint:**
```
GET /api/weeks
```

**Response:**
```json
[
  {
    "id": 23,
    "number": 23,
    "dateRange": "June 3 - 9, 2025",
    "completionRate": 85.5
  },
  {
    "id": 24,
    "number": 24,
    "dateRange": "June 10 - 16, 2025",
    "completionRate": 42.0
  }
]
```

**Status Codes:**
- 200: Success
- 500: Server error

#### Get Week by ID

Retrieves a specific week by its ID.

**Endpoint:**
```
GET /api/weeks/:id
```

**Parameters:**
- `id`: The ID of the week to retrieve

**Response:**
```json
{
  "id": 24,
  "number": 24,
  "dateRange": "June 10 - 16, 2025",
  "completionRate": 42.0
}
```

**Status Codes:**
- 200: Success
- 404: Week not found
- 500: Server error

#### Create Week

Creates a new week.

**Endpoint:**
```
POST /api/weeks
```

**Request Body:**
```json
{
  "number": 25,
  "dateRange": "June 17 - 23, 2025"
}
```

**Response:**
```json
{
  "id": 25,
  "number": 25,
  "dateRange": "June 17 - 23, 2025",
  "completionRate": 0
}
```

**Status Codes:**
- 201: Created
- 400: Invalid request body
- 500: Server error

#### Update Week

Updates an existing week.

**Endpoint:**
```
PATCH /api/weeks/:id
```

**Parameters:**
- `id`: The ID of the week to update

**Request Body:**
```json
{
  "completionRate": 75.0
}
```

**Response:**
```json
{
  "id": 24,
  "number": 24,
  "dateRange": "June 10 - 16, 2025",
  "completionRate": 75.0
}
```

**Status Codes:**
- 200: Success
- 400: Invalid request body
- 404: Week not found
- 500: Server error

### Users

#### Get User by ID

Retrieves a specific user by their ID.

**Endpoint:**
```
GET /api/users/:id
```

**Parameters:**
- `id`: The ID of the user to retrieve

**Response:**
```json
{
  "id": 1,
  "username": "johndoe"
}
```

**Status Codes:**
- 200: Success
- 404: User not found
- 500: Server error

#### Create User

Creates a new user.

**Endpoint:**
```
POST /api/users
```

**Request Body:**
```json
{
  "username": "newuser",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "id": 2,
  "username": "newuser"
}
```

**Status Codes:**
- 201: Created
- 400: Invalid request body
- 409: Username already exists
- 500: Server error

## Error Handling

### Error Response Format

Error responses follow a consistent format:

```json
{
  "message": "Error message describing what went wrong"
}
```

### Common Error Codes

- 400: Bad Request - The request was invalid or cannot be served
- 404: Not Found - The requested resource does not exist
- 409: Conflict - The request conflicts with the current state of the server
- 500: Internal Server Error - An error occurred on the server

## Rate Limiting

Currently, the API does not implement rate limiting. Future versions may add rate limiting to prevent abuse.

## Versioning

The API does not currently use versioning. Future versions may implement API versioning using URL paths or headers.

## API Usage Examples

### Curl Examples

#### Get All Goals

```bash
curl -X GET http://localhost:5000/api/goals
```

#### Create a New Goal

```bash
curl -X POST http://localhost:5000/api/goals \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Revenue Goal",
    "current": 0,
    "target": 150,
    "unit": "M",
    "color": "green",
    "deadline": "2025-12-31"
  }'
```

#### Update Goal Progress

```bash
curl -X PATCH http://localhost:5000/api/goals/1 \
  -H "Content-Type: application/json" \
  -d '{
    "current": 50
  }'
```

### JavaScript Examples

#### Get All Goals

```javascript
fetch('http://localhost:5000/api/goals')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

#### Create a New Goal

```javascript
fetch('http://localhost:5000/api/goals', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: "New Revenue Goal",
    current: 0,
    target: 150,
    unit: "M",
    color: "green",
    deadline: "2025-12-31"
  }),
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

#### Update Goal Progress

```javascript
fetch('http://localhost:5000/api/goals/1', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    current: 50
  }),
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
```

## Best Practices

1. **Error Handling**: Always check response status codes and handle errors appropriately
2. **Validation**: Validate request data before sending it to the API
3. **Caching**: Consider implementing client-side caching for frequently accessed resources
4. **Batch Operations**: Use batch operations where available to reduce the number of API calls
5. **Request Optimization**: Only request the data you need

## Future API Enhancements

1. **Authentication and Authorization**: Implement JWT-based authentication
2. **Pagination**: Add pagination for endpoints returning large collections
3. **Sorting and Filtering**: Enhance filtering capabilities for complex queries
4. **Rate Limiting**: Implement rate limiting to prevent abuse
5. **API Versioning**: Add versioning to support backward compatibility
6. **Webhooks**: Add support for webhooks to enable event-driven architecture