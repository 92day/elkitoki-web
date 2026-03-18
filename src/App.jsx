import { useEffect, useMemo, useState } from 'react';
import useSpeechRecognition from './hooks/useSpeechRecognition';
import useThemePreference from './hooks/useThemePreference';
import useClockDisplay from './hooks/useClockDisplay';
import useSensorStream from './hooks/useSensorStream';
import './App.css';
import { AUTH_STORAGE_KEY, LANGUAGES, NAV_SECTIONS, PROGRESS_ITEMS, THEME_KEY, WEATHER_REFRESH_MS, WORKER_ROLE_OPTIONS, WORKER_STATUS_LABELS, ZONES } from './constants/dashboard';
import { formatTimer, getApiBase, getSpeechErrorMessage, getWeatherVisual, getZoneMeta, isLegacyPlaceholder } from './utils/dashboard';
import { ConfirmDialog, MyPageModal, SidebarNav, SiteTopbar } from './components/layout';
import { AlertsPage, DailyWorkLogPage, DashboardPage, LoginPage, PhotosPage, ProgressPage, ReportPage, WorkerCallPage, WorkersPage, ZonesPage } from './components/pages';
import { createAlert, createDeviceCommand, createReport, createWorker, fetchAlerts, fetchCurrentUser, fetchDailyLogEntries, fetchDailyLogSummary, fetchLatestSensors, fetchPhotos, fetchTodayReports, fetchWeather, fetchWorkers, generateDailyLogSummary, loginUser, logoutUser, removePhoto, removeReport, removeWorker, resolveAlert, translateText, updateWorkerStatus, uploadPhoto } from './services/dashboardApi';

const LARGE_TEXT_KEY = 'dashboard_large_text_enabled';

export default function App() {
  const apiBase = useMemo(() => getApiBase(), []);
  const wsBase = useMemo(() => apiBase.replace(/^http/, 'ws'), [apiBase]);

  const [activePage, setActivePage] = useState('dashboard');
  const [authToken, setAuthToken] = useState(() => window.localStorage.getItem(AUTH_STORAGE_KEY) || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(() => Boolean(window.localStorage.getItem(AUTH_STORAGE_KEY)));
  const [authError, setAuthError] = useState('');
  const [theme, setTheme] = useThemePreference(THEME_KEY);
  const [largeTextEnabled, setLargeTextEnabled] = useState(() => window.localStorage.getItem(LARGE_TEXT_KEY) === 'true');
  const { clock, dateText } = useClockDisplay();
  const [message, setMessage] = useState('대시보드를 불러오는 중입니다.');

  const [weather, setWeather] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [sensors, setSensors] = useState({ temperature: null, humidity: null, dust: null, gas: null, zoneNoiseById: {} });
  const [sensorLog, setSensorLog] = useState([]);
  const [reports, setReports] = useState([]);
  const [dailyLogEntries, setDailyLogEntries] = useState([]);
  const [todaySummary, setTodaySummary] = useState(null);
  const [manualLogText, setManualLogText] = useState('');
  const [savingManualLog, setSavingManualLog] = useState(false);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [callingWorker, setCallingWorker] = useState('');
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [photoAnalysisKo, setPhotoAnalysisKo] = useState({});
  const [photoAnalysisLoading, setPhotoAnalysisLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [confirmPending, setConfirmPending] = useState(false);
  const [showMyPage, setShowMyPage] = useState(false);
  const [loginTransition, setLoginTransition] = useState(null);

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
  const translationReports = visibleReports.filter((report) => report?.entry_type === 'translation');
  const workerCallLogs = visibleReports.filter((report) => {
    const text = report?.text_content || '';
    return text.startsWith('[작업자 호출]') || text.startsWith('[작업자 요청]');
  });
  const activeWorkers = workers.filter((worker) => worker.status === 'work');
  const sidebarNavSections = useMemo(
    () => NAV_SECTIONS
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => !['settings-alert', 'settings-env'].includes(item.key)),
      }))
      .filter((section) => section.items.length > 0),
    []
  );
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
    document.body.dataset.appView = currentUser ? 'dashboard' : 'login';
  }, [currentUser]);

  useEffect(() => {
    if (!loginTransition) return undefined;

    const timerId = window.setTimeout(() => {
      window.localStorage.setItem(AUTH_STORAGE_KEY, loginTransition.token);
      setAuthToken(loginTransition.token);
      setCurrentUser(loginTransition.user);
      setActivePage('dashboard');
      setMessage(`오늘도 안전하세요 ${loginTransition.name}님`);
      setLoginTransition(null);
      setAuthLoading(false);
    }, 1150);

    return () => window.clearTimeout(timerId);
  }, [loginTransition]);

  useEffect(() => {
    document.body.dataset.fontScale = largeTextEnabled ? 'large' : 'default';
    window.localStorage.setItem(LARGE_TEXT_KEY, String(largeTextEnabled));
  }, [largeTextEnabled]);

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
  async function loadSensors() { const data = await fetchLatestSensors(apiBase); setSensors(data || { temperature: null, humidity: null, dust: null, gas: null, zoneNoiseById: {} }); }
  async function loadReports() { const data = await fetchTodayReports(apiBase); setReports(Array.isArray(data) ? data : []); }
  async function loadDailyLogEntriesData() { const data = await fetchDailyLogEntries(apiBase); setDailyLogEntries(Array.isArray(data) ? data : []); }
  async function loadTodaySummary() { const data = await fetchDailyLogSummary(apiBase); setTodaySummary(data || null); }
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
        if (activePage === 'zones') await Promise.all([loadWorkers(), loadSensors()]);
        if (activePage === 'progress') setMessage('공정 진행 현황을 확인하세요.');
        if (activePage === 'alerts') await loadAlerts();
        if (activePage === 'report') {
          await loadReports();
          setMessage('실시간 번역 화면을 불러왔습니다.');
        }
        if (activePage === 'worker-call') {
          await loadReports();
          setMessage('작업자를 호출하고 호출 로그를 확인하세요.');
        }
        if (activePage === 'daily-log') await Promise.all([loadDailyLogEntriesData(), loadTodaySummary()]);
        if (activePage === 'photos') await loadPhotos();
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
      loadPhotos().catch((error) => setMessage('현장 사진을 불러오지 못했습니다: ' + error.message));
    }
  }, [photoZone]);
  useEffect(() => {
    if (!currentUser) return undefined;
    if (!['dashboard', 'zones'].includes(activePage)) return undefined;

    const timerId = window.setInterval(() => {
      loadSensors().catch(() => {});
    }, 800);

    return () => window.clearInterval(timerId);
  }, [activePage, currentUser]);


  useEffect(() => {
    if (!currentUser) return undefined;
    if (!['dashboard', 'alerts'].includes(activePage)) return undefined;

    const timerId = window.setInterval(() => {
      loadAlerts().catch(() => {});
    }, 1200);

    return () => window.clearInterval(timerId);
  }, [activePage, currentUser]);
  useEffect(() => {
    if (!currentUser) return undefined;
    if (!['worker-call', 'daily-log'].includes(activePage)) return undefined;

    const timerId = window.setInterval(() => {
      if (activePage === 'daily-log') {
        loadDailyLogEntriesData().catch(() => {});
      } else {
        loadReports().catch(() => {});
      }
    }, 800);

    return () => window.clearInterval(timerId);
  }, [activePage, currentUser]);

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
            [selectedPhoto.id]: data.translated_text || '?쒓뎅??踰덉뿭 寃곌낵媛 ?놁뒿?덈떎.',
          }));
        }
      } catch (error) {
        if (!cancelled) {
          setPhotoAnalysisKo((prev) => ({
            ...prev,
            [selectedPhoto.id]: `?쒓뎅??踰덉뿭??遺덈윭?ㅼ? 紐삵뻽?듬땲?? ${error.message}`,
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
      setLoginTransition({
        token: response.access_token,
        user: response.user,
        name: response.user?.name || credentials.username,
      });
    } catch (error) {
      setAuthError(error.message);
      setLoginTransition(null);
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
    setShowMyPage(false);
  }

  function openConfirmDialog(config) {
    setConfirmDialog(config);
  }

  function closeConfirmDialog() {
    if (confirmPending) return;
    setConfirmDialog(null);
  }

  async function handleConfirmDialog() {
    if (!confirmDialog?.onConfirm || confirmPending) return;

    setConfirmPending(true);
    try {
      await confirmDialog.onConfirm();
    } finally {
      setConfirmPending(false);
      setConfirmDialog(null);
    }
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
    openConfirmDialog({
      title: '작업자를 삭제할까요?',
      description: '삭제한 작업자는 현재 목록에서 바로 제거됩니다.',
      confirmLabel: '삭제',
      tone: 'danger',
      onConfirm: async () => {
        try {
          await removeWorker(apiBase, workerId);
          await loadWorkers();
          setMessage('작업자를 삭제했습니다.');
        } catch (error) {
          setMessage(`작업자 삭제에 실패했습니다: ${error.message}`);
        }
      },
    });
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
      setMessage('알림을 처리했습니다.');
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
      setMessage('같은 언어를 선택해 원문을 그대로 표시했습니다.');
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
      setMessage(autoSpeak ? `${targetMeta.label} 번역과 음성 재생을 완료했습니다.` : `${targetMeta.label} 번역을 완료했습니다.`);
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
        author_name: currentUser?.name || '구이일',
        entry_type: 'translation',
      });
      await loadReports();
      setMessage('번역 기록을 저장했습니다.');
    } catch (error) {
      setMessage(`번역 기록 저장에 실패했습니다: ${error.message}`);
    } finally {
      setSavingReport(false);
    }
  }

  async function handleGenerateSummary() {
    try {
      setGeneratingSummary(true);
      const summary = await generateDailyLogSummary(apiBase);
      setTodaySummary(summary || null);
      setMessage('오늘의 요약을 생성했습니다.');
    } catch (error) {
      setMessage(`오늘의 요약 생성에 실패했습니다: ${error.message}`);
    } finally {
      setGeneratingSummary(false);
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
      await Promise.all([loadReports(), loadDailyLogEntriesData()]);
      setMessage('수동 기록을 저장했습니다.');
    } catch (error) {
      setMessage(`수동 기록 저장에 실패했습니다: ${error.message}`);
    } finally {
      setSavingManualLog(false);
    }
  }

  async function handleCallWorker(workerLabel) {
    try {
      setCallingWorker(workerLabel);
      const workerKey = workerLabel.includes('B') ? 'B' : 'A';
      const [, createdReport] = await Promise.all([
        createDeviceCommand(apiBase, { device: 'uno-main', cmd: 'call_worker', worker: workerKey }),
        createReport(apiBase, {
          text_content: '[작업자 호출] ' + workerLabel + ' 호출',
          translated_text: '',
          source_language: 'ko',
          target_language: 'ko',
          author_name: currentUser?.name || '구이일',
          entry_type: 'manual',
        }),
      ]);
      if (createdReport?.id) {
        setReports((prev) => [createdReport, ...prev.filter((report) => report.id !== createdReport.id)]);
      }
      void loadReports().catch(() => {});
      setMessage(workerLabel + ' 호출 명령을 전송했습니다.');
    } catch (error) {
      setMessage('작업자 호출에 실패했습니다: ' + error.message);
    } finally {
      setCallingWorker('');
    }
  }
  async function handleDeleteReport(reportId) {
    openConfirmDialog({
      title: '이 기록을 삭제할까요?',
      description: '삭제하면 오늘의 로그 목록에서 즉시 사라집니다.',
      confirmLabel: '삭제',
      tone: 'danger',
      onConfirm: async () => {
        try {
          await removeReport(apiBase, reportId);
          await Promise.all([loadReports(), loadDailyLogEntriesData()]);
          setMessage('기록을 삭제했습니다.');
        } catch (error) {
          setMessage(`기록 삭제에 실패했습니다: ${error.message}`);
        }
      },
    });
  }

  function handleDeleteTranslationReports() {
    if (!translationReports.length) return;
    openConfirmDialog({
      title: '번역 로그를 모두 삭제할까요?',
      description: '실시간 번역 페이지의 번역 로그가 모두 삭제됩니다.',
      confirmLabel: '일괄삭제',
      tone: 'danger',
      onConfirm: async () => {
        try {
          await Promise.all(translationReports.map((report) => removeReport(apiBase, report.id)));
          await loadReports();
          setMessage('번역 로그를 모두 삭제했습니다.');
        } catch (error) {
          setMessage(`번역 로그 일괄삭제에 실패했습니다: ${error.message}`);
        }
      },
    });
  }

  function handleDeleteWorkerCallLogs() {
    if (!workerCallLogs.length) return;
    openConfirmDialog({
      title: '호출 로그를 모두 삭제할까요?',
      description: '작업자 호출과 작업자 요청 로그가 모두 삭제됩니다.',
      confirmLabel: '일괄삭제',
      tone: 'danger',
      onConfirm: async () => {
        try {
          await Promise.all(workerCallLogs.map((report) => removeReport(apiBase, report.id)));
          await loadReports();
          setMessage('호출 로그를 모두 삭제했습니다.');
        } catch (error) {
          setMessage(`호출 로그 일괄삭제에 실패했습니다: ${error.message}`);
        }
      },
    });
  }

  function handleDeleteDailyReports() {
    const deletableDailyLogs = dailyLogEntries.filter((report) => report.deletable !== false && (report.mysql_report_id || report.id));
    if (!deletableDailyLogs.length) {
      setMessage('삭제할 작업일지 기록이 없습니다.');
      return;
    }
    openConfirmDialog({
      title: '소통 로그를 모두 삭제할까요?',
      description: '작업일지의 번역, 수동 입력, 호출 기록이 모두 삭제됩니다. 안전 알림 이력은 유지됩니다.',
      confirmLabel: '일괄삭제',
      tone: 'danger',
      onConfirm: async () => {
        try {
          await Promise.all(deletableDailyLogs.map((report) => removeReport(apiBase, report.mysql_report_id || report.id)));
          await Promise.all([loadReports(), loadDailyLogEntriesData()]);
          setTodaySummary(null);
          setMessage('소통 로그를 모두 삭제했습니다.');
        } catch (error) {
          setMessage(`소통 로그 일괄삭제에 실패했습니다: ${error.message}`);
        }
      },
    });
  }

  function handleResolveAllAlerts() {
    if (!alerts.length) return;
    openConfirmDialog({
      title: '안전 알림을 모두 해결 처리할까요?',
      description: '현재 미처리 안전 알림이 모두 해결 상태로 변경됩니다.',
      confirmLabel: '전체 해결',
      tone: 'danger',
      onConfirm: async () => {
        try {
          await Promise.all(alerts.map((alert) => resolveAlert(apiBase, alert.id)));
          await loadAlerts();
          setMessage('안전 알림을 모두 해결 처리했습니다.');
        } catch (error) {
          setMessage(`안전 알림 전체 처리에 실패했습니다: ${error.message}`);
        }
      },
    });
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
    openConfirmDialog({
      title: '이 사진을 삭제할까요?',
      description: '삭제한 사진과 AI 분석 결과는 다시 복구할 수 없습니다.',
      confirmLabel: '삭제',
      tone: 'danger',
      onConfirm: async () => {
        try {
          await removePhoto(apiBase, photoId);
          await loadPhotos();
          setMessage('현장 사진을 삭제했습니다.');
        } catch (error) {
          setMessage(`현장 사진 삭제에 실패했습니다: ${error.message}`);
        }
      },
    });
  }

  const weatherVisual = getWeatherVisual(weather?.weather_code, weather?.is_day);
  const weatherTemp = typeof weather?.temperature_c === 'number' ? `${weather.temperature_c.toFixed(1)}°C` : '--°C';
  const weatherHumidity = typeof weather?.humidity_pct === 'number' ? `${Math.round(weather.humidity_pct)}%` : '--%';
  const weatherWind = typeof weather?.wind_speed_ms === 'number' ? `${weather.wind_speed_ms.toFixed(1)}m/s` : '--m/s';
  const weatherSunset = weather?.sunset_time || '--:--';
  const currentTemp = typeof sensors.temperature?.value === 'number' ? (sensors.temperature.value.toFixed(1) + '°C') : '--°C';
  const zoneNoiseById = sensors.zoneNoiseById || {};

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
        zoneNoiseById={zoneNoiseById}
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
        workerRoleOptions={WORKER_ROLE_OPTIONS}
      />
    );
  }

  function renderZonesPage() {
    return <ZonesPage ZONES={ZONES} zoneCounts={zoneCounts} zoneNoiseById={zoneNoiseById} />;
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
        handleResolveAllAlerts={handleResolveAllAlerts}
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
        todayReports={translationReports}
        handleDeleteReport={handleDeleteReport}
        handleDeleteTranslationReports={handleDeleteTranslationReports}
      />
    );
  }

  function renderWorkerCallPage() {
    return (
      <WorkerCallPage
        callLogs={workerCallLogs}
        callingWorker={callingWorker}
        handleCallWorker={handleCallWorker}
        handleDeleteReport={handleDeleteReport}
        handleDeleteWorkerCallLogs={handleDeleteWorkerCallLogs}
      />
    );
  }

  function renderDailyLogPage() {
    return (
      <DailyWorkLogPage
        todaySummary={todaySummary}
        todayReports={dailyLogEntries}
        manualLogText={manualLogText}
        setManualLogText={setManualLogText}
        handleCreateManualLog={handleCreateManualLog}
        handleDeleteReport={handleDeleteReport}
        handleDeleteDailyReports={handleDeleteDailyReports}
        savingManualLog={savingManualLog}
        handleGenerateSummary={handleGenerateSummary}
        generatingSummary={generatingSummary}
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
    if (activePage === 'sensors') return renderDashboardPage();
    if (activePage === 'alerts') return renderAlertsPage();
    if (activePage === 'report') return renderReportPage();
    if (activePage === 'worker-call') return renderWorkerCallPage();
    if (activePage === 'photos') return renderPhotosPage();
    if (activePage === 'daily-log') return renderDailyLogPage();
    return <div className="page active"><div className="section-title">준비 중</div></div>;
  }

  if (!currentUser) {
    return (
      <LoginPage
        loading={authLoading}
        error={authError}
        onLogin={handleLogin}
        transitionName={loginTransition?.name || ''}
      />
    );
  }

  return (
    <>
      <div className="ipad-shell">
        <SiteTopbar wsConnected={wsConnected} clock={clock} dateText={dateText} />
        <div className="main">
          <SidebarNav
            navSections={sidebarNavSections}
            activePage={activePage}
            alertsCount={alerts.length}
            setActivePage={setActivePage}
            currentUser={currentUser}
            onOpenMyPage={() => setShowMyPage(true)}
          />
          <div className="content">
            <div className="react-message-bar">{message}</div>
            {renderPage()}
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={Boolean(confirmDialog)}
        title={confirmDialog?.title || ''}
        description={confirmDialog?.description || ''}
        confirmLabel={confirmDialog?.confirmLabel || '확인'}
        tone={confirmDialog?.tone || 'danger'}
        pending={confirmPending}
        onConfirm={handleConfirmDialog}
        onClose={closeConfirmDialog}
      />
      <MyPageModal
        open={showMyPage}
        currentUser={currentUser}
        theme={theme}
        setTheme={setTheme}
        largeTextEnabled={largeTextEnabled}
        setLargeTextEnabled={setLargeTextEnabled}
        languages={LANGUAGES}
        onClose={() => setShowMyPage(false)}
        onLogout={handleLogout}
        onSaveMessage={setMessage}
      />
    </>
  );
}




















































