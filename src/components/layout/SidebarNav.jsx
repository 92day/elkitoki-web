export default function SidebarNav({ navSections, activePage, alertsCount, theme, setTheme, setActivePage, currentUser }) {
  const displayName = currentUser?.name || '\uad6c\uc774\uc77c';
  const displayRole = currentUser?.role === 'site_manager' ? '\ud604\uc7a5 \ucd1d\uad04 \uad00\ub9ac\uc790' : (currentUser?.role || '\ud604\uc7a5 \ucd1d\uad04 \uad00\ub9ac\uc790');
  const avatarLabel = displayName?.trim()?.charAt(0) || '\uad6c';

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
        <div className="theme-card">
          <div>
            <div className="theme-card-label">{'\ud14c\ub9c8 \ubaa8\ub4dc'}</div>
            <div className="theme-card-mode">{theme === 'light' ? '\ub77c\uc774\ud2b8 \ubaa8\ub4dc' : '\ub2e4\ud06c \ubaa8\ub4dc'}</div>
          </div>
          <label className="theme-switch">
            <input
              type="checkbox"
              checked={theme === 'light'}
              onChange={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
              aria-label={'\ub77c\uc774\ud2b8 \ubaa8\ub4dc \uc804\ud658'}
            />
            <span className="theme-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
}
