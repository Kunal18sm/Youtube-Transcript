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
const finishLibraryBtn = document.getElementById('finish-library-btn');
const quizAutosaveBadge = document.getElementById('quiz-autosave-badge');
const quizAutosaveIcon = document.getElementById('quiz-autosave-icon');
const quizAutosaveLabel = document.getElementById('quiz-autosave-label');
const downloadQuizJsonBtn = document.getElementById('download-quiz-json-btn');
const downloadQuizTextBtn = document.getElementById('download-quiz-text-btn');
const retakeQuizBtn = document.getElementById('retake-quiz-btn');
const toggleAllHindiBtn = document.getElementById('toggle-all-hindi-btn');
const globalLangLabel = document.getElementById('global-lang-label');
const shareQuizCodeBtn = document.getElementById('share-quiz-code-btn');
const pushActiveQuizMongoBtn = document.getElementById('push-active-quiz-mongo-btn');
const pushActiveQuizLabel = document.getElementById('push-active-quiz-label');
const pushAllQuizzesMongoBtn = document.getElementById('push-all-quizzes-mongo-btn');
const pushAllQuizzesLabel = document.getElementById('push-all-quizzes-label');
const emptyImportCodeBtn = document.getElementById('empty-import-code-btn');

// MongoDB Cloud Catalog & Library Sorting DOM
const openMongoCatalogBtn = document.getElementById('open-mongo-catalog-btn');
const closeMongoCatalogBtn = document.getElementById('close-mongo-catalog-btn');
const mongoCatalogModal = document.getElementById('mongo-catalog-modal');
const mongoCatalogList = document.getElementById('mongo-catalog-list');
const mongoCatalogSearch = document.getElementById('mongo-catalog-search');
const mongoCatalogCount = document.getElementById('mongo-catalog-count');
const refreshMongoCatalogBtn = document.getElementById('refresh-mongo-catalog-btn');
const librarySortSelect = document.getElementById('library-sort-select');

// Quiz Arena View Mode DOM (1-by-1 Focus Mode vs All Questions)
const viewModeSingleBtn = document.getElementById('view-mode-single-btn');
const viewModeAllBtn = document.getElementById('view-mode-all-btn');
const toggleQuizDetailsBtn = document.getElementById('toggle-quiz-details-btn');
const quizDetailsDrawer = document.getElementById('quiz-details-drawer');
const quizDetailsArrowIcon = document.getElementById('quiz-details-arrow-icon');
const quizJumpNavContainer = document.getElementById('quiz-jump-nav-container');
const quizJumpPills = document.getElementById('quiz-jump-pills');
const quizSingleNavContainer = document.getElementById('quiz-single-nav-container');
const quizPrevQBtn = document.getElementById('quiz-prev-q-btn');
const quizNextQBtn = document.getElementById('quiz-next-q-btn');
const quizSingleIndicator = document.getElementById('quiz-single-indicator');

let currentQuizViewMode = localStorage.getItem('quiz_view_mode') || 'single';
let currentQuestionIndex = 0;

// Auth & Cloud User State (MongoDB)
let currentUser = JSON.parse(localStorage.getItem('yt_current_user') || 'null');
let authMode = 'login'; // 'login' or 'register'

const authModalBtn = document.getElementById('auth-modal-btn');
const userProfilePill = document.getElementById('user-profile-pill');
const userProfileBtn = document.getElementById('user-profile-btn');
const userProfileName = document.getElementById('user-profile-name');
const userProfileMenu = document.getElementById('user-profile-menu');
const userDropdownUsername = document.getElementById('user-dropdown-username');
const userCloudCount = document.getElementById('user-cloud-count');
const userSyncQuizzesBtn = document.getElementById('user-sync-quizzes-btn');
const userLogoutBtn = document.getElementById('user-logout-btn');

const authModal = document.getElementById('auth-modal');
const closeAuthModalBtn = document.getElementById('close-auth-modal-btn');
const authTabLogin = document.getElementById('auth-tab-login');
const authTabRegister = document.getElementById('auth-tab-register');
const authModalTitle = document.getElementById('auth-modal-title');
const authForm = document.getElementById('auth-form');
const authUsernameInput = document.getElementById('auth-username-input');
const authPasswordInput = document.getElementById('auth-password-input');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authSubmitText = document.getElementById('auth-submit-text');

// Share Modal DOM (Alphanumeric Code & Direct Link)
const exportCodeModal = document.getElementById('export-code-modal');
const exportCodeQuizTitle = document.getElementById('export-code-quiz-title');
const exportCodeBadge = document.getElementById('export-code-badge');
const sharePinDisplay = document.getElementById('share-pin-display');
const copySharePinBtn = document.getElementById('copy-share-pin-btn');
const shareLinkInput = document.getElementById('share-link-input');
const copyShareLinkBtn = document.getElementById('copy-share-link-btn');
const showRawCodeBtn = document.getElementById('show-raw-code-btn');
const rawCodeContainer = document.getElementById('raw-code-container');
const exportCodeTextarea = document.getElementById('export-code-textarea');
const closeExportCodeModalBtn = document.getElementById('close-export-code-modal-btn');
const closeExportCodeBtn = document.getElementById('close-export-code-btn');

// Import Modal DOM (6-Digit PIN, Link or Code)
const importCodeModal = document.getElementById('import-code-modal');
const importCodeInput = document.getElementById('import-code-input');
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
const librarySyncBtn = document.getElementById('library-sync-btn');

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
  updateAuthUI();
  syncQuizzesWithCloud(true);
  updateSavedQuizBadge();
  setupPWA();
  populateSectionDropdown();
  checkPreviousTranscript();
  setupNetworkListeners();
  startServerHealthMonitor();
  checkUrlSharedQuiz();
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

function updateServerStatusUI(online) {
  isServerOnline = !!online;
  const userDot = document.getElementById('user-status-dot');
  const guestDot = document.getElementById('guest-status-dot');
  const userBtn = document.getElementById('user-profile-btn');
  const authBtn = document.getElementById('auth-modal-btn');

  if (online) {
    if (userDot) userDot.className = 'w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]';
    if (guestDot) guestDot.className = 'w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]';
    if (userBtn) {
      userBtn.classList.remove('border-rose-500/60');
      userBtn.classList.add('border-emerald-500/40');
      userBtn.title = 'Server: Online (Port 8000)';
    }
    if (authBtn) {
      authBtn.classList.remove('border-rose-500/60');
      authBtn.classList.add('border-surface-700');
      authBtn.title = 'Server: Online (Click to Login)';
    }
  } else {
    if (userDot) userDot.className = 'w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]';
    if (guestDot) guestDot.className = 'w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]';
    if (userBtn) {
      userBtn.classList.remove('border-emerald-500/40');
      userBtn.classList.add('border-rose-500/60');
      userBtn.title = 'Server: Offline (Click Desktop status file to start)';
    }
    if (authBtn) {
      authBtn.classList.remove('border-surface-700');
      authBtn.classList.add('border-rose-500/60');
      authBtn.title = 'Server: Offline (Click Desktop status file to start)';
    }
  }
}

async function checkServerHealth(manual = false) {
  try {
    const res = await fetch('/api/health', {
      cache: 'no-store'
    });

    if (res.ok) {
      updateServerStatusUI(true);
      if (manual) {
        showToast('🟢 Server is Online and active!', 'success');
      }
      return true;
    } else {
      throw new Error(`HTTP ${res.status}`);
    }
  } catch (err) {
    updateServerStatusUI(false);
    if (manual) {
      showToast('🔴 Server is Offline! Click Desktop status file to start.', 'error');
    }
    return false;
  }
}

function startServerHealthMonitor() {
  // Check once immediately on load
  checkServerHealth(false);

  // Check when user switches back to this browser tab (No constant 3s polling loop)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkServerHealth(false);
    }
  });

  window.addEventListener('focus', () => {
    checkServerHealth(false);
  });

  // Check on network online/offline events
  window.addEventListener('online', () => {
    checkServerHealth(false);
  });
  window.addEventListener('offline', () => {
    updateServerStatusUI(false);
  });

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
  if (finishLibraryBtn) {
    finishLibraryBtn.addEventListener('click', () => switchPage('library'));
  }
  downloadQuizJsonBtn.addEventListener('click', downloadQuizAsJson);
  downloadQuizTextBtn.addEventListener('click', downloadQuizAsPrintableText);
  toggleAllHindiBtn.addEventListener('click', toggleAllQuestionsLanguage);
  if (shareQuizCodeBtn) {
    shareQuizCodeBtn.addEventListener('click', () => openQuizCodeModal(currentQuizData));
  }
  if (pushActiveQuizMongoBtn) {
    pushActiveQuizMongoBtn.addEventListener('click', handlePushActiveQuizToMongo);
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
  if (toggleQuizDetailsBtn && quizDetailsDrawer) {
    toggleQuizDetailsBtn.addEventListener('click', () => {
      const isHidden = quizDetailsDrawer.classList.toggle('hidden');
      if (quizDetailsArrowIcon) {
        if (isHidden) {
          quizDetailsArrowIcon.classList.remove('rotate-180');
        } else {
          quizDetailsArrowIcon.classList.add('rotate-180');
        }
      }
    });
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
  if (librarySyncBtn) {
    librarySyncBtn.addEventListener('click', () => syncQuizzesWithCloud(false));
  }
  if (pushAllQuizzesMongoBtn) {
    pushAllQuizzesMongoBtn.addEventListener('click', handlePushAllQuizzesToMongo);
  }

  // Library Sort Select (Sort by Heading / Title A-Z by default)
  if (librarySortSelect) {
    librarySortSelect.addEventListener('change', renderLibraryQuizzesGrid);
  }

  // MongoDB Cloud Directory / Catalog Modal Listeners
  if (openMongoCatalogBtn) {
    openMongoCatalogBtn.addEventListener('click', openMongoCatalogModal);
  }
  if (closeMongoCatalogBtn) {
    closeMongoCatalogBtn.addEventListener('click', closeMongoCatalogModal);
  }
  if (refreshMongoCatalogBtn) {
    refreshMongoCatalogBtn.addEventListener('click', () => fetchAndRenderMongoCatalog(mongoCatalogSearch ? mongoCatalogSearch.value : ''));
  }
  if (mongoCatalogSearch) {
    mongoCatalogSearch.addEventListener('input', (e) => renderMongoCatalogItems(e.target.value));
  }
  if (mongoCatalogModal) {
    mongoCatalogModal.addEventListener('click', (e) => {
      if (e.target === mongoCatalogModal) closeMongoCatalogModal();
    });
  }

  // 6-Digit Share Modal Listeners
  if (closeExportCodeModalBtn) closeExportCodeModalBtn.addEventListener('click', closeQuizCodeModal);
  if (closeExportCodeBtn) closeExportCodeBtn.addEventListener('click', closeQuizCodeModal);
  if (copySharePinBtn) {
    copySharePinBtn.addEventListener('click', () => {
      const pin = sharePinDisplay ? sharePinDisplay.textContent.trim() : '';
      if (pin && pin !== '------') {
        navigator.clipboard.writeText(pin);
        showToast(`Short Code ${pin} copied!`, 'success');
      }
    });
  }
  if (copyShareLinkBtn) {
    copyShareLinkBtn.addEventListener('click', () => {
      const link = shareLinkInput ? shareLinkInput.value.trim() : '';
      if (link) {
        navigator.clipboard.writeText(link);
        showToast('Direct Quiz Link copied!', 'success');
      }
    });
  }
  if (showRawCodeBtn) {
    showRawCodeBtn.addEventListener('click', () => {
      if (rawCodeContainer) rawCodeContainer.classList.toggle('hidden');
    });
  }
  if (exportCodeModal) {
    exportCodeModal.addEventListener('click', (e) => {
      if (e.target === exportCodeModal) closeQuizCodeModal();
    });
  }

  // 6-Digit Import Modal Listeners
  if (closeImportCodeModalBtn) closeImportCodeModalBtn.addEventListener('click', closeImportCodeModal);
  if (cancelImportCodeBtn) cancelImportCodeBtn.addEventListener('click', closeImportCodeModal);
  if (submitImportCodeBtn) submitImportCodeBtn.addEventListener('click', handleExecuteImportCode);
  if (importCodeAddSectionBtn) importCodeAddSectionBtn.addEventListener('click', handleAddSectionFromImportModal);
  if (importCodeInput) {
    importCodeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleExecuteImportCode();
      }
    });
  }
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

  // MongoDB Cloud Auth Listeners
  if (authModalBtn) {
    authModalBtn.addEventListener('click', () => openAuthModal('login'));
  }
  if (closeAuthModalBtn) {
    closeAuthModalBtn.addEventListener('click', closeAuthModal);
  }
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) closeAuthModal();
    });
  }
  if (authTabLogin) {
    authTabLogin.addEventListener('click', () => switchAuthTab('login'));
  }
  if (authTabRegister) {
    authTabRegister.addEventListener('click', () => switchAuthTab('register'));
  }
  if (authForm) {
    authForm.addEventListener('submit', handleAuthSubmit);
  }
  if (userProfileBtn) {
    userProfileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (userProfileMenu) userProfileMenu.classList.toggle('hidden');
    });
  }
  if (userSyncQuizzesBtn) {
    userSyncQuizzesBtn.addEventListener('click', () => {
      if (userProfileMenu) userProfileMenu.classList.add('hidden');
      syncQuizzesWithCloud(false);
    });
  }
  if (userLogoutBtn) {
    userLogoutBtn.addEventListener('click', () => {
      if (userProfileMenu) userProfileMenu.classList.add('hidden');
      handleLogout();
    });
  }
  document.addEventListener('click', (e) => {
    if (userProfileMenu && !userProfileMenu.contains(e.target) && !userProfileBtn?.contains(e.target)) {
      userProfileMenu.classList.add('hidden');
    }
  });
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
    if (currentUser && currentUser.username) {
      syncQuizzesWithCloud(true);
    }
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

  // Realistic dynamic estimate based on question volume:
  // Base transcript analysis ~10s + ~0.35s per requested MCQ
  const estTotalSec = Math.max(12, Math.round(10 + numQuestions * 0.35));
  const startTime = Date.now();
  let currentPercent = 5;

  if (quizProgressBar) quizProgressBar.style.width = '5%';
  if (quizProgressPercent) quizProgressPercent.textContent = '5%';
  if (quizCountdownText) quizCountdownText.innerHTML = `<i class="fa-regular fa-clock text-amber-400 mr-1"></i>0s elapsed <span class="text-slate-500 mx-1">|</span> Est. ~${estTotalSec}s left`;

  const updateUI = () => {
    const elapsedSec = (Date.now() - startTime) / 1000;
    const elapsedInt = Math.floor(elapsedSec);

    // Dynamic, honest remaining or elapsed time display
    if (elapsedSec < estTotalSec) {
      const remainingSec = Math.max(1, Math.round(estTotalSec - elapsedSec));
      if (quizCountdownText) {
        quizCountdownText.innerHTML = `<i class="fa-regular fa-clock text-amber-400 mr-1"></i>${elapsedInt}s elapsed <span class="text-slate-500 mx-1">|</span> Est. ~${remainingSec}s left`;
      }
      // Smooth curve towards ~86% during estimated window
      const ratio = elapsedSec / estTotalSec;
      currentPercent = Math.min(86, Math.max(currentPercent, Math.round(5 + ratio * 81)));
    } else {
      // If taking longer than estimated, NEVER freeze at 1s!
      // Actively show real-time elapsed seconds so user sees AI is actively fact-checking!
      const overtime = elapsedSec - estTotalSec;
      if (quizCountdownText) {
        quizCountdownText.innerHTML = `<i class="fa-solid fa-spinner animate-spin text-rose-400 mr-1"></i>Deep Fact-Checking underway... <span class="font-bold text-amber-300 ml-1">(${elapsedInt}s)</span>`;
      }
      // Asymptotically advance from 86% towards 98% smoothly without stalling
      currentPercent = Math.min(98, Math.round(86 + (1 - Math.exp(-overtime / 20)) * 12));
    }

    if (quizProgressBar) quizProgressBar.style.width = `${currentPercent}%`;
    if (quizProgressPercent) quizProgressPercent.textContent = `${Math.floor(currentPercent)}%`;

    if (quizLoadingMsg && quizLoadingStage) {
      if (currentPercent < 22) {
        quizLoadingMsg.textContent = 'Analyzing lecture transcript & timestamps...';
        quizLoadingStage.innerHTML = '<i class="fa-solid fa-file-lines text-slate-400 text-[10px]"></i> <span>Stage 1/4: Analyzing lecture</span>';
      } else if (currentPercent < 55) {
        quizLoadingMsg.textContent = `Extracting key facts & formulating ${numQuestions} MCQs...`;
        quizLoadingStage.innerHTML = '<i class="fa-solid fa-brain text-indigo-400 text-[10px]"></i> <span>Stage 2/4: Formulating MCQs</span>';
      } else if (currentPercent < 82) {
        quizLoadingMsg.textContent = 'Dual-pass AI fact-checking & auditing answer keys...';
        quizLoadingStage.innerHTML = '<i class="fa-solid fa-shield-halved text-emerald-400 text-[10px]"></i> <span>Stage 3/4: Dual-Pass Fact-Checking</span>';
      } else {
        quizLoadingMsg.textContent = `Verifying question accuracy & explanation proofs (${elapsedInt}s)...`;
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
      if (quizCountdownText) quizCountdownText.innerHTML = '<i class="fa-solid fa-check text-emerald-400 mr-1"></i>Ready!';
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

    // 1. Instantly switch to Quiz Arena & Render questions (0ms UI latency)
    switchPage('quiz');
    resetCurrentQuiz();
    showToast(`✨ Generated ${quizData.total_questions} pure concept MCQs! Ready to practice.`, 'success');

    // 2. Non-blocking Background Auto-Save to MongoDB & Local Cache
    autoSaveQuiz(currentQuizData, { section: chosenSection, title: currentQuizData.title }).catch(e => {
      console.warn('Background auto-save notice:', e);
    });
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
  if (currentQuizData.code) {
    updateAutoSaveUI(currentUser ? 'saved_cloud' : 'saved_local', currentQuizData.code);
  } else {
    updateAutoSaveUI('saved_local');
  }
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
            <i class="fa-solid fa-lightbulb text-amber-400"></i> Explanation & Solution
          </strong>
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

  // Auto-save completion score to local storage & cloud
  autoSaveQuiz(currentQuizData, { score: `${quizScore.correct}/${total}` });
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

  // Auto-save the updated questions list to both localStorage and MongoDB in background
  autoSaveQuiz(currentQuizData).catch(() => {});

  showToast('Question deleted from quiz & database synced.', 'success');
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
    if (label) label.textContent = question.isHindi ? 'English' : 'हिंदी';
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
    } else {
      throw new Error('Empty translation received');
    }
  } catch (err) {
    console.error('Translation failed:', err);
    showToast('Translation error: Could not connect to translation service.', 'error');
    if (label) label.textContent = 'हिंदी';
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
      // Strip any letter prefixes (A, B, C, D, ए, बी, सी, डी, क, ख, ग, घ)
      const cleanOpt = opt.replace(/^[A-Da-d\u0915-\u0928\u090f\u092c\u0938\u0921][\)\.\:\-]\s*|^\([A-Da-d\u0915-\u0928\u090f\u092c\u0938\u0921]\)\s*/, '');
      const span = btn.querySelector('span.flex-1');
      if (span) span.textContent = cleanOpt;
    });
  }
}

async function toggleAllQuestionsLanguage() {
  if (!currentQuizData || !currentQuizData.questions || currentQuizData.questions.length === 0) return;

  isGlobalHindi = !isGlobalHindi;
  toggleAllHindiBtn.disabled = true;

  if (!isGlobalHindi) {
    // Switch all back to English immediately
    for (const q of currentQuizData.questions) {
      q.isHindi = false;
      updateQuestionCardDOM(q);
      const btn = document.querySelector(`.translate-q-btn[data-qid="${q.id}"]`);
      if (btn) {
        const label = btn.querySelector('.translate-q-label');
        if (label) label.textContent = 'हिंदी';
      }
    }
    toggleAllHindiBtn.disabled = false;
    globalLangLabel.textContent = 'All in Hindi';
    showToast('Switched back to English', 'info');
    return;
  }

  // Find questions needing translation
  const needed = currentQuizData.questions.filter(q => !q.hindi);
  if (needed.length === 0) {
    for (const q of currentQuizData.questions) {
      q.isHindi = true;
      updateQuestionCardDOM(q);
      const btn = document.querySelector(`.translate-q-btn[data-qid="${q.id}"]`);
      if (btn) {
        const label = btn.querySelector('.translate-q-label');
        if (label) label.textContent = 'English';
      }
    }
    toggleAllHindiBtn.disabled = false;
    globalLangLabel.textContent = 'View in English';
    showToast('Switched to Hindi', 'success');
    return;
  }

  globalLangLabel.innerHTML = '<i class="fa-solid fa-spinner animate-spin text-xs mr-1"></i> Translating...';
  showToast(`Translating ${needed.length} questions to Hindi...`, 'info');

  try {
    // Fast parallel batch translation in chunks of 10
    const batchSize = 10;
    for (let i = 0; i < needed.length; i += batchSize) {
      const slice = needed.slice(i, i + batchSize);
      try {
        const res = await fetch('/api/translate/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questions: slice.map(q => ({
              id: q.id,
              question: q.question,
              options: q.options,
              explanation: q.explanation
            })),
            target_lang: 'hi'
          })
        });

        if (res.ok) {
          const data = await res.json();
          const translations = data.translations || {};
          for (const q of slice) {
            if (translations[String(q.id)]) {
              q.hindi = translations[String(q.id)];
            }
            q.isHindi = true;
            updateQuestionCardDOM(q);
            const btn = document.querySelector(`.translate-q-btn[data-qid="${q.id}"]`);
            if (btn) {
              const label = btn.querySelector('.translate-q-label');
              if (label) label.textContent = 'English';
            }
          }
        }
      } catch (e) {
        console.warn('Batch translate failed for slice:', e);
      }
    }

    // Apply isHindi = true across all questions
    for (const q of currentQuizData.questions) {
      q.isHindi = true;
      updateQuestionCardDOM(q);
      const btn = document.querySelector(`.translate-q-btn[data-qid="${q.id}"]`);
      if (btn) {
        const label = btn.querySelector('.translate-q-label');
        if (label) label.textContent = 'English';
      }
    }

    showToast('Quiz translated to Hindi successfully!', 'success');
  } finally {
    toggleAllHindiBtn.disabled = false;
    globalLangLabel.textContent = 'View in English';
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
    saveSavedQuizzesLocally(quizzes);
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

  // SORT BY HEADING / TITLE (A-Z by default as requested, or user chosen sort)
  const sortMode = librarySortSelect ? librarySortSelect.value : 'title_asc';
  quizzes.sort((a, b) => {
    const titleA = (a.title || '').trim();
    const titleB = (b.title || '').trim();
    if (sortMode === 'title_asc') {
      return titleA.localeCompare(titleB, undefined, { numeric: true, sensitivity: 'base' });
    } else if (sortMode === 'title_desc') {
      return titleB.localeCompare(titleA, undefined, { numeric: true, sensitivity: 'base' });
    } else if (sortMode === 'newest') {
      return (b.updated_at || b.id || 0) - (a.updated_at || a.id || 0);
    } else if (sortMode === 'questions') {
      const qA = a.total_questions || (a.questions ? a.questions.length : 0);
      const qB = b.total_questions || (b.questions ? b.questions.length : 0);
      return qB - qA;
    }
    return titleA.localeCompare(titleB, undefined, { numeric: true, sensitivity: 'base' });
  });

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
    card.className = 'p-4 rounded-2xl bg-surface-900 border border-surface-800 hover:border-surface-700 transition-all shadow-lg flex flex-col justify-between gap-3 relative';

    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span class="text-slate-300 font-semibold bg-surface-800 border border-surface-700 px-2.5 py-0.5 rounded-full text-[10px]">
            ${quiz.total_questions} Concept MCQs
          </span>
          <span class="text-[10px] text-slate-500">${quiz.savedAt}</span>
        </div>

        <h4 class="font-bold text-white text-sm line-clamp-2 leading-snug" id="lib-title-${quiz.id}">
          ${escapeHtml(quiz.title)}
        </h4>

        ${quiz.score ? `
          <div class="mt-2 inline-flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-xl font-bold text-[10px]">
            <i class="fa-solid fa-trophy text-[9px]"></i> Score: ${quiz.score}
          </div>
        ` : ''}
      </div>

      <div class="flex items-center justify-between pt-2.5 border-t border-surface-800 gap-1.5">
        <button class="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 play-saved-btn" data-id="${quiz.id}">
          <i class="fa-solid fa-play text-[9px]"></i>
          <span>Start Practice Arena</span>
        </button>

        <!-- 3-Dot Kebab Menu Container -->
        <div class="relative dropdown-container">
          <button class="w-8 h-8 rounded-xl bg-surface-800 hover:bg-surface-750 text-slate-300 hover:text-white border border-surface-700 flex items-center justify-center transition-all cursor-pointer card-menu-btn" data-id="${quiz.id}" title="Quiz Options">
            <i class="fa-solid fa-ellipsis-vertical text-xs"></i>
          </button>

          <!-- Floating Dropdown Menu -->
          <div id="card-menu-dropdown-${quiz.id}" class="hidden card-menu-dropdown absolute right-0 bottom-full mb-2 w-52 bg-surface-950 border border-surface-750 rounded-2xl shadow-2xl p-1.5 z-30 space-y-1 backdrop-blur-xl">
            ${(quiz.code || quiz.share_code) ? `
              <div class="px-2.5 py-1.5 text-[11px] font-mono text-amber-300 bg-amber-500/10 rounded-xl flex items-center justify-between border border-amber-500/20">
                <span class="text-slate-400 font-sans text-[10px]">Code:</span>
                <span class="font-bold tracking-wider">${quiz.code || quiz.share_code}</span>
              </div>
              <div class="w-full text-left px-2.5 py-1.5 text-[11px] font-semibold text-emerald-400/90 bg-emerald-500/10 rounded-xl flex items-center gap-2 cursor-default border border-emerald-500/20">
                <i class="fa-solid fa-cloud-check text-emerald-400 text-xs"></i>
                <span>Already on MongoDB</span>
              </div>
            ` : `
              <button class="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-950/40 rounded-xl flex items-center gap-2 cursor-pointer push-single-mongo-btn" data-id="${quiz.id}">
                <i class="fa-solid fa-cloud-arrow-up text-emerald-400 text-xs"></i>
                <span>Push to MongoDB</span>
              </button>
            `}
            <button class="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-950/40 rounded-xl flex items-center gap-2 cursor-pointer copy-quiz-code-btn" data-id="${quiz.id}">
              <i class="fa-solid fa-key text-amber-400 text-xs"></i>
              <span>Copy Quiz Code</span>
            </button>
            <button class="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-surface-850 rounded-xl flex items-center gap-2 cursor-pointer edit-quiz-btn" data-id="${quiz.id}">
              <i class="fa-solid fa-pen-to-square text-rose-400 text-xs"></i>
              <span>Rename / Folder</span>
            </button>
            <button class="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-surface-850 rounded-xl flex items-center gap-2 cursor-pointer download-worksheet-btn" data-id="${quiz.id}">
              <i class="fa-solid fa-file-lines text-cyan-400 text-xs"></i>
              <span>Worksheet (Text)</span>
            </button>
            <button class="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-surface-850 rounded-xl flex items-center gap-2 cursor-pointer download-saved-btn" data-id="${quiz.id}">
              <i class="fa-solid fa-code text-indigo-400 text-xs"></i>
              <span>Download JSON</span>
            </button>
            <div class="h-px bg-surface-800 my-0.5"></div>
            <button class="w-full text-left px-2.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-950/40 rounded-xl flex items-center gap-2 cursor-pointer delete-saved-btn" data-id="${quiz.id}">
              <i class="fa-solid fa-trash-can text-red-400 text-xs"></i>
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

  document.querySelectorAll('.push-single-mongo-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.card-menu-dropdown').forEach(d => d.classList.add('hidden'));
      handlePushSingleQuizToMongo(btn.dataset.id);
    });
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
      saveSavedQuizzesLocally(quizzes);
      renderLibrarySections();
      renderLibraryQuizzesGrid();
    }

      if (currentUser && currentUser.username) {
        fetch('/api/quiz/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: currentQuizData.storageId || currentQuizData.id,
            username: currentUser.username,
            title: newTitle,
            section: newSection
          })
        }).catch(() => {});
      }

    showToast(`Quiz renamed to "${newTitle}"!`, 'success');
  } else if (currentEditModalContext.type === 'library') {
    const quizzes = getSavedQuizzes();
    const quiz = quizzes.find(q => q.id === currentEditModalContext.quizId);
    if (quiz) {
      quiz.title = newTitle;
      quiz.section = newSection;
      saveSavedQuizzesLocally(quizzes);

      if (currentQuizData && (currentQuizData.id === quiz.id || currentQuizData.storageId === quiz.id)) {
        currentQuizData.title = newTitle;
        currentQuizData.section = newSection;
        if (activeQuizTitle) activeQuizTitle.textContent = newTitle;
        if (activeQuizSectionBadge) activeQuizSectionBadge.textContent = newSection;
      }

      if (currentUser && currentUser.username) {
        fetch('/api/quiz/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: quiz.id,
            username: currentUser.username,
            title: newTitle,
            section: newSection
          })
        }).catch(() => {});
      }

      renderLibrarySections();
      renderLibraryQuizzesGrid();
      showToast(`Quiz updated to "${newTitle}"!`, 'success');
    }
  }

  closeEditQuizModal();
}

async function autoSaveQuiz(quizData, options = {}) {
  if (!quizData) return;

  const storageId = quizData.storageId || quizData.id || ('quiz_' + Date.now());
  const chosenSection = options.section || quizData.section || (quizSectionSelect ? quizSectionSelect.value : 'General');
  const chosenTitle = options.title || quizData.title || currentData?.title || 'Video Quiz';

  const quizRecord = {
    id: storageId,
    video_id: currentVideoId || quizData.video_id || '',
    title: chosenTitle,
    section: chosenSection,
    total_questions: quizData.questions ? quizData.questions.length : 0,
    questions: quizData.questions || [],
    savedAt: quizData.savedAt || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    score: options.score || quizData.score || (quizScore.correct > 0 ? `${quizScore.correct}/${quizData.questions.length}` : null),
    code: quizData.code || quizData.share_code || null
  };

  quizData.id = storageId;
  quizData.storageId = storageId;
  quizData.section = chosenSection;
  quizData.title = chosenTitle;
  if (quizRecord.score) quizData.score = quizRecord.score;

  // 1. Instant Offline Storage (saved in browser memory for 100% offline access)
  const savedList = getSavedQuizzes();
  const existingIndex = savedList.findIndex(s => s.id === storageId || (quizRecord.code && s.code === quizRecord.code));
  if (existingIndex !== -1) {
    savedList[existingIndex] = { ...savedList[existingIndex], ...quizRecord };
  } else {
    savedList.unshift(quizRecord);
  }

  saveSavedQuizzesLocally(savedList);
  updateSavedQuizBadge();
  renderLibrarySections();
  renderLibraryQuizzesGrid();

  updateAutoSaveUI('saved_local', quizRecord.code);

  // 2. Instant Cloud Sync (MongoDB) - automatic for both logged-in users & guests
  updateAutoSaveUI('saving_cloud');
  try {
    const res = await fetch('/api/quiz/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: currentUser ? currentUser.username : null,
        quiz: quizRecord
      })
    });
    if (res.ok) {
      const data = await res.json();
      quizRecord.code = data.code;
      quizData.code = data.code;
      quizData.share_code = data.code;

      // Persist code back into local cache
      const idx = savedList.findIndex(s => s.id === storageId);
      if (idx !== -1) {
        savedList[idx].code = data.code;
        savedList[idx].share_code = data.code;
        saveSavedQuizzesLocally(savedList);
      }

      renderLibraryQuizzesGrid();
      updateCloudCount();
      updateAutoSaveUI('saved_cloud', data.code);
      return;
    }
  } catch (e) {
    console.warn('[AutoSave] Cloud sync offline, cached locally:', e);
    updateAutoSaveUI('saved_offline');
  }
}

function updateAutoSaveUI(state, code = null) {
  if (!quizAutosaveLabel || !quizAutosaveIcon) return;
  if (state === 'saving_cloud') {
    quizAutosaveIcon.className = 'fa-solid fa-spinner animate-spin text-[11px] text-amber-400';
    quizAutosaveLabel.textContent = 'Saving...';
  } else if (state === 'saved_cloud') {
    quizAutosaveIcon.className = 'fa-solid fa-cloud-check text-[11px] text-emerald-400';
    quizAutosaveLabel.textContent = code ? `Saved · PIN ${code}` : 'Cloud Saved';
  } else if (state === 'saved_offline') {
    quizAutosaveIcon.className = 'fa-solid fa-hard-drive text-[11px] text-amber-400';
    quizAutosaveLabel.textContent = 'Saved Offline';
  } else {
    quizAutosaveIcon.className = 'fa-solid fa-circle-check text-[11px] text-emerald-400';
    quizAutosaveLabel.textContent = code ? `Saved · PIN ${code}` : 'Auto-Saved';
  }
}

async function saveCurrentQuizLocally() {
  if (!currentQuizData) return;
  await autoSaveQuiz(currentQuizData);
  showToast('Quiz auto-saved to library & offline storage!', 'success');
}

// ----------------------------------------------------
// DEDICATED MONGODB CLOUD PUSH & SYNC CONTROLLERS
// ----------------------------------------------------

async function handlePushActiveQuizToMongo() {
  if (!currentQuizData || !currentQuizData.questions || currentQuizData.questions.length === 0) {
    showToast('No active quiz loaded to push to MongoDB!', 'error');
    return;
  }

  if (pushActiveQuizMongoBtn) pushActiveQuizMongoBtn.disabled = true;
  if (pushActiveQuizLabel) pushActiveQuizLabel.innerHTML = '<i class="fa-solid fa-spinner animate-spin text-xs mr-1"></i> Pushing...';

  try {
    const storageId = currentQuizData.storageId || currentQuizData.id || ('quiz_' + Date.now());
    const chosenSection = currentQuizData.section || (quizSectionSelect ? quizSectionSelect.value : 'General');
    const chosenTitle = currentQuizData.title || currentData?.title || 'Video Quiz';

    const quizRecord = {
      id: storageId,
      storageId: storageId,
      video_id: currentVideoId || currentQuizData.video_id || '',
      title: chosenTitle,
      section: chosenSection,
      total_questions: currentQuizData.questions.length,
      questions: currentQuizData.questions,
      savedAt: currentQuizData.savedAt || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      score: currentQuizData.score || (quizScore.correct > 0 ? `${quizScore.correct}/${currentQuizData.questions.length}` : null),
      code: currentQuizData.code || currentQuizData.share_code || null
    };

    const res = await fetch('/api/quiz/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: currentUser ? currentUser.username : null,
        quiz: quizRecord
      })
    });

    const data = await res.json();
    if (!res.ok || !data.saved_to_mongo) {
      throw new Error(data.detail || data.error || 'Server did not confirm MongoDB save');
    }

    const code = data.code;
    const dbTarget = data.database || 'yt_transcript';
    currentQuizData.code = code;
    currentQuizData.share_code = code;
    quizRecord.code = code;
    quizRecord.share_code = code;

    // Safely persist into localStorage without letting browser quota errors abort the cloud success
    try {
      const savedList = getSavedQuizzes();
      const existingIndex = savedList.findIndex(s => s.id === storageId || s.code === code);
      if (existingIndex !== -1) {
        savedList[existingIndex] = { ...savedList[existingIndex], ...quizRecord };
      } else {
        savedList.unshift(quizRecord);
      }
      saveSavedQuizzesLocally(savedList);
    } catch (storageErr) {
      console.warn('[LocalStorage update warning]:', storageErr);
    }

    try {
      renderLibrarySections();
      renderLibraryQuizzesGrid();
      updateSavedQuizBadge();
      updateCloudCount();
      updateAutoSaveUI('saved_cloud', code);
      updatePushActiveQuizButtonState();
    } catch (uiErr) {
      console.warn('[UI update warning]:', uiErr);
    }

    // Auto-copy short code
    try {
      await navigator.clipboard.writeText(code);
    } catch (_) {}

    showToast(`🎉 Quiz saved to MongoDB [DB: ${dbTarget}]! Code: [${code}] copied to clipboard!`, 'success');
  } catch (err) {
    console.error('Push to MongoDB failed:', err);
    showToast(`❌ MongoDB Save Failed: ${err.message}`, 'error');
    updatePushActiveQuizButtonState();
  } finally {
    if (pushActiveQuizMongoBtn && (!currentQuizData?.code && !currentQuizData?.share_code)) {
      pushActiveQuizMongoBtn.disabled = false;
    }
  }
}

async function handlePushAllQuizzesToMongo() {
  const allQuizzes = getSavedQuizzes();
  if (!allQuizzes || allQuizzes.length === 0) {
    showToast('No saved quizzes found in Library to push! Generate a quiz first.', 'info');
    return;
  }

  if (pushAllQuizzesMongoBtn) pushAllQuizzesMongoBtn.disabled = true;
  if (pushAllQuizzesLabel) pushAllQuizzesLabel.innerHTML = '<i class="fa-solid fa-spinner animate-spin text-xs mr-1"></i> Pushing All...';

  showToast(`☁️ Pushing all ${allQuizzes.length} quizzes to MongoDB Cloud database...`, 'info');

  try {
    const res = await fetch('/api/quiz/save_all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: currentUser ? currentUser.username : null,
        quizzes: allQuizzes
      })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Batch push to MongoDB failed');
    }
    if (data.saved_count === 0 && data.total > 0) {
      throw new Error(data.detail || (data.errors ? data.errors.join(', ') : 'No quizzes could be written to MongoDB.'));
    }

    const results = data.results || {};
    let updatedCount = 0;

    allQuizzes.forEach(q => {
      const info = results[q.id];
      if (info && info.code) {
        q.code = info.code;
        q.share_code = info.code;
        updatedCount++;
      }
    });

    try {
      saveSavedQuizzesLocally(allQuizzes);
    } catch (e) {
      console.warn('Quota safe save fallback:', e);
    }
    renderLibrarySections();
    renderLibraryQuizzesGrid();
    updateSavedQuizBadge();
    updateCloudCount();
    updatePushActiveQuizButtonState();

    const dbTarget = data.database || 'yt_transcript';
    showToast(`🎉 Successfully pushed ${data.saved_count} quizzes to MongoDB [DB: ${dbTarget}]! All codes are live.`, 'success');
  } catch (err) {
    console.error('Push all to MongoDB failed:', err);
    showToast(`❌ MongoDB Bulk Save Failed: ${err.message}`, 'error');
  } finally {
    if (pushAllQuizzesMongoBtn) pushAllQuizzesMongoBtn.disabled = false;
    if (pushAllQuizzesLabel) pushAllQuizzesLabel.textContent = 'Push All to MongoDB';
  }
}

async function handlePushSingleQuizToMongo(quizId) {
  const allQuizzes = getSavedQuizzes();
  const quiz = allQuizzes.find(q => q.id === quizId);
  if (!quiz) return;

  showToast(`☁️ Pushing "${quiz.title}" to MongoDB...`, 'info');

  try {
    const res = await fetch('/api/quiz/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: currentUser ? currentUser.username : null,
        quiz: quiz
      })
    });

    const data = await res.json();
    if (!res.ok || !data.saved_to_mongo) {
      throw new Error(data.detail || data.error || 'Server did not confirm MongoDB save');
    }

    quiz.code = data.code;
    quiz.share_code = data.code;
    try {
      saveSavedQuizzesLocally(allQuizzes);
    } catch (_) {}
    renderLibraryQuizzesGrid();
    updateCloudCount();
    if (currentQuizData && currentQuizData.id === quizId) {
      currentQuizData.code = data.code;
      currentQuizData.share_code = data.code;
      updatePushActiveQuizButtonState();
    }

    try {
      await navigator.clipboard.writeText(data.code);
    } catch (_) {}

    const dbTarget = data.database || 'yt_transcript';
    showToast(`🎉 "${quiz.title}" pushed to MongoDB [DB: ${dbTarget}]! Code: [${data.code}] copied!`, 'success');
  } catch (err) {
    showToast(`❌ Push Failed: ${err.message}`, 'error');
  }
}

function getSavedQuizzes() {
  try {
    const raw = localStorage.getItem('yt_saved_quizzes');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveSavedQuizzesLocally(quizzesList) {
  if (!Array.isArray(quizzesList)) return false;
  try {
    localStorage.setItem('yt_saved_quizzes', JSON.stringify(quizzesList));
    return true;
  } catch (err) {
    console.warn('[LocalStorage Quota] Pruning questions from older quizzes to fit within browser storage...', err);
    try {
      // Safe Pruning Level 1: Keep full questions for top 3 recent quizzes; stub the rest
      const pruned = quizzesList.map((q, idx) => {
        if (idx >= 3 && q.questions && q.questions.length > 0) {
          const stub = { ...q };
          delete stub.questions;
          stub.is_cloud_stub = true;
          return stub;
        }
        return q;
      });
      localStorage.setItem('yt_saved_quizzes', JSON.stringify(pruned));
      return true;
    } catch (err2) {
      // Safe Pruning Level 2: Keep full questions ONLY for top 1 active quiz
      try {
        const prunedUltra = quizzesList.map((q, idx) => {
          if (idx >= 1 && q.questions && q.questions.length > 0) {
            const stub = { ...q };
            delete stub.questions;
            stub.is_cloud_stub = true;
            return stub;
          }
          return q;
        });
        localStorage.setItem('yt_saved_quizzes', JSON.stringify(prunedUltra));
        return true;
      } catch (err3) {
        // Safe Pruning Level 3: Metadata only
        try {
          const metaOnly = quizzesList.map(q => {
            const stub = { ...q };
            delete stub.questions;
            stub.is_cloud_stub = true;
            return stub;
          });
          localStorage.setItem('yt_saved_quizzes', JSON.stringify(metaOnly));
          return true;
        } catch (err4) {
          console.error('[LocalStorage Critical] Storage full even for metadata:', err4);
          return false;
        }
      }
    }
  }
}

function updatePushActiveQuizButtonState() {
  if (!pushActiveQuizMongoBtn || !pushActiveQuizLabel) return;
  const code = currentQuizData?.code || currentQuizData?.share_code;
  if (code && String(code).length >= 4) {
    pushActiveQuizMongoBtn.disabled = true;
    pushActiveQuizMongoBtn.className = "px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-default shadow-sm";
    pushActiveQuizLabel.innerHTML = `<i class="fa-solid fa-cloud-check text-xs"></i> Synced to MongoDB [PIN: ${code}]`;
    pushActiveQuizMongoBtn.title = `This quiz is already stored in MongoDB with PIN: ${code}`;
  } else {
    pushActiveQuizMongoBtn.disabled = false;
    pushActiveQuizMongoBtn.className = "px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer";
    pushActiveQuizLabel.innerHTML = `<i class="fa-solid fa-cloud-arrow-up text-xs mr-1"></i> Push to MongoDB`;
    pushActiveQuizMongoBtn.title = "Directly push and save this quiz to MongoDB";
  }
}

function updateSavedQuizBadge() {
  const count = getSavedQuizzes().length;
  if (savedQuizBadge) savedQuizBadge.textContent = count;
}

async function loadSavedQuiz(quizId) {
  const quizzes = getSavedQuizzes();
  const quiz = quizzes.find(q => q.id === quizId);
  if (!quiz) return;

  // If this quiz was pruned to save browser quota, fetch full questions from MongoDB
  if (quiz.is_cloud_stub && (!quiz.questions || quiz.questions.length === 0) && (quiz.code || quiz.share_code)) {
    const code = quiz.code || quiz.share_code;
    showToast(`Loading complete quiz [${code}] from MongoDB...`, 'info');
    try {
      const res = await fetch(`/api/quiz/shared/${code}`);
      if (res.ok) {
        const fullQuiz = await res.json();
        Object.assign(quiz, fullQuiz);
        quiz.is_cloud_stub = false;
      }
    } catch (e) {
      console.warn('Failed to fetch full cloud quiz for stub:', e);
    }
  }

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
  updatePushActiveQuizButtonState();
  showToast(`Loaded "${quiz.title}"! Ready to practice.`, 'success');
}

function deleteSavedQuiz(quizId) {
  if (!confirm('Are you sure you want to delete this saved quiz?')) return;
  const deletedIds = JSON.parse(localStorage.getItem('yt_deleted_quizzes') || '[]');
  if (!deletedIds.includes(quizId)) {
    deletedIds.push(quizId);
    localStorage.setItem('yt_deleted_quizzes', JSON.stringify(deletedIds));
  }

  let quizzes = getSavedQuizzes().filter(q => q.id !== quizId);
  saveSavedQuizzesLocally(quizzes);
  updateSavedQuizBadge();
  renderLibrarySections();
  renderLibraryQuizzesGrid();

  // If logged in, also delete from cloud MongoDB
  if (currentUser && currentUser.username) {
    fetch('/api/quiz/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: quizId, username: currentUser.username })
    }).then(() => updateCloudCount()).catch(() => {});
  }

  showToast('Quiz deleted from library.', 'success');
}

function handleImportQuizFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (!imported.questions || !Array.isArray(imported.questions)) throw new Error('Invalid format');
      
      const storageId = imported.id || ('quiz_' + Date.now());
      imported.id = storageId;
      imported.storageId = storageId;
      imported.section = imported.section || 'General';

      currentQuizData = imported;
      activeQuizBadge.classList.remove('hidden');
      switchPage('quiz');
      resetCurrentQuiz();
      await autoSaveQuiz(imported, { section: imported.section });
      showToast(`🎉 Imported ${imported.questions.length} questions & Auto-Saved!`, 'success');
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

async function openQuizCodeModal(quizData) {
  if (!quizData) {
    showToast('No quiz available to share!', 'error');
    return;
  }

  if (exportCodeQuizTitle) exportCodeQuizTitle.textContent = quizData.title || 'Video Quiz';
  if (exportCodeBadge) exportCodeBadge.textContent = `${quizData.questions ? quizData.questions.length : 0} Questions`;
  if (sharePinDisplay) sharePinDisplay.textContent = '...';
  if (shareLinkInput) shareLinkInput.value = 'Generating share code...';
  if (rawCodeContainer) rawCodeContainer.classList.add('hidden');

  const rawCode = encodeQuizToCode(quizData);
  if (exportCodeTextarea) exportCodeTextarea.value = rawCode;

  if (exportCodeModal) {
    exportCodeModal.classList.remove('hidden');
    exportCodeModal.classList.add('flex');
  }

  try {
    const res = await fetch('/api/quiz/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quizData)
    });

    if (res.ok) {
      const data = await res.json();
      if (sharePinDisplay) sharePinDisplay.textContent = data.code;
      if (shareLinkInput) shareLinkInput.value = data.share_url;

      // Auto-copy alphanumeric code to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(data.code).catch(() => {});
      }
      showToast(`Quiz Code: ${data.code} generated & copied!`, 'success');
      return;
    }
  } catch (err) {
    console.warn('Backend share offline, using text fallback:', err);
  }

  // Fallback if backend server unreachable
  if (sharePinDisplay) sharePinDisplay.textContent = 'OFFLINE';
  if (rawCodeContainer) rawCodeContainer.classList.remove('hidden');
  showToast('Offline: Copy the text code below to share.', 'info');
}

function closeQuizCodeModal() {
  if (exportCodeModal) {
    exportCodeModal.classList.add('hidden');
    exportCodeModal.classList.remove('flex');
  }
}

function openImportCodeModal(prefillCode = '') {
  if (importCodeInput) {
    importCodeInput.value = prefillCode;
  }

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
    if (importCodeInput) {
      setTimeout(() => {
        importCodeInput.focus();
        if (prefillCode) importCodeInput.select();
      }, 60);
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

async function handleExecuteImportCode() {
  const rawInput = importCodeInput ? importCodeInput.value.trim() : '';
  if (!rawInput) {
    showToast('Please enter the 6-digit code or paste quiz link!', 'error');
    if (importCodeInput) importCodeInput.focus();
    return;
  }

  if (submitImportCodeBtn) {
    submitImportCodeBtn.disabled = true;
    submitImportCodeBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin text-xs"></i> <span>Loading Quiz...</span>';
  }

  try {
    let quizData = null;
    let savedToCloud = false;

    // Check if input is a URL containing ?quiz=XXXXXX
    let potentialCode = rawInput;
    if (rawInput.includes('?quiz=')) {
      const m = rawInput.match(/[\?&]quiz=([a-zA-Z0-9]+)/);
      if (m) potentialCode = m[1];
    } else if (rawInput.includes('/') && !rawInput.startsWith('{') && !rawInput.startsWith('YTQUIZ-')) {
      const parts = rawInput.split('/');
      potentialCode = parts[parts.length - 1];
    }

    const cleanCode = potentialCode.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const chosenFolder = (importCodeSectionSelect && importCodeSectionSelect.value) ? importCodeSectionSelect.value : 'General';

    // 1. If alphanumeric code (letters + digits): fetch from backend server & link to user cloud account
    if (cleanCode.length >= 4 && cleanCode.length <= 16 && !rawInput.startsWith('YTQUIZ-') && !rawInput.startsWith('{')) {
      try {
        const payload = {
          code: cleanCode,
          username: currentUser ? currentUser.username : null,
          section: chosenFolder
        };
        const res = await fetch('/api/quiz/import_code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const resData = await res.json();
          quizData = resData.quiz;
          savedToCloud = resData.saved_to_cloud;
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || `Quiz code '${cleanCode}' not found.`);
        }
      } catch (netErr) {
        throw new Error(netErr.message || 'Could not fetch quiz from server. Check your connection.');
      }
    } else {
      // 2. Fallback: Parse raw JSON or legacy Base64 code
      quizData = decodeQuizFromCode(rawInput);
    }

    if (!quizData || !quizData.questions || quizData.questions.length === 0) {
      throw new Error('Invalid quiz data received.');
    }

    currentQuizData = quizData;
    activeQuizBadge.classList.remove('hidden');
    closeImportCodeModal();

    switchPage('quiz');
    resetCurrentQuiz();
    await autoSaveQuiz(currentQuizData, { section: chosenFolder });

    if (currentUser) {
      showToast(`🎉 Imported "${quizData.title}" into Cloud ID (${currentUser.username}) & Library!`, 'success');
    } else {
      showToast(`🎉 Imported "${quizData.title}" (${quizData.questions.length} Qs) into "${chosenFolder}"!`, 'success');
    }
  } catch (err) {
    showToast(err.message || 'Could not import quiz.', 'error');
  } finally {
    if (submitImportCodeBtn) {
      submitImportCodeBtn.disabled = false;
      submitImportCodeBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-down text-xs"></i> <span>Import & Start Quiz</span>';
    }
  }
}

let mongoCatalogQuizzes = [];

async function fetchAndRenderMongoCatalog(searchFilter = '') {
  if (!mongoCatalogList) return;
  mongoCatalogList.innerHTML = `
    <div class="text-center py-16 text-slate-400 text-xs">
      <i class="fa-solid fa-spinner animate-spin text-xl mb-2 text-cyan-400 block"></i>
      Fetching quizzes from MongoDB Cloud (yt_transcript)...
    </div>
  `;

  try {
    const res = await fetch('/api/quiz/cloud_catalog');
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || 'Failed to load MongoDB directory');
    }
    const data = await res.json();
    mongoCatalogQuizzes = data.quizzes || [];

    renderMongoCatalogItems(searchFilter);
  } catch (err) {
    mongoCatalogList.innerHTML = `
      <div class="text-center py-12 bg-surface-950 border border-surface-800 rounded-2xl p-6">
        <div class="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-2 text-lg">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h4 class="font-bold text-white text-xs">Failed to connect to MongoDB Directory</h4>
        <p class="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">${escapeHtml(err.message)}</p>
        <button id="retry-mongo-catalog-btn" class="mt-3 px-3 py-1 bg-surface-800 hover:bg-surface-750 text-cyan-300 rounded-lg text-xs font-semibold">
          Try Again
        </button>
      </div>
    `;
    const retryBtn = document.getElementById('retry-mongo-catalog-btn');
    if (retryBtn) retryBtn.addEventListener('click', () => fetchAndRenderMongoCatalog(searchFilter));
    if (mongoCatalogCount) mongoCatalogCount.textContent = 'Connection error';
  }
}

function renderMongoCatalogItems(searchFilter = '') {
  if (!mongoCatalogList) return;
  const q = (searchFilter || '').trim().toLowerCase();
  let filtered = mongoCatalogQuizzes;

  if (q) {
    filtered = mongoCatalogQuizzes.filter(item => {
      const title = (item.title || '').toLowerCase();
      const code = (item.code || '').toLowerCase();
      const section = (item.section || '').toLowerCase();
      return title.includes(q) || code.includes(q) || section.includes(q);
    });
  }

  // Sort catalog alphabetically by Heading / Title by default!
  filtered.sort((a, b) => (a.title || '').trim().localeCompare((b.title || '').trim(), undefined, { numeric: true, sensitivity: 'base' }));

  if (mongoCatalogCount) {
    mongoCatalogCount.textContent = `Showing ${filtered.length} of ${mongoCatalogQuizzes.length} MongoDB quizzes`;
  }

  if (filtered.length === 0) {
    mongoCatalogList.innerHTML = `
      <div class="text-center py-12 bg-surface-950 border border-surface-800 rounded-2xl p-6">
        <i class="fa-solid fa-magnifying-glass text-slate-500 text-lg mb-2 block"></i>
        <p class="text-xs text-slate-300 font-semibold">No quizzes found matching "${escapeHtml(searchFilter)}"</p>
        <p class="text-[11px] text-slate-500 mt-1">Try another search term or refresh the catalog.</p>
      </div>
    `;
    return;
  }

  mongoCatalogList.innerHTML = '';
  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'p-3.5 rounded-2xl bg-surface-950/80 border border-surface-800 hover:border-surface-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3';
    
    card.innerHTML = `
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1 flex-wrap">
          <span class="px-2 py-0.5 rounded-full bg-surface-800 border border-surface-700 text-slate-300 text-[10px] font-semibold">
            ${item.total_questions || 0} MCQs
          </span>
          <span class="px-2 py-0.5 rounded-full bg-surface-800/60 border border-surface-700/60 text-slate-400 text-[10px]">
            ${escapeHtml(item.section || 'General')}
          </span>
          ${item.score ? `
            <span class="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              Score: ${item.score}
            </span>
          ` : ''}
        </div>
        <h4 class="font-bold text-white text-xs sm:text-sm line-clamp-1 leading-snug">
          ${escapeHtml(item.title || 'Untitled Quiz')}
        </h4>
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-surface-850 pt-2 sm:pt-0">
        <!-- 6-Digit Code Badge with 1-click Copy -->
        <button class="px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer copy-catalog-code-btn" data-code="${item.code}" title="Click to copy 6-digit code">
          <i class="fa-solid fa-key text-[10px] text-amber-400"></i>
          <span>${item.code}</span>
          <i class="fa-regular fa-copy text-[10px] text-amber-400/70 ml-0.5"></i>
        </button>

        <!-- 1-Click Launch in Arena -->
        <button class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer open-catalog-quiz-btn" data-code="${item.code}" title="Open this quiz directly in Quiz Arena">
          <i class="fa-solid fa-play text-[10px]"></i>
          <span>Play Arena</span>
        </button>
      </div>
    `;

    mongoCatalogList.appendChild(card);
  });

  // Attach event handlers
  mongoCatalogList.querySelectorAll('.copy-catalog-code-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const code = btn.dataset.code;
      try {
        await navigator.clipboard.writeText(code);
        showToast(`PIN Code [${code}] copied to clipboard!`, 'success');
      } catch (_) {
        showToast(`Code: ${code}`, 'info');
      }
    });
  });

  mongoCatalogList.querySelectorAll('.open-catalog-quiz-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const code = btn.dataset.code;
      closeMongoCatalogModal();
      showToast(`Loading quiz [${code}] from MongoDB...`, 'info');
      try {
        const res = await fetch(`/api/quiz/shared/${code}`);
        if (!res.ok) throw new Error('Could not fetch quiz from cloud');
        const quiz = await res.json();
        currentQuizData = quiz;
        currentQuizData.storageId = quiz.id || ('quiz_' + Date.now());
        currentQuizData.code = code;
        currentQuizData.share_code = code;
        
        // Also cache locally
        const list = getSavedQuizzes();
        const existingIdx = list.findIndex(s => s.code === code || s.id === currentQuizData.storageId);
        if (existingIdx !== -1) {
          list[existingIdx] = { ...list[existingIdx], ...currentQuizData };
        } else {
          list.unshift(currentQuizData);
        }
        saveSavedQuizzesLocally(list);
        renderLibrarySections();
        renderLibraryQuizzesGrid();
        updateSavedQuizBadge();
        updateCloudCount();

        switchPage('quiz');
        resetCurrentQuiz();
        updatePushActiveQuizButtonState();
        showToast(`🎉 Opened "${quiz.title}" in Quiz Arena!`, 'success');
      } catch (err) {
        showToast(`Failed to open quiz: ${err.message}`, 'error');
      }
    });
  });
}

function openMongoCatalogModal() {
  if (!mongoCatalogModal) return;
  mongoCatalogModal.classList.remove('hidden');
  mongoCatalogModal.classList.add('flex');
  if (mongoCatalogSearch) mongoCatalogSearch.value = '';
  fetchAndRenderMongoCatalog();
}

function closeMongoCatalogModal() {
  if (!mongoCatalogModal) return;
  mongoCatalogModal.classList.add('hidden');
  mongoCatalogModal.classList.remove('flex');
}

function checkUrlSharedQuiz() {
  const urlParams = new URLSearchParams(window.location.search);
  const quizCode = urlParams.get('quiz');
  if (quizCode) {
    window.history.replaceState({}, document.title, window.location.pathname);
    openImportCodeModal(quizCode);
    showToast(`📥 Quiz code ${quizCode} detected! Click Import to load.`, 'info');
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

// ==============================================================================
// MONGODB CLOUD AUTH & SYNC FUNCTIONS (Simple Login & Logout)
// ==============================================================================

function updateAuthUI() {
  if (currentUser && currentUser.username) {
    if (authModalBtn) authModalBtn.classList.add('hidden');
    if (userProfilePill) {
      userProfilePill.classList.remove('hidden');
      userProfilePill.classList.add('inline-flex');
    }
    if (userProfileName) userProfileName.textContent = currentUser.username;
    if (userDropdownUsername) userDropdownUsername.textContent = currentUser.username;
    updateCloudCount();
  } else {
    if (authModalBtn) authModalBtn.classList.remove('hidden');
    if (userProfilePill) {
      userProfilePill.classList.add('hidden');
      userProfilePill.classList.remove('inline-flex');
    }
    if (userProfileMenu) userProfileMenu.classList.add('hidden');
  }
}

function openAuthModal(mode = 'login') {
  switchAuthTab(mode);
  if (authModal) {
    authModal.classList.remove('hidden');
    authModal.classList.add('flex');
    setTimeout(() => {
      if (authUsernameInput) authUsernameInput.focus();
    }, 60);
  }
}

function closeAuthModal() {
  if (authModal) {
    authModal.classList.add('hidden');
    authModal.classList.remove('flex');
  }
}

function switchAuthTab(mode) {
  authMode = mode;
  if (mode === 'login') {
    if (authTabLogin) {
      authTabLogin.className = 'flex-1 py-1.5 rounded-xl bg-surface-800 text-white shadow-sm transition-all cursor-pointer';
    }
    if (authTabRegister) {
      authTabRegister.className = 'flex-1 py-1.5 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer';
    }
    if (authSubmitText) authSubmitText.textContent = 'Login to Cloud';
    if (authModalTitle) authModalTitle.textContent = 'Cloud Login';
  } else {
    if (authTabRegister) {
      authTabRegister.className = 'flex-1 py-1.5 rounded-xl bg-surface-800 text-white shadow-sm transition-all cursor-pointer';
    }
    if (authTabLogin) {
      authTabLogin.className = 'flex-1 py-1.5 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer';
    }
    if (authSubmitText) authSubmitText.textContent = 'Create New ID';
    if (authModalTitle) authModalTitle.textContent = 'Create Cloud ID';
  }
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const username = authUsernameInput ? authUsernameInput.value.trim().toLowerCase() : '';
  const password = authPasswordInput ? authPasswordInput.value.trim() : '';

  if (!username || username.length < 3) {
    showToast('Username must be at least 3 characters!', 'error');
    if (authUsernameInput) authUsernameInput.focus();
    return;
  }
  if (!password || password.length < 3) {
    showToast('Password must be at least 3 characters!', 'error');
    if (authPasswordInput) authPasswordInput.focus();
    return;
  }

  if (authSubmitBtn) {
    authSubmitBtn.disabled = true;
    authSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin text-xs"></i> <span>Connecting...</span>';
  }

  const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Authentication failed');
    }

    currentUser = {
      username: data.username,
      token: data.token
    };
    localStorage.setItem('yt_current_user', JSON.stringify(currentUser));

    updateAuthUI();
    closeAuthModal();
    showToast(`Welcome, ${data.username}! MongoDB Cloud active.`, 'success');

    // Auto-sync cloud quizzes immediately
    syncQuizzesWithCloud(false);
  } catch (err) {
    showToast(err.message || 'Login error. Check connection.', 'error');
  } finally {
    if (authSubmitBtn) {
      authSubmitBtn.disabled = false;
      authSubmitBtn.innerHTML = `<i class="fa-solid fa-right-to-bracket text-xs"></i> <span>${authMode === 'register' ? 'Create New ID' : 'Login to Cloud'}</span>`;
    }
  }
}

function handleLogout() {
  if (!confirm(`Logout from user ID "${currentUser?.username || ''}"?`)) return;
  currentUser = null;
  localStorage.removeItem('yt_current_user');
  updateAuthUI();
  showToast('Logged out of Cloud. Local library is still accessible.', 'info');
}

async function updateCloudCount() {
  if (!currentUser || !currentUser.username || !userCloudCount) return;
  try {
    const res = await fetch(`/api/auth/me?username=${encodeURIComponent(currentUser.username)}`);
    if (res.ok) {
      const data = await res.json();
      userCloudCount.textContent = `${data.cloud_quizzes} Quizzes Synced`;
    }
  } catch (e) {}
}

async function syncQuizzesWithCloud(silent = false) {
  if (!currentUser || !currentUser.username) return;

  try {
    const res = await fetch(`/api/user/quizzes?username=${encodeURIComponent(currentUser.username)}`);
    if (!res.ok) return;
    const data = await res.json();
    const cloudQuizzes = data.quizzes || [];

    const deletedIds = JSON.parse(localStorage.getItem('yt_deleted_quizzes') || '[]');
    const localQuizzes = getSavedQuizzes();
    let merged = [...localQuizzes];
    let newImported = 0;

    // 1. Merge cloud quizzes into local library (caches in localStorage for 100% offline access!)
    cloudQuizzes.forEach(cq => {
      // Don't import if user deleted it locally
      if (deletedIds.includes(cq.id) || (cq.code && deletedIds.includes(cq.code))) {
        return;
      }
      const idx = merged.findIndex(lq => lq.id === cq.id || (cq.code && lq.code === cq.code));
      if (idx !== -1) {
        merged[idx] = { ...merged[idx], ...cq };
      } else {
        merged.unshift(cq);
        newImported++;
      }
    });

    saveSavedQuizzesLocally(merged);
    updateSavedQuizBadge();
    renderLibrarySections();
    renderLibraryQuizzesGrid();
    updateCloudCount();

    // 2. Also auto-upload any local quizzes that aren't yet in MongoDB
    for (const lq of localQuizzes) {
      if (deletedIds.includes(lq.id) || (lq.code && deletedIds.includes(lq.code))) continue;
      const inCloud = cloudQuizzes.some(cq => cq.id === lq.id || (lq.code && cq.code === lq.code));
      if (!inCloud && lq.questions && lq.questions.length > 0) {
        fetch('/api/quiz/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: currentUser.username, quiz: lq })
        }).then(r => r.json()).then(savedRes => {
          if (savedRes && savedRes.code) {
            lq.code = savedRes.code;
            lq.share_code = savedRes.code;
            saveSavedQuizzesLocally(merged);
            renderLibraryQuizzesGrid();
          }
        }).catch(() => {});
      }
    }

    if (!silent) {
      showToast(`☁️ Cloud Sync: ${cloudQuizzes.length} quizzes loaded for "${currentUser.username}"!`, 'success');
    }
  } catch (err) {
    if (!silent) showToast('Could not sync with MongoDB Cloud. Offline quizzes available.', 'error');
  }
}
