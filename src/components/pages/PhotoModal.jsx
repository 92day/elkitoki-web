function getRiskBadgeLabel(photo) {
  if (photo.risk_level === 'high') return '위험 감지';
  if (photo.risk_level === 'caution') return '주의 필요';
  return '이상 없음';
}

function hasLatinText(value) {
  return /[A-Za-z]/.test(String(value || ''));
}

function getStructuredText(value, fallback) {
  if (!value || hasLatinText(value)) {
    return fallback;
  }
  return value;
}

export default function PhotoModal({ selectedPhoto, apiBase, getZoneMeta, onClose }) {
  if (!selectedPhoto) return null;

  const zone = getZoneMeta(selectedPhoto.zone_id);
  const takenAt = selectedPhoto.taken_at ? new Date(selectedPhoto.taken_at).toLocaleString('ko-KR') : '시간 정보 없음';
  const riskTypes = Array.isArray(selectedPhoto.risk_types) ? selectedPhoto.risk_types : [];
  const hazardPoints = Array.isArray(selectedPhoto.hazard_points) ? selectedPhoto.hazard_points : [];
  const sceneSummary = getStructuredText(selectedPhoto.scene_summary, '장면 요약이 아직 준비되지 않았습니다.');
  const ppeCheck = getStructuredText(selectedPhoto.ppe_check, '보호구 착용 여부를 현장에서 한 번 더 확인해 주세요.');
  const recommendedAction = getStructuredText(selectedPhoto.recommended_action, '권장 조치가 아직 준비되지 않았습니다.');
  const finalJudgement = getStructuredText(selectedPhoto.final_judgement, '최종 판단이 아직 준비되지 않았습니다.');
  const yoloSummary = getStructuredText(selectedPhoto.yolo_summary, 'YOLO 탐지 결과가 없거나 한국어 요약이 준비되지 않았습니다.');

  return (
    <div className="photo-modal-overlay" onClick={onClose}>
      <div className="photo-modal-dialog-react" onClick={(event) => event.stopPropagation()}>
        <div className="photo-modal-media-react">
          <img src={`${apiBase}/api/photos/file/${selectedPhoto.id}`} alt="현장 사진 상세" />
        </div>
        <div className="photo-modal-side-react">
          <div className="photo-modal-head-react">
            <div>
              <div className="section-title">사진 상세 분석</div>
              <div className="table-sub">{zone ? zone.name : '구역 미지정'} · {takenAt}</div>
            </div>
            <button className="photo-modal-close-react react-btn-auto" type="button" onClick={onClose}>닫기</button>
          </div>
          <div className="photo-modal-scroll-react">
            <div className="photo-modal-badges-react">
              <span className={`photo-risk-badge ${selectedPhoto.risk_level || (selectedPhoto.risk_detected ? 'risk' : 'safe')}`}>
                {getRiskBadgeLabel(selectedPhoto)}
              </span>
              <span className="photo-modal-badge-react">{selectedPhoto.original_name || 'uploaded photo'}</span>
              <span className="photo-modal-badge-react">분석: {selectedPhoto.vision_source || 'Gemini'}</span>
            </div>

            <div className="photo-modal-structured-grid">
              <div className="photo-modal-structured-card photo-modal-structured-card-wide photo-modal-scene-card">
                <div className="photo-modal-section-title">장면 요약</div>
                <div className="photo-modal-structured-text photo-modal-structured-text-long">{sceneSummary}</div>
              </div>
              <div className="photo-modal-structured-card">
                <div className="photo-modal-section-title">위험 포인트</div>
                {hazardPoints.length ? (
                  <ul className="photo-modal-hazard-list">
                    {hazardPoints.map((point, index) => (
                      <li key={`${selectedPhoto.id}-hazard-${index}`}>{point}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="photo-modal-structured-text">특이 위험요소 없음</div>
                )}
              </div>
              <div className="photo-modal-structured-card">
                <div className="photo-modal-section-title">보호구 점검</div>
                <div className="photo-modal-structured-text">{ppeCheck}</div>
              </div>
              <div className="photo-modal-structured-card">
                <div className="photo-modal-section-title">즉시 조치</div>
                <div className="photo-modal-structured-text">{recommendedAction}</div>
              </div>
              <div className="photo-modal-structured-card">
                <div className="photo-modal-section-title">위험 요소</div>
                <div className="photo-risk-type-list modal">
                  {riskTypes.length ? riskTypes.map((riskType) => (
                    <span className="photo-risk-tag" key={`${selectedPhoto.id}-${riskType}`}>{riskType}</span>
                  )) : <span className="photo-risk-tag safe">위험요소 없음</span>}
                </div>
              </div>
              <div className="photo-modal-structured-card photo-modal-structured-card-wide">
                <div className="photo-modal-section-title">최종 판단</div>
                <div className="photo-modal-structured-text">{finalJudgement}</div>
              </div>
              <div className="photo-modal-structured-card photo-modal-structured-card-wide">
                <div className="photo-modal-section-title">YOLO 탐지 요약</div>
                <div className="photo-modal-structured-text">{yoloSummary}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
