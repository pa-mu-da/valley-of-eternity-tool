// Valley of Eternity - Character Creator Engine (Light Mode, Sharp Corners, Square Image, Image Upload, JSON Import)

let slotIdCounter = 1;

const state = {
  type: 'hero', // 'hero' | 'anti'
  name: '',
  playerName: '',
  species: 'emperor',
  memo: '',
  characterImage: '', // Data URL
  characterImageObj: null, // HTMLImageElement
  attrTotalMax: 12, // User editable max attribute distribution points
  specialTotalMax: 5, // User editable max special ability points
  assigned: {
    agi: 3,
    phi: 3,
    str: 3,
    sur: 3
  },
  // Dynamic Equipment Slots
  equipments: [
    {
      id: 'eq_1',
      type: 'weapon',
      preset: 'spear',
      name: '槍',
      damage: 2,
      armor: 0,
      note: '命中+1'
    },
    {
      id: 'eq_2',
      type: 'armor',
      preset: 'none',
      name: 'なし',
      damage: 0,
      armor: 0,
      note: '標準的な状態'
    }
  ],
  selectedAbilities: new Map(), // nameEn -> { nameJa, nameEn, pt, fat, desc }
  searchQuery: ''
};

// Helpers
function getSpecies() {
  return SPECIES_DATA.find(s => s.id === state.species) || SPECIES_DATA[0];
}

function getTotalAttribute(key) {
  const base = 1 + state.assigned[key];
  const species = getSpecies();
  const bonus = (species.attrBonus && species.attrBonus[key]) || 0;
  return base + bonus;
}

function getRemainingAttrPoints() {
  const totalAssigned = state.assigned.agi + state.assigned.phi + state.assigned.str + state.assigned.sur;
  return state.attrTotalMax - totalAssigned;
}

function getMaxSpecialPoints() {
  const species = getSpecies();
  return state.specialTotalMax + (species.specialPointBonus || 0);
}

function getUsedSpecialPoints() {
  let sum = 0;
  state.selectedAbilities.forEach(item => {
    sum += Number(item.pt) || 0;
  });
  return sum;
}

function getRemainingSpecialPoints() {
  return getMaxSpecialPoints() - getUsedSpecialPoints();
}

function parsePtRange(ptStr) {
  if (ptStr.includes('-')) {
    const parts = ptStr.split('-').map(p => parseInt(p.trim(), 10));
    const res = [];
    for (let i = parts[0]; i <= parts[1]; i++) res.push(i);
    return res;
  }
  if (ptStr.includes('/')) {
    return ptStr.split('/').map(p => parseInt(p.trim(), 10));
  }
  return [parseInt(ptStr.trim(), 10)];
}

// Check if ability matches character type
function isAbilityEligible(ability) {
  const cat = ability['分類'];
  if (state.type === 'hero') {
    return cat === '哲学能力' || cat === '哲学能力 / 氷河のギフト';
  } else {
    return cat === '氷河のギフト' || cat === '哲学能力 / 氷河のギフト';
  }
}

// Calculate derived stats
function getDerivedStats() {
  const agi = getTotalAttribute('agi');
  const str = getTotalAttribute('str');
  const phi = getTotalAttribute('phi');
  const sur = getTotalAttribute('sur');

  const warmth = str * 5;
  const fat = sur * 10;
  const defense = Math.floor((agi + sur) / 3);
  const willpower = Math.floor((phi + sur) / 3);

  return { warmth, fat, defense, willpower, agi, str, phi, sur };
}

// Initialize
function init() {
  renderSpeciesOptions();
  renderEquipmentSlots();
  renderAbilitiesList();
  bindEvents();
  updateUI();
}

function bindEvents() {
  // Type Switch
  document.getElementById('btnTypeHero').addEventListener('click', () => {
    if (state.type !== 'hero') {
      state.type = 'hero';
      filterIncompatibleAbilities();
      updateUI();
    }
  });

  document.getElementById('btnTypeAnti').addEventListener('click', () => {
    if (state.type !== 'anti') {
      state.type = 'anti';
      filterIncompatibleAbilities();
      updateUI();
    }
  });

  // Name & PL Name & Memo
  document.getElementById('charName').addEventListener('input', e => {
    state.name = e.target.value;
    updatePreview();
  });

  document.getElementById('playerName').addEventListener('input', e => {
    state.playerName = e.target.value;
    updatePreview();
  });

  document.getElementById('charMemo').addEventListener('input', e => {
    state.memo = e.target.value;
    updatePreview();
  });

  // Image Upload
  const portraitUploadArea = document.getElementById('portraitUploadArea');
  const charImageFileInput = document.getElementById('charImageFileInput');

  portraitUploadArea.addEventListener('click', () => {
    charImageFileInput.click();
  });

  charImageFileInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) {
      loadCharacterImageFile(file);
    }
  });

  // Editable Points Limit
  document.getElementById('attrTotalMaxInput').addEventListener('input', e => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1) {
      state.attrTotalMax = val;
      updateUI();
    }
  });

  document.getElementById('specialTotalMaxInput').addEventListener('input', e => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1) {
      state.specialTotalMax = val;
      updateUI();
    }
  });

  // Add Equipment Slot
  document.getElementById('btnAddEquipSlot').addEventListener('click', () => {
    slotIdCounter++;
    state.equipments.push({
      id: `eq_${Date.now()}_${slotIdCounter}`,
      type: 'weapon',
      preset: 'custom',
      name: '新しい装備',
      damage: 0,
      armor: 0,
      note: ''
    });
    renderEquipmentSlots();
    updateUI();
  });

  // Abilities Search
  document.getElementById('abilitySearch').addEventListener('input', e => {
    state.searchQuery = e.target.value.toLowerCase();
    renderAbilitiesList();
  });

  // Attribute buttons
  ['agi', 'phi', 'str', 'sur'].forEach(key => {
    document.getElementById(`btnPlus_${key}`).addEventListener('click', () => {
      if (getRemainingAttrPoints() > 0 && state.assigned[key] < 15) {
        state.assigned[key]++;
        updateUI();
      }
    });

    document.getElementById(`btnMinus_${key}`).addEventListener('click', () => {
      if (state.assigned[key] > 0) {
        state.assigned[key]--;
        updateUI();
      }
    });
  });

  // Header Actions
  document.getElementById('btnExportImage').addEventListener('click', exportCharacterImage);
  document.getElementById('btnCopyCcfolia').addEventListener('click', copyCcfoliaToClipboard);
  document.getElementById('btnDownloadCcfolia').addEventListener('click', downloadCcfoliaJson);
  document.getElementById('btnReset').addEventListener('click', resetCharacter);
  document.getElementById('btnQuickCopy').addEventListener('click', copyCcfoliaToClipboard);

  // JSON Import Button
  const btnLoadJson = document.getElementById('btnLoadJson');
  const jsonFileInput = document.getElementById('jsonFileInput');
  btnLoadJson.addEventListener('click', () => {
    jsonFileInput.click();
  });
  jsonFileInput.addEventListener('change', handleJsonFileImport);
}

// Load Image File and set state
function loadCharacterImageFile(file) {
  const reader = new FileReader();
  reader.onload = ev => {
    const dataUrl = ev.target.result;
    state.characterImage = dataUrl;

    const img = new Image();
    img.onload = () => {
      state.characterImageObj = img;
      updatePortraitImages(dataUrl);
      updatePreview();
      showToast('キャラクター画像を読み込みました');
    };
    img.src = dataUrl;
  };
  reader.readAsDataURL(file);
}

function updatePortraitImages(dataUrl) {
  const previewImg = document.getElementById('portraitPreviewImg');
  const previewPlaceholder = document.getElementById('portraitPlaceholder');
  const sheetImg = document.getElementById('sheetPortraitImg');
  const sheetPlaceholder = document.getElementById('sheetPortraitPlaceholder');

  if (dataUrl) {
    previewImg.src = dataUrl;
    previewImg.style.display = 'block';
    previewPlaceholder.style.display = 'none';

    sheetImg.src = dataUrl;
    sheetImg.style.display = 'block';
    sheetPlaceholder.style.display = 'none';
  } else {
    previewImg.src = '';
    previewImg.style.display = 'none';
    previewPlaceholder.style.display = 'flex';

    sheetImg.src = '';
    sheetImg.style.display = 'none';
    sheetPlaceholder.style.display = 'flex';
  }
}

// JSON File Import Handler
function handleJsonFileImport(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      importCharacterJson(data);
    } catch (err) {
      console.error('Failed to parse JSON file:', err);
      showToast('JSONファイルの読み込みに失敗しました');
    }
  };
  reader.readAsText(file);
  // Reset input so same file can be loaded again
  e.target.value = '';
}

function importCharacterJson(json) {
  if (!json || !json.data) {
    showToast('無効なキャラクターデータ形式です');
    return;
  }

  const d = json.data;

  // 1. If saved with our voeState, perfect 100% restore
  if (d.voeState) {
    const v = d.voeState;
    state.type = v.type || 'hero';
    state.name = v.name || d.name || '';
    state.playerName = v.playerName || '';
    state.species = v.species || 'emperor';
    state.memo = v.memo || '';
    state.attrTotalMax = v.attrTotalMax || 12;
    state.specialTotalMax = v.specialTotalMax || 5;
    state.assigned = v.assigned || { agi: 3, phi: 3, str: 3, sur: 3 };
    state.equipments = v.equipments || [];
    
    state.selectedAbilities = new Map();
    if (Array.isArray(v.selectedAbilities)) {
      v.selectedAbilities.forEach(item => {
        state.selectedAbilities.set(item.nameEn, item);
      });
    }

    if (v.characterImage) {
      state.characterImage = v.characterImage;
      const img = new Image();
      img.onload = () => {
        state.characterImageObj = img;
        updatePortraitImages(v.characterImage);
        updatePreview();
      };
      img.src = v.characterImage;
    } else {
      state.characterImage = '';
      state.characterImageObj = null;
      updatePortraitImages('');
    }
  } else {
    // 2. Generic Cocofolia / Penguin template fallback import
    state.name = d.name || '';
    
    // Parse memo
    const memo = d.memo || '';
    const plMatch = memo.match(/PL:\s*([^\n\/]+)/);
    if (plMatch) state.playerName = plMatch[1].trim();

    const typeMatch = memo.match(/種別:\s*([^\n\/]+)/);
    if (typeMatch && typeMatch[1].includes('アンチ')) {
      state.type = 'anti';
    } else {
      state.type = 'hero';
    }

    const speciesMatch = memo.match(/種族:\s*([^\n\/]+)/);
    if (speciesMatch) {
      const spName = speciesMatch[1].trim();
      const matchedSp = SPECIES_DATA.find(s => spName.includes(s.name));
      if (matchedSp) state.species = matchedSp.id;
    }

    const pcMemoMatch = memo.match(/意志力:[^\n]*\n\n([\s\S]*)/);
    if (pcMemoMatch) {
      state.memo = pcMemoMatch[1].trim();
    } else {
      state.memo = '';
    }

    // Parse params
    if (Array.isArray(d.params)) {
      const sp = getSpecies();
      const pMap = {};
      d.params.forEach(p => { pMap[p.label] = parseInt(p.value, 10) || 0; });

      const totalAgi = pMap['敏捷'] || 4;
      const totalStr = pMap['筋力'] || 6;
      const totalPhi = pMap['哲学/氷河の魂'] || 4;
      const totalSur = pMap['生存'] || 4;

      const spBonus = sp.attrBonus || {};
      state.assigned.agi = Math.max(0, totalAgi - 1 - (spBonus.agi || 0));
      state.assigned.str = Math.max(0, totalStr - 1 - (spBonus.str || 0));
      state.assigned.phi = Math.max(0, totalPhi - 1 - (spBonus.phi || 0));
      state.assigned.sur = Math.max(0, totalSur - 1 - (spBonus.sur || 0));
      state.attrTotalMax = state.assigned.agi + state.assigned.str + state.assigned.phi + state.assigned.sur;
    }

    // Parse weapons from memo
    const weaponMatch = memo.match(/武器:\s*([^\n]+)/);
    if (weaponMatch) {
      state.equipments = [];
      const wNames = weaponMatch[1].split('/').map(w => w.trim());
      wNames.forEach((wn, idx) => {
        const found = WEAPONS_DATA.find(x => x.name === wn);
        state.equipments.push({
          id: `eq_imp_${idx}`,
          type: 'weapon',
          preset: found ? found.id : 'custom',
          name: wn,
          damage: found ? found.damage : 0,
          armor: 0,
          note: found ? found.effect : ''
        });
      });
    }

    // Parse abilities from commands
    state.selectedAbilities = new Map();
    const commands = d.commands || '';
    ABILITIES_DATA.forEach(ab => {
      if (commands.includes(ab['名前(日本語)'])) {
        const ptOpts = parsePtRange(ab['取得時の消費pt']);
        state.selectedAbilities.set(ab['名前(英語)'], {
          nameJa: ab['名前(日本語)'],
          nameEn: ab['名前(英語)'],
          pt: ptOpts[0],
          fat: ab['発動時の消費fat'],
          desc: ab['内容(日本語)']
        });
      }
    });

    state.characterImage = '';
    state.characterImageObj = null;
    updatePortraitImages('');
  }

  // Update inputs
  document.getElementById('charName').value = state.name;
  document.getElementById('playerName').value = state.playerName;
  document.getElementById('charMemo').value = state.memo;
  document.getElementById('attrTotalMaxInput').value = state.attrTotalMax;
  document.getElementById('specialTotalMaxInput').value = state.specialTotalMax;

  renderSpeciesOptions();
  renderEquipmentSlots();
  updateUI();
  showToast('キャラクターシートデータを読み込みました');
}

// Filter out incompatible abilities when switching Hero <-> Anti
function filterIncompatibleAbilities() {
  const toDelete = [];
  state.selectedAbilities.forEach((val, nameEn) => {
    const raw = ABILITIES_DATA.find(a => a['名前(英語)'] === nameEn);
    if (!raw || !isAbilityEligible(raw)) {
      toDelete.push(nameEn);
    }
  });
  toDelete.forEach(nameEn => state.selectedAbilities.delete(nameEn));
}

function renderSpeciesOptions() {
  const container = document.getElementById('speciesGrid');
  container.innerHTML = '';
  SPECIES_DATA.forEach(sp => {
    const card = document.createElement('div');
    card.className = `species-card ${state.species === sp.id ? 'active' : ''}`;
    
    const bonuses = [];
    if (sp.attrBonus) {
      if (sp.attrBonus.agi) bonuses.push(`敏捷 +${sp.attrBonus.agi}`);
      if (sp.attrBonus.str) bonuses.push(`筋力 +${sp.attrBonus.str}`);
      if (sp.attrBonus.phi) bonuses.push(`哲学/魂 +${sp.attrBonus.phi}`);
      if (sp.attrBonus.sur) bonuses.push(`生存 +${sp.attrBonus.sur}`);
    }
    if (sp.specialPointBonus) bonuses.push(`能力pt +${sp.specialPointBonus}`);

    card.innerHTML = `
      <div class="species-card-head">
        <span class="species-name">${sp.name}</span>
        <span class="species-name-en">${sp.nameEn}</span>
      </div>
      <div class="species-bonus">${bonuses.join(' / ')}</div>
      <div class="species-trait-text">${sp.trait}</div>
      <div class="species-desc">${sp.desc}</div>
    `;

    card.addEventListener('click', () => {
      state.species = sp.id;
      while (getRemainingSpecialPoints() < 0 && state.selectedAbilities.size > 0) {
        const lastKey = Array.from(state.selectedAbilities.keys()).pop();
        state.selectedAbilities.delete(lastKey);
      }
      updateUI();
    });

    container.appendChild(card);
  });
}

// Render dynamic equipment slots
function renderEquipmentSlots() {
  const container = document.getElementById('equipmentSlotsList');
  container.innerHTML = '';

  state.equipments.forEach((eq, index) => {
    const item = document.createElement('div');
    item.className = 'equipment-slot-item';

    // Preset Options
    let presetOptionsHtml = '<option value="custom">自由入力</option>';
    if (eq.type === 'weapon') {
      WEAPONS_DATA.forEach(w => {
        presetOptionsHtml += `<option value="${w.id}" ${eq.preset === w.id ? 'selected' : ''}>${w.name}</option>`;
      });
    } else if (eq.type === 'armor') {
      ARMOR_DATA.forEach(a => {
        presetOptionsHtml += `<option value="${a.id}" ${eq.preset === a.id ? 'selected' : ''}>${a.name}</option>`;
      });
    } else {
      SPECIAL_ITEMS_DATA.forEach(it => {
        presetOptionsHtml += `<option value="${it.id}" ${eq.preset === it.id ? 'selected' : ''}>${it.name}</option>`;
      });
    }

    const valueLabel = eq.type === 'weapon' ? 'ダメ' : (eq.type === 'armor' ? '装甲' : '値');
    const currentValue = eq.type === 'weapon' ? eq.damage : (eq.type === 'armor' ? eq.armor : 0);

    item.innerHTML = `
      <div class="equip-slot-row-1">
        <select class="form-select slot-type-select">
          <option value="weapon" ${eq.type === 'weapon' ? 'selected' : ''}>武器</option>
          <option value="armor" ${eq.type === 'armor' ? 'selected' : ''}>防具</option>
          <option value="item" ${eq.type === 'item' ? 'selected' : ''}>道具</option>
        </select>
        <select class="form-select slot-preset-select">
          ${presetOptionsHtml}
        </select>
        <input type="text" class="form-input slot-name-input" value="${eq.name}" placeholder="装備名" />
        <div style="display: flex; align-items: center; gap: 4px;">
          <span style="font-size: 10px; font-weight: 700; color: var(--text-sub);">${valueLabel}</span>
          <input type="number" class="form-input slot-val-input" value="${currentValue}" style="width: 50px; padding: 6px 4px; text-align: center;" />
        </div>
        <button type="button" class="btn-remove-slot" title="スロット削除">×</button>
      </div>
      <div class="equip-slot-row-2">
        <input type="text" class="form-input slot-note-input" value="${eq.note || ''}" placeholder="効果・メモ (例: 命中+1、不意打ち時+3)" />
      </div>
    `;

    // Type change
    const typeSelect = item.querySelector('.slot-type-select');
    typeSelect.addEventListener('change', e => {
      eq.type = e.target.value;
      eq.preset = 'custom';
      renderEquipmentSlots();
      updateUI();
    });

    // Preset change
    const presetSelect = item.querySelector('.slot-preset-select');
    presetSelect.addEventListener('change', e => {
      const pid = e.target.value;
      eq.preset = pid;
      if (eq.type === 'weapon') {
        const w = WEAPONS_DATA.find(x => x.id === pid);
        if (w) {
          eq.name = w.name;
          eq.damage = w.damage;
          eq.note = w.effect || '';
        }
      } else if (eq.type === 'armor') {
        const a = ARMOR_DATA.find(x => x.id === pid);
        if (a) {
          eq.name = a.name;
          eq.armor = a.armor;
          eq.note = a.effect || '';
        }
      } else if (eq.type === 'item') {
        const it = SPECIAL_ITEMS_DATA.find(x => x.id === pid);
        if (it) {
          eq.name = it.name;
          eq.note = it.effect || '';
        }
      }
      renderEquipmentSlots();
      updateUI();
    });

    // Name change
    const nameInput = item.querySelector('.slot-name-input');
    nameInput.addEventListener('input', e => {
      eq.name = e.target.value;
      updatePreview();
    });

    // Value change
    const valInput = item.querySelector('.slot-val-input');
    valInput.addEventListener('input', e => {
      const num = parseInt(e.target.value, 10) || 0;
      if (eq.type === 'weapon') eq.damage = num;
      else if (eq.type === 'armor') eq.armor = num;
      updatePreview();
    });

    // Note change
    const noteInput = item.querySelector('.slot-note-input');
    noteInput.addEventListener('input', e => {
      eq.note = e.target.value;
      updatePreview();
    });

    // Remove slot
    const removeBtn = item.querySelector('.btn-remove-slot');
    removeBtn.addEventListener('click', () => {
      state.equipments.splice(index, 1);
      renderEquipmentSlots();
      updateUI();
    });

    container.appendChild(item);
  });
}

function renderAbilitiesList() {
  const container = document.getElementById('abilitiesList');
  container.innerHTML = '';

  const sp = getSpecies();

  // If species has a special non-numerical trait (Headless Baron, Royal, Adelie, Rockhopper), display it on top with no Fat UI
  if (sp.specialTrait) {
    const traitCard = document.createElement('div');
    traitCard.className = 'species-trait-special-card';
    traitCard.innerHTML = `
      <div class="species-trait-header">
        <div class="species-trait-title-row">
          <span class="tag-species-trait">種族特性</span>
          <span class="ability-name">${sp.specialTrait.nameJa}</span>
        </div>
        <span class="tag-species-timing">${sp.specialTrait.tag}</span>
      </div>
      <div class="ability-desc">${sp.specialTrait.desc}</div>
    `;
    container.appendChild(traitCard);
  }

  const eligibleAbilities = ABILITIES_DATA.filter(ab => {
    if (!isAbilityEligible(ab)) return false;
    if (!state.searchQuery) return true;
    const q = state.searchQuery;
    const nameJa = ab['名前(日本語)'].toLowerCase();
    const nameEn = ab['名前(英語)'].toLowerCase();
    const desc = ab['内容(日本語)'].toLowerCase();
    return nameJa.includes(q) || nameEn.includes(q) || desc.includes(q);
  });

  eligibleAbilities.forEach(ab => {
    const nameEn = ab['名前(英語)'];
    const nameJa = ab['名前(日本語)'];
    const isSelected = state.selectedAbilities.has(nameEn);
    const itemData = state.selectedAbilities.get(nameEn);

    const ptOptions = parsePtRange(ab['取得時の消費pt']);
    const isMultiPt = ptOptions.length > 1;
    const currentPt = isSelected ? itemData.pt : ptOptions[0];

    const card = document.createElement('div');
    card.className = `ability-item ${isSelected ? 'selected' : ''}`;

    let rankSelectorHtml = '';
    if (isMultiPt) {
      rankSelectorHtml = `
        <div class="ability-rank-selector">
          <span class="ability-rank-label">取得ランク / 消費pt:</span>
          <select class="ability-rank-select" data-name-en="${nameEn}">
            ${ptOptions.map(p => `<option value="${p}" ${p === currentPt ? 'selected' : ''}>${p} pt</option>`).join('')}
          </select>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="ability-header">
        <div class="ability-title-row">
          <input type="checkbox" class="ability-checkbox" ${isSelected ? 'checked' : ''} />
          <span class="ability-name">${nameJa}</span>
        </div>
        <div class="ability-tags">
          <span class="tag-cost">${ab['取得時の消費pt']} pt</span>
          <span class="tag-fat">Fat ${ab['発動時の消費fat']}</span>
        </div>
      </div>
      <div class="ability-desc">${ab['内容(日本語)']}</div>
      ${rankSelectorHtml}
    `;

    // Checkbox toggling
    const checkbox = card.querySelector('.ability-checkbox');
    checkbox.addEventListener('change', e => {
      e.stopPropagation();
      toggleAbility(ab, currentPt, checkbox.checked);
    });

    // Rank selector change
    const rankSelect = card.querySelector('.ability-rank-select');
    if (rankSelect) {
      rankSelect.addEventListener('click', e => e.stopPropagation());
      rankSelect.addEventListener('change', e => {
        const newPt = parseInt(e.target.value, 10);
        if (state.selectedAbilities.has(nameEn)) {
          const oldPt = state.selectedAbilities.get(nameEn).pt;
          const diff = newPt - oldPt;
          if (getRemainingSpecialPoints() >= diff) {
            state.selectedAbilities.get(nameEn).pt = newPt;
            updateUI();
          } else {
            showToast('特殊能力ポイントが不足しています');
            e.target.value = oldPt;
          }
        }
      });
    }

    card.addEventListener('click', (e) => {
      if (e.target.tagName.toLowerCase() === 'select') return;
      toggleAbility(ab, currentPt, !isSelected);
    });

    container.appendChild(card);
  });
}

function toggleAbility(ab, pt, select) {
  const nameEn = ab['名前(英語)'];
  const nameJa = ab['名前(日本語)'];

  if (select) {
    if (getRemainingSpecialPoints() >= pt) {
      state.selectedAbilities.set(nameEn, {
        nameJa,
        nameEn,
        pt: pt,
        fat: ab['発動時の消費fat'],
        desc: ab['内容(日本語)']
      });
      updateUI();
    } else {
      showToast('特殊能力ポイントが不足しています');
      renderAbilitiesList();
    }
  } else {
    state.selectedAbilities.delete(nameEn);
    updateUI();
  }
}

function updateUI() {
  const isAnti = state.type === 'anti';
  const phiLabel = isAnti ? '氷河の魂' : '哲学';
  const abilityCategoryLabel = isAnti ? '氷河のギフト' : '哲学能力';

  // Toggle button state
  document.getElementById('btnTypeHero').classList.toggle('active', !isAnti);
  document.getElementById('btnTypeAnti').classList.toggle('active', isAnti);

  // Labels
  document.getElementById('labelAttrPhi').textContent = phiLabel;
  document.getElementById('abilitiesSectionTitle').textContent = `特殊能力 (${abilityCategoryLabel})`;
  document.getElementById('previewAbilitiesTitle').textContent = `修得能力 (${abilityCategoryLabel})`;

  // Species active state
  document.querySelectorAll('.species-card').forEach((card, idx) => {
    card.classList.toggle('active', SPECIES_DATA[idx].id === state.species);
  });

  // Attributes controls & inputs
  document.getElementById('attrTotalMaxInput').value = state.attrTotalMax;
  const remainingAttrPts = getRemainingAttrPoints();
  document.getElementById('attrRemainingPoints').textContent = `${remainingAttrPts} pt`;

  ['agi', 'phi', 'str', 'sur'].forEach(key => {
    const totalVal = getTotalAttribute(key);
    document.getElementById(`val_${key}`).textContent = totalVal;
    
    const btnPlus = document.getElementById(`btnPlus_${key}`);
    const btnMinus = document.getElementById(`btnMinus_${key}`);

    btnPlus.disabled = remainingAttrPts <= 0;
    btnMinus.disabled = state.assigned[key] <= 0;
  });

  // Special abilities points & input
  document.getElementById('specialTotalMaxInput').value = state.specialTotalMax;
  const remainingSpecPts = getRemainingSpecialPoints();
  const maxSpecPts = getMaxSpecialPoints();
  document.getElementById('specialRemainingPoints').textContent = `${remainingSpecPts} / ${maxSpecPts} pt`;

  renderAbilitiesList();
  updatePreview();
}

function updatePreview() {
  const isAnti = state.type === 'anti';
  const phiLabel = isAnti ? '氷河の魂' : '哲学';
  const typeText = isAnti ? 'アンチペンギン' : 'ヒーローペンギン';
  const species = getSpecies();
  const derived = getDerivedStats();

  // Name & PL
  document.getElementById('previewCharName').textContent = state.name || '名前未定';
  document.getElementById('previewPlayerName').textContent = state.playerName ? `PL: ${state.playerName}` : 'PL: 未設定';
  document.getElementById('previewTypeBadge').textContent = `${typeText} / ${species.name}`;

  // Substats - 体温値 (ユーザー向け表示)
  document.getElementById('previewWarmth').textContent = derived.warmth;
  document.getElementById('previewFat').textContent = derived.fat;
  document.getElementById('previewDefense').textContent = derived.defense;
  document.getElementById('previewWillpower').textContent = derived.willpower;

  // Attributes bar
  document.getElementById('previewAttrAgi').textContent = derived.agi;
  document.getElementById('previewAttrStr').textContent = derived.str;
  document.getElementById('previewAttrPhiLabel').textContent = phiLabel;
  document.getElementById('previewAttrPhi').textContent = derived.phi;
  document.getElementById('previewAttrSur').textContent = derived.sur;

  // Equipments Preview
  const eqContainer = document.getElementById('previewEquipContainer');
  eqContainer.innerHTML = '';
  if (state.equipments.length === 0) {
    eqContainer.innerHTML = '<div class="sheet-empty">装備なし</div>';
  } else {
    state.equipments.forEach(eq => {
      const row = document.createElement('div');
      row.className = 'sheet-gear-item';
      let statText = '';
      if (eq.type === 'weapon') {
        const sign = eq.damage >= 0 ? `+${eq.damage}` : `${eq.damage}`;
        statText = `ダメ ${sign}`;
      } else if (eq.type === 'armor') {
        statText = `装甲 ${eq.armor}`;
      } else {
        statText = eq.note ? eq.note.substring(0, 10) : '道具';
      }
      row.innerHTML = `
        <span class="sheet-gear-name" title="${eq.name}">${eq.name || '未命名'}</span>
        <span class="sheet-gear-stat">${statText}</span>
      `;
      eqContainer.appendChild(row);
    });
  }

  // Abilities Preview
  const abContainer = document.getElementById('previewAbilitiesContainer');
  abContainer.innerHTML = '';

  // Add species trait first if present (No Fat UI)
  if (species.specialTrait) {
    const traitRow = document.createElement('div');
    traitRow.className = 'sheet-ability-row';
    traitRow.style.background = '#e6f2f9';
    traitRow.style.borderColor = 'var(--border-deep)';
    traitRow.innerHTML = `
      <span class="sheet-ab-title" title="${species.specialTrait.desc}">[種族] ${species.specialTrait.nameJa}</span>
      <span class="sheet-ab-fat" style="color: var(--text-main); font-weight: 800;">${species.specialTrait.tag}</span>
    `;
    abContainer.appendChild(traitRow);
  }

  if (state.selectedAbilities.size === 0 && !species.specialTrait) {
    abContainer.innerHTML = '<div class="sheet-empty">能力未選択</div>';
  } else {
    state.selectedAbilities.forEach(item => {
      const row = document.createElement('div');
      row.className = 'sheet-ability-row';
      row.innerHTML = `
        <span class="sheet-ab-title" title="${item.nameJa}">${item.nameJa}</span>
        <span class="sheet-ab-fat">Fat ${item.fat}</span>
      `;
      abContainer.appendChild(row);
    });
  }

  // Ccfolia text command preview
  document.getElementById('ccfoliaCommandsPreview').textContent = generateCcfoliaCommands();

  // Re-run Lucide icons
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  } else {
    applySvgIconFallback();
  }
}

// Fallback monochrome SVGs
function applySvgIconFallback() {
  const iconMap = {
    'image': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
    'copy': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    'download': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    'folder-open': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 14 1.45-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.55 6a2 2 0 0 1-1.94 1.5H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H18a2 2 0 0 1 2 2v2"/></svg>',
    'camera': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>',
    'rotate-ccw': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
    'user': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    'shield': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    'compass': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
    'activity': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    'sword': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/></svg>',
    'sparkles': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>',
    'zap': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    'terminal': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
    'check-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
  };

  document.querySelectorAll('[data-lucide]').forEach(el => {
    const iconName = el.getAttribute('data-lucide');
    if (iconMap[iconName]) {
      el.outerHTML = iconMap[iconName].replace('<svg', `<svg class="${el.className}"`);
    }
  });
}

// Generate Ccfolia Command list
function generateCcfoliaCommands() {
  const isAnti = state.type === 'anti';
  const phiLabel = isAnti ? '氷河の魂' : '哲学';
  const derived = getDerivedStats();

  let lines = [
    `${derived.agi}b6>=5 【敏捷】で判定`,
    `${derived.phi}b6>=5 【${phiLabel}】で判定`,
    `${derived.str}b6>=5 【筋力】で判定`,
    `${derived.sur}b6>=5 【生存】で判定`,
    ``,
    `1d6+${derived.agi} 戦闘時のイニシアティブ`
  ];

  // Weapon damage rolls
  const weapons = state.equipments.filter(e => e.type === 'weapon' && e.name.trim());
  if (weapons.length > 0) {
    weapons.forEach(w => {
      const totalPhysicalDmgBonus = derived.str + (Number(w.damage) || 0);
      const dmgSign = totalPhysicalDmgBonus >= 0 ? `+${totalPhysicalDmgBonus}` : `${totalPhysicalDmgBonus}`;
      lines.push(`1d6${dmgSign} ${w.name}によるダメージ`);
    });
  } else {
    const dmgSign = derived.str >= 0 ? `+${derived.str}` : `${derived.str}`;
    lines.push(`1d6${dmgSign} 素手によるダメージ`);
  }

  // Selected Abilities & Species Special Trait
  const species = getSpecies();
  if (species.specialTrait || state.selectedAbilities.size > 0) {
    lines.push('');
    if (species.specialTrait) {
      lines.push(`${species.specialTrait.nameJa}/-/${species.specialTrait.desc}`);
    }
    state.selectedAbilities.forEach(item => {
      const fatLabel = item.fat === '0' ? '-' : `Fat ${item.fat}`;
      lines.push(`${item.nameJa}/${fatLabel}/${item.desc}`);
    });
  }

  return lines.join('\n');
}

// Generate Ccfolia Json
function generateCcfoliaJson() {
  const isAnti = state.type === 'anti';
  const typeLabel = isAnti ? 'アンチペンギン' : 'ヒーローペンギン';
  const species = getSpecies();
  const derived = getDerivedStats();

  const weaponNames = state.equipments.filter(e => e.type === 'weapon' && e.name).map(e => e.name).join(' / ') || '素手';
  const armorNames = state.equipments.filter(e => e.type === 'armor' && e.name).map(e => e.name).join(' / ') || 'なし';

  const memo = [
    `名前:${state.name || '名前未定'}/PL:${state.playerName || 'PL未定'}`,
    `種別:${typeLabel}`,
    `種族:${species.name}`,
    `武器:${weaponNames}`,
    `防具:${armorNames}`,
    `防御力:${derived.defense} 意志力:${derived.willpower}`,
    ``,
    state.memo || ''
  ].join('\n');

  // Convert selected abilities to array for serialization
  const abilitiesArray = [];
  state.selectedAbilities.forEach(item => {
    abilitiesArray.push(item);
  });

  return {
    kind: "character",
    data: {
      name: state.name || 'ペンギン',
      memo: memo,
      initiative: 0,
      externalUrl: "",
      status: [
        {
          label: "体温", // ココフォリア内部は「体温」のまま
          value: derived.warmth,
          max: derived.warmth
        },
        {
          label: "Fat",
          value: derived.fat,
          max: derived.fat
        }
      ],
      params: [
        {
          label: "敏捷",
          value: String(derived.agi)
        },
        {
          label: "哲学/氷河の魂",
          value: String(derived.phi)
        },
        {
          label: "筋力",
          value: String(derived.str)
        },
        {
          label: "生存",
          value: String(derived.sur)
        }
      ],
      iconUrl: "",
      faces: [],
      x: 0,
      y: 0,
      angle: 0,
      width: 1,
      height: 1,
      active: true,
      secret: false,
      invisible: false,
      hideStatus: false,
      color: "#98e9ef",
      commands: generateCcfoliaCommands(),
      owner: "",
      // Extension payload for 100% full state restore
      voeState: {
        type: state.type,
        name: state.name,
        playerName: state.playerName,
        species: state.species,
        memo: state.memo,
        attrTotalMax: state.attrTotalMax,
        specialTotalMax: state.specialTotalMax,
        assigned: state.assigned,
        equipments: state.equipments,
        selectedAbilities: abilitiesArray,
        characterImage: state.characterImage
      }
    }
  };
}

// Clipboard copy
async function copyCcfoliaToClipboard() {
  const data = generateCcfoliaJson();
  const jsonStr = JSON.stringify(data, null, 2);
  try {
    await navigator.clipboard.writeText(jsonStr);
    showToast('ココフォリア用コマデータをクリップボードにコピーしました');
  } catch (err) {
    const textArea = document.createElement('textarea');
    textArea.value = jsonStr;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast('ココフォリア用コマデータをクリップボードにコピーしました');
  }
}

// Download JSON
function downloadCcfoliaJson() {
  const data = generateCcfoliaJson();
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const fileName = (state.name || 'penguin').replace(/[/\\?%*:|"<>]/g, '_');
  a.download = `${fileName}_cocofolia.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('JSONファイルを保存しました');
}

// Export Character Image (SQUARE 1:1)
function exportCharacterImage() {
  showToast('正方形キャラクター画像を生成中...');
  const cardElement = document.getElementById('characterPreviewCard');

  if (window.html2canvas) {
    window.html2canvas(cardElement, {
      backgroundColor: '#dceaf2',
      scale: 2,
      useCORS: true
    }).then(canvas => {
      const size = Math.max(canvas.width, canvas.height);
      const squareCanvas = document.createElement('canvas');
      squareCanvas.width = size;
      squareCanvas.height = size;
      const sctx = squareCanvas.getContext('2d');
      sctx.fillStyle = '#dceaf2';
      sctx.fillRect(0, 0, size, size);
      const dx = (size - canvas.width) / 2;
      const dy = (size - canvas.height) / 2;
      sctx.drawImage(canvas, dx, dy);

      triggerDownloadCanvas(squareCanvas);
    }).catch(err => {
      console.warn('html2canvas failed, using canvas fallback renderer:', err);
      renderSheetWithCanvas();
    });
  } else {
    renderSheetWithCanvas();
  }
}

function triggerDownloadCanvas(canvas) {
  const url = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = url;
  const fileName = (state.name || 'penguin').replace(/[/\\?%*:|"<>]/g, '_');
  a.download = `${fileName}_square_sheet.png`;
  a.click();
  showToast('正方形キャラクター画像を保存しました');
}

// Pure Canvas Fallback Renderer (PERFECT SQUARE 900x900)
function renderSheetWithCanvas() {
  const canvas = document.createElement('canvas');
  const size = 900;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const derived = getDerivedStats();
  const isAnti = state.type === 'anti';
  const typeText = isAnti ? 'アンチペンギン' : 'ヒーローペンギン';
  const phiLabel = isAnti ? '氷河の魂' : '哲学';
  const abilityLabel = isAnti ? '氷河のギフト' : '哲学能力';
  const species = getSpecies();

  // Background (Ice Blue)
  ctx.fillStyle = '#dceaf2';
  ctx.fillRect(0, 0, size, size);

  // Card Panel (White background, deep blue border, sharp corners)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#102a43';
  ctx.lineWidth = 2;
  ctx.fillRect(36, 36, size - 72, size - 72);
  ctx.strokeRect(36, 36, size - 72, size - 72);

  // Top Accent Line
  ctx.fillStyle = '#102a43';
  ctx.fillRect(36, 36, size - 72, 4);

  // Portrait Box (Upper Left in Sheet)
  const portX = 64;
  const portY = 56;
  const portSize = 68;

  if (state.characterImageObj && state.characterImageObj.complete && state.characterImageObj.naturalWidth > 0) {
    const img = state.characterImageObj;
    // Crop: Square based on TOP CENTER (上辺中央基準で正方形にクロップ)
    const sSize = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - sSize) / 2; // 中央揃え
    const sy = 0; // 上辺基準！全身イラストでも顔まわりが綺麗に入る
    ctx.drawImage(img, sx, sy, sSize, sSize, portX, portY, portSize, portSize);
  } else {
    ctx.fillStyle = '#f4f9fd';
    ctx.fillRect(portX, portY, portSize, portSize);
  }
  ctx.strokeStyle = '#102a43';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(portX, portY, portSize, portSize);

  // Title & Header (Next to Portrait)
  const textX = 146;
  ctx.fillStyle = '#0c2340';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(state.name || '名前未定', textX, 82);

  ctx.fillStyle = '#244b6e';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(state.playerName ? `PL: ${state.playerName}` : 'PL: 未設定', textX, 106);

  // Badge (Sharp rectangle)
  ctx.fillStyle = '#e1eff6';
  ctx.strokeStyle = '#102a43';
  ctx.lineWidth = 1.5;
  ctx.fillRect(size - 306, 65, 240, 32);
  ctx.strokeRect(size - 306, 65, 240, 32);

  ctx.fillStyle = '#0c2340';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`${typeText} / ${species.name}`, size - 186, 86);
  ctx.textAlign = 'left';

  // Substats Grid (体温値, Fat, Defense, Willpower)
  const substats = [
    { label: '体温値 (WARMTH)', val: derived.warmth }, // 「体温値」と表示
    { label: 'FAT (脂肪)', val: derived.fat },
    { label: '防御力 (DEFENSE)', val: derived.defense },
    { label: '意志力 (WILLPOWER)', val: derived.willpower }
  ];

  const boxW = 186;
  const boxH = 64;
  substats.forEach((s, idx) => {
    const bx = 64 + idx * 200;
    const by = 138;
    ctx.fillStyle = '#f4f9fd';
    ctx.strokeStyle = '#102a43';
    ctx.lineWidth = 1;
    ctx.fillRect(bx, by, boxW, boxH);
    ctx.strokeRect(bx, by, boxW, boxH);

    ctx.fillStyle = '#244b6e';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(s.label, bx + 12, by + 22);

    ctx.fillStyle = '#0c2340';
    ctx.font = 'bold 22px monospace';
    ctx.fillText(String(s.val), bx + 12, by + 50);
  });

  // Attributes Bar (Sharp rectangle)
  const attrY = 220;
  ctx.fillStyle = '#ebf4fa';
  ctx.strokeStyle = '#102a43';
  ctx.lineWidth = 1;
  ctx.fillRect(64, attrY, size - 128, 64);
  ctx.strokeRect(64, attrY, size - 128, 64);

  const attrs = [
    { label: '敏捷 (AGI)', val: derived.agi },
    { label: '筋力 (STR)', val: derived.str },
    { label: `${phiLabel}`, val: derived.phi },
    { label: '生存 (SUR)', val: derived.sur }
  ];

  attrs.forEach((a, idx) => {
    const ax = 64 + idx * ((size - 128) / 4);
    ctx.fillStyle = '#244b6e';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(a.label, ax + (size - 128) / 8, attrY + 24);

    ctx.fillStyle = '#0c2340';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(String(a.val), ax + (size - 128) / 8, attrY + 50);
  });
  ctx.textAlign = 'left';

  // Two-Column Section: Equipment (Left) and Abilities (Right)
  const colY = 308;
  const colW = 376;
  const colH = 500;

  // Left: Equipments
  ctx.fillStyle = '#0c2340';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('EQUIPMENT / 装備', 64, colY + 12);
  ctx.strokeStyle = '#102a43';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(64, colY + 18);
  ctx.lineTo(64 + colW, colY + 18);
  ctx.stroke();

  let curEqY = colY + 30;
  if (state.equipments.length === 0) {
    ctx.fillStyle = '#486581';
    ctx.font = '12px sans-serif';
    ctx.fillText('装備なし', 64, curEqY + 16);
  } else {
    state.equipments.forEach(eq => {
      if (curEqY > colY + colH - 50) return;
      ctx.fillStyle = '#f4f9fd';
      ctx.strokeStyle = '#102a43';
      ctx.lineWidth = 1;
      ctx.fillRect(64, curEqY, colW, 44);
      ctx.strokeRect(64, curEqY, colW, 44);

      ctx.fillStyle = '#0c2340';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(eq.name || '未命名', 76, curEqY + 18);

      let statText = '';
      if (eq.type === 'weapon') statText = `ダメ ${eq.damage >= 0 ? '+' + eq.damage : eq.damage}`;
      else if (eq.type === 'armor') statText = `装甲 ${eq.armor}`;
      else statText = '道具';

      ctx.fillStyle = '#244b6e';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(statText, 64 + colW - 74, curEqY + 18);

      if (eq.note) {
        ctx.fillStyle = '#486581';
        ctx.font = '10px sans-serif';
        ctx.fillText(eq.note.substring(0, 32), 76, curEqY + 34);
      }

      curEqY += 50;
    });
  }

  // Right: Abilities
  const rightX = 64 + colW + 20;
  ctx.fillStyle = '#0c2340';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(`ABILITIES / ${abilityLabel}`, rightX, colY + 12);
  ctx.beginPath();
  ctx.moveTo(rightX, colY + 18);
  ctx.lineTo(rightX + colW, colY + 18);
  ctx.stroke();

  let curAbY = colY + 30;

  // Draw Species Special Trait first if present
  if (species.specialTrait) {
    ctx.fillStyle = '#e6f2f9';
    ctx.strokeStyle = '#102a43';
    ctx.lineWidth = 1.5;
    ctx.fillRect(rightX, curAbY, colW, 48);
    ctx.strokeRect(rightX, curAbY, colW, 48);

    ctx.fillStyle = '#0c2340';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`[種族] ${species.specialTrait.nameJa}`, rightX + 12, curAbY + 18);

    ctx.fillStyle = '#0c2340';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(species.specialTrait.tag, rightX + colW - 74, curAbY + 18);

    ctx.fillStyle = '#244b6e';
    ctx.font = '10px sans-serif';
    ctx.fillText(species.specialTrait.desc.substring(0, 32) + (species.specialTrait.desc.length > 32 ? '...' : ''), rightX + 12, curAbY + 36);

    curAbY += 54;
  }

  if (state.selectedAbilities.size === 0 && !species.specialTrait) {
    ctx.fillStyle = '#486581';
    ctx.font = '12px sans-serif';
    ctx.fillText('能力未選択', rightX, curAbY + 16);
  } else {
    state.selectedAbilities.forEach(item => {
      if (curAbY > colY + colH - 50) return;
      ctx.fillStyle = '#f4f9fd';
      ctx.strokeStyle = '#102a43';
      ctx.lineWidth = 1;
      ctx.fillRect(rightX, curAbY, colW, 48);
      ctx.strokeRect(rightX, curAbY, colW, 48);

      ctx.fillStyle = '#0c2340';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(item.nameJa, rightX + 12, curAbY + 18);

      ctx.fillStyle = '#244b6e';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`Fat ${item.fat}`, rightX + colW - 64, curAbY + 18);

      ctx.fillStyle = '#486581';
      ctx.font = '10px sans-serif';
      ctx.fillText(item.desc.substring(0, 32) + (item.desc.length > 32 ? '...' : ''), rightX + 12, curAbY + 36);

      curAbY += 54;
    });
  }

  // Footer branding
  ctx.fillStyle = '#486581';
  ctx.font = 'bold 10px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('VALLEY OF ETERNITY - CHARACTER SHEET', size / 2, size - 46);

  triggerDownloadCanvas(canvas);
}

// Reset character
function resetCharacter() {
  state.name = '';
  state.playerName = '';
  state.species = 'emperor';
  state.memo = '';
  state.characterImage = '';
  state.characterImageObj = null;
  state.attrTotalMax = 12;
  state.specialTotalMax = 5;
  state.assigned = { agi: 3, phi: 3, str: 3, sur: 3 };
  state.equipments = [
    {
      id: 'eq_1',
      type: 'weapon',
      preset: 'spear',
      name: '槍',
      damage: 2,
      armor: 0,
      note: '命中+1'
    },
    {
      id: 'eq_2',
      type: 'armor',
      preset: 'none',
      name: 'なし',
      damage: 0,
      armor: 0,
      note: '標準的な状態'
    }
  ];
  state.selectedAbilities.clear();
  
  document.getElementById('charName').value = '';
  document.getElementById('playerName').value = '';
  document.getElementById('charMemo').value = '';
  document.getElementById('attrTotalMaxInput').value = '12';
  document.getElementById('specialTotalMaxInput').value = '5';
  updatePortraitImages('');

  renderEquipmentSlots();
  updateUI();
  showToast('キャラクターデータをリセットしました');
}

// Toast notification
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.querySelector('.toast-text').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);
