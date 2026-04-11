// app.js — 메인 앱 로직
document.addEventListener('DOMContentLoaded', () => {
  // === DOM 요소 ===

  // Step 1: 이미지 업로드
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const previewContainer = document.getElementById('preview-container');
  const previewImage = document.getElementById('preview-image');
  const btnRemoveImage = document.getElementById('btn-remove-image');
  const btnAnalyze = document.getElementById('btn-analyze');
  const loading = document.getElementById('loading');
  const errorMessage = document.getElementById('error-message');
  const errorText = document.getElementById('error-text');
  const btnRetry = document.getElementById('btn-retry');

  // Step 2: 재료 목록
  const stepUpload = document.getElementById('step-upload');
  const stepIngredients = document.getElementById('step-ingredients');
  const ingredientsList = document.getElementById('ingredients-list');
  const ingredientInput = document.getElementById('ingredient-input');
  const btnAddIngredient = document.getElementById('btn-add-ingredient');
  const btnBack = document.getElementById('btn-back');
  const btnNext = document.getElementById('btn-next');

  // Step 3: 옵션
  const stepOptions = document.getElementById('step-options');
  const optionsIngredientsSummary = document.getElementById('options-ingredients-summary');
  const extraRequest = document.getElementById('extra-request');
  const btnBackToIngredients = document.getElementById('btn-back-to-ingredients');
  const btnGenerate = document.getElementById('btn-generate');
  const recipeLoading = document.getElementById('recipe-loading');
  const recipeError = document.getElementById('recipe-error');
  const recipeErrorText = document.getElementById('recipe-error-text');
  const btnRecipeRetry = document.getElementById('btn-recipe-retry');

  // Step 4: 레시피 카드
  const stepRecipes = document.getElementById('step-recipes');
  const recipeCards = document.getElementById('recipe-cards');
  const btnBackToOptions = document.getElementById('btn-back-to-options');
  const btnRegenerate = document.getElementById('btn-regenerate');

  // Step 5: 상세 레시피
  const stepDetail = document.getElementById('step-detail');
  const recipeDetail = document.getElementById('recipe-detail');
  const btnBackToList = document.getElementById('btn-back-to-list');
  const btnSaveRecipe = document.getElementById('btn-save-recipe');

  // API 키 모달
  const apiKeyModal = document.getElementById('api-key-modal');
  const apiKeyInput = document.getElementById('api-key-input');
  const btnSaveKey = document.getElementById('btn-save-key');

  // 네비게이션
  const navBtns = document.querySelectorAll('.nav-btn');

  // 프로필
  const pageProfile = document.getElementById('page-profile');
  const profileNickname = document.getElementById('profile-nickname');
  const allergyTags = document.getElementById('allergy-tags');
  const allergyInput = document.getElementById('allergy-input');
  const btnAddAllergy = document.getElementById('btn-add-allergy');
  const profileServings = document.getElementById('profile-servings');
  const btnServingsMinus = document.getElementById('btn-servings-minus');
  const btnServingsPlus = document.getElementById('btn-servings-plus');
  const btnProfileReset = document.getElementById('btn-profile-reset');
  const btnProfileSave = document.getElementById('btn-profile-save');
  const profileStatus = document.getElementById('profile-status');

  // 저장된 레시피
  const pageSaved = document.getElementById('page-saved');
  const savedSearch = document.getElementById('saved-search');
  const savedSortSelect = document.getElementById('saved-sort-select');
  const savedList = document.getElementById('saved-list');
  const savedEmpty = document.getElementById('saved-empty');

  // 저장된 레시피 상세
  const pageSavedDetail = document.getElementById('page-saved-detail');
  const savedDetailContent = document.getElementById('saved-detail-content');
  const savedDetailMemo = document.getElementById('saved-detail-memo');
  const btnSavedDetailBack = document.getElementById('btn-saved-detail-back');
  const btnSavedDetailMemoSave = document.getElementById('btn-saved-detail-memo-save');

  // === 상태 ===
  let currentFile = null;
  let currentBase64 = null;
  let ingredients = [];
  let recipes = [];
  let selectedRecipeIndex = -1;
  let profileAllergies = [];
  let currentSavedDetailId = null;
  let currentNav = 'main';

  // === 초기화 ===
  if (!Config.hasApiKey()) {
    apiKeyModal.classList.remove('hidden');
  }

  btnSaveKey.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (key) {
      Config.setApiKey(key);
      apiKeyModal.classList.add('hidden');
    }
  });

  // =====================
  // 네비게이션
  // =====================
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navigateTo(btn.dataset.nav);
    });
  });

  function navigateTo(nav) {
    currentNav = nav;
    // 네비게이션 활성화
    navBtns.forEach(b => b.classList.toggle('active', b.dataset.nav === nav));

    // 모든 step/page 숨기기
    const allSections = document.querySelectorAll('.step, .page');
    allSections.forEach(s => {
      s.classList.remove('active');
      s.classList.add('hidden');
    });

    if (nav === 'main') {
      // 메인 플로우: 현재 활성 step 복원
      showStep(currentMainStep);
    } else if (nav === 'saved') {
      pageSaved.classList.remove('hidden');
      pageSaved.classList.add('active');
      renderSavedList();
    } else if (nav === 'profile') {
      pageProfile.classList.remove('hidden');
      pageProfile.classList.add('active');
      loadProfileUI();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // =====================
  // 메인 플로우 (Step 1~5)
  // =====================
  let currentMainStep = 'upload';
  const mainSteps = { upload: stepUpload, ingredients: stepIngredients, options: stepOptions, recipes: stepRecipes, detail: stepDetail };

  function showStep(step) {
    currentMainStep = step;
    if (currentNav !== 'main') return; // 다른 탭이면 표시하지 않음

    Object.values(mainSteps).forEach(s => {
      s.classList.remove('active');
      s.classList.add('hidden');
    });

    const target = mainSteps[step];
    if (target) {
      target.classList.remove('hidden');
      target.classList.add('active');
    }

    if (step === 'options') {
      optionsIngredientsSummary.textContent = ingredients.join(', ');
      Profile.applyDefaults();
      // 프로필 기반 추가 요청 자동 채움
      const profile = Profile.get();
      const autoExtra = Profile.toPromptExtra(profile);
      if (autoExtra && !extraRequest.value) {
        extraRequest.value = autoExtra;
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- 드래그 앤 드롭 ---
  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  async function handleFile(file) {
    try {
      ImageAnalyzer.validateFile(file);
      currentFile = file;
      currentBase64 = await ImageAnalyzer.fileToBase64(file);
      previewImage.src = currentBase64;
      previewContainer.classList.remove('hidden');
      dropZone.classList.add('hidden');
      btnAnalyze.classList.remove('hidden');
      hideError();
    } catch (err) {
      showError(err.message);
    }
  }

  btnRemoveImage.addEventListener('click', resetUpload);

  function resetUpload() {
    currentFile = null;
    currentBase64 = null;
    fileInput.value = '';
    previewContainer.classList.add('hidden');
    btnAnalyze.classList.add('hidden');
    dropZone.classList.remove('hidden');
    hideError();
  }

  // --- 분석 ---
  btnAnalyze.addEventListener('click', runAnalysis);
  btnRetry.addEventListener('click', runAnalysis);

  async function runAnalysis() {
    if (!currentBase64) return;
    if (!Config.hasApiKey()) { apiKeyModal.classList.remove('hidden'); return; }

    showLoading(true);
    hideError();
    try {
      ingredients = await ImageAnalyzer.analyze(currentBase64);
      renderIngredients();
      showStep('ingredients');
    } catch (err) {
      if (err.isAuthError) {
        apiKeyModal.classList.remove('hidden');
      }
      showError(err.message);
    } finally {
      showLoading(false);
    }
  }

  // --- 재료 ---
  function renderIngredients() {
    ingredientsList.innerHTML = '';
    ingredients.forEach((name, idx) => {
      const tag = document.createElement('span');
      tag.className = 'ingredient-tag';
      tag.innerHTML = `${escapeHtml(name)} <span class="remove" data-index="${idx}">✕</span>`;
      ingredientsList.appendChild(tag);
    });
  }

  ingredientsList.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove')) {
      ingredients.splice(parseInt(e.target.dataset.index, 10), 1);
      renderIngredients();
    }
  });

  function addIngredient() {
    const name = ingredientInput.value.trim();
    if (name && !ingredients.includes(name)) {
      ingredients.push(name);
      renderIngredients();
      ingredientInput.value = '';
    }
    ingredientInput.focus();
  }

  btnAddIngredient.addEventListener('click', addIngredient);
  ingredientInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addIngredient(); });

  // --- 옵션 버튼 토글 ---
  document.querySelectorAll('.option-buttons').forEach(group => {
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('.opt-btn');
      if (!btn) return;
      group.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  function getSelectedOption(name) {
    const group = document.querySelector(`.option-buttons[data-name="${name}"]`);
    const active = group?.querySelector('.opt-btn.active');
    return active?.dataset.value || '';
  }

  function setSelectedOption(name, value) {
    const group = document.querySelector(`.option-buttons[data-name="${name}"]`);
    if (!group) return;
    group.querySelectorAll('.opt-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.value === value);
    });
  }

  // --- 레시피 생성 ---
  btnGenerate.addEventListener('click', runGenerate);
  btnRecipeRetry.addEventListener('click', runGenerate);
  btnRegenerate.addEventListener('click', () => showStep('options'));

  async function runGenerate() {
    if (!Config.hasApiKey()) { apiKeyModal.classList.remove('hidden'); return; }

    recipeLoading.classList.remove('hidden');
    recipeError.classList.add('hidden');
    btnGenerate.classList.add('hidden');

    const options = {
      servings: getSelectedOption('servings'),
      difficulty: getSelectedOption('difficulty'),
      cuisine: getSelectedOption('cuisine'),
      time: getSelectedOption('time'),
      extra: extraRequest.value.trim(),
    };

    try {
      recipes = await RecipeGenerator.generate(ingredients, options);
      renderRecipeCards();
      showStep('recipes');
    } catch (err) {
      recipeErrorText.textContent = err.message;
      recipeError.classList.remove('hidden');
    } finally {
      recipeLoading.classList.add('hidden');
      btnGenerate.classList.remove('hidden');
    }
  }

  function renderRecipeCards() {
    recipeCards.innerHTML = '';
    recipes.forEach((r, idx) => {
      const card = document.createElement('div');
      card.className = 'recipe-card';
      card.innerHTML = `
        <h3>${escapeHtml(r.name)}</h3>
        <div class="recipe-meta">
          <span>⏰ ${escapeHtml(r.time)}</span>
          <span>⭐ ${escapeHtml(r.difficulty)}</span>
        </div>
        <p class="recipe-desc">${escapeHtml(r.description)}</p>
      `;
      card.addEventListener('click', () => showRecipeDetail(idx));
      recipeCards.appendChild(card);
    });
  }

  function showRecipeDetail(idx) {
    selectedRecipeIndex = idx;
    const r = recipes[idx];
    recipeDetail.innerHTML = buildDetailHtml(r);
    showStep('detail');
  }

  // --- 레시피 저장 (개선: 메모 + 중복 체크) ---
  btnSaveRecipe.addEventListener('click', () => {
    if (selectedRecipeIndex < 0) return;
    const recipe = recipes[selectedRecipeIndex];
    const memo = prompt('메모를 입력하세요 (선택사항):', '') || '';
    const result = Storage.saveRecipe(recipe, memo);

    if (result.duplicate) {
      if (confirm(`"${recipe.name}" 레시피가 이미 저장되어 있습니다. 덮어쓰시겠습니까?`)) {
        Storage.deleteRecipe(result.existing.id);
        Storage.saveRecipe(recipe, memo);
        alert(`"${recipe.name}" 레시피가 저장되었습니다!`);
      }
    } else {
      alert(`"${recipe.name}" 레시피가 저장되었습니다!`);
    }
  });

  // --- 화면 전환 ---
  btnBack.addEventListener('click', () => { resetUpload(); showStep('upload'); });
  btnNext.addEventListener('click', () => {
    if (ingredients.length === 0) { alert('재료를 최소 1개 이상 선택해주세요.'); return; }
    showStep('options');
  });
  btnBackToIngredients.addEventListener('click', () => showStep('ingredients'));
  btnBackToOptions.addEventListener('click', () => showStep('options'));
  btnBackToList.addEventListener('click', () => showStep('recipes'));

  // =====================
  // 프로필
  // =====================
  function loadProfileUI() {
    const p = Profile.get();
    profileNickname.value = p.nickname || '';
    profileAllergies = p.allergies ? [...p.allergies] : [];
    renderAllergyTags();
    setSelectedOption('dietType', p.dietType || '일반');
    setSelectedOption('spiceLevel', p.spiceLevel || '보통');
    profileServings.textContent = p.defaultServings || 2;
    profileStatus.classList.add('hidden');
  }

  function renderAllergyTags() {
    allergyTags.innerHTML = '';
    profileAllergies.forEach((name, idx) => {
      const tag = document.createElement('span');
      tag.className = 'allergy-tag';
      tag.innerHTML = `🚫 ${escapeHtml(name)} <span class="remove" data-index="${idx}">✕</span>`;
      allergyTags.appendChild(tag);
    });
  }

  allergyTags.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove')) {
      profileAllergies.splice(parseInt(e.target.dataset.index, 10), 1);
      renderAllergyTags();
    }
  });

  function addAllergy() {
    const name = allergyInput.value.trim();
    if (name && !profileAllergies.includes(name)) {
      profileAllergies.push(name);
      renderAllergyTags();
      allergyInput.value = '';
    }
    allergyInput.focus();
  }

  btnAddAllergy.addEventListener('click', addAllergy);
  allergyInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addAllergy(); });

  btnServingsMinus.addEventListener('click', () => {
    let v = parseInt(profileServings.textContent, 10);
    if (v > 1) profileServings.textContent = v - 1;
  });

  btnServingsPlus.addEventListener('click', () => {
    let v = parseInt(profileServings.textContent, 10);
    if (v < 10) profileServings.textContent = v + 1;
  });

  btnProfileSave.addEventListener('click', () => {
    const data = {
      nickname: profileNickname.value.trim(),
      allergies: [...profileAllergies],
      dietType: getSelectedOption('dietType'),
      spiceLevel: getSelectedOption('spiceLevel'),
      defaultServings: parseInt(profileServings.textContent, 10),
    };
    Profile.save(data);
    profileStatus.textContent = '✅ 프로필이 저장되었습니다!';
    profileStatus.classList.remove('hidden');
    setTimeout(() => profileStatus.classList.add('hidden'), 2500);
  });

  btnProfileReset.addEventListener('click', () => {
    if (!confirm('프로필을 초기화하시겠습니까?')) return;
    Profile.remove();
    loadProfileUI();
    profileStatus.textContent = '프로필이 초기화되었습니다.';
    profileStatus.classList.remove('hidden');
    setTimeout(() => profileStatus.classList.add('hidden'), 2500);
  });

  // =====================
  // 저장된 레시피 목록
  // =====================
  function renderSavedList() {
    const keyword = savedSearch.value.trim();
    let list = Storage.searchRecipes(keyword);
    list = Storage.sortRecipes(list, savedSortSelect.value);

    savedList.innerHTML = '';
    if (list.length === 0) {
      savedEmpty.classList.remove('hidden');
      return;
    }
    savedEmpty.classList.add('hidden');

    list.forEach(r => {
      const card = document.createElement('div');
      card.className = 'saved-card';
      const date = new Date(r.savedAt).toLocaleDateString('ko-KR');
      card.innerHTML = `
        <h3>🍳 ${escapeHtml(r.name)}</h3>
        <div class="saved-meta">
          <span>⏰ ${escapeHtml(r.time)}</span>
          <span>⭐ ${escapeHtml(r.difficulty)}</span>
        </div>
        <div class="saved-date">📅 ${date} 저장</div>
        ${r.memo ? `<div class="saved-memo">📝 ${escapeHtml(r.memo)}</div>` : ''}
        <div class="saved-card-actions">
          <button class="btn btn-secondary btn-view" data-id="${r.id}">보기</button>
          <button class="btn-danger btn-delete" data-id="${r.id}" data-name="${escapeHtml(r.name)}">🗑️ 삭제</button>
        </div>
      `;
      savedList.appendChild(card);
    });
  }

  savedSearch.addEventListener('input', renderSavedList);
  savedSortSelect.addEventListener('change', renderSavedList);

  savedList.addEventListener('click', (e) => {
    const viewBtn = e.target.closest('.btn-view');
    const deleteBtn = e.target.closest('.btn-delete');

    if (viewBtn) {
      showSavedDetail(viewBtn.dataset.id);
    } else if (deleteBtn) {
      const name = deleteBtn.dataset.name;
      if (confirm(`"${name}" 레시피를 삭제하시겠습니까?`)) {
        Storage.deleteRecipe(deleteBtn.dataset.id);
        renderSavedList();
      }
    }
  });

  // =====================
  // 저장된 레시피 상세
  // =====================
  function showSavedDetail(id) {
    const list = Storage.getSavedRecipes();
    const r = list.find(x => x.id === id);
    if (!r) return;

    currentSavedDetailId = id;
    savedDetailContent.innerHTML = buildDetailHtml(r);
    savedDetailMemo.value = r.memo || '';

    // 페이지 전환
    pageSaved.classList.remove('active');
    pageSaved.classList.add('hidden');
    pageSavedDetail.classList.remove('hidden');
    pageSavedDetail.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  btnSavedDetailBack.addEventListener('click', () => {
    pageSavedDetail.classList.remove('active');
    pageSavedDetail.classList.add('hidden');
    pageSaved.classList.remove('hidden');
    pageSaved.classList.add('active');
    renderSavedList();
  });

  btnSavedDetailMemoSave.addEventListener('click', () => {
    if (!currentSavedDetailId) return;
    Storage.updateRecipeMemo(currentSavedDetailId, savedDetailMemo.value.trim());
    alert('메모가 저장되었습니다!');
  });

  // =====================
  // 공통 유틸리티
  // =====================
  function buildDetailHtml(r) {
    const haveHtml = r.ingredients.have.length
      ? `<span class="ing-have">✅ ${r.ingredients.have.map(escapeHtml).join(', ')}</span> (보유)` : '';
    const needHtml = r.ingredients.need.length
      ? `<span class="ing-need">🛒 ${r.ingredients.need.map(escapeHtml).join(', ')}</span> (추가 필요)` : '';
    const stepsHtml = r.steps.map(s => `<li>${escapeHtml(s)}</li>`).join('');

    return `
      <div class="detail-header">
        <h2>🍳 ${escapeHtml(r.name)}</h2>
        <div class="detail-meta">
          <span>⏰ ${escapeHtml(r.time)}</span>
          <span>⭐ ${escapeHtml(r.difficulty)}</span>
        </div>
      </div>
      <div class="detail-section">
        <h3>📦 재료</h3>
        <div class="ing-list">
          ${haveHtml ? `<p>${haveHtml}</p>` : ''}
          ${needHtml ? `<p>${needHtml}</p>` : ''}
        </div>
      </div>
      <div class="detail-section">
        <h3>📝 조리 순서</h3>
        <ol>${stepsHtml}</ol>
      </div>
      ${r.tips ? `<div class="detail-section"><h3>💡 팁</h3><div class="tips">${escapeHtml(r.tips)}</div></div>` : ''}
    `;
  }

  function showLoading(show) {
    loading.classList.toggle('hidden', !show);
    btnAnalyze.classList.toggle('hidden', show);
  }

  function showError(msg) {
    errorText.textContent = msg;
    errorMessage.classList.remove('hidden');
  }

  function hideError() {
    errorMessage.classList.add('hidden');
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
});
