import { useEffect, useMemo, useState } from 'react';
import useSpeechRecognition from './hooks/useSpeechRecognition';
import './App.css';

const THEME_KEY = 'dashboard_theme';
const WEATHER_REFRESH_MS = 5 * 60 * 1000;

const ZONES = [
  { id: 1, name: 'A구역', description: 'B2', task: '철근 작업', risk: 'safe' },
  { id: 2, name: 'B구역', description: 'B1', task: '콘크리트 타설', risk: 'safe' },
  { id: 3, name: 'C구역', description: '1F-3F', task: '고소 작업', risk: 'caution' },
  { id: 4, name: 'D구역', description: '4F-6F', task: '골조 작업', risk: 'safe' },
  { id: 5, name: 'E구역', description: '옥상', task: '지붕 작업', risk: 'danger' },
  { id: 6, name: 'F구역', description: '외벽', task: '외장 마감', risk: 'safe' },
];

const PROGRESS_ITEMS = [
  { name: '토공 및 가설', pct: 100, color: 'var(--safe)' },
  { name: '철근/거푸집', pct: 78, color: 'var(--safe)' },
  { name: '콘크리트', pct: 72, color: 'var(--warning)' },
  { name: '외벽 공사', pct: 61, color: 'var(--blue)' },
  { name: '기계 설비', pct: 44, color: 'var(--warning)' },
  { name: '전기/통신', pct: 38, color: 'var(--danger)' },
];

const LANGUAGES = [
  { code: 'ko', label: '한국어', badge: 'KR', flagPath: '/flags/kr.svg', speech: 'ko-KR', voice: 'ko-KR' },
  { code: 'en', label: '영어', badge: 'US', flagPath: '/flags/us.svg', speech: 'en-US', voice: 'en-US' },
  { code: 'vi', label: '베트남어', badge: 'VN', flagPath: '/flags/vn.svg', speech: 'vi-VN', voice: 'vi-VN' },
  { code: 'th', label: '태국어', badge: 'TH', flagPath: '/flags/th.svg', speech: 'th-TH', voice: 'th-TH' },
  { code: 'uz', label: '우즈베크어', badge: 'UZ', flagPath: '/flags/uz.svg', speech: 'uz-UZ', voice: 'uz-UZ' },
  { code: 'mn', label: '몽골어', badge: 'MN', flagPath: '/flags/mn.svg', speech: 'mn-MN', voice: 'mn-MN' },
  { code: 'zh-cn', label: '중국어(간체)', badge: 'CN', flagPath: '/flags/cn.svg', speech: 'zh-CN', voice: 'zh-CN' },
  { code: 'ja', label: '일본어', badge: 'JP', flagPath: '/flags/jp.svg', speech: 'ja-JP', voice: 'ja-JP' },
  { code: 'id', label: '인도네시아어', badge: 'ID', flagPath: '/flags/id.svg', speech: 'id-ID', voice: 'id-ID' },
  { code: 'tl', label: '필리핀어', badge: 'PH', flagPath: '/flags/ph.svg', speech: 'fil-PH', voice: 'fil-PH' },
  { code: 'ne', label: '네팔어', badge: 'NP', flagPath: '/flags/np.svg', speech: 'ne-NP', voice: 'ne-NP' },
  { code: 'ru', label: '러시아어', badge: 'RU', flagPath: '/flags/ru.svg', speech: 'ru-RU', voice: 'ru-RU' },
  { code: 'km', label: '크메르어', badge: 'KH', flagPath: '/flags/kh.svg', speech: 'km-KH', voice: 'km-KH' },
];

const WORKER_STATUS_LABELS = { work: '작업 중', rest: '휴식', absent: '미출근' };

const NAV_SECTIONS = [
  { title: '메인 메뉴', items: [
    { key: 'dashboard', label: '현황 대시보드', icon: '📊' },
    { key: 'workers', label: '인력 관리', icon: '👷' },
    { key: 'zones', label: '구역 현황', icon: '🗺️' },
    { key: 'progress', label: '공정 관리', icon: '📋' },
    { key: 'sensors', label: '센서 현황', icon: '📡' },
  ]},
  { title: '기록 / 안전', items: [
    { key: 'alerts', label: '안전 알림', icon: '⚠️', countKey: 'alerts' },
    { key: 'report', label: '워키토키', icon: '📻' },
    { key: 'photos', label: '현장 사진', icon: '📸' },
  ]},
  { title: '설정', items: [
    { key: 'settings-alert', label: '알림 설정', icon: '🔔', disabled: true },
    { key: 'settings-env', label: '환경 설정', icon: '⚙️', disabled: true },
  ]},
];

function getApiBase() {
  if (typeof window === 'undefined') return 'http://localhost:8000';
  const saved = window.localStorage.getItem('ELKITOKI_API');
  if (saved && saved.trim()) return saved.trim().replace(/\/$/, '');
  return `${window.location.protocol}//${window.location.hostname}:8000`;
}

function formatDateDisplay(date) {
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${weekdays[date.getDay()]})`;
}

function formatClockDisplay(date) {
  const pad = (value) => String(value).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function getWeatherVisual(code, isDay) {
  if (code === 0) return { icon: isDay ? '☀️' : '🌙', desc: '맑음' };
  if ([1, 2, 3].includes(code)) return { icon: '⛅', desc: '구름 많음' };
  if ([45, 48].includes(code)) return { icon: '🌫️', desc: '안개' };
  if ([51, 53, 55, 56, 57].includes(code)) return { icon: '🌦️', desc: '이슬비' };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { icon: '🌧️', desc: '비' };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: '🌨️', desc: '눈' };
  if ([95, 96, 99].includes(code)) return { icon: '⛈️', desc: '뇌우' };
  return { icon: '🌤️', desc: '기상 정보' };
}

function formatTimer(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function getSpeechErrorMessage(error) {
  if (error === 'not-allowed') return '마이크 권한이 허용되지 않았습니다.';
  if (error === 'network') return '음성 인식 중 네트워크 오류가 발생했습니다.';
  if (error === 'speech_not_supported') return '이 브라우저는 음성 인식을 지원하지 않습니다.';
  if (error === 'no-speech') return '음성이 감지되지 않았습니다. 다시 시도해 주세요.';
  return error ? `음성 인식 오류: ${error}` : '';
}

function isLegacyPlaceholder(report) {
  const combined = `${report?.text_content || ''} ${report?.translated_text || ''}`;
  return combined.includes('OPENAI_API_KEY');
}

function getZoneMeta(zoneId) {
  return ZONES.find((zone) => zone.id === Number(zoneId)) || null;
}

export default function App() {
  const apiBase = useMemo(() => getApiBase(), []);
  const wsBase = useMemo(() => apiBase.replace(/^http/, 'ws'), [apiBase]);

  const [activePage, setActivePage] = useState('dashboard');
  const [theme, setTheme] = useState('light');
  const [clock, setClock] = useState('--:--:--');
  const [dateText, setDateText] = useState('로딩 중');
  const [wsConnected, setWsConnected] = useState(false);
  const [message, setMessage] = useState('대시보드를 불러오는 중입니다.');

  const [weather, setWeather] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [sensors, setSensors] = useState({ temperature: null, humidity: null, dust: null, gas: null });
  const [sensorLog, setSensorLog] = useState([]);
  const [reports, setReports] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoAnalysisKo, setPhotoAnalysisKo] = useState({});
  const [photoAnalysisLoading, setPhotoAnalysisLoading] = useState(false);

  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: '', role: '', phone: '', zone_id: '' });
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [newAlert, setNewAlert] = useState({ level: 'high', source: '', message: '' });

  const [sourceLanguage, setSourceLanguage] = useState('ko');
  const [targetLanguage, setTargetLanguage] = useState('vi');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [translating, setTranslating] = useState(false);
  const [savingReport, setSavingReport] = useState(false);

  const [photoZone, setPhotoZone] = useState('');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const sourceMeta = LANGUAGES.find((item) => item.code === sourceLanguage) || LANGUAGES[0];
  const targetMeta = LANGUAGES.find((item) => item.code === targetLanguage) || LANGUAGES[0];
  const speech = useSpeechRecognition(sourceMeta.speech);

  const visibleReports = reports.filter((report) => !isLegacyPlaceholder(report));
  const activeWorkers = workers.filter((worker) => worker.status === 'work');
  const zoneCounts = workers.reduce((accumulator, worker) => {
    if (worker.zone_id) accumulator[worker.zone_id] = (accumulator[worker.zone_id] || 0) + 1;
    return accumulator;
  }, {});

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(THEME_KEY);
    setTheme(savedTheme === 'dark' ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    document.body.dataset.theme = theme;
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(formatClockDisplay(now));
      setDateText(formatDateDisplay(now));
    };
    tick();
    const timerId = window.setInterval(tick, 1000);
    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (speech.transcript) setSourceText(speech.transcript);
  }, [speech.transcript]);

  useEffect(() => {
    const errorMessage = getSpeechErrorMessage(speech.error);
    if (errorMessage) setMessage(errorMessage);
  }, [speech.error]);

  useEffect(() => {
    let timerId = null;
    if (speech.isListening) {
      timerId = window.setInterval(() => setRecordSeconds((prev) => prev + 1), 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => {
      if (timerId) window.clearInterval(timerId);
    };
  }, [speech.isListening]);

  useEffect(() => {
    let socket;
    let reconnectTimer;
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;
      socket = new WebSocket(`${wsBase}/api/sensors/ws`);
      socket.onopen = () => setWsConnected(true);
      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === 'sensor' && payload.data) {
            const nextSensor = payload.data;
            setSensors((prev) => ({ ...prev, [nextSensor.type]: { value: nextSensor.value, unit: nextSensor.unit || '' } }));
            setSensorLog((prev) => [
              { id: `${Date.now()}-${nextSensor.type}`, text: `[${new Date().toLocaleTimeString('ko-KR', { hour12: false })}] ${nextSensor.type}: ${nextSensor.value}${nextSensor.unit || ''}` },
              ...prev,
            ].slice(0, 40));
          }
        } catch (error) {
          console.error(error);
        }
      };
      socket.onclose = () => {
        setWsConnected(false);
        if (!cancelled) reconnectTimer = window.setTimeout(connect, 3000);
      };
    };

    connect();
    return () => {
      cancelled = true;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      if (socket && socket.readyState < 2) socket.close();
    };
  }, [wsBase]);

  async function apiRequest(path, options = {}) {
    const { method = 'GET', body, headers = {} } = options;
    const requestOptions = { method, headers: { ...headers } };
    if (body instanceof FormData) {
      requestOptions.body = body;
    } else if (body !== undefined) {
      requestOptions.headers['Content-Type'] = 'application/json';
      requestOptions.body = JSON.stringify(body);
    }
    const response = await fetch(`${apiBase}${path}`, requestOptions);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `${response.status}`);
    }
    if (response.status === 204) return null;
    return response.json();
  }

  async function loadWeather() {
    try {
      const data = await apiRequest('/api/weather/seoul');
      setWeather(data);
    } catch (error) {
      setMessage(`날씨 정보를 불러오지 못했습니다: ${error.message}`);
    }
  }

  async function loadWorkers() { const data = await apiRequest('/api/workers/'); setWorkers(Array.isArray(data) ? data : []); }
  async function loadAlerts() { const data = await apiRequest('/api/alerts/'); setAlerts(Array.isArray(data) ? data : []); }
  async function loadSensors() { const data = await apiRequest('/api/sensors/latest'); setSensors(data || { temperature: null, humidity: null, dust: null, gas: null }); }
  async function loadReports() { const data = await apiRequest('/api/reports/'); setReports(Array.isArray(data) ? data : []); }
  async function loadPhotos() {
    const query = photoZone ? `?zone_id=${photoZone}` : '';
    const data = await apiRequest(`/api/photos/${query}`);
    setPhotos(Array.isArray(data) ? data : []);
  }

  async function loadDashboard() { await Promise.all([loadWeather(), loadWorkers(), loadAlerts(), loadSensors()]); }

  useEffect(() => {
    const run = async () => {
      try {
        if (activePage === 'dashboard') {
          await loadDashboard();
          setMessage('대시보드 데이터가 최신 상태입니다.');
        }
        if (activePage === 'workers') await loadWorkers();
        if (activePage === 'zones') await loadWorkers();
        if (activePage === 'progress') setMessage('공정 진행률을 확인하세요.');
        if (activePage === 'sensors') await loadSensors();
        if (activePage === 'alerts') await loadAlerts();
        if (activePage === 'report') await loadReports();
        if (activePage === 'photos') await loadPhotos();
      } catch (error) {
        setMessage(`데이터를 불러오지 못했습니다: ${error.message}`);
      }
    };
    run();
  }, [activePage]);

  useEffect(() => {
    loadWeather();
    const timerId = window.setInterval(loadWeather, WEATHER_REFRESH_MS);
    return () => window.clearInterval(timerId);
  }, []);

  useEffect(() => {
    if (activePage === 'photos') {
      loadPhotos().catch((error) => setMessage(`현장 사진을 불러오지 못했습니다: ${error.message}`));
    }
  }, [photoZone]);

  useEffect(() => {
    let cancelled = false;

    async function loadPhotoAnalysisKo() {
      if (!selectedPhoto?.id || !selectedPhoto.ai_result?.trim()) return;
      if (photoAnalysisKo[selectedPhoto.id]) return;

      try {
        setPhotoAnalysisLoading(true);
        const data = await apiRequest('/api/translate', {
          method: 'POST',
          body: {
            text: selectedPhoto.ai_result,
            source_language: 'en',
            target_language: 'ko',
          },
        });

        if (!cancelled) {
          setPhotoAnalysisKo((prev) => ({
            ...prev,
            [selectedPhoto.id]: data.translated_text || '한국어 번역 결과가 없습니다.',
          }));
        }
      } catch (error) {
        if (!cancelled) {
          setPhotoAnalysisKo((prev) => ({
            ...prev,
            [selectedPhoto.id]: `한국어 번역을 불러오지 못했습니다: ${error.message}`,
          }));
        }
      } finally {
        if (!cancelled) setPhotoAnalysisLoading(false);
      }
    }

    loadPhotoAnalysisKo();
    return () => {
      cancelled = true;
    };
  }, [selectedPhoto, photoAnalysisKo]);

  async function handleCreateWorker() {
    if (!newWorker.name.trim()) {
      setMessage('작업자 이름을 입력해 주세요.');
      return;
    }
    try {
      await apiRequest('/api/workers/', {
        method: 'POST',
        body: {
          name: newWorker.name.trim(),
          role: newWorker.role.trim() || null,
          phone: newWorker.phone.trim() || null,
          zone_id: newWorker.zone_id ? Number(newWorker.zone_id) : null,
          status: 'work',
        },
      });
      setNewWorker({ name: '', role: '', phone: '', zone_id: '' });
      setShowWorkerForm(false);
      await loadWorkers();
      setMessage('작업자를 등록했습니다.');
    } catch (error) {
      setMessage(`작업자 등록에 실패했습니다: ${error.message}`);
    }
  }

  async function handleUpdateWorkerStatus(workerId, status) {
    try {
      await apiRequest(`/api/workers/${workerId}`, { method: 'PATCH', body: { status } });
      await loadWorkers();
      setMessage('작업자 상태를 변경했습니다.');
    } catch (error) {
      setMessage(`작업자 상태 변경에 실패했습니다: ${error.message}`);
    }
  }

  async function handleDeleteWorker(workerId) {
    if (!window.confirm('이 작업자를 삭제하시겠습니까?')) return;
    try {
      await apiRequest(`/api/workers/${workerId}`, { method: 'DELETE' });
      await loadWorkers();
      setMessage('작업자를 삭제했습니다.');
    } catch (error) {
      setMessage(`작업자 삭제에 실패했습니다: ${error.message}`);
    }
  }

  async function handleCreateAlert() {
    if (!newAlert.message.trim()) {
      setMessage('알림 내용을 입력해 주세요.');
      return;
    }
    try {
      await apiRequest('/api/alerts/', {
        method: 'POST',
        body: {
          level: newAlert.level,
          source: newAlert.source.trim() || '수동 입력',
          message: newAlert.message.trim(),
        },
      });
      setNewAlert({ level: 'high', source: '', message: '' });
      setShowAlertForm(false);
      await loadAlerts();
      setMessage('안전 알림을 등록했습니다.');
    } catch (error) {
      setMessage(`안전 알림 등록에 실패했습니다: ${error.message}`);
    }
  }

  async function handleResolveAlert(alertId) {
    try {
      await apiRequest(`/api/alerts/${alertId}/resolve`, { method: 'PATCH' });
      await loadAlerts();
      setMessage('알림을 처리 완료했습니다.');
    } catch (error) {
      setMessage(`알림 처리에 실패했습니다: ${error.message}`);
    }
  }

  async function handleTranslateWalkie() {
    const text = sourceText.trim();
    if (!text) {
      setMessage('먼저 말하거나 텍스트를 입력해 주세요.');
      return;
    }
    if (sourceLanguage === targetLanguage) {
      setTranslatedText(text);
      setMessage('같은 언어로 선택되어 원문을 그대로 표시했습니다.');
      return;
    }
    try {
      setTranslating(true);
      const data = await apiRequest('/api/translate', {
        method: 'POST',
        body: { text, source_language: sourceLanguage, target_language: targetLanguage },
      });
      setTranslatedText(data.translated_text || '');
      setMessage(`${targetMeta.label} 번역이 완료되었습니다.`);
    } catch (error) {
      setMessage(`번역에 실패했습니다: ${error.message}`);
    } finally {
      setTranslating(false);
    }
  }

  function handleResetWalkie() {
    speech.stop();
    setSourceText('');
    setTranslatedText('');
    setRecordSeconds(0);
    setMessage('워키토키 입력을 초기화했습니다.');
  }

  function handlePlayTranslatedText() {
    const text = translatedText.trim();
    if (!text) {
      setMessage('재생할 번역 문장이 없습니다.');
      return;
    }
    if (!window.speechSynthesis) {
      setMessage('이 브라우저는 음성 재생을 지원하지 않습니다.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = targetMeta.voice;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
    setMessage('번역 음성을 재생 중입니다.');
  }

  async function handleSaveWalkie() {
    const text = sourceText.trim();
    if (!text) {
      setMessage('저장할 원문이 없습니다.');
      return;
    }
    try {
      setSavingReport(true);
      await apiRequest('/api/reports/', {
        method: 'POST',
        body: {
          text_content: text,
          translated_text: translatedText.trim(),
          source_language: sourceLanguage,
          target_language: targetLanguage,
          author_name: '구이일',
        },
      });
      await loadReports();
      setMessage('전달 기록을 저장했습니다.');
    } catch (error) {
      setMessage(`전달 기록 저장에 실패했습니다: ${error.message}`);
    } finally {
      setSavingReport(false);
    }
  }

  async function handleDeleteReport(reportId) {
    if (!window.confirm('이 전달 기록을 삭제하시겠습니까?')) return;
    try {
      await apiRequest(`/api/reports/${reportId}`, { method: 'DELETE' });
      await loadReports();
      setMessage('전달 기록을 삭제했습니다.');
    } catch (error) {
      setMessage(`전달 기록 삭제에 실패했습니다: ${error.message}`);
    }
  }

  async function handlePhotoUpload(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    try {
      setUploadingPhotos(true);
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        if (photoZone) formData.append('zone_id', photoZone);
        await apiRequest('/api/photos/', { method: 'POST', body: formData });
      }
      await loadPhotos();
      setMessage('현장 사진 업로드를 완료했습니다.');
    } catch (error) {
      setMessage(`현장 사진 업로드에 실패했습니다: ${error.message}`);
    } finally {
      setUploadingPhotos(false);
      event.target.value = '';
    }
  }

  async function handleDeletePhoto(photoId) {
    if (!window.confirm('이 사진을 삭제하시겠습니까?')) return;
    try {
      await apiRequest(`/api/photos/${photoId}`, { method: 'DELETE' });
      await loadPhotos();
      setMessage('현장 사진을 삭제했습니다.');
    } catch (error) {
      setMessage(`현장 사진 삭제에 실패했습니다: ${error.message}`);
    }
  }

  const weatherVisual = getWeatherVisual(weather?.weather_code, weather?.is_day);
  const weatherTemp = typeof weather?.temperature_c === 'number' ? `${weather.temperature_c.toFixed(1)}°C` : '--°C';
  const weatherHumidity = typeof weather?.humidity_pct === 'number' ? `${Math.round(weather.humidity_pct)}%` : '--%';
  const weatherWind = typeof weather?.wind_speed_ms === 'number' ? `${weather.wind_speed_ms.toFixed(1)}m/s` : '--m/s';
  const weatherSunset = weather?.sunset_time || '--:--';
  const currentTemp = typeof sensors.temperature?.value === 'number' ? `${sensors.temperature.value.toFixed(1)}°` : '—';

  function renderDashboardPage() {
    return (
      <div className="page active">
        <div className="weather-strip">
          <div className="weather-main">
            <div style={{ fontSize: 28 }}>{weatherVisual.icon}</div>
            <div>
              <div className="weather-temp">{weatherTemp}</div>
              <div className="weather-desc">{weather ? `${weatherVisual.desc} · 서울` : '날씨 로딩 중 · 서울'}</div>
            </div>
          </div>
          <div className="weather-divider"></div>
          <div className="weather-stat">💧 습도 <span>{weatherHumidity}</span></div>
          <div className="weather-stat">💨 풍속 <span>{weatherWind}</span></div>
          <div className="weather-stat">🌅 일몰 <span>{weatherSunset}</span></div>
        </div>

        <div className="kpi-grid">
          <div className="kpi-card ok"><div className="kpi-label">현장 인원</div><div className="kpi-value">{activeWorkers.length || '—'}</div><div className="kpi-delta">작업 중</div><div className="kpi-icon">👷</div></div>
          <div className="kpi-card warn"><div className="kpi-label">평균 공정률</div><div className="kpi-value">67%</div><div className="kpi-delta">전체 공종 평균</div><div className="kpi-icon">📈</div></div>
          <div className="kpi-card bad"><div className="kpi-label">미처리 알림</div><div className="kpi-value">{alerts.length || '—'}</div><div className="kpi-delta">즉시 확인 필요</div><div className="kpi-icon">⚠️</div></div>
          <div className="kpi-card info"><div className="kpi-label">현재 온도</div><div className="kpi-value">{currentTemp}</div><div className="kpi-delta">센서 실시간</div><div className="kpi-icon">🌡️</div></div>
        </div>

        <div className="split-grid">
          <div className="panel">
            <div className="panel-title">🗺️ 구역별 인원</div>
            <div className="zone-grid">
              {ZONES.map((zone) => (
                <div className={`zone ${zone.risk}`} key={zone.id}>
                  <div className="zone-name">{zone.name}</div>
                  <div className="zone-workers">{zoneCounts[zone.id] || 0}명</div>
                  <div className="zone-sub">{zone.task}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="panel">
            <div className="panel-title">⚠️ 최근 알림</div>
            <div className="alert-list">
              {alerts.length === 0 && <div className="loading"><div className="spinner"></div>표시할 알림이 없습니다.</div>}
              {alerts.slice(0, 3).map((alert) => (
                <div key={alert.id} className={`alert-item level-${alert.level}`}>
                  <div className="alert-dot"></div>
                  <div>
                    <div className="alert-text">{alert.message}</div>
                    <div className="alert-time">{new Date(alert.created_at).toLocaleTimeString('ko-KR', { hour12: false })} · {alert.source}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderWorkersPage() {
    return (
      <div className="page active">
        <div className="section-header">
          <div className="section-title">인력 관리</div>
          <button className="btn-primary react-btn-auto" onClick={() => setShowWorkerForm((prev) => !prev)} type="button">+ 작업자 등록</button>
        </div>
        {showWorkerForm && (
          <div className="panel">
            <div className="panel-title">✏️ 작업자 등록</div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">이름</label><input className="form-input" value={newWorker.name} onChange={(event) => setNewWorker((prev) => ({ ...prev, name: event.target.value }))} placeholder="홍길동" /></div>
              <div className="form-group"><label className="form-label">직책</label><input className="form-input" value={newWorker.role} onChange={(event) => setNewWorker((prev) => ({ ...prev, role: event.target.value }))} placeholder="전기 반장" /></div>
              <div className="form-group"><label className="form-label">연락처</label><input className="form-input" value={newWorker.phone} onChange={(event) => setNewWorker((prev) => ({ ...prev, phone: event.target.value }))} placeholder="010-0000-0000" /></div>
              <div className="form-group"><label className="form-label">담당 구역</label><select className="form-select" value={newWorker.zone_id} onChange={(event) => setNewWorker((prev) => ({ ...prev, zone_id: event.target.value }))}><option value="">선택</option>{ZONES.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}</select></div>
            </div>
            <div className="button-row"><button className="btn-primary react-btn-auto" onClick={handleCreateWorker} type="button">등록</button><button className="btn-sm react-btn-auto" onClick={() => setShowWorkerForm(false)} type="button">취소</button></div>
          </div>
        )}
        <div className="panel">
          <div className="panel-title">👷 전체 작업자</div>
          <table className="worker-table">
            <thead><tr><th>이름/직책</th><th>연락처</th><th>담당 구역</th><th>상태</th><th>관리</th></tr></thead>
            <tbody>
              {workers.length === 0 && <tr><td colSpan="5" className="table-empty">등록된 작업자가 없습니다.</td></tr>}
              {workers.map((worker) => {
                const zone = getZoneMeta(worker.zone_id);
                return (
                  <tr key={worker.id}>
                    <td><div className="worker-name"><div className="mini-avatar">{(worker.name || '?').slice(0, 1)}</div><div><div>{worker.name}</div><div className="table-sub">{worker.role || '직책 미지정'}</div></div></div></td>
                    <td>{worker.phone || '-'}</td>
                    <td>{zone ? `${zone.name} · ${zone.description}` : '미지정'}</td>
                    <td><span className={`status-tag ${worker.status}`}>{WORKER_STATUS_LABELS[worker.status] || worker.status}</span></td>
                    <td><div className="table-action-stack"><select className="form-select compact-select" value={worker.status} onChange={(event) => handleUpdateWorkerStatus(worker.id, event.target.value)}><option value="work">작업 중</option><option value="rest">휴식</option><option value="absent">미출근</option></select><button className="btn-danger-xs react-btn-auto" onClick={() => handleDeleteWorker(worker.id)} type="button">삭제</button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderZonesPage() {
    return <div className="page active"><div className="section-title">구역 현황</div><div className="zone-grid zone-grid-wide">{ZONES.map((zone) => <div className={`zone ${zone.risk}`} key={zone.id}><div className="zone-name">{zone.name}</div><div className="zone-workers">{zoneCounts[zone.id] || 0}명</div><div className="zone-sub">{zone.description} · {zone.task}</div></div>)}</div></div>;
  }

  function renderProgressPage() {
    return <div className="page active"><div className="section-title">공종별 진행률</div><div className="panel"><div className="progress-list">{PROGRESS_ITEMS.map((item) => <div key={item.name}><div className="progress-header"><span className="progress-name">{item.name}</span><span className="progress-pct">{item.pct}%</span></div><div className="progress-track"><div className="progress-fill" style={{ width: `${item.pct}%`, background: item.color }}></div></div></div>)}</div></div></div>;
  }

  function renderSensorsPage() {
    const sensorCards = [
      { key: 'temperature', icon: '🌡️', label: '온도', unit: '°C', limit: 40 },
      { key: 'humidity', icon: '💧', label: '습도', unit: '%', limit: 90 },
      { key: 'dust', icon: '🌫️', label: '미세먼지', unit: 'µg/m³', limit: 150 },
      { key: 'gas', icon: '☁️', label: '가스', unit: 'ppm', limit: 50 },
    ];
    return (
      <div className="page active">
        <div className="section-title">센서 실시간 현황</div>
        <div className="sensor-grid">
          {sensorCards.map((sensor) => {
            const value = sensors[sensor.key]?.value;
            const isDanger = typeof value === 'number' ? value > sensor.limit : false;
            return <div className="sensor-card" key={sensor.key}><div className="sensor-icon">{sensor.icon}</div><div className="sensor-label">{sensor.label}</div><div className="sensor-value">{typeof value === 'number' ? value.toFixed(1) : '—'}</div><div className="sensor-unit">{sensor.unit}</div><div className={`sensor-status ${isDanger ? 'bad' : 'ok'}`}>{isDanger ? '주의' : '정상'}</div></div>;
          })}
        </div>
        <div className="panel"><div className="panel-title">📡 수신 로그</div><div className="sensor-log-list">{sensorLog.length === 0 && <span className="table-sub">대기 중...</span>}{sensorLog.map((entry) => <span key={entry.id}>{entry.text}</span>)}</div></div>
      </div>
    );
  }

  function renderAlertsPage() {
    return (
      <div className="page active">
        <div className="section-header"><div className="section-title">안전 알림</div><button className="btn-primary react-btn-auto" onClick={() => setShowAlertForm((prev) => !prev)} type="button">+ 수동 등록</button></div>
        {showAlertForm && <div className="panel"><div className="panel-title">✏️ 알림 수동 등록</div><div className="form-grid"><div className="form-group"><label className="form-label">위험 수준</label><select className="form-select" value={newAlert.level} onChange={(event) => setNewAlert((prev) => ({ ...prev, level: event.target.value }))}><option value="high">높음</option><option value="mid">중간</option><option value="low">낮음</option></select></div><div className="form-group"><label className="form-label">발생 위치</label><input className="form-input" value={newAlert.source} onChange={(event) => setNewAlert((prev) => ({ ...prev, source: event.target.value }))} placeholder="C구역 3층" /></div></div><div className="form-group spaced-field"><label className="form-label">내용</label><input className="form-input" value={newAlert.message} onChange={(event) => setNewAlert((prev) => ({ ...prev, message: event.target.value }))} placeholder="알림 내용 입력" /></div><div className="button-row"><button className="btn-primary react-btn-auto" onClick={handleCreateAlert} type="button">등록</button><button className="btn-sm react-btn-auto" onClick={() => setShowAlertForm(false)} type="button">취소</button></div></div>}
        <div className="panel"><div className="panel-title">⚠️ 미처리 알림</div><div className="alert-list">{alerts.length === 0 && <div className="loading"><div className="spinner"></div>미처리 알림이 없습니다.</div>}{alerts.map((alert) => <div key={alert.id} className={`alert-item level-${alert.level}`}><div className="alert-dot"></div><div className="alert-content-grow"><div className="alert-text">{alert.message}</div><div className="alert-time">{new Date(alert.created_at).toLocaleString('ko-KR')} · {alert.source}</div></div><button className="alert-resolve-btn react-btn-auto" onClick={() => handleResolveAlert(alert.id)} type="button">해결</button></div>)}</div></div>
      </div>
    );
  }

  function renderReportPage() {
    return (
      <div className="page active">
        <div className="section-header"><div className="section-title">워키토키</div></div>
        <div className="panel">
          <div className="panel-title">📻 음성 번역</div>
          <div className="form-grid"><div className="form-group"><label className="form-label">말할 언어</label><div className="language-select-row"><select className="form-select" value={sourceLanguage} onChange={(event) => setSourceLanguage(event.target.value)}>{LANGUAGES.map((language) => <option key={language.code} value={language.code}>{language.label}</option>)}</select><div className="language-flag-badge">{sourceMeta.badge} <img className="language-flag-image" src={sourceMeta.flagPath} alt={`${sourceMeta.label} flag`} /></div></div></div><div className="form-group"><label className="form-label">번역 언어</label><div className="language-select-row"><select className="form-select" value={targetLanguage} onChange={(event) => setTargetLanguage(event.target.value)}>{LANGUAGES.map((language) => <option key={language.code} value={language.code}>{language.label}</option>)}</select><div className="language-flag-badge">{targetMeta.badge} <img className="language-flag-image" src={targetMeta.flagPath} alt={`${targetMeta.label} flag`} /></div></div></div></div>
          <div className="recorder-box recorder-box-spaced"><div className="record-timer">{formatTimer(recordSeconds)}</div><button className={`record-btn ${speech.isListening ? 'recording' : ''}`} onClick={speech.isListening ? speech.stop : speech.start} type="button">🎙️</button><div className="record-status">{speech.isListening ? '음성 인식 중입니다.' : '버튼을 눌러 음성 인식을 시작하세요'}</div><div className="walkie-language-row"><span><img className="walkie-inline-flag" src={sourceMeta.flagPath} alt={`${sourceMeta.label} flag`} /> 말할 언어: {sourceMeta.label}</span><span><img className="walkie-inline-flag" src={targetMeta.flagPath} alt={`${targetMeta.label} flag`} /> 번역 언어: {targetMeta.label}</span></div><div className={`stt-result ${sourceText ? 'filled' : ''}`}>{sourceText || '말하면 여기에 텍스트가 표시됩니다...'}</div><div className={`stt-result walkie-translation-box ${translatedText ? 'filled' : ''}`}>{translatedText || '번역 결과가 여기에 표시됩니다...'}</div>{speech.error && <div className="walkie-error">{getSpeechErrorMessage(speech.error)}</div>}<div className="walkie-action-row"><button className="btn-primary react-btn-auto" onClick={handleTranslateWalkie} disabled={translating} type="button">{translating ? '번역 중...' : '번역하기'}</button><button className="btn-sm react-btn-auto" onClick={handlePlayTranslatedText} type="button">음성 재생</button><button className="btn-primary react-btn-auto" onClick={handleSaveWalkie} disabled={savingReport} type="button">{savingReport ? '저장 중...' : '저장'}</button><button className="btn-sm react-btn-auto" onClick={handleResetWalkie} type="button">초기화</button></div></div>
        </div>
        <div className="panel"><div className="panel-title">📋 저장된 전달 기록</div><div className="report-list-wrap">{visibleReports.length === 0 && <div className="table-empty">저장된 전달 기록이 없습니다.</div>}{visibleReports.map((report) => <div className="report-item" key={report.id}><div className="report-header"><div><div className="report-date">{report.date || new Date(report.created_at).toLocaleDateString('ko-KR')}</div><div className="report-author">작성자: {report.author_name || '구이일'}</div></div><button className="report-delete-btn react-btn-auto" onClick={() => handleDeleteReport(report.id)} type="button" aria-label="삭제"><svg viewBox="0 0 24 24"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg></button></div><div className="report-preview">원문: {report.text_content}</div><div className="report-preview">번역: {report.translated_text || '번역 없음'}</div></div>)}</div></div>
      </div>
    );
  }

  function renderPhotoModal() {
    if (!selectedPhoto) return null;
    const zone = getZoneMeta(selectedPhoto.zone_id);
    const takenAt = selectedPhoto.taken_at
      ? new Date(selectedPhoto.taken_at).toLocaleString('ko-KR')
      : '시간 정보 없음';
    const translatedAnalysis = photoAnalysisKo[selectedPhoto.id];

    return (
      <div className="photo-modal-overlay" onClick={() => setSelectedPhoto(null)}>
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
              <button className="photo-modal-close-react react-btn-auto" type="button" onClick={() => setSelectedPhoto(null)}>
                닫기
              </button>
            </div>
            <div className="photo-modal-badges-react">
              <span className={`photo-risk-badge ${selectedPhoto.risk_detected ? 'risk' : 'safe'}`}>
                {selectedPhoto.risk_detected ? '위험' : '정상'}
              </span>
              <span className="photo-modal-badge-react">{selectedPhoto.original_name || 'uploaded photo'}</span>
            </div>
            <div className="photo-modal-analysis-react">
              <strong>English</strong>
              <br />
              {selectedPhoto.ai_result || '분석 결과가 없습니다.'}
              <br />
              <br />
              <strong>한국어</strong>
              <br />
              {photoAnalysisLoading && !translatedAnalysis ? '한국어 번역을 불러오는 중입니다...' : (translatedAnalysis || '한국어 번역 결과가 없습니다.')}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderPhotosPage() {
    return (
      <div className="page active">
        <div className="section-header">
          <div className="section-title">현장 사진</div>
        </div>
        <div className="panel">
          <div className="panel-title">📤 사진 입력, AI 자동 분석</div>
          <div className="form-group compact-field">
            <label className="form-label">구역 선택</label>
            <select className="form-select narrow-select" value={photoZone} onChange={(event) => setPhotoZone(event.target.value)}>
              <option value="">전체</option>
              {ZONES.map((zone) => (
                <option key={zone.id} value={zone.id}>{zone.name}</option>
              ))}
            </select>
          </div>
          <div className="upload-zone simple-upload-zone">
            <div className="upload-zone-icon">📸</div>
            <div className="upload-zone-text">클릭하거나 파일을 선택해 업로드하세요.</div>
            <input className="file-input-inline" type="file" accept="image/*" multiple onChange={handlePhotoUpload} />
          </div>
          {uploadingPhotos && <div className="loading"><div className="spinner"></div>AI 분석 중...</div>}
        </div>
        <div className="panel">
          <div className="panel-title">🖼️ 사진 아카이브</div>
          <div className="photo-grid">
            {photos.length === 0 && <div className="table-empty">업로드된 사진이 없습니다.</div>}
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
                    <img src={`${apiBase}/api/photos/file/${photo.id}`} alt="현장 사진" />
                  </div>
                  <div className="photo-info">
                    <div className="photo-card-top">
                      <span>{zone ? zone.name : '구역 미지정'}</span>
                      <span className={`photo-risk-badge ${photo.risk_detected ? 'risk' : 'safe'}`}>
                        {photo.risk_detected ? '위험' : '정상'}
                      </span>
                    </div>
                    <div className="photo-ai">{photo.ai_result || '분석 결과가 없습니다.'}</div>
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
        {renderPhotoModal()}
      </div>
    );
  }
  function renderPage() {
    if (activePage === 'dashboard') return renderDashboardPage();
    if (activePage === 'workers') return renderWorkersPage();
    if (activePage === 'zones') return renderZonesPage();
    if (activePage === 'progress') return renderProgressPage();
    if (activePage === 'sensors') return renderSensorsPage();
    if (activePage === 'alerts') return renderAlertsPage();
    if (activePage === 'report') return renderReportPage();
    if (activePage === 'photos') return renderPhotosPage();
    return <div className="page active"><div className="section-title">준비 중</div></div>;
  }

  return (
    <div className="ipad-shell">
      <div className="topbar"><div className="topbar-left"><div className="site-badge"><div className="icon">🏗️</div><div><div className="site-name">한강 스카이타워 현장</div><div className="site-sub">서울 마포구 · 공정률 67% · 현장코드 #LGEDX-2026-92</div></div></div><div className="divider-v"></div><div className="status-pill"><div className="dot"></div>정상 운영 중</div></div><div className="topbar-right"><div className={`ws-status ${wsConnected ? 'connected' : ''}`}>{wsConnected ? '● 서버 연결됨' : '● 서버 연결 중...'}</div><div className="time-display"><div className="time">{clock}</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{dateText}</div></div></div></div>
      <div className="main"><div className="sidebar">{NAV_SECTIONS.map((section) => <div className="sidebar-section" key={section.title}><div className="sidebar-label">{section.title}</div>{section.items.map((item) => { const count = item.countKey === 'alerts' ? alerts.length : null; return <div className={`nav-item ${activePage === item.key ? 'active' : ''} ${item.disabled ? 'disabled-nav-item' : ''}`} key={item.key} onClick={() => !item.disabled && setActivePage(item.key)} role="button" tabIndex={item.disabled ? -1 : 0} onKeyDown={(event) => { if (!item.disabled && (event.key === 'Enter' || event.key === ' ')) setActivePage(item.key); }}><span className="nav-icon">{item.icon}</span>{item.label}{count !== null && <span className="nav-count">{count}</span>}</div>; })}</div>)}<div className="sidebar-footer"><div className="user-card"><div className="avatar">구</div><div className="user-info"><div className="name">구이일</div><div className="role">현장 총괄 관리자</div></div></div><div className="theme-card"><div><div className="theme-card-label">테마 모드</div><div className="theme-card-mode">{theme === 'light' ? '라이트 모드' : '다크 모드'}</div></div><label className="theme-switch"><input type="checkbox" checked={theme === 'light'} onChange={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))} aria-label="라이트 모드 전환" /><span className="theme-slider"></span></label></div></div></div><div className="content"><div className="react-message-bar">{message}</div>{renderPage()}</div></div>
    </div>
  );
}















