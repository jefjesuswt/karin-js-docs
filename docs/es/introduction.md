# Introducción

## ¿Qué es KarinJS?

KarinJS es un framework backend moderno y amigable para empresas, construido específicamente para Bun. Ofrece una nueva perspectiva en la arquitectura del lado del servidor al adoptar un diseño **sin módulos, orientado a características**—haciéndolo más simple, rápido e intuitivo que los frameworks tradicionales basados en módulos.

### Filosofía

KarinJS nació del deseo de simplificar el desarrollo backend sin sacrificar poder o rendimiento. Si bien frameworks como NestJS han demostrado su valía en entornos empresariales, pueden sentirse pesados y sobre-ingenierizados para muchos proyectos. KarinJS toma inspiración de patrones frontend modernos (como los Componentes Standalone de Angular) y los aplica al backend:

- **Sin Módulos, Solo Características**: Organiza tu código alrededor de características, no de límites de módulos abstractos
- **Convención Sobre Configuración**: El descubrimiento automático de controladores significa menos código repetitivo
- **Rendimiento Primero**: Construido sobre Bun para máxima velocidad
- **Type-Safe por Defecto**: Soporte completo de TypeScript en todo momento
- **Patrón Adapter**: Cambia entre adaptadores H3 y Hono con una sola línea

### Principios Fundamentales

**1. Simplicidad**  
KarinJS elimina abstracciones innecesarias. Escribes controladores y servicios—el framework se encarga del resto.

**2. Velocidad**  
Aprovechando el rendimiento de Bun, KarinJS logra >10x más velocidad en el manejo de solicitudes comparado con frameworks tradicionales de Node.js.

**3. Familiaridad**  
Si conoces decoradores de NestJS o Angular, ya conoces KarinJS. La curva de aprendizaje es mínima.

**4. Flexibilidad**  
Elige tu adaptador: H3 para máxima velocidad cruda, o Hono para compatibilidad edge/serverless.

### ¿Para quién es KarinJS?

KarinJS es ideal para:

- **Desarrolladores que buscan simplicidad**: Cansados de la sobrecarga de gestión de módulos
- **Equipos conscientes del rendimiento**: Necesitan APIs ultrarrápidas sin complejidad
- **Entusiastas del stack moderno**: Quieren aprovechar las capacidades de vanguardia de Bun
- **Prototipadores rápidos**: Necesitan enviar MVPs rápidamente sin sacrificar estructura

### Lo que KarinJS NO es

KarinJS no intenta reemplazar a NestJS. Es una alternativa más ligera para equipos que quieren:

- Menos ceremonia, más código
- Ciclos de desarrollo más rápidos
- Optimización nativa de Bun
- Modelos mentales más simples

---

## Resumen de la Arquitectura

KarinJS sigue una arquitectura sencilla:

```
┌─────────────────────────────────────┐
│         Controladores               │  ← Tus endpoints API
│   (@Controller, @Get, @Post, etc.)  │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│             Servicios               │  ← Lógica de negocio
│    (@injectable, DI vía tsyringe)   │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│      Adaptadores de Plataforma      │  ← H3 o Hono
│    (Implementación IHttpAdapter)    │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│             Runtime Bun             │  ← Servidor HTTP nativo
└─────────────────────────────────────┘
```

### Componentes Clave

**Controladores**  
Manejan solicitudes HTTP y definen manejadores de rutas usando decoradores como `@Get()`, `@Post()`, etc.

**Servicios**  
Contienen lógica de negocio y pueden ser inyectados en controladores usando inyección de dependencias.

**Guards**  
Protegen rutas implementando lógica de autorización/autenticación.

**Pipes**  
Transforman y validan datos entrantes (ej., validación con Zod).

**Adaptadores**  
Abstraen el framework HTTP subyacente (H3 o Hono), permitiéndote cambiar de plataforma sin problemas.

---

## Estructura Orientada a Características

En lugar de organizar por módulos, KarinJS fomenta una estructura de carpetas basada en características:

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

Esta estructura:

- Agrupa funcionalidad relacionada
- Hace el código más fácil de navegar
- Reduce el acoplamiento entre características
- Escala naturalmente a medida que tu aplicación crece

---

## Roadmap: El Decorador @Feature()

En versiones futuras, KarinJS introducirá un decorador opcional `@Feature()` para equipos que necesiten límites más explícitos:

```typescript
@Feature({
  imports: [DatabaseFeature],
  exports: [UserService],
})
export class UserFeature {}
```

Esto proporcionará:

- Gestión explícita de dependencias entre características
- Acceso a modelos con alcance (ej., modelos Mongoose solo visibles dentro de una característica)
- Ruta de migración opcional para usuarios de NestJS

Sin embargo, **las Feature() permanecerán opcionales**—puedes continuar usando la arquitectura plana y sin módulos si lo prefieres.

---

## ¿Por qué Bun?

Bun es un runtime moderno de JavaScript que ofrece:

- **3x más rápido en `npm install`**: Instalación de dependencias casi instantánea
- **Soporte nativo de TypeScript**: No necesita transpilación
- **Bundler integrado**: No se requiere configuración de webpack
- **Servidor HTTP rápido**: `Bun.serve` nativo es increíblemente eficiente
- **APIs estándar web**: Fetch, WebSocket, y más integrados

KarinJS está diseñado para aprovechar al máximo estas capacidades, convirtiéndolo en uno de los frameworks backend más rápidos disponibles.

---

## Benchmarks de Rendimiento

KarinJS supera consistentemente a los frameworks tradicionales:

| Framework          | Req/seg | Latencia Prom. |
| ------------------ | ------- | -------------- |
| **KarinJS (H3)**   | 98,505  | 1.00ms         |
| **KarinJS (Hono)** | 77,814  | 1.27ms         |
| NestJS             | 9,940   | 10.05ms        |

_Benchmark: 100k solicitudes, 100 concurrencia, AMD Ryzen 5 5600X_

---

## Próximos Pasos

¿Listo para construir tu primera aplicación KarinJS? ¡Dirígete a la guía de [Primeros Pasos](./getting-started.md)!
