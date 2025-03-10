# 2025 Goals Tracking Platform API Documentation

This document provides comprehensive information about the REST API endpoints available in the 2025 Goals Tracking Platform. The API allows you to programmatically interact with goals, metrics, tasks, and other data entities.

## Base URL

All API URLs referenced in this documentation have the base path:

```
/api
```

## Authentication

Currently, the API does not implement authentication. In production environments, it is highly recommended to implement proper authentication and authorization.

## Response Format

All API responses are returned in JSON format. Successful responses typically include the requested data, while error responses include an error message.

### Success Response Format

```json
{
  "data": [Object or Array of objects]
}
```

### Error Response Format

```json
{
  "message": "Error message describing what went wrong"
}
```

## Error Codes

- `400 Bad Request`: The request was malformed or contained invalid data
- `404 Not Found`: The requested resource doesn't exist
- `500 Internal Server Error`: Something went wrong on the server

## API Endpoints

### Goals API

#### Get All Goals

Retrieves all goals from the system.

- **URL:** `/goals`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:**
  ```json
  [
    {
      "id": 1,
      "name": "Revenue Goal",
      "current": 20.5,
      "target": 100,
      "unit": "M",
      "color": "primary",
      "deadline": "2025-12-31"
    },
    // ... more goals
  ]
  ```

#### Get Goal by ID

Retrieves a specific goal by its ID.

- **URL:** `/goals/:id`
- **Method:** `GET`
- **URL Parameters:** `id=[integer]` where `id` is the goal's unique identifier
- **Success Response:**
  - **Code:** 200
  - **Content:**
  ```json
  {
    "id": 1,
    "name": "Revenue Goal",
    "current": 20.5,
    "target": 100,
    "unit": "M",
    "color": "primary",
    "deadline": "2025-12-31"
  }
  ```
- **Error Response:**
  - **Code:** 404
  - **Content:** `{ "message": "Goal not found" }`

#### Create Goal

Creates a new goal.

- **URL:** `/goals`
- **Method:** `POST`
- **Data Parameters:**
  ```json
  {
    "name": "New Goal",
    "current": 0,
    "target": 50,
    "unit": "K",
    "color": "blue",
    "deadline": "2025-06-30"
  }
  ```
- **Success Response:**
  - **Code:** 201
  - **Content:** The created goal object
  ```json
  {
    "id": 5,
    "name": "New Goal",
    "current": 0,
    "target": 50,
    "unit": "K",
    "color": "blue",
    "deadline": "2025-06-30"
  }
  ```
- **Error Response:**
  - **Code:** 400
  - **Content:** `{ "message": "Invalid goal data", "errors": [...] }`

#### Update Goal

Updates an existing goal.

- **URL:** `/goals/:id`
- **Method:** `PATCH`
- **URL Parameters:** `id=[integer]` where `id` is the goal's unique identifier
- **Data Parameters:** Any goal properties to update
  ```json
  {
    "current": 25.5,
    "color": "green"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** The updated goal object
  ```json
  {
    "id": 1,
    "name": "Revenue Goal",
    "current": 25.5,
    "target": 100,
    "unit": "M",
    "color": "green",
    "deadline": "2025-12-31"
  }
  ```
- **Error Response:**
  - **Code:** 404
  - **Content:** `{ "message": "Goal not found" }`

#### Delete Goal

Deletes a goal.

- **URL:** `/goals/:id`
- **Method:** `DELETE`
- **URL Parameters:** `id=[integer]` where `id` is the goal's unique identifier
- **Success Response:**
  - **Code:** 204
  - **Content:** No content
- **Error Response:**
  - **Code:** 404
  - **Content:** `{ "message": "Goal not found" }`

### Metrics API

#### Get All Metrics

Retrieves all metrics from the system.

- **URL:** `/metrics`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:**
  ```json
  [
    {
      "id": 1,
      "name": "Monthly Active Users",
      "value": "2.5M",
      "previousValue": "2.3M",
      "trend": 8.7,
      "trendDirection": "up",
      "category": "growth"
    },
    // ... more metrics
  ]
  ```

#### Get Metrics by Category

Retrieves metrics filtered by category.

- **URL:** `/metrics/category/:category`
- **Method:** `GET`
- **URL Parameters:** `category=[string]` where `category` is "growth", "revenue", etc.
- **Success Response:**
  - **Code:** 200
  - **Content:**
  ```json
  [
    {
      "id": 1,
      "name": "Monthly Active Users",
      "value": "2.5M",
      "previousValue": "2.3M",
      "trend": 8.7,
      "trendDirection": "up",
      "category": "growth"
    },
    // ... more metrics in the same category
  ]
  ```

#### Create Metric

Creates a new metric.

- **URL:** `/metrics`
- **Method:** `POST`
- **Data Parameters:**
  ```json
  {
    "name": "New Metric",
    "value": "75%",
    "previousValue": "65%",
    "trend": 15.4,
    "trendDirection": "up",
    "category": "engagement"
  }
  ```
- **Success Response:**
  - **Code:** 201
  - **Content:** The created metric object

#### Update Metric

Updates an existing metric.

- **URL:** `/metrics/:id`
- **Method:** `PATCH`
- **URL Parameters:** `id=[integer]` where `id` is the metric's unique identifier
- **Data Parameters:** Any metric properties to update
  ```json
  {
    "value": "80%",
    "previousValue": "75%",
    "trend": 6.7
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** The updated metric object

#### Refresh Metrics

Refreshes metrics based on goal data.

- **URL:** `/metrics/refresh`
- **Method:** `POST`
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "message": "Metrics updated successfully" }`

### Goal Status API

#### Get All Goal Statuses

Retrieves all goal statuses from the system.

- **URL:** `/goal-statuses`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:**
  ```json
  [
    {
      "id": 1,
      "goalId": 1,
      "goalName": "Revenue Goal",
      "status": "on-track"
    },
    // ... more goal statuses
  ]
  ```

#### Create Goal Status

Creates a new goal status.

- **URL:** `/goal-statuses`
- **Method:** `POST`
- **Data Parameters:**
  ```json
  {
    "goalId": 2,
    "goalName": "User Growth",
    "status": "needs-attention"
  }
  ```
- **Success Response:**
  - **Code:** 201
  - **Content:** The created goal status object

#### Update Goal Status

Updates an existing goal status.

- **URL:** `/goal-statuses/:id`
- **Method:** `PATCH`
- **URL Parameters:** `id=[integer]` where `id` is the goal status's unique identifier
- **Data Parameters:** Any goal status properties to update
  ```json
  {
    "status": "on-track"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** The updated goal status object

### Tasks API

#### Get All Tasks

Retrieves all tasks from the system.

- **URL:** `/tasks`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:**
  ```json
  [
    {
      "id": 1,
      "task": "Launch marketing campaign",
      "owner": "Jane Smith",
      "ownerAvatar": "",
      "goalCategory": "Revenue",
      "categoryColor": "blue",
      "dueDate": "2025-04-15",
      "status": "in-progress",
      "weekId": 15
    },
    // ... more tasks
  ]
  ```

#### Get Task by ID

Retrieves a specific task by its ID.

- **URL:** `/tasks/:id`
- **Method:** `GET`
- **URL Parameters:** `id=[integer]` where `id` is the task's unique identifier
- **Success Response:**
  - **Code:** 200
  - **Content:** The requested task object
- **Error Response:**
  - **Code:** 404
  - **Content:** `{ "message": "Task not found" }`

#### Get Tasks by Week

Retrieves tasks for a specific week.

- **URL:** `/tasks/week/:weekId`
- **Method:** `GET`
- **URL Parameters:** `weekId=[integer]` where `weekId` is the week's unique identifier
- **Success Response:**
  - **Code:** 200
  - **Content:** Array of tasks for the specified week

#### Get Tasks for Default Week

Retrieves tasks for the first week (default).

- **URL:** `/tasks/week`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:** Array of tasks for the first week
- **Error Response:**
  - **Code:** 404
  - **Content:** `{ "message": "No weeks found" }`

#### Create Task

Creates a new task.

- **URL:** `/tasks`
- **Method:** `POST`
- **Data Parameters:**
  ```json
  {
    "task": "New task description",
    "owner": "John Doe",
    "ownerAvatar": "",
    "goalCategory": "User Growth",
    "categoryColor": "green",
    "dueDate": "2025-05-20",
    "status": "in-progress",
    "weekId": 20
  }
  ```
- **Success Response:**
  - **Code:** 201
  - **Content:** The created task object

#### Update Task

Updates an existing task.

- **URL:** `/tasks/:id`
- **Method:** `PATCH`
- **URL Parameters:** `id=[integer]` where `id` is the task's unique identifier
- **Data Parameters:** Any task properties to update
  ```json
  {
    "status": "done"
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** The updated task object
- **Error Response:**
  - **Code:** 404
  - **Content:** `{ "message": "Task not found" }`

#### Delete Task

Deletes a task.

- **URL:** `/tasks/:id`
- **Method:** `DELETE`
- **URL Parameters:** `id=[integer]` where `id` is the task's unique identifier
- **Success Response:**
  - **Code:** 204
  - **Content:** No content
- **Error Response:**
  - **Code:** 404
  - **Content:** `{ "message": "Task not found" }`

### Subtasks API

#### Get Subtasks by Parent Task ID

Retrieves all subtasks for a specific parent task.

- **URL:** `/subtasks/parent/:parentId`
- **Method:** `GET`
- **URL Parameters:** `parentId=[integer]` where `parentId` is the parent task's unique identifier
- **Success Response:**
  - **Code:** 200
  - **Content:**
  ```json
  [
    {
      "id": 1,
      "parentTaskId": 1,
      "description": "Create marketing materials",
      "completed": true,
      "createdAt": "2025-03-10T14:30:00Z",
      "priority": "high"
    },
    // ... more subtasks
  ]
  ```

#### Create Subtask

Creates a new subtask.

- **URL:** `/subtasks`
- **Method:** `POST`
- **Data Parameters:**
  ```json
  {
    "parentTaskId": 1,
    "description": "Research competitors",
    "completed": false,
    "priority": "medium"
  }
  ```
- **Success Response:**
  - **Code:** 201
  - **Content:** The created subtask object

#### Update Subtask

Updates an existing subtask.

- **URL:** `/subtasks/:id`
- **Method:** `PATCH`
- **URL Parameters:** `id=[integer]` where `id` is the subtask's unique identifier
- **Data Parameters:** Any subtask properties to update
  ```json
  {
    "completed": true
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** The updated subtask object
- **Error Response:**
  - **Code:** 404
  - **Content:** `{ "message": "Subtask not found" }`

#### Delete Subtask

Deletes a subtask.

- **URL:** `/subtasks/:id`
- **Method:** `DELETE`
- **URL Parameters:** `id=[integer]` where `id` is the subtask's unique identifier
- **Success Response:**
  - **Code:** 204
  - **Content:** No content
- **Error Response:**
  - **Code:** 404
  - **Content:** `{ "message": "Subtask not found" }`

### Weeks API

#### Get All Weeks

Retrieves all weeks from the system.

- **URL:** `/weeks`
- **Method:** `GET`
- **Success Response:**
  - **Code:** 200
  - **Content:**
  ```json
  [
    {
      "id": 1,
      "number": 12,
      "dateRange": "March 18 - March 24, 2025",
      "completionRate": 75.5
    },
    // ... more weeks
  ]
  ```

#### Get Week by ID

Retrieves a specific week by its ID.

- **URL:** `/weeks/:id`
- **Method:** `GET`
- **URL Parameters:** `id=[integer]` where `id` is the week's unique identifier
- **Success Response:**
  - **Code:** 200
  - **Content:** The requested week object
- **Error Response:**
  - **Code:** 404
  - **Content:** `{ "message": "Week not found" }`

#### Create Week

Creates a new week.

- **URL:** `/weeks`
- **Method:** `POST`
- **Data Parameters:**
  ```json
  {
    "number": 25,
    "dateRange": "June 16 - June 22, 2025",
    "completionRate": 0
  }
  ```
- **Success Response:**
  - **Code:** 201
  - **Content:** The created week object

#### Update Week

Updates an existing week.

- **URL:** `/weeks/:id`
- **Method:** `PATCH`
- **URL Parameters:** `id=[integer]` where `id` is the week's unique identifier
- **Data Parameters:** Any week properties to update
  ```json
  {
    "completionRate": 85.5
  }
  ```
- **Success Response:**
  - **Code:** 200
  - **Content:** The updated week object
- **Error Response:**
  - **Code:** 404
  - **Content:** `{ "message": "Week not found" }`

### Utility Endpoints

#### Reset Data

Clears all sample data from the system.

- **URL:** `/reset-data`
- **Method:** `POST`
- **Success Response:**
  - **Code:** 200
  - **Content:** `{ "message": "All sample data cleared successfully" }`

## Rate Limiting

Currently, the API does not implement rate limiting. In production environments, it is recommended to implement rate limiting to prevent abuse.

## Caching

The API implements server-side caching for frequently accessed endpoints, such as `/api/goals` and `/api/tasks`. Cached responses include an `X-Cache` header with the value `HIT` for cached responses or `MISS` for non-cached responses.

## Data Validation

All API endpoints validate incoming data using Zod schemas. Invalid data will result in a 400 Bad Request response with details about the validation errors.

## Webhook Support

Currently, the API does not support webhooks. Future versions may include webhook functionality for real-time notifications about data changes.

## Best Practices

- Use appropriate HTTP methods (GET, POST, PATCH, DELETE) for their intended purposes
- Include proper error handling in your client applications
- Consider implementing client-side caching to reduce API calls
- Use the `X-Cache` header to determine if a response is served from cache