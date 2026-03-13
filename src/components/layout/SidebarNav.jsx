export default function SidebarNav({ navSections, activePage, alertsCount, setActivePage, currentUser, onOpenMyPage }) {
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
        <button className="user-card user-card-button" type="button" onClick={onOpenMyPage}>
          <div className="avatar">{avatarLabel}</div>
          <div className="user-info">
            <div className="name">{displayName}</div>
            <div className="role">{displayRole}</div>
          </div>
          <span className="user-card-arrow">›</span>
        </button>
      </div>
    </div>
  );
}
