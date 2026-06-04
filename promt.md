# ════════════════════════════════════════════════════════════════════
# AV/IT COPILOT DASHBOARD — PROMPT MAESTRO COMPLETO v2.0
# Charmex Internacional · Gestión de Señal de Vídeo · Barcelona
# NovaStar COEX + Pixelhue PixelFlow
# Despliegue: Vercel Free + Supabase Free ($0/mes indefinido)
# ════════════════════════════════════════════════════════════════════

## ROL Y CONTEXTO

Actúa como Arquitecto de Software Principal especializado en sistemas AV/IT
y gestión de señal de vídeo LED profesional. Tu misión es desarrollar la
plataforma interna "AV/IT Copilot Dashboard" para Charmex Internacional
(oficina de Barcelona), una herramienta de productividad técnica para el
equipo de Gestión de Señal que trabaja diariamente con:

  · Procesadores NovaStar serie COEX: MX40 Pro, MX30, MX20, CX80 Pro, KX20
  · Matrices y procesadores Pixelhue: Q8 Flagship, P20, P10, consolas U5/U3
  · Software de control: NovaStar VMP, NovaLCT, Pixelhue PixelFlow

Perfiles de usuario internos:
  · Técnico AV Junior — calculadora, checklist de campo, KB lectura
  · Técnico AV Senior — todo + edición catálogo + configurador avanzado
  · Comercial / Preventa — dashboard, copilot IA, generación de ofertas PDF
  · Admin — gestión de usuarios, base de datos, inventario

---

## PILA TECNOLÓGICA — MANDATORIA SIN EXCEPCIONES

Framework:       Next.js 14+ con App Router estricto + TypeScript
UI Components:   Tailwind CSS + Shadcn/ui (dark mode obligatorio)
Estado Global:   Zustand (slices por dominio funcional, sin Redux)
3D Visual:       React Three Fiber (R3F) + @react-three/drei
PDF (cliente):   @react-pdf/renderer — NUNCA Puppeteer ni jsPDF en servidor
Base de datos:   Supabase (PostgreSQL + GoTrue Auth + Realtime + Storage)
IA Integrada:    Anthropic Claude API (claude-sonnet-4, max_tokens: 2048)
Cache/ISR:       Next.js ISR revalidate: 86400 para catálogo técnico

---

## ESTÉTICA UI/UX — INDUSTRIAL AV PROFESIONAL

Paleta de color base:
  · Fondo principal:   bg-slate-950  (#020617)
  · Superficies:       bg-zinc-900   (#18181b)
  · Bordes:            border-zinc-800 (#27272a)
  · Texto primario:    text-slate-100
  · Texto secundario:  text-slate-400
  · Acento NovaStar:   #dc2626  (rojo)
  · Acento Pixelhue:   #2563eb  (azul)
  · Acento alertas:    #f59e0b  (amber)
  · Acento éxito:      #10b981  (emerald)

Tipografía:
  · Display / títulos: font-mono para valores numéricos técnicos
  · UI general:        Inter o Geist (Shadcn default)
  · Monoespaciado:     JetBrains Mono para puertos, resoluciones, códigos

Referencia de diseño: NovaStar VMP + Pixelhue PixelFlow + Barco Event Master.
PROHIBIDO aspecto genérico/consumer/SaaS claro. Todo es dark, denso y técnico.

---

## MÓDULO 1 — DASHBOARD PRINCIPAL OPERATIVO

Archivo: src/app/(dashboard)/page.tsx

Secciones obligatorias:
  A. Barra de estado global
     · Indicador de conexión Supabase Realtime (punto verde/rojo pulsante)
     · Contador de tickets abiertos con badge de urgencia
     · Fecha/hora en tiempo real (formato técnico: DD-MM-YYYY HH:mm:ss)

  B. Grid de KPIs (4 métricas principales)
     · Proyectos activos (estado: en_campo + confirmado)
     · Tickets de soporte abiertos (OPEN + IN_PROGRESS)
     · Equipos en campo (inventory_units con estado EN_CAMPO)
     · Próximo evento en días (calculado desde projects.event_date)

  C. Timeline de proyectos activos
     · Tarjetas por proyecto: cliente, ubicación, estado, técnico asignado
     · Estados con color: PRESUPUESTO(zinc) → CONFIRMADO(blue) →
       EN_CAMPO(amber) → CERRADO(emerald)
     · Click en tarjeta → drawer lateral con detalle completo

  D. Panel de alertas inteligentes
     · Firmware desactualizado (cruzar inventory_units con firmware_versions)
     · Equipos en campo con más de X días sin check-in
     · Proyectos con evento en menos de 48h sin checklist completado

  E. Accesos rápidos (grid de botones)
     · Nueva calculadora · Nuevo proyecto · Crear ticket · Copilot IA

Datos: Supabase Realtime subscription en proyectos y tickets.
       ISR para catálogo. Cero polling innecesario.

---

## MÓDULO 2 — MOTOR DE CÁLCULO DE SEÑAL (DOMAIN ENGINE PURO)

Archivo: src/lib/engine/calculators.ts

TODAS estas funciones deben ser TypeScript puro, sin dependencias UI,
100% testeables con Jest de forma aislada.

### 2.1 Cálculo de puertos NovaStar

export interface PortCalculationResult {
  totalPixels: number;
  portsRequired: number;
  bandwidthMbps: number;
  pixelsPerPort: number;
  utilizationPercent: number;
  isOverloaded: boolean;
  recommendation: string;
}

export function calculateNovaStarPorts(
  width: number,
  height: number,
  refreshRate: 60 | 120 | 144,
  bitDepth: 8 | 10 | 12,
  portType: '1G' | '5G_COEX' | '10G'
): PortCalculationResult

Constantes exactas de ingeniería NovaStar:
  · 1G / 8-bit  / 60Hz  → 655,360 px por puerto
  · 1G / 10-bit / 60Hz  → 327,680 px por puerto
  · 1G / 8-bit  / 120Hz → 327,680 px por puerto
  · 1G / 12-bit / 60Hz  → 218,453 px por puerto
  · COEX 5G / 8-bit / 60Hz → 655,360 × 5 = 3,276,800 px por puerto
  · 10G / 8-bit / 60Hz  → 655,360 × 10 = 6,553,600 px por puerto
  Escala lineal para refresh rates no estándar: capacity × (60 / hz)

Capacidades máximas por procesador (leer de BD, hardcode solo como fallback):
  · MX40 Pro: 14,100,000 px · max_width: 16,384 · max_height: 8,192
  · MX30:      9,300,000 px
  · MX20:      4,600,000 px

### 2.2 Cálculo de tarjetas Pixelhue

export interface PixelhueCardResult {
  inputCardsRequired: number;
  outputCardsRequired: number;
  totalSlots: number;
  chassisRequired: number;
  layerBudget: number;
  isQ8Compatible: boolean;
}

export function calculatePixelhueCards(
  inputs4K: number,
  outputs4K: number,
  layerCount: number,
  targetModel: 'Q8' | 'P20' | 'P10'
): PixelhueCardResult

Capacidades Q8: 48 entradas 4K, 16 salidas 4K, 32 capas 4K / 64 capas 2K.
Capacidades P20: 4 entradas 4K, 4 salidas (2 main + 2 aux), 7 capas.

### 2.3 Cálculo eléctrico y térmico

export function calculateTotalPower(
  processors: Array<{ model: string; watts: number; quantity: number }>,
  ledCabinets: number,
  wattsPerCabinet: number
): { totalWatts: number; processorWatts: number; ledWatts: number }

export function calculateThermalBTU(totalWatts: number): number
// BTU/h = W × 3.41214 — CONSTANTE EXACTA, no aproximar

### 2.4 Pérdida óptica de fibra

export interface FiberLossResult {
  totalLossdB: number;
  cableLossdB: number;
  connectorLossdB: number;
  safetyMarginOk: boolean; // margen mínimo recomendado: 3dB
  maxRecommendedLength: number; // metros
}

export function calculateFiberLoss(
  lengthKm: number,
  connectorCount: number,
  fiberType: 'multimode_OM3' | 'multimode_OM4' | 'singlemode_OS2'
): FiberLossResult

Constantes de atenuación:
  · Multimodo OM3/OM4 a 850nm: α = 3.5 dB/km
  · Monomodo OS2 a 1310nm:     α = 0.4 dB/km
  · Pérdida por conector LC/PC: β = 0.75 dB
  · Pérdida por conector LC/APC: β = 0.3 dB

### 2.5 Presupuesto de proyecto

export function estimateProjectCost(
  bom: Array<{ model: string; quantity: number; unitPrice: number }>,
  laborDays: number,
  laborRatePerDay: number,
  travelCosts: number
): { subtotal: number; labor: number; total: number; marginSuggested: number }

---

## MÓDULO 3 — CONFIGURADOR RACK 3D PROCEDIMENTAL

Archivo: src/components/canvas/Rack3DVisualizer.tsx

Motor: React Three Fiber + @react-three/drei
PROHIBIDO: cargar archivos .gltf / .obj / .fbx desde Supabase Storage.
TODO se renderiza con primitivas geométricas parametrizadas.

Estructura visual del rack:
  · Chasis exterior: boxGeometry(1.2, 2.2, 0.8) · wireframe · color zinc-700
  · Panel frontal: boxGeometry(1.19, 2.19, 0.02) · color zinc-800 · opacidad 0.8
  · Raíles laterales: cylinderGeometry para tornillos decorativos

Por cada equipo en el rack (RackUnitItem):
  · Cuerpo: boxGeometry(1.05, ru × 0.044, 0.7)
    NovaStar → color #dc2626 (rojo)  |  Pixelhue → color #2563eb (azul)
  · Indicador LED estado: SphereGeometry(0.015)
    ONLINE → #10b981  |  ERROR → #ef4444  |  WARN → #f59e0b
  · Puertos traseros: CylinderGeometry(0.012, 0.012, 0.05) por cada puerto
  · Etiqueta del modelo: <Text> de @react-three/drei · color blanco · tamaño 0.04

Interactividad:
  · onClick en unidad → onSelectItem(item.id) → panel lateral con specs
  · onPointerOver → highlight con emissive color
  · OrbitControls: enableZoom + enablePan + maxPolarAngle Math.PI/2
  · Grid helper: args[10,10] · sectionColor zinc-800 · cellColor zinc-900
  · Iluminación: ambientLight(0.4) + pointLight(pos[5,10,5], intensity 1.2)
    + directionalLight(pos[-3,5,-3], intensity 0.6)

Export visual:
  · Botón "Captura 3D" → gl.domElement.toDataURL('image/png') → adjuntar a PDF

Props del componente:
  interface Rack3DVisualizerProps {
    items: RackItem[];
    onSelectItem: (id: string) => void;
    selectedItemId: string | null;
    showCables: boolean;
  }

---

## MÓDULO 4 — GENERADOR PDF TÉCNICO (CLIENT-SIDE)

Archivo: src/components/reports/EngineReportPDF.tsx

Motor: @react-pdf/renderer — ejecutado SOLO en el navegador.
El botón de descarga usa: const blob = await pdf(<EngineReportPDF .../>).toBlob()

Estructura del documento A4:

  PORTADA
  · Logo Charmex (si existe en /public) + "División de Gestión de Señal"
  · Nombre del proyecto, cliente, ubicación
  · Técnico responsable, fecha de emisión, número de revisión (Rev. 1.0)
  · Clasificación: CONFIDENCIAL / USO INTERNO / ENTREGA CLIENTE

  SECCIÓN 1 — Especificaciones de la matriz LED
  · Resolución total: W × H píxeles
  · Píxeles totales, pitch LED, número de gabinetes
  · Dimensiones físicas del muro (calculadas desde gabinete × unidades)

  SECCIÓN 2 — Análisis de procesamiento y señal
  · Procesador seleccionado: modelo, firmware versión, capacidad máx
  · Puertos requeridos vs disponibles (tabla con % de ocupación)
  · Ancho de banda de red total en Mbps
  · Tabla de distribución de gabinetes por puerto

  SECCIÓN 3 — Diagrama de ruteo de señal
  · Texto descriptivo INPUT → PROCESADOR → PUERTOS → GABINETES LED
  · Tabla de conexiones: cable, origen, destino, tipo de señal

  SECCIÓN 4 — Infraestructura eléctrica y climatización
  · Potencia total W (procesadores + LED)
  · Disipación BTU/h calculada exacta
  · Número de circuitos recomendados (16A / 32A)
  · Nota de ingeniería: ventilación mínima 1U entre procesadores Pixelhue

  SECCIÓN 5 — Presupuesto de enlace óptico (si aplica)
  · Longitud de tirada, tipo de fibra, conectores
  · Pérdida total dB calculada, margen de seguridad

  SECCIÓN 6 — BOM (Bill of Materials)
  · Tabla: Ref | Equipo | Función | Qty | Precio unit | Total
  · Subtotal hardware, costes de integración, total estimado

  SECCIÓN 7 — Checklist de puesta en marcha
  · Lista de verificación por fase (compacta, checkboxes vacíos para imprimir)

  SECCIÓN 8 — Notas técnicas y revisiones
  · Campo de notas libres del técnico
  · Historial de revisiones del documento

---

## MÓDULO 5 — KNOWLEDGE BASE Y SOPORTE POSTVENTA

Archivo: src/app/(dashboard)/support/page.tsx
Componentes: TicketForm, TicketList, KBArticleView, SupportSearch

Flujo de ticket:
  OPEN → IN_PROGRESS → RESOLVED → [opcional] KNOWLEDGE_BASE

Campos de ticket:
  · Título descriptivo del síntoma
  · Marca: NovaStar | Pixelhue | Ambas
  · Modelo afectado (select del catálogo BD)
  · Categoría de fallo:
      RED (IP, VLAN, switch)  |  SYNC (genlock, timing)
      EDID (resolución, handshake)  |  FIRMWARE (versión, flasheo)
      HARDWARE (físico, conector)  |  SOFTWARE_VMP  |  SOFTWARE_PIXELFLOW
  · Descripción detallada del síntoma
  · Causa raíz identificada (rellenar al resolver)
  · Pasos de solución detallados (rellenar al resolver)
  · Archivos adjuntos (screenshots, logs) → Supabase Storage

Buscador full-text:
  Supabase full-text search en columnas: title + issue_description + solution_steps
  Filtros laterales: marca · categoría · estado · modelo · fecha

"Promover a Knowledge Base":
  · Botón visible solo en tickets RESOLVED
  · Cambia status → KNOWLEDGE_BASE y marca kb_published: true
  · Aparece inmediatamente en sección KB del equipo
  · KB organizada por categoría con contador de vistas (kb_view_count++)

Índice de fallos frecuentes preinsertados en BD:
  · NovaStar VMP: pérdida de sincronía por cable Cat6 no certificado
  · NovaStar COEX: error de bucle de redundancia mal configurado
  · Pixelhue: EDID forzado necesario para señales 4K@60Hz en matrices Q8
  · Pixelhue PixelFlow: capas no visibles por orden Z incorrecto
  · General: temperatura elevada por falta de ventilación en rack cerrado

---

## MÓDULO 6 — COPILOT DE PREVENTA IA

Archivo: src/app/(dashboard)/copilot/page.tsx

Formulario de briefing técnico:
  · Resolución total del muro (W × H en píxeles o en metros con pitch)
  · Tipo de evento: RENTAL_EVENTO | INSTALACION_FIJA | BROADCAST_ESTUDIO
  · Fuentes de señal disponibles: HDMI / DP / SDI / IP (multi-select)
  · Número de fuentes simultáneas en pantalla (capas)
  · Presupuesto orientativo de hardware (€)
  · Restricciones de espacio: U de rack disponibles
  · Requisitos especiales: redundancia / HDR / baja latencia / outdoor

Llamada a Claude API:
  Model: claude-sonnet-4
  System prompt especializado:
    "Eres el ingeniero senior de Charmex Internacional, experto en NovaStar
    COEX (MX40 Pro, MX30, MX20) y Pixelhue (Q8, P20, P10). Dados los
    parámetros de un proyecto AV, recomienda la configuración óptima de
    procesamiento de señal con justificación técnica detallada. Responde
    siempre en español técnico. Incluye: procesador principal recomendado,
    alternativa económica, número de puertos requeridos, advertencias
    técnicas críticas, y lista de materiales básica."

  User message: briefing estructurado en JSON
  Temperatura: 0.3 (respuestas técnicas deterministas)

Respuesta parseada y mostrada en:
  · Tarjeta "Configuración recomendada" con el procesador sugerido
  · Tarjeta "Alternativa" con opción más económica
  · Lista de advertencias técnicas en rojo/amber
  · Botón "Cargar en configurador" → exporta al Módulo 3
  · Botón "Generar PDF preventa" → exporta al Módulo 4

Historial de consultas guardado en tabla copilot_sessions de Supabase.

---

## MÓDULO 7 — CHECKLIST INTELIGENTE DE CAMPO

Archivo: src/app/(dashboard)/projects/[id]/checklist/page.tsx

Las listas se almacenan en Supabase (deployment_checklists + checklist_items).
Estado de cada ítem se actualiza en tiempo real vía Supabase Realtime.
Progreso por fase visible en porcentaje con barra de progreso.

FASE 0 — Preparación en oficina Barcelona (pre-evento)
  [ ] Confirmar versión firmware certificada para modelo del proyecto
  [ ] Descargar firmware desde repositorio oficial NovaStar/Pixelhue
  [ ] Backup archivo .vmp de la configuración previa del cliente (si existe)
  [ ] Backup preset PixelFlow de eventos anteriores del mismo cliente
  [ ] Preparar switch Ethernet gestionado (configurar VLANs 10/20 de señal LED)
  [ ] Verificar latiguillos de fibra óptica (OM3/OM4 para distancias < 300m)
  [ ] Test de patching: HDMI 2.0 + DP 1.4 con EDID correcto
  [ ] Revisar BOM vs inventario físico en almacén
  [ ] Cargar IPs fijas planificadas en hoja de red del proyecto
  [ ] Cargar proyecto en Copilot para revisión técnica final

FASE 1 — Transporte y montaje
  [ ] Embalaje verificado vs BOM (checklist física firmada)
  [ ] Procesadores en flight case con espuma a medida
  [ ] Fibra óptica bobinada sin curvas menores de radio mínimo
  [ ] Albaranes de entrega firmados
  [ ] Test de comunicación remota con técnico in-situ (Teams/WhatsApp)

FASE 2 — Puesta en marcha in situ (evento / instalación)
  [ ] Escaneo de subred con nmap / NovaLCT: detectar IPs de controladoras
  [ ] Asignar IPs fijas a procesadores NovaStar (evitar DHCP en producción)
  [ ] Actualizar firmware si la versión del equipo no coincide con la certificada
  [ ] Configurar bucle de redundancia A/B en puertos de fibra COEX
  [ ] Forzar EDID nativo en matrices Pixelhue (deshabilitar handshake auto)
  [ ] Cargar archivo .vmp de configuración en NovaStar VMP
  [ ] Calibración de color por gabinete con NovaLCT (exportar .vcf)
  [ ] Test de carga al 100% de píxeles (pantalla blanca completa 5 min)
  [ ] Verificar temperatura de procesadores (< 65°C en operación continua)
  [ ] Test de redundancia: desconectar cable principal, verificar switchover < 1s
  [ ] Registro fotográfico del rack y el muro LED terminado

FASE 3 — Post-evento y entrega
  [ ] Backup configuración final del evento en Supabase Storage
  [ ] Exportar reporte técnico PDF final con Módulo 4
  [ ] Actualizar estados de inventory_units (EN_CAMPO → STOCK)
  [ ] Crear ticket de incidencias si hubo problemas (promover a KB si resuelto)
  [ ] Enviar informe de entrega al cliente/distribuidor

---

## MÓDULO 8 — MATRIZ DE RUTEO DE SEÑAL 2D

Archivo: src/components/canvas/SignalMatrixCanvas.tsx
Estado: Zustand slice useCanvasStore

Visualización tipo grid:
  · Eje Y: puertos de salida del procesador (numerados 1..N)
  · Eje X: gabinetes LED en orden físico (izquierda→derecha, arriba→abajo)
  · Cada celda: gabinete asignado al puerto correspondiente
  · Color por puerto: paleta automática (10 colores distintos para 10 puertos)

Interactividad:
  · Clic en gabinete → asignar al puerto activo seleccionado
  · Barra lateral de puertos: click para seleccionar puerto activo
  · Indicador de carga por puerto: píxeles asignados / capacidad máx (%)
    Verde < 70% · Amber 70-90% · Rojo > 90% → alerta de sobrecarga
  · Validación en tiempo real: bloquear asignación si supera capacidad del puerto
  · Botón "Auto-distribuir": algoritmo greedy que distribuye gabinetes
    uniformemente entre puertos respetando capacidad máxima

Export:
  · html2canvas o canvas.toDataURL → PNG para incluir en PDF técnico
  · JSON de configuración → guardar en project_connections de Supabase

---

## MÓDULO 9 — INVENTARIO Y GESTIÓN DE STOCK

Archivo: src/app/(dashboard)/inventory/page.tsx

Tabla inventory_units con campos:
  id, product_id (FK), serial_number, status, purchase_date,
  warranty_expires, firmware_version, last_service_date,
  assigned_project_id, notes, location_label

Estados del ciclo de vida del equipo:
  STOCK → RESERVADO → EN_CAMPO → EN_REPARACIÓN → BAJA

Vistas:
  · Kanban board por estado (drag-and-drop para mover entre columnas)
  · Tabla filtrable por modelo / marca / estado / fecha de garantía

Alertas automáticas generadas por la BD:
  · Garantía expira en < 30 días → badge amber
  · Firmware inferior a versión certificada → badge rojo + link de actualización
  · Equipo EN_CAMPO más de 30 días → badge amber (posible equipo perdido)

Asignación a proyecto:
  · Modal de reserva: seleccionar unidades específicas por serial number
  · Al confirmar: status → RESERVADO, assigned_project_id = project.id
  · Al regresar de campo: bulk update → STOCK

---

## MÓDULO 10 — GESTIÓN DE FIRMWARE

Archivo: src/app/(dashboard)/firmware/page.tsx

Tabla firmware_versions:
  id, product_id (FK), version_string, release_date,
  is_certified (boolean), vmp_min_version, pixelflow_min_version,
  release_notes, known_issues, download_url, checksum_sha256

Vistas:
  · Tabla por modelo con versión certificada actual destacada
  · Historial de versiones con notas de release expandibles
  · Campo "Notas de campo Charmex" por versión (problemas en instalaciones reales)

Alertas cruzadas con inventario:
  · Query: inventory_units WHERE firmware_version < (SELECT version FROM
    firmware_versions WHERE product_id = ... AND is_certified = true)
  · Lista de equipos a actualizar con enlace directo a su ticket de mantenimiento

---

## MÓDULO 11 — CATÁLOGO TÉCNICO COMPLETO

Archivo: src/app/catalog/[model]/page.tsx (ISR revalidate: 86400)

Por cada modelo, página estática con:
  · Especificaciones completas de la tabla products + product_ports
  · Tabla de puertos I/O con resoluciones máximas, velocidades, Hz soportados
  · Calculadora rápida embebida (usa las funciones del Módulo 2)
  · Link al datasheet PDF en Supabase Storage
  · Casos de uso recomendados
  · Equipos compatibles (matrices Pixelhue + procesadores NovaStar)

Modelos NovaStar a incluir con datos completos:
  MX40 Pro: 20 puertos RJ45 1G, 3×HDMI 2.0, 1×DP 1.4, 2×12G-SDI,
            14.1M px, 16384×8192 max, VMP + NovaLCT, HDR10/HLG 10/12-bit
  MX30:     10 puertos RJ45 1G, 1×HDMI 2.0, 1×DP 1.4, 2×3G-SDI, 9.3M px
  MX20:     6 puertos RJ45 1G, 4.6M px
  CX80 Pro: Todo-en-uno, entradas 8K/4K nativas por tarjetas
  KX20:     Compacto, matriz y control integrados

Modelos Pixelhue a incluir con datos completos:
  Q8:   48 ent 4K, 16 sal 4K, 32 capas 4K, seamless switching, tarjetas modulares
  P20:  4 ent 4K, 2 sal 4K main + 2 aux, 7 capas simultáneas
  P10:  Versión reducida instalaciones corporativas fijas
  U5:   Consola control física, pantallas táctiles duales, T-Bar, botones mecánicos
  U3:   Consola compacta, control de ruteo serie Q/P, presets en vivo

---

## MÓDULO 12 — AUTENTICACIÓN Y ROLES (Supabase Auth + RLS)

Tabla user_profiles: id (FK auth.users), role, full_name, department, avatar_url

Roles y permisos:
  TÉCNICO_JUNIOR:  lectura catálogo, calculadora, checklist, KB lectura
  TÉCNICO_SENIOR:  todo junior + edición proyectos + edición catálogo + tickets
  COMERCIAL:       dashboard, copilot IA, generación PDF, lectura inventario
  ADMIN:           acceso total + gestión usuarios + configuración BD

RLS policies obligatorias:
  products:           SELECT para todos (público)
  projects:           ALL solo para auth.uid() = user_id o role = ADMIN
  inventory_units:    SELECT todos autenticados, UPDATE solo SENIOR/ADMIN
  support_tickets:    ALL para autenticados
  firmware_versions:  SELECT todos, INSERT/UPDATE solo ADMIN
  copilot_sessions:   SELECT/INSERT solo propio user_id

Middleware Next.js (middleware.ts):
  Proteger /dashboard/* → redirect /login si no autenticado
  Proteger /admin/* → verificar role = ADMIN

---

## ESQUEMA BD SUPABASE — SQL DDL COMPLETO

Ejecutar en Supabase SQL Editor en el siguiente orden:

-- EXTENSIONES
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm"; -- Para full-text search

-- MARCAS
create table public.brands (
  id uuid primary key default uuid_generate_v4(),
  name varchar(100) not null unique,
  accent_color varchar(7) default '#888888',
  logo_url text,
  created_at timestamptz default now()
);

-- CATEGORÍAS
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  name varchar(100) not null unique,
  created_at timestamptz default now()
);

-- PRODUCTOS / CATÁLOGO
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  brand_id uuid references public.brands(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete cascade not null,
  model varchar(100) not null unique,
  max_pixel_capacity bigint,
  max_width_limit integer,
  max_height_limit integer,
  rack_units integer not null default 1,
  power_consumption_watts integer not null default 0,
  software_compatibility varchar(100),
  datasheet_url text,
  technical_specs jsonb not null default '{}'::jsonb,
  created_at timestamptz default now()
);

-- PUERTOS POR PRODUCTO
create table public.product_ports (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete cascade not null,
  port_type varchar(50) not null,
  direction varchar(10) not null check (direction in ('INPUT','OUTPUT')),
  quantity integer not null default 1,
  max_res_width integer,
  max_res_height integer,
  hz_support integer default 60,
  bandwidth_gbps numeric(4,1)
);

-- PERFILES DE USUARIO
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role varchar(20) not null default 'TÉCNICO_JUNIOR'
    check (role in ('TÉCNICO_JUNIOR','TÉCNICO_SENIOR','COMERCIAL','ADMIN')),
  full_name varchar(255),
  department varchar(100),
  avatar_url text,
  created_at timestamptz default now()
);

-- PROYECTOS
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id),
  name varchar(255) not null,
  client_name varchar(255),
  location varchar(255),
  event_date date,
  status varchar(20) default 'PRESUPUESTO'
    check (status in ('PRESUPUESTO','CONFIRMADO','EN_CAMPO','CERRADO')),
  total_width_px integer not null default 1920,
  total_height_px integer not null default 1080,
  led_pitch numeric(4,2),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ÍTEMS DEL PROYECTO (BOM)
create table public.project_items (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete restrict not null,
  quantity integer not null default 1,
  unit_price numeric(10,2) default 0,
  rack_position_index integer,
  custom_notes text
);

-- CONEXIONES DE SEÑAL
create table public.project_connections (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade not null,
  source_item_id uuid references public.project_items(id) on delete cascade not null,
  source_port_id uuid references public.product_ports(id) on delete cascade not null,
  target_item_id uuid references public.project_items(id) on delete cascade not null,
  target_port_id uuid references public.product_ports(id) on delete cascade not null,
  cable_type varchar(50),
  cable_length_m integer,
  connection_tag varchar(100)
);

-- TICKETS DE SOPORTE
create table public.support_tickets (
  id uuid primary key default uuid_generate_v4(),
  title varchar(255) not null,
  brand_affected varchar(50),
  model_affected varchar(100),
  fault_category varchar(30) default 'GENERAL'
    check (fault_category in ('RED','SYNC','EDID','FIRMWARE','HARDWARE',
                              'SOFTWARE_VMP','SOFTWARE_PIXELFLOW','GENERAL')),
  issue_description text not null,
  root_cause text,
  solution_steps text,
  status varchar(20) default 'OPEN'
    check (status in ('OPEN','IN_PROGRESS','RESOLVED','KNOWLEDGE_BASE')),
  kb_published boolean default false,
  kb_view_count integer default 0,
  created_by uuid not null references auth.users(id),
  resolved_by uuid references auth.users(id),
  created_at timestamptz default now(),
  resolved_at timestamptz,
  search_vector tsvector generated always as (
    to_tsvector('spanish', coalesce(title,'') || ' ' ||
    coalesce(issue_description,'') || ' ' ||
    coalesce(solution_steps,''))
  ) stored
);
create index tickets_search_idx on public.support_tickets using gin(search_vector);

-- INVENTARIO
create table public.inventory_units (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete restrict not null,
  serial_number varchar(100) unique,
  status varchar(20) default 'STOCK'
    check (status in ('STOCK','RESERVADO','EN_CAMPO','EN_REPARACIÓN','BAJA')),
  firmware_version varchar(50),
  purchase_date date,
  warranty_expires date,
  last_service_date date,
  assigned_project_id uuid references public.projects(id),
  location_label varchar(100),
  notes text,
  created_at timestamptz default now()
);

-- VERSIONES DE FIRMWARE
create table public.firmware_versions (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete cascade not null,
  version_string varchar(50) not null,
  is_certified boolean default false,
  release_date date,
  vmp_min_version varchar(50),
  pixelflow_min_version varchar(50),
  release_notes text,
  known_issues text,
  charmex_field_notes text,
  download_url text,
  checksum_sha256 varchar(64),
  created_at timestamptz default now()
);

-- CHECKLISTS DE DESPLIEGUE
create table public.deployment_checklists (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade not null,
  phase varchar(20) not null
    check (phase in ('PREPARACION','TRANSPORTE','IN_SITU','POST_EVENTO')),
  completed_by uuid references auth.users(id),
  phase_completed_at timestamptz,
  created_at timestamptz default now()
);

create table public.checklist_items (
  id uuid primary key default uuid_generate_v4(),
  checklist_id uuid references public.deployment_checklists(id) on delete cascade not null,
  description text not null,
  is_completed boolean default false,
  completed_by uuid references auth.users(id),
  completed_at timestamptz,
  sort_order integer default 0
);

-- SESIONES COPILOT IA
create table public.copilot_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id),
  project_id uuid references public.projects(id),
  briefing_input jsonb not null,
  ai_response text not null,
  recommended_model varchar(100),
  created_at timestamptz default now()
);

-- DATOS SEMILLA
insert into public.brands (name, accent_color) values
  ('NovaStar', '#dc2626'),
  ('Pixelhue', '#2563eb');

insert into public.categories (name) values
  ('Procesador LED'),
  ('Matriz de Conmutación'),
  ('Consola de Control'),
  ('Accesorio');

-- RLS
alter table public.products enable row level security;
alter table public.projects enable row level security;
alter table public.support_tickets enable row level security;
alter table public.inventory_units enable row level security;
alter table public.firmware_versions enable row level security;
alter table public.copilot_sessions enable row level security;
alter table public.user_profiles enable row level security;

create policy "productos lectura publica" on public.products for select using (true);
create policy "proyectos propietario" on public.projects for all using (auth.uid() = user_id);
create policy "tickets autenticados" on public.support_tickets for all using (auth.role() = 'authenticated');
create policy "inventario autenticados" on public.inventory_units for select using (auth.role() = 'authenticated');
create policy "firmware lectura publica" on public.firmware_versions for select using (true);
create policy "copilot propio usuario" on public.copilot_sessions for all using (auth.uid() = user_id);
create policy "perfil propio" on public.user_profiles for all using (auth.uid() = id);

---

## OPTIMIZACIONES FREE TIER — MANDATORIAS

1. @react-pdf/renderer SIEMPRE en cliente. Nunca en API route ni Edge Function.
2. Three.js / R3F: solo primitivas geométricas, cero assets externos cargados.
3. ISR en /catalog/*: revalidate 86400. Cero queries Supabase en navegación estática.
4. Supabase Realtime: activar SOLO en /dashboard y /support. Desuscribir en cleanup.
5. Singleton Supabase client: un solo createBrowserClient en src/lib/supabase/client.ts
6. next/image para todas las imágenes con lazy loading y formato WebP automático.
7. Zustand persist: guardar en localStorage solo el estado de UI (no los datos de BD).
8. SWR o React Query para queries con cache: staleTime mínimo 5 minutos en catálogo.

---

## ORDEN DE SPRINTS RECOMENDADO

Sprint 1 (Fundación):
  · Schema SQL completo en Supabase
  · Autenticación con Supabase Auth + middleware Next.js
  · Catálogo técnico con ISR + todos los modelos NovaStar/Pixelhue insertados
  · Motor de cálculo calculators.ts con tests unitarios Jest

Sprint 2 (Dashboard operativo):
  · Dashboard principal con KPIs y Realtime
  · Gestión de inventario y stock
  · Gestor de firmware con alertas cruzadas

Sprint 3 (Configuradores visuales):
  · Rack 3D con React Three Fiber
  · Matriz de ruteo 2D con Zustand
  · Generador PDF técnico completo

Sprint 4 (Soporte y campo):
  · Knowledge Base + tickets con full-text search
  · Checklist inteligente de despliegue por fases
  · Notificaciones y alertas automáticas

Sprint 5 (IA y pulido final):
  · Copilot de preventa con Claude API
  · Tests E2E con Playwright
  · Performance audit y optimizaciones finales
  · Documentación técnica del sistema
ANALIZA COMPLETAMENTE NOVASTAR Y PIXELHUE Y SUS WEBS Y AÑADE TODO. 
# 


════════════════════════════════════════════════════════════════════
# FIN DEL PROMPT MAESTRO — AV/IT Copilot Dashboard v2.0
# Charmex Internacional · Barcelona · $0/mes en Vercel + Supabase Free
# ════════════════════════════════════════════════════════════════════