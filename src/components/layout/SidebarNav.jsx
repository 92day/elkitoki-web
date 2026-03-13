export default function SidebarNav({ navSections, activePage, alertsCount, theme, setTheme, setActivePage, currentUser, onLogout }) {
  const displayName = currentUser?.name || '구이일';
  const displayRole = currentUser?.role === 'site_manager' ? '소장' : (currentUser?.role || '소장');
  const avatarLabel = displayName?.trim()?.charAt(0) || '구';

  return (
    <div className="sidebar">
      {navSections.map((section) => (
        <div className="sidebar-section" key={section.title}>
          <div className="sidebar-label">{section.title}</div>
          {section.items.map((item) => {
            const count = item.countKey === 'alerts' ? alertsCount : null;
            return (
              <div
                className={`nav-item ${activePage === item.key ? 'active' : ''} ${item.disabled ? 'disabled-nav-item' : ''}`}
                key={item.key}
                onClick={() => !item.disabled && setActivePage(item.key)}
                role="button"
                tabIndex={item.disabled ? -1 : 0}
                onKeyDown={(event) => {
                  if (!item.disabled && (event.key === 'Enter' || event.key === ' ')) {
                    setActivePage(item.key);
                  }
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {count !== null && <span className="nav-count">{count}</span>}
              </div>
            );
          })}
        </div>
      ))}

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="avatar">{avatarLabel}</div>
          <div className="user-info">
            <div className="name">{displayName}</div>
            <div className="role">{displayRole}</div>
          </div>
        </div>
        <button className="sidebar-logout-btn" type="button" onClick={onLogout}>로그아웃</button>
        <div className="theme-card">
          <div>
            <div className="theme-card-label">테마 모드</div>
            <div className="theme-card-mode">{theme === 'light' ? '라이트 모드' : '다크 모드'}</div>
          </div>
          <label className="theme-switch">
            <input
              type="checkbox"
              checked={theme === 'light'}
              onChange={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
              aria-label="라이트 모드 전환"
            />
            <span className="theme-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
}
