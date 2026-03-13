export default function SiteTopbar({ wsConnected, clock, dateText }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="site-badge">
          <div className="icon">{'?룛截?}</div>
          <div>
            <div className="site-name">{'03131200'}</div>
            <div className="site-sub">{'?쒖슱 留덊룷援?쨌 怨듭젙瑜?67% 쨌 ?꾩옣肄붾뱶 #LGEDX-2026-92'}</div>
          </div>
        </div>
        <div className="divider-v"></div>
        <div className="status-pill"><div className="dot"></div>{'?뺤긽 ?댁쁺 以?}</div>
      </div>
      <div className="topbar-right">
        <div className={`ws-status ${wsConnected ? 'connected' : ''}`}>{wsConnected ? '???쒕쾭 ?곌껐?? : '???쒕쾭 ?곌껐 以?..'}</div>
        <div className="time-display"><div className="time">{clock}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{dateText}</div></div>
      </div>
    </div>
  );
}

