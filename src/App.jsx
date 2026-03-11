import { useEffect, useMemo, useState } from 'react';
import useSpeechRecognition from './hooks/useSpeechRecognition';
import './App.css';
import { LANGUAGES, NAV_SECTIONS, PROGRESS_ITEMS, THEME_KEY, WEATHER_REFRESH_MS, WORKER_STATUS_LABELS, ZONES } from './constants/dashboard';
import { formatClockDisplay, formatDateDisplay, formatTimer, getApiBase, getSpeechErrorMessage, getWeatherVisual, getZoneMeta, isLegacyPlaceholder } from './utils/dashboard';
import { SidebarNav, SiteTopbar } from './components/layout';
import { AlertsPage, DashboardPage, PhotosPage, ProgressPage, ReportPage, SensorsPage, WorkersPage, ZonesPage } from './components/pages';

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
          author_name: '구이일짱',
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
      <DashboardPage
        weather={weather}
        weatherVisual={weatherVisual}
        weatherTemp={weatherTemp}
        weatherHumidity={weatherHumidity}
        weatherWind={weatherWind}
        weatherSunset={weatherSunset}
        activeWorkers={activeWorkers}
        alerts={alerts}
        currentTemp={currentTemp}
        ZONES={ZONES}
        zoneCounts={zoneCounts}
      />
    );
  }

  function renderWorkersPage() {
    return (
      <WorkersPage
        showWorkerForm={showWorkerForm}
        setShowWorkerForm={setShowWorkerForm}
        newWorker={newWorker}
        setNewWorker={setNewWorker}
        handleCreateWorker={handleCreateWorker}
        workers={workers}
        ZONES={ZONES}
        getZoneMeta={getZoneMeta}
        WORKER_STATUS_LABELS={WORKER_STATUS_LABELS}
        handleUpdateWorkerStatus={handleUpdateWorkerStatus}
        handleDeleteWorker={handleDeleteWorker}
      />
    );
  }

  function renderZonesPage() {
    return <ZonesPage ZONES={ZONES} zoneCounts={zoneCounts} />;
  }

  function renderProgressPage() {
    return <ProgressPage PROGRESS_ITEMS={PROGRESS_ITEMS} />;
  }

  function renderSensorsPage() {
    return <SensorsPage sensors={sensors} sensorLog={sensorLog} />;
  }

  function renderAlertsPage() {
    return (
      <AlertsPage
        showAlertForm={showAlertForm}
        setShowAlertForm={setShowAlertForm}
        newAlert={newAlert}
        setNewAlert={setNewAlert}
        handleCreateAlert={handleCreateAlert}
        alerts={alerts}
        handleResolveAlert={handleResolveAlert}
      />
    );
  }

  function renderReportPage() {
    return (
      <ReportPage
        sourceLanguage={sourceLanguage}
        targetLanguage={targetLanguage}
        setSourceLanguage={setSourceLanguage}
        setTargetLanguage={setTargetLanguage}
        languages={LANGUAGES}
        sourceMeta={sourceMeta}
        targetMeta={targetMeta}
        speech={speech}
        recordSeconds={recordSeconds}
        formatTimer={formatTimer}
        sourceText={sourceText}
        translatedText={translatedText}
        getSpeechErrorMessage={getSpeechErrorMessage}
        translating={translating}
        handleTranslateWalkie={handleTranslateWalkie}
        handlePlayTranslatedText={handlePlayTranslatedText}
        savingReport={savingReport}
        handleSaveWalkie={handleSaveWalkie}
        handleResetWalkie={handleResetWalkie}
        visibleReports={visibleReports}
        handleDeleteReport={handleDeleteReport}
      />
    );
  }

  

  function renderPhotosPage() {
    return (
      <PhotosPage
        photoZone={photoZone}
        setPhotoZone={setPhotoZone}
        zones={ZONES}
        handlePhotoUpload={handlePhotoUpload}
        uploadingPhotos={uploadingPhotos}
        photos={photos}
        getZoneMeta={getZoneMeta}
        setSelectedPhoto={setSelectedPhoto}
        selectedPhoto={selectedPhoto}
        apiBase={apiBase}
        photoAnalysisKo={photoAnalysisKo}
        photoAnalysisLoading={photoAnalysisLoading}
        handleDeletePhoto={handleDeletePhoto}
      />
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
      <SiteTopbar wsConnected={wsConnected} clock={clock} dateText={dateText} />
      <div className="main">
        <SidebarNav
          navSections={NAV_SECTIONS}
          activePage={activePage}
          alertsCount={alerts.length}
          theme={theme}
          setTheme={setTheme}
          setActivePage={setActivePage}
        />
        <div className="content">
          <div className="react-message-bar">{message}</div>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}















