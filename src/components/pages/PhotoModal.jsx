export default function PhotoModal({ selectedPhoto, apiBase, getZoneMeta, photoAnalysisKo, photoAnalysisLoading, onClose }) {
  if (!selectedPhoto) return null;
  const zone = getZoneMeta(selectedPhoto.zone_id);
  const takenAt = selectedPhoto.taken_at ? new Date(selectedPhoto.taken_at).toLocaleString('ko-KR') : '\uc2dc\uac04 \uc815\ubcf4 \uc5c6\uc74c';
  const translatedAnalysis = photoAnalysisKo[selectedPhoto.id];

  return (
    <div className="photo-modal-overlay" onClick={onClose}>
      <div className="photo-modal-dialog-react" onClick={(event) => event.stopPropagation()}>
        <div className="photo-modal-media-react">
          <img src={`${apiBase}/api/photos/file/${selectedPhoto.id}`} alt={"\ud604\uc7a5 \uc0ac\uc9c4 \uc0c1\uc138"} />
        </div>
        <div className="photo-modal-side-react">
          <div className="photo-modal-head-react">
            <div>
              <div className="section-title">{"\uc0ac\uc9c4 \uc0c1\uc138 \ubd84\uc11d"}</div>
              <div className="table-sub">{zone ? zone.name : '\uad6c\uc5ed \ubbf8\uc9c0\uc815'} · {takenAt}</div>
            </div>
            <button className="photo-modal-close-react react-btn-auto" type="button" onClick={onClose}>{"\ub2eb\uae30"}</button>
          </div>
          <div className="photo-modal-badges-react">
            <span className={`photo-risk-badge ${selectedPhoto.risk_detected ? 'risk' : 'safe'}`}>{selectedPhoto.risk_detected ? '\uc704\ud5d8' : '\uc815\uc0c1'}</span>
            <span className="photo-modal-badge-react">{selectedPhoto.original_name || 'uploaded photo'}</span>
          </div>
          <div className="photo-modal-analysis-react">
            <strong>English</strong>
            <br />
            {selectedPhoto.ai_result || '\ubd84\uc11d \uacb0\uacfc\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.'}
            <br />
            <br />
            <strong>{"\ud55c\uad6d\uc5b4"}</strong>
            <br />
            {photoAnalysisLoading && !translatedAnalysis ? '\ud55c\uad6d\uc5b4 \ubc88\uc5ed\uc744 \ubd88\ub7ec\uc624\ub294 \uc911\uc785\ub2c8\ub2e4...' : (translatedAnalysis || '\ud55c\uad6d\uc5b4 \ubc88\uc5ed \uacb0\uacfc\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.')}
          </div>
        </div>
      </div>
    </div>
  );
}