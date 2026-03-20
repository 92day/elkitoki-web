import PhotoModal from './PhotoModal';

export default function PhotosPage({ photoZone, setPhotoZone, zones, handlePhotoUpload, uploadingPhotos, photos, getZoneMeta, setSelectedPhoto, selectedPhoto, apiBase, photoAnalysisKo, photoAnalysisLoading, handleDeletePhoto }) {
  return (
    <div className="page active">
      <div className="section-header">
        <div className="section-title">{"\ud604\uc7a5 \uc0ac\uc9c4"}</div>
      </div>
      <div className="panel">
        <div className="panel-title">📤 {"\uc0ac\uc9c4 \uc785\ub825, AI \uc790\ub3d9 \ubd84\uc11d"}</div>
        <div className="form-group compact-field">
          <label className="form-label">{"\uad6c\uc5ed \uc120\ud0dd"}</label>
          <select className="form-select narrow-select" value={photoZone} onChange={(event) => setPhotoZone(event.target.value)}>
            <option value="">{"\uc804\uccb4"}</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>{zone.name}</option>
            ))}
          </select>
        </div>
        <div className="upload-zone simple-upload-zone">
          <div className="upload-zone-icon">📸</div>
          <div className="upload-zone-text">{"\ud074\ub9ad\ud558\uac70\ub098 \ud30c\uc77c\uc744 \uc120\ud0dd\ud574 \uc5c5\ub85c\ub4dc\ud558\uc138\uc694."}</div>
          <input className="file-input-inline" type="file" accept="image/*" multiple onChange={handlePhotoUpload} />
        </div>
        {uploadingPhotos && <div className="loading"><div className="spinner"></div>{"AI \ubd84\uc11d \uc911..."}</div>}
      </div>
      <div className="panel">
        <div className="panel-title">🖼️ {"\uc0ac\uc9c4 \uc544\uce74\uc774\ube0c"}</div>
        <div className="photo-grid">
          {photos.length === 0 && <div className="table-empty">{"\uc5c5\ub85c\ub4dc\ub41c \uc0ac\uc9c4\uc774 \uc5c6\uc2b5\ub2c8\ub2e4."}</div>}
          {photos.map((photo) => {
            const zone = getZoneMeta(photo.zone_id);
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
                  <img src={`${apiBase}/api/photos/file/${photo.id}`} alt={"\ud604\uc7a5 \uc0ac\uc9c4"} />
                </div>
                <div className="photo-info">
                  <div className="photo-card-top">
                    <span>{zone ? zone.name : '\uad6c\uc5ed \ubbf8\uc9c0\uc815'}</span>
                    <span className={`photo-risk-badge ${photo.risk_detected ? 'risk' : 'safe'}`}>
                      {photo.risk_detected ? '\uc704\ud5d8' : '\uc815\uc0c1'}
                    </span>
                  </div>
                  <div className="photo-ai">{photo.ai_result || '\ubd84\uc11d \uacb0\uacfc\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.'}</div>
                  <div className="photo-actions">
                    <button
                      className="photo-delete-btn react-btn-auto"
                      onClick={(event) => {
                        event.stopPropagation();
                        handleDeletePhoto(photo.id);
                      }}
                      type="button"
                    >
                      {"\uc0ad\uc81c"}
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
        photoAnalysisKo={photoAnalysisKo}
        photoAnalysisLoading={photoAnalysisLoading}
        onClose={() => setSelectedPhoto(null)}
      />
    </div>
  );
}