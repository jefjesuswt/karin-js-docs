# Introduction

## What is KarinJS?

KarinJS is a modern, enterprise-friendly backend framework built specifically for Bun. It offers a fresh take on server-side architecture by embracing a **module-less, feature-oriented** design philosophy, making it simpler, faster, and more intuitive than traditional module-based frameworks.

### Philosophy

KarinJS was born from the desire to simplify backend development without sacrificing power or performance. While frameworks like NestJS have proven their worth in enterprise environments, they can feel heavy and over-engineered for many projects. KarinJS takes inspiration from modern frontend patterns (like Angular Standalone Components) and applies them to the backend:

- **No Modules, Just Features**: Organize your code around features, not abstract module boundaries
- **Convention Over Configuration**: Automatic controller discovery means less boilerplate
- **Performance First**: Built on Bun for maximum speed
- **Type-Safe by Default**: Full TypeScript support throughout
- **Adapter Pattern**: Swap between H3 and Hono adapters with a single line

### Core Principles

**1\. Simplicity**\
KarinJS eliminates unnecessary abstractions. You write controllers and services---the framework handles the rest.

**2\. Speed**\
Leveraging Bun's performance, KarinJS achieves around 10x faster request handling compared to traditional Node.js frameworks. (On some cases).

**3\. Familiarity**\
If you know decorators from NestJS or Angular, you already know KarinJS. The learning curve is minimal.

**4\. Flexibility**\
Choose your adapter: H3 for maximum raw speed, or Hono for edge/serverless compatibility.

### Who is KarinJS for?

KarinJS is ideal for:

- **Developers seeking simplicity**: Tired of module management overhead
- **Performance-conscious teams**: Need blazing-fast APIs without complexity
- **Modern stack enthusiasts**: Want to leverage Bun's cutting-edge capabilities
- **Rapid prototypers**: Need to ship MVPs quickly without sacrificing structure

### What KarinJS is NOT

KarinJS is not trying to replace NestJS. It's a lighter, more opinionated alternative for teams who want:

- Less ceremony, more code
- Faster development cycles
- Native Bun optimization
- Simpler mental models

---

## Architecture Overview

KarinJS follows a straightforward architecture:

```
┌─────────────────────────────────────┐
│         Controllers                 │  ← Your API endpoints
│  (@Controller, @Get, @Post, etc.)   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│          Services                   │  ← Business logic
│      (@injectable, DI via tsyringe) │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Platform Adapters              │  ← H3 or Hono
│    (IHttpAdapter implementation)    │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Bun Runtime                  │  ← Native HTTP server
└─────────────────────────────────────┘

```

### Key Components

**Controllers**\
Handle HTTP requests and define route handlers using decorators like `@Get()`, `@Post()`, etc.

**Services**\
Contain business logic and can be injected into controllers using dependency injection.

**Guards**\
Protect routes by implementing authorization/authentication logic.

**Pipes**\
Transform and validate incoming data (e.g., Zod validation).

**Adapters**\
Abstract the underlying HTTP framework (H3 or Hono), allowing you to switch platforms seamlessly.

---

## Feature-Oriented Structure

Instead of organizing by modules, KarinJS encourages a feature-based folder structure:

```
src/
├── users/
│   ├── user.controller.ts
│   ├── user.service.ts
│   └── dtos/
│       └── create-user.dto.ts
├── products/
│   ├── product.controller.ts
│   └── product.service.ts
├── guards/
│   └── auth.guard.ts
└── main.ts

```

This structure:

- Groups related functionality together
- Makes code easier to navigate
- Reduces coupling between features
- Scales naturally as your app grows

---

## Roadmap: The @Feature() Decorator

In future versions, KarinJS will introduce an optional `@Feature()` decorator for teams that need more explicit boundaries:

```typescript
@Feature({
  imports: [DatabaseFeature],
  exports: [UserService],
})
export class UserFeature {}
```

This will provide:

- Explicit dependency management between features
- Scoped model access (e.g., Mongoose models only visible within a feature)
- Optional migration path for NestJS users

However, **features will remain optional**, you can continue using the flat, module-less architecture if you prefer.

---

## Why Bun?

Bun is a modern JavaScript runtime that offers:

- **3x faster `npm install`**: Near-instant dependency installation
- **Native TypeScript support**: No transpilation needed
- **Built-in bundler**: No webpack configuration required
- **Fast HTTP server**: Native `Bun.serve` is incredibly performant
- **Web-standard APIs**: Fetch, WebSocket, and more built-in

---

## Performance Benchmarks

KarinJS consistently outperforms traditional frameworks:

| Framework          | Requests/sec | Avg Latency |
| ------------------ | ------------ | ----------- |
| **KarinJS (H3)**   | 98,505       | 1.00ms      |
| **KarinJS (Hono)** | 77,814       | 1.27ms      |
| NestJS             | 9,940        | 10.05ms     |

_Benchmark: 100k requests, 100 concurrency, AMD Ryzen 5 5600X_

---

## Next Steps

Ready to build your first KarinJS application? Head over to the [Getting Started](https://claude.ai/chat/getting-started.md) guide!
