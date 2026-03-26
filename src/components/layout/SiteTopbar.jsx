export default function SiteTopbar({ wsConnected, clock, dateText }) {
  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="site-badge">
          <div className="icon">{'🏗️'}</div>
          <div>
            <div className="site-name">{'창천동 한빛빌딩 4층 3차 건설 현장'}</div>
            <div className="site-sub">{'서울 서대문구 · 공정률 67% · 현장코드 #LGEDX-2026-92'}</div>
          </div>
        </div>
        <div className="divider-v"></div>
        <div className="status-pill"><div className="dot"></div>{'정상 운영 중'}</div>
      </div>
      <div className="topbar-right">
        <div className={`ws-status ${wsConnected ? 'connected' : ''}`}>{wsConnected ? '● 서버 연결됨' : '● 서버 연결 중...'}</div>
        <div className="time-display"><div className="time">{clock}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{dateText}</div></div>
      </div>
    </div>
  );
}



