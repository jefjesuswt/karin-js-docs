# Controllers

Controllers are responsible for handling incoming HTTP requests and returning responses to the client. In KarinJS, controllers are classes decorated with `@Controller()` that define route handlers using method decorators.

---

## Basic Controller

A controller is simply a class with the `@Controller()` decorator:

```typescript
import { Controller, Get } from "@karin-js/core";

@Controller("/cats")
export class CatsController {
  @Get("/")
  findAll() {
    return { data: ["British Shorthair", "Persian", "Maine Coon"] };
  }
}
```

The `@Controller("/cats")` decorator:

- Marks the class as a controller
- Sets `/cats` as the base path for all routes in this controller
- Automatically registers the controller with dependency injection

---

## HTTP Method Decorators

KarinJS provides decorators for all standard HTTP methods:

```typescript
import { Controller, Get, Post, Put, Patch, Delete } from "@karin-js/core";

@Controller("/products")
export class ProductsController {
  @Get("/")
  findAll() {
    return { message: "GET /products" };
  }

  @Post("/")
  create() {
    return { message: "POST /products" };
  }

  @Put("/:id")
  update() {
    return { message: "PUT /products/:id" };
  }

  @Patch("/:id")
  partialUpdate() {
    return { message: "PATCH /products/:id" };
  }

  @Delete("/:id")
  remove() {
    return { message: "DELETE /products/:id" };
  }
}
```

---

## Route Parameters

### URL Parameters

Extract dynamic values from the URL path using `@Param()`:

```typescript
@Controller("/users")
export class UsersController {
  @Get("/:id")
  findOne(@Param("id") id: string) {
    return { userId: id };
  }

  @Get("/:userId/posts/:postId")
  findUserPost(
    @Param("userId") userId: string,
    @Param("postId") postId: string,
  ) {
    return { userId, postId };
  }
}
```

**Access all params at once:**

```typescript
@Get("/:id")
findOne(@Param() params: Record<string, string>) {
  return { id: params.id };
}

```

### Query Parameters

Extract query string values using `@Query()`:

```typescript
@Controller("/search")
export class SearchController {
  @Get("/")
  search(@Query("q") query: string, @Query("limit") limit: string) {
    return {
      query,
      limit: parseInt(limit || "10"),
    };
  }
}
```

**Example request:** `GET /search?q=typescript&limit=20`

**Access all query params:**

```typescript
@Get("/")
search(@Query() query: Record<string, string>) {
  return { query };
}

```

### Request Body

Extract the request body using `@Body()`:

```typescript
@Controller("/posts")
export class PostsController {
  @Post("/")
  create(@Body() createPostDto: any) {
    return {
      message: "Post created",
      data: createPostDto,
    };
  }

  // Extract specific field
  @Post("/partial")
  createPartial(@Body("title") title: string) {
    return { title };
  }
}
```

### Headers

Extract request headers using `@Headers()`:

```typescript
@Controller("/auth")
export class AuthController {
  @Get("/me")
  getCurrentUser(
    @Headers("authorization") token: string,
    @Headers("user-agent") userAgent: string,
  ) {
    return { token, userAgent };
  }

  // Access all headers
  @Get("/headers")
  getAllHeaders(@Headers() headers: Record<string, string>) {
    return { headers };
  }
}
```

---

## Advanced Routing

### Nested Paths

Create deep route hierarchies:

```typescript
@Controller("/api/v1/users")
export class UsersV1Controller {
  @Get("/:userId/orders/:orderId/items")
  getOrderItems(
    @Param("userId") userId: string,
    @Param("orderId") orderId: string,
  ) {
    return { userId, orderId };
  }
}
```

**Result:** `GET /api/v1/users/123/orders/456/items`

### Root Path Controller

Omit the path to create a root controller:

```typescript
@Controller("/")
export class RootController {
  @Get("/")
  root() {
    return { message: "Welcome!" };
  }

  @Get("/health")
  health() {
    return { status: "ok" };
  }
}
```

### Wildcard Routes

Use wildcards for flexible routing:

```typescript
@Controller("/files")
export class FilesController {
  @Get("/*")
  serveFile(@Param("*") path: string) {
    return { path };
  }
}
```

**Note:** Wildcard support depends on your adapter (H3/Hono).

---

## Request and Response Objects

Access the raw request and response objects when needed:

```typescript
import { Controller, Get, Req, Res } from "@karin-js/core";

@Controller("/raw")
export class RawController {
  @Get("/")
  handle(@Req() request: Request, @Res() response: any) {
    console.log(request.method, request.url);
    return { message: "Check console" };
  }
}
```

**Warning:** Using raw objects couples your code to the specific adapter. Prefer using decorators like `@Body()`, `@Query()`, etc. for portability.

---

## Combining Decorators

You can combine multiple parameter decorators in a single handler:

```typescript
@Controller("/posts")
export class PostsController {
  @Get("/")
  findAll(
    @Query("page") page: string,
    @Query("limit") limit: string,
    @Headers("authorization") auth: string,
  ) {
    return {
      page: parseInt(page || "1"),
      limit: parseInt(limit || "10"),
      authenticated: !!auth,
    };
  }

  @Post("/:id/comments")
  createComment(
    @Param("id") postId: string,
    @Body() comment: any,
    @Headers("user-agent") userAgent: string,
  ) {
    return { postId, comment, userAgent };
  }
}
```

---

## Response Types

KarinJS automatically handles different response types:

### JSON Response (default)

```typescript
@Get("/json")
getJson() {
  return { message: "This is JSON" };
}

```

**Response:**

```json
{ "message": "This is JSON" }
```

### String Response

```typescript
@Get("/text")
getText() {
  return "Plain text response";
}

```

### Custom Status Codes

For custom status codes, return a `Response` object:

```typescript
@Post("/")
create(@Body() data: any) {
  return new Response(
    JSON.stringify({ id: 1, ...data }),
    {
      status: 201,
      headers: { "Content-Type": "application/json" }
    }
  );
}

```

### No Content (204)

```typescript
@Delete("/:id")
remove(@Param("id") id: string) {
  // Perform deletion...
  return null; // or undefined
}

```

---

## Controller Organization

### Feature-Based Structure

Organize controllers by feature:

```
src/
├── users/
│   ├── users.controller.ts
│   └── users.service.ts
├── posts/
│   ├── posts.controller.ts
│   └── posts.service.ts
└── comments/
    ├── comments.controller.ts
    └── comments.service.ts

```

### Naming Conventions

Follow these conventions for consistency:

- **Files:** `*.controller.ts` (e.g., `users.controller.ts`)
- **Classes:** `PascalCase` with `Controller` suffix (e.g., `UsersController`)
- **Methods:** `camelCase` describing the action (e.g., `findAll`, `create`, `update`)

---

## Best Practices

### 1\. Keep Controllers Thin

Controllers should delegate business logic to services:

```typescript
// ❌ Bad: Business logic in controller
@Controller("/orders")
export class OrdersController {
  @Post("/")
  async create(@Body() data: any) {
    const order = await database.orders.create(data);
    await emailService.sendConfirmation(order);
    await analyticsService.track("order_created");
    return order;
  }
}

// ✅ Good: Delegate to service
@Controller("/orders")
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post("/")
  create(@Body() data: any) {
    return this.ordersService.create(data);
  }
}
```

### 2\. Use DTOs for Type Safety

Define Data Transfer Objects for request/response shapes:

```typescript
import { Controller, Post, Body } from "@karin-js/core";
import type { CreateUserDto } from "./dtos/create-user.dto";

@Controller("/users")
export class UsersController {
  @Post("/")
  create(@Body() createUserDto: CreateUserDto) {
    return createUserDto;
  }
}
```

### 3\. Handle Errors Gracefully

Use exception handling (covered in [Exceptions](https://claude.ai/chat/exceptions.md)):

```typescript
import { Controller, Get, Param, NotFoundException } from "@karin-js/core";

@Controller("/users")
export class UsersController {
  @Get("/:id")
  findOne(@Param("id") id: string) {
    const user = this.findUserById(id);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }
}
```

### 4\. Document Your Routes

Add JSDoc comments for better developer experience:

```typescript
@Controller("/posts")
export class PostsController {
  /**
   * Retrieve all posts with pagination
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   */
  @Get("/")
  findAll(@Query("page") page?: string, @Query("limit") limit?: string) {
    // ...
  }
}
```

---

## Next Steps

- [Services & Dependency Injection](https://claude.ai/chat/services.md) - Extract business logic
- [Validation with Pipes](https://claude.ai/chat/validation.md) - Validate incoming data
- [Guards](https://claude.ai/chat/guards.md) - Protect routes
- [Exception Handling](https://claude.ai/chat/exceptions.md) - Handle errors

---

## Summary

Controllers in KarinJS:

- Are classes decorated with `@Controller(path)`
- Define routes using `@Get()`, `@Post()`, etc.
- Extract data using `@Param()`, `@Query()`, `@Body()`, `@Headers()`
- Should remain thin and delegate logic to services
- Are automatically discovered when using `scan` in `KarinFactory.create()`
