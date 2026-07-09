# Regex Studio v3 🚀

A professional, visual, client-first single-page Regular Expression IDE to design, edit, debug, analyze, and compile regular expressions. Built with React, Tailwind CSS, Monaco Editor, React Flow, and IndexedDB.

---

## 🛠️ Features

- **Visual React Flow Builder (AST 3.0)**: Graph-based canvas to visually construct, connect, and customize regular expressions with bidirectional editor syncing.
- **Interactive Matching Debugger**: Simulation stepper that trace matching states, capturing backtrack events, match successes, and fails in real-time.
- **Evil Regex / ReDoS Analyzer**: Proactive static analysis engine that scans AST structures for nested infinite quantifiers, backtracking traps, and overlapping character classes.
- **Polyglot Compilation & Exporter**: Instant target code generation for standard language compilers (JavaScript, TypeScript, Python, Go, Rust, Java, PHP, C#, Ruby) and schemas (Ajv, Zod, JSON Schema).
- **Offline-First Persistence**: In-browser document databases utilizing IndexedDB (Dexie) with robust template library registries.

---

## ⚡ Development Setup & Orchestration (Bun)

We use **Bun** for rapid monorepo orchestration and dependency resolution.

### Development Workflow

```bash
# 1. Install workspace-wide packages
bun install

# 2. Run local development environment (Port 3000)
bun dev

# 3. Compile static production bundle (apps/web/dist)
bun run build

# 4. Perform type verification
bun run typecheck

# 5. Run linter and formatting guidelines
bun run lint
```

### Testing & Quality Gates

```bash
# Run unit test suite
bun run test

# Run unit tests with 90%+ code coverage reporting
bun run test:coverage

# Run Playwright end-to-end integration specs
bun x playwright test
```

---

## 📦 Monorepo Workspace Packages

Our modular workspace is organized under decoupled workspaces:

```text
├── apps/
│   └── web/                   # Single-Page App utilizing Monaco Editor and React Flow
└── packages/
    ├── regex-core/            # Standardized AST v3 typings, schema validators, and serializers
    ├── regex-parser/          # Fault-tolerant regex parser, tokenizer, and lexer pipeline
    ├── regex-compiler/        # AST compiler and code generation for multiple programming targets
    ├── regex-analyzer/        # Static analysis engine checking for ReDoS and backtrack flaws
    ├── regex-debugger/        # Stepper and simulator mapping match events onto AST steps
    ├── regex-exporters/       # Wrapper code templates for validators and schema systems
    ├── storage/               # Dexie IndexDB browser storage synchronizers
    ├── stores/                # Zustand global application state coordination
    ├── ui/                    # Shared design system primitive styles
    ├── flow-engine/           # Visual React Flow node adapters
    └── templates/             # Library of standard regex templates (Email, Phone, IP, JWT)
```

---

## 🔄 Release Management & Changesets

Regex Studio utilizes `@changesets/cli` to orchestrate semantic versioning, automated changelog generation, and dependency bumping:

```bash
# Create a new version changeset entry
bun run changeset

# Bump workspace packages versions automatically based on changesets
bun run version-packages

# Publish packages to the registry
bun run release
```

---

## 📖 Deep-Dive Architecture

For detailed component-level flows and specifications, refer to our comprehensive manuals:
- [System Architecture Specification](./docs/architecture.md)
- [AST Schema Reference](./docs/ast.md)
- [Tokenizer & Parser Pipeline](./docs/parser.md)
- [Compilation Targets](./docs/compiler.md)
- [Extensibility System](./docs/plugins.md)
- [Production Deployment Outlines](./docs/deployment.md)

---

## 🐳 Containerized Deployment

A production-grade multi-stage configuration is available for Docker instances:
```bash
docker build -t regex-studio-v3 .
docker run -d -p 8080:80 regex-studio-v3
```

## License

Apache-2.0
