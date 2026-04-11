// profile.js — 프로필 관리 모듈
const Profile = (() => {
  const DEFAULTS = {
    nickname: '',
    allergies: [],
    dietType: '일반',
    spiceLevel: '보통',
    defaultServings: 2,
  };

  function get() {
    return Storage.getProfile() || { ...DEFAULTS };
  }

  function save(data) {
    Storage.saveProfile(data);
  }

  function remove() {
    Storage.deleteProfile();
  }

  function hasProfile() {
    return Storage.getProfile() !== null;
  }

  // 프로필을 레시피 프롬프트에 반영할 추가 조건을 생성
  function toPromptExtra(profile) {
    const parts = [];
    if (profile.allergies && profile.allergies.length > 0) {
      parts.push(`알레르기 재료 제외: ${profile.allergies.join(', ')}`);
    }
    if (profile.dietType && profile.dietType !== '일반') {
      parts.push(`식단: ${profile.dietType}`);
    }
    if (profile.spiceLevel) {
      parts.push(`매운맛 선호: ${profile.spiceLevel}`);
    }
    return parts.join('. ');
  }

  // 프로필의 기본 인원수로 옵션 버튼 자동 선택
  function applyDefaults() {
    const profile = get();
    if (!profile.defaultServings) return;

    const servingsMap = { 1: '1인분', 2: '2인분', 3: '3~4인분', 4: '3~4인분', 5: '5인분 이상' };
    const value = servingsMap[profile.defaultServings] || '2인분';
    const group = document.querySelector('.option-buttons[data-name="servings"]');
    if (group) {
      group.querySelectorAll('.opt-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === value);
      });
    }
  }

  return { get, save, remove, hasProfile, toPromptExtra, applyDefaults, DEFAULTS };
})();
