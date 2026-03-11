export default function ZonesPage({ ZONES, zoneCounts }) {
    return <div className="page active"><div className="section-title">구역 현황</div><div className="zone-grid zone-grid-wide">{ZONES.map((zone) => <div className={`zone ${zone.risk}`} key={zone.id}><div className="zone-name">{zone.name}</div><div className="zone-workers">{zoneCounts[zone.id] || 0}명</div><div className="zone-sub">{zone.description} · {zone.task}</div></div>)}</div></div>;
}
