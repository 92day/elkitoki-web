export const THEME_KEY = 'dashboard_theme';
export const AUTH_STORAGE_KEY = 'elkitoki_auth_token';
export const WEATHER_REFRESH_MS = 5 * 60 * 1000;

export const ZONES = [
  { id: 1, name: 'A\uad6c\uc5ed', description: 'B2', task: '\ucca0\uadfc \uc791\uc5c5', risk: 'safe' },
  { id: 2, name: 'B\uad6c\uc5ed', description: 'B1', task: '\ucf58\ud06c\ub9ac\ud2b8 \ud0c0\uc124', risk: 'safe' },
  { id: 3, name: 'C\uad6c\uc5ed', description: '1F-3F', task: '\uace0\uc18c \uc791\uc5c5', risk: 'caution' },
];

export const ZONE_NOISE_BY_ID = {
  1: { score: 62, peak: '08:40', status: 'safe' },
  2: { score: 74, peak: '10:15', status: 'caution' },
  3: { score: 83, peak: '14:20', status: 'danger' },
};

export const NOISE_STATUS_LABELS = {
  safe: '\uc548\uc804',
  caution: '\uc8fc\uc758',
  danger: '\uacbd\uace0',
};

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

export const WORKER_ROLE_OPTIONS = ['\uc18c\uc7a5', '\uc548\uc804\uad00\ub9ac\uc790', '\ud604\uc7a5\uad00\ub9ac\uc790', '\ud604\uc7a5\uc791\uc5c5\uc790', '\uae30\ud0c0'];

export const WORKER_STATUS_LABELS = { work: '\uc791\uc5c5 \uc911', rest: '\ud734\uc2dd', absent: '\ubbf8\ucd9c\uadfc' };

export const NAV_SECTIONS = [
  { title: '\uD604\uC7A5 \uAD00\uB9AC', items: [
    { key: 'dashboard', label: '\uD604\uD669 \uB300\uC2DC\uBCF4\uB4DC', icon: '📊' },
    { key: 'workers', label: '\uC778\uB825 \uAD00\uB9AC', icon: '👷' },
    { key: 'zones', label: '\uAD6C\uC5ED \uD604\uD669', icon: '🗺️' },
    { key: 'progress', label: '\uACF5\uC815 \uAD00\uB9AC', icon: '📋' },
  ]},
  { title: '\uC18C\uD1B5', items: [
    { key: 'report', label: '\uC2E4\uC2DC\uAC04 \uBC88\uC5ED\uAE30', icon: '📻' },
    { key: 'worker-call', label: '\uC791\uC5C5\uC790 \uD638\uCD9C', icon: '📢' },
  ]},
  { title: '\uAE30\uB85D / \uC548\uC804', items: [
    { key: 'alerts', label: '\uC548\uC804 \uC54C\uB9BC', icon: '⚠️', countKey: 'alerts' },
    { key: 'daily-log', label: '\uC791\uC5C5 \uC77C\uC9C0', icon: '📝' },
    { key: 'photos', label: '\uD604\uC7A5 \uC0AC\uC9C4', icon: '📷' },
  ]},
  { title: '\uC124\uC815', items: [
    { key: 'settings-alert', label: '\uC54C\uB9BC \uC124\uC815', icon: '🔔' },
    { key: 'settings-env', label: '\uD658\uACBD \uC124\uC815', icon: '⚙️' },
  ]},
];


