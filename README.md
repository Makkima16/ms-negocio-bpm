# ms-negocio-bpm

Microservicio de **lógica de negocio** del sistema BPM Valencia (cursos de manipulación de alimentos, exámenes, pagos, certificados, recordatorios). Construido con **AdonisJS 5** (TypeScript) y **MySQL**.

Toda la API (excepto el registro público y el webhook de pagos) exige un JWT emitido por `ms-security`.

---

## Dominio

| Entidad | Descripción |
|---|---|
| `Modulo` | Módulo de un curso (`curso_tipo`, video, material, PDF) |
| `Exam` | Examen asociado a un módulo |
| `Question` | Pregunta de un examen (3 opciones + respuesta correcta) |
| `Client` | Cliente vinculado al `user_id` de ms-security |
| `Register` | Intento de examen con su resultado (`aprobacion`) |
| `Payment` | Pago registrado (pendiente / aceptado / rechazado) |
| `Aprobado` | Certificado emitido a un cliente por tipo de curso |
| `Alarm` / `Patient` | Recordatorios y pacientes asociados (salud pública) |
| `Company` | Empresas colaboradoras |
| `Administrator` | Perfil administrativo |

### Reglas de negocio aplicadas en el servidor

- **Exámenes**: el cliente **solo envía sus respuestas**. El servidor compara contra `questions.correct_choice`, calcula `aprobacion` (todas correctas) y las preguntas correctas nunca se envían al navegador de un cliente.
- **Progreso**: un módulo se considera aprobado si existe un `register` con `aprobacion = true` para algún examen de ese módulo.
- **Pago**: presentar un examen o acceder a los módulos requiere un pago en estado `Aceptada` (HTTP 402 si falta).
- **Certificados**: solo se emiten cuando el cliente aprobó **todos** los módulos del tipo de curso.
- **Recordatorios**: se crean con fecha manual o por defecto a 3 meses; el endpoint de automatización (`/alarms/check`) está protegido con `ALARM_SECRET_TOKEN`.
- **Webhook ePayco**: se rechaza si la firma `x_signature` no coincide con `MD5(customer_id ^ p_key ^ ref ^ transaction ^ amount ^ currency)`.

---

## Estructura

```
ms-negocio-bpm/
├── app/
│   ├── Controllers/Http/       # Controladores REST
│   ├── Models/                 # Modelos Lucid
│   ├── Middleware/             # Auth, AdminOnly
│   └── Services/               # JwtService, AuthService, ApprovalService
├── config/                     # app, cors, database, bodyparser, hash, drive
├── database/migrations/        # Esquema MySQL
├── start/
│   ├── kernel.ts               # Middlewares globales y nombrados
│   └── routes/                 # Rutas por dominio
├── tests/functional/           # Pruebas de seguridad de rutas
└── .env.example                # Plantilla de variables de entorno
```

---

## Autenticación y autorización

`app/Services/JwtService.ts` verifica los JWT **HS512** de ms-security usando `crypto` (sin dependencias extra). Los middlewares:

- `auth`: exige un token válido.
- `admin`: exige rol `Administrador`.

`AuthService` resuelve el cliente del usuario autenticado y evita IDOR: un cliente solo puede operar sobre sus propios datos; un administrador puede operar sobre cualquiera.

---

## Endpoints

### Públicos

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/clients` | Registro de perfil de cliente |
| GET | `/modulos` | Listar módulos |
| GET | `/modulos/tipo/:curso_tipo` | Módulos por tipo de curso |
| GET | `/modulos/:id` | Ver módulo |
| POST | `/api/webhook/epayco` | Confirmación de pago (firma obligatoria) |
| GET | `/alarms/check?token=...` | Automatización de recordatorios |

### Autenticados (`auth`)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/clients/me` | Perfil del cliente autenticado |
| GET | `/buscar_Email`, `/buscar_UserID` | Compatibilidad (limitado al propio usuario) |
| GET | `/clients/:id/payments/accepted` | ¿Tiene pago aceptado? |
| GET | `/clients/:id/payments/exist` | ¿Tiene pago pendiente/aceptado? |
| GET | `/examen/:id` | Ver examen |
| POST | `/exam/check-approval` | ¿Aprobó el módulo? |
| GET | `/modulos/:module_id/questions` | Preguntas (sin respuesta correcta) |
| POST | `/records` | Enviar examen (calificado en servidor) |
| POST | `/payments` | Registrar referencia de pago |
| POST | `/aprobatorio` | Solicitar certificado |
| GET | `/aprobatorio/client/:client_id` | Certificado del cliente |
| POST | `/alarm`, PUT `/patients`... | Recordatorios y pacientes |

### Solo administrador (`admin`)

`/clients`, `/payments`, `/examen`, `/questions`, `/aprobatorio`, `/alarm`, `/patients`, `/admin`, `/dashboard/summary`, `/modulos` (escritura), `/companies` (escritura).

---

## Configuración

Copia `.env.example` a `.env`:

| Variable | Descripción |
|---|---|
| `PORT`, `HOST`, `NODE_ENV` | Servidor |
| `APP_KEY` | Secreto de la app (32+ caracteres) |
| `DB_CONNECTION`, `MYSQL_*` | Conexión MySQL (opcionalmente `MYSQL_SSL=true`) |
| `JWT_SECRET` | **Debe coincidir** con ms-security |
| `CORS_ORIGIN` | Origen permitido del frontend |
| `MS_CORREOS` | URL del microservicio de correos |
| `ALARM_SECRET_TOKEN` | Token del endpoint de automatización |
| `EPAYCO_CUSTOMER_ID`, `EPAYCO_P_KEY` | Credenciales para validar el webhook |

---

## Ejecución

```bash
npm install
cp .env.example .env      # ajusta las credenciales
node ace migration:run
npm run dev               # http://localhost:3333
```

### Pruebas

```bash
npm test
```

### Scripts

| Script | Descripción |
|---|---|
| `npm run dev` | Servidor con recarga |
| `npm run build` | Compila a `build/` |
| `npm run migrate` | Ejecuta migraciones |
| `npm test` | Pruebas Japa |

---

## Notas

- Los controladores validan los campos permitidos (`request.only([...])`); ya no se hace `create(request.body())`.
- Los errores devuelven mensajes JSON con el código HTTP correcto (400/401/402/403/404/409).
- Las migraciones no se modificaron, por lo que la base existente sigue siendo compatible.
