// exp5.js — Interactive Quiz App (vanilla JS)
document.addEventListener('DOMContentLoaded', () => {
  // quiz data (you can expand/change questions)
  const QUESTIONS = [
    {
      q: 'Which tag is used to include JavaScript in HTML?',
      choices: ['<script>', '<js>', '<javascript>', '<code>'],
      answer: 0
    },
    {
      q: 'Which CSS property controls the background color?',
      choices: ['color', 'bgcolor', 'background-color', 'back-color'],
      answer: 2
    },
    {
      q: 'Which HTTP method is typically used to retrieve data?',
      choices: ['POST', 'GET', 'PUT', 'DELETE'],
      answer: 1
    },
    {
      q: 'In JavaScript, which keyword declares a block-scoped variable?',
      choices: ['var', 'let', 'const', 'both let and const'],
      answer: 3
    },
    {
      q: 'Which HTTP status code means "Not Found"?',
      choices: ['200', '301', '404', '500'],
      answer: 2
    }
  ];

  // DOM refs
  const qText = document.getElementById('questionText');
  const choicesEl = document.getElementById('choices');
  const qCounter = document.getElementById('qCounter');
  const timeLeftEl = document.getElementById('timeLeft');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');
  const feedback = document.getElementById('feedback');
  const resultCard = document.getElementById('resultCard');
  const scoreText = document.getElementById('scoreText');
  const reviewBtn = document.getElementById('reviewBtn');
  const restartBtn = document.getElementById('restartBtn');

  const PER_Q_SECONDS = 18; // seconds per question
  const STORAGE_KEY = 'exp5_quiz_scores';

  let current = 0;
  let timerId = null;
  let timeLeft = PER_Q_SECONDS;
  // user's selected indexes; null means unanswered
  const selected = Array(QUESTIONS.length).fill(null);

  function renderQuestion() {
    const item = QUESTIONS[current];
    qText.textContent = item.q;
    choicesEl.innerHTML = '';
    item.choices.forEach((c, idx) => {
      const li = document.createElement('li');
      li.textContent = c;
      li.dataset.idx = idx;
      li.className = 'choice';
      if (selected[current] === idx) li.classList.add('selected');
      li.addEventListener('click', () => choose(idx));
      choicesEl.appendChild(li);
    });
    qCounter.textContent = `Question ${current + 1} / ${QUESTIONS.length}`;
    feedback.textContent = `You have ${timeLeft} s left for this question.`;
    resetTimer();
  }

  function choose(idx) {
    selected[current] = idx;
    // give instant feedback visually
    updateChoicesVisual();
    feedback.textContent = `Selected: "${QUESTIONS[current].choices[idx]}"`;
  }

  function updateChoicesVisual() {
    const lis = choicesEl.querySelectorAll('li');
    lis.forEach(li => {
      li.classList.remove('selected', 'correct', 'wrong');
      const idx = Number(li.dataset.idx);
      if (selected[current] === idx) li.classList.add('selected');
    });
  }

  function showCorrectnessForCurrent() {
    const lis = choicesEl.querySelectorAll('li');
    lis.forEach(li => {
      const idx = Number(li.dataset.idx);
      if (idx === QUESTIONS[current].answer) {
        li.classList.add('correct');
      }
      if (selected[current] !== null && idx === selected[current] && idx !== QUESTIONS[current].answer) {
        li.classList.add('wrong');
      }
    });
  }

  function nextQuestion() {
    showCorrectnessForCurrent();
    clearTimer();
    setTimeout(() => {
      current = Math.min(QUESTIONS.length - 1, current + 1);
      timeLeft = PER_Q_SECONDS;
      renderQuestion();
    }, 600);
  }

  function prevQuestion() {
    clearTimer();
    current = Math.max(0, current - 1);
    timeLeft = PER_Q_SECONDS;
    renderQuestion();
  }

  function resetTimer() {
    clearTimer();
    timeLeftEl.textContent = timeLeft;
    timerId = setInterval(() => {
      timeLeft -= 1;
      timeLeftEl.textContent = timeLeft;
      feedback.textContent = `You have ${timeLeft} s left for this question.`;
      if (timeLeft <= 0) {
        clearTimer();
        feedback.textContent = 'Time up for this question — moving to next.';
        // auto-mark unanswered as null and move next
        setTimeout(() => {
          current = Math.min(QUESTIONS.length - 1, current + 1);
          timeLeft = PER_Q_SECONDS;
          renderQuestion();
        }, 700);
      }
    }, 1000);
  }

  function clearTimer() {
    if (timerId) { clearInterval(timerId); timerId = null; }
  }

  function submitQuiz() {
    clearTimer();
    // compute score
    let score = 0;
    QUESTIONS.forEach((q, i) => {
      if (selected[i] === q.answer) score += 1;
    });
    const percent = Math.round((score / QUESTIONS.length) * 100);
    scoreText.textContent = `You scored ${score} of ${QUESTIONS.length} (${percent}%)`;
    // save result into localStorage
    try {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      history.push({ score, total: QUESTIONS.length, percent, ts: Date.now(), answers: selected.slice() });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) { console.warn('Could not save score', e); }
    // show result card
    document.querySelector('.card').classList.add('hidden');
    resultCard.classList.remove('hidden');
  }

  function reviewAnswers() {
    // show each question with chosen answer and correct answer
    const review = QUESTIONS.map((q, i) => {
      const chosen = selected[i];
      return `${i+1}. ${q.q}\n   Your answer: ${chosen===null? '—' : q.choices[chosen]}\n   Correct: ${q.choices[q.answer]}\n`;
    }).join('\n');
    alert('Review:\n\n' + review);
  }

  // event bindings
  nextBtn.addEventListener('click', () => {
    // if last question, submit shortcut
    if (current === QUESTIONS.length - 1) {
      submitQuiz();
      return;
    }
    nextQuestion();
  });

  prevBtn.addEventListener('click', () => {
    prevQuestion();
  });

  submitBtn.addEventListener('click', () => {
    if (!confirm('Submit the quiz now?')) return;
    submitQuiz();
  });

  reviewBtn.addEventListener('click', reviewAnswers);

  restartBtn.addEventListener('click', () => {
    // reset state and rerun
    selected.fill(null);
    current = 0;
    timeLeft = PER_Q_SECONDS;
    resultCard.classList.add('hidden');
    document.querySelector('.card').classList.remove('hidden');
    renderQuestion();
  });

  // keyboard nav (Left/Right) and space to select first choice
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextBtn.click();
    if (e.key === 'ArrowLeft') prevBtn.click();
    if (e.key === ' ') {
      // space toggles select first choice to speed test (optional)
      e.preventDefault();
      const firstLi = choicesEl.querySelector('li');
      if (firstLi) firstLi.click();
    }
  });

  // initial render
  renderQuestion();
});
