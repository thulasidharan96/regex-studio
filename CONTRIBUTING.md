# Contributing to Regex Studio v3

Thank you for your interest in contributing to **Regex Studio v3**! We welcome bug fixes, documentation improvements, translation targets, new analyzers, and visual layout optimizations.

This guide details our monorepo architecture, development setups, testing guidelines, and the pull request submission process.

---

## 🏛️ Architecture Overview

Regex Studio is a client-first, local-first application. There is **no backend runtime, no remote server database, and no session authentication layer**. All computations are executed inside Web Worker threads or directly within the user's browser.

Unidirectional compilation flow:
```
Visual Node Canvas ────► Regex AST ────► Compiler Target ────► Compiled Regex String
                               ▲
Monaco Raw Input ──────────────┘
```

For comprehensive structural descriptions, see:
- [Architecture details](./docs/architecture.md)
- [AST Schema structures](./docs/ast.md)

---

## 🛠️ Local Development Setup

### Prerequisites
- [Bun](https://bun.sh) (v1.1 or higher)
- Git

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/regex-studio.git
   cd regex-studio
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Spin up the development server:
   ```bash
   bun dev
   ```
   Open your browser to [http://localhost:3000](http://localhost:3000) to view the live interface.

---

## 📦 Package Catalogues

Our codebase is split into 11 specialized, decoupled Bun workspaces:

- `@regex-studio/regex-core`: Types, validators, and serializers.
- `@regex-studio/regex-parser`: String parsing pipeline (Tokenizer ➔ Lexer ➔ Parser).
- `@regex-studio/regex-compiler`: Generator engine producing string representations for JavaScript, Python, Go, etc.
- `@regex-studio/regex-analyzer`: Linting tool catching backtracking issues and calculating efficiency scores.
- `@regex-studio/regex-debugger`: stepper tracking matching states and trace lines.
- `@regex-studio/regex-exporters`: Exporters wrapping expressions into third-party libraries (Zod, Ajv, etc.).
- `@regex-studio/storage`: IndexedDB state synchronizers.
- `@regex-studio/stores`: Zustand global state managers.
- `@regex-studio/ui`: Styling primitives and design tokens.
- `@regex-studio/flow-engine`: React Flow visual nodes layout builder.
- `@regex-studio/templates`: Registry of preset standard regex configurations.

---

## 🧪 Testing & Coverage Guidelines

All new visual handlers, parse models, or translation targets must be fully testable. We enforce a **90% code coverage threshold** across packages.

### Unit Testing (Vitest)
Unit tests reside alongside source files as `*.test.ts`.

- Run unit tests:
  ```bash
  bun run test
  ```
- Run tests and inspect coverage levels:
  ```bash
  bun run test:coverage
  ```
  Reports are generated inside `/coverage/` (automatically ignored by Git).

### Integration Testing (Playwright)
End-to-end user flows are validated in `apps/web/playwright`.

- Setup Playwright browsers:
  ```bash
  bun x playwright install --with-deps
  ```
- Execute Playwright integration test:
  ```bash
  bun x playwright test
  ```

---

## 🔄 Release Workflow (Changesets)

We use **Changesets** to log version bumps. Every pull request that introduces functional modifications should contain a changeset file.

1. Generate a changeset description:
   ```bash
   bun run changeset
   ```
2. Follow the prompt to select which package(s) were changed (e.g. `@regex-studio/regex-core`), designate the version type (major/minor/patch), and write a summary.
3. Commit the generated `.changeset/*.md` file alongside your changes.

---

## 💅 Styling & Coding Standards

- **Tailwind CSS Utility Classes**: Standardize layout and colors via Tailwind utilities directly inside components. Do **not** use inline styling attributes or custom CSS sheets.
- **Strict TypeScript**: Avoid assigning elements as `any`. Declare structured interfaces for all functional properties and models.
- **No Side-Effects in Modules**: Keep compilation utilities pure and deterministic.

Thank you for helping us craft the ultimate regular expression workspace!
