import { ZONES } from '../constants/dashboard';

export function getApiBase() {
  if (typeof window === 'undefined') return 'http://localhost:8000';
  const saved = window.localStorage.getItem('ELKITOKI_API');
  if (saved && saved.trim()) return saved.trim().replace(/\/$/, '');
  return window.location.protocol + '//' + window.location.hostname + ':8000';
}

export function formatDateDisplay(date) {
  const weekdays = ['\uc77c', '\uc6d4', '\ud654', '\uc218', '\ubaa9', '\uae08', '\ud1a0'];
  return date.getFullYear() + '\ub144 ' + (date.getMonth() + 1) + '\uc6d4 ' + date.getDate() + '\uc77c (' + weekdays[date.getDay()] + ')';
}

export function formatClockDisplay(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
}

export function getWeatherVisual(code, isDay) {
  if (code === 0) return { icon: isDay ? '\u2600\ufe0f' : '\ud83c\udf19', desc: '\ub9d1\uc74c' };
  if ([1, 2, 3].includes(code)) return { icon: '\u26c5', desc: '\uad6c\ub984 \ub9ce\uc74c' };
  if ([45, 48].includes(code)) return { icon: '\ud83c\udf2b\ufe0f', desc: '\uc548\uac1c' };
  if ([51, 53, 55, 56, 57].includes(code)) return { icon: '\ud83c\udf26\ufe0f', desc: '\uc774\uc2ac\ube44' };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { icon: '\ud83c\udf27\ufe0f', desc: '\ube44' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: '\ud83c\udf28\ufe0f', desc: '\ub208' };
  if ([95, 96, 99].includes(code)) return { icon: '\u26c8\ufe0f', desc: '\ub1cc\uc6b0' };
  return { icon: '\ud83c\udf24\ufe0f', desc: '\uae30\uc0c1 \uc815\ubcf4' };
}

export function formatTimer(seconds) {
  return String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
}

export function getSpeechErrorMessage(error) {
  if (error === 'not-allowed') return '\ub9c8\uc774\ud06c \uad8c\ud55c\uc774 \ud5c8\uc6a9\ub418\uc9c0 \uc54a\uc558\uc2b5\ub2c8\ub2e4.';
  if (error === 'network') return '\uc74c\uc131 \uc778\uc2dd \uc911 \ub124\ud2b8\uc6cc\ud06c \uc624\ub958\uac00 \ubc1c\uc0dd\ud588\uc2b5\ub2c8\ub2e4.';
  if (error === 'speech_not_supported') return '\uc774 \ube0c\ub77c\uc6b0\uc800\ub294 \uc74c\uc131 \uc778\uc2dd\uc744 \uc9c0\uc6d0\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4.';
  if (error === 'no-speech') return '\uc74c\uc131\uc774 \uac10\uc9c0\ub418\uc9c0 \uc54a\uc558\uc2b5\ub2c8\ub2e4. \ub2e4\uc2dc \uc2dc\ub3c4\ud574 \uc8fc\uc138\uc694.';
  return error ? '\uc74c\uc131 \uc778\uc2dd \uc624\ub958: ' + error : '';
}

export function isLegacyPlaceholder(report) {
  const combined = (report?.text_content || '') + ' ' + (report?.translated_text || '');
  return combined.includes('OPENAI_API_KEY');
}

export function getZoneMeta(zoneId) {
  return ZONES.find((zone) => zone.id === Number(zoneId)) || null;
}

export function formatShiftDuration(shiftStartedAt) {
  if (!shiftStartedAt) return '\uce21\uc815 \uc804';

  const start = new Date(shiftStartedAt);
  if (Number.isNaN(start.getTime())) return '\uce21\uc815 \uc804';

  const diffMs = Date.now() - start.getTime();
  if (diffMs <= 0) return '0\ubd84';

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return String(minutes) + '\ubd84';
  return minutes > 0 ? String(hours) + '\uc2dc\uac04 ' + String(minutes) + '\ubd84' : String(hours) + '\uc2dc\uac04';
}
