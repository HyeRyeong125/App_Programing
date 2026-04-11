// storage.js — localStorage CRUD 모듈
const Storage = (() => {
  const KEYS = {
    profile: 'fridgeRecipe_profile',
    recipes: 'fridgeRecipe_savedRecipes',
  };

  // --- 프로필 ---
  function getProfile() {
    const raw = localStorage.getItem(KEYS.profile);
    return raw ? JSON.parse(raw) : null;
  }

  function saveProfile(profile) {
    profile.updatedAt = new Date().toISOString();
    if (!profile.createdAt) profile.createdAt = profile.updatedAt;
    localStorage.setItem(KEYS.profile, JSON.stringify(profile));
  }

  function deleteProfile() {
    localStorage.removeItem(KEYS.profile);
  }

  // --- 저장된 레시피 ---
  function getSavedRecipes() {
    const raw = localStorage.getItem(KEYS.recipes);
    return raw ? JSON.parse(raw) : [];
  }

  function saveRecipe(recipe, memo) {
    const list = getSavedRecipes();
    const dup = list.find(r => r.name === recipe.name);
    if (dup) return { duplicate: true, existing: dup };

    const entry = {
      id: 'recipe_' + Date.now(),
      name: recipe.name,
      time: recipe.time,
      difficulty: recipe.difficulty,
      description: recipe.description,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      tips: recipe.tips,
      memo: memo || '',
      savedAt: new Date().toISOString(),
    };
    list.unshift(entry);
    localStorage.setItem(KEYS.recipes, JSON.stringify(list));
    return { duplicate: false, entry };
  }

  function deleteRecipe(id) {
    const list = getSavedRecipes().filter(r => r.id !== id);
    localStorage.setItem(KEYS.recipes, JSON.stringify(list));
  }

  function updateRecipeMemo(id, memo) {
    const list = getSavedRecipes();
    const target = list.find(r => r.id === id);
    if (target) {
      target.memo = memo;
      localStorage.setItem(KEYS.recipes, JSON.stringify(list));
    }
  }

  function searchRecipes(keyword) {
    if (!keyword) return getSavedRecipes();
    const q = keyword.toLowerCase();
    return getSavedRecipes().filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.ingredients.have.some(i => i.toLowerCase().includes(q)) ||
      r.ingredients.need.some(i => i.toLowerCase().includes(q))
    );
  }

  function sortRecipes(list, by) {
    if (by === 'name') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    }
    // 기본: 최신순
    return [...list].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
  }

  return {
    getProfile, saveProfile, deleteProfile,
    getSavedRecipes, saveRecipe, deleteRecipe, updateRecipeMemo,
    searchRecipes, sortRecipes,
  };
})();
