# Getting Started

This guide will walk you through creating your first KarinJS application from scratch.

## Prerequisites

Before you begin, ensure you have:

- **Bun 1.2.10 or higher** installed ([Install Bun](https://bun.sh))
- Basic knowledge of TypeScript and decorators
- A code editor (VS Code recommended)

Verify your Bun installation:

```bash
bun --version
```

---

## Installation

### 1\. Create a new project

```bash
mkdir my-karin-app
cd my-karin-app
bun init -y
```

### 2\. Install dependencies

Choose your preferred adapter (H3 for maximum speed, or Hono for edge compatibility):

**With H3 Adapter (recommended for traditional servers):**

```bash
bun add @karin-js/core @karin-js/platform-h3
```

**With Hono Adapter (recommended for edge/serverless):**

```bash
bun add @karin-js/core @karin-js/platform-hono
```

### 3\. Configure TypeScript

Update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "lib": ["ESNext"],
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "esModuleInterop": true,
    "resolveJsonModule": true
  }
}
```

---

## Your First Application

### 1\. Create a controller

Create `src/app.controller.ts`:

```typescript
import { Controller, Get } from "@karin-js/core";

@Controller("/")
export class AppController {
  @Get("/")
  getHello() {
    return { message: "Hello from KarinJS! 🦊" };
  }

  @Get("/health")
  getHealth() {
    return { status: "ok", timestamp: new Date().toISOString() };
  }
}
```

**What's happening here?**

- `@Controller("/")` defines the base path for all routes in this controller
- `@Get("/")` maps the `getHello()` method to `GET /`
- The return value is automatically serialized to JSON

### 2\. Bootstrap the application

Create `src/main.ts`:

```typescript
import "reflect-metadata";
import { KarinFactory } from "@karin-js/core";
import { H3Adapter } from "@karin-js/platform-h3";
// Or: import { HonoAdapter } from "@karin-js/platform-hono";

async function bootstrap() {
  const app = await KarinFactory.create(new H3Adapter(), {
    scan: "./src/\*_/_.controller.ts",
  });

  app.listen(3000, () => {
    console.log("🦊 KarinJS server running on http://localhost:3000");
  });
}

bootstrap();
```

**Key points:**

- `import "reflect-metadata"` must be at the top of your entry file
- `scan: "./src/**/*.controller.ts"` automatically discovers all controllers
- No need to manually register controllers---KarinJS handles it for you!

### 3\. Run the server

```bash

bun run src/main.ts

```

You should see:

```

🦊 KarinJS server running on http://localhost:3000

```

### 4\. Test your API

Open your browser or use `curl`:

```bash

curl http://localhost:3000

# Output: {"message":"Hello from KarinJS! 🦊"}

curl http://localhost:3000/health

# Output: {"status":"ok","timestamp":"2024-01-15T10:30:00.000Z"}

```

---

## Project Structure

Here's the recommended structure for a KarinJS project:

```

my-karin-app/
├── src/
│ ├── main.ts # Application entry point
│ ├── app.controller.ts # Root controller
│ └── users/ # Feature folder
│ ├── user.controller.ts
│ ├── user.service.ts
│ └── dtos/
│ └── create-user.dto.ts
├── package.json
└── tsconfig.json

```

**Feature-based organization:**

- Group related functionality in feature folders (`users/`, `products/`, etc.)
- Keep controllers, services, and DTOs together
- Share common code in a `common/` or `shared/` folder

---

## Adding More Routes

Let's expand our controller with different HTTP methods:

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from "@karin-js/core";

@Controller("/users")
export class UsersController {
  @Get("/")
  getAllUsers() {
    return [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ];
  }

  @Get("/:id")
  getUser(@Param("id") id: string) {
    return { id, name: `User ${id}` };
  }

  @Post("/")
  createUser(@Body() body: any) {
    return {
      message: "User created",
      data: body,
    };
  }

  @Put("/:id")
  updateUser(@Param("id") id: string, @Body() body: any) {
    return {
      message: "User updated",
      id,
      data: body,
    };
  }

  @Delete("/:id")
  deleteUser(@Param("id") id: string) {
    return { message: "User deleted", id };
  }
}
```

**Available decorators:**

- `@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()` - HTTP methods
- `@Body()` - Request body
- `@Param(key)` - URL parameters
- `@Query(key)` - Query string parameters
- `@Headers(key)` - Request headers

---

## Development Tips

### Hot Reload

Bun has built-in watch mode:

```bash

bun --watch src/main.ts

```

### Custom Port and Host

```typescript
app.listen(8080, "0.0.0.0"); // Listen on all interfaces
```

### Enable CORS

```typescript
const app = await KarinFactory.create(new H3Adapter(), {
  scan: "./src/\*_/_.controller.ts",
});

app.enableCors();
app.listen(3000);
```

### Environment Variables

```typescript
const port = parseInt(process.env.PORT || "3000");
app.listen(port);
```

---

## Switching Adapters

Switching between H3 and Hono is trivial:

```typescript
// Change this line:
const app = await KarinFactory.create(new H3Adapter(), {
  scan: "./src/\*_/_.controller.ts",
});

// To this:
const app = await KarinFactory.create(new HonoAdapter(), {
  scan: "./src/\*_/_.controller.ts",
});
```

That's it! Your entire application now runs on a different platform.

---

## Next Steps

Now that you have a basic application running, explore these topics:

- [Controllers](/controllers) - Learn about advanced routing and parameter decorators
- [Services & Dependency Injection](/services) - Create reusable business logic
- [Validation with Pipes](/pipes) - Validate requests with Zod
- [Exception Handling](/exception-handling) - Handle errors gracefully

---

## Common Issues

### "No controllers found"

Check that:

1.  Your controllers have the `@Controller()` decorator
2.  The `scan` path matches your file structure
3.  Files are named `*.controller.ts`

### TypeScript errors with decorators

Ensure your `tsconfig.json` has:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

```

```
