/**
 * JPARD STUDIO — DAILY SHORT VIDEO DIRECTOR
 * Complete Frontend Engine & Gemini API Integration
 * Based on MASTER FLOW - DAILY RANDOM SHORT VIDEO
 */

// ==========================================
// 1. STATE & INITIALIZATION
// ==========================================

const STORAGE_KEYS = {
  API_KEY: 'jpard_gemini_api_key',
  MODEL: 'jpard_gemini_model',
  PROJECTS: 'jpard_saved_projects',
  CURRENT: 'jpard_current_project',
  TIMER: 'jpard_timer_state'
};

const DEFAULT_PROJECT = {
  id: '',
  date: '',
  title: 'Untitled Daily Short',
  sourceInput: '',
  imageReference: null,
  soundtrack: null,
  assetSheet: null,
  assetLibrary: [],
  sequentialChaining: true,
  theme: 'bebas',
  continuityLevel: 'B',
  sourcePack: null,
  masterPack: null,
  scenes: [],
  qcStatus: [
    { identity: false, motion: false, composition: false, story: false },
    { identity: false, motion: false, composition: false, story: false },
    { identity: false, motion: false, composition: false, story: false },
    { identity: false, motion: false, composition: false, story: false },
    { identity: false, motion: false, composition: false, story: false },
    { identity: false, motion: false, composition: false, story: false }
  ],
  diagnoses: {}
};

let savedModel = localStorage.getItem(STORAGE_KEYS.MODEL) || 'gemini-3.8-flash';
if (!savedModel || savedModel.includes('2.5') || savedModel.includes('1.5') || savedModel.includes('2.0')) {
  savedModel = 'gemini-3.8-flash';
  localStorage.setItem(STORAGE_KEYS.MODEL, 'gemini-3.8-flash');
}

let state = {
  apiKey: localStorage.getItem(STORAGE_KEYS.API_KEY) || '',
  model: savedModel,
  project: JSON.parse(JSON.stringify(DEFAULT_PROJECT)),
  activeTab: 'tab-source',
  timerSeconds: 0,
  timerInterval: null,
  timerRunning: false
};

// ==========================================
// 2. DOM ELEMENTS
// ==========================================

const els = {
  // Tabs
  navTabs: document.querySelectorAll('.nav-tab'),
  tabContents: document.querySelectorAll('.tab-content'),
  sceneCountBadge: document.getElementById('sceneCountBadge'),

  // Timer
  timerDisplay: document.getElementById('timerDisplay'),
  timerDot: document.getElementById('timerDot'),
  timerPulse: document.getElementById('timerPulse'),
  btnTimerToggle: document.getElementById('btnTimerToggle'),
  timerIcon: document.getElementById('timerIcon'),
  btnTimerReset: document.getElementById('btnTimerReset'),

  // Header Buttons & Modals
  btnSettings: document.getElementById('btnSettings'),
  btnCloseSettings: document.getElementById('btnCloseSettings'),
  modalSettings: document.getElementById('modalSettings'),
  inputApiKey: document.getElementById('inputApiKey'),
  selectModel: document.getElementById('selectModel'),
  btnSaveSettings: document.getElementById('btnSaveSettings'),
  apiStatusBadge: document.getElementById('apiStatusBadge'),

  btnSavedProjects: document.getElementById('btnSavedProjects'),
  btnCloseSavedProjects: document.getElementById('btnCloseSavedProjects'),
  modalSavedProjects: document.getElementById('modalSavedProjects'),
  savedProjectsList: document.getElementById('savedProjectsList'),
  btnNewProject: document.getElementById('btnNewProject'),
  btnImportJSON: document.getElementById('btnImportJSON'),
  inputImportFile: document.getElementById('inputImportFile'),

  // Tab 1: Source & Universal Ingest Hub
  inputReference: document.getElementById('inputReference'),
  smartDropContainer: document.getElementById('smartDropContainer'),
  dragOverlay: document.getElementById('dragOverlay'),
  inputImageRef: document.getElementById('inputImageRef'),
  attachedMediaTray: document.getElementById('attachedMediaTray'),
  imagePreviewImg: document.getElementById('imagePreviewImg'),
  btnRemoveImage: document.getElementById('btnRemoveImage'),
  btnBrowseReferenceFile: document.getElementById('btnBrowseReferenceFile'),
  btnPasteFromClipboard: document.getElementById('btnPasteFromClipboard'),
  selectTheme: document.getElementById('selectTheme'),
  inputCustomTheme: document.getElementById('inputCustomTheme'),
  btnPreset: document.querySelectorAll('.btn-preset'),
  btnGenerateSourcePack: document.getElementById('btnGenerateSourcePack'),
  sourcePackPlaceholder: document.getElementById('sourcePackPlaceholder'),
  sourcePackResult: document.getElementById('sourcePackResult'),
  sourcePackStatus: document.getElementById('sourcePackStatus'),
  sourcePackFooter: document.getElementById('sourcePackFooter'),
  btnProceedToDirector: document.getElementById('btnProceedToDirector'),

  // Tab 2: Director
  btnLevels: document.querySelectorAll('.btn-level'),
  btnBuildProductionPack: document.getElementById('btnBuildProductionPack'),
  masterPackEmpty: document.getElementById('masterPackEmpty'),
  masterPackContent: document.getElementById('masterPackContent'),
  soundtrackContainer: document.getElementById('soundtrackContainer'),
  btnGenerateSoundtrack: document.getElementById('btnGenerateSoundtrack'),
  soundtrackResultBox: document.getElementById('soundtrackResultBox'),
  masterPackFooter: document.getElementById('masterPackFooter'),
  btnProceedToAsset: document.getElementById('btnProceedToAsset'),

  // Tab 3: Asset & Anchor Sheet + Library
  btnAssetTypePills: document.querySelectorAll('.btn-asset-type-pill'),
  chkUseAsAnchor: document.getElementById('chkUseAsAnchor'),
  assetActionsBar: document.getElementById('assetActionsBar'),
  btnFullscreenAssetImg: document.getElementById('btnFullscreenAssetImg'),
  btnDownloadAssetImg: document.getElementById('btnDownloadAssetImg'),
  assetCanvasContainer: document.getElementById('assetCanvasContainer'),
  assetCanvasEmpty: document.getElementById('assetCanvasEmpty'),
  assetCanvasImg: document.getElementById('assetCanvasImg'),
  assetVersionReelContainer: document.getElementById('assetVersionReelContainer'),
  assetVersionCountBadge: document.getElementById('assetVersionCountBadge'),
  assetVersionReel: document.getElementById('assetVersionReel'),
  assetLibrarySection: document.getElementById('assetLibrarySection'),
  assetLibraryCountBadge: document.getElementById('assetLibraryCountBadge'),
  btnUploadToAssetLibrary: document.getElementById('btnUploadToAssetLibrary'),
  inputAssetLibraryUpload: document.getElementById('inputAssetLibraryUpload'),
  assetLibraryGrid: document.getElementById('assetLibraryGrid'),
  inputCustomAssetFile: document.getElementById('inputCustomAssetFile'),
  btnUploadCustomAsset: document.getElementById('btnUploadCustomAsset'),
  assetStatusBox: document.getElementById('assetStatusBox'),
  assetStatusText: document.getElementById('assetStatusText'),
  inputAssetPrompt: document.getElementById('inputAssetPrompt'),
  inputAssetNegative: document.getElementById('inputAssetNegative'),
  btnResetAssetPrompt: document.getElementById('btnResetAssetPrompt'),
  btnGenerateAssetSheet: document.getElementById('btnGenerateAssetSheet'),
  btnProceedToScenesFromAsset: document.getElementById('btnProceedToScenesFromAsset'),

  // Tab 4: Scenes
  anchorActiveBanner: document.getElementById('anchorActiveBanner'),
  anchorThumbBox: document.getElementById('anchorThumbBox'),
  anchorBadgeStatus: document.getElementById('anchorBadgeStatus'),
  anchorDescriptionText: document.getElementById('anchorDescriptionText'),
  btnJumpToAssetTab: document.getElementById('btnJumpToAssetTab'),
  chkSequentialChaining: document.getElementById('chkSequentialChaining'),
  btnGenerateAllImages: document.getElementById('btnGenerateAllImages'),
  scenesEmpty: document.getElementById('scenesEmpty'),
  scenesList: document.getElementById('scenesList'),
  sceneFilterPills: document.querySelectorAll('.scene-filter-pill'),

  // Tab 4: QC & Fix
  qcScenesMatrix: document.getElementById('qcScenesMatrix'),
  qcOverallBadge: document.getElementById('qcOverallBadge'),
  selectFixScene: document.getElementById('selectFixScene'),
  btnErrorPresets: document.querySelectorAll('.btn-error-preset'),
  inputFixIssue: document.getElementById('inputFixIssue'),
  btnDiagnoseFix: document.getElementById('btnDiagnoseFix'),
  btnSimplifyShot: document.getElementById('btnSimplifyShot'),
  diagnosisResultBox: document.getElementById('diagnosisResultBox'),

  // Tab 5: Assemble
  voiceoverScriptContent: document.getElementById('voiceoverScriptContent'),
  btnCopyVoiceover: document.getElementById('btnCopyVoiceover'),
  btnExportMarkdown: document.getElementById('btnExportMarkdown'),
  btnExportJSON: document.getElementById('btnExportJSON'),
  btnPrintProject: document.getElementById('btnPrintProject'),

  // Modal Image Preview
  modalImagePreview: document.getElementById('modalImagePreview'),
  btnCloseImageModal: document.getElementById('btnCloseImageModal'),
  modalPreviewImg: document.getElementById('modalPreviewImg'),
  btnDownloadModalImg: document.getElementById('btnDownloadModalImg'),

  // Toast
  toast: document.getElementById('toast'),
  toastMsg: document.getElementById('toastMsg')
};

// ==========================================
// 3. LIFECYCLE & EVENT LISTENERS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initProject();
  initTimer();
  updateApiBadge();
  setupEventListeners();
  lucide.createIcons();
});

function initProject() {
  const saved = localStorage.getItem(STORAGE_KEYS.CURRENT);
  if (saved) {
    try {
      state.project = JSON.parse(saved);
      // Clean up residual auto-generated boilerplate if previously saved
      if (state.project.sourceInput && state.project.sourceInput.startsWith('Video Referensi: "')) {
        state.project.sourceInput = '';
      }
    } catch (e) {
      resetProject();
    }
  } else {
    resetProject();
  }
  if (els.inputReference) {
    els.inputReference.value = state.project.sourceInput || '';
  }
  renderAll();
}

function resetProject() {
  const now = new Date();
  state.project = JSON.parse(JSON.stringify(DEFAULT_PROJECT));
  state.project.id = 'proj_' + Date.now();
  state.project.date = now.toISOString().split('T')[0];
  state.project.title = `Daily Short — ${now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}`;
  saveCurrentProject();
}

function saveCurrentProject() {
  localStorage.setItem(STORAGE_KEYS.CURRENT, JSON.stringify(state.project));
  updateSceneBadge();
}

function setupEventListeners() {
  // Reference Input Text Sync
  els.inputReference?.addEventListener('input', (e) => {
    state.project.sourceInput = e.target.value;
    saveCurrentProject();
  });

  // Navigation Tabs
  els.navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.tab;
      switchTab(tabId);
    });
  });

  // Proceed buttons
  els.btnProceedToDirector?.addEventListener('click', () => switchTab('tab-director'));
  els.btnProceedToAsset?.addEventListener('click', () => switchTab('tab-asset'));
  els.btnProceedToScenesFromAsset?.addEventListener('click', () => switchTab('tab-scenes'));
  els.btnJumpToAssetTab?.addEventListener('click', () => switchTab('tab-asset'));

  // Asset Sheet Event Listeners
  els.btnAssetTypePills?.forEach(pill => {
    pill.addEventListener('click', () => {
      setAssetSheetType(pill.dataset.type);
    });
  });

  els.chkUseAsAnchor?.addEventListener('change', (e) => {
    if (!state.project.assetSheet) {
      state.project.assetSheet = generateDefaultAssetSheet(state.project.masterPack, state.project.continuityLevel, state.project.sourcePack);
    }
    state.project.assetSheet.isAnchorActive = e.target.checked;
    saveCurrentProject();
    renderAssetSheetUI();
    renderAnchorBannerUI();
  });

  els.btnGenerateAssetSheet?.addEventListener('click', handleGenerateAssetSheet);
  els.btnResetAssetPrompt?.addEventListener('click', resetAssetPrompt);
  els.btnUploadCustomAsset?.addEventListener('click', () => els.inputCustomAssetFile?.click());
  els.inputCustomAssetFile?.addEventListener('change', handleCustomAssetUpload);
  els.btnFullscreenAssetImg?.addEventListener('click', () => {
    if (state.project.assetSheet?.imageData) openImageModal(state.project.assetSheet.imageData);
  });

  els.inputAssetPrompt?.addEventListener('input', (e) => {
    if (!state.project.assetSheet) {
      state.project.assetSheet = generateDefaultAssetSheet(state.project.masterPack, state.project.continuityLevel, state.project.sourcePack);
    }
    state.project.assetSheet.prompt = e.target.value;
    saveCurrentProject();
  });

  els.inputAssetNegative?.addEventListener('input', (e) => {
    if (!state.project.assetSheet) {
      state.project.assetSheet = generateDefaultAssetSheet(state.project.masterPack, state.project.continuityLevel, state.project.sourcePack);
    }
    state.project.assetSheet.negativePrompt = e.target.value;
    saveCurrentProject();
  });

  // Theme dropdown custom
  els.selectTheme?.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
      els.inputCustomTheme.classList.remove('hidden');
    } else {
      els.inputCustomTheme.classList.add('hidden');
    }
  });

  // Presets
  els.btnPreset.forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.dataset.preset;
      applyPreset(p);
    });
  });

  // Continuity Level Buttons
  els.btnLevels.forEach(btn => {
    btn.addEventListener('click', () => {
      state.project.continuityLevel = btn.dataset.level;
      updateContinuityLevelUI();
      saveCurrentProject();
    });
  });

  // Tab 1: Universal Reference Ingest Hub (Drag & Drop, Paste Cmd+V, Browse)
  els.smartDropContainer?.addEventListener('dragenter', (e) => {
    e.preventDefault();
    els.dragOverlay?.classList.remove('hidden');
  });

  els.smartDropContainer?.addEventListener('dragover', (e) => {
    e.preventDefault();
    els.dragOverlay?.classList.remove('hidden');
  });

  els.smartDropContainer?.addEventListener('dragleave', (e) => {
    e.preventDefault();
    if (e.relatedTarget && !els.smartDropContainer.contains(e.relatedTarget)) {
      els.dragOverlay?.classList.add('hidden');
    }
  });

  els.smartDropContainer?.addEventListener('drop', (e) => {
    e.preventDefault();
    els.dragOverlay?.classList.add('hidden');
    if (e.dataTransfer.files?.[0]) {
      processGenericReferenceFile(e.dataTransfer.files[0]);
    }
  });

  els.btnBrowseReferenceFile?.addEventListener('click', () => {
    els.inputImageRef?.click();
  });

  els.inputImageRef?.addEventListener('change', handleImageUpload);
  els.btnPasteFromClipboard?.addEventListener('click', handleClipboardButtonPaste);
  window.addEventListener('paste', handlePaste);

  els.btnRemoveImage?.addEventListener('click', (e) => {
    e.stopPropagation();
    removeImageRef();
  });

  // Tab 3: Asset Library & Bank Referensi Listeners
  els.btnUploadToAssetLibrary?.addEventListener('click', () => {
    els.inputAssetLibraryUpload?.click();
  });
  els.inputAssetLibraryUpload?.addEventListener('change', handleAssetLibraryUpload);

  // Tab 4: Sequential Chaining Toggle
  els.chkSequentialChaining?.addEventListener('change', (e) => {
    state.project.sequentialChaining = e.target.checked;
    saveCurrentProject();
    renderScenesUI();
    showToast(state.project.sequentialChaining 
      ? 'Sequential Chaining Aktif: Scene 1 ➔ 2 ➔ ... ➔ 6 Loop' 
      : 'Sequential Chaining Dimatikan: Semua scene merujuk ke Asset Sheet.');
  });

  // Action Buttons
  els.btnGenerateSourcePack?.addEventListener('click', handleGenerateSourcePack);
  els.btnBuildProductionPack?.addEventListener('click', handleGenerateProductionPack);
  els.btnGenerateSoundtrack?.addEventListener('click', handleGenerateSoundtrack);
  els.btnGenerateAllImages?.addEventListener('click', handleGenerateAllMasterFrames);

  // Fullscreen Image Modal
  els.btnCloseImageModal?.addEventListener('click', () => els.modalImagePreview?.classList.add('hidden'));
  els.modalImagePreview?.addEventListener('click', (e) => {
    if (e.target === els.modalImagePreview) els.modalImagePreview?.classList.add('hidden');
  });

  // Scene filter pills
  els.sceneFilterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      els.sceneFilterPills.forEach(p => p.classList.remove('active', 'bg-dark-card', 'text-white'));
      pill.classList.add('active', 'bg-dark-card', 'text-white');
      filterScenes(pill.dataset.scene);
    });
  });

  // QC Error Presets
  els.btnErrorPresets.forEach(btn => {
    btn.addEventListener('click', () => {
      const err = btn.dataset.error;
      applyErrorPreset(err);
    });
  });

  // Diagnosis Buttons
  els.btnDiagnoseFix?.addEventListener('click', handleDiagnoseFix);
  els.btnSimplifyShot?.addEventListener('click', handleSimplifyShot);

  // Assemble & Export
  els.btnCopyVoiceover?.addEventListener('click', copyVoiceoverScript);
  els.btnExportMarkdown?.addEventListener('click', copyProjectMarkdown);
  els.btnExportJSON?.addEventListener('click', exportProjectJSON);
  els.btnPrintProject?.addEventListener('click', () => window.print());

  // Settings Modal
  els.btnSettings?.addEventListener('click', openSettings);
  els.btnCloseSettings?.addEventListener('click', closeSettings);
  els.btnSaveSettings?.addEventListener('click', saveSettings);

  // Saved Projects Modal
  els.btnSavedProjects?.addEventListener('click', openSavedProjects);
  els.btnCloseSavedProjects?.addEventListener('click', closeSavedProjects);
  els.btnNewProject?.addEventListener('click', createNewProject);
  els.btnImportJSON?.addEventListener('click', () => els.inputImportFile.click());
  els.inputImportFile?.addEventListener('change', handleImportJSON);

  // Timer
  els.btnTimerToggle?.addEventListener('click', toggleTimer);
  els.btnTimerReset?.addEventListener('click', resetTimer);
}

// ==========================================
// 4. TAB MANAGEMENT
// ==========================================

function switchTab(tabId) {
  state.activeTab = tabId;
  els.tabContents.forEach(c => {
    if (c.id === tabId) {
      c.classList.remove('hidden');
    } else {
      c.classList.add('hidden');
    }
  });

  els.navTabs.forEach(t => {
    if (t.dataset.tab === tabId) {
      t.classList.add('active', 'bg-orange-600/20', 'text-orange-400', 'border-orange-500/30');
      t.classList.remove('text-slate-400');
    } else {
      t.classList.remove('active', 'bg-orange-600/20', 'text-orange-400', 'border-orange-500/30');
      t.classList.add('text-slate-400');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 5. 3-HOUR TIMEBOX STOPWATCH
// ==========================================

function initTimer() {
  const savedTimer = localStorage.getItem(STORAGE_KEYS.TIMER);
  if (savedTimer) {
    state.timerSeconds = parseInt(savedTimer, 10) || 0;
  }
  updateTimerDisplay();
}

function toggleTimer() {
  if (state.timerRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  state.timerRunning = true;
  els.timerDot.classList.replace('bg-slate-500', 'bg-orange-400');
  els.timerPulse.classList.remove('hidden');
  els.timerIcon.setAttribute('data-lucide', 'pause');
  lucide.createIcons();

  state.timerInterval = setInterval(() => {
    state.timerSeconds++;
    localStorage.setItem(STORAGE_KEYS.TIMER, state.timerSeconds);
    updateTimerDisplay();

    // 02:30:00 (9000 seconds) Hard Rule Warning
    if (state.timerSeconds === 9000) {
      showToast('⚠️ Hard Rule: 2 Jam 30 Menit! Stop optimize & masuk editing!');
    }
  }, 1000);
}

function pauseTimer() {
  state.timerRunning = false;
  clearInterval(state.timerInterval);
  els.timerDot.classList.replace('bg-orange-400', 'bg-slate-500');
  els.timerPulse.classList.add('hidden');
  els.timerIcon.setAttribute('data-lucide', 'play');
  lucide.createIcons();
}

function resetTimer() {
  pauseTimer();
  state.timerSeconds = 0;
  localStorage.setItem(STORAGE_KEYS.TIMER, 0);
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const hrs = Math.floor(state.timerSeconds / 3600);
  const mins = Math.floor((state.timerSeconds % 3600) / 60);
  const secs = state.timerSeconds % 60;
  const pad = (n) => String(n).padStart(2, '0');
  els.timerDisplay.textContent = `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;

  // Color warning as time approaches 3h limit
  if (hrs >= 2 && mins >= 30) {
    els.timerDisplay.classList.add('text-red-400');
    els.timerDisplay.classList.remove('text-white', 'text-amber-300');
  } else if (hrs >= 2) {
    els.timerDisplay.classList.add('text-amber-300');
    els.timerDisplay.classList.remove('text-white', 'text-red-400');
  } else {
    els.timerDisplay.classList.add('text-white');
    els.timerDisplay.classList.remove('text-red-400', 'text-amber-300');
  }
}

// ==========================================
// 6. PROMPT PRESETS & MOCK DATA
// ==========================================

const SAMPLE_PACKS = {
  ants: {
    reference: "Video dokumenter tentang bagaimana koloni semut bawah tanah membangun mega-struktur rumit dengan lorong ventilasi, ruang penyimpanan, dan jembatan hidup yang terstruktur rapi melebihi arsitektur manusia.",
    theme: "dark sci-fi documentary",
    level: "A",
    assetSheet: {
      type: "world",
      title: "Subterranean World & Environment Sheet",
      prompt: "Concept art style and environment sheet of a colossal subterranean bio-megacity inside a volcanic cavern, monolithic brutalist bridges connecting organic chitin towers, glowing cyan conduits, multi-angle views and texture details, 35mm cinematic lens, rich texture, dark basalt rock, moody atmospheric haze, 8k resolution, cinematic color grade --ar 9:16 --no humans, blur",
      negativePrompt: "multiple different faces, distorted anatomy, blur, text, watermark, split framing",
      imageData: null,
      isAnchorActive: true
    },
    sourcePack: {
      subject: "Struktur koloni bawah tanah dengan arsitektur organik hiper-kompleks",
      coreIdea: "Masyarakat masa depan dan arsitektur raksasa yang terinspirasi oleh sistem koloni semut purba.",
      visualMoments: [
        "Jembatan hidup di atas jurang gelap yang saling terhubung",
        "Ventilasi raksasa dengan uap panas dan cahaya kemerahan",
        "Pusat sarang dengan kristal bercahaya dan aktivitas padat",
        "Lorong spiral tak berujung dengan perspektif skala monumental",
        "Detail macro butiran tanah dan biomekanik yang menyatu"
      ],
      storyElements: {
        character: "Dron pengawas biologis tanpa wajah",
        object: "Kubus bio-kristal bercahaya dingin",
        location: "Mega-struktur subterranean brutalist",
        action: "Pembangunan tanpa henti yang selaras secara geometris",
        transformation: "Dari kegelapan sunyi menjadi denyut kota bawah tanah yang hidup"
      },
      facts: "Koloni tidak membutuhkan pemimpin sentral; mereka berkomunikasi lewat pola kimia dan getaran mekanis mikroskopis.",
      visualDNA: {
        camera: "35mm cinematic lens, macro probe to extreme wide scale reveal",
        lighting: "Bioluminescent cyan glow with deep amber contrast in shadows",
        color: "Obsidian black, rust red, bioluminescent teal",
        texture: "Damp organic chitin, rough porous basalt rock",
        atmosphere: "Dense, humid, ancient yet ultra-futuristic"
      },
      adaptation: [
        "1. Dokumenter literal tentang koloni serangga",
        "2. Mega-kota cyberpunk bawah tanah terinspirasi sarang semut (PRIMARY DIRECTION)",
        "3. Kisah eksplorasi tim arkeolog masa depan di reruntuhan alien"
      ],
      primaryDirection: "Mega-kota cyberpunk subterranean dengan arsitektur terinspirasi sarang semut (Level A - World / Style Sheet)."
    },
    masterPack: {
      title: "THE SUBTERRANEAN MONOLITH",
      concept: "Sebuah peradaban masa depan yang membangun kota berlapis tanpa gravitasi di kedalaman bumi, terinspirasi oleh arsitektur koloni serangga purba.",
      genre: "Dark Sci-Fi Atmospheric",
      visualStyle: "Brutalist Bio-organic Photorealism",
      tone: "Monumental, Enigmatic, Meditative",
      globalVisualLock: {
        colorPalette: "Deep charcoal, oxidized copper green, warm sulfur embers",
        lightingLanguage: "Subsurface scattering, glowing vents, low-key cinematic contrast",
        cameraLanguage: "Slow deliberate creeping movements, probe lens to wide tracking",
        imageCharacter: "35mm anamorphic film texture, fine organic grain, soft falloff",
        worldRules: "Dunia selalu berada di bawah tanah; tidak pernah terlihat langit terbuka atau cahaya matahari langsung."
      }
    },
    scenes: [
      {
        number: 1,
        title: "HOOK — THE ANCIENT DESCENT",
        storyFunction: "Membuat penonton berhenti scroll dengan skala arsitektur bawah tanah yang mustahil.",
        viewerUnderstand: "Kita memasuki dunia bawah tanah yang hidup dan masif di luar nalar manusia.",
        action: "Kamera probe menelusuri retakan sempit dan perlahan meluncur masuk ke dalam rongga jurang raksasa.",
        composition: "Extreme wide downward angle",
        camera: "Slow forward push-in with vertigo tracking",
        motion: "Partikel debu bercahaya melayang perlahan ke atas akibat arus udara termal",
        lighting: "Titik cahaya cyan di kejauhan dengan bayangan hitam pekat",
        transition: "Hard cut",
        voLine: "Di bawah permukaan yang mati, peradaban tidak punah. Mereka hanya menggali lebih dalam.",
        sfx: "Low deep rumble, subtle acoustic wind whistle",
        masterFramePrompt: "Extreme wide shot of a colossal subterranean bio-megacity inside a massive volcanic cavern, monolithic brutalist bridges connecting organic towers, glowing cyan vents, floating dust particles, 35mm cinematic lens, low-key lighting, moody atmospheric haze, photorealistic, 8k resolution, cinematic color grade --ar 9:16 --no text, cartoon, blur",
        omniPrompt: "Use the attached image as absolute visual reference. Maintain same architecture, same cyan lighting, same cavern geometry. 10-second cinematic shot. Scene: Slow continuous downward camera push-in through the cavern as subtle thermal dust rises naturally. Motion: Deliberate and smooth, cloth and particles react softly to draft. Lighting: Constant bioluminescent vents, deep shadows. End frame: Camera aligns with the central colossal pillar. No warping, no sudden camera cut, no random light flashes.",
        tags: ["/PushIn", "/MacroShot", "/Cinematic", "/FogScene"]
      },
      {
        number: 2,
        title: "DISCOVERY — THE LIVING NETWORK",
        storyFunction: "Membangun pemahaman bagaimana struktur ini beroperasi secara mandiri.",
        viewerUnderstand: "Jembatan dan jalan setapak terbentuk dari material bio-sintetis yang mengalir seperti cairan.",
        action: "Kamera mengorbit pilar utama yang memiliki ribuan konduit energi bercahaya.",
        composition: "Medium architectural tracking shot",
        camera: "Slow counter-clockwise orbit",
        motion: "Denyut cahaya dingin mengalir ritmis sepanjang urat dinding pilar",
        lighting: "Subsurface amber pulse against cool basalt stone",
        transition: "Hard cut",
        voLine: "Tanpa arsitek tunggal, setiap pilar dibangun oleh jutaan unit yang bergerak dalam satu harmoni.",
        sfx: "Rhythmic hum, mechanical click of distant conduits",
        masterFramePrompt: "Medium shot of an intricate architectural pillar with pulsating amber conduits, organic fibrous materials clinging to basalt rock, 50mm cinematic lens, rich texture, atmospheric dust, warm rim lighting on dark stone --ar 9:16 --no humans, overexposure",
        omniPrompt: "Use the attached image as absolute visual reference. Maintain same pillar texture and conduit layout. 10-second shot. Camera: Smooth slow orbital movement around the central pillar. Motion: Glowing pulses of warm amber energy slowly travel downward along conduits. Steady fluid pacing. End frame: Camera reveals the junction box connecting to the next bridge. No camera jitter, no duplicate pillars.",
        tags: ["/OrbitShot", "/Cinematic"]
      },
      {
        number: 3,
        title: "ESCALATION — THE DEEP CHAMBER",
        storyFunction: "Memperluas skala dan memperkenalkan ketegangan visual yang lebih megah.",
        viewerUnderstand: "Ini bukan sekadar tambang, melainkan reaktor biologis sebesar gunung.",
        action: "Kamera bergerak maju rendah di atas jembatan sempit menuju kubah raksasa.",
        composition: "Low angle wide perspective",
        camera: "Low tracking forward dolly",
        motion: "Kabut tebal merah belerang mengepul lembut dari jurang bawah",
        lighting: "Dramatic bottom-lit sulfur amber glow",
        transition: "Hard cut",
        voLine: "Semakin dalam kau masuk, batas antara mesin dan organisme hidup semakin kabur.",
        sfx: "Heavy steam hiss, distant bass swell",
        masterFramePrompt: "Low-angle wide shot looking across a narrow suspension bridge toward a gigantic biological reactor dome emitting sulfur fog, deep cavern background, cinematic 35mm lens, high contrast, dramatic shadows --ar 9:16 --no blur, artifacts",
        omniPrompt: "Use attached image as visual anchor. Maintain identical bridge structure and amber sulfur fog. 10-second shot. Camera: Steady low-angle dolly forward along the bridge. Motion: Sulfur steam rolls gently from below the bridge deck, physically realistic fluid smoke. Lighting: Amber bottom lighting remains consistent. End frame: Camera stops just before the dome threshold. Realistic physics, no morphing.",
        tags: ["/PushIn", "/FogScene", "/Cinematic"]
      },
      {
        number: 4,
        title: "REVEAL — THE NURSERY MATRIX",
        storyFunction: "Momen kejutan visual: mengungkap apa yang sebenarnya mereka pelihara.",
        viewerUnderstand: "Mereka sedang menginkubasi inti energi baru di dalam kepompong kristal raksasa.",
        action: "Kamera mendekat perlahan ke arah kepompong transparan yang memancarkan cahaya biru murni.",
        composition: "Close-up macro tracking shot",
        camera: "Slow creeping push-in",
        motion: "Permukaan kepompong berdenyut halus seperti bernapas",
        lighting: "High-key internal teal luminescence casting shadows outward",
        transition: "Hard cut",
        voLine: "Mereka tidak sedang menggali kuburan. Mereka sedang menetaskan masa depan.",
        sfx: "Ethereal crystal resonance, subtle heartbeat sub-bass",
        masterFramePrompt: "Macro close-up shot of a translucent crystalline bio-capsule pulsing with pure teal light, intricate crystalline veins, soft depth of field, 85mm macro lens, ultra photorealistic, tactile texture --ar 9:16 --no distortion, noise",
        omniPrompt: "Use attached image as reference. Maintain crystalline structure and teal core glow. 10-second shot. Camera: Very slow forward push toward the center of the capsule. Motion: Subtle organic rhythmic pulsation of the interior glow, like breathing. Outer crystal remains solid and sharp. End frame: Internal core flares softly with golden specks. No rapid movements, stable focus.",
        tags: ["/MacroShot", "/PushIn"]
      },
      {
        number: 5,
        title: "PAYOFF — THE AWAKENING PULSE",
        storyFunction: "Klimaks visual: seluruh kota menyala serentak dalam satu gelombang energi.",
        viewerUnderstand: "Seluruh sistem bawah tanah terhubung dan mencapai kapasitas penuh.",
        action: "Kamera crane melayang mundur cepat memperlihatkan ribuan menara menyala bersamaan.",
        composition: "Monumental extreme wide angle",
        camera: "Slow backward and upward crane",
        motion: "Gelombang cahaya merambat cepat melintasi ribuan jembatan dan menara",
        lighting: "Full stadium-scale subterranean illumination, brilliant teal and gold",
        transition: "Hard cut",
        voLine: "Satu getaran. Satu denyut. Membangunkan kembali bumi yang tertidur.",
        sfx: "Massive resonant power surge chime, epic cinema riser",
        masterFramePrompt: "Monumental wide shot of an entire subterranean metropolis blazing with golden and teal lights across thousands of bridges and towers, epic scale, 24mm anamorphic lens, haze, clean masterpiece --ar 9:16 --no blurry spots",
        omniPrompt: "Use attached image as absolute reference. Maintain entire city geometry. 10-second shot. Camera: Majestic slow crane upward and backward. Motion: Cascading wave of light illuminates tower after tower in a fluid sweep across the cavern. Physically accurate light spread. End frame: Whole cavern is gloriously illuminated. No flickering, no camera jump.",
        tags: ["/Cinematic", "/FPVFlyThrough"]
      },
      {
        number: 6,
        title: "ENDING / LOOP — THE RETURNING ECHO",
        storyFunction: "Penutup emosional yang menyambungkan visual kembali ke scene 01 agar looping mulus.",
        viewerUnderstand: "Siklus ini abadi dan terus berputar di bawah kaki kita.",
        action: "Kamera mundur menembus retakan sempit batu basalt, kembali ke permukaan sunyi di awal.",
        composition: "Macro reverse pull through rock aperture",
        camera: "Smooth backward pull-out",
        motion: "Cahaya kota perlahan terhalang oleh celah batu hingga menyisakan satu titik biru",
        lighting: "Fading silhouette into basalt blackness, single pinpoint cyan light",
        transition: "Seamless match-cut loop to Scene 01",
        voLine: "Dan di atas sana... tak seorang pun menyadari.",
        sfx: "Sound fades into muffled subterranean echo, wind whisper",
        masterFramePrompt: "Framed shot looking through a narrow dark basalt fissure in rock, a single bright cyan light pulsing deep inside, dark silhouette foreground, 35mm lens, mysterious and calm, cinematic loop framing --ar 9:16 --no text",
        omniPrompt: "Use attached image as reference. Maintain exact fissure silhouette. 10-second shot. Camera: Smooth slow pull back through the narrow rock opening into darkness. Motion: The distant cyan glow slowly shrinks to a gentle pinpoint ember. End frame: Frame matches the exact entrance perspective of Scene 01 for a seamless looping video. Stable motion, graceful fade.",
        tags: ["/PushIn", "/Cinematic"]
      }
    ]
  },

  astronaut: {
    reference: "Kisah astronaut solo yang mendarat di planet gurun merah dan menemukan monolit kristal yang merefleksikan bayangan bumi masa lalu.",
    theme: "dark sci-fi documentary",
    level: "B",
    assetSheet: {
      type: "character",
      title: "Solo Astronaut Character Turnaround Sheet",
      prompt: "Character turnaround model sheet of a lone deep-space astronaut in a weathered white and slate-grey exploration pressure suit with matte gold reflective helmet visor, multiple angles showing front view, 3/4 view, and profile view, clean neutral desert studio lighting, high resolution photorealistic render, 8k, Unreal Engine 5 aesthetic, cinematic character concept --ar 9:16 --no multiple people, deformed limbs",
      negativePrompt: "cartoon, distorted helmet, deformed fingers, extra limbs",
      imageData: null,
      isAnchorActive: true
    },
    sourcePack: {
      subject: "Astronaut dan monolit kristal di gurun planet merah",
      coreIdea: "Pertemuan antara kesunyian kosmis dan memori bumi yang terpantul di kristal purba.",
      visualMoments: [
        "Astronaut berjalan lambat melawan badai debu merah lembut",
        "Refleksi helm astronaut menangkap bayangan monolit",
        "Tangan astronaut menyentuh permukaan kristal yang dingin",
        "Monolit membiaskan aurora cahaya ke angkasa senja",
        "Dua matahari terbenam bersamaan di cakrawala merah"
      ],
      storyElements: {
        character: "Astronaut dengan spacesuit putih lusuh dan visor emas",
        object: "Monolit kristal hitam monolitik",
        location: "Gurun pasir merah Mars-like",
        action: "Pencarian dan penemuan sinyal",
        transformation: "Dari keputusasaan menjadi kedamaian kosmis"
      },
      facts: "Planet tanpa angin kencang menghasilkan debu mikro yang melayang sangat lambat.",
      visualDNA: {
        camera: "35mm anamorphic, low angle tracking shot, subtle handheld micro-movement",
        lighting: "Low sunset golden hour from camera-right, long warm shadows",
        color: "Rust red, gold highlight, deep space navy sky",
        texture: "Fine red powder dust, matte fabric suit, mirror reflective visor",
        atmosphere: "Deadly silent, lonely, grand, poetic"
      },
      adaptation: [
        "1. Film survival astronaut realistis",
        "2. Puisi visual sinematik fiksi ilmiah (PRIMARY DIRECTION)",
        "3. Trailer video game petualangan antariksa"
      ],
      primaryDirection: "Puisi visual sinematik astronaut solo (Level B - Character Lock & Style Lock)."
    },
    masterPack: {
      title: "SOLITARY HORIZON",
      concept: "Astronaut terakhir menyeberangi gurun debu merah untuk mengantarkan kapsul memori bumi ke monolit kosmis.",
      genre: "Cinematic Sci-Fi",
      visualStyle: "Interstellar-grade Photorealism",
      tone: "Poetic, Isolated, Awe-inspiring",
      globalVisualLock: {
        colorPalette: "Mars terracotta, sunlit gold, pristine titanium white, deep cosmic obsidian",
        lightingLanguage: "Harsh low sunset, razor sharp shadows, golden rim light on helmet",
        cameraLanguage: "Subtle handheld drift, 35mm and 50mm cinematic lenses",
        imageCharacter: "Authentic 70mm IMAX film stock texture, fine organic grain",
        worldRules: "Karakter selalu memakai spacesuit yang sama persis; visor helm selalu merefleksikan lingkungan sekitar secara realistis."
      }
    },
    scenes: [
      {
        number: 1,
        title: "HOOK — THE FOOTSTEP IN DUST",
        storyFunction: "Mengunci atensi dengan boot astronaut yang menginjak debu tak berjejak.",
        viewerUnderstand: "Seseorang baru saja mendarat di dunia asing yang tak berpenghuni.",
        action: "Boot astronaut mendarat perlahan di tanah berdebu merah, memicu gelombang debu halus.",
        composition: "Ground-level macro low angle",
        camera: "Static low angle with subtle handheld breath",
        motion: "Debu merah melayang lambat secara hiper-realistis",
        lighting: "Golden low sunset skimming the ground",
        transition: "Hard cut",
        voLine: "Empat ratus hari perjalanan... hanya untuk satu langkah ini.",
        sfx: "Muffled radio breath, crunch of foreign soil, deep wind drone",
        masterFramePrompt: "Ground-level low angle macro shot of an astronaut's heavy white boot stepping onto pristine red desert dust, fine red sand reacting into slow motion spray, golden sunset rim light, 35mm film lens, photorealistic 8k, cinematic depth of field --ar 9:16 --no blur, text",
        omniPrompt: "Use attached image as absolute reference. Maintain same white boot texture and red sand. 10-second shot. Camera: Locked low-angle camera. Motion: The astronaut's boot steps firmly onto the dust, lifting a realistic cloud of fine red dust particles that drift gently to the right. Pacing is natural and heavy. End frame: Boot settles, dust settles softly. Physically realistic gravity, no morphing.",
        tags: ["/MacroShot", "/GoldenHour", "/Cinematic"]
      },
      {
        number: 2,
        title: "DISCOVERY — THE ENDLESS DUNE",
        storyFunction: "Menampilkan kesendirian karakter dan skala alam yang luar biasa masif.",
        viewerUnderstand: "Astronaut berjalan sendirian menuju struktur di kejauhan.",
        action: "Astronaut berjalan lambat dari foreground menyusuri punggung bukit pasir.",
        composition: "Wide shot tracking astronaut from behind",
        camera: "Slow forward tracking dolly",
        motion: "Kain spacesuit bergerak lembut tertiup angin sepoi",
        lighting: "Warm low-angle sun casting a 20-meter shadow to the left",
        transition: "Hard cut",
        voLine: "Tidak ada peta. Hanya kompas gravitasi dan keyakinan.",
        sfx: "Gentle suit fabric rustle, soft radio hum",
        masterFramePrompt: "Wide cinematic shot following a lone astronaut in a detailed white spacesuit walking along the crest of a massive red sand dune, vast red desert landscape stretching to horizon, twin suns setting, 35mm lens --ar 9:16 --no multiple characters",
        omniPrompt: "Use attached image as reference. Maintain same astronaut suit and desert horizon. 10-second shot. Camera: Slow smooth dolly forward following behind the astronaut at a walking pace. Motion: Natural deliberate walking gait in low gravity, subtle cloth reaction to breeze. End frame: A dark silhouette appears at the far horizon. Realistic physics, no sudden camera turn.",
        tags: ["/PushIn", "/GoldenHour"]
      },
      {
        number: 3,
        title: "ESCALATION — THE TOWERING SHADOW",
        storyFunction: "Menghadirkan skala monolit raksasa yang menantang nalar.",
        viewerUnderstand: "Struktur itu jauh lebih besar daripada yang diperkirakan.",
        action: "Astronaut mendongak menatap monolit hitam pekat yang menjulang ke langit.",
        composition: "Low angle looking up past astronaut's shoulder",
        camera: "Slow tilt up from astronaut's helmet to top of monolith",
        motion: "Cahaya langit senja bergeser lambat melintasi sudut monolit",
        lighting: "Extreme contrast: black basalt monolith against burning orange sunset",
        transition: "Hard cut",
        voLine: "Ketika kita menemukannya, kita baru sadar betapa kecilnya kita.",
        sfx: "Resonant metal hum, rising cinematic cello",
        masterFramePrompt: "Extreme low-angle shot from behind astronaut's shoulder looking up at a towering obsidian black monolith reaching into a star-filled dusky orange sky, cinematic composition, photorealistic --ar 9:16 --no distortion",
        omniPrompt: "Use attached image as reference. Maintain monolith proportions and astronaut suit. 10-second shot. Camera: Slow continuous vertical tilt up from the back of the helmet along the razor-sharp edge of the monolith toward the stars. Pacing is awe-inspiring. End frame: Top edge of monolith aligns with the brightest star. Stable camera, zero warping.",
        tags: ["/PushIn", "/Cinematic"]
      },
      {
        number: 4,
        title: "REVEAL — THE VISOR MIRROR",
        storyFunction: "Momen intim emosional: pantulan bumi di visor emas helm.",
        viewerUnderstand: "Monolit tersebut memproyeksikan memori bumi yang hijau ke mata sang astronaut.",
        action: "Kamera close-up ekstrem pada visor helm astronaut yang merefleksikan lautan biru bumi.",
        composition: "Macro close-up on gold mirrored visor",
        camera: "Slow creeping push-in on the visor",
        motion: "Pantulan awan putih dan lautan biru berputar lembut di kelengkungan kaca visor",
        lighting: "Cool blue reflection contrasting with warm red helmet rim light",
        transition: "Hard cut",
        voLine: "Ia tidak memperlihatkan masa depan. Ia mengingatkan kita pada rumah.",
        sfx: "Gentle ocean wave sound inside helmet audio, soft piano note",
        masterFramePrompt: "Extreme close-up macro shot of astronaut's gold reflective helmet visor, reflecting a pristine green and blue Earth floating in void, warm sunset rim lighting on helmet collar, 85mm portrait lens, breathtaking clarity --ar 9:16 --no scratches, artifacts",
        omniPrompt: "Use attached image as visual reference. Maintain exact helmet design and visor shape. 10-second shot. Camera: Micro push-in toward the reflection on the visor surface. Motion: The reflected Earth clouds swirl gently inside the reflection, helmet stays stable with gentle breathing movement. End frame: Earth reflection centers in frame. No face distortion, photorealistic reflections.",
        tags: ["/MacroShot", "/PushIn"]
      },
      {
        number: 5,
        title: "PAYOFF — THE TOUCH OF LIGHT",
        storyFunction: "Aksi puncak: astronaut menyentuh monolit dan gelombang cahaya meledak lembut.",
        viewerUnderstand: "Transmisi data berhasil, monolit menyala merespons manusia.",
        action: "Sarung tangan astronaut menyentuh permukaan monolit, memicu gelombang riak emas.",
        composition: "Medium close-up side angle",
        camera: "Slight handheld drift maintaining focus on fingertips",
        motion: "Riak cahaya emas menjalar dari ujung jari ke seluruh dinding monolit",
        lighting: "Bright warm golden pulse illuminating astronaut's faceplate",
        transition: "Hard cut",
        voLine: "Pesan telah terkirim.",
        sfx: "Glass ring chime, warm energy blast, triumphant choir whisper",
        masterFramePrompt: "Medium shot of astronaut's gloved hand resting against a smooth black monolith surface, radiant golden ripple rings propagating outward from the contact point, illuminating the astronaut in warm light, 50mm cinema lens --ar 9:16 --no distorted hands, 5 fingers only",
        omniPrompt: "Use attached image as absolute reference. Maintain exactly 5 fingers on glove, same suit texture. 10-second shot. Camera: Stable medium shot. Motion: Glove stays in contact with stone as glowing golden ripple rings expand smoothly and rhythmically across the stone surface. Gentle atmospheric glow reacts on the suit. End frame: Entire monolith edge glows gold. No warped fingers, clean motion.",
        tags: ["/GoldenHour", "/Cinematic"]
      },
      {
        number: 6,
        title: "ENDING / LOOP — THE STARLIT RETREAT",
        storyFunction: "Penutup siklus: astronaut berbalik berjalan kembali saat bintang malam muncul.",
        viewerUnderstand: "Misi selesai, sang pengelana melanjutkan perjalanannya di bawah langit bintang.",
        action: "Astronaut berjalan menjauh dari kamera kembali ke arah bukit pasir pertama.",
        composition: "Wide shot tracking astronaut walking away",
        camera: "Slow pull-back letting astronaut walk into distance",
        motion: "Bintang-bintang di langit gurun mulai berpendar terang",
        lighting: "Dusk turning to deep indigo twilight with footprints glowing faintly",
        transition: "Seamless match-cut loop to Scene 01 footprint",
        voLine: "Waktunya pulang.",
        sfx: "Wind whispers, subtle heartbeat fades to silence",
        masterFramePrompt: "Wide cinematic shot of astronaut walking away into a deep starry purple dusk on red sand, footprints trailing behind, tranquil and iconic composition, 35mm film stock, masterpiece --ar 9:16 --no multiple figures",
        omniPrompt: "Use attached image as reference. Maintain same astronaut suit and desert path. 10-second shot. Camera: Slow graceful pull-back as the astronaut walks away into the distance. Motion: Natural walking pace away from camera, footprints remain clean in the sand. End frame: Camera rests on a fresh footprint in the foreground ready to loop back to Scene 01. Smooth fade.",
        tags: ["/Cinematic", "/GoldenHour"]
      }
    ]
  },

  perfume: {
    reference: "Iklan luxury komersial untuk parfum mewah berbasis bahan alam amber dan mawar hitam di istana marmer Venesia.",
    theme: "luxury commercial",
    level: "C",
    assetSheet: {
      type: "object",
      title: "Luxury Perfume Bottle Turntable Sheet",
      prompt: "Product turntable 360 reference sheet of a luxury rectangular faceted crystal perfume bottle with textured gold octagonal cap, amber liquid inside, multi-angle product design showing front angle, 45 degree hero angle, and top view, black marble pedestal with gold veins, razor-sharp studio caustics, ultra luxury commercial photography --ar 9:16 --no distorted glass, extra caps",
      negativePrompt: "distorted glass, blurry, low quality, warped labels",
      imageData: null,
      isAnchorActive: true
    },
    sourcePack: {
      subject: "Botol parfum kristal kaca bersudut tajam dengan esensi amber mawar",
      coreIdea: "Kemewahan abadi yang menggabungkan keanggunan marmer klasik dan cairan wangi yang berkilau.",
      visualMoments: [
        "Tetesan cairan amber jatuh ke atas marmer hitam dengan riak lambat",
        "Kelopak mawar beludru hitam tersapu kabut emas",
        "Botol parfum kristal diputar perlahan di atas alas cermin air",
        "Refleksi cahaya chandelier pada botol bersudut berlian",
        "Semprotan mist mikro berhamburan dalam gerak lambat ekstrem"
      ],
      storyElements: {
        character: "Model anggun dengan gaun satin sutra hitam",
        object: "Botol parfum kristal persegi dengan tutup emas bertekstur",
        location: "Istana marmer klasik Eropa dengan jendela lengkung",
        action: "Aroma memikat yang mengubah ruangan sunyi menjadi simfoni emas",
        transformation: "Dari tetesan tunggal menjadi semprotan mewah yang memikat"
      },
      facts: "Kemewahan visual diciptakan dari rasio kontras tinggi antara marmer gelap dan cairan hangat bercahaya.",
      visualDNA: {
        camera: "Macro probe lens, buttery smooth gimbal rotation, 100fps slow motion feeling",
        lighting: "Warm directional golden key light, soft diffused fill, luxury jewelry studio look",
        color: "Obsidian black, liquid amber gold, deep crimson rose",
        texture: "Heavy faceted crystal glass, cold vein marble, velvet silk petals",
        atmosphere: "Opulent, sensual, pristine, ultra-expensive"
      },
      adaptation: [
        "1. Iklan komersial TV luxury 60 detik (PRIMARY DIRECTION)",
        "2. Visualizer fashion brand haute couture",
        "3. Estetika cinematic editorial Vogue"
      ],
      primaryDirection: "Iklan komersial luxury 60 detik (Level C - Product + Character + Location Sheet)."
    },
    masterPack: {
      title: "AMBRE NOIR — THE ESSENCE",
      concept: "Sebuah perjalanan visual menembus keheningan marmer Venesia menuju inti dari parfum legendaris.",
      genre: "Luxury Commercial",
      visualStyle: "High-end Fashion Film / Commercial Grade",
      tone: "Sensual, Elegant, Flawless",
      globalVisualLock: {
        colorPalette: "Rich gold, obsidian black, rosewood velvet, pristine water crystal",
        lightingLanguage: "Prismatic caustics, soft luxury rim lighting, warm golden highlights",
        cameraLanguage: "Fluid slow motion, precision macro pushes, seamless rotational cuts",
        imageCharacter: "Flawless commercial sharpness, clean highlights, zero digital noise",
        worldRules: "Bentuk botol parfum persegi dengan tutup emas segi delapan harus selalu identik di setiap scene; tidak boleh ada perubahan bentuk atau label."
      }
    },
    scenes: [
      {
        number: 1,
        title: "HOOK — THE DROPLET OF GOLD",
        storyFunction: "Menarik perhatian dengan kepuasan visual tetesan amber yang memantul di marmer.",
        viewerUnderstand: "Kita menyaksikan penciptaan wewangian paling berharga.",
        action: "Satu tetes cairan amber kental jatuh dalam ultra-slow-motion ke atas marmer hitam berurat emas.",
        composition: "Extreme macro top-down to 45 degree angle",
        camera: "Slow creeping push-in on the impact point",
        motion: "Tetesan membentuk riak sempurna dengan percikan mikro keemasan",
        lighting: "Dramatic golden spotlight against polished dark marble",
        transition: "Hard cut",
        voLine: "Setiap aroma dimulai dari satu titik keabadian.",
        sfx: "Crisp liquid drop resonance, warm ambient synth chord",
        masterFramePrompt: "Extreme macro shot of a luminous amber liquid droplet suspended a millimeter above polished black marble with gold veins, studio lighting, razor sharp caustics, 100mm macro lens, ultra luxury commercial --ar 9:16 --no blur, text",
        omniPrompt: "Use attached image as visual reference. Maintain exact black marble with gold veins. 10-second shot. Camera: Slow descending push toward the drop. Motion: The amber droplet lands gracefully, forming a pristine fluid ripple that expands smoothly across the marble. Physically accurate liquid physics, pristine slow motion. End frame: The ripple surface settles into a mirror finish. No morphing, flawless reflections.",
        tags: ["/MacroShot", "/LuxuryProduct", "/PushIn"]
      },
      {
        number: 2,
        title: "DISCOVERY — THE VELVET PETAL",
        storyFunction: "Memperkenalkan elemen alami: mawar hitam beludru yang menyatu dengan esensi.",
        viewerUnderstand: "Bahan parfum berasal dari mawar langka yang diawetkan dalam kemewahan.",
        action: "Kamera probe meluncur melewati kelopak mawar hitam beludru yang bertabur embun madu.",
        composition: "Macro tracking along petal edge",
        camera: "Smooth forward probe tracking",
        motion: "Embun mikro berkilauan saat cahaya menyapu kelopak",
        lighting: "Warm golden backlight highlighting delicate velvet hair textures",
        transition: "Hard cut",
        voLine: "Mawar hitam yang hanya mekar di bawah sinar senja.",
        sfx: "Subtle soft velvet brush, delicate sparkle tone",
        masterFramePrompt: "Macro probe lens shot navigating between deep crimson and black velvet rose petals with glistening micro dew drops, warm golden backlight, shallow depth of field, high-fashion editorial --ar 9:16 --no plastic texture",
        omniPrompt: "Use attached image as reference. Maintain velvety rose petal texture and dew droplets. 10-second shot. Camera: Smooth creeping probe movement gliding along the curved edge of the petal. Motion: Soft ambient breeze makes the petal edge sway imperceptibly, light refracts naturally through dew drops. End frame: Camera reveals the silhouette of the perfume bottle behind the flower. Stable motion, luxury aesthetics.",
        tags: ["/MacroShot", "/LuxuryProduct"]
      },
      {
        number: 3,
        title: "ESCALATION — THE CRYSTAL REVEAL",
        storyFunction: "Memperlihatkan botol parfum untuk pertama kali dengan pantulan cahaya dramatis.",
        viewerUnderstand: "Botol parfum ini adalah mahakarya seni dengan kaca faset tebal.",
        action: "Kamera mengorbit botol parfum kaca persegi yang berputar perlahan di atas air tenang.",
        composition: "Medium shot low angle hero perspective",
        camera: "Smooth 180-degree orbital motion",
        motion: "Cairan amber di dalam botol bergoyang anggun saat botol berputar",
        lighting: "Glistening prismatic light beams radiating through the crystal corners",
        transition: "Hard cut",
        voLine: "Terbungkus dalam kristal murni yang membiaskan cahaya seribu malam.",
        sfx: "Glass ring harmonic, deep luxury bass swell",
        masterFramePrompt: "Hero medium shot of a luxury rectangular faceted crystal perfume bottle with a textured gold octagonal cap, resting on dark still water reflecting amber caustics, soft warm studio lighting, 50mm lens --ar 9:16 --no distorted bottle, no text errors",
        omniPrompt: "Use attached image as absolute reference. Maintain exact square bottle shape and gold octagonal cap. 10-second shot. Camera: Slow luxurious orbital movement around the bottle. Motion: The bottle rotates slowly on the water surface as internal amber perfume liquid swirls gently. Prismatic light reflections play across the facets. End frame: Bottle faces directly toward camera. Perfectly consistent product geometry.",
        tags: ["/OrbitShot", "/LuxuryProduct", "/Cinematic"]
      },
      {
        number: 4,
        title: "REVEAL — THE SILK ENCOUNTER",
        storyFunction: "Memperkenalkan interaksi manusia dengan produk secara anggun tanpa berlebihan.",
        viewerUnderstand: "Seorang wanita elegan mengangkat botol parfum ke leher jenjangnya.",
        action: "Tangan lentik mengenakan cincin emas minimalis mengangkat botol parfum mendekati lehernya.",
        composition: "Close-up portrait side angle",
        camera: "Slow tilt up from hand to collarbone",
        motion: "Kain satin hitam gaun berdesir halus mengikuti gerakan tubuh",
        lighting: "Soft warm beauty lighting with deep shadow separation",
        transition: "Hard cut",
        voLine: "Sentuhan pertama yang mengubah segalanya.",
        sfx: "Soft satin whisper, elegant breath intake",
        masterFramePrompt: "Close-up side angle of an elegant woman in a black silk gown gently holding the luxury square perfume bottle near her collarbone, warm cinematic beauty lighting, flawless skin, 85mm portrait lens --ar 9:16 --no deformed hands, exactly 5 fingers",
        omniPrompt: "Use attached image as reference. Maintain model identity, exact bottle shape, and black silk dress. 10-second shot. Camera: Slow gentle tilt upward following the movement of the hand toward the collarbone. Motion: Subtle graceful hand gesture, fingers hold the bottle naturally and securely. End frame: Her thumb rests lightly on the golden atomizer. Natural human performance, no hand warping.",
        tags: ["/LuxuryProduct", "/Cinematic"]
      },
      {
        number: 5,
        title: "PAYOFF — THE GOLDEN ATOMIZATION",
        storyFunction: "Momen hero paling memuaskan: semprotan mikro-mist dalam gerak lambat ekstrem.",
        viewerUnderstand: "Pelepasan aroma yang menyelimuti seluruh ruangan dengan kilau emas.",
        action: "Atomizer ditekan, melepaskan awan semprotan mikro parfum yang berkilau seperti debu emas.",
        composition: "Extreme macro side profile of nozzle",
        camera: "Slow tracking along the expanding mist cloud",
        motion: "Ribuan partikel mist mikro menyebar perlahan dalam kurva aerodinamis yang indah",
        lighting: "Backlit by a brilliant golden spotlight catching every single micro-droplet",
        transition: "Hard cut",
        voLine: "Ambre Noir.",
        sfx: "Crisp micro-spray hiss in slow motion, crescendo orchestral chime",
        masterFramePrompt: "Extreme macro shot of the golden perfume nozzle discharging a cloud of luminous amber mist droplets, illuminated by golden rim light against velvet dark background, high-speed photography look --ar 9:16 --no blur, noise",
        omniPrompt: "Use attached image as reference. Maintain gold nozzle texture. 10-second shot. Camera: Smooth forward drift alongside the spray cloud. Motion: The spray bursts softly and expands into a mesmerizing cloud of golden suspended mist particles, drifting slowly across the frame. End frame: The mist envelops the frame in a warm golden haze. Flawless particle physics.",
        tags: ["/MacroShot", "/LuxuryProduct"]
      },
      {
        number: 6,
        title: "ENDING / LOOP — THE MONUMENTAL STAND",
        storyFunction: "Penutup ikonik dengan logo/botol yang berdiri megah dan siap looping kembali.",
        viewerUnderstand: "Produk ini adalah puncak kemewahan yang tak lekang oleh waktu.",
        action: "Kamera mundur memperlihatkan botol parfum berdiri di podium marmer saat embun emas mengendap.",
        composition: "Centered symmetrical luxury hero shot",
        camera: "Slow backward dolly",
        motion: "Embun emas terakhir mengendap kembali menjadi satu tetesan kecil di atas marmer",
        lighting: "Warm golden glow bathing the entire marble podium",
        transition: "Seamless match-cut loop to Scene 01 droplet",
        voLine: "Abadi. Tak terlupakan.",
        sfx: "Resonant chime fades into deep echo",
        masterFramePrompt: "Symmetrical hero shot of the luxury square perfume bottle standing on a black marble pedestal with a single golden droplet forming at the base, elegant studio backdrop, 50mm lens, iconic commercial masterpiece --ar 9:16 --no text overlay",
        omniPrompt: "Use attached image as reference. Maintain bottle and marble podium. 10-second shot. Camera: Slow majestic pull-back centering the bottle. Motion: The golden mist gently settles down, converging into a single shining droplet on the marble pedestal. End frame: Frame matches the exact composition of Scene 01's starting droplet. Perfect loop.",
        tags: ["/LuxuryProduct", "/Cinematic"]
      }
    ]
  }
};

function applyPreset(presetKey) {
  const pack = SAMPLE_PACKS[presetKey];
  if (!pack) return;

  els.inputReference.value = pack.reference;
  els.selectTheme.value = pack.theme;
  state.project.sourceInput = pack.reference;
  state.project.theme = pack.theme;
  state.project.continuityLevel = pack.level;
  state.project.sourcePack = pack.sourcePack;
  state.project.masterPack = pack.masterPack;
  state.project.scenes = pack.scenes;
  state.project.title = pack.masterPack.title;
  state.project.soundtrack = generateSmartSoundtrack(pack.masterPack, pack.scenes);
  state.project.assetSheet = pack.assetSheet 
    ? JSON.parse(JSON.stringify(pack.assetSheet)) 
    : generateDefaultAssetSheet(pack.masterPack, pack.level, pack.sourcePack);

  saveCurrentProject();
  renderAll();
  showToast(`Preset "${presetKey.toUpperCase()}" berhasil dimuat!`);
}

// ==========================================
// 7. GEMINI API & LOGIC CONTROLLERS
// ==========================================

function updateApiBadge() {
  if (state.apiKey && state.apiKey.trim().length > 10) {
    els.apiStatusBadge.classList.replace('bg-amber-400', 'bg-emerald-400');
    els.apiStatusBadge.title = 'Gemini API Terhubung (Live)';
  } else {
    els.apiStatusBadge.classList.replace('bg-emerald-400', 'bg-amber-400');
    els.apiStatusBadge.title = 'Mode Bawaan / Demo (Tanpa API Key)';
  }
}

async function callGemini(promptText, systemInstruction = '', inlineDataParts = []) {
  if (!state.apiKey || state.apiKey.trim().length < 10) {
    // Return null to indicate offline mock fallback should be used
    return null;
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${state.model}:generateContent?key=${encodeURIComponent(state.apiKey.trim())}`;

  const parts = [{ text: promptText }];
  if (inlineDataParts && inlineDataParts.length > 0) {
    inlineDataParts.forEach(p => parts.push(p));
  }

  const payload = {
    contents: [
      {
        parts: parts
      }
    ]
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const errMsg = errData?.error?.message || `HTTP error ${res.status}`;
    if (errMsg.includes('no longer available') || errMsg.includes('not found') || errMsg.includes('is not supported')) {
      if (state.model !== 'gemini-3.8-flash') {
        state.model = 'gemini-3.8-flash';
        localStorage.setItem(STORAGE_KEYS.MODEL, 'gemini-3.8-flash');
        return callGemini(promptText, systemInstruction, inlineDataParts);
      }
    }
    throw new Error(errMsg);
  }

  const data = await res.json();
  const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return textOutput;
}

// Handler: Generate Source Pack (Phase 1)
async function handleGenerateSourcePack() {
  const input = els.inputReference.value.trim();
  const hasImage = !!(state.project.imageReference && state.project.imageReference.data);

  if (!input && !hasImage) {
    showToast('Silakan masukkan referensi teks atau upload foto referensi!');
    return;
  }

  const theme = els.selectTheme.value === 'custom' ? els.inputCustomTheme.value : els.selectTheme.value;
  state.project.sourceInput = input;
  state.project.theme = theme;

  els.btnGenerateSourcePack.disabled = true;
  els.btnGenerateSourcePack.innerHTML = `<span class="animate-spin inline-block mr-2">⏳</span> Mengekstrak Informasi Visual...`;
  els.sourcePackStatus.textContent = 'Memproses...';

  try {
    let sourcePackData = null;

    if (state.apiKey && state.apiKey.trim().length > 10) {
      // Live Gemini Multimodal Call
      const sysPrompt = `You are an elite creative AI Director specialized in 60-second viral short video production. Your goal is to analyze reference material (text and/or reference image) and extract a compressed, high-density SOURCE PACK according to the Master Flow guidelines. Respond strictly with valid JSON conforming to the requested schema.`;
      
      const userPrompt = `Analyze this reference for a 60-second AI Short Video.
Reference Text: "${input || '(Lihat foto referensi terlampir)'}"
Theme constraint: "${theme}"
${hasImage ? 'CRITICAL: A visual reference image is attached. Closely inspect the image (subject appearance, colors, lighting, textures, environment, materials, product design) and ensure the SOURCE PACK and future scenes strictly align with this visual anchor.' : ''}

Extract the SOURCE PACK. Output ONLY a valid JSON object matching this exact structure:
{
  "subject": "Main subject or object",
  "coreIdea": "One sentence explaining core concept",
  "visualMoments": ["Moment 1", "Moment 2", "Moment 3", "Moment 4", "Moment 5"],
  "storyElements": {
    "character": "Main character description or none",
    "object": "Key props or hero object",
    "location": "Setting architecture/environment",
    "action": "Core action",
    "transformation": "Payoff or transformation"
  },
  "facts": "Key factual or educational info to preserve (1-2 sentences)",
  "visualDNA": {
    "camera": "Lens and movement style",
    "lighting": "Lighting language and contrast",
    "color": "Color palette and tone",
    "texture": "Surfaces and materials",
    "atmosphere": "Mood and feel"
  },
  "adaptation": [
    "Option 1",
    "Option 2",
    "Option 3 (PRIMARY DIRECTION)"
  ],
  "primaryDirection": "Recommended primary angle"
}`;

      let inlineParts = [];
      if (hasImage) {
        inlineParts.push({
          inlineData: {
            mimeType: state.project.imageReference.mimeType || 'image/jpeg',
            data: state.project.imageReference.data
          }
        });
      }

      const rawJson = await callGemini(userPrompt, sysPrompt, inlineParts);
      if (rawJson) {
        const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
        sourcePackData = JSON.parse(cleaned);
      }
    }

    // Fallback if no API key or parse error: Smart Dynamic Generator
    if (!sourcePackData) {
      sourcePackData = generateSmartSourcePack(input, theme);
    }

    state.project.sourcePack = sourcePackData;
    saveCurrentProject();
    renderSourcePackUI();
    showToast('Source Pack berhasil dibuat!');
  } catch (err) {
    console.error(err);
    showToast(`Error: ${err.message}. Menggunakan generator pintar bawaan.`);
    state.project.sourcePack = generateSmartSourcePack(input, theme);
    saveCurrentProject();
    renderSourcePackUI();
  } finally {
    els.btnGenerateSourcePack.disabled = false;
    els.btnGenerateSourcePack.innerHTML = `<i data-lucide="sparkles" class="w-4 h-4"></i><span>ANALISIS & BUAT SOURCE PACK</span>`;
    els.sourcePackStatus.textContent = 'Selesai';
    lucide.createIcons();
  }
}

// Handler: Generate Master Production Pack (Phase 2 & 3)
async function handleGenerateProductionPack() {
  if (!state.project.sourcePack) {
    showToast('Selesaikan Fase 1 (Source Pack) terlebih dahulu!');
    return;
  }

  els.btnBuildProductionPack.disabled = true;
  els.btnBuildProductionPack.innerHTML = `<span class="animate-spin inline-block mr-2">⏳</span> Merancang 6 Scene Production Pack...`;

  try {
    let masterData = null;
    let scenesData = null;

    if (state.apiKey && state.apiKey.trim().length > 10) {
      const sysPrompt = `You are a Hollywood-grade Creative Director and AI Prompt Engineer. Build a Master Production Pack and 6-Scene sequence for Google Flow / Gemini Omni 1.1 and Image Generation following the exact MASTER FLOW rules:
- Format: 9:16 vertical, exactly 6 scenes, 10s each, total ~60s.
- Narrative arc: Scene 1: Hook, Scene 2: Discovery, Scene 3: Escalation, Scene 4: Reveal, Scene 5: Payoff, Scene 6: Ending/Loop.
- Prompts must be production-ready and highly structured.
Respond strictly in valid JSON.`;

      const userPrompt = `Create the Master Production Pack and 6 Scenes based on this Source Pack:
${JSON.stringify(state.project.sourcePack, null, 2)}
Continuity Level: ${state.project.continuityLevel}
Theme: ${state.project.theme}

Output ONLY valid JSON matching this schema:
{
  "masterPack": {
    "title": "Title of the short",
    "concept": "One sentence concept",
    "genre": "Genre",
    "visualStyle": "Visual style description",
    "tone": "Tone and mood",
    "globalVisualLock": {
      "colorPalette": "Color description",
      "lightingLanguage": "Lighting rules",
      "cameraLanguage": "Camera rules",
      "imageCharacter": "Film stock/image feel",
      "worldRules": "Unbreakable world constraints"
    }
  },
  "scenes": [
    {
      "number": 1,
      "title": "HOOK — [NAME]",
      "storyFunction": "Why this hooks viewer in first 2s",
      "viewerUnderstand": "What viewer understands",
      "action": "Single hero action",
      "composition": "Shot composition",
      "camera": "Camera movement and lens",
      "motion": "Physics and particle motion",
      "lighting": "Scene lighting",
      "transition": "Hard cut or visual bridge",
      "voLine": "Voiceover sentence in Indonesian or English",
      "sfx": "Audio and SFX cue",
      "masterFramePrompt": "Subject + Action + Environment + Composition + Camera + Lighting + Style + Negative --ar 9:16",
      "omniPrompt": "Use the attached image as absolute visual reference. 10-second shot. Scene: ... Camera: ... Motion: ... Lighting: ... End frame: ... No warping, no morphing.",
      "tags": ["/PushIn", "/MacroShot"]
    }
    // ... exactly 6 scenes total
  ]
}`;

      const rawJson = await callGemini(userPrompt, sysPrompt);
      if (rawJson) {
        const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        masterData = parsed.masterPack;
        scenesData = parsed.scenes;
      }
    }

    if (!masterData || !scenesData) {
      const generated = generateSmartMasterAndScenes(state.project.sourcePack, state.project.theme, state.project.continuityLevel);
      masterData = generated.masterPack;
      scenesData = generated.scenes;
    }

    state.project.masterPack = masterData;
    state.project.scenes = scenesData;
    state.project.title = masterData.title;

    // Auto-generate Soundtrack & Music Prompt (Suno / Udio) alongside 6 scenes
    try {
      state.project.soundtrack = await generateSoundtrackSpec(masterData, scenesData);
    } catch (e) {
      state.project.soundtrack = generateSmartSoundtrack(masterData, scenesData);
    }

    // Auto-prepare Master Asset Sheet for Visual Anchoring (Tab 3)
    state.project.assetSheet = generateDefaultAssetSheet(masterData, state.project.continuityLevel, state.project.sourcePack);

    saveCurrentProject();
    renderMasterPackUI();
    renderAssetSheetUI();
    renderAnchorBannerUI();
    renderScenesUI();
    renderQCMatrixUI();
    renderAssembleUI();

    showToast('Master Production Pack, Asset Sheet & 6 Scene (+ Soundtrack) berhasil dibuat!');
  } catch (err) {
    console.error(err);
    showToast(`Error: ${err.message}. Menggunakan generator pintar.`);
    const fallback = generateSmartMasterAndScenes(state.project.sourcePack, state.project.theme, state.project.continuityLevel);
    state.project.masterPack = fallback.masterPack;
    state.project.scenes = fallback.scenes;
    state.project.soundtrack = generateSmartSoundtrack(fallback.masterPack, fallback.scenes);
    state.project.assetSheet = generateDefaultAssetSheet(fallback.masterPack, state.project.continuityLevel, state.project.sourcePack);
    saveCurrentProject();
    renderMasterPackUI();
    renderAssetSheetUI();
    renderAnchorBannerUI();
    renderScenesUI();
    renderQCMatrixUI();
    renderAssembleUI();
  } finally {
    els.btnBuildProductionPack.disabled = false;
    els.btnBuildProductionPack.innerHTML = `<i data-lucide="film" class="w-4 h-4"></i><span>GENERATE MASTER PRODUCTION PACK</span>`;
    lucide.createIcons();
  }
}

// Handler: Emergency Diagnoser & Fix (Phase 4)
async function handleDiagnoseFix() {
  const sceneNum = parseInt(els.selectFixScene.value, 10);
  const issueText = els.inputFixIssue.value.trim() || 'Tangan berubah dan kamera bergerak terlalu liar.';
  const scene = state.project.scenes.find(s => s.number === sceneNum);

  if (!scene) {
    showToast('Pilih scene yang valid!');
    return;
  }

  els.btnDiagnoseFix.disabled = true;
  els.btnDiagnoseFix.innerHTML = `<span class="animate-spin inline-block mr-2">⏳</span> Mendiagnosis Masalah...`;

  try {
    let diagnosis = null;

    if (state.apiKey && state.apiKey.trim().length > 10) {
      const sysPrompt = `You are an AI Video Generation Troubleshooter for Gemini Omni 1.1 / Google Flow. When a generation fails, follow the Master Flow rules:
Diagnose Problem, Cause, Fix, and produce a refined Prompt V2 that maintains all continuity rules without adding unnecessary prompt bloating.`;

      const userPrompt = `Scene ${sceneNum}: "${scene.title}"
Current Omni Prompt: "${scene.omniPrompt}"
Observed Issue: "${issueText}"

Output valid JSON:
{
  "problem": "Exact problem identified",
  "cause": "Probable AI model confusion cause",
  "fix": "Actionable simplification fix",
  "promptV2": "Refined Omni 1.1 Prompt V2 maintaining continuity"
}`;

      const raw = await callGemini(userPrompt, sysPrompt);
      if (raw) {
        diagnosis = JSON.parse(raw.replace(/```json/g, '').replace(/```/g, '').trim());
      }
    }

    if (!diagnosis) {
      diagnosis = generateSmartDiagnosis(scene, issueText);
    }

    // Save and render
    state.project.diagnoses[sceneNum] = diagnosis;
    // Update scene omni prompt to V2
    scene.omniPromptV2 = diagnosis.promptV2;
    saveCurrentProject();
    renderDiagnosisResultUI(sceneNum, diagnosis);
    renderScenesUI();
    showToast(`Diagnosis Scene ${sceneNum} selesai! Prompt V2 siap.`);
  } catch (err) {
    console.error(err);
    const fallback = generateSmartDiagnosis(scene, issueText);
    state.project.diagnoses[sceneNum] = fallback;
    renderDiagnosisResultUI(sceneNum, fallback);
  } finally {
    els.btnDiagnoseFix.disabled = false;
    els.btnDiagnoseFix.innerHTML = `<i data-lucide="zap" class="w-4 h-4"></i><span>DIAGNOSIS & GENERATE PROMPT V2</span>`;
    lucide.createIcons();
  }
}

// Handler: Simplify Shot
function handleSimplifyShot() {
  const sceneNum = parseInt(els.selectFixScene.value, 10);
  const scene = state.project.scenes.find(s => s.number === sceneNum);
  if (!scene) return;

  const simplified = `Use the attached image as absolute visual reference. 
Maintain exactly: same character identity, same clothing, same lighting, same color palette.
10-second cinematic shot.
Scene: Subject remains in a relaxed, steady posture with minimal subtle movement.
Camera: Locked static camera with gentle 35mm lens framing.
Motion: Only subtle breathing and slow ambient cloth sway. No rapid limb movements.
Lighting: Consistent soft key lighting from previous shot.
End frame: Subject maintains steady gaze.
No camera warping. No morphing. No extra limbs. No subtitles.`;

  scene.omniPrompt = simplified;
  saveCurrentProject();
  renderScenesUI();
  showToast(`Scene ${sceneNum} disederhanakan (Simplified Shot) untuk menghindari glitch!`);
}

function applyErrorPreset(type) {
  const presets = {
    hands: 'Jari tangan bertambah/rusak, interaksi memegang objek tidak wajar dan bergeser di tengah video.',
    face: 'Wajah karakter berubah drastis di detik ke-4 dan ekspresi menjadi aneh tidak sesuai identitas awal.',
    camera: 'Pergerakan kamera terlalu cepat, terjadi zoom mendadak dan warping pada latar belakang.',
    speed: 'Gerakan objek/manusia terlalu kaku, patah-patah atau melompat tidak mematuhi hukum fisika normal.'
  };
  els.inputFixIssue.value = presets[type] || '';
}

// ------------------------------------------
// UNIVERSAL REFERENCE INGEST HANDLERS (TAB 1)
// Supports Drag & Drop, Clipboard Paste (Cmd+V),
// Images, Video Frame Extraction, Text, and PDF.
// ------------------------------------------

function handlePaste(e) {
  const items = e.clipboardData?.items;
  if (!items || items.length === 0) return;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.type && item.type.indexOf('image') !== -1) {
      const blob = item.getAsFile();
      if (blob) {
        processGenericReferenceFile(blob);
        e.preventDefault();
        return;
      }
    }
  }

  // If pasting plain text from clipboard outside the textarea
  if (document.activeElement !== els.inputReference) {
    const text = e.clipboardData.getData('text');
    if (text && text.trim().length > 0) {
      els.inputReference.value = (els.inputReference.value ? els.inputReference.value + '\n\n' : '') + text.trim();
      state.project.sourceInput = els.inputReference.value;
      saveCurrentProject();
      showToast('📋 Teks dari Clipboard berhasil ditambahkan!');
    }
  }
}

async function handleClipboardButtonPaste() {
  try {
    if (navigator.clipboard?.read) {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            processGenericReferenceFile(blob);
            return;
          }
        }
      }
    }

    const text = await navigator.clipboard.readText();
    if (text && text.trim().length > 0) {
      els.inputReference.value = (els.inputReference.value ? els.inputReference.value + '\n\n' : '') + text.trim();
      state.project.sourceInput = els.inputReference.value;
      saveCurrentProject();
      showToast('📋 Teks dari Clipboard berhasil dimasukkan!');
    } else {
      showToast('Clipboard kosong atau tidak berisi teks/gambar.');
    }
  } catch (err) {
    console.warn(err);
    showToast('Silakan tekan tombol Cmd+V / Ctrl+V untuk menempel dari Clipboard.');
  }
}

function handleImageUpload(e) {
  const file = e.target.files?.[0];
  if (file) {
    processGenericReferenceFile(file);
  }
}

function processGenericReferenceFile(file) {
  if (!file) return;

  const fileName = file.name || `clipboard_image_${Date.now()}.png`;
  const fileType = file.type || '';

  // 1. Image Files
  if (fileType.startsWith('image/')) {
    if (file.size > 15 * 1024 * 1024) {
      showToast('Ukuran gambar maksimal 15MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const base64Data = dataUrl.split(',')[1];
      state.project.imageReference = {
        name: fileName,
        size: file.size,
        mimeType: fileType || 'image/png',
        dataUrl: dataUrl,
        data: base64Data,
        type: 'image'
      };
      saveCurrentProject();
      renderImageRefUI();
      renderAnchorBannerUI();
      showToast(`📸 Foto referensi visual "${fileName}" berhasil dimuat!`);
    };
    reader.readAsDataURL(file);
    return;
  }

  // 2. Video Files (Extract first frame via off-screen video element + canvas)
  if (fileType.startsWith('video/') || fileName.match(/\.(mp4|webm|mov|mkv)$/i)) {
    showToast('🎥 Membaca video dan mengekstrak frame acuan visual...');
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadeddata = () => {
      video.currentTime = Math.min(1.0, (video.duration && video.duration > 2) ? 1.0 : 0.5);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 720;
        canvas.height = video.videoHeight || 1280;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        URL.revokeObjectURL(url);

        state.project.imageReference = {
          name: fileName,
          size: file.size,
          mimeType: 'image/jpeg',
          dataUrl: dataUrl,
          data: dataUrl.split(',')[1],
          type: 'video_frame'
        };

        saveCurrentProject();
        renderImageRefUI();
        renderAnchorBannerUI();
        showToast('🎬 Frame video berhasil dimuat sebagai acuan visual!');
      } catch (err) {
        console.error(err);
        showToast('Gagal mengekstrak frame dari video.');
      }
    };

    video.onerror = () => {
      showToast('Gagal memutar video lokal ini. Format browser didukung: MP4, WebM.');
    };
    return;
  }

  // 3. Text Files (.txt, .md, .json, .csv)
  if (fileType.includes('text') || fileName.match(/\.(txt|md|json|csv|rtf)$/i)) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      els.inputReference.value = (els.inputReference.value ? els.inputReference.value + '\n\n' : '') + text;
      state.project.sourceInput = els.inputReference.value;
      saveCurrentProject();
      showToast(`📄 Konten file "${fileName}" berhasil dimasukkan ke input!`);
    };
    reader.readAsText(file);
    return;
  }

  // 4. PDF Files
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const buffer = event.target.result;
      const decoder = new TextDecoder('utf-8');
      const raw = decoder.decode(buffer);
      const textMatches = raw.match(/\(([^)]+)\)\s*T[jJ]/g) || [];
      let extracted = textMatches.map(m => m.replace(/[()]/g, '').replace(/\s*T[jJ]/, '')).join(' ');
      if (extracted && extracted.trim().length > 20) {
        els.inputReference.value = (els.inputReference.value ? els.inputReference.value + '\n\n' : '') + extracted;
        state.project.sourceInput = els.inputReference.value;
        saveCurrentProject();
        showToast(`📑 File PDF "${fileName}" berhasil dimuat ke input referensi!`);
      } else {
        showToast(`📑 File PDF "${fileName}" dibaca.`);
      }
    };
    reader.readAsArrayBuffer(file);
    return;
  }

  showToast(`Format file "${fileName}" tidak dikenali. Silakan gunakan Foto, Video, PDF, atau Teks.`);
}

function processImageFile(file) {
  processGenericReferenceFile(file);
}

function removeImageRef() {
  state.project.imageReference = null;
  if (els.inputImageRef) els.inputImageRef.value = '';
  if (els.inputReference && els.inputReference.value.startsWith('Video Referensi: "')) {
    els.inputReference.value = '';
    state.project.sourceInput = '';
  }
  saveCurrentProject();
  renderImageRefUI();
  renderAnchorBannerUI();
  showToast('Gambar referensi dihapus.');
}

// ------------------------------------------
// AI SOUNDTRACK & MUSIC GENERATOR (SUNO / UDIO)
// ------------------------------------------

async function generateSoundtrackSpec(masterPack, scenes) {
  if (!masterPack) return null;

  if (state.apiKey && state.apiKey.trim().length > 10) {
    try {
      const sysPrompt = `You are an elite film composer and AI music director specialized in 60-second cinematic short video scoring (Suno AI & Udio). You create tightly synchronized music prompts matching a 6-scene story progression. Output strictly valid JSON.`;

      const userPrompt = `Create a 60-second soundtrack prompt for Suno AI and Udio based on this video:
Title: "${masterPack.title}"
Concept: "${masterPack.concept}"
Genre: "${masterPack.genre}"
Visual Style: "${masterPack.visualStyle}"
Tone: "${masterPack.tone}"

6 Scenes Arc:
${(scenes || []).map(s => `Scene ${s.number} (${s.title}): ${s.storyFunction} | SFX: ${s.sfx}`).join('\n')}

Output ONLY valid JSON matching this exact structure:
{
  "title": "Title of the soundtrack",
  "genreTags": "Genre tags for Suno/Udio, e.g. Cinematic Dark Sci-Fi, Sub-bass, 88 BPM, Masterpiece",
  "bpm": "Tempo e.g. 88 BPM",
  "mood": "Mood description",
  "instruments": "Key instruments used",
  "fullPrompt": "Full copy-pasteable prompt for Suno AI or Udio with section tags and 60-second timeline cues",
  "sceneTimeline": [
    { "scene": 1, "time": "00:00 - 00:10", "cue": "Musical cue description for Scene 1" },
    { "scene": 2, "time": "00:10 - 00:20", "cue": "Musical cue description for Scene 2" },
    { "scene": 3, "time": "00:20 - 00:30", "cue": "Musical cue description for Scene 3" },
    { "scene": 4, "time": "00:30 - 00:40", "cue": "Musical cue description for Scene 4" },
    { "scene": 5, "time": "00:40 - 00:50", "cue": "Musical cue description for Scene 5" },
    { "scene": 6, "time": "00:50 - 01:00", "cue": "Musical cue description for Scene 6" }
  ]
}`;

      const rawJson = await callGemini(userPrompt, sysPrompt);
      if (rawJson) {
        const cleaned = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
      }
    } catch (e) {
      console.warn('Gemini Soundtrack generation error, using smart arrangement:', e);
    }
  }

  return generateSmartSoundtrack(masterPack, scenes);
}

// Handler: Regenerate Soundtrack from Tab 5
async function handleGenerateSoundtrack() {
  if (!state.project.masterPack) {
    showToast('Selesaikan Fase 02 (Master Production Pack) terlebih dahulu!');
    return;
  }

  els.btnGenerateSoundtrack.disabled = true;
  els.btnGenerateSoundtrack.innerHTML = `<span class="animate-spin inline-block mr-1">⏳</span> Menyusun Musik...`;

  try {
    const data = await generateSoundtrackSpec(state.project.masterPack, state.project.scenes);
    state.project.soundtrack = data;
    saveCurrentProject();
    renderSoundtrackUI();
    showToast('Soundtrack & Music Prompt berhasil diperbarui!');
  } catch (err) {
    console.error(err);
    state.project.soundtrack = generateSmartSoundtrack(state.project.masterPack, state.project.scenes);
    saveCurrentProject();
    renderSoundtrackUI();
  } finally {
    els.btnGenerateSoundtrack.disabled = false;
    els.btnGenerateSoundtrack.innerHTML = `<i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i><span>Regenerate Musik</span>`;
    lucide.createIcons();
  }
}

// ------------------------------------------
// GOOGLE GEMINI BANANA PRO (IMAGE GENERATION)
// Model: gemini-3.1-flash-image
// ------------------------------------------

async function callImageGeneration(promptText, aspectRatio = '9:16', referenceImage = null) {
  if (!state.apiKey || state.apiKey.trim().length < 10) {
    showToast('⚠️ Masukkan Google Gemini API Key di menu Pengaturan (ikon Gear)!');
    openSettings();
    throw new Error('API Key Google Gemini belum diatur. Masukkan API Key Anda di Pengaturan.');
  }

  // Sanitize prompt text for text-to-image
  const cleanPrompt = promptText
    .replace(/--ar\s+9:16/gi, '')
    .replace(/--no\s+[^,]+/gi, '')
    .trim();

  const apiKey = state.apiKey.trim();

  // Primary Call: Google Gemini Banana Pro via official Interactions API
  const interactionsEndpoint = `https://generativelanguage.googleapis.com/v1beta/interactions`;
  
  let inputPayload;
  if (referenceImage) {
    const rawBase64 = referenceImage.startsWith('data:') 
      ? referenceImage.split(',')[1] 
      : referenceImage;
    const mime = referenceImage.startsWith('data:')
      ? (referenceImage.split(';')[0].replace('data:', '') || 'image/jpeg')
      : 'image/jpeg';

    inputPayload = [
      {
        type: 'text',
        text: `Create the scene master frame adhering to this prompt: ${cleanPrompt}. Maintain exact subject appearance, character design, materials, and lighting consistency from the reference image attached.`
      },
      {
        type: 'image',
        data: rawBase64,
        mime_type: mime
      }
    ];
  } else {
    inputPayload = cleanPrompt;
  }

  const interactionPayload = {
    model: 'gemini-3.1-flash-image',
    input: inputPayload,
    response_format: {
      type: 'image',
      aspect_ratio: aspectRatio,
      image_size: '1K'
    }
  };

  const res = await fetch(interactionsEndpoint, {
    method: 'POST',
    headers: {
      'x-goog-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(interactionPayload)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const errMsg = errData?.error?.message || `HTTP error ${res.status}`;
    
    // Fallback: If interactions API not enabled for this key, try Google Imagen 3 on Gemini API
    console.warn(`Gemini Banana Pro interactions notice: ${errMsg}. Mencoba endpoint Gemini Imagen...`);
    const imagenEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${encodeURIComponent(apiKey)}`;
    const imagenRes = await fetch(imagenEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        instances: [{ prompt: `${cleanPrompt}, 9:16 vertical ratio, 8k resolution, cinematic masterpiece` }],
        parameters: { sampleCount: 1, aspectRatio: '9:16' }
      })
    });

    if (imagenRes.ok) {
      const imgData = await imagenRes.json();
      const b64 = imgData?.predictions?.[0]?.bytesBase64Encoded;
      if (b64) return `data:image/png;base64,${b64}`;
    }

    throw new Error(`Google Gemini Banana Pro: ${errMsg}`);
  }

  const data = await res.json();
  
  // Parse response from Google Gemini Banana Pro
  let base64Data = null;
  let mimeType = 'image/jpeg';

  // Format 1: Output image convenience property
  if (data?.output_image?.data) {
    base64Data = data.output_image.data;
    mimeType = data.output_image.mime_type || 'image/jpeg';
  } else if (data?.interaction?.output_image?.data) {
    base64Data = data.interaction.output_image.data;
    mimeType = data.interaction.output_image.mime_type || 'image/jpeg';
  }

  // Format 2: Steps timeline
  if (!base64Data && data?.steps) {
    for (const step of data.steps) {
      if (step.content) {
        for (const item of step.content) {
          if (item.type === 'image' && item.data) {
            base64Data = item.data;
            mimeType = item.mime_type || item.mimeType || 'image/jpeg';
            break;
          }
        }
      }
      if (base64Data) break;
    }
  }

  // Format 3: Candidates inlineData (generateContent style)
  if (!base64Data && data?.candidates?.[0]?.content?.parts) {
    for (const part of data.candidates[0].content.parts) {
      if (part.inlineData?.data) {
        base64Data = part.inlineData.data;
        mimeType = part.inlineData.mimeType || 'image/jpeg';
        break;
      }
    }
  }

  if (base64Data) {
    return `data:${mimeType};base64,${base64Data}`;
  }

  throw new Error('Google Gemini Banana Pro tidak mengembalikan data gambar yang valid.');
}

// ------------------------------------------
// SEQUENTIAL CHAINING & SCENE IMAGE GENERATION
// ------------------------------------------

function getSceneReference(sceneNum) {
  const isSequential = state.project.sequentialChaining !== false;
  const scenes = state.project.scenes || [];
  
  // Tab 3 Active Asset Reference (or Tab 1 image fallback)
  const assetAnchor = (state.project.assetSheet?.isAnchorActive !== false && state.project.assetSheet?.imageData)
    ? state.project.assetSheet.imageData
    : (state.project.imageReference?.dataUrl || null);
  const assetTitle = state.project.assetSheet?.title || 'Asset Anchor Sheet';

  // SCENE 1: Always anchors from Asset Sheet (or Tab 1 reference image)
  if (!isSequential || sceneNum === 1) {
    return {
      image: assetAnchor,
      label: assetAnchor ? (state.project.assetSheet?.imageData ? `Asset Sheet (${assetTitle})` : 'Foto Referensi Fase 01') : 'Mandiri (Tanpa Reference)',
      isLoop: false,
      sourceType: 'asset'
    };
  }

  // SCENES 2, 3, 4, 5: Reference the immediate previous Scene (Scene N-1)
  if (sceneNum >= 2 && sceneNum <= 5) {
    const prevScene = scenes.find(s => s.number === sceneNum - 1);
    if (prevScene && prevScene.imageUrl) {
      return {
        image: prevScene.imageUrl,
        label: `Master Frame Scene 0${sceneNum - 1} (Sequential Chain)`,
        isLoop: false,
        sourceType: 'previous_scene'
      };
    }
    // Fallback if previous scene has not been generated yet
    return {
      image: assetAnchor,
      label: assetAnchor ? `${assetTitle} (Standby Scene 0${sceneNum - 1})` : 'Mandiri (Tanpa Reference)',
      isLoop: false,
      sourceType: 'fallback_asset'
    };
  }

  // SCENE 6 (ENDING / LOOP): References Scene 5 AND transitions seamlessly back to Scene 1
  if (sceneNum === 6) {
    const scene5 = scenes.find(s => s.number === 5);
    const scene1 = scenes.find(s => s.number === 1);
    const prevImage = scene5?.imageUrl || assetAnchor;

    return {
      image: prevImage,
      label: scene5?.imageUrl ? `Scene 05 ➔ Loop Match ke Scene 01` : `${assetTitle} ➔ Loop Match ke Scene 01`,
      isLoop: true,
      sourceType: 'loop_chain',
      loopTargetImage: scene1?.imageUrl || null
    };
  }

  return { image: assetAnchor, label: assetTitle, isLoop: false, sourceType: 'asset' };
}

async function generateSceneImage(sceneNum) {
  const scene = state.project.scenes.find(s => s.number === sceneNum);
  if (!scene) return;

  const card = document.getElementById(`sceneCard-${sceneNum}`);
  const canvasEl = card?.querySelector(`.scene-img-canvas`);
  const btnGen = card?.querySelector(`.btn-gen-scene-img`);

  if (btnGen) {
    btnGen.disabled = true;
    btnGen.innerHTML = `<span class="animate-spin inline-block mr-1">⏳</span> Generating...`;
  }

  const refInfo = getSceneReference(sceneNum);

  if (canvasEl) {
    canvasEl.innerHTML = `
      <div class="w-full h-full min-h-[360px] rounded-xl animate-shimmer flex flex-col items-center justify-center p-6 text-center space-y-3 bg-[#06080d]">
        <div class="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></div>
        <div class="text-xs font-bold text-amber-300">Google Gemini Banana Pro Rendering...</div>
        <div class="text-[10px] text-slate-400 font-mono">gemini-3.1-flash-image • 9:16 Vertical</div>
        ${refInfo.image ? `
          <div class="text-[10px] text-amber-300 font-semibold px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 flex items-center gap-1">
            <span>🔗 Acuan: ${refInfo.label}</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  // Build dynamic prompt with sequential chaining and loop rules
  let dynamicPrompt = scene.masterFramePrompt;
  if (state.project.sequentialChaining !== false) {
    if (sceneNum > 1 && sceneNum < 6) {
      dynamicPrompt += ` Maintain exact subject identity, wardrobe, materials, and lighting continuity from previous Scene 0${sceneNum - 1}.`;
    } else if (sceneNum === 6) {
      dynamicPrompt += ` Seamless loop match cut ending designed to cycle back directly into Scene 01 opening frame with matching color grade, camera direction, and lighting balance.`;
    }
  }

  try {
    const imgUrl = await callImageGeneration(dynamicPrompt, '9:16', refInfo.image);

    // Save into Scene History Bank (v1, v2, v3...) for instant rollback
    if (!scene.history) scene.history = [];
    const verNum = scene.history.length + 1;
    const newVersion = {
      id: `s${sceneNum}_v${verNum}_${Date.now()}`,
      version: verNum,
      url: imgUrl,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      prompt: dynamicPrompt,
      refLabel: refInfo.label
    };
    scene.history.push(newVersion);
    scene.currentVersionId = newVersion.id;
    scene.imageUrl = imgUrl;

    saveCurrentProject();
    renderScenesUI();
    showToast(`Master Frame Scene 0${sceneNum} (Versi ${verNum}) selesai!`);
  } catch (err) {
    console.error(err);
    showToast(`Gagal render Scene 0${sceneNum}: ${err.message}`);
    renderScenesUI();
  }
}

function rollbackSceneVersion(sceneNum, historyId) {
  const scene = state.project.scenes.find(s => s.number === sceneNum);
  if (!scene || !scene.history) return;
  const item = scene.history.find(h => h.id === historyId);
  if (!item) return;

  scene.imageUrl = item.url;
  scene.currentVersionId = item.id;
  saveCurrentProject();
  renderScenesUI();
  showToast(`Master Frame Scene 0${sceneNum} di-rollback ke Versi ${item.version}!`);
}

async function handleGenerateAllMasterFrames() {
  const scenes = state.project.scenes || [];
  if (scenes.length === 0) {
    showToast('Selesaikan Fase 02 & 03 terlebih dahulu!');
    return;
  }

  els.btnGenerateAllImages.disabled = true;
  els.btnGenerateAllImages.innerHTML = `<span class="animate-spin inline-block mr-1.5">⏳</span> Rendering Rantai 6 Frame (Banana Pro)...`;

  try {
    // Generate sequentially so Scene 1 feeds into Scene 2, Scene 2 into Scene 3, etc.
    for (const scene of scenes) {
      showToast(`Merender Master Frame 0${scene.number} (Sequential Chaining)...`);
      await generateSceneImage(scene.number);
    }
    showToast('Semua 6 Master Frame berurutan selesai di-render!');
  } catch (err) {
    console.error(err);
    showToast(`Error: ${err.message}`);
  } finally {
    els.btnGenerateAllImages.disabled = false;
    els.btnGenerateAllImages.innerHTML = `<i data-lucide="sparkles" class="w-4 h-4"></i><span>Generate Semua 6 Master Frame (Banana Pro)</span>`;
    lucide.createIcons();
  }
}

function openImageModal(url) {
  if (!url) return;
  els.modalPreviewImg.src = url;
  els.btnDownloadModalImg.href = url;
  els.modalImagePreview.classList.remove('hidden');
}

// ------------------------------------------
// GOOGLE GEMINI BANANA PRO (ASSET & ANCHOR SHEET)
// ------------------------------------------

function setAssetSheetType(type) {
  if (!state.project.assetSheet) {
    state.project.assetSheet = generateDefaultAssetSheet(state.project.masterPack, state.project.continuityLevel, state.project.sourcePack, type);
  } else {
    state.project.assetSheet.type = type;
    const generated = generateDefaultAssetSheet(state.project.masterPack, state.project.continuityLevel, state.project.sourcePack, type);
    state.project.assetSheet.prompt = generated.prompt;
    state.project.assetSheet.title = generated.title;
  }
  saveCurrentProject();
  renderAssetSheetUI();
  renderAnchorBannerUI();
  showToast(`Tipe Asset diubah ke: ${state.project.assetSheet.title}`);
}

function resetAssetPrompt() {
  const currentType = state.project.assetSheet?.type || (state.project.continuityLevel === 'B' ? 'character' : (state.project.continuityLevel === 'C' ? 'object' : 'world'));
  const generated = generateDefaultAssetSheet(state.project.masterPack, state.project.continuityLevel, state.project.sourcePack, currentType);
  if (!state.project.assetSheet) {
    state.project.assetSheet = generated;
  } else {
    state.project.assetSheet.prompt = generated.prompt;
    state.project.assetSheet.title = generated.title;
  }
  saveCurrentProject();
  renderAssetSheetUI();
  showToast('Prompt Asset Sheet direset ke format optimal!');
}

function handleCustomAssetUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('Harap pilih file gambar (.jpg, .png, .webp)!');
    return;
  }
  const reader = new FileReader();
  reader.onload = (event) => {
    const dataUrl = event.target.result;
    if (!state.project.assetSheet) {
      state.project.assetSheet = generateDefaultAssetSheet(state.project.masterPack, state.project.continuityLevel, state.project.sourcePack);
    }
    state.project.assetSheet.imageData = dataUrl;
    state.project.assetSheet.isAnchorActive = true;

    // Push into version history
    if (!state.project.assetSheet.history) state.project.assetSheet.history = [];
    const verNum = state.project.assetSheet.history.length + 1;
    const newVer = {
      id: `as_v${verNum}_${Date.now()}`,
      version: verNum,
      imageData: dataUrl,
      createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      prompt: 'Custom Upload',
      type: state.project.assetSheet.type || 'character'
    };
    state.project.assetSheet.history.push(newVer);
    state.project.assetSheet.currentVersionId = newVer.id;

    // Save to Bank Asset & Galeri Referensi
    if (!state.project.assetLibrary) state.project.assetLibrary = [];
    state.project.assetLibrary.forEach(a => a.isPrimary = false);
    state.project.assetLibrary.unshift({
      id: newVer.id,
      title: `${file.name} (Upload)`,
      type: state.project.assetSheet.type || 'character',
      imageData: dataUrl,
      createdAt: newVer.createdAt,
      prompt: 'Custom Upload',
      isPrimary: true
    });

    saveCurrentProject();
    renderAssetSheetUI();
    renderAnchorBannerUI();
    showToast('Gambar custom berhasil diunggah & disimpan di Bank Asset sebagai Visual Anchor!');
  };
  reader.readAsDataURL(file);
}

function handleAssetLibraryUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('Harap pilih file gambar (.jpg, .png, .webp)!');
    return;
  }
  const reader = new FileReader();
  reader.onload = (event) => {
    const dataUrl = event.target.result;
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const assetId = `lib_${Date.now()}`;

    if (!state.project.assetLibrary) state.project.assetLibrary = [];
    state.project.assetLibrary.forEach(a => a.isPrimary = false);

    const newAsset = {
      id: assetId,
      title: file.name.replace(/\.[^/.]+$/, ""),
      type: 'character',
      imageData: dataUrl,
      createdAt: timeStr,
      prompt: 'Direct Bank Upload',
      isPrimary: true
    };
    state.project.assetLibrary.unshift(newAsset);

    // Set as active anchor immediately
    if (!state.project.assetSheet) {
      state.project.assetSheet = generateDefaultAssetSheet(state.project.masterPack, state.project.continuityLevel, state.project.sourcePack);
    }
    state.project.assetSheet.imageData = dataUrl;
    state.project.assetSheet.title = newAsset.title;
    state.project.assetSheet.isAnchorActive = true;
    state.project.assetSheet.currentVersionId = assetId;

    saveCurrentProject();
    renderAssetSheetUI();
    renderAnchorBannerUI();
    showToast(`Asset "${newAsset.title}" ditambahkan ke Bank & aktif sebagai acuan 6 scene!`);
  };
  reader.readAsDataURL(file);
}

function selectActiveLibraryAsset(assetId) {
  const asset = (state.project.assetLibrary || []).find(a => a.id === assetId);
  if (!asset) return;

  state.project.assetLibrary.forEach(a => a.isPrimary = (a.id === assetId));

  if (!state.project.assetSheet) {
    state.project.assetSheet = generateDefaultAssetSheet(state.project.masterPack, state.project.continuityLevel, state.project.sourcePack);
  }
  state.project.assetSheet.imageData = asset.imageData;
  state.project.assetSheet.title = asset.title;
  state.project.assetSheet.type = asset.type;
  state.project.assetSheet.isAnchorActive = true;
  state.project.assetSheet.currentVersionId = asset.id;

  saveCurrentProject();
  renderAssetSheetUI();
  renderAnchorBannerUI();
  showToast(`★ Asset "${asset.title}" sekarang aktif sebagai acuan visual utama 6 scene!`);
}

function deleteLibraryAsset(assetId) {
  state.project.assetLibrary = (state.project.assetLibrary || []).filter(a => a.id !== assetId);
  saveCurrentProject();
  renderAssetLibraryUI();
  showToast('Asset dihapus dari Bank Referensi.');
}

function rollbackAssetVersion(versionId) {
  const history = state.project.assetSheet?.history || [];
  const ver = history.find(h => h.id === versionId);
  if (!ver) return;

  state.project.assetSheet.imageData = ver.imageData;
  state.project.assetSheet.currentVersionId = ver.id;
  state.project.assetSheet.isAnchorActive = true;

  if (state.project.assetLibrary) {
    state.project.assetLibrary.forEach(a => a.isPrimary = (a.id === ver.id));
  }

  saveCurrentProject();
  renderAssetSheetUI();
  renderAnchorBannerUI();
  showToast(`Asset Sheet di-rollback ke Versi ${ver.version}!`);
}

async function handleGenerateAssetSheet() {
  if (!state.project.masterPack) {
    showToast('Selesaikan Fase 02 (Director Lock) terlebih dahulu!');
    return;
  }

  const promptText = els.inputAssetPrompt?.value?.trim() || state.project.assetSheet?.prompt;
  if (!promptText) {
    showToast('Prompt Asset Sheet belum diisi.');
    return;
  }

  els.btnGenerateAssetSheet.disabled = true;
  els.btnGenerateAssetSheet.innerHTML = `<span class="animate-spin inline-block mr-2">⏳</span> Rendering Asset Sheet dengan Banana Pro...`;

  els.assetCanvasEmpty?.classList.add('hidden');
  els.assetCanvasImg?.classList.add('hidden');
  const tempCanvas = document.createElement('div');
  tempCanvas.className = 'w-full h-full min-h-[360px] rounded-xl animate-shimmer flex flex-col items-center justify-center p-6 text-center space-y-3 bg-[#06080d]';
  tempCanvas.innerHTML = `
    <div class="w-10 h-10 rounded-full border-2 border-purple-400 border-t-transparent animate-spin"></div>
    <div class="text-xs font-bold text-purple-300">Google Gemini Banana Pro Rendering...</div>
    <div class="text-[10px] text-slate-400 font-mono">Master Asset Sheet • 9:16 Vertical</div>
  `;
  els.assetCanvasContainer?.appendChild(tempCanvas);

  try {
    const imgUrl = await callImageGeneration(promptText, '9:16');
    if (!state.project.assetSheet) {
      state.project.assetSheet = generateDefaultAssetSheet(state.project.masterPack, state.project.continuityLevel, state.project.sourcePack);
    }
    state.project.assetSheet.imageData = imgUrl;
    state.project.assetSheet.isAnchorActive = true;

    // Push into version history
    if (!state.project.assetSheet.history) state.project.assetSheet.history = [];
    const verNum = state.project.assetSheet.history.length + 1;
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const newVer = {
      id: `as_v${verNum}_${Date.now()}`,
      version: verNum,
      imageData: imgUrl,
      createdAt: timeStr,
      prompt: promptText,
      type: state.project.assetSheet.type || 'character'
    };
    state.project.assetSheet.history.push(newVer);
    state.project.assetSheet.currentVersionId = newVer.id;

    // Save to Bank Asset & Galeri Referensi
    if (!state.project.assetLibrary) state.project.assetLibrary = [];
    state.project.assetLibrary.forEach(a => a.isPrimary = false);
    state.project.assetLibrary.unshift({
      id: newVer.id,
      title: `${state.project.assetSheet.title} (v${verNum})`,
      type: state.project.assetSheet.type || 'character',
      imageData: imgUrl,
      createdAt: timeStr,
      prompt: promptText,
      isPrimary: true
    });

    saveCurrentProject();
    renderAssetSheetUI();
    renderAnchorBannerUI();
    showToast(`Asset Sheet (v${verNum}) berhasil dibuat & disimpan ke Bank Referensi!`);
  } catch (err) {
    console.error(err);
    showToast(`Gagal render Asset Sheet: ${err.message}`);
    renderAssetSheetUI();
  } finally {
    if (tempCanvas.parentNode) tempCanvas.remove();
    els.btnGenerateAssetSheet.disabled = false;
    els.btnGenerateAssetSheet.innerHTML = `<i data-lucide="sparkles" class="w-4 h-4"></i><span>GENERATE ASSET SHEET (BANANA PRO)</span>`;
    lucide.createIcons();
  }
}

function generateDefaultAssetSheet(masterPack, continuityLevel, sourcePack, forcedType = null) {
  let type = forcedType;
  if (!type) {
    if (continuityLevel === 'B') type = 'character';
    else if (continuityLevel === 'C') type = 'object';
    else if (continuityLevel === 'A') type = 'world';
    else type = 'thumbnail';
  }

  const title = masterPack?.title || 'Daily Short';
  const style = masterPack?.visualStyle || 'Cinematic Photorealism';
  const color = masterPack?.globalVisualLock?.colorPalette || 'High contrast film grade';
  const lighting = masterPack?.globalVisualLock?.lightingLanguage || 'Cinematic lighting';
  const subject = sourcePack?.storyElements?.character || sourcePack?.storyElements?.object || sourcePack?.subject || 'Main subject';
  const location = sourcePack?.storyElements?.location || 'Atmospheric setting';

  let prompt = '';
  let sheetTitle = '';

  if (type === 'character') {
    sheetTitle = 'Character Turnaround Model Sheet';
    prompt = `Character turnaround model sheet and visual reference sheet of ${subject}, showing front view, 3/4 view, and profile angle in 9:16 vertical composition. Wearing authentic cinematic clothing and gear matching ${title}. Clean neutral studio background, 50mm portrait lens, ultra high resolution photorealism, detailed facial features, consistent hair and skin texture, ${lighting}, color grade: ${color} --ar 9:16 --no multiple different people, deformed hands, extra limbs, cartoon`;
  } else if (type === 'object') {
    sheetTitle = 'Object & Product Turntable Sheet';
    prompt = `Product design turntable 360 reference sheet of ${sourcePack?.storyElements?.object || subject}, multi-angle orthographic and hero perspective views in 9:16 vertical composition. Pristine studio product photography, razor sharp macro surface texture, reflections and material details, ${lighting}, color palette: ${color}, clean dark backdrop, commercial masterpiece --ar 9:16 --no blurry, distorted proportions, extra objects`;
  } else if (type === 'world') {
    sheetTitle = 'World & Style Environment Sheet';
    prompt = `Environment and architectural concept style sheet of ${location}, showcasing key environmental structures, atmospheric lighting conditions, and texture details in 9:16 vertical layout. Visual style: ${style}. Lighting rules: ${lighting}. Color palette: ${color}. Anamorphic 35mm lens, atmospheric haze, monumental scale, cinematic worldbuilding guide --ar 9:16 --no blurry spots, low quality, oversaturated cartoon`;
  } else {
    sheetTitle = 'Hero Keyframe & Poster Thumbnail';
    prompt = `Iconic high-impact hero keyframe poster and opening thumbnail for "${title}", featuring ${subject} in ${location}. Dramatic dynamic low-angle composition with maximum curiosity hook, intense cinematic rim lighting, volumetrics, 8k resolution, ${style}, masterpiece composition ready for viral short video cover --ar 9:16 --no text watermark, amateur, blurry`;
  }

  return {
    type: type,
    title: sheetTitle,
    prompt: prompt,
    negativePrompt: 'multiple different faces, distorted anatomy, blur, text, watermark, split framing',
    imageData: null,
    isAnchorActive: true,
    createdAt: new Date().toISOString()
  };
}

// ==========================================
// 8. SMART DYNAMIC GENERATORS (OFFLINE / FALLBACK)
// ==========================================

function generateSmartSourcePack(input, theme) {
  const cleanTheme = theme === 'bebas' ? 'Cinematic Atmospheric' : theme;
  return {
    subject: `Eksplorasi visual terfokus: ${input.slice(0, 80)}...`,
    coreIdea: `Interpretasi mendalam tentang ${input.slice(0, 100)} dalam gaya ${cleanTheme}.`,
    visualMoments: [
      "Pembukaan dramatis dengan skala yang mengejutkan penonton",
      "Transisi pencahayaan dramatis menembus tekstur material utama",
      "Detail macro yang memperlihatkan keunikan objek secara intim",
      "Perubahan situasi atau pergerakan besar yang memicu tensi",
      "Payoff visual megah dengan komposisi simetris yang memukau"
    ],
    storyElements: {
      character: "Sosok pengamat atau elemen sentral yang konsisten",
      object: "Objek simbolik utama yang menjadi jangkar cerita",
      location: "Lingkungan berkarakter kuat yang mendukung nuansa cerita",
      action: "Aksi tunggal yang terencana dan elegan",
      transformation: "Perubahan atmosfer dari misteri menuju kejernihan visual"
    },
    facts: "Informasi dikurasi agar fokus pada kekuatan narasi visual daripada teks penjelasan panjang.",
    visualDNA: {
      camera: "35mm cinematic anamorphic, slow deliberate tracking, subtle micro-drift",
      lighting: "High-contrast cinematic key lighting, deep rich shadow separation",
      color: "Palette disesuaikan dengan warna alami subjek dan aksen dramatis",
      texture: "Organic tactile surfaces, fine natural film grain",
      atmosphere: `Enigmatic, engaging, ${cleanTheme}`
    },
    adaptation: [
      `1. Pendekatan dokumenter realistis`,
      `2. Pendekatan sinematik naratif (PRIMARY DIRECTION)`,
      `3. Pendekatan commercial luxury editorial`
    ],
    primaryDirection: `Sinematik naratif 60 detik dalam 6 scene dengan estetika ${cleanTheme}.`
  };
}

function generateSmartMasterAndScenes(sourcePack, theme, level) {
  const title = `THE CHRONICLES OF ${sourcePack.subject.slice(0, 30).toUpperCase()}`;
  const masterPack = {
    title: title,
    concept: sourcePack.coreIdea,
    genre: theme === 'bebas' ? 'Cinematic Documentary' : theme,
    visualStyle: '35mm Film Photorealism',
    tone: 'Immersive, Focused, Visually Striking',
    globalVisualLock: {
      colorPalette: 'Deep charcoal, rich earth tones, luminous highlight accents',
      lightingLanguage: 'Consistent low-key directional lighting, soft rim highlights',
      cameraLanguage: 'Steady cinematic movements, 35mm and 50mm lens character',
      imageCharacter: 'Subtle 35mm film grain, organic depth of field, natural falloff',
      worldRules: 'Semua scene mempertahankan kesinambungan pencahayaan dan identitas subjek utama secara ketat.'
    }
  };

  const sceneTypes = [
    { title: "HOOK — THE AWAKENING", func: "Menghentikan scrolling dalam 2 detik pertama dengan visual tak biasa." },
    { title: "DISCOVERY — THE CONTEXT", func: "Memperkenalkan dunia dan memperjelas apa yang sedang terjadi." },
    { title: "ESCALATION — THE SURGE", func: "Meningkatkan skala, tensi atau keindahan visual ke tingkat lebih tinggi." },
    { title: "REVEAL — THE UNVEILING", func: "Memberikan informasi baru atau momen 'Oh, ternyata...'." },
    { title: "PAYOFF — THE CLIMAX", func: "Aksi visual paling satisfying dan hero moment keseluruhan video." },
    { title: "ENDING / LOOP — THE ECHO", func: "Penutup emosional yang menyambung kembali ke Scene 01 untuk looping." }
  ];

  const scenes = sceneTypes.map((st, i) => {
    const num = i + 1;
    return {
      number: num,
      title: `SCENE 0${num} — ${st.title}`,
      storyFunction: st.func,
      viewerUnderstand: `Pemirsa memahami perkembangan tahap ${num} dari kisah ${sourcePack.subject.slice(0, 40)}.`,
      action: `Aksi utama terfokus tahap ${num} tanpa gerakan berlebih.`,
      composition: num === 1 ? "Wide extreme angle" : num === 4 ? "Extreme macro probe" : "Medium tracking shot",
      camera: num % 2 === 0 ? "Slow orbit tracking" : "Slow forward push-in",
      motion: "Gerakan natural sesuai hukum fisika, partikel melayang halus",
      lighting: "Pencahayaan terkunci sesuai Global Visual Lock",
      transition: num === 6 ? "Match cut loop to Scene 01" : "Hard cut",
      voLine: `Naskah voiceover scene ${num} mengalir alami mendukung visual.`,
      sfx: `SFX impact & ambient layer untuk scene ${num}`,
      masterFramePrompt: `Master Frame Scene ${num}: ${sourcePack.subject}, 35mm cinematic photography, high detail, masterpiece composition, atmospheric lighting --ar 9:16 --no blur, cartoon, text`,
      omniPrompt: `Use the attached image as absolute visual reference. Maintain same identity, same lighting, same color palette. 10-second shot. Scene: Scene ${num} ${st.title}. Camera: Smooth ${num % 2 === 0 ? 'orbital tracking' : 'forward push-in'}. Motion: Natural, realistic, physics-compliant. End frame: Clear visual conclusion for cut. No warping, no morphing, no artifacts.`,
      tags: ["/PushIn", "/Cinematic", "/GoldenHour"]
    };
  });

  return { masterPack, scenes };
}

function generateSmartDiagnosis(scene, issueText) {
  let cause = "Model AI mengalami ambiguitas saat memproses terlalu banyak perubahan dalam 10 detik.";
  let fix = "Sederhanakan gerakan kamera dan kunci interaksi tangan menjadi pose statis atau frameless.";

  if (issueText.toLowerCase().includes('tangan') || issueText.toLowerCase().includes('finger')) {
    cause = "Interaksi jari tangan kompleks sering kali memicu deformasi morfologi pada model video generative.";
    fix = "Gunakan framing medium-close yang tidak memperlihatkan telapak tangan secara penuh, atau pastikan objek sudah digenggam sejak awal.";
  } else if (issueText.toLowerCase().includes('kamera') || issueText.toLowerCase().includes('zoom')) {
    cause = "Prompt kamera terlalu deskriptif sehingga model memicu pergerakan ganda yang berbenturan.";
    fix = "Ubah perintah kamera menjadi slow tracking satu arah (push-in lurus atau static locked tripod).";
  }

  const promptV2 = `Use the attached image as the absolute visual reference.
Maintain exactly: same character identity, same wardrobe, same environment, same lighting direction.
10-second cinematic shot.
Scene: ${scene.action || 'Subject moves with calm, measured grace'}.
Camera: Slow deliberate push-in, 35mm cinematic lens, steady horizon.
Motion: Single primary motion only. Relaxed natural pace. Hand interaction remains locked and steady.
Lighting: Consistent cinematic key lighting.
End frame: Subject comes to a graceful stop before camera.
No camera warping. No morphing. No distorted hands (five fingers only). No sudden acceleration. No watermark. No text.`;

  return {
    problem: issueText,
    cause: cause,
    fix: fix,
    promptV2: promptV2
  };
}

function generateSmartSoundtrack(masterPack, scenes) {
  const genre = masterPack?.genre || 'Cinematic Ambient';
  const tone = masterPack?.tone || 'Monumental, Atmospheric';
  const title = `${masterPack?.title || 'Daily Short'} (Original AI Score)`;

  return {
    title: title,
    genreTags: `${genre}, 35mm Analog Warmth, Sub-bass, Atmospheric Swells, 88 BPM, Masterpiece Cinema`,
    bpm: '88 BPM',
    mood: tone,
    instruments: 'Sub-bass drone, warm modular synthesizer, crystalline granular bell, cinematic tom drums, orchestral brass swells',
    fullPrompt: `[Genre: ${genre}, Cinematic Film Score, Deep Sub-bass, Organic Percussion, 88 BPM, 60s Vertical Short Film]
[00:00 - 00:10 Intro / Hook] Low rumbling sub-bass chord, singular delicate crystalline chime, instant tension
[00:10 - 00:20 Discovery] Subtle acoustic ticking pulse enters, warm analog synth arpeggio drifting upward
[00:20 - 00:30 Escalation] Rhythmic cinematic floor toms build tempo, layered brass pad swell, rising urgency
[00:30 - 00:40 Reveal] Sudden brief sub-drop silence (0.5s), soaring emotional lead synth melody, wide stereo field
[00:40 - 00:50 Payoff Climax] Maximum dynamic energy, triumphant orchestral percussion hit, resonant brass chord crescendo
[00:50 - 01:00 Outro / Loop] Sudden reverb decay, synth echoes soften into identical opening low sub-bass drone for seamless video loop`,
    sceneTimeline: [
      { scene: 1, time: "00:00 - 00:10", cue: "Low rumbling sub-bass & delicate crystalline chime to grab audience attention." },
      { scene: 2, time: "00:10 - 00:20", cue: "Rhythmic ticking clock pulse with warm floating synth arpeggios." },
      { scene: 3, time: "00:20 - 00:30", cue: "Deep cinematic floor toms build intensity; brass swells introduce tension." },
      { scene: 4, time: "00:30 - 00:40", cue: "Micro-silence breath followed by soaring emotional lead synth reveal." },
      { scene: 5, time: "00:40 - 00:50", cue: "Hero moment: full orchestral crescendo & triumphant sub-bass blast." },
      { scene: 6, time: "00:50 - 01:00", cue: "Echoing reverb decay matching the opening drone for seamless 60s loop." }
    ]
  };
}

// ==========================================
// 9. UI RENDERERS
// ==========================================

function renderAll() {
  updateContinuityLevelUI();
  renderImageRefUI();
  renderSourcePackUI();
  renderMasterPackUI();
  renderAssetSheetUI();
  renderAssetVersionReel();
  renderAssetLibraryUI();
  renderAnchorBannerUI();
  renderSoundtrackUI();
  renderScenesUI();
  renderQCMatrixUI();
  renderAssembleUI();
  updateSceneBadge();
}

function updateContinuityLevelUI() {
  els.btnLevels.forEach(b => {
    if (b.dataset.level === state.project.continuityLevel) {
      b.classList.add('bg-blue-600', 'text-white');
      b.classList.remove('text-slate-400');
    } else {
      b.classList.remove('bg-blue-600', 'text-white');
      b.classList.add('text-slate-400');
    }
  });
}

function updateSceneBadge() {
  const count = state.project.scenes?.length || 0;
  els.sceneCountBadge.textContent = `${count}/6`;
}

function renderImageRefUI() {
  const imgRef = state.project.imageReference;
  if (imgRef && imgRef.dataUrl) {
    if (els.attachedMediaTray) els.attachedMediaTray.classList.remove('hidden');
    if (els.imagePreviewImg) els.imagePreviewImg.src = imgRef.dataUrl;
  } else {
    if (els.attachedMediaTray) els.attachedMediaTray.classList.add('hidden');
    if (els.imagePreviewImg) els.imagePreviewImg.src = '';
  }
}

function renderSourcePackUI() {
  const sp = state.project.sourcePack;
  if (!sp) {
    els.sourcePackPlaceholder.classList.remove('hidden');
    els.sourcePackResult.classList.add('hidden');
    els.sourcePackFooter.classList.add('hidden');
    return;
  }

  els.sourcePackPlaceholder.classList.add('hidden');
  els.sourcePackResult.classList.remove('hidden');
  els.sourcePackFooter.classList.remove('hidden');

  els.sourcePackResult.innerHTML = `
    <!-- Subject & Core Idea -->
    <div class="p-3.5 rounded-xl bg-dark-card border border-dark-border space-y-1.5">
      <div class="text-[10px] font-bold tracking-wider uppercase text-orange-400">SUBJECT &amp; CORE IDEA</div>
      <div class="font-bold text-white text-sm">${sp.subject}</div>
      <p class="text-xs text-slate-300 italic">&ldquo;${sp.coreIdea}&rdquo;</p>
    </div>

    <!-- Visual Moments -->
    <div class="p-3.5 rounded-xl bg-dark-card border border-dark-border space-y-2">
      <div class="text-[10px] font-bold tracking-wider uppercase text-blue-400">5-10 VISUAL MOMENTS (POTENSI SCENE)</div>
      <ul class="text-xs space-y-1 text-slate-300 list-disc list-inside">
        ${(sp.visualMoments || []).map(m => `<li>${m}</li>`).join('')}
      </ul>
    </div>

    <!-- Story Elements Grid -->
    <div class="grid grid-cols-2 gap-2 text-xs">
      <div class="p-2.5 rounded-lg bg-dark-card/60 border border-dark-border">
        <span class="text-[10px] text-slate-500 font-bold block uppercase">Karakter</span>
        <span class="text-slate-300 font-semibold">${sp.storyElements?.character || 'N/A'}</span>
      </div>
      <div class="p-2.5 rounded-lg bg-dark-card/60 border border-dark-border">
        <span class="text-[10px] text-slate-500 font-bold block uppercase">Objek Kunci</span>
        <span class="text-slate-300 font-semibold">${sp.storyElements?.object || 'N/A'}</span>
      </div>
      <div class="p-2.5 rounded-lg bg-dark-card/60 border border-dark-border">
        <span class="text-[10px] text-slate-500 font-bold block uppercase">Lokasi / Setting</span>
        <span class="text-slate-300 font-semibold">${sp.storyElements?.location || 'N/A'}</span>
      </div>
      <div class="p-2.5 rounded-lg bg-dark-card/60 border border-dark-border">
        <span class="text-[10px] text-slate-500 font-bold block uppercase">Aksi Sentral</span>
        <span class="text-slate-300 font-semibold">${sp.storyElements?.action || 'N/A'}</span>
      </div>
    </div>

    <!-- Visual DNA -->
    <div class="p-3.5 rounded-xl bg-dark-card border border-dark-border space-y-1.5">
      <div class="text-[10px] font-bold tracking-wider uppercase text-emerald-400">VISUAL DNA</div>
      <div class="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
        <div><strong class="text-slate-400">Kamera:</strong> ${sp.visualDNA?.camera || 'N/A'}</div>
        <div><strong class="text-slate-400">Lighting:</strong> ${sp.visualDNA?.lighting || 'N/A'}</div>
        <div><strong class="text-slate-400">Warna:</strong> ${sp.visualDNA?.color || 'N/A'}</div>
        <div><strong class="text-slate-400">Tekstur:</strong> ${sp.visualDNA?.texture || 'N/A'}</div>
      </div>
    </div>

    <!-- Primary Direction -->
    <div class="p-3 rounded-xl bg-orange-500/10 border border-orange-500/25 text-xs text-orange-200">
      <strong class="text-orange-400 block mb-0.5 text-[10px] uppercase tracking-wider">Rekomendasi Arah Utama (Primary Direction):</strong>
      ${sp.primaryDirection}
    </div>
  `;
}

function renderMasterPackUI() {
  const mp = state.project.masterPack;
  if (!mp) {
    els.masterPackEmpty.classList.remove('hidden');
    els.masterPackContent.classList.add('hidden');
    els.masterPackFooter.classList.add('hidden');
    return;
  }

  els.masterPackEmpty.classList.add('hidden');
  els.masterPackContent.classList.remove('hidden');
  els.masterPackFooter.classList.remove('hidden');

  els.masterPackContent.innerHTML = `
    <!-- Header Summary -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-dark-border pb-4">
      <div>
        <span class="text-[10px] font-bold uppercase tracking-wider text-blue-400">WORKING TITLE</span>
        <h3 class="text-xl font-extrabold text-white tracking-wide">${mp.title}</h3>
        <p class="text-xs text-slate-300 mt-1">&ldquo;${mp.concept}&rdquo;</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="text-xs px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 font-bold">${mp.genre}</span>
        <span class="text-xs px-2.5 py-1 rounded-lg bg-dark-card border border-dark-border text-slate-300 font-semibold">${mp.visualStyle}</span>
      </div>
    </div>

    <!-- Global Visual Lock Section -->
    <div class="space-y-3">
      <div class="flex items-center gap-2">
        <div class="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
        <h4 class="text-sm font-bold text-white uppercase tracking-wider">GLOBAL VISUAL LOCK (BERLAKU UNTUK 6 SCENE)</h4>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div class="p-3.5 rounded-xl bg-dark-card border border-dark-border space-y-1">
          <span class="text-[10px] text-slate-400 uppercase font-bold block">Palette Warna</span>
          <span class="text-slate-200 font-medium">${mp.globalVisualLock?.colorPalette || 'Standard cinematic palette'}</span>
        </div>
        <div class="p-3.5 rounded-xl bg-dark-card border border-dark-border space-y-1">
          <span class="text-[10px] text-slate-400 uppercase font-bold block">Bahasa Lighting</span>
          <span class="text-slate-200 font-medium">${mp.globalVisualLock?.lightingLanguage || 'Cinematic directional'}</span>
        </div>
        <div class="p-3.5 rounded-xl bg-dark-card border border-dark-border space-y-1">
          <span class="text-[10px] text-slate-400 uppercase font-bold block">Bahasa Kamera &amp; Lensa</span>
          <span class="text-slate-200 font-medium">${mp.globalVisualLock?.cameraLanguage || '35mm anamorphic drift'}</span>
        </div>
        <div class="p-3.5 rounded-xl bg-dark-card border border-dark-border space-y-1">
          <span class="text-[10px] text-slate-400 uppercase font-bold block">Karakter Gambar (Film Grain)</span>
          <span class="text-slate-200 font-medium">${mp.globalVisualLock?.imageCharacter || '35mm film photorealism'}</span>
        </div>
      </div>

      <div class="p-3.5 rounded-xl bg-red-950/20 border border-red-500/20 text-xs text-red-200">
        <strong class="text-red-400 block mb-1 uppercase text-[10px] tracking-wider">World Rules (Aturan yang Tidak Boleh Dilanggar):</strong>
        ${mp.globalVisualLock?.worldRules || 'Pertahankan kontinuitas subjek dan atmosfer tanpa perubahan mendadak.'}
      </div>
    </div>
  `;
}

function renderAssetSheetUI() {
  const as = state.project.assetSheet;
  const currentType = as?.type || (state.project.continuityLevel === 'B' ? 'character' : (state.project.continuityLevel === 'C' ? 'object' : 'world'));

  // Update pills active state
  els.btnAssetTypePills?.forEach(pill => {
    if (pill.dataset.type === currentType) {
      pill.classList.add('bg-purple-600', 'text-white');
      pill.classList.remove('bg-dark-card', 'text-slate-300');
    } else {
      pill.classList.remove('bg-purple-600', 'text-white');
      pill.classList.add('bg-dark-card', 'text-slate-300');
    }
  });

  // Checkbox anchor
  if (els.chkUseAsAnchor) {
    els.chkUseAsAnchor.checked = as ? as.isAnchorActive !== false : true;
  }

  // Inputs
  if (els.inputAssetPrompt && as?.prompt) {
    els.inputAssetPrompt.value = as.prompt;
  }
  if (els.inputAssetNegative && as?.negativePrompt) {
    els.inputAssetNegative.value = as.negativePrompt;
  }

  // Canvas Image preview
  if (as && as.imageData) {
    els.assetCanvasEmpty?.classList.add('hidden');
    els.assetCanvasImg?.classList.remove('hidden');
    if (els.assetCanvasImg) els.assetCanvasImg.src = as.imageData;
    els.assetActionsBar?.classList.remove('hidden');
    if (els.btnDownloadAssetImg) els.btnDownloadAssetImg.href = as.imageData;

    if (els.assetStatusText) {
      if (as.isAnchorActive !== false) {
        els.assetStatusText.className = 'font-bold text-emerald-400 flex items-center gap-1.5';
        els.assetStatusText.innerHTML = '<span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span><span>Aktif (Visual Anchor 6-Scene)</span>';
      } else {
        els.assetStatusText.className = 'font-bold text-slate-400';
        els.assetStatusText.textContent = 'Nonaktif (Prompt Standalone)';
      }
    }
  } else {
    els.assetCanvasEmpty?.classList.remove('hidden');
    els.assetCanvasImg?.classList.add('hidden');
    if (els.assetCanvasImg) els.assetCanvasImg.src = '';
    els.assetActionsBar?.classList.add('hidden');
    if (els.assetStatusText) {
      els.assetStatusText.className = 'font-bold text-slate-400';
      els.assetStatusText.textContent = 'Belum Ada Gambar';
    }
  }

  renderAssetVersionReel();
  renderAssetLibraryUI();
  lucide.createIcons();
}

function renderAssetVersionReel() {
  if (!els.assetVersionReel || !els.assetVersionReelContainer) return;
  const history = state.project.assetSheet?.history || [];
  if (history.length <= 1) {
    els.assetVersionReelContainer.classList.add('hidden');
    return;
  }

  els.assetVersionReelContainer.classList.remove('hidden');
  const currentId = state.project.assetSheet.currentVersionId || history[history.length - 1]?.id;
  if (els.assetVersionCountBadge) {
    els.assetVersionCountBadge.textContent = `${history.length} Versi Tersimpan`;
  }

  els.assetVersionReel.innerHTML = history.map(item => {
    const isSelected = item.id === currentId || item.imageData === state.project.assetSheet.imageData;
    return `
      <button type="button" class="btn-rollback-asset shrink-0 relative group p-0.5 rounded-lg border-2 transition ${isSelected ? 'border-purple-400 bg-purple-500/20 shadow-md shadow-purple-500/20 ring-1 ring-purple-400' : 'border-dark-border hover:border-purple-500/60 bg-dark-card'}" data-id="${item.id}" title="Klik untuk rollback ke Versi ${item.version} (${item.createdAt})">
        <img src="${item.imageData}" class="w-11 h-14 object-cover rounded">
        <span class="absolute bottom-0.5 right-0.5 text-[8px] font-mono font-bold px-1 rounded ${isSelected ? 'bg-purple-600 text-white' : 'bg-black/80 text-slate-300'}">
          v${item.version}
        </span>
        ${isSelected ? '<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-black"></span>' : ''}
      </button>
    `;
  }).join('');

  els.assetVersionReel.querySelectorAll('.btn-rollback-asset').forEach(btn => {
    btn.addEventListener('click', () => {
      rollbackAssetVersion(btn.dataset.id);
    });
  });
}

function renderAssetLibraryUI() {
  if (!els.assetLibraryGrid) return;
  const library = state.project.assetLibrary || [];

  if (els.assetLibraryCountBadge) {
    els.assetLibraryCountBadge.textContent = `${library.length} Tersimpan`;
  }

  if (library.length === 0) {
    els.assetLibraryGrid.innerHTML = `
      <div class="col-span-full p-8 rounded-xl bg-dark-card/50 border border-dashed border-dark-border text-center space-y-2">
        <div class="w-10 h-10 mx-auto rounded-lg bg-dark-panel border border-dark-border flex items-center justify-center text-slate-500">
          <i data-lucide="layers" class="w-5 h-5 text-purple-400"></i>
        </div>
        <p class="text-xs text-slate-300 font-semibold">Bank Asset Masih Kosong</p>
        <p class="text-[11px] text-slate-500 max-w-sm mx-auto">Setiap Asset Sheet yang di-generate atau gambar yang Anda upload akan tersimpan di sini. Anda bisa memilih asset mana saja untuk menjadi acuan pembuatan 6 scene.</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  els.assetLibraryGrid.innerHTML = library.map(item => {
    const isPrimary = item.isPrimary || (state.project.assetSheet?.imageData === item.imageData);
    const typeLabel = item.type === 'character' ? '🧍 Karakter' : (item.type === 'object' ? '📦 Objek' : (item.type === 'world' ? '🌌 World' : '🎬 Hero'));

    return `
      <div class="group relative rounded-xl bg-dark-card border ${isPrimary ? 'border-purple-500 ring-2 ring-purple-500/30 bg-purple-950/15' : 'border-dark-border hover:border-purple-500/40'} p-2.5 space-y-2 transition flex flex-col justify-between shadow-lg">
        <div class="relative rounded-lg overflow-hidden aspect-short bg-black border border-dark-border/80">
          <img src="${item.imageData}" alt="${item.title}" class="w-full h-full object-cover">
          ${isPrimary ? `
            <div class="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-purple-600 text-[9px] font-black text-white uppercase tracking-wider shadow-md flex items-center gap-1">
              <i data-lucide="check-circle" class="w-2.5 h-2.5"></i>
              <span>REFERENCE UTAMA</span>
            </div>
          ` : ''}
          <div class="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[9px] font-mono text-purple-300">
            ${item.createdAt || '9:16'}
          </div>
        </div>

        <div class="space-y-1">
          <div class="flex items-center justify-between gap-1 text-[10px]">
            <span class="text-slate-400 font-semibold">${typeLabel}</span>
            <button class="btn-del-lib-asset text-slate-500 hover:text-red-400 p-0.5 transition" data-id="${item.id}" title="Hapus Asset">
              <i data-lucide="trash-2" class="w-3 h-3"></i>
            </button>
          </div>
          <h5 class="text-xs font-bold text-white truncate" title="${item.title}">${item.title}</h5>
        </div>

        <button type="button" class="btn-select-lib-asset w-full py-1.5 px-2 rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 ${isPrimary ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 cursor-default' : 'bg-dark-panel hover:bg-purple-600 hover:text-white border border-dark-border text-slate-300'}" data-id="${item.id}">
          <i data-lucide="${isPrimary ? 'check' : 'check-circle'}" class="w-3 h-3"></i>
          <span>${isPrimary ? 'Sedang Digunakan' : 'Gunakan Sebagai Acuan'}</span>
        </button>
      </div>
    `;
  }).join('');

  // Re-bind buttons inside library grid
  els.assetLibraryGrid.querySelectorAll('.btn-select-lib-asset').forEach(btn => {
    btn.addEventListener('click', () => {
      selectActiveLibraryAsset(btn.dataset.id);
    });
  });

  els.assetLibraryGrid.querySelectorAll('.btn-del-lib-asset').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteLibraryAsset(btn.dataset.id);
    });
  });

  lucide.createIcons();
}

function renderAnchorBannerUI() {
  const as = state.project.assetSheet;
  const imgRef = state.project.imageReference;
  const isSeq = state.project.sequentialChaining !== false;

  if (as && as.imageData && as.isAnchorActive !== false) {
    if (els.anchorThumbBox) els.anchorThumbBox.innerHTML = `<img src="${as.imageData}" class="w-full h-full object-cover">`;
    if (els.anchorBadgeStatus) {
      els.anchorBadgeStatus.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      els.anchorBadgeStatus.textContent = `Aktif (${as.title || 'Asset Sheet'})`;
    }
    if (els.anchorDescriptionText) {
      els.anchorDescriptionText.textContent = isSeq
        ? `Asset Sheet ini menjadi acuan awal Scene 01, dilanjutkan secara Sequential Chain (Scene 1 ➔ 2 ➔ ... ➔ 6 Loop).`
        : `Google Gemini Banana Pro mengunci konsistensi Scene 1-6 dengan acuan visual Asset Sheet ini.`;
    }
  } else if (imgRef && (imgRef.dataUrl || imgRef.data)) {
    const src = imgRef.dataUrl || `data:${imgRef.mimeType || 'image/jpeg'};base64,${imgRef.data}`;
    if (els.anchorThumbBox) els.anchorThumbBox.innerHTML = `<img src="${src}" class="w-full h-full object-cover">`;
    if (els.anchorBadgeStatus) {
      els.anchorBadgeStatus.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30';
      els.anchorBadgeStatus.textContent = 'Aktif (Foto Input Fase 01)';
    }
    if (els.anchorDescriptionText) {
      els.anchorDescriptionText.textContent = `Menggunakan foto/frame referensi dari Fase 01 sebagai acuan visual scene.`;
    }
  } else {
    if (els.anchorThumbBox) els.anchorThumbBox.innerHTML = `<i data-lucide="layers" class="w-5 h-5 text-slate-500"></i>`;
    if (els.anchorBadgeStatus) {
      els.anchorBadgeStatus.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-dark-card text-slate-400 border border-dark-border';
      els.anchorBadgeStatus.textContent = 'Standby (Tanpa Anchor)';
    }
    if (els.anchorDescriptionText) {
      els.anchorDescriptionText.textContent = `Scene akan di-render mandiri. Anda bisa membuat Asset Sheet di Tab 3 untuk mengunci konsistensi karakter/objek.`;
    }
  }

  lucide.createIcons();
}

function renderSoundtrackUI() {
  if (!els.soundtrackContainer) return;
  const mp = state.project.masterPack;
  const st = state.project.soundtrack;

  if (!mp && !st) {
    els.soundtrackContainer.classList.add('hidden');
    return;
  }

  els.soundtrackContainer.classList.remove('hidden');

  if (!st) {
    els.soundtrackResultBox.innerHTML = `
      <div class="p-4 rounded-xl bg-dark-card border border-dark-border text-center space-y-2">
        <p class="text-xs text-slate-300 font-medium">Soundtrack akan otomatis dirancang saat Anda membuat Master Production Pack di Fase 02.</p>
        <p class="text-[11px] text-slate-500">Klik tombol &ldquo;Regenerate Musik&rdquo; di atas untuk menyusun prompt Suno / Udio AI berdurasi 60 detik yang selaras dengan 6 scene.</p>
      </div>
    `;
    return;
  }

  els.soundtrackResultBox.innerHTML = `
    <!-- Top Metadata Badges -->
    <div class="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-xl bg-dark-card border border-dark-border">
      <div>
        <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">SOUNDTRACK TITLE</span>
        <h4 class="text-sm font-bold text-white">${st.title}</h4>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <span class="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">${st.bpm || '88 BPM'}</span>
        <span class="text-[11px] px-2.5 py-1 rounded-lg bg-dark-panel border border-dark-border text-slate-300 font-medium">${st.mood || 'Cinematic'}</span>
      </div>
    </div>

    <!-- Full Prompt for Suno / Udio with Copy Button -->
    <div class="p-4 rounded-xl bg-[#090b14] border border-dark-border space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
          <i data-lucide="music" class="w-3.5 h-3.5"></i>
          <span>Prompt Siap Pakai (Suno AI / Udio AI)</span>
        </span>
        <button id="btnCopySoundtrack" class="text-xs font-bold px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5 transition">
          <i data-lucide="copy" class="w-3.5 h-3.5"></i>
          <span>Copy Music Prompt</span>
        </button>
      </div>
      <p class="font-mono text-xs text-slate-200 bg-[#05070c] p-3 rounded-lg border border-dark-border select-all max-h-44 overflow-y-auto whitespace-pre-line leading-relaxed">
        ${st.fullPrompt}
      </p>
      <div class="text-[11px] text-slate-400 pt-1">
        <strong class="text-slate-300">Style Tags:</strong> ${st.genreTags}
      </div>
    </div>

    <!-- 60-Second Timeline Sync with 6 Scenes -->
    <div class="p-3.5 rounded-xl bg-dark-card border border-dark-border space-y-2.5">
      <div class="text-[10px] font-bold uppercase tracking-wider text-blue-400">PROGRESI MUSIK 60 DETIK (SELARAS DENGAN 6 SCENE)</div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        ${(st.sceneTimeline || []).map(t => `
          <div class="p-2.5 rounded-lg bg-dark-panel border border-dark-border space-y-1">
            <div class="flex items-center justify-between text-[10px]">
              <span class="font-bold text-orange-400">Scene 0${t.scene}</span>
              <span class="font-mono text-slate-500">${t.time}</span>
            </div>
            <p class="text-[11px] text-slate-300 leading-snug">${t.cue}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.getElementById('btnCopySoundtrack')?.addEventListener('click', () => {
    navigator.clipboard.writeText(st.fullPrompt);
    showToast('Prompt Soundtrack AI disalin ke clipboard!');
  });

  lucide.createIcons();
}

function renderScenesUI() {
  const scenes = state.project.scenes || [];
  if (scenes.length === 0) {
    els.scenesEmpty.classList.remove('hidden');
    els.scenesList.classList.add('hidden');
    return;
  }

  els.scenesEmpty.classList.add('hidden');
  els.scenesList.classList.remove('hidden');

  els.scenesList.innerHTML = scenes.map((scene, idx) => {
    const isV2 = !!scene.omniPromptV2;
    const currentOmni = scene.omniPromptV2 || scene.omniPrompt;
    const refInfo = getSceneReference(scene.number);
    const history = scene.history || [];
    const hasHistory = history.length > 0;

    return `
      <div id="sceneCard-${scene.number}" class="scene-card p-6 rounded-2xl bg-dark-panel border border-dark-border space-y-5 shadow-xl glass-panel-hover" data-scene-num="${scene.number}">
        
        <!-- Header: Scene Number, Title, Function -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-dark-border pb-4">
          <div class="flex items-start gap-3">
            <span class="w-8 h-8 rounded-xl bg-orange-600/20 border border-orange-500/30 text-orange-400 font-black text-sm flex items-center justify-center shrink-0">
              0${scene.number}
            </span>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-extrabold text-white">${scene.title}</h3>
                ${isV2 ? '<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">PROMPT V2 ACTIVE</span>' : ''}
              </div>
              <p class="text-xs text-slate-400 mt-0.5"><strong>Fungsi Cerita:</strong> ${scene.storyFunction}</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button class="btn-copy-scene-both text-xs font-bold px-3 py-1.5 rounded-xl bg-dark-card hover:bg-dark-hover border border-dark-border text-slate-300 transition flex items-center gap-1.5" data-idx="${idx}">
              <i data-lucide="copy" class="w-3.5 h-3.5 text-amber-400"></i>
              <span>Copy Semua Prompt</span>
            </button>
            <button class="btn-trigger-fix text-xs font-bold px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-300 transition flex items-center gap-1.5" data-scene="${scene.number}">
              <i data-lucide="stethoscope" class="w-3.5 h-3.5"></i>
              <span>Fix Error</span>
            </button>
          </div>
        </div>

        <!-- Visual & Technical Specification Tags -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div class="p-2 rounded-lg bg-dark-card/60 border border-dark-border">
            <span class="text-[10px] text-slate-500 uppercase font-bold block">Komposisi</span>
            <span class="text-slate-300 font-medium">${scene.composition || 'Medium shot'}</span>
          </div>
          <div class="p-2 rounded-lg bg-dark-card/60 border border-dark-border">
            <span class="text-[10px] text-slate-500 uppercase font-bold block">Kamera</span>
            <span class="text-slate-300 font-medium">${scene.camera || 'Slow push-in'}</span>
          </div>
          <div class="p-2 rounded-lg bg-dark-card/60 border border-dark-border">
            <span class="text-[10px] text-slate-500 uppercase font-bold block">Transisi</span>
            <span class="text-slate-300 font-medium">${scene.transition || 'Hard cut'}</span>
          </div>
          <div class="p-2 rounded-lg bg-dark-card/60 border border-dark-border">
            <span class="text-[10px] text-slate-500 uppercase font-bold block">Audio / SFX</span>
            <span class="text-slate-300 font-medium truncate block" title="${scene.sfx || ''}">${scene.sfx || 'Ambience'}</span>
          </div>
        </div>

        <!-- Main Studio Workspace: 9:16 Visual Canvas (Left) + Prompts (Right) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">

          <!-- Left: 9:16 Master Frame Visual Canvas -->
          <div class="lg:col-span-5 p-4 rounded-xl bg-[#090b14] border border-dark-border flex flex-col justify-between space-y-3">
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <i data-lucide="image" class="w-3.5 h-3.5"></i>
                  <span>Master Frame 9:16 (Banana Pro)</span>
                </span>
                <div class="flex items-center gap-1.5">
                  ${scene.imageUrl ? `
                    <button class="btn-fullscreen-scene-img p-1 rounded-lg bg-dark-card hover:bg-dark-hover border border-dark-border text-slate-300 transition" data-url="${scene.imageUrl}" title="Lihat Penuh">
                      <i data-lucide="maximize-2" class="w-3.5 h-3.5"></i>
                    </button>
                    <a href="${scene.imageUrl}" download="Scene_0${scene.number}_MasterFrame.png" target="_blank" class="p-1 rounded-lg bg-dark-card hover:bg-dark-hover border border-dark-border text-slate-300 transition" title="Download">
                      <i data-lucide="download" class="w-3.5 h-3.5"></i>
                    </a>
                  ` : ''}
                </div>
              </div>

              <!-- Active Reference Indicator Banner for Sequential Chaining -->
              <div class="px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 font-medium flex items-center justify-between gap-1">
                <span class="flex items-center gap-1.5 truncate">
                  <i data-lucide="${refInfo.isLoop ? 'repeat' : 'link-2'}" class="w-3.5 h-3.5 text-amber-400 shrink-0"></i>
                  <span class="truncate">Acuan: <strong>${refInfo.label}</strong></span>
                </span>
                ${refInfo.isLoop ? '<span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold uppercase shrink-0">Loop Cut</span>' : ''}
              </div>
            </div>

            <!-- Canvas Area -->
            <div class="scene-img-canvas w-full max-w-[260px] mx-auto rounded-xl overflow-hidden border border-dark-border bg-[#05070c] aspect-short flex items-center justify-center relative shadow-inner">
              ${scene.imageUrl ? `
                <img src="${scene.imageUrl}" alt="Scene 0${scene.number} Master Frame" class="w-full h-full object-cover transition duration-300 hover:scale-105 cursor-pointer btn-open-modal-trigger" data-url="${scene.imageUrl}">
                <div class="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[9px] font-mono text-amber-300 border border-white/10">
                  9:16 Frame
                </div>
              ` : `
                <div class="p-6 text-center space-y-2 text-slate-500">
                  <div class="w-12 h-12 mx-auto rounded-xl bg-dark-card border border-dark-border flex items-center justify-center text-slate-600">
                    <i data-lucide="image" class="w-6 h-6 stroke-1"></i>
                  </div>
                  <p class="text-xs text-slate-300 font-semibold">Master Frame Belum Ada</p>
                  <p class="text-[10px] text-slate-500">Klik tombol di bawah untuk render AI gambar vertikal 9:16 dengan Gemini Banana Pro</p>
                </div>
              `}
            </div>

            <!-- Image Version Bank & Rollback Gallery -->
            ${hasHistory ? `
              <div class="space-y-1.5 pt-1.5 border-t border-dark-border/60">
                <div class="flex items-center justify-between text-[10px]">
                  <span class="text-slate-400 font-semibold flex items-center gap-1">
                    <i data-lucide="history" class="w-3 h-3 text-amber-400"></i>
                    <span>Riwayat Versi (Klik Rollback):</span>
                  </span>
                  <span class="font-mono text-amber-400 font-bold">${history.length} Versi Tersimpan</span>
                </div>
                <div class="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  ${history.map(h => {
                    const isActive = h.url === scene.imageUrl;
                    return `
                      <button type="button" class="btn-rollback-scene shrink-0 relative group p-0.5 rounded-lg border-2 transition ${isActive ? 'border-amber-400 bg-amber-500/20 shadow-md shadow-amber-500/20 ring-1 ring-amber-400' : 'border-dark-border hover:border-amber-500/60 bg-dark-card'}" data-scene="${scene.number}" data-id="${h.id}" title="Rollback ke Versi ${h.version} (${h.timestamp})">
                        <img src="${h.url}" class="w-9 h-12 object-cover rounded">
                        <span class="absolute bottom-0.5 right-0.5 text-[8px] font-mono font-bold px-1 rounded ${isActive ? 'bg-amber-500 text-black' : 'bg-black/75 text-slate-300'}">v${h.version}</span>
                        ${isActive ? '<span class="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black"></span>' : ''}
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Action Button -->
            <button class="btn-gen-scene-img w-full py-2.5 rounded-xl ${scene.imageUrl ? 'bg-dark-card hover:bg-dark-hover text-slate-300 border border-dark-border' : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold shadow-lg shadow-amber-500/20'} text-xs font-bold transition flex items-center justify-center gap-1.5" data-scene="${scene.number}">
              <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
              <span>${scene.imageUrl ? 'Regenerate Frame (Banana Pro)' : 'Generate Master Frame (Banana Pro 9:16)'}</span>
            </button>
          </div>

          <!-- Right: Prompts Section (Master Frame & Omni Video) -->
          <div class="lg:col-span-7 flex flex-col justify-between space-y-4">
            
            <!-- Master Frame Prompt Card -->
            <div class="p-4 rounded-xl bg-[#0b0d16] border border-dark-border space-y-2 flex flex-col justify-between flex-1">
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                    <i data-lucide="image" class="w-3.5 h-3.5"></i>
                    <span>Master Frame Prompt (Image Gen)</span>
                  </span>
                  <span class="text-[10px] text-slate-500 font-mono">Midjourney / Flux / Imagen</span>
                </div>
                <p class="text-xs text-slate-300 font-mono leading-relaxed bg-[#06080d] p-3 rounded-lg border border-dark-border select-all max-h-32 overflow-y-auto">
                  ${scene.masterFramePrompt}
                </p>
              </div>
              <div class="pt-2 flex justify-end">
                <button class="btn-copy-prompt text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 transition" data-text="${encodeURIComponent(scene.masterFramePrompt)}">
                  <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                  <span>Copy Master Frame Prompt</span>
                </button>
              </div>
            </div>

            <!-- Omni 1.1 Video Prompt Card -->
            <div class="p-4 rounded-xl bg-[#0b0d16] border border-dark-border space-y-2 flex flex-col justify-between flex-1">
              <div>
                <div class="flex items-center justify-between mb-1.5">
                  <span class="text-[10px] font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1">
                    <i data-lucide="video" class="w-3.5 h-3.5"></i>
                    <span>Omni 1.1 Video Prompt (~10s)</span>
                  </span>
                  <span class="text-[10px] text-slate-500 font-mono">Google Flow / Omni 1.1</span>
                </div>
                <p class="text-xs text-slate-300 font-mono leading-relaxed bg-[#06080d] p-3 rounded-lg border border-dark-border select-all max-h-32 overflow-y-auto">
                  ${currentOmni}
                </p>
              </div>
              <div class="pt-2 flex justify-end">
                <button class="btn-copy-prompt text-xs font-bold px-3 py-1.5 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-300 flex items-center gap-1.5 transition" data-text="${encodeURIComponent(currentOmni)}">
                  <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                  <span>Copy Omni Prompt</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        <!-- Shorthand Code Tags -->
        <div class="flex items-center gap-1.5 flex-wrap pt-1 border-t border-dark-border/60">
          <span class="text-[10px] text-slate-500 font-semibold mr-1">Library Codes:</span>
          ${(scene.tags || ['/PushIn', '/Cinematic']).map(t => `
            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-dark-card border border-dark-border text-slate-400 font-semibold">${t}</span>
          `).join('')}
        </div>

      </div>
    `;
  }).join('');

  // Re-bind listeners inside cards
  document.querySelectorAll('.btn-copy-prompt').forEach(b => {
    b.addEventListener('click', () => {
      const txt = decodeURIComponent(b.dataset.text);
      navigator.clipboard.writeText(txt);
      b.classList.add('copied-pop');
      setTimeout(() => b.classList.remove('copied-pop'), 400);
      showToast('Prompt berhasil disalin!');
    });
  });

  document.querySelectorAll('.btn-copy-scene-both').forEach(b => {
    b.addEventListener('click', () => {
      const idx = parseInt(b.dataset.idx, 10);
      const s = state.project.scenes[idx];
      const combined = `=== SCENE 0${s.number} ===\n\n[MASTER FRAME PROMPT]\n${s.masterFramePrompt}\n\n[OMNI 1.1 VIDEO PROMPT]\n${s.omniPromptV2 || s.omniPrompt}\n`;
      navigator.clipboard.writeText(combined);
      showToast(`Prompt Scene 0${s.number} (Image & Video) disalin!`);
    });
  });

  document.querySelectorAll('.btn-trigger-fix').forEach(b => {
    b.addEventListener('click', () => {
      const sceneNum = b.dataset.scene;
      els.selectFixScene.value = sceneNum;
      switchTab('tab-qc');
      window.scrollTo({ top: 300, behavior: 'smooth' });
    });
  });

  document.querySelectorAll('.btn-gen-scene-img').forEach(b => {
    b.addEventListener('click', () => {
      const sceneNum = parseInt(b.dataset.scene, 10);
      generateSceneImage(sceneNum);
    });
  });

  document.querySelectorAll('.btn-fullscreen-scene-img').forEach(b => {
    b.addEventListener('click', () => {
      openImageModal(b.dataset.url);
    });
  });

  document.querySelectorAll('.btn-open-modal-trigger').forEach(b => {
    b.addEventListener('click', () => {
      openImageModal(b.dataset.url);
    });
  });

  document.querySelectorAll('.btn-rollback-scene').forEach(b => {
    b.addEventListener('click', () => {
      const sceneNum = parseInt(b.dataset.scene, 10);
      const historyId = b.dataset.id;
      rollbackSceneVersion(sceneNum, historyId);
    });
  });

  lucide.createIcons();
}

function filterScenes(filter) {
  const cards = document.querySelectorAll('.scene-card');
  cards.forEach(c => {
    if (filter === 'all' || c.dataset.sceneNum === filter) {
      c.classList.remove('hidden');
    } else {
      c.classList.add('hidden');
    }
  });
}

function renderQCMatrixUI() {
  const scenes = state.project.scenes || [];
  let totalReady = 0;

  els.qcScenesMatrix.innerHTML = [1, 2, 3, 4, 5, 6].map(num => {
    const scene = scenes.find(s => s.number === num);
    const qc = state.project.qcStatus[num - 1] || { identity: false, motion: false, composition: false, story: false };
    const passedCount = (qc.identity ? 1 : 0) + (qc.motion ? 1 : 0) + (qc.composition ? 1 : 0) + (qc.story ? 1 : 0);
    const isKeep = passedCount >= 3;
    if (isKeep) totalReady++;

    return `
      <div class="p-3.5 rounded-xl bg-dark-card border ${isKeep ? 'border-emerald-500/40 bg-emerald-950/10' : 'border-dark-border'} space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="w-6 h-6 rounded-lg bg-dark-panel border border-dark-border text-xs font-bold flex items-center justify-center text-slate-300">
              0${num}
            </span>
            <span class="font-bold text-xs text-white">${scene ? scene.title : `Scene 0${num}`}</span>
          </div>

          <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${isKeep ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-dark-panel text-slate-400 border border-dark-border'}">
            ${isKeep ? '✅ KEEP (3/4+)' : `${passedCount}/4 Lolos`}
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <label class="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input type="checkbox" class="qc-check rounded bg-[#090b12] border-dark-border text-emerald-500" data-scene="${num}" data-field="identity" ${qc.identity ? 'checked' : ''}>
            <span>1. Identity</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input type="checkbox" class="qc-check rounded bg-[#090b12] border-dark-border text-emerald-500" data-scene="${num}" data-field="motion" ${qc.motion ? 'checked' : ''}>
            <span>2. Motion</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input type="checkbox" class="qc-check rounded bg-[#090b12] border-dark-border text-emerald-500" data-scene="${num}" data-field="composition" ${qc.composition ? 'checked' : ''}>
            <span>3. Framing</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer text-slate-300">
            <input type="checkbox" class="qc-check rounded bg-[#090b12] border-dark-border text-emerald-500" data-scene="${num}" data-field="story" ${qc.story ? 'checked' : ''}>
            <span>4. Story</span>
          </label>
        </div>
      </div>
    `;
  }).join('');

  els.qcOverallBadge.textContent = `${totalReady}/6 Lolos QC`;

  // Attach checkbox listeners
  document.querySelectorAll('.qc-check').forEach(cb => {
    cb.addEventListener('change', () => {
      const sceneNum = parseInt(cb.dataset.scene, 10);
      const field = cb.dataset.field;
      state.project.qcStatus[sceneNum - 1][field] = cb.checked;
      saveCurrentProject();
      renderQCMatrixUI();
    });
  });
}

function renderDiagnosisResultUI(sceneNum, diag) {
  els.diagnosisResultBox.classList.remove('hidden');
  els.diagnosisResultBox.innerHTML = `
    <div class="border-b border-dark-border pb-2 flex items-center justify-between">
      <strong class="text-red-400 font-bold uppercase text-[11px]">Hasil Diagnosis Scene 0${sceneNum}:</strong>
      <span class="text-[10px] text-slate-400">Master Flow Diagnostic Matrix</span>
    </div>
    <div><strong class="text-slate-400">Problem:</strong> ${diag.problem}</div>
    <div><strong class="text-slate-400">Penyebab:</strong> ${diag.cause}</div>
    <div><strong class="text-slate-400">Solusi Perbaikan:</strong> ${diag.fix}</div>
    <div class="space-y-1 pt-1">
      <div class="flex items-center justify-between">
        <strong class="text-emerald-400 uppercase text-[10px] tracking-wider">OMNI PROMPT V2 (KONTINUITAS TERJAGA):</strong>
        <button id="btnCopyV2" class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">Copy V2</button>
      </div>
      <p class="font-mono text-[11px] bg-[#06080d] p-2.5 rounded-lg border border-dark-border text-slate-300 select-all max-h-36 overflow-y-auto">
        ${diag.promptV2}
      </p>
    </div>
  `;

  document.getElementById('btnCopyV2')?.addEventListener('click', () => {
    navigator.clipboard.writeText(diag.promptV2);
    showToast('Prompt V2 disalin ke clipboard!');
  });
}

function renderAssembleUI() {
  const scenes = state.project.scenes || [];
  if (scenes.length === 0) {
    els.voiceoverScriptContent.innerHTML = `<p class="text-slate-500 italic">Belum ada scene. Selesaikan Fase 2 & 3 terlebih dahulu.</p>`;
    renderSoundtrackUI();
    return;
  }

  els.voiceoverScriptContent.innerHTML = scenes.map(s => `
    <div class="p-3 rounded-xl bg-dark-card border border-dark-border space-y-1">
      <div class="flex items-center justify-between text-[11px]">
        <span class="font-bold text-orange-400">SCENE 0${s.number} (~10s)</span>
        <span class="text-slate-500 font-mono">${s.sfx || 'Ambience'}</span>
      </div>
      <p class="text-slate-200 text-xs font-medium pl-2 border-l-2 border-orange-500/50">
        &ldquo;${s.voLine || 'Visual storytelling tanpa voiceover.'}&rdquo;
      </p>
    </div>
  `).join('');

  renderSoundtrackUI();
  lucide.createIcons();
}

function copyVoiceoverScript() {
  const scenes = state.project.scenes || [];
  const script = scenes.map(s => `[SCENE 0${s.number} - ~10s]\n${s.voLine || '(Visual only)'}\nSFX: ${s.sfx || '-'}\n`).join('\n');
  navigator.clipboard.writeText(script);
  showToast('Naskah voiceover disalin!');
}

function copyProjectMarkdown() {
  const p = state.project;
  const md = `# ${p.title}
Tanggal: ${p.date}
Tema: ${p.theme} | Continuity: Level ${p.continuityLevel}

## 1. SOURCE PACK
- **Subject**: ${p.sourcePack?.subject || '-'}
- **Core Idea**: ${p.sourcePack?.coreIdea || '-'}
- **Primary Direction**: ${p.sourcePack?.primaryDirection || '-'}

## 2. GLOBAL VISUAL LOCK
- **Color Palette**: ${p.masterPack?.globalVisualLock?.colorPalette || '-'}
- **Lighting**: ${p.masterPack?.globalVisualLock?.lightingLanguage || '-'}
- **Camera**: ${p.masterPack?.globalVisualLock?.cameraLanguage || '-'}
- **World Rules**: ${p.masterPack?.globalVisualLock?.worldRules || '-'}

${p.assetSheet ? `## 3. MASTER VISUAL ANCHOR & ASSET SHEET
- **Type**: ${p.assetSheet.type.toUpperCase()} (${p.assetSheet.title})
- **Anchor Status**: ${p.assetSheet.isAnchorActive ? 'Active Anchor for Scene 1-6' : 'Standalone'}
- **Asset Prompt**:
\`\`\`
${p.assetSheet.prompt}
\`\`\`
` : ''}

${p.soundtrack ? `## 4. SOUNDTRACK & MUSIC SPEC (SUNO / UDIO)
- **Title**: ${p.soundtrack.title}
- **Genre & Tags**: ${p.soundtrack.genreTags}
- **BPM & Mood**: ${p.soundtrack.bpm} • ${p.soundtrack.mood}
- **Full Music Prompt**:
\`\`\`
${p.soundtrack.fullPrompt}
\`\`\`
` : ''}

## 5. SCENE BREAKDOWN (6 SCENES)
${(p.scenes || []).map(s => `
### Scene 0${s.number}: ${s.title}
- **Fungsi**: ${s.storyFunction}
- **Action**: ${s.action}
- **Voiceover**: "${s.voLine}"
- **SFX**: ${s.sfx}

**Master Frame Prompt (Image Gen 9:16):**
\`\`\`
${s.masterFramePrompt}
\`\`\`

**Omni 1.1 Video Prompt (~10s):**
\`\`\`
${s.omniPromptV2 || s.omniPrompt}
\`\`\`
`).join('\n')}
`;

  navigator.clipboard.writeText(md);
  showToast('Laporan lengkap Markdown berhasil disalin!');
}

function exportProjectJSON() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.project, null, 2));
  const dlAnchor = document.createElement('a');
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", `${state.project.title.replace(/[^a-zA-Z0-9]/g, '_')}_DailyShort.json`);
  document.body.appendChild(dlAnchor);
  dlAnchor.click();
  dlAnchor.remove();
  showToast('File backup JSON berhasil didownload!');
}

// ==========================================
// 10. SAVED PROJECTS & SETTINGS MODALS
// ==========================================

function openSettings() {
  els.inputApiKey.value = state.apiKey;
  els.selectModel.value = state.model;
  els.modalSettings.classList.remove('hidden');
}

function closeSettings() {
  els.modalSettings.classList.add('hidden');
}

function saveSettings() {
  state.apiKey = els.inputApiKey.value.trim();
  state.model = els.selectModel.value;
  localStorage.setItem(STORAGE_KEYS.API_KEY, state.apiKey);
  localStorage.setItem(STORAGE_KEYS.MODEL, state.model);
  updateApiBadge();
  closeSettings();
  showToast('Konfigurasi API berhasil disimpan!');
}

function openSavedProjects() {
  renderSavedProjectsList();
  els.modalSavedProjects.classList.remove('hidden');
}

function closeSavedProjects() {
  els.modalSavedProjects.classList.add('hidden');
}

function getSavedProjects() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
  } catch (e) {
    return [];
  }
}

function saveProjectToArchive(proj) {
  const list = getSavedProjects().filter(p => p.id !== proj.id);
  list.unshift(proj);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(list));
}

function renderSavedProjectsList() {
  // Make sure current project is saved to list
  if (state.project && state.project.id) {
    saveProjectToArchive(state.project);
  }

  const list = getSavedProjects();
  if (list.length === 0) {
    els.savedProjectsList.innerHTML = `<p class="text-slate-500 italic text-center py-6">Belum ada arsip proyek tersimpan.</p>`;
    return;
  }

  els.savedProjectsList.innerHTML = list.map(p => `
    <div class="p-3 rounded-xl bg-dark-card border border-dark-border flex items-center justify-between gap-2">
      <div>
        <h4 class="font-bold text-white text-xs">${p.title || 'Untitled'}</h4>
        <span class="text-[10px] text-slate-400">${p.date} • ${p.scenes?.length || 0} Scene • Level ${p.continuityLevel}</span>
      </div>
      <div class="flex items-center gap-1.5">
        <button class="btn-load-proj text-xs font-semibold px-2.5 py-1 rounded bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30" data-id="${p.id}">
          Buka
        </button>
        <button class="btn-del-proj text-xs p-1 text-slate-500 hover:text-red-400" data-id="${p.id}">
          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.btn-load-proj').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.dataset.id;
      const target = getSavedProjects().find(p => p.id === id);
      if (target) {
        state.project = target;
        saveCurrentProject();
        renderAll();
        closeSavedProjects();
        showToast(`Proyek "${target.title}" dibuka!`);
      }
    });
  });

  document.querySelectorAll('.btn-del-proj').forEach(b => {
    b.addEventListener('click', () => {
      const id = b.dataset.id;
      const filtered = getSavedProjects().filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(filtered));
      renderSavedProjectsList();
      showToast('Proyek dihapus dari arsip.');
    });
  });

  lucide.createIcons();
}

function createNewProject() {
  if (confirm('Mulai proyek baru? Proyek saat ini otomatis tersimpan di arsip.')) {
    saveProjectToArchive(state.project);
    resetProject();
    renderAll();
    switchTab('tab-source');
    showToast('Proyek baru siap dimulai!');
  }
}

function handleImportJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (imported.id) {
        state.project = imported;
        saveProjectToArchive(imported);
        saveCurrentProject();
        renderAll();
        closeSavedProjects();
        showToast('Proyek berhasil diimpor!');
      } else {
        showToast('Format JSON tidak valid.');
      }
    } catch (err) {
      showToast('Gagal membaca file JSON.');
    }
  };
  reader.readAsText(file);
}

// ==========================================
// 11. TOAST NOTIFICATION
// ==========================================

function showToast(msg) {
  els.toastMsg.textContent = msg;
  els.toast.classList.remove('translate-y-12', 'opacity-0', 'pointer-events-none');
  els.toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    els.toast.classList.add('translate-y-12', 'opacity-0', 'pointer-events-none');
    els.toast.classList.remove('translate-y-0', 'opacity-100');
  }, 2500);
}
