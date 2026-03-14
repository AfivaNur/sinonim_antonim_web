// ==========================
// Variabel Global
// ==========================
let currentData = [];
let questionIndex = 0;
let score = 0;
let selectedCategory = "";
let selectedRange = "";

// ==========================
// Navigasi Antar Halaman
// ==========================
function goTo(page) {
  window.location.href = page;
}

// ==========================
// Tahap 1: Pilih Kategori
// ==========================
function selectCategory(cat) {
  localStorage.setItem("category", cat);
  const container = document.querySelector(".category-list");
  if (!container) {
    goTo("quiz.html");
    return;
  }

  let buttons = "";
  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i);
    buttons += `<button class="btn" onclick="selectRange('${letter}')">${letter}</button>`;
  }

  container.innerHTML = `
    <h2>Pilih Abjad (${cat.toUpperCase()})</h2>
    <div class="abjad-list" style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">
      ${buttons}
    </div>
    <div style="margin-top:20px; text-align:center;">
      <button class="btn btn-purple" onclick="window.location.reload()">⬅️ Kembali</button>
    </div>
  `;

  const modulSection = document.querySelector(".modul-materi");
  if (modulSection) modulSection.style.display = "none";
}

// ==========================
// Tahap 2: Pilih Huruf
// ==========================
function selectRange(range) {
  localStorage.setItem("range", range);
  goTo("quiz.html");
}

// ==========================
// Tahap 3: Load Soal
// ==========================
async function loadQuestions() {
  // reset jawaban lama
  localStorage.removeItem("answeredQuestions");

  selectedCategory = localStorage.getItem("category") || "sinonim";
  selectedRange = localStorage.getItem("range") || "A";

  const quizCategory = document.getElementById("quizCategory");
  if (quizCategory)
    quizCategory.textContent = `${selectedCategory.toUpperCase()} (${selectedRange})`;

  const response = await fetch(`data/${selectedCategory}.json`);
  const data = await response.json();

  currentData = data.filter((item) => inRange(item.kata, selectedRange));

  if (currentData.length === 0) {
    const questionText = document.getElementById("questionText");
    const optionsContainer = document.getElementById("optionsContainer");

    if (questionText)
      questionText.innerText = `Belum ada soal untuk huruf ${selectedRange}.`;

    if (optionsContainer)
      optionsContainer.innerHTML = `<button class="btn" onclick="goTo('kategori.html')">⬅️ Kembali</button>`;

    const nextBtn = document.getElementById("next-btn");
    if (nextBtn) nextBtn.style.display = "none";
    return;
  }

  // acak soal
  shuffleArray(currentData);

  // simpan urutan soal
  localStorage.setItem("quizData", JSON.stringify(currentData));

  questionIndex = 0;
  score = 0;

  loadQuestion();
}

// ==========================
// Cek huruf awal kata
// ==========================
function inRange(kata, range) {
  if (!kata || kata.length === 0) return false;
  return kata.trim().charAt(0).toUpperCase() === range.toUpperCase();
}

// ==========================
// Tampilkan Soal
// ==========================
function loadQuestion() {
  const q = currentData[questionIndex];

  const questionNumber = document.getElementById("questionNumber");
  const questionText = document.getElementById("questionText");
  const optionsContainer = document.getElementById("optionsContainer");

  if (questionNumber)
    questionNumber.innerText = `${questionIndex + 1}/${currentData.length}`;

  if (questionText)
    questionText.innerText =
      selectedCategory === "sinonim"
        ? `Sinonim dari "${q.kata}" adalah...`
        : `Antonim dari "${q.kata}" adalah...`;

  if (optionsContainer) optionsContainer.innerHTML = "";

  const answers = [q.jawaban, ...getRandomAnswers(q.jawaban)];
  shuffleArray(answers);

  answers.forEach((ans) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.innerText = ans;
    btn.onclick = () => checkAnswer(btn, ans === q.jawaban);
    optionsContainer.appendChild(btn);
  });

  const nextBtn = document.getElementById("next-btn");
  if (nextBtn) nextBtn.style.display = "none";
}

// ==========================
// Cek Jawaban
// ==========================

function checkAnswer(btn, correct) {
  let answeredQuestions = JSON.parse(
    localStorage.getItem("answeredQuestions") || "[]"
  );

  // simpan teks jawaban yang dipilih
  answeredQuestions[questionIndex] = btn.innerText;

  localStorage.setItem("answeredQuestions", JSON.stringify(answeredQuestions));

  if (correct) {
    alert("Jawaban Benar!");
  } else {
    alert("Jawaban Salah!");
  }
}

// ==========================
// Soal Selanjutnya
// ==========================
function nextQuestion() {
  questionIndex++;

  if (questionIndex < currentData.length) {
    loadQuestion();
  } else {
    localStorage.setItem("score", score);
    localStorage.setItem("totalQuestions", currentData.length);
    localStorage.setItem(`done_${selectedCategory}_${selectedRange}`, "true");

    goTo("result.html");
  }
}

// ==========================
// Fungsi Umum
// ==========================
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function getRandomAnswers(correct) {
  const others = currentData
    .map((item) => item.jawaban)
    .filter((a) => a !== correct);

  return others.sort(() => 0.5 - Math.random()).slice(0, 3);
}

// ==========================
// Saat Halaman Dibuka
// ==========================
window.onload = async function () {
  if (window.location.pathname.includes("quiz.html")) {
    await loadQuestions();
  }

  if (window.location.pathname.includes("result.html")) {
    const correctCount = parseInt(localStorage.getItem("score")) || 0;

    const totalQuestions =
      parseInt(localStorage.getItem("totalQuestions")) || 1;

    const cat = localStorage.getItem("category") || "sinonim";

    const huruf = localStorage.getItem("range") || "A";

    const scorePercent = Math.round((correctCount / totalQuestions) * 100);

    const scoreDisplay = document.getElementById("scoreDisplay");

    const message = document.getElementById("message");

    if (scoreDisplay) scoreDisplay.innerText = `${scorePercent}`;

    if (message)
      message.innerText =
        scorePercent >= 80
          ? `Keren banget! 🌟 (${cat.toUpperCase()} - ${huruf})`
          : `Ayo coba lagi 💪 (${cat.toUpperCase()} - ${huruf})`;

    const tbody = document.querySelector("#questionList tbody");

    if (tbody) {
      const answeredQuestions = JSON.parse(
        localStorage.getItem("answeredQuestions") || "[]"
      );

      const quizData = JSON.parse(localStorage.getItem("quizData") || "[]");

      let rows = "";

      // Ganti bagian di dalam quizData.forEach dengan ini:
      quizData.forEach((q, idx) => {
        // Ambil data dari array answeredQuestions
        let answerData = answeredQuestions[idx];

        let userAnswer = "-";

        // Validasi apakah data berbentuk object atau string
        if (typeof answerData === "string") {
          userAnswer = answerData;
        } else if (answerData && typeof answerData === "object") {
          // Jika tidak sengaja tersimpan sebagai object, coba ambil properti teksnya
          userAnswer =
            answerData.text || answerData.jawaban || JSON.stringify(answerData);
        }

        const isCorrect =
          userAnswer.trim().toLowerCase() === q.jawaban.trim().toLowerCase();

        rows += `
    <tr>
      <td>${idx + 1}</td>
      <td>${q.kata}</td>
      <td class="${
        isCorrect ? "result-correct" : "result-wrong"
      }">${userAnswer}</td>
      <td class="result-correct">${q.jawaban}</td>
    </tr>
  `;
      });

      tbody.innerHTML = rows;
    }
  }
};
