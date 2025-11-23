# Servicios e Inyección de Dependencias

Los servicios son la columna vertebral de la lógica de negocio de tu aplicación. En KarinJS, los servicios son clases que pueden ser inyectadas en controladores, otros servicios, o cualquier componente inyectable usando inyección de dependencias impulsada por `tsyringe`.

---

## ¿Qué es un Servicio?

Un servicio es una clase reutilizable que encapsula lógica de negocio, acceso a datos, o cualquier funcionalidad que deba estar separada de los controladores. Los servicios promueven:

- **Separación de responsabilidades** - Mantén los controladores delgados
- **Reutilización** - Comparte lógica entre múltiples controladores
- **Testabilidad** - Fácil de testear unitariamente en aislamiento
- **Mantenibilidad** - Organización clara del código

---

## Crear un Servicio

### Servicio Básico

Crea un servicio decorando una clase con `@injectable()`:

```typescript
import { injectable } from "@karin-js/core";

@injectable()
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

**Puntos clave:**

- `@injectable()` marca la clase para inyección de dependencias
- Los servicios son típicamente singletons con estado (por defecto)
- Los métodos contienen tu lógica de negocio

---

## Inyectar Servicios

### Inyección por Constructor

Inyecta servicios en controladores vía constructor:

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

**Cómo funciona:**

1. TypeScript emite metadata sobre los tipos de parámetros del constructor
2. El contenedor DI de KarinJS resuelve dependencias automáticamente
3. La misma instancia se inyecta en todas partes (singleton por defecto)

---

## Inyección Servicio-a-Servicio

Los servicios pueden inyectar otros servicios:

```typescript
import { injectable } from "@karin-js/core";
import { DatabaseService } from "./database.service";
import { LoggerService } from "./logger.service";

@injectable()
export class UsersService {
  constructor(
    private db: DatabaseService,
    private logger: LoggerService,
  ) {}

  async findAll() {
    this.logger.log("Obteniendo todos los usuarios");
    return await this.db.users.findMany();
  }

  async create(userData: any) {
    this.logger.log(`Creando usuario: ${userData.email}`);
    const user = await this.db.users.create(userData);
    this.logger.log(`Usuario creado: ${user.id}`);
    return user;
  }
}
```

---

## Alcances de Inyección de Dependencias

KarinJS soporta diferentes alcances de DI usando `tsyringe`:

### Singleton (Por Defecto)

Una instancia compartida en toda la aplicación:

```typescript
import { injectable } from "@karin-js/core";

@injectable() // Singleton por defecto
export class ConfigService {
  private config = { apiKey: "secret" };

  getConfig() {
    return this.config;
  }
}
```

### Singleton Explícito

Usa `@singleton()` para claridad:

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

## Registro Manual

Para escenarios avanzados, registra dependencias manualmente:

```typescript
import { container } from "@karin-js/core";
import { DatabaseService } from "./database.service";

// Registrar un singleton
container.registerSingleton(DatabaseService);

// Registrar con una instancia específica
container.registerInstance(
  DatabaseService,
  new DatabaseService("mongodb://localhost"),
);

// Registrar una factory
container.register(DatabaseService, {
  useFactory: () => new DatabaseService(process.env.DB_URL!),
});
```

---

## Ejemplos Prácticos

### Servicio de Base de Datos

```typescript
import { singleton } from "@karin-js/core";

@singleton()
export class DatabaseService {
  private connected = false;

  async connect(url: string) {
    console.log(`Conectando a ${url}...`);
    this.connected = true;
  }

  isConnected() {
    return this.connected;
  }

  // Método de ejemplo para consultas
  async query(sql: string) {
    if (!this.connected) {
      throw new Error("Base de datos no conectada");
    }
    // Ejecutar consulta...
    return [];
  }
}
```

### Servicio de Logger

```typescript
import { injectable } from "@karin-js/core";

@injectable()
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

### Servicio de Email

```typescript
import { injectable } from "@karin-js/core";
import { LoggerService } from "./logger.service";

@injectable()
export class EmailService {
  constructor(private logger: LoggerService) {}

  async sendEmail(to: string, subject: string, body: string) {
    this.logger.log(`Enviando email a ${to}: ${subject}`);

    // Simular envío de email
    await new Promise((resolve) => setTimeout(resolve, 100));

    this.logger.log(`Email enviado exitosamente a ${to}`);
    return { success: true };
  }

  async sendWelcomeEmail(email: string, name: string) {
    return this.sendEmail(
      email,
      "¡Bienvenido!",
      `Hola ${name}, ¡bienvenido a nuestra plataforma!`,
    );
  }
}
```

### Servicio de Autenticación

```typescript
import { injectable } from "@karin-js/core";
import { UsersService } from "./users.service";

@injectable()
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
      throw new Error("Credenciales inválidas");
    }
    // Generar token JWT...
    return { access_token: "jwt-token-aqui", user };
  }
}
```

---

## Composición de Servicios

Construye funcionalidad compleja componiendo servicios:

```typescript
import { injectable } from "@karin-js/core";
import { UsersService } from "./users.service";
import { EmailService } from "./email.service";
import { LoggerService } from "./logger.service";

@injectable()
export class RegistrationService {
  constructor(
    private usersService: UsersService,
    private emailService: EmailService,
    private logger: LoggerService,
  ) {}

  async register(userData: { name: string; email: string; password: string }) {
    try {
      // 1. Crear usuario
      this.logger.log(`Registrando usuario: ${userData.email}`);
      const user = await this.usersService.create(userData);

      // 2. Enviar email de bienvenida
      await this.emailService.sendWelcomeEmail(user.email, user.name);

      // 3. Registrar éxito
      this.logger.log(`Usuario registrado exitosamente: ${user.id}`);

      return { success: true, user };
    } catch (error: any) {
      this.logger.error(`Registro fallido: ${error.message}`);
      throw error;
    }
  }
}
```

---

## Mejores Prácticas

### 1. Responsabilidad Única

Cada servicio debe tener un propósito claro:

```typescript
// ❌ Malo: Demasiadas responsabilidades
@injectable()
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

// ✅ Bueno: Servicios enfocados
@injectable()
export class UsersService {
  getUsers() {
    /* ... */
  }
}

@injectable()
export class EmailService {
  sendEmail() {
    /* ... */
  }
}

@injectable()
export class PaymentService {
  processPayment() {
    /* ... */
  }
}
```

### 2. Evita Dependencias Circulares

No crees imports circulares entre servicios:

```typescript
// ❌ Malo: Dependencia circular
// users.service.ts
import { PostsService } from "./posts.service";

@injectable()
export class UsersService {
  constructor(private postsService: PostsService) {}
}

// posts.service.ts
import { UsersService } from "./users.service";

@injectable()
export class PostsService {
  constructor(private usersService: UsersService) {}
}

// ✅ Bueno: Extrae lógica compartida a un tercer servicio
@injectable()
export class UsersService {
  constructor(private dataService: DataService) {}
}

@injectable()
export class PostsService {
  constructor(private dataService: DataService) {}
}
```

### 3. Usa Interfaces para Abstracción

Define interfaces para mejor testabilidad:

```typescript
export interface IEmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

@injectable()
export class EmailService implements IEmailService {
  async sendEmail(to: string, subject: string, body: string) {
    // Implementación real
  }
}

// En tests, fácil de intercambiar con un mock
@injectable()
export class MockEmailService implements IEmailService {
  async sendEmail() {
    console.log("Email mock enviado");
  }
}
```

### 4. Mantén la Lógica de Negocio en Servicios

Los controladores deben ser orquestadores delgados:

```typescript
// ❌ Malo: Lógica en el controlador
@Controller("/orders")
export class OrdersController {
  @Post("/")
  async create(@Body() data: any) {
    const total = data.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0,
    );
    const order = await database.save({ ...data, total });
    await emailService.send(order.email, "Orden confirmada");
    return order;
  }
}

// ✅ Bueno: Lógica en el servicio
@Controller("/orders")
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post("/")
  create(@Body() data: any) {
    return this.ordersService.create(data);
  }
}

@injectable()
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

## Testing de Servicios

Los servicios son fáciles de testear en aislamiento:

```typescript
import { describe, it, expect } from "bun:test";
import { UsersService } from "./users.service";

describe("UsersService", () => {
  it("debería encontrar todos los usuarios", () => {
    const service = new UsersService();
    const users = service.findAll();
    expect(users).toBeArray();
    expect(users.length).toBeGreaterThan(0);
  });

  it("debería crear un nuevo usuario", () => {
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

## Próximos Pasos

- [Validación con Pipes](./pipes.md) - Valida inputs de servicios
- [Manejo de Excepciones](./exception-handling.md) - Maneja errores de servicios

---

## Resumen

Los servicios en KarinJS:

- Encapsulan lógica de negocio separada de controladores
- Se decoran con `@injectable()` o `@singleton()`
- Pueden ser inyectados en controladores y otros servicios
- Se registran automáticamente como singletons por defecto
- Deben seguir el principio de responsabilidad única
- Son fáciles de testear en aislamiento
