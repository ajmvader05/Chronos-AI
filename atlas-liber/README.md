# Atlas Liber (Windows-only)

Tauri + React + TypeScript + TailwindCSS scaffold for a Windows desktop app.

## Folder structure

```
atlas-liber/
├── index.html
├── package.json
├── postcss.config.cjs
├── tailwind.config.cjs
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
└── src-tauri/
    ├── Cargo.toml
    ├── tauri.conf.json
    └── src/
        └── main.rs
```

## Setup

1. Install Node.js 18+ and Rust (via rustup).
2. Install Tauri prerequisites for Windows (WebView2, MSVC build tools).
3. Install dependencies:

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build (Windows installers)

```bash
npm run build
```

## Scripts

- `npm run dev` – Starts Vite + Tauri in dev mode.
- `npm run build` – Builds the frontend and bundles the Tauri app.
- `npm run preview` – Previews the Vite build.
