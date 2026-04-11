// config.js — API 설정 관리
const Config = (() => {
  const STORAGE_KEY = 'fridgeRecipe_apiKey';
  const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

  const VISION_MODELS = [
    'google/gemma-4-31b-it:free',
    'google/gemma-4-26b-a4b-it:free',
    'nvidia/nemotron-nano-12b-v2-vl:free',
  ];

  const TEXT_MODELS = [
    'google/gemma-4-26b-a4b-it:free',
    'google/gemma-4-31b-it:free',
    'qwen/qwen3-next-80b-a3b-instruct:free',
    'nvidia/nemotron-3-nano-30b-a3b:free',
  ];

  // 하위 호환용
  const VISION_MODEL = VISION_MODELS[0];
  const TEXT_MODEL = TEXT_MODELS[0];

  function getApiKey() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored.trim().length > 0) {
      console.log('[Config] API key from localStorage, length:', stored.trim().length);
      return stored.trim();
    }
    if (typeof ENV !== 'undefined' && ENV.OPENROUTER_API_KEY) {
      console.log('[Config] API key from ENV, length:', ENV.OPENROUTER_API_KEY.length);
      return ENV.OPENROUTER_API_KEY;
    }
    console.warn('[Config] No API key found!');
    return '';
  }

  function setApiKey(key) {
    localStorage.setItem(STORAGE_KEY, key);
  }

  function hasApiKey() {
    return getApiKey().length > 0;
  }

  // env.js에서 키가 있으면 항상 localStorage에 저장 (빈값 덮어쓰기)
  if (typeof ENV !== 'undefined' && ENV.OPENROUTER_API_KEY) {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored || stored.trim().length === 0) {
      setApiKey(ENV.OPENROUTER_API_KEY);
    }
  }

  function clearApiKey() {
    localStorage.removeItem(STORAGE_KEY);
  }

  return { API_URL, VISION_MODEL, TEXT_MODEL, VISION_MODELS, TEXT_MODELS, getApiKey, setApiKey, hasApiKey, clearApiKey };
})();
