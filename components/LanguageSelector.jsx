import { LANGUAGES } from '../constants/languages';

export default function LanguageSelector({ value, onChange, disabled }) {
  return (
    <div className="card">
      <h2>🌐 번역 대상 언어 선택</h2>
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}>
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>{lang.name}</option>
        ))}
      </select>
    </div>
  );
}
