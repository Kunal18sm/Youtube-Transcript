// State management
let currentData = null;
let currentVideoId = null;
let ytPlayer = null;
let ytPlayerReady = false;

// Active Quiz State
let currentQuizData = null;
let quizUserAnswers = {};
let quizScore = { correct: 0, wrong: 0 };
let isGlobalHindi = false;

// Library & Folder State
let activeSectionFilter = 'All';
const DEFAULT_SECTIONS = ['All', 'General', 'History', 'Coding & Tech', 'Science', 'UPSC & Exams'];

// PWA Install Prompt Deferred Event
let deferredPrompt = null;

// DOM Elements: Navigation Pages
const navHomeBtn = document.getElementById('nav-home-btn');
const navQuizBtn = document.getElementById('nav-quiz-btn');
const navLibraryBtn = document.getElementById('nav-library-btn');
const activeQuizBadge = document.getElementById('active-quiz-badge');
const savedQuizBadge = document.getElementById('saved-quiz-badge');
const pwaInstallBtn = document.getElementById('pwa-install-btn');

const pageHome = document.getElementById('page-home');
const pageQuiz = document.getElementById('page-quiz');
const pageLibrary = document.getElementById('page-library');

// Home Page DOM Elements
const form = document.getElementById('transcript-form');
const urlInput = document.getElementById('video-url');
const clearBtn = document.getElementById('clear-btn');
const fetchBtn = document.getElementById('fetch-btn');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const errorMessage = document.getElementById('error-message');
const errorRetry = document.getElementById('error-retry');
const errorPasteBtn = document.getElementById('error-paste-btn');
const tabYtLink = document.getElementById('tab-yt-link');
const tabPasteText = document.getElementById('tab-paste-text');
const manualPasteBox = document.getElementById('manual-paste-box');
const manualTitleInput = document.getElementById('manual-title-input');
const manualTranscriptInput = document.getElementById('manual-transcript-input');
const cancelManualPasteBtn = document.getElementById('cancel-manual-paste-btn');
const submitManualPasteBtn = document.getElementById('submit-manual-paste-btn');
const resultSection = document.getElementById('result-section');

// Video Meta DOM
const metaThumb = document.getElementById('meta-thumb');
const metaAuthor = document.getElementById('meta-author');
const metaTitle = document.getElementById('meta-title');
const statDuration = document.getElementById('stat-duration');
const statWords = document.getElementById('stat-words');
const languageSelect = document.getElementById('language-select');
const jumpToQuizBtn = document.getElementById('jump-to-quiz-btn');

// Video Player DOM
const togglePlayerBtn = document.getElementById('toggle-player-btn');
const playerBtnLabel = document.getElementById('player-btn-label');
const playerContainer = document.getElementById('player-container');
const closePlayerBtn = document.getElementById('close-player-btn');

// Transcript DOM
const searchInput = document.getElementById('search-input');
const transcriptBody = document.getElementById('transcript-body');
const copyBtn = document.getElementById('copy-btn');
const exportDropdownBtn = document.getElementById('export-dropdown-btn');
const exportMenu = document.getElementById('export-menu');
const downloadTxt = document.getElementById('download-txt');
const downloadSrt = document.getElementById('download-srt');
const downloadJson = document.getElementById('download-json');

// Quiz Arena Page DOM Elements
const quizConfigCard = document.getElementById('quiz-config-card');
const quizPlayerCard = document.getElementById('quiz-player-card');
const quizCountSelect = document.getElementById('quiz-count-select');
const customCountInput = document.getElementById('custom-count-input');
const quizSectionSelect = document.getElementById('quiz-section-select');
const generateQuizBtn = document.getElementById('generate-quiz-btn');
const quizLoadingSpinner = document.getElementById('quiz-loading-spinner');
const quizLoadingMsg = document.getElementById('quiz-loading-msg');
const quizProgressPercent = document.getElementById('quiz-progress-percent');
const quizProgressBar = document.getElementById('quiz-progress-bar');
const quizLoadingStage = document.getElementById('quiz-loading-stage');
const quizCountdownText = document.getElementById('quiz-countdown-text');
const activeQuizTitle = document.getElementById('active-quiz-title');
const editActiveQuizTitleBtn = document.getElementById('edit-active-quiz-title-btn');
const activeQuizSectionBadge = document.getElementById('active-quiz-section-badge');
const customQuizTitleInput = document.getElementById('custom-quiz-title-input');
const editQuizModal = document.getElementById('edit-quiz-modal');
const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
const cancelEditModalBtn = document.getElementById('cancel-edit-modal-btn');
const saveEditModalBtn = document.getElementById('save-edit-modal-btn');
const modalQuizTitleInput = document.getElementById('modal-quiz-title-input');
const modalQuizSectionSelect = document.getElementById('modal-quiz-section-select');
const modalAddSectionBtn = document.getElementById('modal-add-section-btn');
const quizQProgress = document.getElementById('quiz-q-progress');
const quizScoreCorrect = document.getElementById('quiz-score-correct');
const quizScoreWrong = document.getElementById('quiz-score-wrong');
const quizQuestionsList = document.getElementById('quiz-questions-list');
const quizResultsCard = document.getElementById('quiz-results-card');
const quizFinalScoreText = document.getElementById('quiz-final-score-text');
const finishRetakeBtn = document.getElementById('finish-retake-btn');
const finishSaveBtn = document.getElementById('finish-save-btn');
const saveQuizBtn = document.getElementById('save-quiz-btn');
const downloadQuizJsonBtn = document.getElementById('download-quiz-json-btn');
const downloadQuizTextBtn = document.getElementById('download-quiz-text-btn');
const retakeQuizBtn = document.getElementById('retake-quiz-btn');
const toggleAllHindiBtn = document.getElementById('toggle-all-hindi-btn');
const globalLangLabel = document.getElementById('global-lang-label');
const shareQuizCodeBtn = document.getElementById('share-quiz-code-btn');
const emptyImportCodeBtn = document.getElementById('empty-import-code-btn');

// Quiz Arena View Mode DOM (1-by-1 Focus Mode vs All Questions)
const viewModeSingleBtn = document.getElementById('view-mode-single-btn');
const viewModeAllBtn = document.getElementById('view-mode-all-btn');
const quizJumpNavContainer = document.getElementById('quiz-jump-nav-container');
const quizJumpPills = document.getElementById('quiz-jump-pills');
const quizSingleNavContainer = document.getElementById('quiz-single-nav-container');
const quizPrevQBtn = document.getElementById('quiz-prev-q-btn');
const quizNextQBtn = document.getElementById('quiz-next-q-btn');
const quizSingleIndicator = document.getElementById('quiz-single-indicator');

let currentQuizViewMode = localStorage.getItem('quiz_view_mode') || 'single';
let currentQuestionIndex = 0;

// Export Code Modal DOM
const exportCodeModal = document.getElementById('export-code-modal');
const exportCodeTextarea = document.getElementById('export-code-textarea');
const exportCodeQuizTitle = document.getElementById('export-code-quiz-title');
const exportCodeBadge = document.getElementById('export-code-badge');
const closeExportCodeModalBtn = document.getElementById('close-export-code-modal-btn');
const closeExportCodeBtn = document.getElementById('close-export-code-btn');
const copyExportCodeBtn = document.getElementById('copy-export-code-btn');

// Import Code Modal DOM
const importCodeModal = document.getElementById('import-code-modal');
const importCodeTextarea = document.getElementById('import-code-textarea');
const importCodeSectionSelect = document.getElementById('import-code-section-select');
const importCodeAddSectionBtn = document.getElementById('import-code-add-section-btn');
const closeImportCodeModalBtn = document.getElementById('close-import-code-modal-btn');
const cancelImportCodeBtn = document.getElementById('cancel-import-code-btn');
const submitImportCodeBtn = document.getElementById('submit-import-code-btn');

// Library Page DOM Elements
const libraryQuizzesGrid = document.getElementById('library-quizzes-grid');
const librarySectionPills = document.getElementById('library-section-pills');
const createSectionBtn = document.getElementById('create-section-btn');
const importQuizFile = document.getElementById('import-quiz-file');
const importCodeModalBtn = document.getElementById('import-code-modal-btn');

// Live Server Status Dot DOM Elements
const serverStatusPill = document.getElementById('server-status-pill');
const serverStatusPing = document.getElementById('server-status-ping');
const serverStatusDot = document.getElementById('server-status-dot');

let isServerOnline = true;
let healthCheckInterval = null;

// Toast DOM
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  updateSavedQuizBadge();
  setupPWA();
  populateSectionDropdown();
  checkPreviousTranscript();
  setupNetworkListeners();
  startServerHealthMonitor();
});

// ----------------------------------------------------
// PWA INSTALLATION & SERVICE WORKER
// ----------------------------------------------------

function setupPWA() {
  // Register Service Worker with auto-update mechanism
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      // Force check for fresh worker on load
      reg.update().catch(() => {});

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              newWorker.postMessage({ action: 'skipWaiting' });
            }
          });
        }
      });
    }).catch(err => {
      console.log('SW registration note:', err);
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }

  // Listen for native install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (pwaInstallBtn) {
      pwaInstallBtn.classList.remove('hidden');
    }
  });

  if (pwaInstallBtn) {
    pwaInstallBtn.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          showToast('App installed successfully!', 'success');
          pwaInstallBtn.classList.add('hidden');
        }
        deferredPrompt = null;
      } else {
        showToast('App is ready! On Chrome/Edge click the Install icon in the address bar.', 'success');
      }
    });
  }
}

// ----------------------------------------------------
// OFFLINE & LOCAL STORAGE CACHING
// ----------------------------------------------------

function saveTranscriptToCache(data) {
  try {
    if (!data) return;
    localStorage.setItem('yt_last_transcript', JSON.stringify(data));

    let history = [];
    try {
      const raw = localStorage.getItem('yt_transcript_history');
      if (raw) history = JSON.parse(raw);
    } catch (e) {}

    const key = data.video_id || data.title;
    history = history.filter(item => (item.video_id || item.title) !== key);
    history.unshift({
      video_id: data.video_id,
      title: data.title,
      author: data.author,
      thumbnail: data.thumbnail,
      formatted_duration: data.formatted_duration,
      total_words: data.total_words,
      snippets_count: (data.snippets && data.snippets.length) || (data.transcript && data.transcript.length) || 0,
      saved_at: new Date().toISOString(),
      full_data: data
    });
    if (history.length > 20) history = history.slice(0, 20);
    localStorage.setItem('yt_transcript_history', JSON.stringify(history));
  } catch (e) {
    console.warn('Could not cache transcript:', e);
  }
}

function checkPreviousTranscript() {
  const restoreBanner = document.getElementById('restore-banner');
  const restoreTitle = document.getElementById('restore-title');
  const restoreMeta = document.getElementById('restore-meta');
  const restoreLoadBtn = document.getElementById('restore-load-btn');
  const restoreDismissBtn = document.getElementById('restore-dismiss-btn');

  if (!restoreBanner) return;

  try {
    const raw = localStorage.getItem('yt_last_transcript');
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (!saved || !saved.title) return;

    restoreTitle.textContent = saved.title;
    const count = (saved.snippets && saved.snippets.length) || (saved.transcript && saved.transcript.length) || 0;
    restoreMeta.textContent = `${count.toLocaleString()} captions • ${saved.formatted_duration || ''} • Saved locally (Ready Offline)`;
    restoreBanner.classList.remove('hidden');

    if (restoreLoadBtn) {
      restoreLoadBtn.onclick = () => {
        currentData = saved;
        currentVideoId = saved.video_id || null;
        displayVideoResults(saved);
        restoreBanner.classList.add('hidden');
        showToast('Restored previous transcript from local browser storage!', 'success');
      };
    }

    if (restoreDismissBtn) {
      restoreDismissBtn.onclick = () => {
        restoreBanner.classList.add('hidden');
      };
    }
  } catch (e) {
    console.warn('Error reading saved transcript:', e);
  }
}

function setupNetworkListeners() {
  window.addEventListener('offline', () => {
    showToast('Offline Mode: Saved transcripts & quizzes are available without internet.', 'info');
  });
  window.addEventListener('online', () => {
    showToast('Internet connected! You are back online.', 'success');
  });
}

// ----------------------------------------------------
// LIVE BACKEND SERVER STATUS & HEALTH MONITOR (ONLINE / OFFLINE)
// ----------------------------------------------------

async function checkServerHealth(manual = false) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch('/api/health?_t=' + Date.now(), {
      signal: controller.signal,
      cache: 'no-store'
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      isServerOnline = true;
      if (serverStatusPing) {
        serverStatusPing.className = 'animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75';
      }
      if (serverStatusDot) {
        serverStatusDot.className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 ring-2 ring-emerald-500/30';
      }
      if (serverStatusPill) {
        serverStatusPill.title = 'Server: Online (Live on port 8000)';
      }
      if (manual) {
        showToast('🟢 Server is Online and active!', 'success');
      }
      return true;
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    isServerOnline = false;
    if (serverStatusPing) {
      serverStatusPing.className = 'hidden';
    }
    if (serverStatusDot) {
      serverStatusDot.className = 'relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 ring-2 ring-rose-500/30 animate-pulse';
    }
    if (serverStatusPill) {
      serverStatusPill.title = 'Server: Offline (Click Desktop status file to start)';
    }
    if (manual) {
      showToast('🔴 Server is Offline! Click Desktop status file to start.', 'error');
    }
    return false;
  }
}

function startServerHealthMonitor() {
  // Check immediately on load
  checkServerHealth(false);

  // Poll every 3 seconds to auto-detect when server turns on or off
  if (healthCheckInterval) clearInterval(healthCheckInterval);
  healthCheckInterval = setInterval(() => checkServerHealth(false), 3000);

  // Manual click on status dot
  if (serverStatusPill) {
    serverStatusPill.addEventListener('click', () => {
      checkServerHealth(true);
    });
  }
}

function setupEventListeners() {
  // Desktop Navigation
  navHomeBtn.addEventListener('click', () => switchPage('home'));
  navQuizBtn.addEventListener('click', () => switchPage('quiz'));
  navLibraryBtn.addEventListener('click', () => switchPage('library'));

  // Mobile Bottom Bar Navigation
  document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mobile-nav-btn').forEach(b => {
        b.classList.remove('active', 'text-white', 'font-bold');
        b.classList.add('text-slate-400');
      });
      btn.classList.add('active', 'text-white', 'font-bold');
      btn.classList.remove('text-slate-400');
      switchPage(btn.dataset.target);
    });
  });

  if (jumpToQuizBtn) {
    jumpToQuizBtn.addEventListener('click', () => {
      if (currentQuizData) {
        switchPage('quiz');
      } else {
        const configCard = document.getElementById('quiz-config-card');
        if (configCard) {
          configCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  }

  // Input events
  urlInput.addEventListener('input', () => {
    clearBtn.classList.toggle('hidden', !urlInput.value);
  });

  clearBtn.addEventListener('click', () => {
    urlInput.value = '';
    clearBtn.classList.add('hidden');
    urlInput.focus();
  });

  document.querySelectorAll('.sample-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      urlInput.value = btn.dataset.url;
      clearBtn.classList.remove('hidden');
      fetchTranscript(urlInput.value);
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;

    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      showToast('Yeh website ka address hai! Yahan YouTube video ka link dalein (jaise https://www.youtube.com/watch?v=...)', 'error');
      urlInput.select();
      return;
    }

    if (!url.includes('youtube.com') && !url.includes('youtu.be') && url.length !== 11) {
      showToast('Please enter a valid YouTube video URL (e.g. https://www.youtube.com/watch?v=...)', 'error');
      urlInput.focus();
      return;
    }

    fetchTranscript(url);
  });

  errorRetry.addEventListener('click', () => {
    errorState.classList.add('hidden');
    urlInput.focus();
  });

  // Mode Tabs (YouTube Link vs Direct Text Paste)
  if (tabYtLink && tabPasteText) {
    tabYtLink.addEventListener('click', () => switchToInputMode('link'));
    tabPasteText.addEventListener('click', () => switchToInputMode('paste'));
  }
  if (cancelManualPasteBtn) {
    cancelManualPasteBtn.addEventListener('click', () => switchToInputMode('link'));
  }
  if (errorPasteBtn) {
    errorPasteBtn.addEventListener('click', () => {
      errorState.classList.add('hidden');
      switchToInputMode('paste');
    });
  }
  if (submitManualPasteBtn) {
    submitManualPasteBtn.addEventListener('click', handleManualPasteSubmit);
  }

  languageSelect.addEventListener('change', () => {
    if (currentVideoId) fetchTranscript(currentVideoId, languageSelect.value);
  });

  searchInput.addEventListener('input', renderTranscript);

  togglePlayerBtn.addEventListener('click', togglePlayer);
  closePlayerBtn.addEventListener('click', togglePlayer);

  copyBtn.addEventListener('click', copyTranscript);

  exportDropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    exportMenu.classList.toggle('hidden');
  });

  document.addEventListener('click', () => {
    exportMenu.classList.add('hidden');
  });

  downloadTxt.addEventListener('click', () => downloadFile('txt'));
  downloadSrt.addEventListener('click', () => downloadFile('srt'));
  downloadJson.addEventListener('click', () => downloadFile('json'));

  const dlHeaderBtn = document.getElementById('download-transcript-header-btn');
  if (dlHeaderBtn) {
    dlHeaderBtn.addEventListener('click', () => downloadFile('txt'));
  }

  // Custom question count toggle
  quizCountSelect.addEventListener('change', () => {
    if (quizCountSelect.value === 'custom') {
      customCountInput.classList.remove('hidden');
      customCountInput.focus();
    } else {
      customCountInput.classList.add('hidden');
    }
  });

  // Quiz Arena Buttons
  generateQuizBtn.addEventListener('click', handleGenerateQuiz);
  retakeQuizBtn.addEventListener('click', resetCurrentQuiz);
  finishRetakeBtn.addEventListener('click', resetCurrentQuiz);
  saveQuizBtn.addEventListener('click', saveCurrentQuizLocally);
  finishSaveBtn.addEventListener('click', saveCurrentQuizLocally);
  downloadQuizJsonBtn.addEventListener('click', downloadQuizAsJson);
  downloadQuizTextBtn.addEventListener('click', downloadQuizAsPrintableText);
  toggleAllHindiBtn.addEventListener('click', toggleAllQuestionsLanguage);
  if (shareQuizCodeBtn) {
    shareQuizCodeBtn.addEventListener('click', () => openQuizCodeModal(currentQuizData));
  }
  if (emptyImportCodeBtn) {
    emptyImportCodeBtn.addEventListener('click', openImportCodeModal);
  }

  // Quiz Arena View Mode Controls (1-by-1 Focus Mode vs All Questions)
  if (viewModeSingleBtn) {
    viewModeSingleBtn.addEventListener('click', () => setQuizViewMode('single'));
  }
  if (viewModeAllBtn) {
    viewModeAllBtn.addEventListener('click', () => setQuizViewMode('all'));
  }
  if (quizPrevQBtn) {
    quizPrevQBtn.addEventListener('click', () => {
      if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        updateQuizViewDisplay();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
  if (quizNextQBtn) {
    quizNextQBtn.addEventListener('click', () => {
      if (currentQuizData && currentQuestionIndex < currentQuizData.questions.length - 1) {
        currentQuestionIndex++;
        updateQuizViewDisplay();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // Keyboard navigation for 1-by-1 Focus Mode (Left / Right Arrow Keys)
  document.addEventListener('keydown', (e) => {
    if (activePage !== 'quiz' || currentQuizViewMode !== 'single' || !currentQuizData) return;
    const tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
      currentQuestionIndex--;
      updateQuizViewDisplay();
    } else if (e.key === 'ArrowRight' && currentQuestionIndex < currentQuizData.questions.length - 1) {
      currentQuestionIndex++;
      updateQuizViewDisplay();
    }
  });

  // Global listener to close 3-dot kebab dropdown menus when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown-container')) {
      document.querySelectorAll('.card-menu-dropdown').forEach(d => d.classList.add('hidden'));
    }
  });

  // Library Page: Add New Folder & File / Code Import
  createSectionBtn.addEventListener('click', handleCreateNewSection);
  importQuizFile.addEventListener('change', handleImportQuizFile);
  if (importCodeModalBtn) {
    importCodeModalBtn.addEventListener('click', openImportCodeModal);
  }

  // Portable Quiz Code Modals Listeners
  if (closeExportCodeModalBtn) closeExportCodeModalBtn.addEventListener('click', closeQuizCodeModal);
  if (closeExportCodeBtn) closeExportCodeBtn.addEventListener('click', closeQuizCodeModal);
  if (copyExportCodeBtn) copyExportCodeBtn.addEventListener('click', copyExportCodeText);
  if (exportCodeModal) {
    exportCodeModal.addEventListener('click', (e) => {
      if (e.target === exportCodeModal) closeQuizCodeModal();
    });
  }

  if (closeImportCodeModalBtn) closeImportCodeModalBtn.addEventListener('click', closeImportCodeModal);
  if (cancelImportCodeBtn) cancelImportCodeBtn.addEventListener('click', closeImportCodeModal);
  if (submitImportCodeBtn) submitImportCodeBtn.addEventListener('click', handleExecuteImportCode);
  if (importCodeAddSectionBtn) importCodeAddSectionBtn.addEventListener('click', handleAddSectionFromImportModal);
  if (importCodeModal) {
    importCodeModal.addEventListener('click', (e) => {
      if (e.target === importCodeModal) closeImportCodeModal();
    });
  }

  // Quiz Title Rename & Customization Modal Listeners
  if (editActiveQuizTitleBtn) {
    editActiveQuizTitleBtn.addEventListener('click', () => openEditQuizModal({ type: 'active' }));
  }
  if (activeQuizTitle) {
    activeQuizTitle.addEventListener('click', () => openEditQuizModal({ type: 'active' }));
  }
  if (closeEditModalBtn) {
    closeEditModalBtn.addEventListener('click', closeEditQuizModal);
  }
  if (cancelEditModalBtn) {
    cancelEditModalBtn.addEventListener('click', closeEditQuizModal);
  }
  if (saveEditModalBtn) {
    saveEditModalBtn.addEventListener('click', saveQuizCustomizationFromModal);
  }
  if (modalAddSectionBtn) {
    modalAddSectionBtn.addEventListener('click', handleAddSectionFromModal);
  }
  if (modalQuizTitleInput) {
    modalQuizTitleInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveQuizCustomizationFromModal();
      if (e.key === 'Escape') closeEditQuizModal();
    });
  }
  if (editQuizModal) {
    editQuizModal.addEventListener('click', (e) => {
      if (e.target === editQuizModal) closeEditQuizModal();
    });
  }
}

function switchToInputMode(mode) {
  if (mode === 'link') {
    form?.classList.remove('hidden');
    manualPasteBox?.classList.add('hidden');
    tabYtLink?.classList.add('bg-surface-800', 'text-white', 'font-bold', 'border-surface-700', 'shadow-sm');
    tabYtLink?.classList.remove('text-slate-400');
    tabPasteText?.classList.remove('bg-surface-800', 'text-white', 'font-bold', 'border-surface-700', 'shadow-sm');
    tabPasteText?.classList.add('text-slate-400');
    urlInput?.focus();
  } else {
    form?.classList.add('hidden');
    manualPasteBox?.classList.remove('hidden');
    tabPasteText?.classList.add('bg-surface-800', 'text-white', 'font-bold', 'border-surface-700', 'shadow-sm');
    tabPasteText?.classList.remove('text-slate-400');
    tabYtLink?.classList.remove('bg-surface-800', 'text-white', 'font-bold', 'border-surface-700', 'shadow-sm');
    tabYtLink?.classList.add('text-slate-400');
    manualTranscriptInput?.focus();
  }
}

function formatTimestamp(seconds) {
  const s = Math.floor(seconds || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function handleManualPasteSubmit() {
  const text = manualTranscriptInput?.value.trim();
  if (!text) {
    showToast('Please paste transcript or lecture dialogue text!', 'error');
    manualTranscriptInput?.focus();
    return;
  }

  const title = manualTitleInput?.value.trim() || 'Custom Lecture Notes';
  const words = text.split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  const rawLines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let parsedItems = [];
  let currentTime = 0;

  for (let line of rawLines) {
    const tsMatch = line.match(/^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*(.*)$/);
    if (tsMatch) {
      const timeStr = tsMatch[1];
      const content = tsMatch[2].trim();
      const parts = timeStr.split(':').map(Number);
      let sec = 0;
      if (parts.length === 3) sec = parts[0] * 3600 + parts[1] * 60 + parts[2];
      else if (parts.length === 2) sec = parts[0] * 60 + parts[1];
      if (content) {
        parsedItems.push({
          start: sec,
          duration: 3,
          formatted_start: timeStr,
          text: content
        });
      }
    } else {
      parsedItems.push({
        start: currentTime,
        duration: 3,
        formatted_start: formatTimestamp(currentTime),
        text: line
      });
      currentTime += 3;
    }
  }

  if (parsedItems.length === 0) {
    parsedItems = [{
      start: 0,
      duration: 5,
      formatted_start: "00:00",
      text: text
    }];
  }

  const durationSec = parsedItems[parsedItems.length - 1].start + 5;

  currentVideoId = '';
  currentData = {
    video_id: '',
    title: title,
    author: 'Direct Input',
    author_url: '',
    thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&q=80',
    total_words: totalWords,
    duration_seconds: durationSec,
    formatted_duration: formatTimestamp(durationSec),
    transcript: parsedItems,
    timestamped_text: parsedItems.map(p => `[${p.formatted_start}] ${p.text}`).join('\n'),
    plain_text: parsedItems.map(p => p.text).join(' '),
    srt_content: '',
    available_languages: [{ language: 'English', language_code: 'en' }]
  };

  saveTranscriptToCache(customData);
  renderCurrentView();
  showToast('Transcript loaded! Ready for Quiz Arena.', 'success');
}

// ----------------------------------------------------
// MULTI-PAGE ROUTER (Home, Quiz Arena, Library)
// ----------------------------------------------------

function switchPage(pageKey) {
  pageHome.classList.add('hidden');
  pageQuiz.classList.add('hidden');
  pageLibrary.classList.add('hidden');

  [navHomeBtn, navQuizBtn, navLibraryBtn].forEach(btn => {
    btn.classList.remove('active', 'text-white', 'bg-surface-800', 'shadow-md');
    btn.classList.add('text-slate-400');
  });

  if (pageKey === 'home') {
    pageHome.classList.remove('hidden');
    navHomeBtn.classList.add('active', 'text-white', 'bg-surface-800', 'shadow-md');
    navHomeBtn.classList.remove('text-slate-400');
  } else if (pageKey === 'quiz') {
    pageQuiz.classList.remove('hidden');
    navQuizBtn.classList.add('active', 'text-white', 'bg-surface-800', 'shadow-md');
    navQuizBtn.classList.remove('text-slate-400');

    const emptyCard = document.getElementById('quiz-empty-card');
    if (currentQuizData) {
      if (emptyCard) emptyCard.classList.add('hidden');
      quizPlayerCard.classList.remove('hidden');
    } else {
      if (emptyCard) emptyCard.classList.remove('hidden');
      quizPlayerCard.classList.add('hidden');
    }
  } else if (pageKey === 'library') {
    pageLibrary.classList.remove('hidden');
    navLibraryBtn.classList.add('active', 'text-white', 'bg-surface-800', 'shadow-md');
    navLibraryBtn.classList.remove('text-slate-400');
    renderLibrarySections();
    renderLibraryQuizzesGrid();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ----------------------------------------------------
// FETCH TRANSCRIPT
// ----------------------------------------------------

async function fetchTranscript(urlOrId, selectedLang = null) {
  setLoading(true);
  errorState.classList.add('hidden');
  const startTime = Date.now();

  try {
    let apiUrl = `/api/transcript?url=${encodeURIComponent(urlOrId)}`;
    if (selectedLang) apiUrl += `&lang=${encodeURIComponent(selectedLang)}`;

    const res = await fetch(apiUrl);
    const data = await res.json();

    const elapsed = Date.now() - startTime;
    if (elapsed < 500) {
      await new Promise(r => setTimeout(r, 500 - elapsed));
    }

    if (!res.ok) throw new Error(data.detail || 'Failed to fetch transcript.');

    currentData = data;
    currentVideoId = data.video_id;

    saveTranscriptToCache(data);
    displayVideoResults(data);
    showToast('Transcript loaded successfully!', 'success');
  } catch (err) {
    const elapsed = Date.now() - startTime;
    if (elapsed < 500) {
      await new Promise(r => setTimeout(r, 500 - elapsed));
    }
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

function setLoading(isLoading) {
  const restoreBanner = document.getElementById('restore-banner');
  if (isLoading) {
    loadingState.classList.remove('hidden');
    resultSection.classList.add('hidden');
    errorState.classList.add('hidden');
    if (restoreBanner) restoreBanner.classList.add('hidden');
    fetchBtn.disabled = true;
    fetchBtn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Extracting...</span>`;
  } else {
    loadingState.classList.add('hidden');
    fetchBtn.disabled = false;
    fetchBtn.innerHTML = `<span>Extract</span> <i class="fa-solid fa-arrow-right text-xs ml-1"></i>`;
  }
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorState.classList.remove('hidden');
  resultSection.classList.add('hidden');
}

function displayVideoResults(data) {
  metaThumb.src = data.thumbnail;
  metaAuthor.textContent = data.author;
  metaTitle.textContent = data.title;
  statDuration.textContent = data.formatted_duration;
  statWords.textContent = Number(data.total_words).toLocaleString();

  languageSelect.innerHTML = '';
  if (data.available_languages && data.available_languages.length > 0) {
    data.available_languages.forEach(lang => {
      const opt = document.createElement('option');
      opt.value = lang.language_code;
      opt.textContent = `${lang.language}${lang.is_generated ? ' (Auto)' : ''}`;
      if (lang.language_code === data.language_code) opt.selected = true;
      languageSelect.appendChild(opt);
    });
  }

  if (!playerContainer.classList.contains('hidden')) {
    initOrUpdatePlayer(data.video_id);
  }

  const heroContainer = document.getElementById('home-hero-container');
  if (heroContainer) {
    heroContainer.classList.remove('my-auto', 'py-6', 'sm:py-16');
    heroContainer.classList.add('py-2', 'sm:py-4');
  }

  renderTranscript();
  resultSection.classList.remove('hidden');
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderTranscript() {
  if (!currentData) return;
  const query = searchInput.value.trim().toLowerCase();
  transcriptBody.innerHTML = '';

  currentData.snippets.forEach((snippet) => {
    const item = document.createElement('div');
    item.className = 'snippet-item flex items-start gap-2.5 p-2 rounded-xl hover:bg-surface-850 cursor-pointer transition-colors';

    item.addEventListener('click', () => {
      document.querySelectorAll('.snippet-item').forEach(el => el.classList.remove('active-playing'));
      item.classList.add('active-playing');
      seekToTime(snippet.start);
    });

    const highlightedText = highlightText(snippet.text, query);
    item.innerHTML = `
      <span class="shrink-0 font-mono text-[11px] text-red-400 bg-surface-950 px-2 py-0.5 rounded-lg border border-surface-800">${snippet.formatted_time}</span>
      <span class="flex-1 text-slate-300 text-xs sm:text-sm leading-relaxed">${highlightedText}</span>
    `;
    transcriptBody.appendChild(item);
  });
}

// ----------------------------------------------------
// AI QUIZ GENERATOR ENGINE & REAL-TIME PROGRESS TRACKER
// ----------------------------------------------------

let quizProgressInterval = null;

function startQuizProgressController(numQuestions) {
  if (quizProgressInterval) clearInterval(quizProgressInterval);

  // Dynamic estimate based on question volume
  let estTotalSec = 11;
  if (numQuestions <= 5) estTotalSec = 8;
  else if (numQuestions <= 15) estTotalSec = 12;
  else if (numQuestions <= 30) estTotalSec = 17;
  else estTotalSec = 26;

  const startTime = Date.now();
  let currentPercent = 6;

  if (quizProgressBar) quizProgressBar.style.width = '6%';
  if (quizProgressPercent) quizProgressPercent.textContent = '6%';
  if (quizCountdownText) quizCountdownText.textContent = `Est. ~${estTotalSec}s remaining`;

  const updateUI = () => {
    const elapsedSec = (Date.now() - startTime) / 1000;
    const remainingSec = Math.max(1, Math.round(estTotalSec - elapsedSec));

    const timeRatio = elapsedSec / estTotalSec;
    if (timeRatio < 1.0) {
      currentPercent = Math.min(94, Math.max(currentPercent, Math.round(timeRatio * 95)));
    } else {
      currentPercent = Math.min(97, currentPercent + 0.15);
    }

    if (quizProgressBar) quizProgressBar.style.width = `${currentPercent}%`;
    if (quizProgressPercent) quizProgressPercent.textContent = `${Math.floor(currentPercent)}%`;
    if (quizCountdownText) quizCountdownText.textContent = `Est. ~${remainingSec}s remaining`;

    if (quizLoadingMsg && quizLoadingStage) {
      if (currentPercent < 25) {
        quizLoadingMsg.textContent = 'Analyzing lecture transcript & timestamps...';
        quizLoadingStage.innerHTML = '<i class="fa-solid fa-file-lines text-slate-500 text-[10px]"></i> <span>Stage 1/4: Analyzing lecture</span>';
      } else if (currentPercent < 55) {
        quizLoadingMsg.textContent = `Extracting key facts & formulating ${numQuestions} MCQs...`;
        quizLoadingStage.innerHTML = '<i class="fa-solid fa-brain text-indigo-400 text-[10px]"></i> <span>Stage 2/4: Formulating MCQs</span>';
      } else if (currentPercent < 85) {
        quizLoadingMsg.textContent = 'Dual-pass AI fact-checking & auditing answer keys...';
        quizLoadingStage.innerHTML = '<i class="fa-solid fa-shield-halved text-emerald-400 text-[10px]"></i> <span>Stage 3/4: Dual-Pass Fact-Checking</span>';
      } else {
        quizLoadingMsg.textContent = 'Finalizing verified questions & explanation proofs...';
        quizLoadingStage.innerHTML = '<i class="fa-solid fa-check-double text-rose-400 text-[10px]"></i> <span>Stage 4/4: Final verification</span>';
      }
    }
  };

  updateUI();
  quizProgressInterval = setInterval(updateUI, 120);

  return {
    finish: () => {
      if (quizProgressInterval) clearInterval(quizProgressInterval);
      if (quizProgressBar) quizProgressBar.style.width = '100%';
      if (quizProgressPercent) quizProgressPercent.textContent = '100%';
      if (quizLoadingMsg) quizLoadingMsg.textContent = '✅ 100% Fact-Checked! Launching Quiz Arena...';
      if (quizCountdownText) quizCountdownText.textContent = 'Ready!';
    },
    stop: () => {
      if (quizProgressInterval) clearInterval(quizProgressInterval);
    }
  };
}

async function handleGenerateQuiz() {
  if (!currentData) {
    showToast('Please load a video transcript first on the Home page!', 'error');
    switchPage('home');
    return;
  }

  let numQuestions = 25;
  if (quizCountSelect.value === 'custom') {
    numQuestions = parseInt(customCountInput.value, 10) || 25;
  } else {
    numQuestions = parseInt(quizCountSelect.value, 10) || 25;
  }

  numQuestions = Math.max(3, Math.min(500, numQuestions));
  const chosenSection = quizSectionSelect.value || 'General';

  generateQuizBtn.disabled = true;
  generateQuizBtn.innerHTML = `<i class="fa-solid fa-spinner animate-spin mr-1.5"></i> <span>Generating Fact-Checked MCQs...</span>`;
  quizLoadingSpinner.classList.remove('hidden');

  const progressTracker = startQuizProgressController(numQuestions);

  try {
    const customTitle = customQuizTitleInput && customQuizTitleInput.value.trim() ? customQuizTitleInput.value.trim() : (currentData?.title || 'Video Quiz');

    const res = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        video_id: currentVideoId,
        transcript_text: currentData.timestamped_text,
        title: customTitle,
        num_questions: numQuestions,
        difficulty: 'all'
      })
    });

    const quizData = await res.json();
    if (!res.ok) throw new Error(quizData.detail || 'Quiz generation failed.');

    progressTracker.finish();
    await new Promise(r => setTimeout(r, 400));

    currentQuizData = quizData;
    currentQuizData.title = customTitle || quizData.title || 'Video Quiz';
    currentQuizData.section = chosenSection;
    activeQuizBadge.classList.remove('hidden');
    switchPage('quiz');
    resetCurrentQuiz();
    showToast(`Generated & Fact-Checked ${quizData.total_questions} pure concept MCQs!`, 'success');
  } catch (err) {
    progressTracker.stop();
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    progressTracker.stop();
    generateQuizBtn.disabled = false;
    generateQuizBtn.innerHTML = `<i class="fa-solid fa-shield-halved mr-1.5"></i> <span>Generate Fact-Checked Concept MCQs</span>`;
    quizLoadingSpinner.classList.add('hidden');
  }
}

function resetCurrentQuiz() {
  if (!currentQuizData) return;

  quizUserAnswers = {};
  quizScore = { correct: 0, wrong: 0 };
  currentQuestionIndex = 0;
  isGlobalHindi = false;
  globalLangLabel.textContent = 'All in Hindi';
  quizResultsCard.classList.add('hidden');

  activeQuizTitle.textContent = currentQuizData.title || 'Video Quiz';
  if (activeQuizSectionBadge) {
    activeQuizSectionBadge.textContent = currentQuizData.section || 'General';
  }

  updateQuizScoreUI();
  renderQuizPlayer();

  const emptyCard = document.getElementById('quiz-empty-card');
  if (emptyCard) emptyCard.classList.add('hidden');
  quizPlayerCard.classList.remove('hidden');
}

function renderQuizPlayer() {
  quizQuestionsList.innerHTML = '';

  currentQuizData.questions.forEach((q, idx) => {
    const qCard = document.createElement('div');
    const qid = q.id || idx + 1;
    qCard.id = `q-card-${qid}`;
    qCard.className = 'bg-surface-950 border border-surface-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-3.5';

    const timestampSec = parseTimestampToSeconds(q.timestamp || '00:00');
    const isHindi = q.isHindi || false;
    const qText = isHindi && q.hindi ? q.hindi.question : q.question;
    const qOptions = isHindi && q.hindi ? q.hindi.options : q.options;
    const qExplanation = isHindi && q.hindi ? q.hindi.explanation : q.explanation;

    qCard.innerHTML = `
      <div class="flex items-center justify-between text-xs pb-1 border-b border-surface-850">
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-lg bg-surface-850 font-mono font-bold text-slate-300 flex items-center justify-center text-xs shadow-inner">
            ${idx + 1}
          </span>
          <span class="text-[11px] text-slate-400 font-medium">${q.difficulty || 'Concept'}</span>
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
            <i class="fa-solid fa-circle-check text-[10px]"></i>
            <span>Fact-Checked</span>
          </span>
        </div>

        <div class="flex items-center gap-1.5 sm:gap-2">
          <!-- 1-Click Hindi / English Translate Button -->
          <button 
            class="translate-q-btn flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-surface-900 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-all cursor-pointer"
            data-qid="${qid}"
            title="Translate question between English and Hindi"
          >
            <i class="fa-solid fa-language text-xs"></i>
            <span class="translate-q-label">${isHindi ? 'English' : 'हिंदी'}</span>
          </button>

          <!-- Timestamp Seek Button -->
          <button class="flex items-center gap-1 font-mono text-[11px] text-rose-400 bg-surface-900 hover:bg-rose-600 hover:text-white px-2 py-0.5 rounded-lg border border-surface-800 cursor-pointer transition-colors" onclick="seekToTime(${timestampSec})" title="Jump video to ${q.timestamp}">
            <i class="fa-solid fa-play text-[8px]"></i>
            <span>${q.timestamp || '00:00'}</span>
          </button>

          <!-- NEW: Delete Individual Question Button -->
          <button 
            class="delete-single-q-btn p-1.5 text-slate-500 hover:text-red-400 hover:bg-surface-850 rounded-lg cursor-pointer transition-colors"
            data-qid="${qid}"
            title="Delete this question from quiz"
          >
            <i class="fa-solid fa-trash-can text-xs"></i>
          </button>
        </div>
      </div>

      <!-- Question Title -->
      <h4 class="font-bold text-white text-xs sm:text-base leading-snug" id="q-text-${qid}">
        ${escapeHtml(qText)}
      </h4>

      <!-- 4 Options Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3" id="options-group-${qid}">
        ${qOptions.map((opt) => {
          const letter = opt.trim().charAt(0).toUpperCase();
          const cleanOptText = opt.replace(/^[A-D]\)\s*/, '');
          return `
            <button 
              class="quiz-option-btn text-left p-3 rounded-2xl bg-surface-900 hover:bg-surface-800 border border-surface-800 text-xs sm:text-sm text-slate-200 transition-all cursor-pointer flex items-start gap-2.5 group"
              data-qid="${qid}"
              data-letter="${letter}"
            >
              <span class="shrink-0 w-5 h-5 rounded-md bg-surface-950 text-slate-300 font-mono font-bold text-xs flex items-center justify-center group-hover:bg-amber-500 group-hover:text-black transition-colors">
                ${letter}
              </span>
              <span class="flex-1 mt-0.5">${escapeHtml(cleanOptText)}</span>
              <i class="option-icon hidden text-sm mt-0.5 shrink-0"></i>
            </button>
          `;
        }).join('')}
      </div>

      <!-- Explanation Box -->
      <div id="explanation-${qid}" class="hidden p-3.5 rounded-2xl bg-surface-900 border border-surface-800 text-xs text-slate-300 animate-fadeIn space-y-2">
        <div class="flex items-center justify-between text-xs pb-1 border-b border-surface-850">
          <strong class="text-white flex items-center gap-1.5">
            <i class="fa-solid fa-lightbulb text-amber-400"></i> Explanation & Concept
          </strong>
          <span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
            <i class="fa-solid fa-shield-halved text-[9px]"></i> AI Fact-Checked
          </span>
        </div>
        <p class="text-slate-300 leading-relaxed text-xs" id="exp-text-${qid}">
          ${escapeHtml(qExplanation || 'Refer to the video timestamp for detailed concept.')}
        </p>
        ${q.verified_fact ? `
          <div class="mt-2 pt-2 border-t border-surface-850 flex items-start gap-2 text-[11px] text-emerald-300 bg-emerald-950/20 p-2 rounded-xl border border-emerald-900/30">
            <i class="fa-solid fa-check-double text-emerald-400 mt-0.5 shrink-0"></i>
            <div class="leading-relaxed">
              <strong class="text-emerald-200">Verified Evidence:</strong> ${escapeHtml(q.verified_fact)}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    quizQuestionsList.appendChild(qCard);
  });

  // Attach option clicks
  document.querySelectorAll('.quiz-option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      handleAnswerSelect(btn.dataset.qid, btn.dataset.letter);
    });
  });

  // Attach individual question translate clicks
  document.querySelectorAll('.translate-q-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const qid = btn.dataset.qid;
      toggleQuestionLanguage(qid);
    });
  });

  // Attach individual question delete clicks
  document.querySelectorAll('.delete-single-q-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const qid = btn.dataset.qid;
      handleDeleteSingleQuestion(qid);
    });
  });

  // Apply current View Mode (1-by-1 Focus Mode vs All Questions)
  updateQuizViewDisplay();
}

function setQuizViewMode(mode) {
  currentQuizViewMode = mode;
  localStorage.setItem('quiz_view_mode', mode);
  updateQuizViewDisplay();
}

function updateQuizViewDisplay() {
  if (!currentQuizData || !currentQuizData.questions || currentQuizData.questions.length === 0) {
    if (quizJumpNavContainer) quizJumpNavContainer.classList.add('hidden');
    if (quizSingleNavContainer) quizSingleNavContainer.classList.add('hidden');
    return;
  }

  const total = currentQuizData.questions.length;
  if (currentQuestionIndex >= total) {
    currentQuestionIndex = Math.max(0, total - 1);
  }

  // Update mode toggle buttons
  if (viewModeSingleBtn && viewModeAllBtn) {
    if (currentQuizViewMode === 'single') {
      viewModeSingleBtn.className = 'px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-white bg-rose-600 shadow-sm';
      viewModeAllBtn.className = 'px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-white hover:bg-surface-850';
    } else {
      viewModeAllBtn.className = 'px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-white bg-rose-600 shadow-sm';
      viewModeSingleBtn.className = 'px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-white hover:bg-surface-850';
    }
  }

  if (currentQuizViewMode === 'single') {
    // Show navigator containers
    if (quizJumpNavContainer) quizJumpNavContainer.classList.remove('hidden');
    if (quizSingleNavContainer) quizSingleNavContainer.classList.remove('hidden');

    // Show ONLY active question card
    currentQuizData.questions.forEach((q, idx) => {
      const qid = q.id || idx + 1;
      const card = document.getElementById(`q-card-${qid}`);
      if (card) {
        card.style.display = (idx === currentQuestionIndex) ? 'block' : 'none';
      }
    });

    // Render Jump Pills
    if (quizJumpPills) {
      quizJumpPills.innerHTML = '';
      currentQuizData.questions.forEach((q, idx) => {
        const qid = q.id || idx + 1;
        const pill = document.createElement('button');
        const isCurrent = (idx === currentQuestionIndex);
        const answeredLetter = quizUserAnswers[qid];
        const correctLetter = (q.correct_answer || '').trim().charAt(0).toUpperCase();

        let baseClasses = 'shrink-0 min-w-8 h-8 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ';
        if (isCurrent) {
          baseClasses += 'ring-2 ring-rose-500 bg-rose-600 text-white shadow-md shadow-rose-600/30 ';
        } else if (answeredLetter) {
          if (answeredLetter === correctLetter) {
            baseClasses += 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 ';
          } else {
            baseClasses += 'bg-rose-950/80 border border-rose-500/50 text-rose-400 ';
          }
        } else {
          baseClasses += 'bg-surface-850 text-slate-400 hover:text-slate-200 hover:bg-surface-800 border border-surface-750 ';
        }

        pill.className = baseClasses;
        pill.innerHTML = `<span>${idx + 1}</span>`;
        pill.title = `Jump to Question ${idx + 1}`;
        pill.addEventListener('click', () => {
          currentQuestionIndex = idx;
          updateQuizViewDisplay();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        quizJumpPills.appendChild(pill);
      });
    }

    // Update bottom pagination indicator and buttons
    if (quizSingleIndicator) {
      quizSingleIndicator.textContent = `Question ${currentQuestionIndex + 1} of ${total}`;
    }
    if (quizPrevQBtn) {
      quizPrevQBtn.disabled = (currentQuestionIndex === 0);
    }
    if (quizNextQBtn) {
      quizNextQBtn.disabled = (currentQuestionIndex >= total - 1);
    }

  } else {
    // All Questions Mode: Show all cards in scrollable view
    if (quizJumpNavContainer) quizJumpNavContainer.classList.add('hidden');
    if (quizSingleNavContainer) quizSingleNavContainer.classList.add('hidden');

    currentQuizData.questions.forEach((q, idx) => {
      const qid = q.id || idx + 1;
      const card = document.getElementById(`q-card-${qid}`);
      if (card) {
        card.style.display = 'block';
      }
    });
  }
}

function handleAnswerSelect(questionId, selectedLetter) {
  if (quizUserAnswers[questionId]) return;

  const question = currentQuizData.questions.find((q, idx) => (q.id || idx + 1) == questionId);
  if (!question) return;

  const correctLetter = (question.correct_answer || '').trim().charAt(0).toUpperCase();
  quizUserAnswers[questionId] = selectedLetter;

  const container = document.getElementById(`options-group-${questionId}`);
  const btns = container.querySelectorAll('.quiz-option-btn');
  const isCorrect = selectedLetter === correctLetter;

  if (isCorrect) {
    quizScore.correct++;
  } else {
    quizScore.wrong++;
  }

  btns.forEach(btn => {
    btn.disabled = true;
    btn.classList.remove('hover:bg-surface-800', 'cursor-pointer');
    const bLetter = btn.dataset.letter;
    const icon = btn.querySelector('.option-icon');

    if (bLetter === correctLetter) {
      btn.classList.add('bg-emerald-950/70', 'border-emerald-500', 'text-emerald-300');
      if (icon) {
        icon.className = 'option-icon fa-solid fa-circle-check text-emerald-400';
        icon.classList.remove('hidden');
      }
    } else if (bLetter === selectedLetter && !isCorrect) {
      btn.classList.add('bg-rose-950/70', 'border-rose-500', 'text-rose-300');
      if (icon) {
        icon.className = 'option-icon fa-solid fa-circle-xmark text-rose-400';
        icon.classList.remove('hidden');
      }
    } else {
      btn.classList.add('opacity-40');
    }
  });

  const expBox = document.getElementById(`explanation-${questionId}`);
  if (expBox) expBox.classList.remove('hidden');

  updateQuizScoreUI();
  updateQuizViewDisplay();

  if (Object.keys(quizUserAnswers).length === currentQuizData.questions.length) {
    showQuizResults();
  }
}

function updateQuizScoreUI() {
  const total = currentQuizData ? currentQuizData.questions.length : 0;
  const answered = Object.keys(quizUserAnswers).length;

  quizQProgress.textContent = `${answered} of ${total} Answered`;
  quizScoreCorrect.textContent = quizScore.correct;
  quizScoreWrong.textContent = quizScore.wrong;
}

function showQuizResults() {
  const total = currentQuizData.questions.length;
  const percent = Math.round((quizScore.correct / total) * 100);

  quizFinalScoreText.innerHTML = `You scored <strong class="text-white text-lg font-bold">${quizScore.correct} out of ${total}</strong> (${percent}%)`;
  quizResultsCard.classList.remove('hidden');
  quizResultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  showToast(`Quiz completed: ${percent}%!`, 'success');
}

// ----------------------------------------------------
// DELETE INDIVIDUAL QUESTION FROM QUIZ
// ----------------------------------------------------

function handleDeleteSingleQuestion(questionId) {
  if (!currentQuizData || !currentQuizData.questions) return;

  const targetIndex = currentQuizData.questions.findIndex((q, idx) => (q.id || idx + 1) == questionId);
  if (targetIndex === -1) return;

  if (!confirm(`Delete question #${targetIndex + 1} from this quiz?`)) return;

  // Remove question
  currentQuizData.questions.splice(targetIndex, 1);
  delete quizUserAnswers[questionId];

  // Re-index remaining questions
  currentQuizData.questions.forEach((q, idx) => {
    q.id = idx + 1;
  });
  currentQuizData.total_questions = currentQuizData.questions.length;
  if (currentQuestionIndex >= currentQuizData.questions.length) {
    currentQuestionIndex = Math.max(0, currentQuizData.questions.length - 1);
  }

  // If this quiz was already in saved library, auto update in localStorage
  if (currentQuizData.storageId) {
    const list = getSavedQuizzes();
    const item = list.find(s => s.id === currentQuizData.storageId);
    if (item) {
      item.questions = currentQuizData.questions;
      item.total_questions = currentQuizData.questions.length;
      localStorage.setItem('yt_saved_quizzes', JSON.stringify(list));
    }
  }

  showToast('Question deleted from quiz.', 'success');
  renderQuizPlayer();
  updateQuizScoreUI();
}

// ----------------------------------------------------
// FREE 1-CLICK HINDI TRANSLATION ENGINE
// ----------------------------------------------------

async function toggleQuestionLanguage(questionId) {
  const question = currentQuizData.questions.find((q, idx) => (q.id || idx + 1) == questionId);
  if (!question) return;

  const btn = document.querySelector(`.translate-q-btn[data-qid="${questionId}"]`);
  const label = btn ? btn.querySelector('.translate-q-label') : null;

  if (question.hindi) {
    question.isHindi = !question.isHindi;
    updateQuestionCardDOM(question);
    if (label) label.textContent = question.isHindi ? 'English' : 'Hindi';
    return;
  }

  if (btn) btn.disabled = true;
  if (label) label.innerHTML = '<i class="fa-solid fa-spinner animate-spin text-[10px] mr-1"></i> Translating...';

  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: question.question,
        options: question.options,
        explanation: question.explanation,
        target_lang: 'hi'
      })
    });

    const data = await res.json();
    if (data.question) {
      question.hindi = data;
      question.isHindi = true;
      updateQuestionCardDOM(question);
      if (label) label.textContent = 'English';
      showToast('Question translated to Hindi!', 'success');
    }
  } catch (err) {
    console.error('Translation failed:', err);
    showToast('Translation error', 'error');
    if (label) label.textContent = 'Hindi';
  } finally {
    if (btn) btn.disabled = false;
  }
}

function updateQuestionCardDOM(q) {
  const qid = q.id;
  const isHindi = q.isHindi;
  const qText = isHindi && q.hindi ? q.hindi.question : q.question;
  const qOptions = isHindi && q.hindi ? q.hindi.options : q.options;
  const qExplanation = isHindi && q.hindi ? q.hindi.explanation : q.explanation;

  const qTitleEl = document.getElementById(`q-text-${qid}`);
  if (qTitleEl) qTitleEl.textContent = qText;

  const expEl = document.getElementById(`exp-text-${qid}`);
  if (expEl) expEl.textContent = qExplanation;

  const group = document.getElementById(`options-group-${qid}`);
  if (group) {
    const btns = group.querySelectorAll('.quiz-option-btn');
    btns.forEach((btn, i) => {
      const opt = qOptions[i] || '';
      const cleanOpt = opt.replace(/^[A-D]\)\s*/, '');
      const span = btn.querySelector('span.flex-1');
      if (span) span.textContent = cleanOpt;
    });
  }
}

async function toggleAllQuestionsLanguage() {
  if (!currentQuizData || !currentQuizData.questions) return;

  isGlobalHindi = !isGlobalHindi;
  toggleAllHindiBtn.disabled = true;
  globalLangLabel.innerHTML = '<i class="fa-solid fa-spinner animate-spin text-xs mr-1"></i> Translating...';
  showToast(isGlobalHindi ? 'Translating quiz to Hindi...' : 'Switched to English', 'success');

  try {
    for (const q of currentQuizData.questions) {
      if (isGlobalHindi) {
        if (!q.hindi) {
          try {
            const res = await fetch('/api/translate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                question: q.question,
                options: q.options,
                explanation: q.explanation,
                target_lang: 'hi'
              })
            });
            const data = await res.json();
            if (data.question) q.hindi = data;
          } catch (e) {
            continue;
          }
        }
        q.isHindi = true;
      } else {
        q.isHindi = false;
      }
      updateQuestionCardDOM(q);

      const btn = document.querySelector(`.translate-q-btn[data-qid="${q.id}"]`);
      if (btn) {
        const label = btn.querySelector('.translate-q-label');
        if (label) label.textContent = q.isHindi ? 'English' : 'Hindi';
      }
    }
  } finally {
    toggleAllHindiBtn.disabled = false;
    globalLangLabel.textContent = isGlobalHindi ? 'View in English' : 'All in Hindi';
  }
}

// ----------------------------------------------------
// DEDICATED SAVED QUIZZES LIBRARY PAGE & FOLDERS
// ----------------------------------------------------

function getStoredSections() {
  try {
    const raw = localStorage.getItem('yt_quiz_sections');
    return raw ? JSON.parse(raw) : DEFAULT_SECTIONS;
  } catch (e) {
    return DEFAULT_SECTIONS;
  }
}

function saveStoredSections(sections) {
  localStorage.setItem('yt_quiz_sections', JSON.stringify(sections));
}

function populateSectionDropdown() {
  if (!quizSectionSelect) return;
  const sections = getStoredSections().filter(s => s !== 'All');
  quizSectionSelect.innerHTML = '';
  sections.forEach(sec => {
    const opt = document.createElement('option');
    opt.value = sec;
    opt.textContent = sec;
    quizSectionSelect.appendChild(opt);
  });
}

function handleCreateNewSection() {
  const name = prompt('Enter new Section / Folder name (e.g. "Biology", "World History", "UPSC Paper 1"):');
  if (!name || !name.trim()) return;

  const clean = name.trim();
  const sections = getStoredSections();
  if (!sections.includes(clean)) {
    sections.push(clean);
    saveStoredSections(sections);
    populateSectionDropdown();
    renderLibrarySections();
    showToast(`Created folder "${clean}"!`, 'success');
  }
}

function renderLibrarySections() {
  if (!librarySectionPills) return;
  const sections = getStoredSections();
  const allQuizzes = getSavedQuizzes();

  librarySectionPills.innerHTML = '';

  sections.forEach(sec => {
    const count = sec === 'All' ? allQuizzes.length : allQuizzes.filter(q => (q.section || 'General') === sec).length;
    const isActive = activeSectionFilter === sec;
    const canDelete = sec !== 'All' && sec !== 'General';

    const pill = document.createElement('div');
    pill.className = `px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 text-xs ${
      isActive
        ? 'bg-rose-600 text-white shadow-md'
        : 'bg-surface-850 hover:bg-surface-800 text-slate-300 hover:text-white border border-surface-700/80'
    }`;

    pill.innerHTML = `
      <span>${escapeHtml(sec)}</span>
      <span class="text-[10px] opacity-75 font-mono">(${count})</span>
      ${canDelete ? `
        <span class="delete-sec-btn ml-1 hover:text-red-400 p-0.5 rounded cursor-pointer" title="Delete folder ${escapeHtml(sec)}">
          <i class="fa-solid fa-xmark text-[10px]"></i>
        </span>
      ` : ''}
    `;

    pill.addEventListener('click', (e) => {
      if (e.target.closest('.delete-sec-btn')) return;
      activeSectionFilter = sec;
      renderLibrarySections();
      renderLibraryQuizzesGrid();
    });

    if (canDelete) {
      const delBtn = pill.querySelector('.delete-sec-btn');
      if (delBtn) {
        delBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          handleDeleteSection(sec);
        });
      }
    }

    librarySectionPills.appendChild(pill);
  });
}

function handleDeleteSection(sectionName) {
  if (!confirm(`Delete folder "${sectionName}"? Any saved quizzes in it will be moved to "General".`)) {
    return;
  }

  const quizzes = getSavedQuizzes();
  let updatedAny = false;
  quizzes.forEach(q => {
    if (q.section === sectionName) {
      q.section = 'General';
      updatedAny = true;
    }
  });
  if (updatedAny) {
    localStorage.setItem('yt_saved_quizzes', JSON.stringify(quizzes));
  }

  const sections = getStoredSections().filter(s => s !== sectionName);
  saveStoredSections(sections);

  if (activeSectionFilter === sectionName) {
    activeSectionFilter = 'All';
  }

  populateSectionDropdown();
  renderLibrarySections();
  renderLibraryQuizzesGrid();
  showToast(`Deleted folder "${sectionName}".`, 'success');
}

function renderLibraryQuizzesGrid() {
  const allQuizzes = getSavedQuizzes();
  let quizzes = allQuizzes;

  if (activeSectionFilter !== 'All') {
    quizzes = allQuizzes.filter(q => (q.section || 'General') === activeSectionFilter);
  }

  libraryQuizzesGrid.innerHTML = '';

  if (quizzes.length === 0) {
    libraryQuizzesGrid.innerHTML = `
      <div class="col-span-full text-center py-12 bg-surface-900 border border-surface-800 rounded-3xl p-6">
        <div class="w-12 h-12 rounded-2xl bg-surface-800 text-rose-400 flex items-center justify-center mx-auto mb-2 text-xl">
          <i class="fa-solid fa-folder-open"></i>
        </div>
        <h4 class="font-bold text-white text-sm">No quizzes in "${escapeHtml(activeSectionFilter)}" folder</h4>
        <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Extract a video, generate MCQs, and save them to this section.
        </p>
      </div>
    `;
    return;
  }

  quizzes.forEach((quiz) => {
    const card = document.createElement('div');
    card.className = 'p-5 rounded-3xl bg-surface-900 border border-surface-800 hover:border-surface-700 transition-all shadow-xl flex flex-col justify-between gap-4 relative';

    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between text-xs text-slate-400 mb-2.5">
          <div class="flex items-center gap-1.5">
            <span class="text-slate-300 font-semibold bg-surface-800 border border-surface-700 px-2.5 py-0.5 rounded-full text-[10px]">
              ${quiz.total_questions} Concept MCQs
            </span>
          </div>
          <span class="text-[11px] text-slate-500">${quiz.savedAt}</span>
        </div>

        <div class="flex items-start justify-between gap-2">
          <h4 class="font-bold text-white text-sm sm:text-base line-clamp-2 leading-snug flex-1" id="lib-title-${quiz.id}">
            ${escapeHtml(quiz.title)}
          </h4>
        </div>

        ${quiz.score ? `
          <div class="mt-2.5 inline-flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-xl font-bold text-[11px]">
            <i class="fa-solid fa-trophy text-[9px]"></i> Last Score: ${quiz.score}
          </div>
        ` : ''}
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-surface-800 gap-2">
        <button class="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 play-saved-btn" data-id="${quiz.id}">
          <i class="fa-solid fa-play text-[10px]"></i>
          <span>Start Practice Arena</span>
        </button>

        <!-- 3-Dot Kebab Menu Container -->
        <div class="relative dropdown-container">
          <button class="w-9 h-9 rounded-xl bg-surface-800 hover:bg-surface-750 text-slate-300 hover:text-white border border-surface-700 flex items-center justify-center transition-all cursor-pointer card-menu-btn" data-id="${quiz.id}" title="Quiz Options">
            <i class="fa-solid fa-ellipsis-vertical text-sm"></i>
          </button>

          <!-- Floating Dropdown Menu -->
          <div id="card-menu-dropdown-${quiz.id}" class="hidden card-menu-dropdown absolute right-0 bottom-full mb-2 w-48 bg-surface-950 border border-surface-750 rounded-2xl shadow-2xl p-1.5 z-30 space-y-0.5 backdrop-blur-xl">
            <button class="w-full text-left px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-950/40 rounded-xl flex items-center gap-2.5 cursor-pointer copy-quiz-code-btn" data-id="${quiz.id}">
              <i class="fa-solid fa-key text-amber-400 w-4"></i>
              <span>Copy Quiz Code</span>
            </button>
            <button class="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-surface-850 rounded-xl flex items-center gap-2.5 cursor-pointer edit-quiz-btn" data-id="${quiz.id}">
              <i class="fa-solid fa-pen-to-square text-rose-400 w-4"></i>
              <span>Rename / Folder</span>
            </button>
            <button class="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-surface-850 rounded-xl flex items-center gap-2.5 cursor-pointer download-worksheet-btn" data-id="${quiz.id}">
              <i class="fa-solid fa-file-lines text-cyan-400 w-4"></i>
              <span>Worksheet (Text)</span>
            </button>
            <button class="w-full text-left px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-surface-850 rounded-xl flex items-center gap-2.5 cursor-pointer download-saved-btn" data-id="${quiz.id}">
              <i class="fa-solid fa-code text-indigo-400 w-4"></i>
              <span>Download JSON</span>
            </button>
            <div class="h-px bg-surface-800 my-1"></div>
            <button class="w-full text-left px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/40 rounded-xl flex items-center gap-2.5 cursor-pointer delete-saved-btn" data-id="${quiz.id}">
              <i class="fa-solid fa-trash-can text-red-400 w-4"></i>
              <span>Delete Quiz</span>
            </button>
          </div>
        </div>
      </div>
    `;

    libraryQuizzesGrid.appendChild(card);
  });

  // Attach 3-dot dropdown menu toggles
  document.querySelectorAll('.card-menu-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const menu = document.getElementById(`card-menu-dropdown-${btn.dataset.id}`);
      const isCurrentlyOpen = menu && !menu.classList.contains('hidden');
      document.querySelectorAll('.card-menu-dropdown').forEach(d => d.classList.add('hidden'));
      if (menu && !isCurrentlyOpen) {
        menu.classList.remove('hidden');
      }
    });
  });

  // Attach actions
  document.querySelectorAll('.play-saved-btn').forEach(btn => {
    btn.addEventListener('click', () => loadSavedQuiz(btn.dataset.id));
  });

  document.querySelectorAll('.copy-quiz-code-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.card-menu-dropdown').forEach(d => d.classList.add('hidden'));
      const q = getSavedQuizzes().find(item => item.id === btn.dataset.id);
      if (q) openQuizCodeModal(q);
    });
  });

  document.querySelectorAll('.edit-quiz-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.card-menu-dropdown').forEach(d => d.classList.add('hidden'));
      openEditQuizModal({ type: 'library', quizId: btn.dataset.id });
    });
  });

  document.querySelectorAll('.download-worksheet-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.card-menu-dropdown').forEach(d => d.classList.add('hidden'));
      const q = getSavedQuizzes().find(item => item.id === btn.dataset.id);
      if (q) downloadQuizWorksheet(q);
    });
  });

  document.querySelectorAll('.download-saved-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.card-menu-dropdown').forEach(d => d.classList.add('hidden'));
      const q = getSavedQuizzes().find(item => item.id === btn.dataset.id);
      if (q) downloadBlob(JSON.stringify(q, null, 2), `${sanitizeFilename(q.title)}_quiz.json`, 'application/json');
    });
  });

  document.querySelectorAll('.delete-saved-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.card-menu-dropdown').forEach(d => d.classList.add('hidden'));
      deleteSavedQuiz(btn.dataset.id);
    });
  });
}

let currentEditModalContext = null; // { type: 'active' } or { type: 'library', quizId: '...' }

function openEditQuizModal(context) {
  currentEditModalContext = context;
  if (!editQuizModal || !modalQuizTitleInput || !modalQuizSectionSelect) return;

  const sections = getStoredSections().filter(s => s !== 'All');
  modalQuizSectionSelect.innerHTML = '';
  sections.forEach(sec => {
    const opt = document.createElement('option');
    opt.value = sec;
    opt.textContent = sec;
    modalQuizSectionSelect.appendChild(opt);
  });

  let currentTitle = '';
  let currentSection = 'General';

  if (context.type === 'active') {
    if (!currentQuizData) {
      showToast('No active quiz to rename!', 'error');
      return;
    }
    currentTitle = currentQuizData.title || currentData?.title || 'Video Quiz';
    currentSection = currentQuizData.section || (quizSectionSelect ? quizSectionSelect.value : 'General');
  } else if (context.type === 'library') {
    const quizzes = getSavedQuizzes();
    const quiz = quizzes.find(q => q.id === context.quizId);
    if (!quiz) return;
    currentTitle = quiz.title || 'Video Quiz';
    currentSection = quiz.section || 'General';
  }

  if (!sections.includes(currentSection)) {
    const opt = document.createElement('option');
    opt.value = currentSection;
    opt.textContent = currentSection;
    modalQuizSectionSelect.appendChild(opt);
  }

  modalQuizTitleInput.value = currentTitle;
  modalQuizSectionSelect.value = currentSection;

  editQuizModal.classList.remove('hidden');
  editQuizModal.classList.add('flex');
  setTimeout(() => {
    modalQuizTitleInput.focus();
    modalQuizTitleInput.select();
  }, 60);
}

function closeEditQuizModal() {
  if (editQuizModal) {
    editQuizModal.classList.add('hidden');
    editQuizModal.classList.remove('flex');
  }
  currentEditModalContext = null;
}

function handleAddSectionFromModal() {
  const newName = prompt('Enter new folder/section name (e.g. Modern History, Python, Chemistry):');
  if (!newName || !newName.trim()) return;
  const cleanName = newName.trim();
  const currentSections = getStoredSections();
  if (!currentSections.includes(cleanName)) {
    currentSections.push(cleanName);
    saveStoredSections(currentSections);
  }

  const sections = currentSections.filter(s => s !== 'All');
  modalQuizSectionSelect.innerHTML = '';
  sections.forEach(sec => {
    const opt = document.createElement('option');
    opt.value = sec;
    opt.textContent = sec;
    modalQuizSectionSelect.appendChild(opt);
  });
  modalQuizSectionSelect.value = cleanName;

  populateSectionDropdown();
  renderLibrarySections();
  showToast(`Created folder "${cleanName}"!`, 'success');
}

function saveQuizCustomizationFromModal() {
  if (!currentEditModalContext) return;
  if (!modalQuizTitleInput || !modalQuizSectionSelect) return;

  const newTitle = modalQuizTitleInput.value.trim();
  const newSection = modalQuizSectionSelect.value.trim() || 'General';

  if (!newTitle) {
    showToast('Quiz heading/title cannot be empty!', 'error');
    modalQuizTitleInput.focus();
    return;
  }

  if (currentEditModalContext.type === 'active') {
    if (!currentQuizData) return;
    currentQuizData.title = newTitle;
    currentQuizData.section = newSection;

    if (activeQuizTitle) activeQuizTitle.textContent = newTitle;
    if (activeQuizSectionBadge) activeQuizSectionBadge.textContent = newSection;

    const quizzes = getSavedQuizzes();
    const existingIdx = quizzes.findIndex(q => q.id === currentQuizData.id || (currentQuizData.storageId && q.id === currentQuizData.storageId));
    if (existingIdx !== -1) {
      quizzes[existingIdx].title = newTitle;
      quizzes[existingIdx].section = newSection;
      localStorage.setItem('yt_saved_quizzes', JSON.stringify(quizzes));
      renderLibrarySections();
      renderLibraryQuizzesGrid();
    }

    showToast(`Quiz renamed to "${newTitle}"!`, 'success');
  } else if (currentEditModalContext.type === 'library') {
    const quizzes = getSavedQuizzes();
    const quiz = quizzes.find(q => q.id === currentEditModalContext.quizId);
    if (quiz) {
      quiz.title = newTitle;
      quiz.section = newSection;
      localStorage.setItem('yt_saved_quizzes', JSON.stringify(quizzes));

      if (currentQuizData && (currentQuizData.id === quiz.id || currentQuizData.storageId === quiz.id)) {
        currentQuizData.title = newTitle;
        currentQuizData.section = newSection;
        if (activeQuizTitle) activeQuizTitle.textContent = newTitle;
        if (activeQuizSectionBadge) activeQuizSectionBadge.textContent = newSection;
      }

      renderLibrarySections();
      renderLibraryQuizzesGrid();
      showToast(`Quiz updated to "${newTitle}"!`, 'success');
    }
  }

  closeEditQuizModal();
}

function saveCurrentQuizLocally() {
  if (!currentQuizData) {
    showToast('No active quiz to save!', 'error');
    return;
  }

  const savedList = getSavedQuizzes();
  const storageId = currentQuizData.storageId || ('quiz_' + Date.now());

  const quizRecord = {
    id: storageId,
    video_id: currentVideoId || currentQuizData.video_id || '',
    title: currentQuizData.title || currentData?.title || 'Video Quiz',
    section: currentQuizData.section || (quizSectionSelect ? quizSectionSelect.value : 'General'),
    total_questions: currentQuizData.questions.length,
    questions: currentQuizData.questions,
    savedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    score: quizScore.correct > 0 ? `${quizScore.correct}/${currentQuizData.questions.length}` : null
  };

  currentQuizData.storageId = storageId;

  // Replace if already exists, else unshift
  const existingIndex = savedList.findIndex(s => s.id === storageId);
  if (existingIndex !== -1) {
    savedList[existingIndex] = quizRecord;
  } else {
    savedList.unshift(quizRecord);
  }

  localStorage.setItem('yt_saved_quizzes', JSON.stringify(savedList));
  updateSavedQuizBadge();
  showToast('Quiz saved to your Library! Access anytime.', 'success');
}

function getSavedQuizzes() {
  try {
    const raw = localStorage.getItem('yt_saved_quizzes');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function updateSavedQuizBadge() {
  const count = getSavedQuizzes().length;
  if (savedQuizBadge) savedQuizBadge.textContent = count;
}

function loadSavedQuiz(quizId) {
  const quizzes = getSavedQuizzes();
  const quiz = quizzes.find(q => q.id === quizId);
  if (!quiz) return;

  currentQuizData = quiz;
  currentQuizData.storageId = quiz.id;
  activeQuizBadge.classList.remove('hidden');

  if (quiz.video_id) {
    currentVideoId = quiz.video_id;
    initOrUpdatePlayer(quiz.video_id);
  }

  // Switch to Quiz Arena Page and launch immediately!
  switchPage('quiz');
  resetCurrentQuiz();
  showToast(`Loaded "${quiz.title}"! Ready to practice.`, 'success');
}

function deleteSavedQuiz(quizId) {
  if (!confirm('Are you sure you want to delete this saved quiz?')) return;
  let quizzes = getSavedQuizzes().filter(q => q.id !== quizId);
  localStorage.setItem('yt_saved_quizzes', JSON.stringify(quizzes));
  updateSavedQuizBadge();
  renderLibrarySections();
  renderLibraryQuizzesGrid();
  showToast('Quiz deleted from library.', 'success');
}

function handleImportQuizFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (!imported.questions || !Array.isArray(imported.questions)) throw new Error('Invalid format');
      
      const storageId = 'quiz_' + Date.now();
      imported.id = storageId;
      imported.section = imported.section || 'General';
      imported.savedAt = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      const list = getSavedQuizzes();
      list.unshift(imported);
      localStorage.setItem('yt_saved_quizzes', JSON.stringify(list));

      currentQuizData = imported;
      currentQuizData.storageId = storageId;
      activeQuizBadge.classList.remove('hidden');

      updateSavedQuizBadge();
      switchPage('quiz');
      resetCurrentQuiz();
      showToast(`Imported ${imported.questions.length} questions from file!`, 'success');
    } catch (err) {
      showToast('Could not load quiz JSON file.', 'error');
    }
  };
  reader.readAsText(file);
}

// ----------------------------------------------------
// PORTABLE QUIZ CODE ENGINE (Import & Export via Long Text Code)
// ----------------------------------------------------

function encodeQuizToCode(quizData) {
  if (!quizData) return '';
  const payload = {
    format: 'YTQUIZ_PORTABLE_V1',
    title: quizData.title || 'Video Quiz',
    section: quizData.section || 'General',
    difficulty: quizData.difficulty || 'Medium',
    total_questions: quizData.questions ? quizData.questions.length : 0,
    fact_checked_by_ai: quizData.fact_checked_by_ai !== false,
    questions: quizData.questions || [],
    exported_at: new Date().toISOString()
  };
  const jsonStr = JSON.stringify(payload);
  const base64Str = btoa(encodeURIComponent(jsonStr).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode('0x' + p1);
  }));
  return `YTQUIZ-v1-${base64Str}`;
}

function decodeQuizFromCode(codeStr) {
  if (!codeStr || typeof codeStr !== 'string') {
    throw new Error('Please paste a valid Quiz Code.');
  }

  let cleaned = codeStr.trim();

  // Strip prefixes
  if (cleaned.startsWith('YTQUIZ-v1-')) {
    cleaned = cleaned.substring('YTQUIZ-v1-'.length).trim();
  } else if (cleaned.startsWith('YTQUIZ:')) {
    cleaned = cleaned.substring('YTQUIZ:'.length).trim();
  }

  // Case 1: Raw JSON
  if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
    try {
      const parsed = JSON.parse(cleaned);
      if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
        return parsed;
      }
    } catch (e) {}
  }

  // Case 2: Base64 UTF-8
  try {
    const rawBinary = atob(cleaned);
    const jsonStr = decodeURIComponent(Array.prototype.map.call(rawBinary, (c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const parsed = JSON.parse(jsonStr);
    if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new Error('Quiz Code contains no questions.');
    }
    return parsed;
  } catch (err) {
    throw new Error('Invalid or corrupted Quiz Code. Please verify that you copied the complete code.');
  }
}

function openQuizCodeModal(quizData) {
  if (!quizData) {
    showToast('No quiz available to generate code!', 'error');
    return;
  }
  const code = encodeQuizToCode(quizData);
  if (!code) return;

  if (exportCodeQuizTitle) exportCodeQuizTitle.textContent = quizData.title || 'Video Quiz';
  if (exportCodeBadge) exportCodeBadge.textContent = `${quizData.questions ? quizData.questions.length : 0} Questions`;
  if (exportCodeTextarea) exportCodeTextarea.value = code;

  // Auto-copy to clipboard immediately
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(() => {
      showToast('Quiz Code copied to clipboard! Share on any device.', 'success');
    }).catch(() => {});
  }

  if (exportCodeModal) {
    exportCodeModal.classList.remove('hidden');
    exportCodeModal.classList.add('flex');
    if (exportCodeTextarea) {
      setTimeout(() => {
        exportCodeTextarea.focus();
        exportCodeTextarea.select();
      }, 50);
    }
  }
}

function closeQuizCodeModal() {
  if (exportCodeModal) {
    exportCodeModal.classList.add('hidden');
    exportCodeModal.classList.remove('flex');
  }
}

function copyExportCodeText() {
  if (!exportCodeTextarea) return;
  exportCodeTextarea.focus();
  exportCodeTextarea.select();

  const code = exportCodeTextarea.value;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(() => {
      showToast('Quiz Code copied to clipboard!', 'success');
      if (copyExportCodeBtn) {
        const origHTML = copyExportCodeBtn.innerHTML;
        copyExportCodeBtn.innerHTML = '<i class="fa-solid fa-check text-xs"></i> <span>Copied!</span>';
        setTimeout(() => { copyExportCodeBtn.innerHTML = origHTML; }, 2000);
      }
    }).catch(() => {
      document.execCommand('copy');
      showToast('Quiz Code copied!', 'success');
    });
  } else {
    document.execCommand('copy');
    showToast('Quiz Code copied!', 'success');
  }
}

function openImportCodeModal() {
  if (importCodeTextarea) importCodeTextarea.value = '';

  // Populate folder dropdown
  if (importCodeSectionSelect) {
    importCodeSectionSelect.innerHTML = '';
    const sections = getStoredSections().filter(s => s !== 'All');
    sections.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s;
      opt.textContent = `📁 ${s}`;
      importCodeSectionSelect.appendChild(opt);
    });
  }

  if (importCodeModal) {
    importCodeModal.classList.remove('hidden');
    importCodeModal.classList.add('flex');
    if (importCodeTextarea) {
      setTimeout(() => importCodeTextarea.focus(), 60);
    }
  }
}

function closeImportCodeModal() {
  if (importCodeModal) {
    importCodeModal.classList.add('hidden');
    importCodeModal.classList.remove('flex');
  }
}

function handleAddSectionFromImportModal() {
  const name = prompt('Enter new folder/section name (e.g. Modern History, Physics, Biology):');
  if (!name || !name.trim()) return;
  const cleanName = name.trim();
  const sections = getStoredSections();
  if (!sections.includes(cleanName)) {
    sections.push(cleanName);
    saveStoredSections(sections);
    populateSectionDropdown();
    renderLibrarySections();

    if (importCodeSectionSelect) {
      const opt = document.createElement('option');
      opt.value = cleanName;
      opt.textContent = `📁 ${cleanName}`;
      opt.selected = true;
      importCodeSectionSelect.appendChild(opt);
    }
    showToast(`Folder "${cleanName}" created!`, 'success');
  }
}

function handleExecuteImportCode() {
  const rawCode = importCodeTextarea ? importCodeTextarea.value.trim() : '';
  if (!rawCode) {
    showToast('Please paste the Quiz Code first!', 'error');
    if (importCodeTextarea) importCodeTextarea.focus();
    return;
  }

  try {
    const quizData = decodeQuizFromCode(rawCode);
    const chosenFolder = (importCodeSectionSelect && importCodeSectionSelect.value) ? importCodeSectionSelect.value : (quizData.section || 'General');

    const storageId = 'quiz_' + Date.now();
    quizData.id = storageId;
    quizData.storageId = storageId;
    quizData.section = chosenFolder;
    quizData.savedAt = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Save into saved quizzes library
    const list = getSavedQuizzes();
    list.unshift(quizData);
    localStorage.setItem('yt_saved_quizzes', JSON.stringify(list));

    // Load into active quiz arena
    currentQuizData = quizData;
    activeQuizBadge.classList.remove('hidden');
    updateSavedQuizBadge();
    closeImportCodeModal();

    switchPage('quiz');
    resetCurrentQuiz();
    renderLibrarySections();
    renderLibraryQuizzesGrid();
    showToast(`🎉 Imported "${quizData.title}" (${quizData.questions.length} Qs) into folder "${chosenFolder}"!`, 'success');
  } catch (err) {
    showToast(err.message || 'Could not import quiz code.', 'error');
  }
}

function downloadQuizAsJson() {
  if (!currentQuizData) return;
  downloadBlob(JSON.stringify(currentQuizData, null, 2), `${sanitizeFilename(currentQuizData.title)}_quiz.json`, 'application/json');
}

function downloadQuizWorksheet(quizObj) {
  if (!quizObj || !quizObj.questions) return;

  let text = `QUIZ: ${quizObj.title}\n`;
  text += `Folder: ${quizObj.section || 'General'} | Total Questions: ${quizObj.questions.length}\n\n`;

  quizObj.questions.forEach((q, idx) => {
    text += `Q${idx + 1}. [${q.timestamp || '00:00'}] ${q.question}\n`;
    if (q.options) {
      q.options.forEach(opt => text += `   ${opt}\n`);
    }
    text += `\n`;
  });

  text += `\n--- ANSWER KEY & EXPLANATIONS ---\n\n`;
  quizObj.questions.forEach((q, idx) => {
    text += `Q${idx + 1}: ${q.correct_answer} (At ${q.timestamp || '00:00'}) - ${q.explanation || ''}\n`;
    if (q.verified_fact) {
      text += `    [Evidence]: ${q.verified_fact}\n`;
    }
  });

  downloadBlob(text, `${sanitizeFilename(quizObj.title)}_worksheet.txt`, 'text/plain');
}

function downloadQuizAsPrintableText() {
  if (!currentQuizData) return;
  downloadQuizWorksheet(currentQuizData);
}

function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function parseTimestampToSeconds(ts) {
  if (!ts) return 0;
  const parts = ts.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
}

function highlightText(text, query) {
  if (!query) return escapeHtml(text);
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return escapeHtml(text).replace(regex, '<mark class="search-highlight">$1</mark>');
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// YouTube Player
function initOrUpdatePlayer(videoId) {
  if (typeof YT === 'undefined' || !YT.Player) {
    window.onYouTubeIframeAPIReady = () => initOrUpdatePlayer(videoId);
    return;
  }

  if (ytPlayer && ytPlayerReady) {
    ytPlayer.loadVideoById(videoId);
  } else {
    ytPlayer = new YT.Player('yt-player-target', {
      videoId: videoId,
      playerVars: { autoplay: 0, controls: 1, rel: 0 },
      events: { onReady: () => { ytPlayerReady = true; } }
    });
  }
}

function togglePlayer() {
  const isHidden = playerContainer.classList.contains('hidden');
  if (isHidden) {
    playerContainer.classList.remove('hidden');
    playerBtnLabel.textContent = 'Hide';
    if (currentVideoId) initOrUpdatePlayer(currentVideoId);
  } else {
    playerContainer.classList.add('hidden');
    playerBtnLabel.textContent = 'Video';
    if (ytPlayer && ytPlayerReady && typeof ytPlayer.pauseVideo === 'function') {
      ytPlayer.pauseVideo();
    }
  }
}

window.seekToTime = function(seconds) {
  if (playerContainer.classList.contains('hidden')) togglePlayer();
  if (ytPlayer && ytPlayerReady && typeof ytPlayer.seekTo === 'function') {
    ytPlayer.seekTo(seconds, true);
    ytPlayer.playVideo();
  }
};

function copyTranscript() {
  if (!currentData) return;
  navigator.clipboard.writeText(currentData.timestamped_text).then(() => {
    showToast('Transcript copied!', 'success');
  });
}

function downloadFile(format) {
  if (!currentData) return;
  let content = currentData.timestamped_text;
  let filename = `${sanitizeFilename(currentData.title)}.${format}`;
  let mimeType = 'text/plain';

  if (format === 'srt') {
    content = currentData.srt_content;
    mimeType = 'application/x-subrip';
  } else if (format === 'json') {
    content = JSON.stringify(currentData, null, 2);
    mimeType = 'application/json';
  }

  downloadBlob(content, filename, mimeType);
}

function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9_\-\s]/gi, '').trim().substring(0, 40) || 'transcript';
}

let toastTimeout = null;
function showToast(msg, type = 'success') {
  clearTimeout(toastTimeout);
  toastMessage.textContent = msg;
  toast.classList.remove('translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');
  toastTimeout = setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 2500);
}
