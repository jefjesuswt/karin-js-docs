# Controladores

Los controladores son responsables de manejar las solicitudes HTTP entrantes y devolver respuestas al cliente. En KarinJS, los controladores son clases decoradas con `@Controller()` que definen manejadores de rutas usando decoradores de método.

---

## Controlador Básico

Un controlador es simplemente una clase con el decorador `@Controller()`:

```typescript
import { Controller, Get } from "@karin-js/core";

@Controller("/cats")
export class CatsController {
  @Get("/")
  findAll() {
    return { data: ["Británico de Pelo Corto", "Persa", "Maine Coon"] };
  }
}
```

El decorador `@Controller("/cats")`:

- Marca la clase como un controlador
- Establece `/cats` como la ruta base para todas las rutas en este controlador
- Registra automáticamente el controlador con inyección de dependencias

---

## Decoradores de Métodos HTTP

KarinJS proporciona decoradores para todos los métodos HTTP estándar:

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

## Parámetros de Ruta

### Parámetros de URL

Extrae valores dinámicos de la ruta URL usando `@Param()`:

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

**Acceder a todos los parámetros a la vez:**

```typescript
@Get("/:id")
findOne(@Param() params: Record<string, string>) {
  return { id: params.id };
}
```

### Parámetros de Query

Extrae valores del query string usando `@Query()`:

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

**Ejemplo de solicitud:** `GET /search?q=typescript&limit=20`

**Acceder a todos los parámetros de query:**

```typescript
@Get("/")
search(@Query() query: Record<string, string>) {
  return { query };
}
```

### Cuerpo de la Solicitud

Extrae el cuerpo de la solicitud usando `@Body()`:

```typescript
@Controller("/posts")
export class PostsController {
  @Post("/")
  create(@Body() createPostDto: any) {
    return {
      message: "Post creado",
      data: createPostDto,
    };
  }

  // Extraer un campo específico
  @Post("/partial")
  createPartial(@Body("title") title: string) {
    return { title };
  }
}
```

### Encabezados

Extrae encabezados de la solicitud usando `@Headers()`:

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

  // Acceder a todos los encabezados
  @Get("/headers")
  getAllHeaders(@Headers() headers: Record<string, string>) {
    return { headers };
  }
}
```

---

## Routing Avanzado

### Rutas Anidadas

Crea jerarquías de rutas profundas:

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

**Resultado:** `GET /api/v1/users/123/orders/456/items`

### Controlador de Ruta Raíz

Omite la ruta para crear un controlador raíz:

```typescript
@Controller("/")
export class RootController {
  @Get("/")
  root() {
    return { message: "¡Bienvenido!" };
  }

  @Get("/health")
  health() {
    return { status: "ok" };
  }
}
```

---

## Objetos Request y Response

Accede a los objetos request y response crudos cuando sea necesario:

```typescript
import { Controller, Get, Req, Res } from "@karin-js/core";

@Controller("/raw")
export class RawController {
  @Get("/")
  handle(@Req() request: Request, @Res() response: any) {
    console.log(request.method, request.url);
    return { message: "Verifica la consola" };
  }
}
```

**Advertencia:** Usar objetos crudos acopla tu código al adaptador específico. Prefiere usar decoradores como `@Body()`, `@Query()`, etc. para portabilidad.

---

## Combinando Decoradores

Puedes combinar múltiples decoradores de parámetros en un solo manejador:

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

## Tipos de Respuesta

KarinJS maneja automáticamente diferentes tipos de respuesta:

### Respuesta JSON (por defecto)

```typescript
@Get("/json")
getJson() {
  return { message: "Esto es JSON" };
}
```

**Respuesta:**

```json
{ "message": "Esto es JSON" }
```

### Respuesta de Texto

```typescript
@Get("/text")
getText() {
  return "Respuesta de texto plano";
}
```

### Códigos de Estado Personalizados

Para códigos de estado personalizados, devuelve un objeto `Response`:

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

### Sin Contenido (204)

```typescript
@Delete("/:id")
remove(@Param("id") id: string) {
  // Realizar eliminación...
  return null; // o undefined
}
```

---

## Organización de Controladores

### Estructura Basada en Características

Organiza controladores por característica:

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

### Convenciones de Nomenclatura

Sigue estas convenciones para consistencia:

- **Archivos:** `*.controller.ts` (ej., `users.controller.ts`)
- **Clases:** `PascalCase` con sufijo `Controller` (ej., `UsersController`)
- **Métodos:** `camelCase` describiendo la acción (ej., `findAll`, `create`, `update`)

---

## Mejores Prácticas

### 1. Mantén los Controladores Delgados

Los controladores deben delegar lógica de negocio a servicios:

```typescript
// ❌ Malo: Lógica de negocio en el controlador
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

// ✅ Bueno: Delegar al servicio
@Controller("/orders")
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post("/")
  create(@Body() data: any) {
    return this.ordersService.create(data);
  }
}
```

### 2. Usa DTOs para Type Safety

Define Data Transfer Objects para formas de request/response:

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

### 3. Maneja Errores Elegantemente

Usa manejo de excepciones (cubierto en [Excepciones](./exception-handling.md)):

```typescript
import { Controller, Get, Param, NotFoundException } from "@karin-js/core";

@Controller("/users")
export class UsersController {
  @Get("/:id")
  findOne(@Param("id") id: string) {
    const user = this.findUserById(id);
    if (!user) {
      throw new NotFoundException("Usuario no encontrado");
    }
    return user;
  }
}
```

### 4. Documenta tus Rutas

Agrega comentarios JSDoc para mejor experiencia de desarrollo:

```typescript
@Controller("/posts")
export class PostsController {
  /**
   * Recupera todos los posts con paginación
   * @param page - Número de página (por defecto: 1)
   * @param limit - Elementos por página (por defecto: 10)
   */
  @Get("/")
  findAll(@Query("page") page?: string, @Query("limit") limit?: string) {
    // ...
  }
}
```

---

## Próximos Pasos

- [Servicios e Inyección de Dependencias](./services.md) - Extrae lógica de negocio
- [Validación con Pipes](./pipes.md) - Valida datos entrantes
- [Manejo de Excepciones](./exception-handling.md) - Maneja errores

---

## Resumen

Los controladores en KarinJS:

- Son clases decoradas con `@Controller(path)`
- Definen rutas usando `@Get()`, `@Post()`, etc.
- Extraen datos usando `@Param()`, `@Query()`, `@Body()`, `@Headers()`
- Deben permanecer delgados y delegar lógica a servicios
- Se descubren automáticamente cuando usas `scan` en `KarinFactory.create()`
