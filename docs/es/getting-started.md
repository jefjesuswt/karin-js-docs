# Primeros Pasos

Esta guía te llevará a través de la creación de tu primera aplicación KarinJS desde cero.

## Requisitos Previos

Antes de comenzar, asegúrate de tener:

- **Bun 1.2.10 o superior** instalado ([Instalar Bun](https://bun.sh))
- Conocimiento básico de TypeScript y decoradores
- Un editor de código (recomendamos VS Code)

Verifica tu instalación de Bun:

```bash
bun --version
```

---

## Instalación

### 1. Crear un nuevo proyecto

```bash
mkdir mi-app-karin
cd mi-app-karin
bun init -y
```

### 2. Instalar dependencias

Elige tu adaptador preferido (H3 para máxima velocidad, o Hono para compatibilidad edge):

**Con Adaptador H3 (recomendado para servidores tradicionales):**

```bash
bun add @karin-js/core @karin-js/platform-h3 reflect-metadata tsyringe
```

**Con Adaptador Hono (recomendado para edge/serverless):**

```bash
bun add @karin-js/core @karin-js/platform-hono reflect-metadata tsyringe
```

### 3. Configurar TypeScript

Actualiza tu `tsconfig.json`:

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

## Tu Primera Aplicación

### 1. Crear un controlador

Crea `src/app.controller.ts`:

```typescript
import { Controller, Get } from "@karin-js/core";

@Controller("/")
export class AppController {
  @Get("/")
  getHello() {
    return { message: "¡Hola desde KarinJS! 🦊" };
  }

  @Get("/health")
  getHealth() {
    return { status: "ok", timestamp: new Date().toISOString() };
  }
}
```

**¿Qué está pasando aquí?**

- `@Controller("/")` define la ruta base para todas las rutas en este controlador
- `@Get("/")` mapea el método `getHello()` a `GET /`
- El valor de retorno se serializa automáticamente a JSON

### 2. Iniciar la aplicación

Crea `src/main.ts`:

```typescript
import "reflect-metadata";
import { KarinFactory } from "@karin-js/core";
import { H3Adapter } from "@karin-js/platform-h3";
// O: import { HonoAdapter } from "@karin-js/platform-hono";

async function bootstrap() {
  const app = await KarinFactory.create(new H3Adapter(), {
    scan: "./src/**/*.controller.ts",
  });

  app.listen(3000, () => {
    console.log("🦊 Servidor KarinJS corriendo en http://localhost:3000");
  });
}

bootstrap();
```

**Puntos clave:**

- `import "reflect-metadata"` debe estar al inicio de tu archivo de entrada
- `scan: "./src/**/*.controller.ts"` descubre automáticamente todos los controladores
- ¡No necesitas registrar controladores manualmente—KarinJS lo hace por ti!

### 3. Ejecutar el servidor

```bash
bun run src/main.ts
```

Deberías ver:

```
🦊 Servidor KarinJS corriendo en http://localhost:3000
```

### 4. Probar tu API

Abre tu navegador o usa `curl`:

```bash
curl http://localhost:3000
# Salida: {"message":"¡Hola desde KarinJS! 🦊"}

curl http://localhost:3000/health
# Salida: {"status":"ok","timestamp":"2024-01-15T10:30:00.000Z"}
```

---

## Estructura del Proyecto

Aquí está la estructura recomendada para un proyecto KarinJS:

```
mi-app-karin/
├── src/
│   ├── main.ts              # Punto de entrada de la aplicación
│   ├── app.controller.ts    # Controlador raíz
│   └── users/               # Carpeta de característica
│       ├── user.controller.ts
│       ├── user.service.ts
│       └── dtos/
│           └── create-user.dto.ts
├── package.json
└── tsconfig.json
```

**Organización basada en características:**

- Agrupa funcionalidad relacionada en carpetas de características (`users/`, `products/`, etc.)
- Mantén controladores, servicios y DTOs juntos
- Comparte código común en una carpeta `common/` o `shared/`

---

## Agregando Más Rutas

Expandamos nuestro controlador con diferentes métodos HTTP:

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
    return { id, name: `Usuario ${id}` };
  }

  @Post("/")
  createUser(@Body() body: any) {
    return {
      message: "Usuario creado",
      data: body,
    };
  }

  @Put("/:id")
  updateUser(@Param("id") id: string, @Body() body: any) {
    return {
      message: "Usuario actualizado",
      id,
      data: body,
    };
  }

  @Delete("/:id")
  deleteUser(@Param("id") id: string) {
    return { message: "Usuario eliminado", id };
  }
}
```

**Decoradores disponibles:**

- `@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()` - Métodos HTTP
- `@Body()` - Cuerpo de la solicitud
- `@Param(key)` - Parámetros de URL
- `@Query(key)` - Parámetros de query string
- `@Headers(key)` - Encabezados de la solicitud

---

## Consejos de Desarrollo

### Hot Reload

Bun tiene modo watch integrado:

```bash
bun --watch src/main.ts
```

### Puerto y Host Personalizados

```typescript
app.listen(8080, "0.0.0.0"); // Escuchar en todas las interfaces
```

### Habilitar CORS

```typescript
const app = await KarinFactory.create(new H3Adapter(), {
  scan: "./src/**/*.controller.ts",
});

app.enableCors();
app.listen(3000);
```

### Variables de Entorno

```typescript
const port = parseInt(process.env.PORT || "3000");
app.listen(port);
```

---

## Cambiar de Adaptador

Cambiar entre H3 y Hono es trivial:

```typescript
// Cambia esta línea:
const app = await KarinFactory.create(new H3Adapter(), {
  scan: "./src/**/*.controller.ts",
});

// Por esta:
const app = await KarinFactory.create(new HonoAdapter(), {
  scan: "./src/**/*.controller.ts",
});
```

¡Eso es todo! Tu aplicación completa ahora corre en una plataforma diferente.

---

## Próximos Pasos

Ahora que tienes una aplicación básica funcionando, explora estos temas:

- [Controladores](./controllers.md) - Aprende sobre routing avanzado y decoradores de parámetros
- [Servicios e Inyección de Dependencias](./services.md) - Crea lógica de negocio reutilizable
- [Validación con Pipes](./pipes.md) - Valida solicitudes con Zod
- [Manejo de Excepciones](./exception-handling.md) - Maneja errores elegantemente

---

## Problemas Comunes

### "Cannot find module 'reflect-metadata'"

Asegúrate de haber instalado `reflect-metadata` e importado al inicio de `main.ts`:

```bash
bun add reflect-metadata
```

```typescript
import "reflect-metadata"; // ¡Debe ser primero!
```

### "No controllers found"

Verifica que:

1. Tus controladores tienen el decorador `@Controller()`
2. La ruta `scan` coincide con tu estructura de archivos
3. Los archivos se nombran `*.controller.ts`

### Errores de TypeScript con decoradores

Asegúrate de que tu `tsconfig.json` tiene:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

---

¿Necesitas ayuda? ¡Abre un issue en [GitHub](https://github.com/jefjesuswt/karin-js) o únete a nuestra comunidad!
