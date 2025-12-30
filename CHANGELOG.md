# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - 2025-12-30

### Added
- **Industrial Theme**: Implemented a comprehensive Black & Orange industrial design system using Tailwind CSS variables.
- **Error Handling**: Enhanced UI error reporting for API failures (403, 429, 400).
- **Memory Optimization**: Added cleanup for `URL.createObjectURL` to prevent memory leaks in the browser.

### Changed
- **API SDK**: Migrated from the deprecated/experimental `@google/genai` to the stable `@google/generative-ai` SDK.
- **Gemini Model**: Updated the extraction and mapping model to `gemini-2.0-flash` for better performance and validity.
- **Database Performance**: Refactored `storageService.ts` to use IndexedDB cursors, preventing the loading of full PDF binaries when simply listing templates.
- **Build System**: Updated `index.css` to use the new `@theme` directive compatible with Tailwind v4.

### Fixed
- **API Key Issue**: Resolved the "API Key Expired" loop by implementing the correct SDK and validating the new key.
- **TypeScript Errors**: Fixed strict type checking errors in `storageService.ts` related to `ArrayBuffer` casting.
