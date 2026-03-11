export default function SiteTopbar({ wsConnected, clock, dateText }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="site-badge">
          <div className="icon">{'\ud83c\udfd7\ufe0f'}</div>
          <div>
            <div className="site-name">{'\ud55c\uac15 \uc2a4\uce74\uc774\ud0c0\uc6cc \ud604\uc7a5'}</div>
            <div className="site-sub">{'\uc11c\uc6b8 \ub9c8\ud3ec\uad6c \u00b7 \uacf5\uc815\ub960 67% \u00b7 \ud604\uc7a5\ucf54\ub4dc #LGEDX-2026-92'}</div>
          </div>
        </div>
        <div className="divider-v"></div>
        <div className="status-pill"><div className="dot"></div>{'\uc815\uc0c1 \uc6b4\uc601 \uc911'}</div>
      </div>
      <div className="topbar-right">
        <div className={`ws-status ${wsConnected ? 'connected' : ''}`}>{wsConnected ? '\u25cf \uc11c\ubc84 \uc5f0\uacb0\ub428' : '\u25cf \uc11c\ubc84 \uc5f0\uacb0 \uc911...'}</div>
        <div className="time-display"><div className="time">{clock}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{dateText}</div></div>
      </div>
    </div>
  );
}
