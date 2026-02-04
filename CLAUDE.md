# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Package Manager**: npm

## Project Structure

- `src/app/` - App Router pages and layouts
- `@/*` - Import alias for `./src/*`

## Key Configuration

- ESLint: Flat config with Next.js core-web-vitals and TypeScript rules
- Fonts: Geist Sans and Geist Mono via `next/font`
