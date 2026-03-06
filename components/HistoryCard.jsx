export default function HistoryCard({ history }) {
  return (
    <div className="card">
      <h2>📋 전송 히스토리</h2>

      {history.length === 0 ? (
        <div style={{ color: '#475569', fontSize: '0.9rem', padding: '0.5rem' }}>
          아직 전송 기록이 없습니다.
        </div>
      ) : (
        history.map((item) => (
          <div key={item.id} className="history-item">
            <div className="original">🇰🇷 {item.original}</div>
            <div className="translated-text">→ {item.translated}</div>
            <div className="meta">{item.langName} · {item.time}</div>
          </div>
        ))
      )}
    </div>
  );
}
