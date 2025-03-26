let words = [];
let currentWord = '';
let guessedLetters = [];
let wrongGuesses = 0;
const maxWrong = 7;

const sounds = {
  correct: new Audio('../audio/correct.mp3'),
  wrong: new Audio('../audio/wrong.mp3'),
  win: new Audio('../audio/win.mp3'),
  fail: new Audio('../audio/fail.mp3'),
};

function playSound(sound) {
  if (!sound) return;
  sound.pause();
  sound.currentTime = 0;
  sound.play().catch((e) => {
    console.warn('Sound failed to play:', e);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  fetch('../js/data.json')
    .then(res => res.json())
    .then(data => {
      words = data;
      startGame();
    });

  document.getElementById('play-again-btn').addEventListener('click', startGame);

  const modalBtn = document.getElementById('modal-play-again');
  if (modalBtn) {
    modalBtn.addEventListener('click', () => {
      document.getElementById('result-modal').classList.add('hidden');
      startGame();
    });
  }
});

function startGame() {
  const random = words[Math.floor(Math.random() * words.length)];
  currentWord = random.word.toLowerCase();
  guessedLetters = [];
  wrongGuesses = 0;

  document.getElementById('hint').innerText = `Hint: ${random.hint}`;
  document.getElementById('result-message').innerText = '';
  document.getElementById('play-again-btn').style.display = 'none';
  document.getElementById('result-modal')?.classList.add('hidden');

  updateWordDisplay();
  updateStatus();
  updateImage(0);
  generateKeyboard();
}

function updateWordDisplay() {
  const display = currentWord
    .split('')
    .map(letter => (guessedLetters.includes(letter) ? letter : '_'))
    .join(' ');
  document.getElementById('word-display').innerText = display;
}

function updateStatus() {
  document.getElementById('guess-status').innerText = `Incorrect guesses: ${wrongGuesses}/${maxWrong}`;
}

function generateKeyboard() {
  const keyboard = document.getElementById('keyboard');
  keyboard.innerHTML = '';
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(letter => {
    const btn = document.createElement('button');
    btn.innerText = letter;
    btn.classList.add('key');
    btn.addEventListener('click', () => handleGuess(letter, btn));
    keyboard.appendChild(btn);
  });
}

function handleGuess(letter, btn) {
  btn.disabled = true;
  btn.classList.add('used');

  if (guessedLetters.includes(letter.toLowerCase())) return;

  guessedLetters.push(letter.toLowerCase());

  if (currentWord.includes(letter.toLowerCase())) {
    playSound(sounds.correct);
    updateWordDisplay();
    if (!document.getElementById('word-display').innerText.includes('_')) {
      showResult(true);
    }
  } else {
    wrongGuesses++;
    playSound(sounds.wrong);
    updateImage(wrongGuesses);
    updateStatus();
    if (wrongGuesses >= maxWrong) {
      showResult(false);
    }
  }
}

function updateImage(stage) {
  const image = document.getElementById('shinchan-img');
  const imagePath = stage < maxWrong
    ? `../images/shinchan${stage}.png`
    : `../images/fail.png`;

  image.classList.remove('visible');
  image.src = imagePath;

  image.onload = () => {
    image.classList.add('visible');
  };
}

function showResult(won) {
  const modal = document.getElementById('result-modal');
  const message = document.getElementById('modal-message');
  const wordReveal = document.getElementById('modal-word');
  const image = document.getElementById('modal-img');

  if (!modal || !message || !wordReveal || !image) return;

  message.textContent = won ? "🎉 You won!" : "💀 You lost!";
  wordReveal.textContent = `Word was '${currentWord}'`;
  image.src = won ? '../images/win.png' : '../images/fail.png';

  playSound(won ? sounds.win : sounds.fail);

  modal.classList.remove('hidden');

  document.querySelectorAll('.key').forEach(btn => btn.disabled = true);
}
