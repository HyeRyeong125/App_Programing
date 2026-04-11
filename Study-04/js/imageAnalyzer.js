// imageAnalyzer.js — 이미지 분석 모듈
const ImageAnalyzer = (() => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  function validateFile(file) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('지원하지 않는 파일 형식입니다. JPG, PNG, WEBP만 가능합니다.');
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('파일 크기가 5MB를 초과합니다.');
    }
    return true;
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
      reader.readAsDataURL(file);
    });
  }

  async function analyze(base64DataUrl) {
    const apiKey = Config.getApiKey();
    if (!apiKey) {
      throw new Error('API 키가 설정되지 않았습니다.');
    }

    const models = Config.VISION_MODELS;
    let lastError = null;

    for (const model of models) {
      try {
        console.log('[ImageAnalyzer] Trying model:', model);
        return await callApi(apiKey, model, base64DataUrl);
      } catch (err) {
        lastError = err;
        if (err.isAuthError) throw err; // 인증 에러는 즉시 중단
        if (err.isRateLimit) {
          console.warn(`[ImageAnalyzer] Rate limited on ${model}, trying next...`);
          continue;
        }
        throw err; // 기타 에러는 즉시 중단
      }
    }

    throw lastError || new Error('모든 모델이 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
  }

  async function callApi(apiKey, model, base64DataUrl) {
    const response = await fetch(Config.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.href,
        'X-Title': 'Fridge Recipe',
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '이 냉장고 사진에서 보이는 식재료를 모두 찾아서 JSON 배열로 반환해줘. 형식: ["재료1", "재료2", ...] JSON 배열만 반환하고 다른 텍스트는 포함하지 마.',
              },
              {
                type: 'image_url',
                image_url: { url: base64DataUrl },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      if (response.status === 401 || (err.error?.message && err.error.message.includes('Authentication'))) {
        Config.clearApiKey();
        const authErr = new Error('API 키가 유효하지 않습니다. 새로운 API 키를 입력해주세요.');
        authErr.isAuthError = true;
        throw authErr;
      }
      if (response.status === 429) {
        const rateLimitErr = new Error('API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
        rateLimitErr.isRateLimit = true;
        throw rateLimitErr;
      }
      throw new Error(err.error?.message || `API 오류 (${response.status})`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('AI 응답이 비어 있습니다.');
    }

    return parseIngredients(content);
  }

  function parseIngredients(text) {
    // 1차: JSON 배열 파싱 시도
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      try {
        const arr = JSON.parse(jsonMatch[0]);
        if (Array.isArray(arr) && arr.length > 0) {
          return arr.map(item => String(item).trim()).filter(Boolean);
        }
      } catch {
        // 폴백으로 진행
      }
    }

    // 2차: 쉼표/줄바꿈으로 구분된 텍스트에서 추출
    const cleaned = text.replace(/[\[\]"'`]/g, '');
    const items = cleaned.split(/[,\n]/)
      .map(s => s.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter(s => s.length > 0 && s.length < 20);

    if (items.length > 0) return items;

    throw new Error('재료를 인식하지 못했습니다. 다른 사진으로 시도해주세요.');
  }

  return { validateFile, fileToBase64, analyze };
})();
