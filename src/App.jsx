import { useEffect, useMemo, useState } from 'react';
import useSpeechRecognition from './hooks/useSpeechRecognition';
import useThemePreference from './hooks/useThemePreference';
import useClockDisplay from './hooks/useClockDisplay';
import useSensorStream from './hooks/useSensorStream';
import './App.css';
import { AUTH_STORAGE_KEY, LANGUAGES, NAV_SECTIONS, PROGRESS_ITEMS, THEME_KEY, WEATHER_REFRESH_MS, WORKER_ROLE_OPTIONS, WORKER_STATUS_LABELS, ZONES } from './constants/dashboard';
import { formatShiftDuration, formatTimer, getApiBase, getSpeechErrorMessage, getWeatherVisual, getZoneMeta, isLegacyPlaceholder } from './utils/dashboard';
import { SidebarNav, SiteTopbar } from './components/layout';
import { AlertSettingsPage, AlertsPage, DailyWorkLogPage, DashboardPage, EnvironmentSettingsPage, LoginPage, PhotosPage, ProgressPage, ReportPage, WorkersPage, ZonesPage } from './components/pages';
import { createAlert, createReport, createWorker, fetchAlerts, fetchCurrentUser, fetchLatestSensors, fetchPhotos, fetchTodayReports, fetchTodaySummary, fetchWeather, fetchWorkers, loginUser, logoutUser, removePhoto, removeReport, removeWorker, resolveAlert, translateText, updateWorkerStatus, uploadPhoto } from './services/dashboardApi';

export default function App() {
  const apiBase = useMemo(() => getApiBase(), []);
  const wsBase = useMemo(() => apiBase.replace(/^http/, 'ws'), [apiBase]);

  const [activePage, setActivePage] = useState('dashboard');
  const [authToken, setAuthToken] = useState(() => window.localStorage.getItem(AUTH_STORAGE_KEY) || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(() => Boolean(window.localStorage.getItem(AUTH_STORAGE_KEY)));
  const [authError, setAuthError] = useState('');
  const [theme, setTheme] = useThemePreference(THEME_KEY);
  const { clock, dateText } = useClockDisplay();
  const [message, setMessage] = useState('\ub300\uc2dc\ubcf4\ub4dc\ub97c \ubd88\ub7ec\uc624\ub294 \uc911\uc785\ub2c8\ub2e4.');

  const [weather, setWeather] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [sensors, setSensors] = useState({ temperature: null, humidity: null, dust: null, gas: null });
  const [sensorLog, setSensorLog] = useState([]);
  const [reports, setReports] = useState([]);
  const [todaySummary, setTodaySummary] = useState(null);
  const [manualLogText, setManualLogText] = useState('');
  const [savingManualLog, setSavingManualLog] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoAnalysisKo, setPhotoAnalysisKo] = useState({});
  const [photoAnalysisLoading, setPhotoAnalysisLoading] = useState(false);

  const [showWorkerForm, setShowWorkerForm] = useState(false);
  const [newWorker, setNewWorker] = useState({ name: '', role: '', phone: '', zone_id: '' });
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [newAlert, setNewAlert] = useState({ level: 'high', source: '', message: '', zone_id: '' });

  const [sourceLanguage, setSourceLanguage] = useState('ko');
  const [targetLanguage, setTargetLanguage] = useState('vi');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [translating, setTranslating] = useState(false);
  const [savingReport, setSavingReport] = useState(false);
  const [autoTranslateAfterSpeech, setAutoTranslateAfterSpeech] = useState(false);

  const [photoZone, setPhotoZone] = useState('');
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  const sourceMeta = LANGUAGES.find((item) => item.code === sourceLanguage) || LANGUAGES[0];
  const targetMeta = LANGUAGES.find((item) => item.code === targetLanguage) || LANGUAGES[0];
  const speech = useSpeechRecognition(sourceMeta.speech);
  const wsConnected = useSensorStream(wsBase, setSensors, setSensorLog);

  const visibleReports = reports.filter((report) => !isLegacyPlaceholder(report));
  const activeWorkers = workers.filter((worker) => worker.status === 'work');
  const zoneCounts = workers.reduce((accumulator, worker) => {
    if (worker.zone_id) accumulator[worker.zone_id] = (accumulator[worker.zone_id] || 0) + 1;
    return accumulator;
  }, {});



  useEffect(() => {
    if (!authToken) {
      setCurrentUser(null);
      setAuthLoading(false);
      return;
    }

    let cancelled = false;
    setAuthLoading(true);
    setAuthError('');

    fetchCurrentUser(apiBase, authToken)
      .then((user) => {
        if (cancelled) return;
        setCurrentUser(user);
      })
      .catch(() => {
        if (cancelled) return;
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        setAuthToken('');
        setCurrentUser(null);
        setAuthError('\uc138\uc158\uc774 \ub9cc\ub8cc\ub418\uc5c8\uc2b5\ub2c8\ub2e4. \ub2e4\uc2dc \ub85c\uadf8\uc778\ud574 \uc8fc\uc138\uc694.');
      })
      .finally(() => {
        if (!cancelled) setAuthLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [apiBase, authToken]);

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
    if (!speech.finalTranscript) return;

    const finalText = speech.finalTranscript.trim();
    speech.clearFinalTranscript();

    if (!finalText) {
      setAutoTranslateAfterSpeech(false);
      return;
    }

    setSourceText(finalText);

    if (autoTranslateAfterSpeech) {
      setAutoTranslateAfterSpeech(false);
      void handleTranslateWalkie(finalText, { autoSpeak: true });
    }
  }, [autoTranslateAfterSpeech, speech]);



  async function loadWeather() {
    try {
      const data = await fetchWeather(apiBase);
      setWeather(data);
    } catch (error) {
      setMessage(`날씨 정보를 불러오지 못했습니다: ${error.message}`);
    }
  }

  async function loadWorkers() { const data = await fetchWorkers(apiBase); setWorkers(Array.isArray(data) ? data : []); }
  async function loadAlerts() { const data = await fetchAlerts(apiBase); setAlerts(Array.isArray(data) ? data : []); }
  async function loadSensors() { const data = await fetchLatestSensors(apiBase); setSensors(data || { temperature: null, humidity: null, dust: null, gas: null }); }
  async function loadReports() { const data = await fetchTodayReports(apiBase); setReports(Array.isArray(data) ? data : []); }
  async function loadTodaySummary() { const data = await fetchTodaySummary(apiBase); setTodaySummary(data || null); }
  async function loadPhotos() {
    const data = await fetchPhotos(apiBase, photoZone);
    setPhotos(Array.isArray(data) ? data : []);
  }


  async function loadDashboard() { await Promise.all([loadWeather(), loadWorkers(), loadAlerts(), loadSensors()]); }

  useEffect(() => {
    if (!currentUser) return;

    const run = async () => {
      try {
        if (activePage === 'dashboard') {
          await loadDashboard();
          setMessage('대시보드 데이터가 최신 상태입니다.');
        }
        if (activePage === 'workers') await loadWorkers();
        if (activePage === 'zones') await loadWorkers();
        if (activePage === 'progress') setMessage('공정 진행률을 확인하세요.');
        if (activePage === 'alerts') await loadAlerts();
        if (activePage === 'report') {
          await loadReports();
          setMessage('실시간 번역 화면입니다.');
        }
        if (activePage === 'daily-log') await Promise.all([loadReports(), loadTodaySummary()]);
        if (activePage === 'photos') await loadPhotos();
        if (activePage === 'settings-alert') setMessage('\uc54c\ub9bc \uc124\uc815\uc744 \uc870\uc815\ud558\uc138\uc694.');
        if (activePage === 'settings-env') setMessage('\ud658\uacbd \uc124\uc815\uc744 \uc870\uc815\ud558\uc138\uc694.');
      } catch (error) {
        setMessage(`데이터를 불러오지 못했습니다: ${error.message}`);
      }
    };
    run();
  }, [activePage, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    loadWeather();
    const timerId = window.setInterval(loadWeather, WEATHER_REFRESH_MS);
    return () => window.clearInterval(timerId);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
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
        const data = await translateText(apiBase, {
            text: selectedPhoto.ai_result,
            source_language: 'en',
            target_language: 'ko',
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

  async function handleLogin(credentials) {
    try {
      setAuthLoading(true);
      setAuthError('');
      const response = await loginUser(apiBase, credentials);
      window.localStorage.setItem(AUTH_STORAGE_KEY, response.access_token);
      setAuthToken(response.access_token);
      setCurrentUser(response.user);
      setActivePage('dashboard');
      setMessage('\ub85c\uadf8\uc778\ub418\uc5c8\uc2b5\ub2c8\ub2e4.');
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLogout() {
    if (authToken) {
      try {
        await logoutUser(apiBase, authToken);
      } catch (_error) {
      }
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthToken('');
    setCurrentUser(null);
    setAuthError('');
    setActivePage('dashboard');
  }

  async function handleCreateWorker() {
    if (!newWorker.name.trim()) {
      setMessage('작업자 이름을 입력해 주세요.');
      return;
    }
    try {
      await createWorker(apiBase, {
        name: newWorker.name.trim(),
        role: newWorker.role.trim() || null,
        phone: newWorker.phone.trim() || null,
        zone_id: newWorker.zone_id ? Number(newWorker.zone_id) : null,
        status: 'work',
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
      await updateWorkerStatus(apiBase, workerId, status);
      await loadWorkers();
      setMessage('작업자 상태를 변경했습니다.');
    } catch (error) {
      setMessage(`작업자 상태 변경에 실패했습니다: ${error.message}`);
    }
  }

  async function handleDeleteWorker(workerId) {
    if (!window.confirm('이 작업자를 삭제하시겠습니까?')) return;
    try {
      await removeWorker(apiBase, workerId);
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
      await createAlert(apiBase, {
        level: newAlert.level,
        source: newAlert.source.trim() || '\ud604\uc7a5 \uc218\ub3d9 \uc785\ub825',
        message: newAlert.message.trim(),
        zone_id: newAlert.zone_id ? Number(newAlert.zone_id) : null,
      });
      setNewAlert({ level: 'high', source: '', message: '', zone_id: '' });
      setShowAlertForm(false);
      await loadAlerts();
      setMessage('안전 알림을 등록했습니다.');
    } catch (error) {
      setMessage(`안전 알림 등록에 실패했습니다: ${error.message}`);
    }
  }

  async function handleResolveAlert(alertId) {
    try {
      await resolveAlert(apiBase, alertId);
      await loadAlerts();
      setMessage('알림을 처리 완료했습니다.');
    } catch (error) {
      setMessage(`알림 처리에 실패했습니다: ${error.message}`);
    }
  }

  function speakTranslatedText(text) {
    const speakText = (text || '').trim();
    if (!speakText) {
      return;
    }
    if (!window.speechSynthesis) {
      setMessage('이 브라우저는 음성 재생을 지원하지 않습니다.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.lang = targetMeta.voice;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }

  async function handleTranslateWalkie(inputText = sourceText, options = {}) {
    const text = (inputText || '').trim();
    const autoSpeak = options.autoSpeak === true;
    if (!text) {
      setMessage('먼저 말하거나 텍스트를 입력해 주세요.');
      return;
    }
    if (sourceLanguage === targetLanguage) {
      setTranslatedText(text);
      setMessage('같은 언어로 선택되어 원문을 그대로 표시했습니다.');
      if (autoSpeak) {
        speakTranslatedText(text);
      }
      return;
    }
    try {
      setTranslating(true);
      const data = await translateText(apiBase, { text, source_language: sourceLanguage, target_language: targetLanguage });
      const nextTranslatedText = data.translated_text || '';
      setTranslatedText(nextTranslatedText);
      setMessage(autoSpeak ? `${targetMeta.label} 번역과 음성 재생이 완료되었습니다.` : `${targetMeta.label} 번역이 완료되었습니다.`);
      if (autoSpeak) {
        speakTranslatedText(nextTranslatedText);
      }
    } catch (error) {
      setMessage(`번역에 실패했습니다: ${error.message}`);
    } finally {
      setTranslating(false);
    }
  }

  function handlePressToTalkStart() {
    if (!speech.isSupported) {
      setMessage('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }
    setAutoTranslateAfterSpeech(true);
    setSourceText('');
    setTranslatedText('');
    setMessage('버튼을 누르고 있는 동안 음성을 인식합니다.');
    speech.start();
  }

  function handlePressToTalkEnd() {
    if (!speech.isListening) return;
    speech.stop();
  }

  function handleResetWalkie() {
    speech.stop();
    speech.reset();
    window.speechSynthesis?.cancel();
    setAutoTranslateAfterSpeech(false);
    setSourceText('');
    setTranslatedText('');
    setRecordSeconds(0);
    setMessage('실시간 번역 입력을 초기화했습니다.');
  }

  async function handleSaveWalkie() {
    const text = sourceText.trim();
    if (!text) {
      setMessage('저장할 원문이 없습니다.');
      return;
    }
    try {
      setSavingReport(true);
      await createReport(apiBase, {
        text_content: text,
        translated_text: translatedText.trim(),
        source_language: sourceLanguage,
        target_language: targetLanguage,
        author_name: currentUser?.name || '\uad6c\uc774\uc77c',
        entry_type: 'translation',
      });
      await loadReports();
      setMessage('전달 기록을 저장했습니다.');
    } catch (error) {
      setMessage(`전달 기록 저장에 실패했습니다: ${error.message}`);
    } finally {
      setSavingReport(false);
    }
  }

  async function handleCreateManualLog() {
    const text = manualLogText.trim();
    if (!text) {
      setMessage('수동 기록 내용을 입력해 주세요.');
      return;
    }
    try {
      setSavingManualLog(true);
      await createReport(apiBase, {
        text_content: text,
        translated_text: '',
        source_language: 'ko',
        target_language: 'ko',
        author_name: currentUser?.name || '구이일',
        entry_type: 'manual',
      });
      setManualLogText('');
      await loadReports();
      setMessage('수동 작업 기록을 저장했습니다.');
    } catch (error) {
      setMessage(`수동 작업 기록 저장에 실패했습니다: ${error.message}`);
    } finally {
      setSavingManualLog(false);
    }
  }
  async function handleDeleteReport(reportId) {
    if (!window.confirm('이 전달 기록을 삭제하시겠습니까?')) return;
    try {
      await removeReport(apiBase, reportId);
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
        await uploadPhoto(apiBase, file, photoZone);
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
      await removePhoto(apiBase, photoId);
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
        formatShiftDuration={formatShiftDuration}
        workerRoleOptions={WORKER_ROLE_OPTIONS}
      />
    );
  }

  function renderZonesPage() {
    return <ZonesPage ZONES={ZONES} zoneCounts={zoneCounts} />;
  }

  function renderProgressPage() {
    return <ProgressPage PROGRESS_ITEMS={PROGRESS_ITEMS} />;
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
        zones={ZONES}
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
        savingReport={savingReport}
        handleSaveWalkie={handleSaveWalkie}
        handleResetWalkie={handleResetWalkie}
        handlePressToTalkStart={handlePressToTalkStart}
        handlePressToTalkEnd={handlePressToTalkEnd}
        todayReports={visibleReports}
        handleDeleteReport={handleDeleteReport}
      />
    );
  }

  function renderDailyLogPage() {
    return (
      <DailyWorkLogPage
        todaySummary={todaySummary}
        todayReports={visibleReports}
        manualLogText={manualLogText}
        setManualLogText={setManualLogText}
        handleCreateManualLog={handleCreateManualLog}
        handleDeleteReport={handleDeleteReport}
        savingManualLog={savingManualLog}
      />
    );
  }

  function renderAlertSettingsPage() {
    return <AlertSettingsPage onSave={setMessage} />;
  }

  function renderEnvironmentSettingsPage() {
    return <EnvironmentSettingsPage languages={LANGUAGES} onSave={setMessage} />;
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
    if (activePage === 'sensors') return renderDashboardPage();
    if (activePage === 'alerts') return renderAlertsPage();
    if (activePage === 'report') return renderReportPage();
    if (activePage === 'photos') return renderPhotosPage();
    if (activePage === 'daily-log') return renderDailyLogPage();
    if (activePage === 'settings-alert') return renderAlertSettingsPage();
    if (activePage === 'settings-env') return renderEnvironmentSettingsPage();
    return <div className="page active"><div className="section-title">준비 중</div></div>;
  }

  if (!currentUser) {
    return <LoginPage loading={authLoading} error={authError} onLogin={handleLogin} />;
  }

  return (
    <div className="ipad-shell">
      <SiteTopbar wsConnected={wsConnected} clock={clock} dateText={dateText} currentUser={currentUser} onLogout={handleLogout} />
      <div className="main">
        <SidebarNav
          navSections={NAV_SECTIONS}
          activePage={activePage}
          alertsCount={alerts.length}
          theme={theme}
          setTheme={setTheme}
          setActivePage={setActivePage}
          currentUser={currentUser}
        />
        <div className="content">
          <div className="react-message-bar">{message}</div>
          {renderPage()}
        </div>
      </div>
    </div>
  );
}



























