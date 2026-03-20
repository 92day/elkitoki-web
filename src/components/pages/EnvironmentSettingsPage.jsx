import { useEffect, useState } from 'react';

export const ENVIRONMENT_SETTINGS_STORAGE_KEY = 'dashboard_environment_settings';
export const ENVIRONMENT_SETTINGS_DEFAULTS = {
  primaryLanguage: 'ko',
  secondaryLanguage: 'vi',
  autoPlayTranslatedVoice: true,
  highContrastMode: false,
  compactCards: false,
};

export function readEnvironmentSettings() {
  try {
    const saved = window.localStorage.getItem(ENVIRONMENT_SETTINGS_STORAGE_KEY);
    return saved ? { ...ENVIRONMENT_SETTINGS_DEFAULTS, ...JSON.parse(saved) } : { ...ENVIRONMENT_SETTINGS_DEFAULTS };
  } catch {
    return { ...ENVIRONMENT_SETTINGS_DEFAULTS };
  }
}

export default function EnvironmentSettingsPage({
  languages,
  onSave,
  value,
  embedded = false,
}) {
  const [settings, setSettings] = useState(() => value || readEnvironmentSettings());

  useEffect(() => {
    if (!value) return;
    setSettings({ ...ENVIRONMENT_SETTINGS_DEFAULTS, ...value });
  }, [value]);

  function updateField(key, fieldValue) {
    setSettings((prev) => ({ ...prev, [key]: fieldValue }));
  }

  function handleSave() {
    window.localStorage.setItem(ENVIRONMENT_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    onSave?.(settings);
  }

  const content = (
    <>
      <div className="panel">
        <div className="panel-title">기본 작업 환경</div>
        <div className="form-grid">
          <div className="form-group compact-field">
            <label className="form-label">기본 말할 언어</label>
            <select className="form-select" value={settings.primaryLanguage} onChange={(event) => updateField('primaryLanguage', event.target.value)}>
              {languages.map((language) => (
                <option key={language.code} value={language.code}>{language.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group compact-field">
            <label className="form-label">기본 번역 언어</label>
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
          <div className="panel-title">사용성</div>
          <div className="settings-stack">
            <label className="settings-option">
              <input type="checkbox" checked={settings.autoPlayTranslatedVoice} onChange={(event) => updateField('autoPlayTranslatedVoice', event.target.checked)} />
              <span>번역 완료 시 자동 음성 재생</span>
            </label>
            <label className="settings-option">
              <input type="checkbox" checked={settings.highContrastMode} onChange={(event) => updateField('highContrastMode', event.target.checked)} />
              <span>높은 대비 모드</span>
            </label>
            <label className="settings-option">
              <input type="checkbox" checked={settings.compactCards} onChange={(event) => updateField('compactCards', event.target.checked)} />
              <span>컴팩트 카드 레이아웃</span>
            </label>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">적용 안내</div>
          <div className="settings-summary-list">
            <div>{`- 기본 언어: ${languages.find((language) => language.code === settings.primaryLanguage)?.label || settings.primaryLanguage}`}</div>
            <div>{`- 번역 언어: ${languages.find((language) => language.code === settings.secondaryLanguage)?.label || settings.secondaryLanguage}`}</div>
            <div>{`- ${settings.autoPlayTranslatedVoice ? '자동 음성 재생 사용' : '자동 음성 재생 안 함'}`}</div>
          </div>
          <div className="button-row">
            <button className="btn-primary react-btn-auto" type="button" onClick={handleSave}>저장</button>
          </div>
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
        <div className="section-title">환경 설정</div>
      </div>
      {content}
    </div>
  );
}

