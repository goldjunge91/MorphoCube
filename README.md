# MorphoCube: Eine moderne Webapp für Morphologische Analyse

## Projektübersicht

Schwerpunkt von MorphoCube richtet sich an Fachleute in den Bereichen Ingenieurwesen, Produktentwicklung, Forschung und Entwicklung sowie Innovationsmanagement.
MorphoCube ist eine webbasierte Anwendung zur Erstellung und Verwaltung morphologischer Kästen mit einem intuitiven Drag-and-Drop-Interface und einem rollenbasierten Authentifizierungssystem. Die Anwendung ermöglicht es Benutzern, komplexe Problemstellungen systematisch zu untersuchen und innovative Lösungskonzepte zu entwickeln.
### Was ist ein Morphologischer Kasten?

Der Morphologische Kasten (auch bekannt als Zwicky-Box) ist eine systematische Kreativitätstechnik zur Problemlösung und Innovation. Er wurde von dem Schweizer Astrophysiker Fritz Zwicky entwickelt und strukturiert komplexe Probleme in:

- **Parameter**: Grundlegende Aspekte oder Funktionen eines Systems
- **Ausprägungen**: Mögliche Variationen oder Lösungsoptionen für jeden Parameter

Durch systematische Kombination dieser Elemente können umfassende Lösungsräume erkundet werden.

## Kernfunktionalitäten

### 1. Authentifizierung & Benutzerverwaltung
- Rollenbasiertes System mit mehreren Benutzerebenen:
  - **Benutzer**: Erstellen und verwalten eigener morphologischer Kästen
  - **Tenant-Administrator**: Verwaltung von Benutzern innerhalb eines Mandanten
  - **Super-Administrator**: Systemweite Verwaltung und Konfiguration
- Sichere Anmeldung mit JWT-Authentifizierung
- Profilmanagement für alle Benutzer

### 2. Morphologischer Kasten - Editor
- Intuitive Benutzeroberfläche zur Definition von Parametern und Ausprägungen
- Drag-and-Drop-Funktionalität für:
  - Neuanordnung von Parametern und Ausprägungen
  - Gruppierung verwandter Elemente
  - Kombination von Ausprägungen für Lösungskonzepte
- Farbkodierung für bessere Visualisierung und Organisation
- Versionskontrolle zur Nachverfolgung von Änderungen
- Erweiterte Parameter-Metadaten:
  - Gewichtung von Parametern nach Wichtigkeit
  - Beschreibungstexte für komplexe Parameter
  - Anhängen von Referenzen oder Erklärungen
- Visuelle Pfade zur Darstellung ausgewählter Lösungskombinationen

### 3. Datenbank & Organisation
- Persönliche und geteilte Datenbanken für morphologische Kästen
- Kategorisierung und Tagging-System
- Leistungsfähige Suchfunktion
- Vorlagen für schnellen Start
- Branchenspezifische Vorlagen:
  - Engineering Design
  - Software-Architektur
  - Produktentwicklung
  - Strategische Planung
- Bibliothek wiederverwendbarer Parameter und Ausprägungen

### 4. Zusammenarbeit & Teilung
- Echtzeit-Kollaboration an gemeinsamen Projekten
- Differenzierte Zugriffsrechte (Lesen/Schreiben)
- Kommentarfunktion für Diskussionen
- Benachrichtigungen bei Änderungen
- Strukturierte Feedback-Runden mit Stakeholdern
- Abstimmungsfunktion für Teams zur Bewertung von Lösungskombinationen

### 5. Export & Integration
- Export in gängige Formate (PDF, Excel, CSV)
- API-Schnittstelle für Integration mit anderen Tools
- Offline-Funktionalität für grundlegende Operationen
- Embedding-Option für Präsentationen und Berichte
- Generierung interaktiver Visualisierungen für Präsentationen

### 6. Analyse & Bewertungstools
- Kompatibilitätsmatrizen zur Bewertung der Verträglichkeit zwischen Ausprägungen
- Scoring-Module zur qualitativen und quantitativen Bewertung von Lösungskombinationen
- Konsistenzprüfung für ausgewählte Lösungswege
- Automatische Generierung vielversprechender Lösungskombinationen
- Bewertungsfilter basierend auf:
  - Technischer Machbarkeit
  - Kosten und Ressourceneffizienz
  - Innovationsgrad
  - Benutzerdefinierte Kriterien

### 7. Erweiterte Visualisierung
- Heatmaps zur Darstellung von Bewertungsmetriken
- Netzwerkgraphen zur Visualisierung von Parameterbeziehungen
- Interaktive 3D-Darstellung für komplexe Lösungsräume
- Dashboard mit Key Performance Indicators für Lösungskonzepte
- Exportierbare Entscheidungsbäume

## Technische Architektur

### Frontend
- React mit TypeScript für typsichere Entwicklung
- Tailwind CSS für responsive Gestaltung
- Shadcn UI-Komponenten für konsistentes Design
- React DnD für Drag-and-Drop-Funktionalität
- React Query für effizientes State-Management
- D3.js und react-chartjs-2 für komplexe Datenvisualisierungen

### Backend
- Node.js mit Express
- RESTful API-Design
- JWT für sichere Authentifizierung
- Drizzle ORM mit PostgreSQL für relationale Datenspeicherung
- Zod für Validierung und TypeScript-Integration
- WebSocket-Implementierung für Echtzeit-Kollaboration

### Datenmodell
- Flexible Schemastrukturen für morphologische Kästen
- Versionierung und Änderungsverfolgung
- Beziehungsmodelle für Parameter-Interdependenzen
- Metadaten-Framework für erweiterte Attributierung
- Tenant-Isolation für Multi-Mandanten-Betrieb

### Deployment & DevOps
- Docker-Container für einfache Bereitstellung
- CI/CD-Pipeline für automatisierte Tests und Deployment
- Monitoring und Logging für Systemstabilität
- Skalierbare Cloud-Infrastruktur

## Anwendungsfälle

### Produktentwicklung
- Systematische Exploration alternativer Produktarchitekturen
- Identifikation neuartiger Kombinationen bestehender Technologien
- Bewertung verschiedener Designalternativen anhand definierter Kriterien

### Strategische Planung
- Entwicklung von Zukunftsszenarien durch systematische Kombination von Einflussfaktoren
- Bewertung strategischer Optionen und Entscheidungsalternativen
- Identifikation blinder Flecken in der Strategieentwicklung

### Problemlösung im Engineering
- Strukturierte Zerlegung komplexer technischer Herausforderungen
- Systematische Generierung von Lösungsalternativen
- Bewertung von Konzepten nach technischer Machbarkeit und Ressourceneffizienz

### Innovation und Kreativität
- Überwindung von Denkblockaden durch systematische Exploration
- Entdeckung unkonventioneller Lösungsansätze
- Kombinatorische Innovation durch Neukombination bestehender Elemente

## Entwicklungsfahrplan

### Phase 1: Grundlegende Infrastruktur (Abgeschlossen)
- Projektsetup und Grundarchitektur
- Authentifizierungssystem und Benutzerverwaltung
- Basiskomponenten UI-Bibliothek

### Phase 2: Kern-Editor (Aktuell)
- Umsetzung des Drag-and-Drop-Editors für morphologische Kästen
- CRUD-Operationen für Parameter und Ausprägungen
- Persistenz der erstellten Kästen

### Phase 3: Kollaboration & Erweiterung
- Implementierung der Sharing-Funktionalität
- Echtzeit-Kollaboration
- Versionskontrolle und Änderungsverfolgung

### Phase 4: Erweitertes Feature-Set
- Erweiterte Exportfunktionen
- Vorlagen-System
- Analysetools für morphologische Kästen
- Kompatibilitätsmatrizen für Parameter-Ausprägungen

### Phase 5: Optimierung & Finalisierung
- Performance-Optimierung
- Erweiterte Suchfunktionen
- Multi-Tenant-Fähigkeiten
- Mehrsprachigkeit (Deutsch/Englisch)

### Phase 6: Branchen-Spezialisierung
- Entwicklung branchenspezifischer Module
- Integration von Fachterminologie
- Vorlagen für spezifische Anwendungsdomänen
- Anpassung an domänenspezifische Best Practices

### Phase 7: KI-Erweiterungen
- Implementierung von Vorschlagsalgorithmen für Parameter und Ausprägungen
- Automatisierte Bewertungshilfen für generierte Lösungskombinationen
- Semantische Analyse von Parameterbeschreibungen
- Lernende Systeme zur kontinuierlichen Verbesserung der Vorschläge

## Installation und Entwicklung

### Voraussetzungen
- Node.js (v18 oder höher)
- PostgreSQL (v14 oder höher)
- pnpm als Paketmanager

### Projektstruktur

MorphoCube folgt einer modularen, erweiterbaren Architektur mit klarer Trennung der Verantwortlichkeiten:

#### Client-Struktur

```
client/
├── src/
│   ├── app/                      # App-Router Struktur
│   │   ├── (auth)/               # Authentifizierungsbereich
│   │   │   ├── login/            # Login-Seite
│   │   │   ├── register/         # Registrierung
│   │   │   └── layout.tsx        # Auth-Layout
│   │   ├── (dashboard)/          # Dashboard-Bereich
│   │   │   ├── layout.tsx        # Dashboard-Layout
│   │   │   ├── page.tsx          # Homepage
│   │   │   ├── my-boxes/         # Meine Kästen
│   │   │   ├── shared/           # Geteilte Kästen
│   │   │   └── templates/        # Vorlagen
│   │   ├── (admin)/              # Admin-Bereich
│   │   │   ├── users/            # Benutzerverwaltung
│   │   │   ├── tenants/          # Tenant-Verwaltung
│   │   │   └── settings/         # Einstellungen
│   │   └── layout.tsx            # Root-Layout
│   ├── components/               # Wiederverwendbare Komponenten
│   │   ├── ui/                   # UI-Basiskomponenten (shadcn)
│   │   ├── layout/               # Layout-Komponenten
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── ...
│   │   ├── morph-box/            # Morphkasten-spezifische Komponenten
│   │   │   ├── editor/           # Editor-Komponenten
│   │   │   ├── viewer/           # Anzeige-Komponenten
│   │   │   ├── parameters/       # Parameter-bezogene Komponenten
│   │   │   ├── attributes/       # Attribut-bezogene Komponenten
│   │   │   ├── solutions/        # Lösungs-bezogene Komponenten
│   │   │   └── compatibility/    # Komponenten für Kompatibilitätsmatrix
│   │   ├── forms/                # Formular-Komponenten
│   │   └── data-display/         # Datenanzeigekomponenten
│   ├── hooks/                    # React Hooks
│   │   ├── use-auth.tsx
│   │   ├── use-morph-box.tsx     # Hook für Morphkasten-Operationen
│   │   ├── use-parameters.tsx    # Hook für Parameter-Management
│   │   └── ...
│   ├── services/                 # API-Services
│   │   ├── api.ts                # Basis-API-Client
│   │   ├── auth-service.ts       # Auth-Service
│   │   ├── morph-box-service.ts  # Morphkasten-Service
│   │   ├── tenant-service.ts     # Tenant-Service
│   │   └── ...
│   ├── stores/                   # Zustandsmanagement
│   │   ├── auth-store.ts         # Auth-Zustand
│   │   ├── morph-box-store.ts    # Morphkasten-Zustand
│   │   └── ...
│   ├── utils/                    # Hilfsfunktionen
│   │   ├── date-utils.ts
│   │   ├── format-utils.ts
│   │   ├── validation-utils.ts
│   │   └── ...
│   ├── constants/                # Konstanten und Konfigurationen
│   ├── styles/                   # Globale Stile
│   ├── types/                    # Client-spezifische Typen
│   ├── App.tsx
│   └── main.tsx
```

#### Server-Struktur

```
server/
├── controllers/                  # API-Controller
│   ├── auth-controller.ts        # Auth-Controller
│   ├── morph-box-controller.ts   # Morphkasten-Controller
│   ├── parameter-controller.ts   # Parameter-Controller
│   ├── attribute-controller.ts   # Attribut-Controller
│   ├── tenant-controller.ts      # Tenant-Controller
│   ├── user-controller.ts        # Benutzer-Controller
│   └── ...
├── middlewares/                  # Express-Middlewares
│   ├── auth-middleware.ts        # Auth-Middleware
│   ├── error-middleware.ts       # Fehlerbehandlung
│   ├── validation-middleware.ts  # Validierungsmiddleware
│   └── ...
├── routes/                       # API-Routen
│   ├── auth-routes.ts            # Auth-Routen
│   ├── morph-box-routes.ts       # Morphkasten-Routen
│   ├── parameter-routes.ts       # Parameter-Routen
│   ├── attribute-routes.ts       # Attribut-Routen
│   ├── tenant-routes.ts          # Tenant-Routen
│   ├── user-routes.ts            # Benutzer-Routen
│   └── ...
├── services/                     # Geschäftslogik
│   ├── auth-service.ts           # Auth-Service
│   ├── morph-box-service.ts      # Morphkasten-Service
│   ├── parameter-service.ts      # Parameter-Service
│   ├── attribute-service.ts      # Attribut-Service
│   ├── tenant-service.ts         # Tenant-Service
│   ├── user-service.ts           # Benutzer-Service
│   └── ...
├── data/                         # Datenzugriff
│   ├── repositories/             # Repositories für Datenbankzugriff
│   │   ├── morph-box-repository.ts
│   │   ├── parameter-repository.ts
│   │   ├── attribute-repository.ts
│   │   └── ...
│   └── database.ts               # Datenbankverbindung
├── utils/                        # Server-Hilfsfunktionen
├── config/                       # Server-Konfiguration
├── validators/                   # Validierungsschemata
│   ├── morph-box-validator.ts
│   ├── parameter-validator.ts
│   ├── attribute-validator.ts
│   ├── user-validator.ts
│   └── ...
└── index.ts                      # Server-Entry-Point
```

#### Shared-Struktur

```
shared/
├── schemas/                      # Datenbankschemas
│   ├── morph-box-schema.ts       # Morphkasten-Schema
│   ├── parameter-schema.ts       # Parameter-Schema
│   ├── attribute-schema.ts       # Attribut-Schema
│   ├── tenant-schema.ts          # Tenant-Schema
│   ├── user-schema.ts            # Benutzer-Schema
│   └── ...
├── types/                        # Gemeinsam genutzte Typendefinitionen
│   ├── morph-box-types.ts        # Morphkasten-Typen
│   ├── parameter-types.ts        # Parameter-Typen
│   ├── attribute-types.ts        # Attribut-Typen
│   ├── tenant-types.ts           # Tenant-Typen
│   ├── user-types.ts             # Benutzer-Typen
│   └── ...
├── constants/                    # Gemeinsam genutzte Konstanten
├── validations/                  # Zod-Validierungsschemata
│   ├── morph-box-zod-schema.ts   # Morphkasten-Validierung
│   ├── parameter-zod-schema.ts   # Parameter-Validierung
│   ├── attribute-zod-schema.ts   # Attribut-Validierung
│   ├── tenant-zod-schema.ts      # Tenant-Validierung
│   ├── user-zod-schema.ts        # Benutzer-Validierung
│   └── ...
└── utils/                        # Gemeinsam genutzte Hilfsfunktionen
```

### Entwicklungsserver starten
```bash
# Installation der Abhängigkeiten
pnpm install

# Umgebungsvariablen konfigurieren
cp env.example .env
# .env-Datei bearbeiten

# Datenbank-Migrationen ausführen
pnpm drizzle:push

# Entwicklungsserver starten
pnpm dev
```

## Mitwirken

Beiträge zum Projekt sind willkommen! Bitte beachten Sie unsere Contribution Guidelines und den Code of Conduct.

## Lizenz

Dieses Projekt ist lizenziert unter [Lizenz einfügen].