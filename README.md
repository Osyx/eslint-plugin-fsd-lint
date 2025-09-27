# 🚀 eslint-plugin-fsd-lint 🚀

[![npm version](https://img.shields.io/npm/v/eslint-plugin-fsd-lint)](https://www.npmjs.com/package/eslint-plugin-fsd-lint)
[![npm downloads](https://img.shields.io/npm/dt/eslint-plugin-fsd-lint)](https://www.npmjs.com/package/eslint-plugin-fsd-lint)
[![npm bundle size](https://img.shields.io/bundlephobia/min/eslint-plugin-fsd-lint)](https://bundlephobia.com/package/eslint-plugin-fsd-lint)
[![License](https://img.shields.io/npm/l/eslint-plugin-fsd-lint)](https://github.com/effozen/eslint-plugin-fsd-lint/blob/main/LICENSE)

[English](README.md) | [한국어](README.ko.md)

> It supports ESLint 9+ and the new Flat Config system.

## 📖 Introduction

`eslint-plugin-fsd-lint` is an ESLint plugin that enforces best practices for Feature-Sliced Design (FSD) architecture. <br/>  
It is fully **compatible with ESLint 9+** and follows the modern **Flat Config format**, ensuring seamless integration into modern JavaScript and TypeScript projects.

### ✨ Why use this plugin?

- **Flat Config support**: Fully compatible with **ESLint 9+** and the **new Flat Config system**.
- **Strict FSD compliance**: Prevents architectural violations in feature-based project structures.
- **Improves maintainability**: Encourages clear module separation and dependency control.
- **Ensures consistent code quality**: Standardizes import patterns and best practices.
- **Cross-platform compatibility**: Works seamlessly on both Windows and Unix-based systems.
- **Flexible folder naming**: Supports custom folder naming patterns (e.g., `1_app`, `2_pages`).
- **Multiple alias formats**: Supports both `@shared` and `@/shared` import styles.
- **Comprehensive test coverage**: Thoroughly tested with real-world scenarios and edge cases.

### 🔍 What is Feature-Sliced Design?

Feature-Sliced Design (FSD) is a modern architecture pattern that provides a structured approach to organizing frontend applications. <br/>  
This plugin enforces key FSD principles such as **proper layer separation, import restrictions, and dependency management**,  
helping developers build scalable and maintainable codebases.

---

## 📦 Installation

You can install `eslint-plugin-fsd-lint` via **npm** or **pnpm**:

### Using npm:

```shell
npm install --save-dev eslint-plugin-fsd-lint
```

### Using pnpm:

```shell
pnpm add -D eslint-plugin-fsd-lint
```

### Peer Dependencies

This plugin requires ESLint 9+ to work properly.

Make sure you have ESLint installed in your project:

```shell
npm install --save-dev eslint
```

> 💡 Tip: If you're using a monorepo with multiple packages, install eslint-plugin-fsd-lint at the root level to share the configuration across all workspaces.

---

## 🚀 Usage & Configuration

### 🔧 Flat Config Setup (`eslint.config.mjs`)

`eslint-plugin-fsd-lint` is designed for **ESLint 9+** and works seamlessly with the **Flat Config system**. <br/>
To use it in your project, add the following configuration to your `eslint.config.mjs`:

```js
import fsdPlugin from 'eslint-plugin-fsd-lint';

export default [
  // Use the recommended preset
  fsdPlugin.configs.recommended,

  // Or configure rules individually
  {
    plugins: {
      fsd: fsdPlugin,
    },
    rules: {
      // Enforces FSD layer import rules (e.g., features cannot import pages)
      'fsd/forbidden-imports': 'error',

      // Disallows relative imports between slices/layers, use aliases (@)
      // Allows relative imports within the same slice by default (configurable)
      'fsd/no-relative-imports': 'error',

      // Enforces importing only via public API (index files)
      'fsd/no-public-api-sidestep': 'error',

      // Prevents direct imports between slices in the same layer
      'fsd/no-cross-slice-dependency': 'error',

      // Prevents UI imports in business logic layers (e.g., entities)
      'fsd/no-ui-in-business-logic': 'error',

      // Forbids direct import of the global store
      'fsd/no-global-store-imports': 'error',

      // Enforces import order based on FSD layers
      'fsd/ordered-imports': 'warn',
    },
  },
];
```

**Key Principles Enforced by Default:**

- **Layered Imports**: Higher layers cannot import from lower layers (e.g., `features` cannot import `pages`).
- **Slice Isolation**: Slices within the same layer should not directly import each other (`no-cross-slice-dependency`).
- **Public API Usage**: Imports from other slices/layers must go through their public API (`index.js` or `index.ts`). Direct internal imports are forbidden (`no-public-api-sidestep`).
- **Absolute Paths (Aliases)**: Use absolute paths (configured via aliases like `@`) for imports between different slices or layers. Relative paths are generally disallowed (`no-relative-imports`).
- **Relative Paths within Slices**: Relative paths are **allowed** for imports _within the same slice_ (e.g., importing a helper from `../lib` inside a feature). This is configurable via the `allowSameSlice` option in `no-relative-imports` (default: true).

### 📌 Available Configurations

The plugin provides three pre-defined configurations for different strictness levels:

```js
import fsdPlugin from 'eslint-plugin-fsd-lint';

export default [
  // Standard recommended configuration
  fsdPlugin.configs.recommended,

  // Strict configuration (all rules as error)
  // fsdPlugin.configs.strict,

  // Base configuration (less strict)
  // fsdPlugin.configs.base,
];
```

### 🛠️ Advanced Configuration

You can customize the behavior of the rules with advanced options:

```js
import fsdPlugin from 'eslint-plugin-fsd-lint';

export default [
  {
    plugins: {
      fsd: fsdPlugin,
    },
    rules: {
      // Configure alias format and folder patterns
      'fsd/forbidden-imports': [
        'error',
        {
          // Support for @shared or @/shared import styles
          alias: {
            value: '@',
            withSlash: false, // Use true for @/shared format
          },
          // Support for numbered folder prefixes
          folderPattern: {
            enabled: true,
            regex: '^(\\d+_)?(.*)',
            extractionGroup: 2,
          },
        },
      ],

      // Other rules...
    },
  },
];
```

### 📂 Example Project Structure

Here's how an FSD-compliant project might look:

```plaintext
src/
├── app/         (or 1_app/)
│   ├── providers/
│   ├── store.js
│   ├── index.js  // Public API for app
│
├── processes/   (or 2_processes/)
│   ├── auth/
│   ├── onboarding/
│
├── pages/       (or 3_pages/)
│   ├── HomePage/
│   │   ├── ui/     // UI components for HomePage
│   │   └── index.ts  // Public API for HomePage
│   ├── ProfilePage/
│
├── widgets/     (or 4_widgets/)
│   ├── Navbar/
│   │   ├── ui/
│   │   └── index.ts  // Public API for Navbar
│   ├── Sidebar/
│
├── features/    (or 5_features/)
│   ├── login/
│   │   ├── ui/     // UI components for login feature
│   │   ├── model/  // Business logic for login
│   │   └── index.ts  // Public API for login feature
│   ├── registration/
│
├── entities/    (or 6_entities/)
│   ├── user/
│   │   ├── ui/
│   │   ├── model/
│   │   └── index.ts  // Public API for user entity
│   ├── post/
│
├── shared/      (or 7_shared/)
│   ├── ui/       // Reusable UI components
│   │   └── Button/ // Example: Button component
│   ├── lib/      // Utility functions, helpers
│   ├── config/   // Shared configuration
│   └── index.ts    // Public API for shared layer (optional)

```

**Import Examples based on Structure:**

- **Allowed (Alias Import - Cross Slice/Layer):**
  ```javascript
  // features/login/ui/LoginForm.tsx
  import { Button } from '@shared/ui/Button'; // OK: Feature uses Shared UI via alias
  import { getUser } from '@entities/user'; // OK: Feature uses User entity via public API
  ```
- **Allowed (Relative Import - Same Slice):**
  ```javascript
  // features/login/ui/LoginForm.tsx
  import { validateInput } from '../lib/validation'; // OK: Relative import within the 'login' feature slice
  ```
- **Disallowed (Relative Import - Cross Slice/Layer):**
  ```javascript
  // features/login/ui/LoginForm.tsx
  import { config } from '../../../app/config'; // BAD: Relative path to different layer
  import { User } from '../../entities/user/model/types'; // BAD: Relative path + Public API sidestep
  ```
- **Disallowed (Public API Sidestep):**
  ```javascript
  // features/login/ui/LoginForm.tsx
  import { userSlice } from '@entities/user/model/slice'; // BAD: Importing internal module directly
  ```
- **Disallowed (Cross-Slice Dependency):**
  ```javascript
  // features/login/model/auth.ts
  import { startRegistration } from '@features/registration'; // BAD: 'login' feature directly imports 'registration' feature
  ```

> 💡 Tip: Sticking to these import rules, especially using aliases and respecting public APIs, makes your codebase much easier to refactor and maintain.

---

## 🔍 Supported Rules

This plugin provides a set of ESLint rules that enforce **Feature-Sliced Design (FSD) best practices**. <br/>
Each rule helps maintain a **clear module structure, enforce import constraints, and prevent architectural violations**.

| Rule                              | Description                                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **fsd/forbidden-imports**         | Prevents imports from higher layers and cross-imports between slices.                                        |
| **fsd/no-relative-imports**       | Disallows relative imports across different slices or layers. Allows relative imports within the same slice. |
| **fsd/no-public-api-sidestep**    | Prevents direct imports from internal modules, enforcing public API usage.                                   |
| **fsd/no-cross-slice-dependency** | Disallows direct dependencies between slices in the same layer (applies to all layers, not just features).   |
| **fsd/no-ui-in-business-logic**   | Prevents UI imports inside business logic layers (e.g., `entities`).                                         |
| **fsd/no-global-store-imports**   | Forbids direct imports of global state (`store`).                                                            |
| **fsd/ordered-imports**           | Enforces import grouping by layer.                                                                           |

---

## 📌 Rule Details & Examples

### **1️⃣ fsd/forbidden-imports**

**Prevents imports from higher layers and cross-imports between slices.** <br/>  
✅ **Allowed:** `features` can import from `entities` or `shared` <br/>
❌ **Not Allowed:** `features` importing directly from `app`<br/>

```js
// ❌ Incorrect (feature importing from app)
import { config } from '../../app/config';

// ✅ Correct (feature importing from entities/shared)
import { getUser } from '../../entities/user';
import { formatCurrency } from '../../shared/utils';
```

<br/>

### 2️⃣ fsd/no-relative-imports

Disallows relative imports across different slices or layers. <br/>
✅ Allowed: Using project-defined aliases or relative imports within same slice <br/>
❌ Not Allowed: Relative imports between different slices <br/>

```javascript
// ❌ Incorrect (relative import across different slices)
import { fetchUser } from '../another-slice/model/api';

// ✅ Correct (relative import within the same slice)
import { fetchData } from '../model/api';

// ✅ Correct (alias import across slices or layers)
import { Button } from '@shared/ui/Button';
// Also supports @/shared format
import { Button } from '@/shared/ui/Button';
```

#### Available options:

```javascript
// In your eslint.config.js:
'fsd/no-relative-imports': ['error', {
  // Allow relative imports within the same slice (enabled by default)
  allowSameSlice: true,

  // Allow type-only imports to use relative paths (disabled by default)
  allowTypeImports: false,

  // Patterns for test files that can ignore this rule
  testFilesPatterns: ['\\.test\\.', '\\.spec\\.'],

  // Patterns for imports to ignore
  ignoreImportPatterns: []
}]
```

<br/>

### 3️⃣ fsd/no-public-api-sidestep

Prevents direct imports from internal modules of features, widgets, or entities. <br/>
✅ Allowed: Importing from index.ts (public API) or segment level <br/>
❌ Not Allowed: Importing internal files within segments <br/>

```javascript
// ✅ Correct (importing via public API)
import { authSlice } from '../../features/auth';
import { userModel } from '@entities/user/model';  // Segment level is allowed

// ❌ Incorrect (direct internal import)
import { authSlice } from '../../features/auth/slice.ts';
import { userSlice } from '@entities/user/model/slice';  // Internal file not allowed
```

**Note:** Any segment name is allowed (not limited to model/ui/api/lib). This provides flexibility for teams to define their own segment structure.

<br/>

### 4️⃣ fsd/no-cross-slice-dependency

Prevents direct dependencies between slices in the same layer (applies to all layers, not just features). <br/>
✅ Allowed: Communication via lower layers <br/>
❌ Not Allowed: Direct imports between different slices in the same layer <br/>

```javascript
// ❌ Incorrect (slice importing from another slice in the same layer)
import { processPayment } from '../../features/payment';

// ✅ Correct (using entities/shared as an intermediary)
import { PaymentEntity } from '../../entities/payment';

// ❌ Also incorrect (entities slice importing from another entities slice)
import { Product } from '../../entities/product';
// This rule now applies to all layers, not just features!
```

<br/>

### 5️⃣ fsd/no-ui-in-business-logic

Prevents UI imports inside business logic layers (e.g., entities). <br/>
✅ Allowed: UI should only be used inside widgets or pages <br/>
❌ Not Allowed: entities importing UI components <br/>

```javascript
// ❌ Incorrect (entity importing widget)
import { ProfileCard } from '../../widgets/ProfileCard';

// ✅ Correct (widget using entity data)
import { getUser } from '../../entities/user';
```

<br/>

### 6️⃣ fsd/no-global-store-imports

Forbids direct imports of global state (store). <br/>
✅ Allowed: Using useStore or useSelector <br/>
❌ Not Allowed: Direct imports of the store <br/>

```javascript
// ❌ Incorrect (direct import of store)
import { store } from '../../app/store';

// ✅ Correct (using hooks)
import { useStore } from 'zustand';
import { useSelector } from 'react-redux';
```

<br/>

### 7️⃣ fsd/ordered-imports

Enforces import grouping by layer. <br/>
✅ Allowed: Grouping imports by layer <br/>
❌ Not Allowed: Mixed import order <br/>

```javascript
// ❌ Incorrect (random import order)
import { processPayment } from '../features/payment';
import { getUser } from '../entities/user';
import { formatCurrency } from '../shared/utils';
import { loginUser } from '../features/auth';
import { Header } from '../widgets/Header';
import { useStore } from '../app/store';

// ✅ Correct (layered grouping)
import { useStore } from '../app/store'; // App

import { loginUser } from '../features/auth'; // Features
import { processPayment } from '../features/payment';

import { getUser } from '../entities/user'; // Entities

import { formatCurrency } from '../shared/utils'; // Shared

import { Header } from '../widgets/Header'; // Widgets
```

> 💡 Tip: Use `npx eslint --fix` to automatically reorder imports according to FSD layers.

---

## 🛠 Auto-fix Support

Certain rules in `eslint-plugin-fsd-lint` support **automatic fixing** using ESLint's `--fix` option. <br/>  
This allows developers to quickly resolve violations **without manual code adjustments**.

### ✅ Rules Supporting Auto-fix

The following rules can be automatically fixed:

| Rule                    | Description                                                              |
| ----------------------- | ------------------------------------------------------------------------ |
| **fsd/ordered-imports** | Automatically sorts imports based on Feature-Sliced Design (FSD) layers. |

### 🔧 Using `--fix` in ESLint

To apply automatic fixes to your project, simply run:

```shell
npx eslint --fix your-file.js
```

Or, to fix all files in your project:

```shell
npx eslint --fix .
```

### 📌 Example Before & After Auto-fix

❌ Before (fsd/ordered-imports violation)

```javascript
import { processPayment } from '../features/payment';
import { getUser } from '../entities/user';
import { formatCurrency } from '../shared/utils';
import { loginUser } from '../features/auth';
import { Header } from '../widgets/Header';
import { useStore } from '../app/store';
```

<br/>

✅ After (npx eslint --fix applied)

```javascript
import { useStore } from '../app/store'; // App

import { loginUser } from '../features/auth'; // Features
import { processPayment } from '../features/payment';

import { getUser } from '../entities/user'; // Entities

import { formatCurrency } from '../shared/utils'; // Shared

import { Header } from '../widgets/Header'; // Widgets
```

> 💡 Tip: `fsd/ordered-imports` ensures a clean and structured import order based on FSD layers.

---

## 🆕 New Features

### 1. Cross-Platform Compatibility

The plugin now works seamlessly on both Windows and Unix-based systems by normalizing file paths internally.

### 2. Flexible Folder Naming Patterns

You can now use numbered prefixes or other naming conventions for your folders:

```js
// Configure folder pattern support
"fsd/forbidden-imports": ["error", {
  folderPattern: {
    enabled: true,
    regex: "^(\\d+_)?(.*)",
    extractionGroup: 2
  }
}]
```

This allows using structures like:

```
src/
  1_app/
  2_pages/
  3_widgets/
  4_features/
  5_entities/
  6_shared/
```

### 3. Multiple Alias Format Support

The plugin now supports both `@shared` and `@/shared` import styles:

```js
// Configure alias format
"fsd/forbidden-imports": ["error", {
  alias: {
    value: "@",
    withSlash: false  // Use true for @/shared format
  }
}]
```

### 4. Enhanced Cross-Slice Dependency Rule

The `no-cross-slice-dependency` rule now applies to all layers by default, not just features:

```js
// Restrict to features layer only (legacy behavior)
"fsd/no-cross-slice-dependency": ["error", {
  featuresOnly: true
}]
```

### 5. Pre-defined Configuration Profiles

Multiple configuration presets are now available:

- `recommended` - Standard recommended settings
- `strict` - Maximum enforcement
- `base` - Less strict settings for easy adoption

### 6. Comprehensive Test Coverage

The plugin now includes extensive test cases for all rules, covering:

- Basic import scenarios
- Edge cases and complex patterns
- Path variations (Windows, Unix, mixed)
- Custom configurations
- Real-world usage examples

### Path Alias Support

The plugin now properly handles various path alias formats:

```javascript
// Both formats are supported
import { UserCard } from '@entities/user';
import { UserCard } from '@/entities/user';
```

### Dynamic Import Support

All rules now support dynamic imports:

```javascript
// Valid dynamic imports
const UserCard = await import('@entities/user');
const { UserCard } = await import('@entities/user');

// Invalid dynamic imports (will be caught by rules)
const UserCard = await import('@entities/user/ui');
```

### Comprehensive Test Coverage

All rules are now thoroughly tested with:

- Basic import scenarios
- Edge cases and complex patterns
- Path variations (Windows, Unix, mixed)
- Custom configurations
- Real-world usage examples
- Path alias formats
- Dynamic import patterns

---

## 🤝 Contributing

We welcome contributions to improve `eslint-plugin-fsd-lint`! <br/>  
If you have an idea for a new rule or an improvement, feel free to submit a Pull Request.

Check out our [contribution guide](CONTRIBUTING.md).

---

## 📝 License

This project is licensed under the MIT License. <br/>
See the [LICENSE](LICENSE.md) file for details.

<br/>
