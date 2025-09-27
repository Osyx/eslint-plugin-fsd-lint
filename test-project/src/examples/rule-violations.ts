/**
 * This file demonstrates various ESLint FSD rule violations
 * All imports are commented out to avoid actual lint errors
 * Uncomment specific lines to test individual rules
 */

// ============================================
// 1. fsd/forbidden-imports violations
// ============================================

// ❌ Feature importing from pages (higher layer)
// import { DashboardPage } from '@pages/dashboard';

// ❌ Entity importing from features (higher layer)
// import { LoginForm } from '@features/auth';

// ❌ Shared importing from entities (higher layer)
// import { User } from '@entities/user';

// ============================================
// 2. fsd/no-relative-imports violations
// ============================================

// ❌ Relative import across different slices
// import { profileService } from '../../profile/model/profileService';

// ❌ Relative import across different layers
// import { Button } from '../../../shared/ui/Button';

// ✅ VALID: Relative import within same slice
import { authService } from '../model/authService';

// ============================================
// 3. fsd/no-public-api-sidestep violations
// ============================================

// ❌ Direct import from internal model file
// import { userSlice } from '@entities/user/model/slice';

// ❌ Direct import from internal UI component
// import { UserCard } from '@entities/user/ui/UserCard';

// ❌ Direct import from internal service file (within segment)
// import { UserService } from '@entities/user/services/UserService';

// ✅ VALID: Import through public API
import { User } from '@entities/user';

// ✅ VALID: Import from segment level (NEW)
import { userService } from '@entities/user/services';

// ============================================
// 4. fsd/no-cross-slice-dependency violations
// ============================================

// ❌ Feature importing from another feature
// import { profileService } from '@features/profile';

// ❌ Entity importing from another entity
// import { Post } from '@entities/post';

// ❌ Page importing from another page
// import { LoginPage } from '@pages/login';

// ============================================
// 5. fsd/no-ui-in-business-logic violations
// ============================================

// In entities/user/model/slice.ts:
// ❌ Business logic importing UI
// import { UserCard } from '../ui/UserCard';

// ============================================
// 6. fsd/no-global-store-imports violations
// ============================================

// ❌ Direct import of global store
// import { store } from '@app/store';
// import { store } from '../../app/store';

// ✅ VALID: Using hooks instead
import { useSelector, useDispatch } from 'react-redux';

// ============================================
// 7. fsd/ordered-imports violations
// ============================================

// ❌ BAD ORDER:
// import { formatDate } from '@shared/lib';
// import { User } from '@entities/user';
// import { LoginForm } from '@features/auth';
// import { useStore } from '@app/store';
// import { Header } from '@widgets/header';

// ✅ CORRECT ORDER:
// import { useStore } from '@app/store';        // app
// import { LoginForm } from '@features/auth';   // features
// import { User } from '@entities/user';         // entities
// import { Header } from '@widgets/header';      // widgets
// import { formatDate } from '@shared/lib';      // shared

export {};