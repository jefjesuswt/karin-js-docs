# Exception Handling

KarinJS provides a robust exception handling system that automatically catches errors and returns properly formatted HTTP responses to clients.

---

## Built-in Exceptions

KarinJS includes several built-in HTTP exception classes:

```typescript
import {
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from "@karin-js/core";
```

### HttpException (Base Class)

The base class for all HTTP exceptions:

```
throw new HttpException("Something went wrong", 400);

```

**Response:**

```json
{
  "statusCode": 400,
  "message": "Something went wrong"
}
```

### BadRequestException (400)

For invalid client requests:

```typescript
@Post("/users")
create(@Body() data: any) {
  if (!data.email) {
    throw new BadRequestException("Email is required");
  }
  return this.usersService.create(data);
}

```

**Response:**

```json
{
  "statusCode": 400,
  "message": "Email is required"
}
```

### UnauthorizedException (401)

For authentication failures:

```typescript
@Post("/login")
login(@Body() credentials: any) {
  const user = this.authService.validateUser(credentials);
  if (!user) {
    throw new UnauthorizedException("Invalid credentials");
  }
  return user;
}

```

**Response:**

```json
{
  "statusCode": 401,
  "message": "Invalid credentials"
}
```

### ForbiddenException (403)

For authorization failures:

```typescript
@Delete("/:id")
@UseGuards(AuthGuard)
delete(@Param("id") id: string, @Req() req: any) {
  if (req.user.role !== "admin") {
    throw new ForbiddenException("Only admins can delete users");
  }
  return this.usersService.delete(id);
}

```

**Response:**

```json
{
  "statusCode": 403,
  "message": "Only admins can delete users"
}
```

### NotFoundException (404)

For missing resources:

```typescript
@Get("/:id")
async findOne(@Param("id") id: string) {
  const user = await this.usersService.findById(id);
  if (!user) {
    throw new NotFoundException(`User with ID ${id} not found`);
  }
  return user;
}

```

**Response:**

```json
{
  "statusCode": 404,
  "message": "User with ID 123 not found"
}
```

### InternalServerErrorException (500)

For unexpected server errors:

```typescript
@Get("/")
async findAll() {
  try {
    return await this.usersService.findAll();
  } catch (error) {
    throw new InternalServerErrorException("Failed to fetch users");
  }
}

```

**Response:**

```json
{
  "statusCode": 500,
  "message": "Failed to fetch users"
}
```

---

## Exception with Objects

Exceptions can include structured data:

```typescript
throw new BadRequestException({
  message: "Validation failed",
  errors: [
    { field: "email", message: "Invalid email format" },
    { field: "age", message: "Must be at least 18" },
  ],
});
```

**Response:**

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" },
    { "field": "age", "message": "Must be at least 18" }
  ]
}
```

---

## Custom Exceptions

Create domain-specific exceptions:

```typescript
export class UserAlreadyExistsException extends HttpException {
  constructor(email: string) {
    super(
      {
        message: "User already exists",
        email,
      },
      409, // Conflict
    );
  }
}
```

**Usage:**

```typescript
@Post("/register")
async register(@Body() userData: CreateUserDto) {
  const existing = await this.usersService.findByEmail(userData.email);

  if (existing) {
    throw new UserAlreadyExistsException(userData.email);
  }

  return this.usersService.create(userData);
}

```

**Response:**

```json
{
  "statusCode": 409,
  "message": "User already exists",
  "email": "user@example.com"
}
```

### More Custom Exception Examples

```typescript
// Payment failures
export class PaymentFailedException extends HttpException {
  constructor(reason: string) {
    super({ message: "Payment failed", reason }, 402);
  }
}

// Resource conflicts
export class ResourceConflictException extends HttpException {
  constructor(resource: string) {
    super({ message: `${resource} conflict detected` }, 409);
  }
}

// Service unavailable
export class ServiceUnavailableException extends HttpException {
  constructor(service: string) {
    super({ message: `${service} is currently unavailable` }, 503);
  }
}
```

---

## Exception Handling in Services

Handle exceptions in service layer:

```typescript
import { injectable } from "@karin-js/core";
import { NotFoundException, BadRequestException } from "@karin-js/core";

@injectable()
export class UsersService {
  private users = [
    { id: 1, email: "alice@example.com" },
    { id: 2, email: "bob@example.com" },
  ];

  findAll() {
    return this.users;
  }

  findById(id: number) {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  create(userData: { email: string }) {
    const existing = this.users.find((u) => u.email === userData.email);
    if (existing) {
      throw new BadRequestException("Email already in use");
    }

    const newUser = { id: this.users.length + 1, ...userData };
    this.users.push(newUser);
    return newUser;
  }

  delete(id: number) {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return this.users.splice(index, 1)[0];
  }
}
```

**Controller stays clean:**

```typescript
@Controller("/users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get("/")
  findAll() {
    return this.usersService.findAll();
  }

  @Get("/:id")
  findOne(@Param("id") id: string) {
    return this.usersService.findById(parseInt(id));
  }

  @Post("/")
  create(@Body() userData: any) {
    return this.usersService.create(userData);
  }

  @Delete("/:id")
  delete(@Param("id") id: string) {
    return this.usersService.delete(parseInt(id));
  }
}
```

---

## Validation Pipe Exceptions

`ZodValidationPipe` automatically throws `BadRequestException` with validation details:

```typescript
import { z } from "zod";
import { ZodValidationPipe } from "@karin-js/core";

const CreateUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  age: z.number().min(18)
});

@Post("/users")
create(
  @Body(new ZodValidationPipe(CreateUserSchema)) body: CreateUserDto
) {
  // If validation fails, ZodValidationPipe throws BadRequestException
  return this.usersService.create(body);
}

```

**Invalid request:**

```bash
POST /users
{
  "name": "Jo",
  "email": "invalid-email",
  "age": 15
}

```

**Automatic response:**

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "String must contain at least 3 character(s)",
      "code": "too_small"
    },
    {
      "field": "email",
      "message": "Invalid email",
      "code": "invalid_string"
    },
    {
      "field": "age",
      "message": "Number must be greater than or equal to 18",
      "code": "too_small"
    }
  ]
}
```

---

## Exception Handling in Guards

Guards should throw exceptions for clear error messages:

```typescript
import { injectable } from "@karin-js/core";
import type { CanActivate } from "@karin-js/core";
import { UnauthorizedException, ForbiddenException } from "@karin-js/core";

@injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: any): Promise<boolean> {
    const token = this.extractToken(context);

    if (!token) {
      throw new UnauthorizedException("Authentication token required");
    }

    try {
      const payload = await this.verifyToken(token);
      context.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }

  // ... helper methods
}
```

---

## Error Response Format

All exceptions follow a consistent format:

### Simple String Message

```typescript
throw new NotFoundException("User not found");
```

**Response:**

```json
{
  "statusCode": 404,
  "message": "User not found"
}
```

### Object with Additional Data

```typescript
throw new BadRequestException({
  message: "Validation failed",
  timestamp: new Date().toISOString(),
  path: "/api/users",
});
```

**Response:**

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/users"
}
```

---

## Try-Catch Pattern

Handle exceptions explicitly when needed:

```typescript
@Post("/process")
async process(@Body() data: any) {
  try {
    const result = await this.processData(data);
    return { success: true, result };
  } catch (error: any) {
    if (error.code === "ECONNREFUSED") {
      throw new ServiceUnavailableException("Database");
    }
    if (error.code === "DUPLICATE_KEY") {
      throw new BadRequestException("Record already exists");
    }
    // Re-throw unknown errors
    throw new InternalServerErrorException("Processing failed");
  }
}

```

---

## Async Exception Handling

Async handlers automatically catch and format exceptions:

```typescript
@Get("/:id")
async findOne(@Param("id") id: string) {
  // Any thrown exception is caught and formatted
  const user = await this.usersService.findById(id);

  if (!user) {
    throw new NotFoundException("User not found");
  }

  return user;
}

```

---

## Best Practices

### 1\. Use Specific Exception Types

```typescript
// ✅ Good: Specific exception
throw new NotFoundException("User not found");

// ❌ Bad: Generic exception
throw new HttpException("Not found", 404);
```

### 2\. Include Helpful Context

```typescript
// ✅ Good: Detailed message
throw new NotFoundException(`Product with SKU ${sku} not found`);

// ❌ Bad: Vague message
throw new NotFoundException("Not found");
```

### 3\. Handle Errors in Services

```typescript
// ✅ Good: Service handles errors
@injectable()
export class UsersService {
  findById(id: number) {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }
}

// ❌ Bad: Controller handles errors
@Get("/:id")
findOne(@Param("id") id: string) {
  const user = this.usersService.findById(parseInt(id));
  if (!user) {
    throw new NotFoundException("User not found");
  }
  return user;
}

```

### 4\. Don't Expose Sensitive Information

```typescript
// ✅ Good: Generic production error
if (process.env.NODE_ENV === "production") {
  throw new InternalServerErrorException("An error occurred");
} else {
  throw new InternalServerErrorException(error.message);
}

// ❌ Bad: Exposing stack traces
throw new InternalServerErrorException(error.stack);
```

### 5\. Use Structured Errors for Validation

```typescript
// ✅ Good: Structured validation errors
throw new BadRequestException({
  message: "Validation failed",
  errors: validationErrors,
});

// ❌ Bad: Concatenated error string
throw new BadRequestException(
  "Validation failed: " + validationErrors.join(", "),
);
```

---

## Development vs Production

Handle errors differently based on environment:

```typescript
@Get("/")
async findAll() {
  try {
    return await this.usersService.findAll();
  } catch (error: any) {
    const isDev = process.env.NODE_ENV !== "production";

    if (isDev) {
      // Show detailed errors in development
      throw new InternalServerErrorException({
        message: "Failed to fetch users",
        error: error.message,
        stack: error.stack
      });
    }

    // Generic error in production
    throw new InternalServerErrorException("Failed to fetch users");
  }
}

```

---

## Common Exception Patterns

### Resource Not Found

```typescript
@Get("/:id")
async findOne(@Param("id") id: string) {
  const resource = await this.service.findById(id);
  if (!resource) {
    throw new NotFoundException(`Resource ${id} not found`);
  }
  return resource;
}

```

### Duplicate Resource

```typescript
@Post("/")
async create(@Body() data: any) {
  const existing = await this.service.findByEmail(data.email);
  if (existing) {
    throw new BadRequestException("Email already exists");
  }
  return this.service.create(data);
}

```

### Unauthorized Access

```typescript
@Get("/profile")
@UseGuards(AuthGuard)
getProfile(@Req() req: any) {
  if (!req.user) {
    throw new UnauthorizedException("Authentication required");
  }
  return req.user;
}

```

### Forbidden Action

```typescript
@Delete("/:id")
delete(@Param("id") id: string, @Req() req: any) {
  if (req.user.id !== parseInt(id) && req.user.role !== "admin") {
    throw new ForbiddenException("Cannot delete other users");
  }
  return this.service.delete(id);
}

```

---

## Testing Exception Handling

```typescript
import { describe, it, expect } from "bun:test";
import { UsersService } from "./users.service";
import { NotFoundException } from "@karin-js/core";

describe("UsersService", () => {
  it("should throw NotFoundException for invalid ID", () => {
    const service = new UsersService();

    expect(() => service.findById(999)).toThrow(NotFoundException);
  });

  it("should throw BadRequestException for duplicate email", () => {
    const service = new UsersService();
    service.create({ email: "test@example.com" });

    expect(() => service.create({ email: "test@example.com" })).toThrow(
      BadRequestException,
    );
  });
});
```

---

## Next Steps

- [Controllers](/controllers) - Handle exceptions in routes
- [Validation](/pipes) - Validations

---

## Summary

Exception handling in KarinJS:

- Uses built-in HTTP exception classes for common scenarios
- Automatically formats error responses with consistent structure
- Supports both string messages and structured error objects
- Should be handled primarily in services, not controllers
- Can be customized for domain-specific errors
- Works seamlessly with validation pipes and guards
- Should expose minimal information in production environments
