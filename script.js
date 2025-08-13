// Lógica do jogo - SHOW DO MILHÃO SAEP ADM 023

const UI = {
  question: document.getElementById('question'),
  options: document.getElementById('options'),
  startBtn: document.getElementById('startBtn'),
  nextBtn: document.getElementById('nextBtn'),
  resetBtn: document.getElementById('resetBtn'),
  score: document.getElementById('score'),
  qnum: document.getElementById('qnum'),
  qtotal: document.getElementById('qtotal'),
  timer: document.getElementById('timer'),
  progressBar: document.getElementById('progressBar'),
  snd: {
    suspense: document.getElementById('sndSuspense'),
    aplausos: document.getElementById('sndAplausos'),
    erro: document.getElementById('sndErro'),
  }
};

let game = {
  deck: [],
  currentIndex: 0,
  score: 0,
  locked: false,
  countdown: null,
  timeLeft: 25, // segundos para responder
};

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function startGame() {
  // Gera um novo baralho embaralhado, garantindo perguntas diferentes a cada rodada
  game.deck = [...QUESTION_BANK];
  shuffle(game.deck);
  game.currentIndex = 0;
  game.score = 0;
  UI.score.textContent = game.score;
  UI.qtotal.textContent = game.deck.length;
  UI.startBtn.disabled = true;
  UI.nextBtn.disabled = true;
  UI.resetBtn.disabled = false;
  nextQuestion();
}

function nextQuestion() {
  stopAllAudio();
  if (game.countdown) clearInterval(game.countdown);
  if (game.currentIndex >= game.deck.length) {
    endGame();
    return;
  }
  game.locked = false;
  game.timeLeft = 25;
  UI.timer.textContent = game.timeLeft + "s";
  UI.progressBar.style.width = ((game.currentIndex / game.deck.length) * 100).toFixed(1) + "%";
  const item = game.deck[game.currentIndex];
  UI.qnum.textContent = game.currentIndex + 1;
  UI.question.textContent = item.q;

  // Render options A-D aleatorizando ordem, preservando índice da resposta correta
  const letters = ["A", "B", "C", "D"];
  const indices = [0,1,2,3];
  shuffle(indices);
  UI.options.innerHTML = "";
  let correctGlobalIndex = indices.indexOf(item.answer);

  indices.forEach((optIdx, i) => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.innerHTML = `<span class="letter">${letters[i]}</span> ${item.options[optIdx]}`;
    btn.dataset.correct = (i === correctGlobalIndex) ? "1" : "0";
    btn.addEventListener('click', () => choose(btn));
    UI.options.appendChild(btn);
  });

  // Suspense toca enquanto o jogador pensa
  try { UI.snd.suspense.currentTime = 0; UI.snd.suspense.play(); } catch(e){}

  // Inicia contagem regressiva
  game.countdown = setInterval(() => {
    game.timeLeft--;
    UI.timer.textContent = game.timeLeft + "s";
    if (game.timeLeft <= 0) {
      clearInterval(game.countdown);
      autoWrong(); // tempo esgotado = erro
    }
  }, 1000);

  UI.nextBtn.disabled = true;
}

function choose(btn) {
  if (game.locked) return;
  game.locked = true;
  stopAllAudio();

  const isCorrect = btn.dataset.correct === "1";
  const all = [...document.querySelectorAll('.option')];
  all.forEach(b => b.disabled = true);

  if (isCorrect) {
    btn.classList.add('correct');
    game.score += 1000;
    UI.score.textContent = game.score;
    try { UI.snd.aplausos.currentTime = 0; UI.snd.aplausos.play(); } catch(e){}
    UI.nextBtn.disabled = false;
    clearInterval(game.countdown);
  } else {
    btn.classList.add('wrong');
    // mostra também a correta
    all.forEach(b => { if (b.dataset.correct === "1") b.classList.add('correct'); });
    try { UI.snd.erro.currentTime = 0; UI.snd.erro.play(); } catch(e){}
    clearInterval(game.countdown);
    // Encerrar rodada ao errar
    setTimeout(() => endGame(), 1200);
  }
}

function autoWrong(){
  // tempo esgotado equivale a erro
  const all = [...document.querySelectorAll('.option')];
  all.forEach(b => b.disabled = true);
  all.forEach(b => { if (b.dataset.correct === "1") b.classList.add('correct'); else b.classList.add('wrong'); });
  try { UI.snd.erro.currentTime = 0; UI.snd.erro.play(); } catch(e){}
  setTimeout(() => endGame(), 1200);
}

function stopAllAudio(){
  [UI.snd.suspense, UI.snd.aplausos, UI.snd.erro].forEach(a => {
    try { a.pause(); } catch(e){}
  });
}

function endGame(){
  stopAllAudio();
  if (game.countdown) clearInterval(game.countdown);
  UI.question.textContent = `Fim da rodada! Pontuação: ${game.score} pontos.`;
  UI.options.innerHTML = "";
  UI.nextBtn.disabled = true;
  UI.startBtn.disabled = false; // permite novo jogo
  UI.progressBar.style.width = "100%";
  // Ao reiniciar, as perguntas serão embaralhadas novamente,
  // garantindo que o próximo jogador receba uma sequência diferente.
}

UI.startBtn.addEventListener('click', startGame);
UI.nextBtn.addEventListener('click', () => {
  game.currentIndex++;
  nextQuestion();
});
UI.resetBtn.addEventListener('click', () => {
  stopAllAudio();
  if (game.countdown) clearInterval(game.countdown);
  UI.question.textContent = "Clique em \"Iniciar\" para começar!";
  UI.options.innerHTML = "";
  UI.timer.textContent = "--";
  UI.qnum.textContent = "0";
  UI.qtotal.textContent = "0";
  UI.progressBar.style.width = "0%";
  UI.score.textContent = "0";
  UI.startBtn.disabled = false;
  UI.nextBtn.disabled = true;
});
