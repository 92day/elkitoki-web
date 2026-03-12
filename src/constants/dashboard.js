export const THEME_KEY = 'dashboard_theme';
export const AUTH_STORAGE_KEY = 'elkitoki_auth_token';
export const WEATHER_REFRESH_MS = 5 * 60 * 1000;

export const ZONES = [
  { id: 1, name: 'A\uad6c\uc5ed', description: 'B2', task: '\ucca0\uadfc \uc791\uc5c5', risk: 'safe' },
  { id: 2, name: 'B\uad6c\uc5ed', description: 'B1', task: '\ucf58\ud06c\ub9ac\ud2b8 \ud0c0\uc124', risk: 'safe' },
  { id: 3, name: 'C\uad6c\uc5ed', description: '1F-3F', task: '\uace0\uc18c \uc791\uc5c5', risk: 'caution' },
];

export const PROGRESS_ITEMS = [
  { name: '\ud1a0\uacf5 \ubc0f \uac00\uc124', pct: 100, color: 'var(--safe)' },
  { name: '\ucca0\uadfc/\uac70\ud478\uc9d1', pct: 78, color: 'var(--safe)' },
  { name: '\ucf58\ud06c\ub9ac\ud2b8', pct: 72, color: 'var(--warning)' },
  { name: '\uc678\ubcbd \uacf5\uc0ac', pct: 61, color: 'var(--blue)' },
  { name: '\uae30\uacc4 \uc124\ube44', pct: 44, color: 'var(--warning)' },
  { name: '\uc804\uae30/\ud1b5\uc2e0', pct: 38, color: 'var(--danger)' },
];

export const LANGUAGES = [
  { code: 'ko', label: '\ud55c\uad6d\uc5b4', badge: 'KR', flagPath: '/flags/kr.svg', speech: 'ko-KR', voice: 'ko-KR' },
  { code: 'en', label: '\uc601\uc5b4', badge: 'US', flagPath: '/flags/us.svg', speech: 'en-US', voice: 'en-US' },
  { code: 'vi', label: '\ubca0\ud2b8\ub0a8\uc5b4', badge: 'VN', flagPath: '/flags/vn.svg', speech: 'vi-VN', voice: 'vi-VN' },
  { code: 'th', label: '\ud0dc\uad6d\uc5b4', badge: 'TH', flagPath: '/flags/th.svg', speech: 'th-TH', voice: 'th-TH' },
  { code: 'uz', label: '\uc6b0\uc988\ubca0\ud06c\uc5b4', badge: 'UZ', flagPath: '/flags/uz.svg', speech: 'uz-UZ', voice: 'uz-UZ' },
  { code: 'mn', label: '\ubabd\uace8\uc5b4', badge: 'MN', flagPath: '/flags/mn.svg', speech: 'mn-MN', voice: 'mn-MN' },
  { code: 'zh-cn', label: '\uc911\uad6d\uc5b4(\uac04\uccb4)', badge: 'CN', flagPath: '/flags/cn.svg', speech: 'zh-CN', voice: 'zh-CN' },
  { code: 'ja', label: '\uc77c\ubcf8\uc5b4', badge: 'JP', flagPath: '/flags/jp.svg', speech: 'ja-JP', voice: 'ja-JP' },
  { code: 'id', label: '\uc778\ub3c4\ub124\uc2dc\uc544\uc5b4', badge: 'ID', flagPath: '/flags/id.svg', speech: 'id-ID', voice: 'id-ID' },
  { code: 'tl', label: '\ud544\ub9ac\ud540\uc5b4', badge: 'PH', flagPath: '/flags/ph.svg', speech: 'fil-PH', voice: 'fil-PH' },
  { code: 'ne', label: '\ub124\ud314\uc5b4', badge: 'NP', flagPath: '/flags/np.svg', speech: 'ne-NP', voice: 'ne-NP' },
  { code: 'ru', label: '\ub7ec\uc2dc\uc544\uc5b4', badge: 'RU', flagPath: '/flags/ru.svg', speech: 'ru-RU', voice: 'ru-RU' },
  { code: 'km', label: '\ud06c\uba54\ub974\uc5b4', badge: 'KH', flagPath: '/flags/kh.svg', speech: 'km-KH', voice: 'km-KH' },
];

export const WORKER_ROLE_OPTIONS = ['소장', '안전관리자', '현장관리자', '현장직', '기타'];

export const WORKER_STATUS_LABELS = { work: '\uc791\uc5c5 \uc911', rest: '\ud734\uc2dd', absent: '\ubbf8\ucd9c\uadfc' };

export const NAV_SECTIONS = [
  { title: '\uba54\uc778 \uba54\ub274', items: [
    { key: 'dashboard', label: '\ud604\ud669 \ub300\uc2dc\ubcf4\ub4dc', icon: '\ud83d\udcca' },
    { key: 'workers', label: '\uc778\ub825 \uad00\ub9ac', icon: '\ud83d\udc77' },
    { key: 'zones', label: '\uad6c\uc5ed \ud604\ud669', icon: '\ud83d\uddfa\ufe0f' },
    { key: 'progress', label: '\uacf5\uc815 \uad00\ub9ac', icon: '\ud83d\udccb' },
  ]},
  { title: '\uae30\ub85d / \uc548\uc804', items: [
    { key: 'alerts', label: '\uc548\uc804 \uc54c\ub9bc', icon: '\u26a0\ufe0f', countKey: 'alerts' },
    { key: 'report', label: '\uc6cc\ud0a4\ud1a0\ud0a4', icon: '\ud83d\udcfb' },
    { key: 'daily-log', label: '\uc624\ub298\uc758 \uc791\uc5c5\uc77c\uc9c0', icon: '\ud83d\uddd2\ufe0f' },
    { key: 'photos', label: '\ud604\uc7a5 \uc0ac\uc9c4', icon: '\ud83d\udcf8' },
  ]},
  { title: '\uc124\uc815', items: [
    { key: 'settings-alert', label: '\uc54c\ub9bc \uc124\uc815', icon: '\ud83d\udd14' },
    { key: 'settings-env', label: '\ud658\uacbd \uc124\uc815', icon: '\u2699\ufe0f' },
  ]},
];



