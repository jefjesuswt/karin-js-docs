# Validation with Pipes

Pipes in KarinJS transform and validate input data before it reaches your route handlers. They're perfect for ensuring data integrity and providing clear error messages to clients.

---

## What are Pipes?

Pipes are classes that implement the `PipeTransform` interface. They can:

- **Transform** data (e.g., convert strings to numbers)
- **Validate** data (e.g., check email format)
- **Throw exceptions** when validation fails

Pipes run **before** the route handler executes, ensuring only valid data reaches your business logic.

---

## Built-in Pipes

### ZodValidationPipe

KarinJS includes a powerful validation pipe using [Zod](https://zod.dev/):

```typescript
import { Controller, Post, Body } from "@karin-js/core";
import { ZodValidationPipe } from "@karin-js/core";
import { z } from "zod";

// Define your schema
const CreateUserSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Must be a valid email"),
  age: z.number().min(18, "Must be at least 18 years old"),
});

type CreateUserDto = z.infer<typeof CreateUserSchema>;

@Controller("/users")
export class UsersController {
  @Post("/")
  create(@Body(new ZodValidationPipe(CreateUserSchema)) body: CreateUserDto) {
    // body is fully typed and validated!
    return { message: "User created", data: body };
  }
}
```

**What happens here:**

1.  Request body is received
2.  `ZodValidationPipe` validates it against `CreateUserSchema`
3.  If valid, the typed `body` is passed to the handler
4.  If invalid, a `BadRequestException` is thrown with detailed errors

---

## Validation Schemas

### Basic Schema

```typescript
import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  inStock: z.boolean(),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
```

### Advanced Schema with Custom Messages

```typescript
export const CreateUserSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name cannot exceed 50 characters"),

  email: z
    .string({ required_error: "Email is required" })
    .email("Must be a valid email address"),

  age: z
    .number({ required_error: "Age is required" })
    .int("Age must be an integer")
    .min(18, "Must be at least 18 years old")
    .max(120, "Age seems invalid"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number"),

  role: z.enum(["user", "admin"], {
    errorMap: () => ({ message: "Role must be 'user' or 'admin'" }),
  }),
});
```

### Nested Objects

```typescript
export const CreateOrderSchema = z.object({
  customer: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
  items: z
    .array(
      z.object({
        productId: z.number(),
        quantity: z.number().positive(),
      }),
    )
    .min(1, "At least one item is required"),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z.string().regex(/^\d{5}$/, "Must be a 5-digit ZIP code"),
  }),
});
```

### Optional and Default Values

```typescript
export const UpdateUserSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  age: z.number().min(18).optional(),
  newsletter: z.boolean().default(false),
  role: z.enum(["user", "admin"]).default("user"),
});
```

---

## Using Pipes

### On Individual Parameters

Apply pipes to specific parameters:

```typescript
@Controller("/posts")
export class PostsController {
  @Post("/")
  create(@Body(new ZodValidationPipe(CreatePostSchema)) body: CreatePostDto) {
    return body;
  }

  @Put("/:id")
  update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdatePostSchema)) body: UpdatePostDto,
  ) {
    return { id, ...body };
  }
}
```

### Global Pipes

Apply pipes to all routes:

```typescript
import { KarinFactory } from "@karin-js/core";
import { H3Adapter } from "@karin-js/platform-h3";
import { ZodValidationPipe } from "@karin-js/core";

async function bootstrap() {
  const app = await KarinFactory.create(new H3Adapter(), {
    scan: "./src/**/*.controller.ts",
  });

  // Apply globally
  app.useGlobalPipes(new ZodValidationPipe(GlobalSchema));

  app.listen(3000);
}
```

### Method-Level Pipes

Apply pipes to all parameters of a method:

```typescript
import { UsePipes } from "@karin-js/core";

@Controller("/users")
export class UsersController {
  @Post("/")
  @UsePipes(new ZodValidationPipe(CreateUserSchema))
  create(@Body() body: CreateUserDto) {
    return body;
  }
}
```

### Class-Level Pipes

Apply pipes to all methods in a controller:

```typescript
import { UsePipes } from "@karin-js/core";

@Controller("/users")
@UsePipes(new ZodValidationPipe(UserSchema))
export class UsersController {
  @Post("/")
  create(@Body() body: CreateUserDto) {
    return body;
  }

  @Put("/:id")
  update(@Body() body: UpdateUserDto) {
    return body;
  }
}
```

---

## Validation Error Response

When validation fails, `ZodValidationPipe` throws a `BadRequestException` with a structured error response:

**Request:**

```bash
POST /users
{
  "name": "A",
  "email": "invalid-email",
  "age": 15
}

```

**Response (400 Bad Request):**

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name must be at least 3 characters",
      "code": "too_small"
    },
    {
      "field": "email",
      "message": "Must be a valid email",
      "code": "invalid_string"
    },
    {
      "field": "age",
      "message": "Must be at least 18 years old",
      "code": "too_small"
    }
  ]
}
```

---

## Creating Custom Pipes

Implement the `PipeTransform` interface:

```typescript
import { injectable } from "@karin-js/core";
import type { PipeTransform, ArgumentMetadata } from "@karin-js/core";

@injectable()
export class ParseIntPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const parsed = parseInt(value, 10);

    if (isNaN(parsed)) {
      throw new Error(`${metadata.data} must be a valid integer`);
    }

    return parsed;
  }
}
```

**Usage:**

```typescript
@Controller("/posts")
export class PostsController {
  @Get("/:id")
  findOne(@Param("id", new ParseIntPipe()) id: number) {
    // id is now a number, not a string!
    return { id, type: typeof id }; // { id: 123, type: "number" }
  }
}
```

### Transformation Pipe

```typescript
@injectable()
export class TrimPipe implements PipeTransform {
  transform(value: any) {
    if (typeof value === "string") {
      return value.trim();
    }
    if (typeof value === "object" && value !== null) {
      return Object.keys(value).reduce((acc, key) => {
        acc[key] =
          typeof value[key] === "string" ? value[key].trim() : value[key];
        return acc;
      }, {} as any);
    }
    return value;
  }
}
```

**Usage:**

```typescript
@Post("/")
create(@Body(new TrimPipe()) body: any) {
  // All string fields are trimmed
  return body;
}

```

### Validation Pipe with Custom Logic

```typescript
@injectable()
export class FileUploadValidationPipe implements PipeTransform {
  constructor(
    private readonly allowedTypes: string[],
    private readonly maxSize: number,
  ) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (!value || !value.type || !value.size) {
      throw new BadRequestException("Invalid file");
    }

    if (!this.allowedTypes.includes(value.type)) {
      throw new BadRequestException(
        `File type must be one of: ${this.allowedTypes.join(", ")}`,
      );
    }

    if (value.size > this.maxSize) {
      throw new BadRequestException(
        `File size must not exceed ${this.maxSize / 1024 / 1024}MB`,
      );
    }

    return value;
  }
}
```

**Usage:**

```typescript
@Post("/upload")
upload(
  @Body(
    new FileUploadValidationPipe(
      ["image/jpeg", "image/png"],
      5 * 1024 * 1024 // 5MB
    )
  )
  file: any
) {
  return { message: "File uploaded", file };
}

```

---

## Organizing DTOs

Create a dedicated folder for DTOs:

```
src/users/
├── dtos/
│   ├── create-user.dto.ts
│   ├── update-user.dto.ts
│   └── user-response.dto.ts
├── users.controller.ts
└── users.service.ts

```

**create-user.dto.ts:**

```typescript
import { z } from "zod";

export const CreateUserSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  age: z.number().min(18),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
```

**update-user.dto.ts:**

```typescript
import { z } from "zod";
import { CreateUserSchema } from "./create-user.dto";

// Reuse and make all fields optional
export const UpdateUserSchema = CreateUserSchema.partial();

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
```

---

## Best Practices

### 1\. Validate at the Edge

Validate as early as possible (at the controller level):

```typescript
// ✅ Good: Validate immediately
@Post("/")
create(@Body(new ZodValidationPipe(CreateUserSchema)) body: CreateUserDto) {
  return this.usersService.create(body); // body is guaranteed valid
}

```

### 2\. Use Type Inference

Let TypeScript infer types from Zod schemas:

```typescript
// ✅ Good
export const UserSchema = z.object({ name: z.string() });
export type User = z.infer<typeof UserSchema>;

// ❌ Bad: Duplicate definitions
export interface User {
  name: string;
}
export const UserSchema = z.object({ name: z.string() });
```

### 3\. Provide Clear Error Messages

```typescript
// ✅ Good: Descriptive messages
z.string().email("Please provide a valid email address");

// ❌ Bad: Generic messages
z.string().email();
```

### 4\. Separate Read and Write DTOs

```typescript
// create-user.dto.ts
export const CreateUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
});

// user-response.dto.ts (no password!)
export const UserResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  createdAt: z.date(),
});
```

### 5\. Validate Query Parameters

```typescript
const PaginationSchema = z.object({
  page: z.string().transform(Number).pipe(z.number().positive().default(1)),
  limit: z.string().transform(Number).pipe(z.number().positive().max(100).default(10))
});

@Get("/")
findAll(@Query(new ZodValidationPipe(PaginationSchema)) query: any) {
  return this.usersService.findAll(query.page, query.limit);
}

```

---

## Next Steps

- [Guards](https://claude.ai/chat/guards.md) - Protect routes with authentication
- [Exception Handling](https://claude.ai/chat/exceptions.md) - Handle validation errors gracefully
- [Controllers](https://claude.ai/chat/controllers.md) - Learn more about route handlers

---

## Summary

Pipes in KarinJS:

- Transform and validate input data before it reaches handlers
- `ZodValidationPipe` provides powerful validation with Zod schemas
- Can be applied at parameter, method, class, or global level
- Throw exceptions when validation fails
- Are easy to create by implementing `PipeTransform`
- Should be used to validate data at the edge of your application
