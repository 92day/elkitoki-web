import { useState } from 'react';

export default function LoginPage({ loading, error, onLogin, transitionName }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin1234!');

  function handleSubmit(event) {
    event.preventDefault();
    if (transitionName) return;
    onLogin?.({ username, password });
  }

  return (
    <div className="login-shell">
      <div className="login-layout">
        <section className="login-hero-panel">
          <div className="login-hero-copy">
            <div className="login-hero-caption">LG전자의 공감지능으로<br />현장을 더 안전하게</div>
            <div className="login-title">엘키토키</div>
            <div className="login-subtitle">
              Construction Smart Solution L-kitoki
            </div>
          </div>

          <div className="login-hero-footer">
            <div className="login-hero-message">
              현장 소통, 안전 알림, 작업 기록을
              <br />
              한 흐름으로 연결하는 관리자 솔루션
            </div>
          </div>
        </section>

        <section className="login-panel">
          <div className="login-panel-badge">현장 출입 인증</div>
          <div className="login-panel-title">관리자 로그인</div>
          <div className="login-panel-subtitle">등록된 계정으로 로그인해 오늘 작업 현황을 확인하세요.</div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group compact-field">
              <label className="form-label" htmlFor="username">아이디</label>
              <input
                id="username"
                className="form-input"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                disabled={loading || Boolean(transitionName)}
              />
            </div>
            <div className="form-group compact-field">
              <label className="form-label" htmlFor="password">비밀번호</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                disabled={loading || Boolean(transitionName)}
              />
            </div>

            {error && <div className="login-error">{error}</div>}

            <button className="btn-primary login-submit" type="submit" disabled={loading || Boolean(transitionName)}>
              {transitionName ? '전환 중...' : (loading ? '로그인 중...' : '로그인')}
            </button>
          </form>

          <div className="login-help">
            <div className="login-help-title">테스트 계정</div>
            <div>admin / admin1234!</div>
          </div>
        </section>
      </div>

      {transitionName && (
        <div className="login-transition-overlay" aria-live="polite">
          <div className="login-transition-card">
            <div className="login-transition-badge">LOGIN OK</div>
            <div className="login-transition-title">오늘도 안전하세요 {transitionName}님</div>
            <div className="login-transition-subtitle">현장 대시보드로 연결하고 있습니다.</div>
            <div className="login-transition-line"></div>
          </div>
        </div>
      )}
    </div>
  );
}
