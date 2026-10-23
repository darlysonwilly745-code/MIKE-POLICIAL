
const questions = [
  {
    subject: "Português",
    level: "Médio",
    text: "Na frase 'Embora estivesse cansado, continuou estudando', a palavra 'Embora' expressa:",
    options: ["Causa", "Concessão", "Finalidade", "Condição", "Consequência"],
    answer: 1,
    explanation: "'Embora' é uma conjunção subordinativa concessiva."
  },
  {
    subject: "RLM",
    level: "Fácil",
    text: "Um candidato acertou 30 de 40 questões. Qual foi seu percentual de acertos?",
    options: ["50%", "65%", "70%", "75%", "80%"],
    answer: 3,
    explanation: "30 dividido por 40 é 0,75, ou seja, 75%."
  },
  {
    subject: "Informática",
    level: "Fácil",
    text: "Qual atalho normalmente copia um item selecionado no Windows?",
    options: ["Ctrl + X", "Ctrl + C", "Ctrl + V", "Ctrl + Z", "Alt + F4"],
    answer: 1,
    explanation: "Ctrl + C copia. Ctrl + V cola e Ctrl + X recorta."
  },
  {
    subject: "Constitucional",
    level: "Médio",
    text: "Segundo o art. 5º, XVI, da Constituição Federal, o direito de reunião pacífica em local aberto ao público:",
    options: [
      "Depende sempre de autorização judicial.",
      "É permitido sem armas, observadas as condições constitucionais de prévio aviso e não frustração de outra reunião.",
      "Só pode ser exercido por partidos políticos.",
      "É proibido em praças públicas.",
      "Depende de autorização do Poder Legislativo."
    ],
    answer: 1,
    explanation: "A Constituição não exige autorização, mas prevê prévio aviso à autoridade competente e que não se frustre outra reunião anteriormente convocada para o mesmo local."
  },
  {
    subject: "Direitos Humanos",
    level: "Fácil",
    text: "A universalidade dos direitos humanos significa que eles:",
    options: [
      "Valem somente para servidores públicos.",
      "Dependem da renda da pessoa.",
      "Pertencem a todas as pessoas.",
      "Aplicam-se apenas em tempos de paz.",
      "Valem somente para adultos."
    ],
    answer: 2,
    explanation: "A universalidade reconhece direitos humanos a todas as pessoas."
  },
  {
    subject: "Legislação",
    level: "Médio",
    text: "Ao estudar uma lei penal especial para um concurso, a prática mais segura é:",
    options: [
      "Estudar apenas resumos antigos.",
      "Ignorar alterações legislativas.",
      "Consultar o texto legal vigente e resolver questões do conteúdo do edital.",
      "Presumir que todas as leis possuem os mesmos prazos.",
      "Estudar sem verificar o edital."
    ],
    answer: 2,
    explanation: "É importante estudar a legislação atualizada e praticar questões alinhadas ao edital."
  }
];

const $ = id => document.getElementById(id);
const KEY = "mike-policial-v1";

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {
      answers: {},
      xp: 0
    };
  } catch {
    return { answers: {}, xp: 0 };
  }
}

let progress = loadProgress();
let filtered = [...questions];
let current = 0;

function saveProgress() {
  localStorage.setItem(KEY, JSON.stringify(progress));
  renderStats();
  renderRanking();
}

function answered() {
  return Object.keys(progress.answers).length;
}

function correctCount() {
  return Object.values(progress.answers).filter(a => a.correct).length;
}

function rank() {
  if (progress.xp >= 100) return "CABO";
  if (progress.xp >= 50) return "ASPIRANTE";
  return "RECRUTA";
}

function renderStats() {
  const total = answered();
  const correct = correctCount();
  $("statAnswered").textContent = total;
  $("statCorrect").textContent = correct;
  $("statRate").textContent =
    (total ? Math.round(correct / total * 100) : 0) + "%";
  $("statXP").textContent = progress.xp + " XP";
  $("rankName").textContent = rank();

  $("subjectPerformance").innerHTML = [
    ...new Set(questions.map(q => q.subject))
  ].map(subject => {
    const list = questions.filter(q =>
      q.subject === subject && progress.answers[q.text]
    );
    const wins = list.filter(q =>
      progress.answers[q.text].correct
    ).length;
    return `<p>${subject}: ${wins}/${list.length} acertos</p>`;
  }).join("");
}

function renderRanking() {
  const users = [
    { name: "Operador Alfa", xp: 120 },
    { name: "Recruta Bravo", xp: 75 },
    { name: "Você", xp: progress.xp }
  ].sort((a, b) => b.xp - a.xp);

  $("rankingRows").innerHTML = users.map((user, i) =>
    `<p>${i + 1}º — ${user.name} — ${user.xp} XP</p>`
  ).join("");
}

function renderList() {
  $("questionList").innerHTML = filtered.map((q, i) =>
    `<button class="question-nav ${i === current ? "selected" : ""}"
      data-index="${i}">Questão ${i + 1}: ${q.subject}</button>`
  ).join("");

  document.querySelectorAll(".question-nav").forEach(button => {
    button.addEventListener("click", () => {
      current = Number(button.dataset.index);
      renderList();
      renderQuestion();
    });
  });
}

function renderQuestion() {
  const q = filtered[current];
  const card = $("questionCard");

  if (!q) {
    card.innerHTML = "<p>Nenhuma questão encontrada.</p>";
    return;
  }

  const saved = progress.answers[q.text];

  card.innerHTML = `
    <p><strong>${q.subject}</strong> · ${q.level}</p>
    <h3>${q.text}</h3>
    <div>
      ${q.options.map((option, i) => `
        <label class="option ${
          saved && i === q.answer ? "correct" :
          saved && i === saved.choice && !saved.correct ? "incorrect" : ""
        }">
          <input type="radio" name="answer" value="${i}"
            ${saved && saved.choice === i ? "checked" : ""}
            ${saved ? "disabled" : ""}>
          ${String.fromCharCode(65 + i)}) ${option}
        </label>
      `).join("")}
    </div>
    ${saved ? `
      <div class="feedback">
        <strong>${saved.correct ? "Resposta correta!" : "Resposta incorreta."}</strong>
        <p>${q.explanation}</p>
      </div>
    ` : ""}
    <button class="btn" id="confirmAnswer" ${saved ? "disabled" : ""}>
      Confirmar resposta
    </button>
  `;

  $("confirmAnswer").addEventListener("click", () => {
    const selected = card.querySelector('input[name="answer"]:checked');

    if (!selected) {
      alert("Selecione uma alternativa.");
      return;
    }

    const choice = Number(selected.value);
    const isCorrect = choice === q.answer;

    progress.answers[q.text] = {
      choice,
      correct: isCorrect
    };

    progress.xp += isCorrect ? 10 : 3;
    saveProgress();
    renderList();
    renderQuestion();
  });
}

$("subjectFilter").addEventListener("change", event => {
  const subject = event.target.value;

  filtered = subject === "Todas"
    ? [...questions]
    : questions.filter(q => q.subject === subject);

  current = 0;
  renderList();
  renderQuestion();
});

$("startQuiz").addEventListener("click", () => {
  const chosen = [...questions]
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  const area = $("quizArea");

  area.innerHTML = `
    <form id="quizForm">
      ${chosen.map((q, index) => `
        <div class="quiz-question">
          <p>${index + 1}. ${q.text}</p>
          ${q.options.map((option, i) => `
            <label>
              <input type="radio" name="q${index}" value="${i}" required>
              ${String.fromCharCode(65 + i)}) ${option}
            </label>
          `).join("")}
        </div>
      `).join("")}
      <button class="btn" type="submit">Finalizar simulado</button>
    </form>
  `;

  $("quizForm").addEventListener("submit", event => {
    event.preventDefault();
    const form = new FormData(event.target);
    let score = 0;

    chosen.forEach((q, index) => {
      const choice = Number(form.get(`q${index}`));
      if (choice === q.answer) score++;

      if (!progress.answers[q.text]) {
        progress.answers[q.text] = {
          choice,
          correct: choice === q.answer
        };
        progress.xp += choice === q.answer ? 10 : 3;
      }
    });

    saveProgress();
    area.innerHTML = `
      <h3>Simulado concluído: ${score}/5</h3>
      <p>Aproveitamento: ${score * 20}%</p>
      <button class="btn" onclick="location.reload()">Voltar ao treino</button>
    `;
  });
});

$("clearProgress").addEventListener("click", () => {
  if (confirm("Deseja apagar seu progresso neste navegador?")) {
    progress = { answers: {}, xp: 0 };
    saveProgress();
    renderList();
    renderQuestion();
  }
});

$("menuToggle").addEventListener("click", () => {
  $("mainNav").classList.toggle("open");
});

renderStats();
renderRanking();
renderList();
renderQuestion();
  
