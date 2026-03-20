import { useState } from 'react';

const STORAGE_KEY = 'dashboard_alert_settings';
const DEFAULTS = {
  browserAlerts: true,
  soundAlerts: true,
  vibrationAlerts: false,
  alertLevel: 'high',
  quietHours: 'off',
};

function readInitialState() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export default function AlertSettingsPage({ onSave, embedded = false }) {
  const [settings, setSettings] = useState(readInitialState);

  function updateField(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    onSave?.('\uc54c\ub9bc \uc124\uc815\uc744 \uc800\uc7a5\ud588\uc2b5\ub2c8\ub2e4.');
  }

  const content = (
    <>
      <div className="split-grid settings-grid">
        <div className="panel">
          <div className="panel-title">{'\uc54c\ub9bc \ucc44\ub110 \uc124\uc815'}</div>
          <div className="settings-stack">
            <label className="settings-option">
              <input type="checkbox" checked={settings.browserAlerts} onChange={(event) => updateField('browserAlerts', event.target.checked)} />
              <span>{'\ube0c\ub77c\uc6b0\uc800 \ud31d\uc5c5 \uc54c\ub9bc'}</span>
            </label>
            <label className="settings-option">
              <input type="checkbox" checked={settings.soundAlerts} onChange={(event) => updateField('soundAlerts', event.target.checked)} />
              <span>{'\uacbd\uace0\uc74c \uc7ac\uc0dd'}</span>
            </label>
            <label className="settings-option">
              <input type="checkbox" checked={settings.vibrationAlerts} onChange={(event) => updateField('vibrationAlerts', event.target.checked)} />
              <span>{'\ubaa8\ubc14\uc77c \uc9c4\ub3d9 \uc54c\ub9bc'}</span>
            </label>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">{'\ubc1c\uc0dd \uc870\uac74'}</div>
          <div className="form-grid">
            <div className="form-group compact-field">
              <label className="form-label">{'\uc8fc \uc54c\ub9bc \uc218\uc900'}</label>
              <select className="form-select" value={settings.alertLevel} onChange={(event) => updateField('alertLevel', event.target.value)}>
                <option value="high">{'\ub192\uc74c'}</option>
                <option value="mid">{'\uc911\uac04 \uc774\uc0c1'}</option>
                <option value="low">{'\uc804\uccb4'}</option>
              </select>
            </div>
            <div className="form-group compact-field">
              <label className="form-label">{'\uc870\uc6a9 \uc2dc\uac04'}</label>
              <select className="form-select" value={settings.quietHours} onChange={(event) => updateField('quietHours', event.target.value)}>
                <option value="off">{'\uc0ac\uc6a9 \uc548 \ud568'}</option>
                <option value="night">{'22:00 - 06:00'}</option>
                <option value="lunch">{'12:00 - 13:00'}</option>
              </select>
            </div>
          </div>
          <div className="button-row">
            <button className="btn-primary react-btn-auto" type="button" onClick={handleSave}>{'\uc800\uc7a5'}</button>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">{'\ud604\uc7ac \uc124\uc815 \uc694\uc57d'}</div>
        <div className="settings-summary-list">
          <div>{`- ${settings.browserAlerts ? '\ube0c\ub77c\uc6b0\uc800 \uc54c\ub9bc \uc0ac\uc6a9' : '\ube0c\ub77c\uc6b0\uc800 \uc54c\ub9bc \ub044\uae30'}`}</div>
          <div>{`- ${settings.soundAlerts ? '\uacbd\uace0\uc74c \uc7ac\uc0dd \ucf1c\uae30' : '\uacbd\uace0\uc74c \uc7ac\uc0dd \ub044\uae30'}`}</div>
          <div>{`- ${settings.vibrationAlerts ? '\uc9c4\ub3d9 \uc54c\ub9bc \ud65c\uc131\ud654' : '\uc9c4\ub3d9 \uc54c\ub9bc \ube44\ud65c\uc131\ud654'}`}</div>
        </div>
      </div>
    </>
  );

  if (embedded) {
    return <div className="mypage-embedded-stack">{content}</div>;
  }

  return (
    <div className="page active">
      <div className="section-header">
        <div className="section-title">{'\uc54c\ub9bc \uc124\uc815'}</div>
      </div>
      {content}
    </div>
  );
}
