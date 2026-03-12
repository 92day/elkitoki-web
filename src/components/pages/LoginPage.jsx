import { useState } from 'react';

export default function LoginPage({ loading, error, onLogin }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin1234!');

  function handleSubmit(event) {
    event.preventDefault();
    onLogin?.({ username, password });
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-badge">{'ELK'}</div>
        <div className="login-title">{'\uc5d8\ud0a4\ud1a0\ud0a4 \uad00\ub9ac\uc790 \ub85c\uadf8\uc778'}</div>
        <div className="login-subtitle">{'\ud604\uc7a5 \ub300\uc2dc\ubcf4\ub4dc\uc5d0 \uc811\uc18d\ud558\ub824\uba74 \uacc4\uc815\uc73c\ub85c \ub85c\uadf8\uc778\ud558\uc138\uc694.'}</div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group compact-field">
            <label className="form-label" htmlFor="username">{'Username'}</label>
            <input id="username" className="form-input" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
          </div>
          <div className="form-group compact-field">
            <label className="form-label" htmlFor="password">{'Password'}</label>
            <input id="password" type="password" className="form-input" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button className="btn-primary login-submit" type="submit" disabled={loading}>{loading ? '\ub85c\uadf8\uc778 \uc911...' : '\ub85c\uadf8\uc778'}</button>
        </form>

        <div className="login-help">
          <div>{'\uae30\ubcf8 \uac1c\ubc1c \uacc4\uc815'}</div>
          <div>{'admin / admin1234!'}</div>
        </div>
      </div>
    </div>
  );
}
