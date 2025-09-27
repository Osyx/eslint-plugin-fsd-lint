import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

// ✅ VALID: Relative import within same slice
import { setAuthenticated, setError } from '../model/slice';
import { LoginCredentials } from '../model/types';

// ✅ VALID: Import from entities via public API
import { User } from '@entities/user';

// ✅ VALID: Import from entities segment level (NEW - flexible segments)
import { userModel } from '@entities/user/model';

// ✅ VALID: Import from shared via alias
import { Button } from '@shared/ui/Button';

// ❌ INVALID Examples (commented out to avoid lint errors):
// import { profileService } from '@features/profile/model/profileService'; // Cross-slice dependency
// import { HomePage } from '../../../pages/home'; // Relative import to different layer
// import { userSlice } from '@entities/user/model/slice'; // Public API sidestep
// import { store } from '@app/store'; // Import from higher layer
// import { store } from '../../../app/store'; // Direct store import

export const LoginForm: React.FC = () => {
  const dispatch = useDispatch();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 실제 구현에서는 API 호출이 들어갈 자리
      if (credentials.email && credentials.password) {
        dispatch(setAuthenticated(true));
      } else {
        dispatch(setError('이메일과 비밀번호를 입력해주세요.'));
      }
    } catch (error) {
      dispatch(setError('로그인 중 오류가 발생했습니다.'));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="email">이메일:</label>
        <input
          type="email"
          id="email"
          value={credentials.email}
          onChange={(e) => setCredentials((prev) => ({ ...prev, email: e.target.value }))}
        />
      </div>
      <div>
        <label htmlFor="password">비밀번호:</label>
        <input
          type="password"
          id="password"
          value={credentials.password}
          onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
        />
      </div>
      <button type="submit">로그인</button>
    </form>
  );
};
