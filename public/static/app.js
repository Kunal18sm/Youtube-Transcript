// State management
let currentData = null;
let currentView = 'timeline'; // 'timeline', 'paragraph', 'raw'
let ytPlayer = null;
let ytPlayerReady = false;
let currentVideoId = null;
let activePlayingSnippet = null;

// DOM Elements
const form = document.getElementById('transcript-form');
const urlInput = document.getElementById('video-url');
const clearBtn = document.getElementById('clear-btn');
const fetchBtn = document.getElementById('fetch-btn');
const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const errorMessage = document.getElementById('error-message');
const errorRetry = document.getElementById('error-retry');
const resultSection = document.getElementById('result-section');

// Metadata DOM
const metaThumb = document.getElementById('meta-thumb');
const metaAuthor = document.getElementById('meta-author');
const metaTitle = document.getElementById('meta-title');
const statDuration = document.getElementById('stat-duration');
const statWords = document.getElementById('stat-words');
const statReading = document.getElementById('stat-reading');
const languageSelect = document.getElementById('language-select');

// Player DOM
const togglePlayerBtn = document.getElementById('toggle-player-btn');
const playerBtnLabel = document.getElementById('player-btn-label');
const playerContainer = document.getElementById('player-container');
const closePlayerBtn = document.getElementById('close-player-btn');
const workspaceGrid = document.getElementById('workspace-grid');
const transcriptMainCard = document.getElementById('transcript-main-card');

// Toolbar & Body DOM
const viewTabs = document.querySelectorAll('.view-tab');
const searchInput = document.getElementById('search-input');
const searchCount = document.getElementById('search-count');
const transcriptBody = document.getElementById('transcript-body');
const copyBtn = document.getElementById('copy-btn');
const aiPromptBtn = document.getElementById('ai-prompt-btn');

// Export Dropdown DOM
const exportDropdownBtn = document.getElementById('export-dropdown-btn');
const exportMenu = document.getElementById('export-menu');
const downloadTxt = document.getElementById('download-txt');
const downloadSrt = document.getElementById('download-srt');
const downloadJson = document.getElementById('download-json');

// Toast DOM
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toast-message');
const toastIcon = document.getElementById('toast-icon');

// Initialize events
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
});

function setupEventListeners() {
  // Input handling
  urlInput.addEventListener('input', () => {
    clearBtn.classList.toggle('hidden', !urlInput.value);
  });

  clearBtn.addEventListener('click', () => {
    urlInput.value = '';
    clearBtn.classList.add('hidden');
    urlInput.focus();
  });

  // Sample buttons
  document.querySelectorAll('.sample-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      urlInput.value = btn.dataset.url;
      clearBtn.classList.remove('hidden');
      fetchTranscript(urlInput.value);
    });
  });

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (url) {
      fetchTranscript(url);
    }
  });

  // Error retry
  errorRetry.addEventListener('click', () => {
    errorState.classList.add('hidden');
    urlInput.focus();
  });

  // Language change
  languageSelect.addEventListener('change', () => {
    if (currentVideoId) {
      fetchTranscript(currentVideoId, languageSelect.value);
    }
  });

  // View switchers
  viewTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      viewTabs.forEach(t => {
        t.classList.remove('active', 'text-white', 'bg-surface-800', 'shadow-md');
        t.classList.add('text-slate-400');
      });
      tab.classList.add('active', 'text-white', 'bg-surface-800', 'shadow-md');
      tab.classList.remove('text-slate-400');
      currentView = tab.dataset.view;
      renderCurrentView();
    });
  });

  // Search input
  searchInput.addEventListener('input', () => {
    renderCurrentView();
  });

  // Video toggle
  togglePlayerBtn.addEventListener('click', togglePlayer);
  closePlayerBtn.addEventListener('click', togglePlayer);

  // Copy buttons
  copyBtn.addEventListener('click', copyTranscript);
  aiPromptBtn.addEventListener('click', copyAiPrompt);

  // Export dropdown
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
}

// Fetch Transcript API Call
async function fetchTranscript(urlOrId, selectedLang = null) {
  setLoading(true);
  errorState.classList.add('hidden');

  try {
    let apiUrl = `/api/transcript?url=${encodeURIComponent(urlOrId)}`;
    if (selectedLang) {
      apiUrl += `&lang=${encodeURIComponent(selectedLang)}`;
    }

    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.detail || 'Failed to fetch transcript.');
    }

    currentData = data;
    currentVideoId = data.video_id;
    displayResults(data);
    showToast('Transcript loaded in seconds!', 'success');
  } catch (err) {
    console.error(err);
    showError(err.message);
  } finally {
    setLoading(false);
  }
}

// Loading state
function setLoading(isLoading) {
  if (isLoading) {
    loadingState.classList.remove('hidden');
    resultSection.classList.add('hidden');
    fetchBtn.disabled = true;
    fetchBtn.classList.add('opacity-75');
  } else {
    loadingState.classList.add('hidden');
    fetchBtn.disabled = false;
    fetchBtn.classList.remove('opacity-75');
  }
}

// Show error
function showError(msg) {
  errorMessage.textContent = msg;
  errorState.classList.remove('hidden');
  resultSection.classList.add('hidden');
}

// Display results
function displayResults(data) {
  // Update Video Meta
  metaThumb.src = data.thumbnail;
  metaAuthor.textContent = data.author;
  metaTitle.textContent = data.title;
  statDuration.textContent = data.formatted_duration;
  statWords.textContent = Number(data.total_words).toLocaleString();
  statReading.textContent = data.estimated_reading_time_min;

  // Populate Languages dropdown
  languageSelect.innerHTML = '';
  if (data.available_languages && data.available_languages.length > 0) {
    data.available_languages.forEach(lang => {
      const opt = document.createElement('option');
      opt.value = lang.language_code;
      opt.textContent = `${lang.language}${lang.is_generated ? ' (Auto)' : ''}`;
      if (lang.language_code === data.language_code) {
        opt.selected = true;
      }
      languageSelect.appendChild(opt);
    });
  } else {
    const opt = document.createElement('option');
    opt.value = data.language_code;
    opt.textContent = data.language;
    languageSelect.appendChild(opt);
  }

  // Update YouTube Player if already active
  if (!playerContainer.classList.contains('hidden')) {
    initOrUpdatePlayer(data.video_id);
  }

  // Render Transcript Body
  renderCurrentView();

  resultSection.classList.remove('hidden');
  resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Render based on active view mode
function renderCurrentView() {
  if (!currentData) return;

  const query = searchInput.value.trim().toLowerCase();
  transcriptBody.innerHTML = '';

  let matchTotal = 0;

  if (currentView === 'timeline') {
    // Render timeline snippets
    currentData.snippets.forEach((snippet) => {
      const item = document.createElement('div');
      item.className = 'snippet-item flex items-start gap-3.5 p-3 rounded-2xl border border-transparent hover:border-surface-700/80 hover:bg-surface-850/60 transition-all cursor-pointer group';
      item.dataset.start = snippet.start;

      // Click to seek in video
      item.addEventListener('click', () => {
        document.querySelectorAll('.snippet-item').forEach(el => el.classList.remove('active-playing'));
        item.classList.add('active-playing');
        seekToTime(snippet.start);
      });

      const hasMatch = query && snippet.text.toLowerCase().includes(query);
      if (hasMatch) matchTotal++;

      const highlightedText = highlightText(snippet.text, query);

      item.innerHTML = `
        <button class="shrink-0 text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-surface-950 text-rose-400 group-hover:bg-rose-600 group-hover:text-white border border-surface-700/80 transition-all shadow-sm" title="Play at ${snippet.formatted_time}">
          <i class="fa-solid fa-play text-[9px] mr-1 opacity-70"></i>${snippet.formatted_time}
        </button>
        <div class="flex-1 text-slate-200 text-sm leading-relaxed">${highlightedText}</div>
      `;
      transcriptBody.appendChild(item);
    });
  } else if (currentView === 'paragraph') {
    // Render grouped paragraphs
    currentData.paragraphs.forEach((para) => {
      const item = document.createElement('div');
      item.className = 'snippet-item p-4 rounded-2xl border border-transparent hover:border-surface-700/80 hover:bg-surface-850/60 mb-2 transition-all';

      const hasMatch = query && para.text.toLowerCase().includes(query);
      if (hasMatch) matchTotal++;

      const highlightedText = highlightText(para.text, query);

      item.innerHTML = `
        <div class="flex items-center gap-2 mb-2">
          <button class="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-surface-950 text-rose-400 hover:bg-rose-600 hover:text-white border border-surface-700/80 transition-all shadow-sm cursor-pointer" onclick="seekToTime(${para.start})">
            <i class="fa-solid fa-play text-[8px] mr-1 opacity-70"></i>${para.formatted_time}
          </button>
        </div>
        <p class="text-slate-200 text-sm leading-relaxed">${highlightedText}</p>
      `;
      transcriptBody.appendChild(item);
    });
  } else if (currentView === 'raw') {
    // Render raw continuous text
    const container = document.createElement('div');
    container.className = 'p-5 rounded-2xl bg-surface-950/70 border border-surface-800 select-all';

    const highlightedText = highlightText(currentData.plain_text, query);
    if (query) {
      const matches = currentData.plain_text.toLowerCase().split(query).length - 1;
      matchTotal = matches;
    }

    container.innerHTML = `<p class="whitespace-pre-wrap leading-relaxed text-slate-200 text-sm sm:text-base">${highlightedText}</p>`;
    transcriptBody.appendChild(container);
  }

  // Update search badge
  if (query) {
    searchCount.textContent = `${matchTotal} ${matchTotal === 1 ? 'match' : 'matches'}`;
    searchCount.classList.remove('hidden');
  } else {
    searchCount.classList.add('hidden');
  }
}

// Highlight helper
function highlightText(text, query) {
  if (!query) return escapeHtml(text);
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return escapeHtml(text).replace(regex, '<mark class="search-highlight">$1</mark>');
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// YouTube Player Controls & Side-by-Side Responsive Grid
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
      playerVars: {
        autoplay: 0,
        controls: 1,
        rel: 0,
        modestbranding: 1
      },
      events: {
        onReady: () => {
          ytPlayerReady = true;
        }
      }
    });
  }
}

function togglePlayer() {
  const isHidden = playerContainer.classList.contains('hidden');
  if (isHidden) {
    // Open player in side-by-side split grid on large screens
    playerContainer.classList.remove('hidden');
    playerBtnLabel.textContent = 'Hide Video';
    
    workspaceGrid.classList.remove('grid-cols-1');
    workspaceGrid.classList.add('lg:grid-cols-12');
    
    playerContainer.classList.add('lg:col-span-5');
    transcriptMainCard.classList.add('lg:col-span-7');

    if (currentVideoId) {
      initOrUpdatePlayer(currentVideoId);
    }
  } else {
    // Close player & restore full-width
    playerContainer.classList.add('hidden');
    playerBtnLabel.textContent = 'Show Video Player';
    
    workspaceGrid.classList.remove('lg:grid-cols-12');
    workspaceGrid.classList.add('grid-cols-1');

    playerContainer.classList.remove('lg:col-span-5');
    transcriptMainCard.classList.remove('lg:col-span-7');

    if (ytPlayer && ytPlayerReady && typeof ytPlayer.pauseVideo === 'function') {
      ytPlayer.pauseVideo();
    }
  }
}

window.seekToTime = function(seconds) {
  if (playerContainer.classList.contains('hidden')) {
    togglePlayer();
  }
  if (ytPlayer && ytPlayerReady && typeof ytPlayer.seekTo === 'function') {
    ytPlayer.seekTo(seconds, true);
    ytPlayer.playVideo();
  }
};

// Copy actions
function copyTranscript() {
  if (!currentData) return;

  let textToCopy = '';
  if (currentView === 'timeline') {
    textToCopy = currentData.timestamped_text;
  } else if (currentView === 'paragraph') {
    textToCopy = currentData.paragraphs.map(p => `[${p.formatted_time}] ${p.text}`).join('\n\n');
  } else {
    textToCopy = currentData.plain_text;
  }

  navigator.clipboard.writeText(textToCopy).then(() => {
    showToast('Full transcript copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Failed to copy text', 'error');
  });
}

function copyAiPrompt() {
  if (!currentData) return;

  const prompt = `Please provide a comprehensive, well-structured executive summary and detailed study notes for this YouTube video:

Title: ${currentData.title}
Channel: ${currentData.author}
Total Duration: ${currentData.formatted_duration}

---
TRANSCRIPT:
${currentData.plain_text}
---

Please provide:
1. 💡 Executive Summary (3-4 concise sentences)
2. 🔑 Top 5 Key Takeaways & Actionable Insights
3. ⏱️ Detailed Chronological Outline (with timestamps for key points)
4. 💬 Memorable Quotes / Core Messages`;

  navigator.clipboard.writeText(prompt).then(() => {
    showToast('AI-Ready Prompt copied! Paste directly into ChatGPT / Claude.', 'success');
  }).catch(() => {
    showToast('Failed to copy AI prompt', 'error');
  });
}

// Download actions
function downloadFile(format) {
  if (!currentData) return;

  let content = '';
  let filename = `${sanitizeFilename(currentData.title)}.${format}`;
  let mimeType = 'text/plain';

  if (format === 'txt') {
    content = `${currentData.title}\nChannel: ${currentData.author}\nDuration: ${currentData.formatted_duration}\n\n${currentData.timestamped_text}`;
  } else if (format === 'srt') {
    content = currentData.srt_content;
    mimeType = 'application/x-subrip';
  } else if (format === 'json') {
    content = JSON.stringify(currentData, null, 2);
    mimeType = 'application/json';
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast(`Downloaded ${filename}`, 'success');
}

function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9_\-\s]/gi, '').trim().substring(0, 50) || 'transcript';
}

// Toast notification
let toastTimeout = null;
function showToast(msg, type = 'success') {
  clearTimeout(toastTimeout);
  toastMessage.textContent = msg;

  if (type === 'success') {
    toastIcon.className = 'fa-solid fa-circle-check text-emerald-400 text-base';
  } else {
    toastIcon.className = 'fa-solid fa-triangle-exclamation text-rose-400 text-base';
  }

  toast.classList.remove('translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');

  toastTimeout = setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 2800);
}
