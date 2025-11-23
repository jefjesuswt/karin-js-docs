# Manejo de Excepciones

KarinJS proporciona un sistema robusto de manejo de excepciones que automáticamente captura errores y devuelve respuestas HTTP correctamente formateadas a los clientes.

---

## Excepciones Integradas

KarinJS incluye varias clases de excepción HTTP integradas:

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

### HttpException (Clase Base)

La clase base para todas las excepciones HTTP:

```typescript
throw new HttpException("Algo salió mal", 400);
```

**Respuesta:**

```json
{
  "statusCode": 400,
  "message": "Algo salió mal"
}
```

### BadRequestException (400)

Para solicitudes inválidas del cliente:

```typescript
@Post("/users")
create(@Body() data: any) {
  if (!data.email) {
    throw new BadRequestException("El email es requerido");
  }
  return this.usersService.create(data);
}
```

**Respuesta:**

```json
{
  "statusCode": 400,
  "message": "El email es requerido"
}
```

### UnauthorizedException (401)

Para fallos de autenticación:

```typescript
@Post("/login")
login(@Body() credentials: any) {
  const user = this.authService.validateUser(credentials);
  if (!user) {
    throw new UnauthorizedException("Credenciales inválidas");
  }
  return user;
}
```

**Respuesta:**

```json
{
  "statusCode": 401,
  "message": "Credenciales inválidas"
}
```

### ForbiddenException (403)

Para fallos de autorización:

```typescript
@Delete("/:id")
@UseGuards(AuthGuard)
delete(@Param("id") id: string, @Req() req: any) {
  if (req.user.role !== "admin") {
    throw new ForbiddenException("Solo los administradores pueden eliminar usuarios");
  }
  return this.usersService.delete(id);
}
```

**Respuesta:**

```json
{
  "statusCode": 403,
  "message": "Solo los administradores pueden eliminar usuarios"
}
```

### NotFoundException (404)

Para recursos faltantes:

```typescript
@Get("/:id")
async findOne(@Param("id") id: string) {
  const user = await this.usersService.findById(id);
  if (!user) {
    throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
  }
  return user;
}
```

**Respuesta:**

```json
{
  "statusCode": 404,
  "message": "Usuario con ID 123 no encontrado"
}
```

### InternalServerErrorException (500)

Para errores inesperados del servidor:

```typescript
@Get("/")
async findAll() {
  try {
    return await this.usersService.findAll();
  } catch (error) {
    throw new InternalServerErrorException("Error al obtener usuarios");
  }
}
```

**Respuesta:**

```json
{
  "statusCode": 500,
  "message": "Error al obtener usuarios"
}
```

---

## Excepciones con Objetos

Las excepciones pueden incluir datos estructurados:

```typescript
throw new BadRequestException({
  message: "Validación fallida",
  errors: [
    { field: "email", message: "Formato de email inválido" },
    { field: "age", message: "Debe ser mayor de 18 años" },
  ],
});
```

**Respuesta:**

```json
{
  "statusCode": 400,
  "message": "Validación fallida",
  "errors": [
    { "field": "email", "message": "Formato de email inválido" },
    { "field": "age", "message": "Debe ser mayor de 18 años" }
  ]
}
```

---

## Excepciones Personalizadas

Crea excepciones específicas del dominio:

```typescript
export class UserAlreadyExistsException extends HttpException {
  constructor(email: string) {
    super(
      {
        message: "El usuario ya existe",
        email,
      },
      409, // Conflict
    );
  }
}
```

**Uso:**

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

**Respuesta:**

```json
{
  "statusCode": 409,
  "message": "El usuario ya existe",
  "email": "user@example.com"
}
```

### Más Ejemplos de Excepciones Personalizadas

```typescript
// Fallos de pago
export class PaymentFailedException extends HttpException {
  constructor(reason: string) {
    super({ message: "Pago fallido", reason }, 402);
  }
}

// Conflictos de recursos
export class ResourceConflictException extends HttpException {
  constructor(resource: string) {
    super({ message: `Conflicto detectado en ${resource}` }, 409);
  }
}

// Servicio no disponible
export class ServiceUnavailableException extends HttpException {
  constructor(service: string) {
    super({ message: `${service} no está disponible actualmente` }, 503);
  }
}
```

---

## Manejo de Excepciones en Servicios

Maneja excepciones en la capa de servicio:

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
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }
    return user;
  }

  create(userData: { email: string }) {
    const existing = this.users.find((u) => u.email === userData.email);
    if (existing) {
      throw new BadRequestException("Email ya en uso");
    }

    const newUser = { id: this.users.length + 1, ...userData };
    this.users.push(newUser);
    return newUser;
  }

  delete(id: number) {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }
    return this.users.splice(index, 1)[0];
  }
}
```

**El controlador permanece limpio:**

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

## Excepciones de Pipes de Validación

`ZodValidationPipe` automáticamente lanza `BadRequestException` con detalles de validación:

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
  // Si la validación falla, ZodValidationPipe lanza BadRequestException
  return this.usersService.create(body);
}
```

**Solicitud inválida:**

```json
POST /users
{
  "name": "Jo",
  "email": "email-invalido",
  "age": 15
}
```

**Respuesta automática:**

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

## Manejo de Excepciones en Guards

Los Guards deben lanzar excepciones para mensajes de error claros:

```typescript
import { injectable } from "@karin-js/core";
import type { CanActivate } from "@karin-js/core";
import { UnauthorizedException, ForbiddenException } from "@karin-js/core";

@injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: any): Promise<boolean> {
    const token = this.extractToken(context);

    if (!token) {
      throw new UnauthorizedException("Token de autenticación requerido");
    }

    try {
      const payload = await this.verifyToken(token);
      context.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException("Token inválido o expirado");
    }
  }

  // ... métodos auxiliares
}
```

---

## Formato de Respuesta de Error

Todas las excepciones siguen un formato consistente:

### Mensaje de String Simple

```typescript
throw new NotFoundException("Usuario no encontrado");
```

**Respuesta:**

```json
{
  "statusCode": 404,
  "message": "Usuario no encontrado"
}
```

### Objeto con Datos Adicionales

```typescript
throw new BadRequestException({
  message: "Validación fallida",
  timestamp: new Date().toISOString(),
  path: "/api/users",
});
```

**Respuesta:**

```json
{
  "statusCode": 400,
  "message": "Validación fallida",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/users"
}
```

---

## Patrón Try-Catch

Maneja excepciones explícitamente cuando sea necesario:

```typescript
@Post("/process")
async process(@Body() data: any) {
  try {
    const result = await this.processData(data);
    return { success: true, result };
  } catch (error: any) {
    if (error.code === "ECONNREFUSED") {
      throw new ServiceUnavailableException("Base de datos");
    }
    if (error.code === "DUPLICATE_KEY") {
      throw new BadRequestException("El registro ya existe");
    }
    // Re-lanzar errores desconocidos
    throw new InternalServerErrorException("Procesamiento fallido");
  }
}
```

---

## Manejo de Excepciones Asíncronas

Los manejadores asíncronos automáticamente capturan y formatean excepciones:

```typescript
@Get("/:id")
async findOne(@Param("id") id: string) {
  // Cualquier excepción lanzada es capturada y formateada
  const user = await this.usersService.findById(id);

  if (!user) {
    throw new NotFoundException("Usuario no encontrado");
  }

  return user;
}
```

---

## Mejores Prácticas

### 1. Usa Tipos de Excepción Específicos

```typescript
// ✅ Bueno: Excepción específica
throw new NotFoundException("Usuario no encontrado");

// ❌ Malo: Excepción genérica
throw new HttpException("No encontrado", 404);
```

### 2. Incluye Contexto Útil

```typescript
// ✅ Bueno: Mensaje detallado
throw new NotFoundException(`Producto con SKU ${sku} no encontrado`);

// ❌ Malo: Mensaje vago
throw new NotFoundException("No encontrado");
```

### 3. Maneja Errores en Servicios

```typescript
// ✅ Bueno: El servicio maneja errores
@injectable()
export class UsersService {
  findById(id: number) {
    const user = this.users.find(u => u.id === id);
    if (!user) {
      throw new NotFoundException("Usuario no encontrado");
    }
    return user;
  }
}

// ❌ Malo: El controlador maneja errores
@Get("/:id")
findOne(@Param("id") id: string) {
  const user = this.usersService.findById(parseInt(id));
  if (!user) {
    throw new NotFoundException("Usuario no encontrado");
  }
  return user;
}
```

### 4. No Expongas Información Sensible

```typescript
// ✅ Bueno: Error genérico en producción
if (process.env.NODE_ENV === "production") {
  throw new InternalServerErrorException("Ocurrió un error");
} else {
  throw new InternalServerErrorException(error.message);
}

// ❌ Malo: Exponiendo stack traces
throw new InternalServerErrorException(error.stack);
```

### 5. Usa Errores Estructurados para Validación

```typescript
// ✅ Bueno: Errores de validación estructurados
throw new BadRequestException({
  message: "Validación fallida",
  errors: validationErrors,
});

// ❌ Malo: String de error concatenado
throw new BadRequestException(
  "Validación fallida: " + validationErrors.join(", "),
);
```

---

## Desarrollo vs Producción

Maneja errores de forma diferente según el entorno:

```typescript
@Get("/")
async findAll() {
  try {
    return await this.usersService.findAll();
  } catch (error: any) {
    const isDev = process.env.NODE_ENV !== "production";

    if (isDev) {
      // Mostrar errores detallados en desarrollo
      throw new InternalServerErrorException({
        message: "Error al obtener usuarios",
        error: error.message,
        stack: error.stack
      });
    }

    // Error genérico en producción
    throw new InternalServerErrorException("Error al obtener usuarios");
  }
}
```

---

## Patrones Comunes de Excepciones

### Recurso No Encontrado

```typescript
@Get("/:id")
async findOne(@Param("id") id: string) {
  const resource = await this.service.findById(id);
  if (!resource) {
    throw new NotFoundException(`Recurso ${id} no encontrado`);
  }
  return resource;
}
```

### Recurso Duplicado

```typescript
@Post("/")
async create(@Body() data: any) {
  const existing = await this.service.findByEmail(data.email);
  if (existing) {
    throw new BadRequestException("El email ya existe");
  }
  return this.service.create(data);
}
```

### Acceso No Autorizado

```typescript
@Get("/profile")
@UseGuards(AuthGuard)
getProfile(@Req() req: any) {
  if (!req.user) {
    throw new UnauthorizedException("Se requiere autenticación");
  }
  return req.user;
}
```

### Acción Prohibida

```typescript
@Delete("/:id")
delete(@Param("id") id: string, @Req() req: any) {
  if (req.user.id !== parseInt(id) && req.user.role !== "admin") {
    throw new ForbiddenException("No puedes eliminar otros usuarios");
  }
  return this.service.delete(id);
}
```

---

## Testing del Manejo de Excepciones

```typescript
import { describe, it, expect } from "bun:test";
import { UsersService } from "./users.service";
import { NotFoundException } from "@karin-js/core";

describe("UsersService", () => {
  it("debería lanzar NotFoundException para ID inválido", () => {
    const service = new UsersService();

    expect(() => service.findById(999)).toThrow(NotFoundException);
  });

  it("debería lanzar BadRequestException para email duplicado", () => {
    const service = new UsersService();
    service.create({ email: "test@example.com" });

    expect(() => service.create({ email: "test@example.com" })).toThrow(
      BadRequestException,
    );
  });
});
```

---

## Próximos Pasos

- [Controladores](./controllers.md) - Maneja excepciones en rutas
- [Validación](./pipes.md) - Manejo de errores de validación

---

## Resumen

El manejo de excepciones en KarinJS:

- Usa clases de excepción HTTP integradas para escenarios comunes
- Formatea automáticamente respuestas de error con estructura consistente
- Soporta tanto mensajes string como objetos de error estructurados
- Debe manejarse principalmente en servicios, no en controladores
- Puede personalizarse para errores específicos del dominio
- Funciona sin problemas con pipes de validación y guards
- Debe exponer información mínima en entornos de producción
