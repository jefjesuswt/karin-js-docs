# Validación con Pipes

Los Pipes en KarinJS transforman y validan datos de entrada antes de que lleguen a tus manejadores de ruta. Son perfectos para asegurar la integridad de los datos y proporcionar mensajes de error claros a los clientes.

---

## ¿Qué son los Pipes?

Los Pipes son clases que implementan la interfaz `PipeTransform`. Pueden:

- **Transformar** datos (ej., convertir strings a números)
- **Validar** datos (ej., verificar formato de email)
- **Lanzar excepciones** cuando la validación falla

Los Pipes se ejecutan **antes** de que el manejador de ruta se ejecute, asegurando que solo datos válidos lleguen a tu lógica de negocio.

---

## Pipes Integrados

### ZodValidationPipe

KarinJS incluye un pipe de validación poderoso usando [Zod](https://zod.dev):

```typescript
import { Controller, Post, Body } from "@karin-js/core";
import { ZodValidationPipe } from "@karin-js/core";
import { z } from "zod";

// Define tu esquema
const CreateUserSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Debe ser un email válido"),
  age: z.number().min(18, "Debe ser mayor de 18 años"),
});

type CreateUserDto = z.infer<typeof CreateUserSchema>;

@Controller("/users")
export class UsersController {
  @Post("/")
  create(@Body(new ZodValidationPipe(CreateUserSchema)) body: CreateUserDto) {
    // ¡body está completamente tipado y validado!
    return { message: "Usuario creado", data: body };
  }
}
```

**Qué sucede aquí:**

1. Se recibe el cuerpo de la solicitud
2. `ZodValidationPipe` lo valida contra `CreateUserSchema`
3. Si es válido, el `body` tipado se pasa al manejador
4. Si es inválido, se lanza una `BadRequestException` con errores detallados

---

## Esquemas de Validación

### Esquema Básico

```typescript
import { z } from "zod";

export const CreateProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  inStock: z.boolean(),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
```

### Esquema Avanzado con Mensajes Personalizados

```typescript
export const CreateUserSchema = z.object({
  name: z
    .string({ required_error: "El nombre es requerido" })
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres"),

  email: z
    .string({ required_error: "El email es requerido" })
    .email("Debe ser una dirección de email válida"),

  age: z
    .number({ required_error: "La edad es requerida" })
    .int("La edad debe ser un número entero")
    .min(18, "Debe ser mayor de 18 años")
    .max(120, "La edad parece inválida"),

  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "La contraseña debe contener una letra mayúscula")
    .regex(/[a-z]/, "La contraseña debe contener una letra minúscula")
    .regex(/[0-9]/, "La contraseña debe contener un número"),

  role: z.enum(["user", "admin"], {
    errorMap: () => ({ message: "El rol debe ser 'user' o 'admin'" }),
  }),
});
```

### Objetos Anidados

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
    .min(1, "Se requiere al menos un artículo"),
  shippingAddress: z.object({
    street: z.string(),
    city: z.string(),
    zipCode: z
      .string()
      .regex(/^\d{5}$/, "Debe ser un código postal de 5 dígitos"),
  }),
});
```

### Valores Opcionales y Por Defecto

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

## Usando Pipes

### En Parámetros Individuales

Aplica pipes a parámetros específicos:

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

### Pipes Globales

Aplica pipes a todas las rutas:

```typescript
import { KarinFactory } from "@karin-js/core";
import { H3Adapter } from "@karin-js/platform-h3";
import { ZodValidationPipe } from "@karin-js/core";

async function bootstrap() {
  const app = await KarinFactory.create(new H3Adapter(), {
    scan: "./src/**/*.controller.ts",
  });

  // Aplicar globalmente
  app.useGlobalPipes(new ZodValidationPipe(GlobalSchema));

  app.listen(3000);
}
```

### Pipes a Nivel de Método

Aplica pipes a todos los parámetros de un método:

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

### Pipes a Nivel de Clase

Aplica pipes a todos los métodos en un controlador:

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

## Respuesta de Error de Validación

Cuando la validación falla, `ZodValidationPipe` lanza una `BadRequestException` con una respuesta estructurada:

**Solicitud:**

```json
POST /users
{
  "name": "A",
  "email": "email-invalido",
  "age": 15
}
```

**Respuesta (400 Bad Request):**

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "El nombre debe tener al menos 3 caracteres",
      "code": "too_small"
    },
    {
      "field": "email",
      "message": "Debe ser un email válido",
      "code": "invalid_string"
    },
    {
      "field": "age",
      "message": "Debe ser mayor de 18 años",
      "code": "too_small"
    }
  ]
}
```

---

## Crear Pipes Personalizados

Implementa la interfaz `PipeTransform`:

```typescript
import { injectable } from "@karin-js/core";
import type { PipeTransform, ArgumentMetadata } from "@karin-js/core";

@injectable()
export class ParseIntPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const parsed = parseInt(value, 10);

    if (isNaN(parsed)) {
      throw new Error(`${metadata.data} debe ser un entero válido`);
    }

    return parsed;
  }
}
```

**Uso:**

```typescript
@Controller("/posts")
export class PostsController {
  @Get("/:id")
  findOne(@Param("id", new ParseIntPipe()) id: number) {
    // ¡id ahora es un número, no un string!
    return { id, type: typeof id }; // { id: 123, type: "number" }
  }
}
```

### Pipe de Transformación

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

**Uso:**

```typescript
@Post("/")
create(@Body(new TrimPipe()) body: any) {
  // Todos los campos de tipo string están recortados
  return body;
}
```

---

## Organizar DTOs

Crea una carpeta dedicada para DTOs:

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

// Reutilizar y hacer todos los campos opcionales
export const UpdateUserSchema = CreateUserSchema.partial();

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
```

---

## Mejores Prácticas

### 1. Valida en el Borde

Valida lo antes posible (a nivel del controlador):

```typescript
// ✅ Bueno: Validar inmediatamente
@Post("/")
create(@Body(new ZodValidationPipe(CreateUserSchema)) body: CreateUserDto) {
  return this.usersService.create(body); // body está garantizado como válido
}
```

### 2. Usa Inferencia de Tipos

Deja que TypeScript infiera tipos de esquemas Zod:

```typescript
// ✅ Bueno
export const UserSchema = z.object({ name: z.string() });
export type User = z.infer<typeof UserSchema>;

// ❌ Malo: Definiciones duplicadas
export interface User {
  name: string;
}
export const UserSchema = z.object({ name: z.string() });
```

### 3. Proporciona Mensajes de Error Claros

```typescript
// ✅ Bueno: Mensajes descriptivos
z.string().email("Por favor proporciona una dirección de email válida");

// ❌ Malo: Mensajes genéricos
z.string().email();
```

### 4. Separa DTOs de Lectura y Escritura

```typescript
// create-user.dto.ts
export const CreateUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
});

// user-response.dto.ts (¡sin password!)
export const UserResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  createdAt: z.date(),
});
```

---

## Próximos Pasos

- [Manejo de Excepciones](./exception-handling.md) - Maneja errores de validación elegantemente
- [Controladores](./controllers.md) - Aprende más sobre manejadores de ruta

---

## Resumen

Los Pipes en KarinJS:

- Transforman y validan datos de entrada antes de que lleguen a los manejadores
- `ZodValidationPipe` proporciona validación poderosa con esquemas Zod
- Pueden aplicarse a nivel de parámetro, método, clase o global
- Lanzan excepciones cuando la validación falla
- Son fáciles de crear implementando `PipeTransform`
- Deben usarse para validar datos en el borde de tu aplicación
