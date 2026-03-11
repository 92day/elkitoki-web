import { useState } from 'react';

const STORAGE_KEY = 'dashboard_environment_settings';
const DEFAULTS = {
  primaryLanguage: 'ko',
  secondaryLanguage: 'vi',
  autoPlayTranslatedVoice: false,
  highContrastMode: false,
  compactCards: false,
};

function readInitialState() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export default function EnvironmentSettingsPage({ languages, onSave }) {
  const [settings, setSettings] = useState(readInitialState);

  function updateField(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    onSave?.('\ud658\uacbd \uc124\uc815\uc744 \uc800\uc7a5\ud588\uc2b5\ub2c8\ub2e4.');
  }

  return (
    <div className="page active">
      <div className="section-header">
        <div className="section-title">{'\ud658\uacbd \uc124\uc815'}</div>
      </div>

      <div className="panel">
        <div className="panel-title">{'\uae30\ubcf8 \uc791\uc5c5 \ud658\uacbd'}</div>
        <div className="form-grid">
          <div className="form-group compact-field">
            <label className="form-label">{'\uae30\ubcf8 \ub9d0\ud560 \uc5b8\uc5b4'}</label>
            <select className="form-select" value={settings.primaryLanguage} onChange={(event) => updateField('primaryLanguage', event.target.value)}>
              {languages.map((language) => (
                <option key={language.code} value={language.code}>{language.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group compact-field">
            <label className="form-label">{'\uae30\ubcf8 \ubc88\uc5ed \uc5b8\uc5b4'}</label>
            <select className="form-select" value={settings.secondaryLanguage} onChange={(event) => updateField('secondaryLanguage', event.target.value)}>
              {languages.map((language) => (
                <option key={language.code} value={language.code}>{language.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="split-grid settings-grid">
        <div className="panel">
          <div className="panel-title">{'\uc0ac\uc6a9\uc131'}</div>
          <div className="settings-stack">
            <label className="settings-option">
              <input type="checkbox" checked={settings.autoPlayTranslatedVoice} onChange={(event) => updateField('autoPlayTranslatedVoice', event.target.checked)} />
              <span>{'\ubc88\uc5ed \uc644\ub8cc \uc2dc \uc790\ub3d9 \uc74c\uc131 \uc7ac\uc0dd'}</span>
            </label>
            <label className="settings-option">
              <input type="checkbox" checked={settings.highContrastMode} onChange={(event) => updateField('highContrastMode', event.target.checked)} />
              <span>{'\ub192\uc740 \ub300\ube44 \ubaa8\ub4dc'}</span>
            </label>
            <label className="settings-option">
              <input type="checkbox" checked={settings.compactCards} onChange={(event) => updateField('compactCards', event.target.checked)} />
              <span>{'\ucef4\ud329\ud2b8 \uce74\ub4dc \ub808\uc774\uc544\uc6c3'}</span>
            </label>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">{'\uc801\uc6a9 \uc548\ub0b4'}</div>
          <div className="settings-summary-list">
            <div>{`- ${'\uae30\ubcf8 \uc5b8\uc5b4'}: ${languages.find((language) => language.code === settings.primaryLanguage)?.label || settings.primaryLanguage}`}</div>
            <div>{`- ${'\ubc88\uc5ed \uc5b8\uc5b4'}: ${languages.find((language) => language.code === settings.secondaryLanguage)?.label || settings.secondaryLanguage}`}</div>
            <div>{`- ${settings.autoPlayTranslatedVoice ? '\uc790\ub3d9 \uc74c\uc131 \uc7ac\uc0dd \uc0ac\uc6a9' : '\uc790\ub3d9 \uc74c\uc131 \uc7ac\uc0dd \uc548 \ud568'}`}</div>
          </div>
          <div className="button-row">
            <button className="btn-primary react-btn-auto" type="button" onClick={handleSave}>{'\uc800\uc7a5'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
