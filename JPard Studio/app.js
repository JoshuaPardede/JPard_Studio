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

  // Tab 1: Source
  inputReference: document.getElementById('inputReference'),
  imageDropzone: document.getElementById('imageDropzone'),
  inputImageRef: document.getElementById('inputImageRef'),
  imageDropPrompt: document.getElementById('imageDropPrompt'),
  imagePreviewContainer: document.getElementById('imagePreviewContainer'),
  imagePreviewImg: document.getElementById('imagePreviewImg'),
  btnRemoveImage: document.getElementById('btnRemoveImage'),
  imageInfoText: document.getElementById('imageInfoText'),
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
  btnProceedToScenes: document.getElementById('btnProceedToScenes'),

  // Tab 3: Scenes
  selectImageEngine: document.getElementById('selectImageEngine'),
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
    } catch (e) {
      resetProject();
    }
  } else {
    resetProject();
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
  // Navigation Tabs
  els.navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.tab;
      switchTab(tabId);
    });
  });

  // Proceed buttons
  els.btnProceedToDirector?.addEventListener('click', () => switchTab('tab-director'));
  els.btnProceedToScenes?.addEventListener('click', () => switchTab('tab-scenes'));

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

  // Image Reference Dropzone
  els.imageDropzone?.addEventListener('click', (e) => {
    if (e.target !== els.btnRemoveImage && !els.btnRemoveImage?.contains(e.target)) {
      els.inputImageRef.click();
    }
  });

  els.inputImageRef?.addEventListener('change', handleImageUpload);

  els.imageDropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    els.imageDropzone.classList.add('border-orange-500');
  });

  els.imageDropzone?.addEventListener('dragleave', () => {
    els.imageDropzone.classList.remove('border-orange-500');
  });

  els.imageDropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    els.imageDropzone.classList.remove('border-orange-500');
    if (e.dataTransfer.files?.[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  });

  els.btnRemoveImage?.addEventListener('click', (e) => {
    e.stopPropagation();
    removeImageRef();
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

    saveCurrentProject();
    renderMasterPackUI();
    renderScenesUI();
    renderQCMatrixUI();
    renderAssembleUI();

    showToast('Master Production Pack & 6 Scene berhasil dibuat!');
  } catch (err) {
    console.error(err);
    showToast(`Error: ${err.message}. Menggunakan generator pintar.`);
    const fallback = generateSmartMasterAndScenes(state.project.sourcePack, state.project.theme, state.project.continuityLevel);
    state.project.masterPack = fallback.masterPack;
    state.project.scenes = fallback.scenes;
    saveCurrentProject();
    renderMasterPackUI();
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
// MULTIMODAL IMAGE REFERENCE HANDLERS
// ------------------------------------------

function handleImageUpload(e) {
  const file = e.target.files?.[0];
  if (file) {
    processImageFile(file);
  }
}

function processImageFile(file) {
  if (!file.type.startsWith('image/')) {
    showToast('Harap pilih file gambar (.jpg, .png, .webp)!');
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    showToast('Ukuran gambar maksimal 10MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const dataUrl = event.target.result;
    const base64Data = dataUrl.split(',')[1];
    state.project.imageReference = {
      name: file.name,
      size: file.size,
      mimeType: file.type,
      dataUrl: dataUrl,
      data: base64Data
    };
    saveCurrentProject();
    renderImageRefUI();
    showToast('Foto referensi visual berhasil dimuat!');
  };
  reader.readAsDataURL(file);
}

function removeImageRef() {
  state.project.imageReference = null;
  if (els.inputImageRef) els.inputImageRef.value = '';
  saveCurrentProject();
  renderImageRefUI();
  showToast('Foto referensi dihapus.');
}

// ------------------------------------------
// AI SOUNDTRACK & MUSIC GENERATOR (SUNO / UDIO)
// ------------------------------------------

async function handleGenerateSoundtrack() {
  if (!state.project.masterPack) {
    showToast('Selesaikan Fase 02 (Master Production Pack) terlebih dahulu!');
    return;
  }

  els.btnGenerateSoundtrack.disabled = true;
  els.btnGenerateSoundtrack.innerHTML = `<span class="animate-spin inline-block mr-1.5">⏳</span> Merancang Soundtrack AI...`;

  try {
    let soundtrackData = null;

    if (state.apiKey && state.apiKey.trim().length > 10) {
      const sysPrompt = `You are an elite film composer and AI music director specialized in 60-second cinematic short video scoring (Suno AI & Udio). You create tightly synchronized music prompts matching a 6-scene story progression. Output strictly valid JSON.`;

      const userPrompt = `Create a 60-second soundtrack prompt for Suno AI and Udio based on this video:
Title: "${state.project.masterPack.title}"
Concept: "${state.project.masterPack.concept}"
Genre: "${state.project.masterPack.genre}"
Visual Style: "${state.project.masterPack.visualStyle}"
Tone: "${state.project.masterPack.tone}"

6 Scenes Arc:
${(state.project.scenes || []).map(s => `Scene ${s.number} (${s.title}): ${s.storyFunction} | SFX: ${s.sfx}`).join('\n')}

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
        soundtrackData = JSON.parse(cleaned);
      }
    }

    if (!soundtrackData) {
      soundtrackData = generateSmartSoundtrack(state.project.masterPack, state.project.scenes);
    }

    state.project.soundtrack = soundtrackData;
    saveCurrentProject();
    renderSoundtrackUI();
    showToast('Soundtrack & Music Prompt berhasil dibuat!');
  } catch (err) {
    console.error(err);
    showToast(`Error: ${err.message}. Menggunakan aransemen pintar.`);
    const fallback = generateSmartSoundtrack(state.project.masterPack, state.project.scenes);
    state.project.soundtrack = fallback;
    saveCurrentProject();
    renderSoundtrackUI();
  } finally {
    els.btnGenerateSoundtrack.disabled = false;
    els.btnGenerateSoundtrack.innerHTML = `<i data-lucide="sparkles" class="w-3.5 h-3.5"></i><span>Generate Music Prompt</span>`;
    lucide.createIcons();
  }
}

// ------------------------------------------
// AI IMAGE GENERATOR ENGINE (BANANA PRO & FLUX)
// ------------------------------------------

async function callImageGeneration(promptText, aspectRatio = '9:16') {
  const engine = els.selectImageEngine?.value || 'banana-pro';

  // Sanitize prompt text for text-to-image
  const cleanPrompt = promptText
    .replace(/--ar\s+9:16/gi, '')
    .replace(/--no\s+[^,]+/gi, '')
    .trim();

  // Tier 1: Gemini Interactions API / Banana Pro if API key provided
  if (engine === 'banana-pro' && state.apiKey && state.apiKey.trim().length > 10) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/interactions`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'x-goog-api-key': state.apiKey.trim(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gemini-3.1-flash-image',
          input: [
            { type: 'text', text: `${cleanPrompt}, 9:16 vertical aspect ratio, 8k resolution, cinematic masterpiece` }
          ]
        })
      });

      if (res.ok) {
        const data = await res.json();
        const base64Data = data?.output_image?.data || data?.interaction?.output_image?.data;
        if (base64Data) {
          return `data:image/png;base64,${base64Data}`;
        }
      }
    } catch (e) {
      console.warn('Banana Pro API attempt failed, falling back to Flux Pro:', e);
    }
  }

  // Tier 2: Pollinations Flux Engine (High-Resolution 9:16 Vertical Instant Free Engine)
  const seed = Math.floor(Math.random() * 900000) + 100000;
  const encoded = encodeURIComponent(`${cleanPrompt}, 8k resolution, cinematic lighting, 35mm film photography, 9:16 vertical aspect ratio`);
  return `https://image.pollinations.ai/prompt/${encoded}?width=768&height=1344&model=flux&seed=${seed}&nologo=true`;
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

  if (canvasEl) {
    canvasEl.innerHTML = `
      <div class="w-full h-full min-h-[360px] rounded-xl animate-shimmer flex flex-col items-center justify-center p-6 text-center space-y-3 bg-[#06080d]">
        <div class="w-10 h-10 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></div>
        <div class="text-xs font-bold text-amber-300">Rendering Master Frame 0${sceneNum}...</div>
        <div class="text-[10px] text-slate-400 font-mono">9:16 Vertical • Aspect Ratio Lock</div>
      </div>
    `;
  }

  try {
    const imgUrl = await callImageGeneration(scene.masterFramePrompt, '9:16');
    scene.imageUrl = imgUrl;
    saveCurrentProject();
    renderScenesUI();
    showToast(`Master Frame Scene 0${sceneNum} selesai!`);
  } catch (err) {
    console.error(err);
    showToast(`Gagal render Scene 0${sceneNum}: ${err.message}`);
    renderScenesUI();
  }
}

async function handleGenerateAllMasterFrames() {
  const scenes = state.project.scenes || [];
  if (scenes.length === 0) {
    showToast('Selesaikan Fase 02 & 03 terlebih dahulu!');
    return;
  }

  els.btnGenerateAllImages.disabled = true;
  els.btnGenerateAllImages.innerHTML = `<span class="animate-spin inline-block mr-1.5">⏳</span> Rendering 6 Master Frames...`;

  try {
    for (const scene of scenes) {
      showToast(`Merender Master Frame 0${scene.number}...`);
      await generateSceneImage(scene.number);
    }
    showToast('Semua 6 Master Frame selesai di-render!');
  } catch (err) {
    console.error(err);
    showToast(`Error: ${err.message}`);
  } finally {
    els.btnGenerateAllImages.disabled = false;
    els.btnGenerateAllImages.innerHTML = `<i data-lucide="palette" class="w-4 h-4"></i><span>Generate Semua 6 Master Frame</span>`;
    lucide.createIcons();
  }
}

function openImageModal(url) {
  if (!url) return;
  els.modalPreviewImg.src = url;
  els.btnDownloadModalImg.href = url;
  els.modalImagePreview.classList.remove('hidden');
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
    els.imageDropPrompt.classList.add('hidden');
    els.imagePreviewContainer.classList.remove('hidden');
    els.imagePreviewImg.src = imgRef.dataUrl;
    els.imageInfoText.textContent = `${imgRef.name || 'reference_image.jpg'} (${Math.round((imgRef.size || 0) / 1024)} KB)`;
  } else {
    els.imageDropPrompt.classList.remove('hidden');
    els.imagePreviewContainer.classList.add('hidden');
    els.imagePreviewImg.src = '';
    els.imageInfoText.textContent = '';
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

function renderSoundtrackUI() {
  const mp = state.project.masterPack;
  const st = state.project.soundtrack;

  if (!mp) {
    els.soundtrackContainer.classList.add('hidden');
    return;
  }

  els.soundtrackContainer.classList.remove('hidden');

  if (!st) {
    els.soundtrackResultBox.innerHTML = `
      <div class="p-4 rounded-xl bg-dark-card border border-dark-border text-center space-y-2">
        <p class="text-xs text-slate-300 font-medium">Master Pack telah disetujui! Ingin membuat prompt soundtrack musik khusus untuk short video ini?</p>
        <p class="text-[11px] text-slate-500">Klik tombol &ldquo;Generate Music Prompt&rdquo; di atas untuk menyusun prompt Suno / Udio AI berdurasi 60 detik yang selaras dengan 6 scene.</p>
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
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <i data-lucide="image" class="w-3.5 h-3.5"></i>
                <span>Visual Master Frame (9:16)</span>
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
                  <p class="text-[10px] text-slate-500">Klik tombol di bawah untuk render AI gambar vertikal 9:16</p>
                </div>
              `}
            </div>

            <!-- Action Button -->
            <button class="btn-gen-scene-img w-full py-2.5 rounded-xl ${scene.imageUrl ? 'bg-dark-card hover:bg-dark-hover text-slate-300 border border-dark-border' : 'bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-black font-extrabold shadow-lg shadow-amber-600/20'} text-xs font-bold transition flex items-center justify-center gap-1.5" data-scene="${scene.number}">
              <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
              <span>${scene.imageUrl ? 'Regenerate Frame (9:16)' : 'Generate Master Frame (9:16)'}</span>
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
    return;
  }

  let html = scenes.map(s => `
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

  if (state.project.soundtrack) {
    const st = state.project.soundtrack;
    html += `
      <div class="mt-4 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2 text-xs">
        <div class="flex items-center justify-between">
          <strong class="text-emerald-400 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
            <i data-lucide="music" class="w-3.5 h-3.5"></i>
            <span>Soundtrack Cue (Suno / Udio AI): ${st.title}</span>
          </strong>
          <span class="text-[10px] text-slate-400 font-mono">${st.bpm} • ${st.mood}</span>
        </div>
        <p class="text-slate-300 font-mono text-[11px] bg-[#05070c] p-2.5 rounded-lg border border-dark-border select-all max-h-24 overflow-y-auto">
          ${st.fullPrompt}
        </p>
      </div>
    `;
  }

  els.voiceoverScriptContent.innerHTML = html;
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

${p.soundtrack ? `## 3. SOUNDTRACK & MUSIC SPEC (SUNO / UDIO)
- **Title**: ${p.soundtrack.title}
- **Genre & Tags**: ${p.soundtrack.genreTags}
- **BPM & Mood**: ${p.soundtrack.bpm} • ${p.soundtrack.mood}
- **Full Music Prompt**:
\`\`\`
${p.soundtrack.fullPrompt}
\`\`\`
` : ''}

## 4. SCENE BREAKDOWN (6 SCENES)
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
