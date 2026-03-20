import PhotoModal from './PhotoModal';

function getRiskBadgeLabel(photo) {
  if (photo.risk_level === 'high') return '위험 감지';
  if (photo.risk_level === 'caution') return '주의 필요';
  return '이상 없음';
}

function hasLatinText(value) {
  return /[A-Za-z]/.test(String(value || ''));
}

function getPhotoSummaryText(photo) {
  if (!photo?.scene_summary || hasLatinText(photo.scene_summary)) {
    return '한국어 분석 결과는 상세보기에서 확인할 수 있습니다.';
  }
  return photo.scene_summary;
}

function getPhotoActionText(photo) {
  if (!photo?.recommended_action || hasLatinText(photo.recommended_action)) {
    return '상세 분석에서 권장 조치를 확인해 주세요.';
  }
  return photo.recommended_action;
}

export default function PhotosPage({ photoZone, setPhotoZone, zones, handlePhotoUpload, uploadingPhotos, photos, getZoneMeta, setSelectedPhoto, selectedPhoto, apiBase, handleDeletePhoto }) {
  return (
    <div className="page active">
      <div className="section-header">
        <div className="section-title">현장 사진</div>
      </div>
      <div className="panel">
        <div className="panel-title">사진 입력, AI 자동 분석</div>
        <div className="form-group compact-field">
          <label className="form-label">구역 선택</label>
          <select className="form-select narrow-select" value={photoZone} onChange={(event) => setPhotoZone(event.target.value)}>
            <option value="">전체</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>{zone.name}</option>
            ))}
          </select>
        </div>
        <div className="upload-zone simple-upload-zone">
          <div className="upload-zone-icon">업로드</div>
          <div className="upload-zone-text">클릭하거나 파일을 선택해 업로드하세요.</div>
          <input className="file-input-inline" type="file" accept="image/*" multiple onChange={handlePhotoUpload} />
        </div>
        {uploadingPhotos && <div className="loading"><div className="spinner"></div>AI 분석 중...</div>}
      </div>
      <div className="panel">
        <div className="panel-title">사진 아카이브</div>
        <div className="photo-grid">
          {photos.length === 0 && <div className="table-empty">업로드된 사진이 없습니다.</div>}
          {photos.map((photo) => {
            const zone = getZoneMeta(photo.zone_id);
            const riskTypes = Array.isArray(photo.risk_types) ? photo.risk_types : [];
            return (
              <div
                className="photo-card"
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedPhoto(photo);
                  }
                }}
              >
                <div className="photo-thumb">
                  <img src={`${apiBase}/api/photos/file/${photo.id}`} alt="현장 사진" />
                </div>
                <div className="photo-info">
                  <div className="photo-card-top">
                    <span>{zone ? zone.name : '구역 미지정'}</span>
                    <span className={`photo-risk-badge ${photo.risk_level || (photo.risk_detected ? 'risk' : 'safe')}`}>
                      {getRiskBadgeLabel(photo)}
                    </span>
                  </div>
                  <div className="photo-summary">{getPhotoSummaryText(photo)}</div>
                  <div className="photo-action">즉시 조치: {getPhotoActionText(photo)}</div>
                  <div className="photo-risk-type-list">
                    {riskTypes.length ? riskTypes.slice(0, 3).map((riskType) => (
                      <span className="photo-risk-tag" key={`${photo.id}-${riskType}`}>{riskType}</span>
                    )) : <span className="photo-risk-tag safe">위험요소 없음</span>}
                  </div>
                  <div className="photo-meta-row">
                    <span className="photo-vision-tag">분석: {photo.vision_source || 'Gemini'}</span>
                    <span>{photo.original_name || 'uploaded photo'}</span>
                  </div>
                  <div className="photo-actions">
                    <button
                      className="photo-delete-btn react-btn-auto"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeletePhoto(photo.id);
                      }}
                      type="button"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <PhotoModal
        selectedPhoto={selectedPhoto}
        apiBase={apiBase}
        getZoneMeta={getZoneMeta}
        onClose={() => setSelectedPhoto(null)}
      />
    </div>
  );
}
