import { useEffect } from 'react';
import { AlertSettingsPage, EnvironmentSettingsPage } from '../pages';

function getDisplayRole(role) {
  if (role === 'site_manager') return '소장';
  return role || '소장';
}

export default function MyPageModal({
  open,
  currentUser,
  theme,
  setTheme,
  largeTextEnabled,
  setLargeTextEnabled,
  languages,
  onClose,
  onLogout,
  onSaveMessage,
}) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const displayName = currentUser?.name || '구이일';
  const displayRole = getDisplayRole(currentUser?.role);
  const avatarLabel = displayName.trim().charAt(0) || '구';

  return (
    <div className="mypage-overlay" onClick={onClose}>
      <div className="mypage-dialog" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="mypage-title">
        <div className="mypage-header">
          <div>
            <div className="mypage-eyebrow">My Page</div>
            <h2 className="mypage-title" id="mypage-title">내 계정과 설정</h2>
          </div>
          <button className="photo-modal-close-react react-btn-auto" type="button" onClick={onClose}>
            닫기
          </button>
        </div>

        <div className="mypage-profile-card">
          <div className="mypage-avatar">{avatarLabel}</div>
          <div className="mypage-profile-copy">
            <div className="mypage-profile-name">{displayName}</div>
            <div className="mypage-profile-role">{displayRole}</div>
            <div className="mypage-profile-sub">현장 운영 계정으로 대시보드와 설정을 관리할 수 있습니다.</div>
          </div>
        </div>

        <div className="mypage-content-scroll">
          <div className="panel">
            <div className="panel-title">개인 설정</div>

            <div className="mypage-personal-stack">
              <div className="mypage-theme-card">
                <div>
                  <div className="theme-card-label">테마 모드</div>
                  <div className="theme-card-mode">{theme === 'light' ? '라이트 모드' : '다크 모드'}</div>
                </div>
                <label className="theme-switch">
                  <input
                    type="checkbox"
                    checked={theme === 'light'}
                    onChange={() => {
                      setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
                      onSaveMessage?.('테마 모드를 변경했습니다.');
                    }}
                    aria-label="라이트 모드 전환"
                  />
                  <span className="theme-slider"></span>
                </label>
              </div>

              <div className="mypage-theme-card mypage-accessibility-card">
                <div>
                  <div className="theme-card-label">큰글씨 설정</div>
                  <div className="theme-card-mode">50+ 시니어를 위한 고가독성 화면</div>
                  <div className="mypage-setting-help">
                    메뉴, 버튼, 표, 카드 글자가 전반적으로 커지고 간격도 넓어져 더 직관적으로 보입니다.
                  </div>
                </div>
                <label className="theme-switch">
                  <input
                    type="checkbox"
                    checked={largeTextEnabled}
                    onChange={() => {
                      setLargeTextEnabled((prev) => {
                        const next = !prev;
                        onSaveMessage?.(next ? '큰글씨 모드를 켰습니다.' : '큰글씨 모드를 껐습니다.');
                        return next;
                      });
                    }}
                    aria-label="큰글씨 모드 전환"
                  />
                  <span className="theme-slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="mypage-settings-section">
            <div className="mypage-section-title">알림 설정</div>
            <AlertSettingsPage embedded onSave={onSaveMessage} />
          </div>

          <div className="mypage-settings-section">
            <div className="mypage-section-title">환경 설정</div>
            <EnvironmentSettingsPage embedded languages={languages} onSave={onSaveMessage} />
          </div>
        </div>

        <div className="mypage-footer">
          <button
            className="sidebar-logout-btn mypage-logout-btn"
            type="button"
            onClick={() => {
              onClose?.();
              onLogout?.();
            }}
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
