const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const overlay = document.getElementById("overlay");
const finalScoreEl = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");
const mainMenu = document.getElementById("mainMenu");
const playBtn = document.getElementById("playBtn");
const recordBtn = document.getElementById("recordBtn");
const recordPopup = document.getElementById("recordPopup");
const closeRecordBtn = document.getElementById("closeRecordBtn");
const shopOverlay = document.getElementById("shopOverlay");
const shopTitleEl = document.getElementById("shopTitle");
const shopCoinsEl = document.getElementById("shopCoins");
const continueBtn = document.getElementById("continueBtn");
const extraCoinsBtn = document.getElementById("extraCoinsBtn");
const shieldBtn = document.getElementById("shieldBtn");
const secondJumpBtn = document.getElementById("secondJumpBtn");
const shopMessageEl = document.getElementById("shopMessage");
const inGameMenuBtn = document.getElementById("inGameMenuBtn");
const recordHurdlesEl = document.getElementById("recordHurdles");
const recordTimeEl = document.getElementById("recordTime");
const recordDeathsEl = document.getElementById("recordDeaths");
const completionOverlay = document.getElementById("completionOverlay");
const completionMainMenuBtn = document.getElementById("completionMainMenuBtn");
const profileSwitcher = document.querySelector(".profile-switcher");
const closeProfileSwitcherBtn = document.getElementById("closeProfileSwitcherBtn");
const profilePrevBtn = document.getElementById("profilePrevBtn");
const profileNextBtn = document.getElementById("profileNextBtn");
const activeProfileNameEl = document.getElementById("activeProfileName");
const profileNameEditor = document.getElementById("profileNameEditor");
const profileNameInput = document.getElementById("profileNameInput");
const saveProfileNameBtn = document.getElementById("saveProfileNameBtn");
const cancelProfileNameBtn = document.getElementById("cancelProfileNameBtn");
let editProfileNameBtn = document.getElementById("editProfileNameBtn");
if (!editProfileNameBtn) {
  const profileControls = document.querySelector(".profile-controls");
  if (profileControls) {
    editProfileNameBtn = document.createElement("button");
    editProfileNameBtn.id = "editProfileNameBtn";
    editProfileNameBtn.className = "profile-btn profile-edit-btn";
    editProfileNameBtn.type = "button";
    editProfileNameBtn.textContent = "Edit Name";
    profileControls.appendChild(editProfileNameBtn);
  }
}

const W = canvas.width;
const H = canvas.height;
const GROUND_Y = 402;
const PIX = 4;
const LEGACY_RECORDS_KEY = "grandPrixRecords";
const PROFILE_RECORDS_KEY = "grandPrixRecordsByProfile";
const ACTIVE_PROFILE_KEY = "grandPrixActiveProfile";
const PROFILE_NAMES_KEY = "grandPrixProfileNames";
const DEFAULT_PROFILE_NAMES = ["Profile 1", "Profile 2", "Profile 3"];
const PROFILE_SLOT_COUNT = DEFAULT_PROFILE_NAMES.length;
const START_SPEED = 245;
const COIN_VALUE = 2;
const UPGRADED_COIN_VALUE = 3;
const EXTRA_COINS_COST = 10;
const SHIELD_COST = 10;
const SECOND_JUMP_COST = 10;
const SECOND_JUMP_COOLDOWN = 2.6;
const COIN_SPAWN_CHANCE = 0.32;
const LEVEL_END_CLEAR_ZONE = 320;
const LEVEL_END_NO_SPAWN_BUFFER = 420;
const CROSS_COUNTRY_GRASS_SCROLL = 0.38;
const LEVEL_START_FENCE_X = 800;
const LEVELS = [
  { name: "Easy", length: 6500 },
  { name: "Cross Country", length: 6500 },
  { name: "Indoor Arena", length: 6500 },
];
const LEVEL_TUNING = [
  { speedMin: 300, speedMax: 340, accelMin: 4.6, accelMax: 5.6, spawnMin: 1.22, spawnMax: 1.04 },
  { speedMin: 370, speedMax: 440, accelMin: 6.8, accelMax: 8.2, spawnMin: 0.9, spawnMax: 0.72 },
  { speedMin: 425, speedMax: 495, accelMin: 8.0, accelMax: 9.6, spawnMin: 0.76, spawnMax: 0.58 },
];
const LEVEL_TOTAL_DISTANCE = LEVELS.reduce((sum, level) => sum + level.length, 0);
const profileState = {
  activeIndex: 0,
  names: [...DEFAULT_PROFILE_NAMES],
};

const world = {
  distance: 0,
  speed: START_SPEED,
  maxSpeed: 300,
  accel: 4.5,
  running: false,
  obstacleTimer: 0,
  nextSpawn: 1.2,
  spawnBase: 1.2,
  difficulty: 0,
  levelIndex: 0,
  levelName: LEVELS[0].name,
  levelProgress: 0,
  totalProgress: 0,
  coins: 0,
  extraCoinsPurchased: false,
  shieldCharges: 0,
  secondJumpPurchased: false,
  secondJumpCooldown: 0,
  levelCoinCount: 0,
  levelFenceCount: 0,
  pendingLevelIndex: null,
  lastT: 0,
};

let sessionHurdles = 0;
let sessionTimeSec = 0;

const horse = {
  x: 180,
  y: GROUND_Y - 80,
  w: 112,
  h: 80,
  vy: 0,
  gravity: 1850,
  jumpPower: 710,
  jumpCut: 0.52,
  grounded: true,
  anim: 0,
  fastFall: false,
};

const horseSprite = {
  img: new Image(),
  source: null,
  crop: null,
  ready: false,
};

initHorseSprite();

const fences = [];
const clouds = makeClouds();
const bleachers = makeBleachers();
const banners = makeBanners();
const shrubs = makeShrubs();
const trees = makeTrees();
const flowers = makeFlowers();
const arenaLights = makeArenaLights();

function makeClouds() {
  return Array.from({ length: 7 }, (_, i) => ({
    x: i * 190 + 120,
    y: 52 + (i % 3) * 24,
    w: 70 + (i % 4) * 18,
    speedScale: 0.2 + (i % 3) * 0.06,
  }));
}

function makeBanners() {
  return Array.from({ length: 11 }, (_, i) => ({
    x: i * 150,
    h: 56 + (i % 3) * 18,
    c: i % 2 === 0 ? "#27577a" : "#3f8fbf",
  }));
}

function makeBleachers() {
  return Array.from({ length: 5 }, (_, i) => ({
    x: i * 360 + 220,
    w: 120 + (i % 2) * 28,
    h: 42 + (i % 3) * 10,
  }));
}

function makeShrubs() {
  return Array.from({ length: 10 }, (_, i) => ({
    x: i * 230 + 30,
    r: 20 + (i % 3) * 8,
    tone: i % 2 ? "#6eb973" : "#5aa960",
  }));
}

function makeTrees() {
  return Array.from({ length: 9 }, (_, i) => ({
    x: i * 220 + 60,
    trunkH: 28 + (i % 3) * 8,
    crownW: 52 + (i % 3) * 10,
    crownH: 34 + (i % 2) * 10,
  }));
}

function makeFlowers() {
  return Array.from({ length: 68 }, (_, i) => ({
    x: i * 42 + 10,
    yOffset: (i % 5) * 3,
    tone: i % 5 === 0
      ? "#f48cb0"
      : i % 5 === 1
        ? "#c77dff"
        : i % 5 === 2
          ? "#ff8ad9"
          : i % 5 === 3
            ? "#9b6dff"
            : "#f4d94e",
  }));
}

function makeArenaLights() {
  return Array.from({ length: 9 }, (_, i) => ({
    x: i * 170 + 30,
    y: 50 + (i % 2) * 14,
    w: 52 + (i % 3) * 10,
  }));
}

function resetGame() {
  world.distance = 0;
  world.speed = START_SPEED;
  world.accel = 4.5;
  world.maxSpeed = 300;
  world.running = false;
  world.obstacleTimer = 0;
  world.nextSpawn = 1.2;
  world.spawnBase = 1.2;
  world.difficulty = 0;
  world.levelIndex = 0;
  world.levelName = LEVELS[0].name;
  world.levelProgress = 0;
  world.totalProgress = 0;
  world.coins = 0;
  world.extraCoinsPurchased = false;
  world.shieldCharges = 0;
  world.secondJumpPurchased = false;
  world.secondJumpCooldown = 0;
  world.levelCoinCount = 0;
  world.levelFenceCount = 0;
  world.pendingLevelIndex = null;
  world.lastT = 0;

  horse.y = GROUND_Y - horse.h;
  horse.vy = 0;
  horse.grounded = true;
  horse.anim = 0;
  horse.fastFall = false;
  sessionHurdles = 0;
  sessionTimeSec = 0;

  fences.length = 0;
  overlay.classList.add("hidden");
  shopOverlay.classList.add("hidden");
  completionOverlay.classList.add("hidden");
}

function startGame() {
  resetGame();
  setupLevelStart(0);
  world.running = true;
  mainMenu.classList.add("hidden");
  recordPopup.classList.add("hidden");
}

function getRecords() {
  const store = getStoredProfileRecords();
  const profileId = String(profileState.activeIndex);
  if (store[profileId]) return normalizeRecords(store[profileId]);
  if (profileState.activeIndex === 0) {
    try {
      const raw = localStorage.getItem(LEGACY_RECORDS_KEY);
      if (raw) return normalizeRecords(JSON.parse(raw));
    } catch {
      // Ignore bad legacy records.
    }
  }
  return normalizeRecords({});
}

function getStoredProfileRecords() {
  try {
    const raw = localStorage.getItem(PROFILE_RECORDS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveRecords(records) {
  const store = getStoredProfileRecords();
  store[String(profileState.activeIndex)] = normalizeRecords(records);
  try {
    localStorage.setItem(PROFILE_RECORDS_KEY, JSON.stringify(store));
    if (profileState.activeIndex === 0) localStorage.removeItem(LEGACY_RECORDS_KEY);
  } catch {
    // Ignore storage failures.
  }
}

function normalizeRecords(parsed) {
  return {
    hurdles: Number.isFinite(parsed?.hurdles) ? Math.max(0, parsed.hurdles) : 0,
    timeSec: Number.isFinite(parsed?.timeSec) ? Math.max(0, parsed.timeSec) : 0,
    deaths: Number.isFinite(parsed?.deaths) ? Math.max(0, parsed.deaths) : 0,
  };
}

function normalizeProfileName(name, fallback) {
  const cleaned = String(name || "").replace(/\s+/g, " ").trim().slice(0, 18);
  return cleaned || fallback;
}

function loadProfileNames() {
  try {
    const raw = localStorage.getItem(PROFILE_NAMES_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const loaded = Array.isArray(parsed) ? parsed : [];
    return DEFAULT_PROFILE_NAMES.map((fallback, i) => normalizeProfileName(loaded[i], fallback));
  } catch {
    return [...DEFAULT_PROFILE_NAMES];
  }
}

function saveProfileNames(names) {
  try {
    localStorage.setItem(PROFILE_NAMES_KEY, JSON.stringify(names));
  } catch {
    // Ignore storage failures.
  }
}

function loadActiveProfile() {
  try {
    const raw = Number.parseInt(localStorage.getItem(ACTIVE_PROFILE_KEY) || "0", 10);
    if (Number.isNaN(raw)) return 0;
    return clamp(raw, 0, PROFILE_SLOT_COUNT - 1);
  } catch {
    return 0;
  }
}

function renderActiveProfile() {
  activeProfileNameEl.textContent = profileState.names[profileState.activeIndex];
}

function setActiveProfile(index) {
  const count = PROFILE_SLOT_COUNT;
  profileState.activeIndex = ((index % count) + count) % count;
  try {
    localStorage.setItem(ACTIVE_PROFILE_KEY, String(profileState.activeIndex));
  } catch {
    // Ignore storage failures.
  }
  closeProfileNameEditor();
  renderActiveProfile();
  renderRecords();
}

function editActiveProfileName() {
  if (!profileNameEditor || !profileNameInput) return;
  const i = profileState.activeIndex;
  profileNameInput.value = profileState.names[i] || DEFAULT_PROFILE_NAMES[i];
  profileNameEditor.classList.remove("hidden");
  profileNameInput.focus();
  profileNameInput.select();
}

function closeProfileNameEditor() {
  if (!profileNameEditor) return;
  profileNameEditor.classList.add("hidden");
}

function saveActiveProfileName() {
  if (!profileNameInput) return;
  const i = profileState.activeIndex;
  profileState.names[i] = normalizeProfileName(profileNameInput.value, DEFAULT_PROFILE_NAMES[i]);
  saveProfileNames(profileState.names);
  renderActiveProfile();
  closeProfileNameEditor();
}

function closeProfileSwitcher() {
  closeProfileNameEditor();
  if (!profileSwitcher) return;
  profileSwitcher.classList.add("hidden");
  profileSwitcher.style.display = "none";
  profileSwitcher.setAttribute("aria-hidden", "true");
}

function formatDuration(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function renderRecords() {
  const records = getRecords();
  recordHurdlesEl.textContent = String(records.hurdles);
  recordTimeEl.textContent = formatDuration(records.timeSec);
  recordDeathsEl.textContent = String(records.deaths);
}

function openRecordPopup() {
  renderRecords();
  recordPopup.classList.remove("hidden");
}

function closeRecordPopup() {
  recordPopup.classList.add("hidden");
}

function getLevelStartDistance(index) {
  let start = 0;
  for (let i = 0; i < index; i += 1) start += LEVELS[i].length;
  return start;
}

function getLevelEndDistance(index) {
  return getLevelStartDistance(index) + LEVELS[index].length;
}

function setupLevelStart(levelIndex) {
  world.distance = getLevelStartDistance(levelIndex) + 1;
  const levelState = getLevelState(world.distance);
  world.levelIndex = levelState.index;
  world.levelName = levelState.name;
  world.levelProgress = levelState.levelProgress;
  world.totalProgress = levelState.totalProgress;
  world.difficulty = levelState.difficulty;
  world.maxSpeed = levelState.speedCap;
  world.accel = levelState.accel;
  world.spawnBase = levelState.spawnBase;
  world.nextSpawn = clamp(levelState.spawnBase * 0.7 * getSpeedSpawnMultiplier(), 0.45, 1.7);
  world.obstacleTimer = 0;
  fences.length = 0;
  world.levelCoinCount = 0;
  world.levelFenceCount = 0;
  // Place one earlier hurdle so each level starts quicker.
  spawnFence(LEVEL_START_FENCE_X, true);
}

function openShopAfterLevel(levelName, nextLevelIndex) {
  world.running = false;
  world.pendingLevelIndex = nextLevelIndex;
  world.obstacleTimer = 0;
  fences.length = 0;
  shopTitleEl.textContent = `${levelName} Complete`;
  updateShopUi();
  shopMessageEl.textContent = "Choose an upgrade, then continue.";
  continueBtn.textContent = `Start ${LEVELS[nextLevelIndex].name}`;
  shopOverlay.classList.remove("hidden");
}

function continueFromShop() {
  if (world.pendingLevelIndex == null) return;
  const nextIndex = world.pendingLevelIndex;
  world.pendingLevelIndex = null;
  setupLevelStart(nextIndex);
  shopOverlay.classList.add("hidden");
  world.running = true;
}

function openCompletionMessage() {
  world.running = false;
  world.pendingLevelIndex = null;
  world.obstacleTimer = 0;
  fences.length = 0;
  shopOverlay.classList.add("hidden");
  overlay.classList.add("hidden");
  completionOverlay.classList.remove("hidden");
}

function updateShopUi() {
  shopCoinsEl.textContent = `Coins: ${world.coins}`;
  if (world.extraCoinsPurchased) {
    extraCoinsBtn.disabled = true;
    extraCoinsBtn.textContent = "X-tra Coins (Owned)";
  } else {
    extraCoinsBtn.disabled = false;
    extraCoinsBtn.textContent = `X-tra Coins - ${EXTRA_COINS_COST} Coins`;
  }
  shieldBtn.disabled = false;
  shieldBtn.textContent = world.shieldCharges > 0
    ? `Shield - ${SHIELD_COST} Coins (x${world.shieldCharges})`
    : `Shield - ${SHIELD_COST} Coins`;
  if (world.secondJumpPurchased) {
    secondJumpBtn.disabled = true;
    secondJumpBtn.textContent = "Second Jump (Owned)";
  } else {
    secondJumpBtn.disabled = false;
    secondJumpBtn.textContent = `Second Jump - ${SECOND_JUMP_COST} Coins`;
  }
}

function buyExtraCoins() {
  if (world.extraCoinsPurchased) {
    shopMessageEl.textContent = "X-tra Coins already purchased this game.";
    return;
  }
  if (world.coins < EXTRA_COINS_COST) {
    shopMessageEl.textContent = `Need ${EXTRA_COINS_COST} coins.`;
    return;
  }
  world.coins -= EXTRA_COINS_COST;
  world.extraCoinsPurchased = true;
  updateShopUi();
  shopMessageEl.textContent = "Gain 3 coins per coin.";
}

function buyShield() {
  if (world.coins < SHIELD_COST) {
    shopMessageEl.textContent = `Need ${SHIELD_COST} coins.`;
    return;
  }
  world.coins -= SHIELD_COST;
  world.shieldCharges += 1;
  updateShopUi();
  shopMessageEl.textContent = `Shield ready. Charges: ${world.shieldCharges}.`;
}

function buySecondJump() {
  if (world.secondJumpPurchased) {
    shopMessageEl.textContent = "Second Jump already purchased this game.";
    return;
  }
  if (world.coins < SECOND_JUMP_COST) {
    shopMessageEl.textContent = `Need ${SECOND_JUMP_COST} coins.`;
    return;
  }
  world.coins -= SECOND_JUMP_COST;
  world.secondJumpPurchased = true;
  world.secondJumpCooldown = 0;
  updateShopUi();
  shopMessageEl.textContent = "Second Jump unlocked. It has a cooldown.";
}

function returnToMainMenu() {
  world.running = false;
  resetGame();
  mainMenu.classList.remove("hidden");
  recordPopup.classList.add("hidden");
}

function commitRunRecords() {
  const records = getRecords();
  const updated = {
    hurdles: records.hurdles + sessionHurdles,
    timeSec: records.timeSec + sessionTimeSec,
    deaths: records.deaths + 1,
  };
  saveRecords(updated);
  renderRecords();
}

function getLevelState(distance) {
  let covered = 0;
  for (let i = 0; i < LEVELS.length; i += 1) {
    const level = LEVELS[i];
    const end = covered + level.length;
    if (distance <= end) {
      const tuning = LEVEL_TUNING[i];
      const levelDistance = distance - covered;
      const levelProgress = clamp(levelDistance / level.length, 0, 1);
      const totalProgress = clamp(distance / LEVEL_TOTAL_DISTANCE, 0, 1);
      const difficulty = clamp((covered + levelDistance) / LEVEL_TOTAL_DISTANCE, 0, 1);
      return {
        ...level,
        index: i,
        levelProgress,
        totalProgress,
        difficulty,
        speedCap: lerp(tuning.speedMin, tuning.speedMax, levelProgress),
        accel: lerp(tuning.accelMin, tuning.accelMax, levelProgress),
        spawnBase: lerp(tuning.spawnMin, tuning.spawnMax, levelProgress),
      };
    }
    covered = end;
  }

  const last = LEVELS[LEVELS.length - 1];
  const hard = LEVEL_TUNING[LEVEL_TUNING.length - 1];
  return {
    ...last,
    index: LEVELS.length - 1,
    levelProgress: 1,
    totalProgress: 1,
    difficulty: 1,
    speedCap: hard.speedMax,
    accel: hard.accelMax,
    spawnBase: hard.spawnMax,
  };
}

function spawnFence(startX = W + 40, forceCoin = false) {
  const level = world.levelIndex;
  const isCrossCountry = level === 1;
  const isIndoor = level === 2;
  let obstacleKind = "fence";
  if (isCrossCountry) obstacleKind = "bush";
  if (isIndoor) obstacleKind = Math.random() < 0.42 ? "woodjump" : "haybale";
  const baseByLevel = [40, 44, 48][level] || 48;
  const rangeByLevel = [12, 16, 18][level] || 18;
  const progressiveLift = Math.floor(world.levelProgress * (7 + level * 2));
  const h = clamp(baseByLevel + progressiveLift + randInt(0, rangeByLevel), 36, 84);
  const minW = obstacleKind === "bush" ? 34 : obstacleKind === "haybale" ? 36 : obstacleKind === "woodjump" ? 30 : 22;
  const maxW = obstacleKind === "bush" ? 56 : obstacleKind === "haybale" ? 56 : obstacleKind === "woodjump" ? 46 : 32;
  const w = randInt(minW, maxW);
  const rails = (obstacleKind === "fence" || obstacleKind === "woodjump")
    ? 2 + level + (world.levelProgress > 0.75 ? 1 : 0)
    : 0;
  const coinActive = forceCoin || Math.random() < COIN_SPAWN_CHANCE;
  const coinOffsetBase = obstacleKind === "fence" || obstacleKind === "woodjump" ? 42 : obstacleKind === "bush" ? 34 : 38;
  const coinOffsetY = coinOffsetBase + randInt(0, 18);
  const hasBerries = obstacleKind === "bush" && Math.random() < 0.55;
  world.levelFenceCount += 1;
  if (coinActive) world.levelCoinCount += 1;
  fences.push({
    x: startX,
    y: GROUND_Y - h,
    w,
    h,
    kind: obstacleKind,
    hasBerries,
    rails,
    passed: false,
    coinActive,
    coinOffsetY,
  });
}

function getSpeedSpawnMultiplier() {
  // Increase time between hurdles as speed climbs.
  const bonus = clamp((world.speed - START_SPEED) / 210, 0, 0.55);
  return 1 + bonus;
}

function getNextSpawnTime() {
  const levelDensityBonus = world.levelIndex * 0.1;
  const base = world.spawnBase - world.levelProgress * 0.05 - levelDensityBonus;
  const randomSpread = Math.max(0.16, 0.32 - world.levelIndex * 0.06);
  const raw = base + Math.random() * randomSpread;
  return clamp(raw * getSpeedSpawnMultiplier(), 0.52, 2.05);
}

function jump() {
  if (!world.running) return;
  if (horse.grounded) {
    horse.vy = -horse.jumpPower;
    horse.grounded = false;
    return;
  }
  if (world.secondJumpPurchased && world.secondJumpCooldown <= 0) {
    horse.vy = -horse.jumpPower * 0.95;
    world.secondJumpCooldown = SECOND_JUMP_COOLDOWN;
  }
}

function releaseJump() {
  if (horse.vy < 0) horse.vy *= horse.jumpCut;
}

function update(dt) {
  if (!world.running) return;

  sessionTimeSec += dt;
  if (world.secondJumpCooldown > 0) {
    world.secondJumpCooldown = Math.max(0, world.secondJumpCooldown - dt);
  }
  const activeLevelIndex = world.levelIndex;
  const activeLevelEnd = getLevelEndDistance(activeLevelIndex);
  const hasNextLevel = activeLevelIndex < LEVELS.length - 1;
  const runoutStartDistance = activeLevelEnd - LEVEL_END_CLEAR_ZONE;
  const noSpawnStartDistance = runoutStartDistance - LEVEL_END_NO_SPAWN_BUFFER;
  world.distance += world.speed * dt;
  if (world.distance >= activeLevelEnd) {
    world.distance = activeLevelEnd;
    world.levelName = LEVELS[activeLevelIndex].name;
    world.levelProgress = 1;
    world.totalProgress = clamp(world.distance / LEVEL_TOTAL_DISTANCE, 0, 1);
    if (hasNextLevel) {
      openShopAfterLevel(LEVELS[activeLevelIndex].name, activeLevelIndex + 1);
    } else {
      world.difficulty = 1;
      openCompletionMessage();
    }
    return;
  }
  const levelState = getLevelState(world.distance);
  world.levelIndex = levelState.index;
  world.levelName = levelState.name;
  world.levelProgress = levelState.levelProgress;
  world.totalProgress = levelState.totalProgress;
  world.difficulty = levelState.difficulty;
  world.maxSpeed = levelState.speedCap;
  world.accel = levelState.accel;
  world.spawnBase = levelState.spawnBase;
  world.speed = Math.min(world.maxSpeed, world.speed + world.accel * dt);

  horse.anim += dt * (8 + world.speed / 120);
  const gravityScale = horse.fastFall && !horse.grounded ? 2.15 : 1;
  horse.vy += horse.gravity * gravityScale * dt;
  horse.y += horse.vy * dt;

  if (horse.y >= GROUND_Y - horse.h) {
    horse.y = GROUND_Y - horse.h;
    horse.vy = 0;
    horse.grounded = true;
  }

  const inNoSpawnZone = world.distance >= noSpawnStartDistance;

  world.obstacleTimer += dt;
  if (!inNoSpawnZone && world.obstacleTimer >= world.nextSpawn) {
    world.obstacleTimer = 0;
    spawnFence();
    world.nextSpawn = getNextSpawnTime();
  }

  const hb = getHorseHitbox();
  for (let i = fences.length - 1; i >= 0; i -= 1) {
    const f = fences[i];
    f.x -= world.speed * dt;

    if (f.coinActive) {
      const coinHitbox = {
        x: f.x + f.w / 2 - 10,
        y: f.y - f.coinOffsetY - 10,
        w: 20,
        h: 20,
      };
      if (rectOverlap(hb, coinHitbox)) {
        f.coinActive = false;
        world.coins += world.extraCoinsPurchased ? UPGRADED_COIN_VALUE : COIN_VALUE;
      }
    }

    if (!f.passed && f.x + f.w < horse.x + 16) {
      f.passed = true;
      sessionHurdles += 1;
    }

    if (f.x + f.w < -60) fences.splice(i, 1);
  }

  for (const c of clouds) {
    c.x -= world.speed * c.speedScale * dt;
    if (c.x + c.w < -50) c.x = W + 40 + Math.random() * 300;
  }

  for (const b of banners) {
    b.x -= world.speed * 0.55 * dt;
    if (b.x < -60) b.x = W + 90 + Math.random() * 180;
  }

  for (const bl of bleachers) {
    bl.x -= world.speed * 0.3 * dt;
    if (bl.x + bl.w < -30) {
      bl.x = W + 160 + Math.random() * 360;
      bl.w = 110 + randInt(0, 36);
      bl.h = 38 + randInt(0, 16);
    }
  }

  for (const s of shrubs) {
    s.x -= world.speed * 0.8 * dt;
    if (s.x + s.r * 2 < -10) s.x = W + 100 + Math.random() * 220;
  }

  for (const t of trees) {
    t.x -= world.speed * 0.45 * dt;
    if (t.x + t.crownW < -40) t.x = W + 100 + Math.random() * 260;
  }

  for (const fl of flowers) {
    fl.x -= world.speed * CROSS_COUNTRY_GRASS_SCROLL * dt;
    if (fl.x < -20) fl.x = W + 80 + Math.random() * 240;
  }

  for (const light of arenaLights) {
    light.x -= world.speed * 0.18 * dt;
    if (light.x + light.w < -30) light.x = W + 120 + Math.random() * 200;
  }

  const collisionFenceIndex = getCollisionFenceIndex();
  if (collisionFenceIndex !== -1) {
    if (world.shieldCharges > 0) {
      world.shieldCharges -= 1;
      fences.splice(collisionFenceIndex, 1);
    } else {
      world.running = false;
      const score = Math.floor(world.distance);
      commitRunRecords();
      finalScoreEl.textContent = `Score: ${score}`;
      overlay.classList.remove("hidden");
    }
  }
}

function getCollisionFenceIndex() {
  const hb = getHorseHitbox();

  for (let i = 0; i < fences.length; i += 1) {
    const f = fences[i];
    const fb = getObstacleHitbox(f);
    if (rectOverlap(hb, fb)) return i;
  }
  return -1;
}

function getObstacleHitbox(f) {
  if (f.kind === "bush") {
    return {
      x: f.x + 4,
      y: f.y + 6,
      w: Math.max(16, f.w - 8),
      h: Math.max(14, f.h - 8),
    };
  }
  if (f.kind === "woodjump") {
    return {
      x: f.x + 4,
      y: f.y + 8,
      w: Math.max(14, f.w - 8),
      h: Math.max(14, f.h - 12),
    };
  }
  if (f.kind === "haybale") {
    return {
      x: f.x + 3,
      y: f.y + 5,
      w: Math.max(16, f.w - 6),
      h: Math.max(16, f.h - 7),
    };
  }
  return {
    x: f.x + 6,
    y: f.y + 10,
    w: Math.max(10, f.w - 12),
    h: Math.max(12, f.h - 16),
  };
}

function getHorseHitbox() {
  return {
    x: horse.x + 18,
    y: horse.y + 12,
    w: horse.w - 34,
    h: horse.h - 14,
  };
}

function rectOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function draw() {
  if (world.levelIndex === 1) {
    drawCrossCountryBackground();
    drawClouds();
    drawCrossCountryDecor();
    drawCrossCountryGround();
  } else if (world.levelIndex === 2) {
    drawIndoorBackground();
    drawIndoorDecor();
    drawIndoorGround();
  } else {
    drawArenaBackground();
    drawClouds();
    drawBleachers();
    drawStands();
    drawShrubs();
    drawGround();
  }
  drawProgressBar();

  for (const f of fences) {
    drawObstacle(f);
    drawFenceCoin(f);
  }

  drawHorse();
  drawScore();
}

function drawProgressBar() {
  const barW = 430;
  const barH = 16;
  const x = Math.floor((W - barW) / 2);
  const y = 18;

  ctx.fillStyle = "#16395c";
  ctx.fillRect(x, y, barW, barH);
  ctx.fillStyle = "#2e5f8b";
  ctx.fillRect(x + 2, y + 2, barW - 4, barH - 4);

  const fillW = Math.floor((barW - 4) * world.levelProgress);
  const fillColor = world.levelIndex === 0 ? "#7ad67a" : world.levelIndex === 1 ? "#f2c04f" : "#f08361";
  ctx.fillStyle = fillColor;
  ctx.fillRect(x + 2, y + 2, fillW, barH - 4);

  ctx.font = "bold 14px 'Trebuchet MS'";
  ctx.textAlign = "center";
  ctx.fillStyle = "#13324e";
  const levelPct = Math.floor(world.levelProgress * 100);
  ctx.fillText(`${world.levelName} ${levelPct}% (Level ${world.levelIndex + 1}/${LEVELS.length})`, x + barW / 2, y + 34);
}

function drawArenaBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#a5dbff");
  sky.addColorStop(0.58, "#dcf3ff");
  sky.addColorStop(0.59, "#9ad59d");
  sky.addColorStop(1, "#6eac75");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#bfe7b8";
  ctx.fillRect(0, 276, W, 50);

  ctx.fillStyle = "#6c8f6f";
  for (let i = 0; i < W; i += 18) {
    ctx.fillRect(i, 318 + ((i / 18) % 3), 14, 2);
  }
}

function drawCrossCountryBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#8fc9ff");
  sky.addColorStop(0.52, "#dff4ff");
  sky.addColorStop(0.53, "#a8d99b");
  sky.addColorStop(1, "#79b26b");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  const hillOffset = (world.distance * 0.08) % 220;
  for (let i = -1; i < 8; i += 1) {
    const x = i * 220 - hillOffset;
    px(x, 232, 180, 34, "#78ad6c");
    px(x + 20, 208, 140, 26, "#85bb78");
    px(x + 40, 188, 100, 20, "#97cb89");
  }

  px(0, 284, W, 48, "#8fcd78");
}

function drawCrossCountryDecor() {
  drawCrossCountryTrees();
  drawCrossCountryFlowers();
}

function drawCrossCountryTrees() {
  for (const t of trees) {
    const x = Math.floor(t.x);
    const trunkY = 312 - t.trunkH;
    const crownTop = trunkY - t.crownH;

    px(x + Math.floor(t.crownW / 2) - 5, trunkY, 10, t.trunkH, "#6d4b30");
    px(x, crownTop + 12, t.crownW, t.crownH, "#2f8a44");
    px(x + 8, crownTop + 4, t.crownW - 16, t.crownH - 6, "#43a85a");
    px(x + 14, crownTop - 6, t.crownW - 28, 12, "#67ca7d");
  }
}

function drawCrossCountryFlowers() {
  for (let i = 0; i < flowers.length; i += 1) {
    const fl = flowers[i];
    const x = Math.floor(fl.x);

    // Foreground flowers near the path.
    const yNear = GROUND_Y - 18 + fl.yOffset;
    px(x, yNear, 2, 10, "#4f933f");
    px(x - 3, yNear - 5, 8, 5, fl.tone);
    px(x - 1, yNear - 4, 4, 3, "#ffe9b5");

    // Background flower strip between trees and course.
    if (i % 2 === 0) {
      const yBack = 292 + (i % 3) * 2;
      px(x, yBack, 2, 7, "#5ea44b");
      px(x - 2, yBack - 3, 6, 4, fl.tone);
    }
  }
}

function drawCrossCountryGround() {
  px(0, GROUND_Y - 22, W, 24, "#74b964");
  px(0, GROUND_Y, W, H - GROUND_Y, "#8d653d");

  for (let i = 0; i < W; i += 22) {
    const wav = Math.sin((i + world.distance * 0.38) * 0.04) * 2;
    px(i, GROUND_Y + 11 + wav, 14, 3, "#b38553");
  }

  for (let i = 8; i < W; i += 30) {
    const y = GROUND_Y + 34 + ((i / 30) % 2) * 8;
    px(i, y, 10, 2, "#9f7447");
  }

  px(0, GROUND_Y - 2, W, 2, "#dcb47e");
}

function drawIndoorBackground() {
  const wall = ctx.createLinearGradient(0, 0, 0, H);
  wall.addColorStop(0, "#475267");
  wall.addColorStop(0.4, "#657289");
  wall.addColorStop(0.41, "#3f495e");
  wall.addColorStop(1, "#625542");
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < W; i += 64) {
    px(i, 54, 48, 10, "#2f3748");
  }

  for (let i = 0; i < W; i += 14) {
    const tone = (i / 14) % 2 ? "#2f384a" : "#415069";
    px(i, 248, 10, 18, tone);
  }

  px(0, 272, W, 8, "#d8deea");
  px(0, 280, W, 6, "#7f8ba2");
}

function drawIndoorDecor() {
  drawIndoorBleachers();

  for (const light of arenaLights) {
    const x = Math.floor(light.x);
    const y = Math.floor(light.y);
    px(x, y, light.w, 8, "#edf2ff");
    px(x + 4, y + 8, light.w - 8, 4, "#c7d1e6");
    px(x + Math.floor(light.w / 2) - 8, y + 12, 16, 14, "#fff0af");
    ctx.fillStyle = "#fff0af33";
    ctx.fillRect(x + Math.floor(light.w / 2) - 14, y + 24, 28, 120);
  }

  for (const b of banners) {
    const x = Math.floor(b.x);
    px(x, 130, 6, 136, "#2d3443");
    px(x + 6, 142, 30, 14, "#ae4646");
    px(x + 6, 158, 30, 14, "#f4e2ac");
    px(x + 6, 174, 30, 14, "#4373ad");
  }
}

function drawIndoorBleachers() {
  const baseY = 286;
  for (const bl of bleachers) {
    const x = Math.floor(bl.x);
    const y = baseY - bl.h;

    // Wooden bleacher tiers.
    px(x + 4, y + bl.h - 8, bl.w - 8, 6, "#7b5b3e");
    px(x + 12, y + bl.h - 18, bl.w - 24, 5, "#8d6a47");
    px(x + 20, y + bl.h - 28, bl.w - 40, 5, "#9f7a54");

    // Crowd hints.
    for (let i = 0; i < bl.w - 30; i += 12) {
      const tone = (i / 12) % 3 === 0 ? "#cc4f4f" : (i / 12) % 3 === 1 ? "#f0e0aa" : "#5b83c8";
      px(x + 15 + i, y + bl.h - 36 - ((i / 12) % 2) * 2, 6, 6, tone);
    }

    // Support beams.
    for (let i = 0; i < bl.w; i += 24) {
      px(x + i, y + bl.h - 2, 4, 14, "#5e432d");
    }
  }
}

function drawIndoorGround() {
  px(0, GROUND_Y - 4, W, 4, "#f2dcb5");
  px(0, GROUND_Y, W, H - GROUND_Y, "#c9a06a");

  for (let i = 0; i < W; i += 26) {
    const wav = Math.sin((i + world.distance * 0.28) * 0.03) * 1.4;
    px(i, GROUND_Y + 10 + wav, 14, 2, "#b88f5c");
  }

  for (let i = 6; i < W; i += 18) {
    const y = GROUND_Y + 28 + ((i / 18) % 3) * 6;
    px(i, y, 8, 2, "#a37a4b");
  }
}

function drawClouds() {
  ctx.fillStyle = "#ffffffcc";
  for (const c of clouds) {
    px(c.x, c.y + 8, c.w, 12);
    px(c.x + 12, c.y, c.w - 22, 16);
    px(c.x + 28, c.y + 4, c.w - 48, 18);
  }
}

function drawStands() {
  const yBase = 306;
  for (const b of banners) {
    px(b.x, yBase - b.h, 8, b.h + 2, "#27445f");
    px(b.x + 8, yBase - b.h + 5, 30, 16, b.c);
    px(b.x + 8, yBase - b.h + 5, 30, 4, "#d7edff");
  }

  px(0, yBase, W, 7, "#8fa8bb");
  px(0, yBase + 7, W, 8, "#6b849a");
}

function drawBleachers() {
  const baseY = 292;
  for (const bl of bleachers) {
    const x = Math.floor(bl.x);
    const y = baseY - bl.h;

    // Wooden seating tiers.
    px(x + 6, y + bl.h - 7, bl.w - 12, 6, "#7e5d3f");
    px(x + 15, y + bl.h - 18, bl.w - 30, 5, "#8f6b48");
    px(x + 24, y + bl.h - 29, bl.w - 48, 5, "#a17852");

    // Support posts.
    for (let i = 0; i < bl.w; i += 24) {
      px(x + i, y + bl.h - 2, 4, 14, "#6a4b31");
    }
  }
}

function drawShrubs() {
  for (const s of shrubs) {
    px(s.x, 322, s.r * 2, 24, s.tone);
    px(s.x + 6, 314, s.r * 2 - 12, 12, "#78c77d");
  }
}

function drawGround() {
  px(0, GROUND_Y, W, H - GROUND_Y, "#c79658");

  for (let i = 0; i < W; i += 24) {
    const wav = Math.sin((i + world.distance * 0.5) * 0.03) * 2;
    px(i, GROUND_Y + 12 + wav, 16, 3, "#b0834f");
  }

  for (let i = 0; i < W; i += 14) {
    const y = GROUND_Y + 44 + ((i / 14) % 3) * 5;
    px(i, y, 9, 2, "#9d6f43");
  }

  px(0, GROUND_Y - 2, W, 2, "#e5bd84");
}

function drawObstacle(f) {
  if (f.kind === "bush") {
    drawBushObstacle(f);
    return;
  }
  if (f.kind === "woodjump") {
    drawWoodJumpObstacle(f);
    return;
  }
  if (f.kind === "haybale") {
    drawHaybaleObstacle(f);
    return;
  }
  drawFence(f);
}

function drawFence(f) {
  const x = Math.floor(f.x);
  const topY = f.y;

  px(x, topY, f.w, f.h, "#1966a7");
  px(x + 3, topY + 3, f.w - 6, f.h - 6, "#ffffff");

  const gap = Math.max(12, Math.floor(f.h / (f.rails + 1)));
  for (let i = 1; i <= f.rails; i += 1) {
    const y = topY + i * gap;
    px(x - 20, y, f.w + 40, 5, i % 2 ? "#267ec6" : "#ffffff");
    px(x - 20, y + 5, f.w + 40, 2, "#114f86");
  }

  px(x - 8, topY + f.h - 8, 8, 8, "#226296");
  px(x + f.w, topY + f.h - 8, 8, 8, "#226296");
}

function drawBushObstacle(f) {
  const x = Math.floor(f.x);
  const y = Math.floor(f.y);

  px(x + 2, y + f.h - 10, f.w - 4, 10, "#2f6f2e");
  px(x, y + 12, f.w, f.h - 14, "#2f9247");
  px(x + 4, y + 6, f.w - 8, f.h - 20, "#46af60");
  px(x + 2, y + 8, Math.floor(f.w * 0.34), 16, "#61c97c");
  px(x + Math.floor(f.w * 0.28), y + 2, Math.floor(f.w * 0.4), 18, "#73dd91");
  px(x + Math.floor(f.w * 0.62), y + 8, Math.floor(f.w * 0.3), 16, "#59c272");
  if (f.hasBerries) {
    const berryBaseY = y + 12;
    px(x + 7, berryBaseY, 4, 4, "#b52a44");
    px(x + Math.floor(f.w * 0.45), berryBaseY + 4, 4, 4, "#a82566");
    px(x + Math.floor(f.w * 0.72), berryBaseY - 2, 4, 4, "#c33b2d");
  }
}

function drawWoodJumpObstacle(f) {
  const x = Math.floor(f.x);
  const y = Math.floor(f.y);

  px(x + 2, y, f.w - 4, f.h, "#9a7148");
  px(x + 4, y + 2, f.w - 8, f.h - 4, "#b08358");

  const gap = Math.max(10, Math.floor(f.h / (f.rails + 1)));
  for (let i = 1; i <= f.rails; i += 1) {
    const railY = y + i * gap;
    px(x - 16, railY, f.w + 32, 5, i % 2 ? "#c99d63" : "#8f673e");
    px(x - 16, railY + 5, f.w + 32, 2, "#6e4f2e");
  }

  px(x - 6, y + f.h - 10, 6, 10, "#6e4f2e");
  px(x + f.w, y + f.h - 10, 6, 10, "#6e4f2e");
}

function drawHaybaleObstacle(f) {
  const x = Math.floor(f.x);
  const y = Math.floor(f.y);

  px(x, y, f.w, f.h, "#d5ae5b");
  px(x + 2, y + 2, f.w - 4, f.h - 4, "#e3c576");
  px(x + 2, y + 6, f.w - 4, 3, "#c79d4c");
  for (let row = 14; row < f.h; row += 12) {
    px(x + 2, y + row, f.w - 4, 2, "#b78b41");
  }

  const bandA = x + Math.floor(f.w * 0.33);
  const bandB = x + Math.floor(f.w * 0.66);
  px(bandA, y + 2, 2, f.h - 4, "#8b6934");
  px(bandB, y + 2, 2, f.h - 4, "#8b6934");
}

function drawFenceCoin(f) {
  if (!f.coinActive) return;
  const cx = f.x + f.w / 2;
  const cy = f.y - f.coinOffsetY;

  px(cx - 8, cy - 8, 16, 16, "#b07d18");
  px(cx - 6, cy - 6, 12, 12, "#f5cc4b");
  px(cx - 2, cy - 6, 4, 12, "#e5b83a");
  px(cx - 1, cy - 1, 2, 2, "#fff2b3");
}

function drawHorse() {
  const x = Math.floor(horse.x);
  const y = Math.floor(horse.y);
  const bob = horse.grounded ? -Math.abs(Math.sin(horse.anim * 0.5)) * 2 : 0;

  if (!(horseSprite.ready && horseSprite.source && horseSprite.crop)) {
    if (horseSprite.img.complete && horseSprite.img.naturalWidth > 0) {
      const fallbackCrop = {
        x: 0,
        y: 0,
        w: horseSprite.img.naturalWidth,
        h: horseSprite.img.naturalHeight,
      };
      drawHorseSpriteWithAspect(horseSprite.img, fallbackCrop, x, y, bob);
    }
    return;
  }

  drawHorseSpriteWithAspect(horseSprite.source, horseSprite.crop, x, y, bob);
}

function drawHorseSpriteWithAspect(source, crop, x, y, bob) {
  const safeW = Math.max(1, crop.w);
  const safeH = Math.max(1, crop.h);
  const aspect = safeW / safeH;

  let drawW = horse.w;
  let drawH = Math.round(drawW / aspect);
  if (drawH > horse.h) {
    drawH = horse.h;
    drawW = Math.round(drawH * aspect);
  }

  const dx = Math.floor(x + (horse.w - drawW) * 0.5);
  const dy = Math.floor(y + horse.h - drawH + bob);

  ctx.drawImage(
    source,
    crop.x,
    crop.y,
    safeW,
    safeH,
    dx,
    dy,
    drawW,
    drawH
  );
}

function initHorseSprite() {
  horseSprite.img.decoding = "async";
  horseSprite.img.src = "./Horse3.png";
  horseSprite.img.onload = () => {
    const fullCrop = {
      x: 0,
      y: 0,
      w: horseSprite.img.naturalWidth || horseSprite.img.width,
      h: horseSprite.img.naturalHeight || horseSprite.img.height,
    };

    let crop = null;

    try {
      crop = findSpriteBoundsByKeyColor(horseSprite.img);
    } catch {
      crop = null;
    }

    horseSprite.source = horseSprite.img;
    horseSprite.crop = crop || fullCrop;
    horseSprite.ready = true;
  };

  horseSprite.img.onerror = () => {
    console.warn("Horse sprite failed to load: ./Horse3.png");
    horseSprite.source = null;
    horseSprite.crop = null;
    horseSprite.ready = false;
  };
}

function findSpriteBoundsByKeyColor(image) {
  const w = image.naturalWidth || image.width;
  const h = image.naturalHeight || image.height;
  if (!w || !h) return null;

  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const offCtx = off.getContext("2d", { willReadFrequently: true });
  if (!offCtx) return null;
  offCtx.imageSmoothingEnabled = false;
  offCtx.drawImage(image, 0, 0, w, h);

  const imgData = offCtx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const keyR = data[0];
  const keyG = data[1];
  const keyB = data[2];

  const keyDelta = 42;
  const alphaThreshold = 20;

  let minX = w;
  let minY = h;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const idx = (y * w + x) * 4;
      if (data[idx + 3] <= alphaThreshold) continue;
      const dr = Math.abs(data[idx] - keyR);
      const dg = Math.abs(data[idx + 1] - keyG);
      const db = Math.abs(data[idx + 2] - keyB);
      if (dr + dg + db > keyDelta) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < minX || maxY < minY) return null;

  const pad = 1;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad);
  maxY = Math.min(h - 1, maxY + pad);

  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}

function drawScore() {
  const score = Math.floor(world.distance);
  const speedShown = Math.round(world.speed);

  ctx.font = "bold 24px 'Trebuchet MS'";
  ctx.textAlign = "right";
  ctx.fillStyle = "#13324e";
  ctx.fillText(`Score: ${score}`, W - 20, 34);

  ctx.font = "bold 14px 'Trebuchet MS'";
  ctx.fillStyle = "#245478";
  ctx.fillText(`Speed: ${speedShown}`, W - 20, 54);
  ctx.fillText(`Coins: ${world.coins}`, W - 20, 74);
  if (world.shieldCharges > 0) {
    ctx.fillText(`Shield: ${world.shieldCharges}`, W - 20, 94);
  }
  if (world.secondJumpPurchased) {
    const readyText = world.secondJumpCooldown <= 0
      ? "Ready"
      : `${world.secondJumpCooldown.toFixed(1)}s`;
    ctx.fillText(`2nd Jump: ${readyText}`, W - 20, world.shieldCharges > 0 ? 114 : 94);
  }
}

function px(x, y, w, h, color) {
  ctx.fillStyle = color || "#fff";
  ctx.fillRect(
    Math.round(x / PIX) * PIX,
    Math.round(y / PIX) * PIX,
    Math.round(w / PIX) * PIX,
    Math.round(h / PIX) * PIX
  );
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function randInt(min, max) {
  return Math.floor(min + Math.random() * (max - min + 1));
}

function loop(t) {
  if (!world.lastT) world.lastT = t;
  const dt = Math.min(0.035, (t - world.lastT) / 1000);
  world.lastT = t;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") {
    e.preventDefault();
    jump();
  }
  if (e.code === "ArrowDown") {
    e.preventDefault();
    horse.fastFall = true;
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "Space" || e.code === "ArrowUp") releaseJump();
  if (e.code === "ArrowDown") horse.fastFall = false;
});

canvas.addEventListener("pointerdown", jump);
restartBtn.addEventListener("click", () => {
  resetGame();
  setupLevelStart(0);
  world.running = true;
});
playBtn.addEventListener("click", startGame);
recordBtn.addEventListener("click", openRecordPopup);
closeRecordBtn.addEventListener("click", closeRecordPopup);
continueBtn.addEventListener("click", continueFromShop);
extraCoinsBtn.addEventListener("click", buyExtraCoins);
shieldBtn.addEventListener("click", buyShield);
secondJumpBtn.addEventListener("click", buySecondJump);
inGameMenuBtn.addEventListener("click", returnToMainMenu);
completionMainMenuBtn.addEventListener("click", returnToMainMenu);
profilePrevBtn.addEventListener("click", () => setActiveProfile(profileState.activeIndex - 1));
profileNextBtn.addEventListener("click", () => setActiveProfile(profileState.activeIndex + 1));
if (editProfileNameBtn) editProfileNameBtn.addEventListener("click", editActiveProfileName);
if (saveProfileNameBtn) saveProfileNameBtn.addEventListener("click", saveActiveProfileName);
if (cancelProfileNameBtn) cancelProfileNameBtn.addEventListener("click", closeProfileNameEditor);
if (closeProfileSwitcherBtn) {
  closeProfileSwitcherBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeProfileSwitcher();
  });
}
if (profileNameInput) {
  profileNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveActiveProfileName();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      closeProfileNameEditor();
    }
  });
}
recordPopup.addEventListener("click", (e) => {
  if (e.target === recordPopup) closeRecordPopup();
});

profileState.names = loadProfileNames();
profileState.activeIndex = loadActiveProfile();
renderActiveProfile();
resetGame();
renderRecords();
requestAnimationFrame(loop);





