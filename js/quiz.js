/**
 * 상식 퀴즈 챌린지 - 퀴즈 진행 로직
 */
const Quiz = (() => {
  const CATEGORIES = ["한국사", "과학", "지리", "일반상식"];
  const CATEGORY_ICONS = { "한국사": "📜", "과학": "🔬", "지리": "🌍", "일반상식": "💡" };
  const QUESTIONS_PER_CATEGORY = 10;

  let nickname = '';
  let categoryIndex = 0;
  let questionIndex = 0;
  let categoryScores = {};
  let totalAnswered = 0;

  // DOM 요소 캐시
  const els = {};
  function cacheElements() {
    els.category = document.getElementById('quiz-category');
    els.progressText = document.getElementById('quiz-progress-text');
    els.progressBar = document.getElementById('quiz-progress-bar');
    els.question = document.getElementById('quiz-question');
    els.options = document.getElementById('quiz-options');
    els.feedback = document.getElementById('quiz-feedback');
    els.nextBtn = document.getElementById('next-btn');
    els.score = document.getElementById('quiz-score');
    els.transitionResult = document.getElementById('transition-result');
    els.transitionNext = document.getElementById('transition-next-category');
    els.resultTotal = document.getElementById('result-total');
    els.resultPercent = document.getElementById('result-percent');
    els.resultGrade = document.getElementById('result-grade');
    els.resultMessage = document.getElementById('result-message');
    els.resultCategories = document.getElementById('result-categories');
  }

  function start(name) {
    nickname = name;
    categoryIndex = 0;
    questionIndex = 0;
    totalAnswered = 0;
    categoryScores = {};
    CATEGORIES.forEach(c => categoryScores[c] = 0);
    if (!els.category) cacheElements();
    showQuestion();
  }

  function getNickname() {
    return nickname;
  }

  function getCategoryScores() {
    return { ...categoryScores };
  }

  function getTotalScore() {
    return Object.values(categoryScores).reduce((sum, s) => sum + s, 0);
  }

  // 현재 문제 데이터
  function currentCategory() {
    return CATEGORIES[categoryIndex];
  }

  function currentQuestionData() {
    return quizData[currentCategory()][questionIndex];
  }

  // 문제 표시
  function showQuestion() {
    const cat = currentCategory();
    const q = currentQuestionData();

    // 헤더
    els.category.textContent = `${CATEGORY_ICONS[cat]} ${cat}`;
    els.progressText.textContent = `문제 ${questionIndex + 1}/${QUESTIONS_PER_CATEGORY}`;

    // 프로그레스바 (전체 40문제 기준)
    const progress = (totalAnswered / (CATEGORIES.length * QUESTIONS_PER_CATEGORY)) * 100;
    els.progressBar.style.width = `${progress}%`;

    // 질문
    els.question.textContent = `Q. ${q.question}`;

    // 보기 버튼 생성
    els.options.innerHTML = '';
    const labels = ['①', '②', '③', '④'];
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.textContent = `${labels[i]} ${opt}`;
      btn.addEventListener('click', () => handleAnswer(i));
      els.options.appendChild(btn);
    });

    // 피드백 숨기기
    els.feedback.classList.add('hidden');
    els.feedback.className = 'feedback hidden';
    els.nextBtn.classList.add('hidden');

    // 현재 점수
    els.score.textContent = `현재 점수: ${getTotalScore()}/${totalAnswered}`;
  }

  // 정답/오답 처리
  function handleAnswer(selectedIndex) {
    const q = currentQuestionData();
    const buttons = els.options.querySelectorAll('.option-btn');
    const isCorrect = selectedIndex === q.answer;

    // 모든 버튼 비활성화
    buttons.forEach(btn => btn.disabled = true);

    if (isCorrect) {
      categoryScores[currentCategory()]++;
      buttons[selectedIndex].classList.add('correct');
      els.feedback.textContent = '✅ 정답입니다!';
      els.feedback.className = 'feedback correct';
    } else {
      buttons[selectedIndex].classList.add('wrong');
      buttons[q.answer].classList.add('correct');
      els.feedback.textContent = '❌ 오답입니다!';
      els.feedback.className = 'feedback wrong';
    }

    els.feedback.classList.remove('hidden');
    totalAnswered++;
    els.score.textContent = `현재 점수: ${getTotalScore()}/${totalAnswered}`;

    // 다음 문제 버튼 표시
    els.nextBtn.classList.remove('hidden');
  }

  // 다음 문제
  function nextQuestion() {
    questionIndex++;

    if (questionIndex >= QUESTIONS_PER_CATEGORY) {
      // 카테고리 마지막 문제 완료
      if (categoryIndex >= CATEGORIES.length - 1) {
        // 마지막 카테고리 → 결과 화면
        showResult();
        App.showScreen('result');
      } else {
        // 카테고리 전환 화면
        showTransition();
        App.showScreen('transition');
      }
    } else {
      showQuestion();
    }
  }

  // 카테고리 전환 화면 표시
  function showTransition() {
    const doneCat = currentCategory();
    const doneScore = categoryScores[doneCat];
    const nextCat = CATEGORIES[categoryIndex + 1];

    els.transitionResult.textContent = `📊 ${doneCat} 결과: ${doneScore}/${QUESTIONS_PER_CATEGORY}`;
    els.transitionNext.textContent = `${CATEGORY_ICONS[nextCat]} ${nextCat}`;
  }

  // 다음 카테고리 시작
  function nextCategory() {
    categoryIndex++;
    questionIndex = 0;
    showQuestion();
  }

  // 최종 결과 화면
  function showResult() {
    const total = getTotalScore();
    const maxScore = CATEGORIES.length * QUESTIONS_PER_CATEGORY;
    const percent = Math.round((total / maxScore) * 100);

    els.resultTotal.textContent = `${total} / ${maxScore}`;
    els.resultPercent.textContent = `(${percent}%)`;

    // 등급 계산
    let grade, icon, message;
    if (total >= 36) { grade = 'S'; icon = '🏆'; message = '상식 마스터!'; }
    else if (total >= 30) { grade = 'A'; icon = '🥇'; message = '상식 전문가!'; }
    else if (total >= 24) { grade = 'B'; icon = '🥈'; message = '상식 우등생!'; }
    else if (total >= 16) { grade = 'C'; icon = '🥉'; message = '조금만 더 노력!'; }
    else { grade = 'D'; icon = '📚'; message = '공부가 필요해요!'; }

    els.resultGrade.textContent = `${grade} ${icon}`;
    els.resultGrade.className = `grade grade-${grade.toLowerCase()}`;
    els.resultMessage.textContent = message;

    // 카테고리별 점수 막대 그래프
    els.resultCategories.innerHTML = '';
    CATEGORIES.forEach(cat => {
      const s = categoryScores[cat];
      const pct = (s / QUESTIONS_PER_CATEGORY) * 100;
      const item = document.createElement('div');
      item.className = 'category-score-item';
      item.innerHTML = `
        <div class="category-score-label">
          <span>${CATEGORY_ICONS[cat]} ${cat}</span>
          <span>${s}/${QUESTIONS_PER_CATEGORY}</span>
        </div>
        <div class="category-bar">
          <div class="category-bar-fill" style="width: ${pct}%"></div>
        </div>`;
      els.resultCategories.appendChild(item);
    });
  }

  return { start, getNickname, getCategoryScores, getTotalScore, nextQuestion, nextCategory };
})();
