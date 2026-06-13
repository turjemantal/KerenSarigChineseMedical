---
name: server-module
description: How to add or modify a NestJS server module in this repo following the controller → manager → service → DAO layering. Use when creating a new module, adding an endpoint, or moving logic out of a controller.
---

# Adding / modifying a server module

This repo enforces strict layering: **controller → manager → service → DAO**.
Follow it whenever you touch the server.

## The layers (what goes where)

| Layer | Responsibility | Never |
|---|---|---|
| **Controller** | Routing + delegation only. One-line handlers that call a manager method. Decorators, guards, pipes, param extraction. | No `if`/`throw`/`.map`, no validation logic, no shaping, no touching two services. |
| **Manager** | Orchestration: cross-module data (inject other modules' **managers**), combining sources, use-case input validation, messaging, logging. | Don't write Mongoose queries; don't reach into another module's service/DAO. |
| **Service** | Module-specific business logic; the only caller of its own DAO. Validates ids, throws domain errors. | No cross-module reach; no HTTP concerns. |
| **DAO** | Mongoose queries only. | No business logic. |

## Checklist for a new module `foo`

1. `foo.schema.ts` — Mongoose schema (+ indexes).
2. `foo.dao.ts` — `@Injectable()`, inject the model, query methods only.
3. `foo.service.ts` — inject the DAO; business logic; validate ids with
   `isValidObjectId`; throw `NotFoundException(notFoundMessage(Entity.Foo, id))`.
4. `foo.manager.ts` — inject the service (and other modules' managers if it needs
   their data); orchestration, logging, messaging.
5. `foo.controller.ts` — inject the manager; thin handlers; `@UseGuards(...)`,
   `@Body(new JoiValidationPipe(schema))`.
6. `dto/*.dto.ts` + `dto/validations/*.schemas.ts` (Joi).
7. `foo.module.ts` — `MongooseModule.forFeature`, declare controller + providers,
   `exports: [FooManager]` if other modules need it.
8. Register the module in `app.module.ts`.
9. Constants/enums/messages in `common/constants` + `common/enums` — no inline
   literals. Errors in `errors.constants.ts`.
10. Tests in `server/tests/*.spec.ts` (manager + any pure util).

## Moving logic out of a controller

If a controller has an `if`, `throw`, `.map`, fetch-then-check, or data shaping:
- Validation / format checks → the manager method it calls (or a Joi pipe).
- Authorization like "owns this record" → a manager method, e.g.
  `cancelOwn(id, phone)`.
- Building entities from the request user → pass the user fields to the manager
  and let it resolve (e.g. name fallback).

## Before you're done

- `cd server && npx tsc --noEmit && npm test`
- `npm --prefix client run build`
- `make rebuild` and verify the running container (local + Docker, per CLAUDE.md)
