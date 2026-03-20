import { clearTodayDailyLogs, createDeviceCommand, createReport, generateDailyLogSummary, removeReport } from '../services/dashboardApi';

const WORKER_NAME_BY_KEY = {
  A: '이레드',
  B: '김그린',
};

export default function useCommunicationActions({
  apiBase,
  currentUserName,
  sourceText,
  translatedText,
  sourceLanguage,
  targetLanguage,
  manualLogText,
  dailyLogEntries,
  translationReports,
  workerCallLogs,
  loadReports,
  loadDailyLogEntriesData,
  openConfirmDialog,
  setMessage,
  setSavingReport,
  setGeneratingSummary,
  setSavingManualLog,
  setCallingWorker,
  setReports,
  setDailyLogEntries,
  setManualLogText,
  setTodaySummary,
}) {
  async function refreshReportViews() {
    await Promise.all([loadReports(), loadDailyLogEntriesData()]);
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
        author_name: currentUserName || '구이일',
        entry_type: 'translation',
      });
      await refreshReportViews();
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
      const createdReport = await createReport(apiBase, {
        text_content: text,
        translated_text: '',
        source_language: 'ko',
        target_language: 'ko',
        author_name: currentUserName || '구이일',
        entry_type: 'manual',
      });
      setDailyLogEntries((prev) => [
        {
          id: 'manual_logs:temp-' + (createdReport?.id || Date.now()),
          log_type: 'manual',
          entry_type: 'manual',
          text_content: createdReport?.text_content || text,
          author_name: createdReport?.author_name || currentUserName || '구이일',
          created_at: createdReport?.created_at || new Date().toISOString(),
          deletable: false,
        },
        ...prev,
      ]);
      setManualLogText('');
      await refreshReportViews();
      setMessage('수동 기록을 저장했습니다.');
    } catch (error) {
      setMessage(`수동 기록 저장에 실패했습니다: ${error.message}`);
    } finally {
      setSavingManualLog(false);
    }
  }

  function handleDeleteDailyReports() {
    if (!dailyLogEntries.length) {
      setMessage('삭제할 작업일지 기록이 없습니다.');
      return;
    }
    openConfirmDialog({
      title: '소통 로그를 모두 삭제할까요?',
      description: '작업일지의 번역, 수동 입력, 호출, 안전 알림 로그가 오늘 기준으로 모두 삭제됩니다.',
      confirmLabel: '일괄삭제',
      tone: 'danger',
      onConfirm: async () => {
        try {
          await clearTodayDailyLogs(apiBase);
          await refreshReportViews();
          setTodaySummary(null);
          setMessage('소통 로그를 모두 삭제했습니다.');
        } catch (error) {
          setMessage(`소통 로그 일괄삭제에 실패했습니다: ${error.message}`);
        }
      },
    });
  }

  async function handleCallWorker(workerKey) {
    const workerName = WORKER_NAME_BY_KEY[workerKey] || workerKey;
    try {
      setCallingWorker(workerKey);
      const [, createdReport] = await Promise.all([
        createDeviceCommand(apiBase, { device: 'uno-main', cmd: 'call_worker', worker: workerKey }),
        createReport(apiBase, {
          text_content: '[작업자 호출] ' + workerName + ' 호출',
          translated_text: '',
          source_language: 'ko',
          target_language: 'ko',
          author_name: currentUserName || '구이일',
          entry_type: 'manual',
        }),
      ]);
      if (createdReport?.id) {
        setReports((prev) => [createdReport, ...prev.filter((report) => report.id !== createdReport.id)]);
      }
      await refreshReportViews();
      setMessage(workerName + ' 호출 명령을 전송했습니다.');
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
          await refreshReportViews();
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
          await refreshReportViews();
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
          await refreshReportViews();
          setMessage('호출 로그를 모두 삭제했습니다.');
        } catch (error) {
          setMessage(`호출 로그 일괄삭제에 실패했습니다: ${error.message}`);
        }
      },
    });
  }

  return {
    refreshReportViews,
    handleSaveWalkie,
    handleGenerateSummary,
    handleCreateManualLog,
    handleDeleteDailyReports,
    handleCallWorker,
    handleDeleteReport,
    handleDeleteTranslationReports,
    handleDeleteWorkerCallLogs,
  };
}




