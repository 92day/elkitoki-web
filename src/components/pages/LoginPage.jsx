import { useState } from 'react';
import loginDesignImage from '../../assets/img-src/login design.png';
import loginLogoImage from '../../assets/img-src/login logo.png';

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
          <div className="login-brand">
            <img className="login-brand-image" src={loginLogoImage} alt={'엘키토키 로고'} />
          </div>

          <div className="login-hero-graphic">
            <img className="login-hero-design-image" src={loginDesignImage} alt="" aria-hidden="true" />
          </div>

          <div className="login-hero-footer">
            <div className="login-hero-message">
              {'\ud604\uc7a5 \uc18c\ud1b5, \uc548\uc804 \uc54c\ub9bc, \uc791\uc5c5 \uae30\ub85d\uc744'}
              <br />
              {'\ud55c \ud750\ub984\uc73c\ub85c \uc5f0\uacb0\ud558\ub294 \uac74\uc124\ud604\uc7a5 \uc2a4\ub9c8\ud2b8 \uc194\ub8e8\uc158'}
            </div>
            <div className="login-title">{'\uc5d8\ud0a4\ud1a0\ud0a4'}</div>
            <div className="login-subtitle">
              {'Construction Smart Solution'}
              <br />
              <strong>{'L-kitoki'}</strong>
            </div>
          </div>
        </section>

        <section className="login-panel">
          <div className="login-panel-inner">
            <div className="login-panel-badge">{'\ud604\uc7a5 \ucd9c\uc785 \uc778\uc99d'}</div>
            <div className="login-panel-title">{'\uad00\ub9ac\uc790 \ub85c\uadf8\uc778'}</div>
            <div className="login-panel-subtitle">
              {'\ub4f1\ub85d\ub41c \uacc4\uc815\uc73c\ub85c \ub85c\uadf8\uc778\ud574 \uc624\ub298 \uc791\uc5c5 \ud604\ud669\uc744 \ud655\uc778\ud558\uc138\uc694.'}
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group compact-field">
                <label className="form-label" htmlFor="username">{'\uc544\uc774\ub514'}</label>
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
                <label className="form-label" htmlFor="password">{'\ube44\ubc00\ubc88\ud638'}</label>
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
                {transitionName ? '\uc804\ud658 \uc911...' : (loading ? '\ub85c\uadf8\uc778 \uc911...' : '\ub85c\uadf8\uc778')}
              </button>
            </form>

            <div className="login-help">
              <div className="login-help-title">{'\ud14c\uc2a4\ud2b8 \uacc4\uc815'}</div>
              <div>{'admin / admin1234!'}</div>
            </div>

            <div className="login-copyright">{'\u00a9 2026. LGEDX Team 92Days All rights reserved.'}</div>
          </div>
        </section>
      </div>

      {transitionName && (
        <div className="login-transition-overlay" aria-live="polite">
          <div className="login-transition-card">
            <div className="login-transition-badge">{'LOGIN OK'}</div>
            <div className="login-transition-title">{`\uc624\ub298\ub3c4 \uc548\uc804\ud558\uc138\uc694, ${transitionName}\ub2d8`}</div>
            <div className="login-transition-subtitle">{'\ud604\uc7a5 \ub300\uc2dc\ubcf4\ub4dc\ub85c \uc5f0\uacb0\ud558\uace0 \uc788\uc2b5\ub2c8\ub2e4.'}</div>
            <div className="login-transition-line"></div>
          </div>
        </div>
      )}
    </div>
  );
}
