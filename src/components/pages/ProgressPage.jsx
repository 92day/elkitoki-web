export default function ProgressPage({ PROGRESS_ITEMS }) {
    return <div className="page active"><div className="section-title">공정별 진행률</div><div className="panel"><div className="progress-list">{PROGRESS_ITEMS.map((item) => <div key={item.name}><div className="progress-header"><span className="progress-name">{item.name}</span><span className="progress-pct">{item.pct}%</span></div><div className="progress-track"><div className="progress-fill" style={{ width: `${item.pct}%`, background: item.color }}></div></div></div>)}</div></div></div>;
}
