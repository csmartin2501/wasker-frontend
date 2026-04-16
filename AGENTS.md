# AGENTS.md - Wasker Frontend Codebase Guidelines

This file provides instructions for agentic coding agents working in the Wasker Frontend repository.

## Table of Contents
1. [Build Commands](#build-commands)
2. [Linting Commands](#linting-commands)
3. [Testing Commands](#testing-commands)
4. [Code Style Guidelines](#code-style-guidelines)
5. [Import Guidelines](#import-guidelines)
6. [Formatting Guidelines](#formatting-guidelines)
7. [TypeScript Guidelines](#typescript-guidelines)
8. [Naming Conventions](#naming-conventions)
9. [Error Handling](#error-handling)
10. [Angular Specific Guidelines](#angular-specific-guidelines)
11. [Cursor/Copilot Rules](#cursorcopilot-rules)

---

## Build Commands

- `npm run build` or `ng build`: Builds the project for production (default configuration)
- `npm run build:development` or `ng build --configuration development`: Builds for development
- `npm run watch` or `ng build --watch --configuration development`: Builds in watch mode for development
- `npm start` or `ng serve`: Starts the development server at http://localhost:4200/
- `ng serve --configuration development`: Same as above with explicit dev config

To build for specific environments:
- Production (default): `ng build`
- Development: `ng build --configuration development`

## Linting Commands

Currently, no explicit linting configuration is found in the repository. However, Angular CLI supports linting if configured.

If linting is set up:
- `ng lint`: Runs linting on the entire project
- `ng lint --fix`: Attempts to fix auto-fixable linting errors
- `ng lint --format stylish`: Uses stylish formatter for output

To set up linting (if needed):
1. Add `@angular-eslint/*` dev dependencies
2. Create `.eslintrc.json` configuration
3. Add lint script to package.json: `"lint": "ng lint"`

## Testing Commands

- `npm test` or `ng test`: Runs unit tests via Karma
- `ng test --code-coverage`: Runs tests with coverage report
- `ng test --watch=false`: Runs tests once and exits (useful for CI)
- `ng test --browsers=ChromeHeadless`: Runs tests in headless Chrome

To run a single test suite:
```bash
ng test --include="src/app/**/*.spec.ts"
```

To run a specific test file:
```bash
ng test --include="src/app/components/example/example.component.spec.ts"
```

End-to-end tests:
- `ng e2e`: Runs end-to-end tests (requires adding an e2e package first)

## Code Style Guidelines

Based on `.editorconfig` and Angular best practices:

### General Formatting
- Character set: UTF-8
- Indentation: 2 spaces (not tabs)
- Trailing whitespace: Trimmed
- Files end with a newline
- TypeScript files use single quotes (as per .editorconfig)

### Line Length
- No specific line length limit enforced via .editorconfig for TypeScript
- Aim for 100-120 characters for readability when practical

### File Organization
- One component/service/pipe/etc. per file
- Files named according to Angular naming conventions (see below)
- Keep functions focused and small (< 50 lines when possible)

## Import Guidelines

### Order of Imports
1. Angular/core/library imports (e.g., `@angular/core`, `@angular/common`)
2. Third-party library imports (e.g., `rxjs`, `bootstrap`, `sweetalert2`)
3. Application imports (relative paths)
   - Relative imports should be ordered by proximity: same directory, parent directories, then deeper nested
   - Use relative paths (`./`, `../`) rather than absolute paths from src root when possible

### Import Syntax
```typescript
// Good
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

// Avoid barrel imports when they reduce clarity
// Prefer explicit paths over index.ts barrels
```

### Specific Rules
- Do not import from `node_modules` directly in application code (use package names)
- Avoid default exports; use named exports for better tree-shaking
- In Angular modules, import components, directives, and pipes before services

## Formatting Guidelines

### TypeScript Formatting
- Semicolons: Required
- Quotes: Single quotes (except for template literals)
- Comma-dangle: Never (no trailing commas in object literals/arrays)
- Curly braces: Same line for blocks (K&R style)
- Control statements: Space before opening parenthesis
- Function calls: No space between function name and opening parenthesis

### Template (HTML) Formatting
- Indentation: 2 spaces
- Attribute quotes: Double quotes
- Self-closing tags: Include trailing slash (`<br />`, `<img src="..." />`)
- Directive shorthand: Prefer `*ngIf`, `*ngFor` over template tags
- Event bindings: Use parentheses `()`
- Property bindings: Use brackets `[]`

### CSS/SCSS Formatting
- Indentation: 2 spaces
- Selectors: Each on new line for multiple selectors
- Property-value pairs: Indented one level
- Closing brace: On its own line
- Vendor prefixes: Group together
- Use meaningful class names following BEM-like conventions when appropriate

## TypeScript Guidelines

### Types and Interfaces
- Prefer interfaces over types for object shapes (except when needing union/intersection types)
- Name interfaces with capital letter (PascalCase)
- Do not prefix interfaces with 'I' (e.g., `User` not `IUser`)
- Use type aliases for union types, tuples, and complex types
- Avoid `any` type; use `unknown` when type is truly unknown and perform type checking
- Mark optional properties with `?` (not `| undefined` for object properties)

### Classes and Components
- Use `readonly` for properties that shouldn't change after initialization
- Prefer constructor injection for dependencies
- Keep constructors light; avoid complex logic in constructors
- Use getters/setters for computed properties when appropriate
- Implement `OnDestroy` and unsubscribe from subscriptions

### RxJS Best Practices
- Use async pipe in templates when possible to avoid manual subscriptions
- If subscribing in component, unsubscribe in `ngOnDestroy`
- Prefer higher-order operators (`map`, `filter`, `switchMap`) over nesting
- Use `takeUntil` pattern for multiple subscriptions when needed
- Handle errors with `catchError` or `finalize` operators

## Naming Conventions

### Files and Directories
- Use kebab-case for files and directories: `user-profile.component.ts`
- Feature modules: `feature-name.module.ts`
- Components: `feature-name.component.ts`
- Services: `feature-name.service.ts`
- Pipes: `feature-name.pipe.ts`
- Directives: `feature-name.directive.ts`
- Guards: `feature-name.guard.ts`
- Interfaces: `model-name.model.ts` or placed in `models/` directory
- Enums: `enum-name.enum.ts` or placed in `enums/` directory
- Constants: `constant-name.constant.ts` or in `constants/` directory

### Symbols
- Classes, interfaces, enums, types: PascalCase (`UserProfileComponent`)
- Functions, methods, variables: camelCase (`calculateTotal`, `userService`)
- Constants: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)
- Directives selectors: prefix with app- (`app-user-profile`)
- Component selectors: prefix with app- (`<app-user-profile>`)
- Observable variables: suffix with `$` (`users$`, `loading$`)

### Acronyms and Initialisms
- Treat as words: `UserHTMLInputElement` not `UserHTMLElement`
- For constants: `XML_HTTP_REQUEST` not `XmlHttpRequest`

## Error Handling

### General Principles
- Handle errors gracefully; don't leave try/catch empty
- Log errors appropriately for debugging
- Show user-friendly messages, not technical details
- Use Angular's ErrorHandler for global error handling when needed

### HTTP Error Handling
- Use `catchError` operator from rxjs
- Provide fallback values when appropriate
- Redirect to error pages for critical errors
- For 401/403, consider redirecting to login or showing access denied

### Validation Errors
- Display form validation errors clearly
- Use Angular's built-in validators when possible
- Show errors only after user interaction (touched/dirty)

### Logging
- Use console.error, console.warn, console.log judiciously
- Consider creating a logger service for more control
- Remove excessive logging before production

## Angular Specific Guidelines

### Modules
- Feature modules should declare their components, directives, pipes
- Core module for singleton services and app-wide components
- Shared module for reusable components, directives, pipes
- Lazy load feature modules when beneficial for performance
- Avoid re-exporting modules unnecessarily

### Components
- Use `ChangeDetectionStrategy.OnPush` when possible
- Prefer `@Input()` and `@Output()` for communication
- Use ViewChild/ContentChild sparingly
- Keep templates simple; move complex logic to component class
- Use trackBy in *ngFor for performance with lists

### Services
- Provide services in root when app-wide singleton is desired (`providedIn: 'root'`)
- Use hierarchical injectors for scoped services when needed
- Keep services focused on a single concern
- Separate data access services from business logic services

### State Management
- For simple state, use RxJS BehaviorSubject or ReplaySubject in services
- For complex state, consider NgRx or Akita
- Avoid storing large amounts of state in component properties
- Immutable updates when using Redux-like patterns

### Performance
- Use `trackBy` in *ngFor
- Lazy load images and modules
- Use pure pipes when appropriate
- Detach change detection for components that don't need it
- Consider using `ng-container` to avoid extra DOM elements

## Cursor/Copilot Rules

No specific Cursor rules (.cursor/rules/ or .cursorrules) or Copilot rules (.github/copilot-instructions.md) were found in this repository.

If using GitHub Copilot, consider adding:
- `.github/copilot-instructions.md` with project-specific guidance
- Cursor rules in `.cursor/rules/` for project-specific AI behavior

Recommended additions for this project:
1. Angular-specific code generation prompts
2. TypeScript strict mode adherence reminders
3. RxJS best practices reminders
4. Angular template syntax guidance

## Additional Notes

This project uses:
- Angular CLI 15.2.6
- TypeScript ~4.9.4
- Jasmine/Karma for testing
- Bootstrap 5.3.8 for styling
- RxJS ~7.8.0 for reactive programming
- SweetAlert2 for UI dialogs

When in doubt, follow Angular Style Guide: https://angular.io/guide/styleguide

Last updated: $(date)