// recipeGenerator.js — 레시피 생성 모듈
const RecipeGenerator = (() => {

  async function generate(ingredients, options) {
    const apiKey = Config.getApiKey();
    if (!apiKey) throw new Error('API 키가 설정되지 않았습니다.');

    const prompt = buildPrompt(ingredients, options);
    const models = Config.TEXT_MODELS;
    let lastError = null;

    for (const model of models) {
      try {
        console.log('[RecipeGenerator] Trying model:', model);
        return await callApi(apiKey, model, prompt);
      } catch (err) {
        lastError = err;
        if (err.isRateLimit) {
          console.warn(`[RecipeGenerator] Rate limited on ${model}, trying next...`);
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error('모든 모델이 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
  }

  async function callApi(apiKey, model, prompt) {
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
            role: 'system',
            content: '너는 전문 요리사이자 레시피 개발자야. 주어진 재료로 만들 수 있는 실용적인 레시피를 추천해줘. 반드시 JSON 형식으로만 응답해. 다른 텍스트 없이 JSON 배열만 반환해.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      if (response.status === 429) {
        const rateLimitErr = new Error('API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
        rateLimitErr.isRateLimit = true;
        throw rateLimitErr;
      }
      throw new Error(err.error?.message || `API 오류 (${response.status})`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('AI 응답이 비어 있습니다.');

    return parseRecipes(content);
  }

  function buildPrompt(ingredients, opts) {
    const lines = [
      `보유 재료: [${ingredients.join(', ')}]`,
      `조건: ${opts.servings}, ${opts.difficulty}, ${opts.cuisine}, ${opts.time}`,
    ];
    if (opts.extra) {
      lines.push(`추가 요청: ${opts.extra}`);
    }
    lines.push('');
    lines.push('위 재료로 만들 수 있는 레시피 3개를 다음 JSON 형식으로 추천해줘:');
    lines.push('[{"name": "요리명", "time": "소요시간", "difficulty": "난이도", "description": "간단 설명", "ingredients": {"have": ["보유재료"], "need": ["추가재료"]}, "steps": ["1단계", "2단계", ...], "tips": "조리 팁"}]');
    lines.push('JSON 배열만 반환하고 다른 텍스트는 포함하지 마.');
    return lines.join('\n');
  }

  function parseRecipes(text) {
    // JSON 블록 추출 (```json ... ``` 또는 [ ... ])
    let jsonStr = text;

    // 코드 블록 제거
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }

    // JSON 배열 추출
    const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        const recipes = JSON.parse(arrayMatch[0]);
        if (Array.isArray(recipes) && recipes.length > 0) {
          return recipes.map(normalizeRecipe);
        }
      } catch {
        // 폴백
      }
    }

    // 폴백: 텍스트를 단일 레시피로 래핑
    return [{
      name: '추천 레시피',
      time: '-',
      difficulty: '-',
      description: text.substring(0, 100),
      ingredients: { have: [], need: [] },
      steps: text.split('\n').filter(l => l.trim()),
      tips: '',
      _raw: true,
    }];
  }

  function normalizeRecipe(r) {
    return {
      name: r.name || '이름 없음',
      time: r.time || '-',
      difficulty: r.difficulty || '-',
      description: r.description || '',
      ingredients: {
        have: Array.isArray(r.ingredients?.have) ? r.ingredients.have : [],
        need: Array.isArray(r.ingredients?.need) ? r.ingredients.need : [],
      },
      steps: Array.isArray(r.steps) ? r.steps : [],
      tips: r.tips || '',
    };
  }

  return { generate };
})();
