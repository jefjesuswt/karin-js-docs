# Services & Dependency Injection

Services are the backbone of your application's business logic. In KarinJS, services are classes that can be injected into controllers, other services, or any injectable component using dependency injection powered by `tsyringe`.

---

## What is a Service?

A service is a reusable class that encapsulates business logic, data access, or any functionality that should be separated from controllers. Services promote:

- **Separation of concerns** - Keep controllers thin
- **Reusability** - Share logic across multiple controllers
- **Testability** - Easy to unit test in isolation
- **Maintainability** - Clear organization of code

---

## Creating a Service

### Basic Service

Create a service by decorating a class with `@singleton()` if it holds state:

```typescript
import { singleton } from "@karin-js/core";

@singleton() // ✅ Use singleton for services with state
export class UsersService {
  private users = [
    { id: 1, name: "Alice", email: "alice@example.com" },
    { id: 2, name: "Bob", email: "bob@example.com" },
  ];

  findAll() {
    return this.users;
  }

  findOne(id: number) {
    return this.users.find((user) => user.id === id);
  }

  create(userData: { name: string; email: string }) {
    const newUser = {
      id: this.users.length + 1,
      ...userData,
    };
    this.users.push(newUser);
    return newUser;
  }

  remove(id: number) {
    const index = this.users.findIndex((user) => user.id === id);
    if (index !== -1) {
      return this.users.splice(index, 1)[0];
    }
    return null;
  }
}
```

#### Key points:

- `@injectable()` marks the class for dependency injection (Transient by default).
- `@singleton()` marks the class as a shared instance (Singleton).
- Methods contain your business logic.

---

## Injecting Services

### Constructor Injection

Inject services into controllers via the constructor:

```typescript
import { Controller, Get, Post, Param, Body } from "@karin-js/core";
import { UsersService } from "./users.service";

@Controller("/users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get("/")
  findAll() {
    return this.usersService.findAll();
  }

  @Get("/:id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(parseInt(id));
  }

  @Post("/")
  create(@Body() userData: { name: string; email: string }) {
    return this.usersService.create(userData);
  }
}
```

**How it works:**

1.  TypeScript emits metadata about the constructor parameter types
2.  KarinJS's DI container resolves dependencies automatically
3.  The instance lifecycle depends on the decorator used (`@singleton()` or `@injectable()`)

---

## Service-to-Service Injection

Services can inject other services. Use `@singleton()` for services that manage state or connections:

```typescript
import { singleton } from "@karin-js/core";
import { DatabaseService } from "./database.service";
import { LoggerService } from "./logger.service";

@singleton() // ✅ Important to maintain state and connections
export class UsersService {
  constructor(
    private db: DatabaseService,
    private logger: LoggerService,
  ) {}

  async findAll() {
    this.logger.log("Fetching all users");
    return await this.db.users.findMany();
  }

  async create(userData: any) {
    this.logger.log(`Creating user: ${userData.email}`);
    const user = await this.db.users.create(userData);
    this.logger.log(`User created: ${user.id}`);
    return user;
  }
}
```

---

## Dependency Injection Scopes

KarinJS supports different DI scopes using `tsyringe`:

### 1. Transient (Default with `@injectable()`)

A new instance is created for each class that injects it. Useful for stateless helpers:

```typescript
import { injectable } from "@karin-js/core";

@injectable()
export class HelperService {
  formatDate(date: Date) {
    return date.toISOString();
  }

  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
}
```

### 2. Singleton (Shared State)

One instance shared across the entire application. Use this for services that hold state (like database connections, caches, or in-memory storage):

```typescript
import { singleton } from "@karin-js/core";

@singleton() // ✅ Correct usage for stateful services
export class ConfigService {
  private config = { apiKey: "secret" };

  getConfig() {
    return this.config;
  }

  setConfig(key: string, value: any) {
    this.config = { ...this.config, [key]: value };
  }
}
```

**Example: Cache Service (Singleton)**

```typescript
import { singleton } from "@karin-js/core";

@singleton()
export class CacheService {
  private cache = new Map();

  set(key: string, value: any) {
    this.cache.set(key, value);
  }

  get(key: string) {
    return this.cache.get(key);
  }
}
```

---

## Manual Registration

For advanced scenarios, manually register dependencies:

```typescript
import { container } from "@karin-js/core";
import { DatabaseService } from "./database.service";

// Register a singleton
container.registerSingleton(DatabaseService);

// Register with a specific instance
container.registerInstance(
  DatabaseService,
  new DatabaseService("mongodb://localhost"),
);

// Register a factory
container.register(DatabaseService, {
  useFactory: () => new DatabaseService(process.env.DB_URL!),
});
```

---

## Practical Examples

### Database Service

```typescript
import { singleton } from "@karin-js/core";

@singleton()
export class DatabaseService {
  private connected = false;

  async connect(url: string) {
    console.log(`Connecting to ${url}...`);
    this.connected = true;
  }

  isConnected() {
    return this.connected;
  }

  // Example query method
  async query(sql: string) {
    if (!this.connected) {
      throw new Error("Database not connected");
    }
    // Execute query...
    return [];
  }
}
```

### Logger Service

```typescript
import { singleton } from "@karin-js/core";

@singleton() // ✅ Singleton to maintain context state
export class LoggerService {
  private context = "App";

  log(message: string) {
    console.log(`[${this.context}] ${message}`);
  }

  error(message: string, trace?: string) {
    console.error(`[${this.context}] ERROR: ${message}`);
    if (trace) console.error(trace);
  }

  setContext(context: string) {
    this.context = context;
  }
}
```

### Email Service

```typescript
import { injectable } from "@karin-js/core";
import { LoggerService } from "./logger.service";

@injectable()
export class EmailService {
  constructor(private logger: LoggerService) {}

  async sendEmail(to: string, subject: string, body: string) {
    this.logger.log(`Sending email to ${to}: ${subject}`);

    // Simulate sending email
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.logger.log(`Email sent successfully to ${to}`);
    return { success: true };
  }

  async sendWelcomeEmail(email: string, name: string) {
    return this.sendEmail(
      email,
      "Welcome!",
      `Hello ${name}, welcome to our platform!`,
    );
  }
}
```

### Authentication Service

```typescript
import { singleton } from "@karin-js/core";
import { UsersService } from "./users.service";

@singleton() // ✅ Singleton for consistency
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && user.password === password) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      throw new Error("Invalid credentials");
    }
    // Generate JWT token...
    return { access_token: "jwt-token-here", user };
  }
}
```

---

## Service Composition

Build complex functionality by composing services:

```typescript
import { singleton } from "@karin-js/core";
import { UsersService } from "./users.service";
import { EmailService } from "./email.service";
import { LoggerService } from "./logger.service";

@singleton() // ✅ Singleton for orchestration services
export class RegistrationService {
  constructor(
    private usersService: UsersService,
    private emailService: EmailService,
    private logger: LoggerService,
  ) {}

  async register(userData: { name: string; email: string; password: string }) {
    try {
      // 1. Create user
      this.logger.log(`Registering user: ${userData.email}`);
      const user = await this.usersService.create(userData);

      // 2. Send welcome email
      await this.emailService.sendWelcomeEmail(user.email, user.name);

      // 3. Log success
      this.logger.log(`User registered successfully: ${user.id}`);

      return { success: true, user };
    } catch (error: any) {
      this.logger.error(`Registration failed: ${error.message}`);
      throw error;
    }
  }
}
```

---

## Best Practices

### 1\. Single Responsibility

Each service should have one clear purpose:

```typescript
// ❌ Bad: Too many responsibilities
@singleton()
export class AppService {
  getUsers() {
    /* ... */
  }
  sendEmail() {
    /* ... */
  }
  processPayment() {
    /* ... */
  }
  generateReport() {
    /* ... */
  }
}

// ✅ Good: Focused services
@singleton()
export class UsersService {
  getUsers() {
    /* ... */
  }
}

@singleton()
export class EmailService {
  sendEmail() {
    /* ... */
  }
}

@singleton()
export class PaymentService {
  processPayment() {
    /* ... */
  }
}
```

### 2\. Avoid Circular Dependencies

Don't create circular imports between services:

```typescript
// ❌ Bad: Circular dependency
// users.service.ts
import { PostsService } from "./posts.service";

@singleton()
export class UsersService {
  constructor(private postsService: PostsService) {}
}

// posts.service.ts
import { UsersService } from "./users.service";

@singleton()
export class PostsService {
  constructor(private usersService: UsersService) {}
}

// ✅ Good: Extract shared logic to a third service
// users.service.ts
@singleton()
export class UsersService {
  constructor(private dataService: DataService) {}
}

// posts.service.ts
@singleton()
export class PostsService {
  constructor(private dataService: DataService) {}
}
```

### 3\. Use Interfaces for Abstraction

Define interfaces for better testability:

```typescript
export interface IEmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

@singleton()
export class EmailService implements IEmailService {
  async sendEmail(to: string, subject: string, body: string) {
    // Real implementation
  }
}

// In tests, easily swap with a mock
@singleton()
export class MockEmailService implements IEmailService {
  async sendEmail() {
    console.log("Mock email sent");
  }
}
```

### 4\. Keep Business Logic in Services

Controllers should be thin orchestrators:

```typescript
// ❌ Bad: Logic in controller
@Controller("/orders")
export class OrdersController {
  @Post("/")
  async create(@Body() data: any) {
    const total = data.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0,
    );
    const order = await database.save({ ...data, total });
    await emailService.send(order.email, "Order confirmed");
    return order;
  }
}

// ✅ Good: Logic in service
@Controller("/orders")
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post("/")
  create(@Body() data: any) {
    return this.ordersService.create(data);
  }
}

@singleton() // ✅ Singleton for business logic services
export class OrdersService {
  async create(data: any) {
    const total = this.calculateTotal(data.items);
    const order = await this.saveOrder({ ...data, total });
    await this.sendConfirmationEmail(order);
    return order;
  }

  private calculateTotal(items: any[]) {
    /* ... */
  }
  private saveOrder(data: any) {
    /* ... */
  }
  private sendConfirmationEmail(order: any) {
    /* ... */
  }
}
```

---

## Testing Services

Services are easy to test in isolation:

```typescript
import { describe, it, expect } from "bun:test";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  it("should find all users", () => {
    const service = new UsersService();
    const users = service.findAll();
    expect(users).toBeArray();
    expect(users.length).toBeGreaterThan(0);
  });

  it("should create a new user", () => {
    const service = new UsersService();
    const newUser = service.create({
      name: "Charlie",
      email: "charlie@example.com",
    });
    expect(newUser).toHaveProperty("id");
    expect(newUser.name).toBe("Charlie");
  });
});
```

---

## Next Steps

- [Validation with Pipes](/pipes) - Validate service inputs
- [Exception Handling](/exception-handling) - Handle service errors

---

## Summary

Services in KarinJS:

- Encapsulate business logic separate from controllers
- Are decorated with `@injectable()` (Transient) or `@singleton()` (Shared)
- Can be injected into controllers and other services
- Use `@singleton()` for services with state or shared resources
- Use `@injectable()` for stateless utilities
- Should follow single responsibility principle
- Are easy to test in isolation
