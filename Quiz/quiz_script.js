let currentChapter = null;
let currentQuestionIndex = 0;
let score = 0;
let questionAnswered = false;
let questions = {}; // This will be populated from the CSV file

// Function to load questions from the CSV file
function loadQuestionsFromCSV(callback) {
  Papa.parse("questions.csv", {
    download: true,
    header: true,
    complete: function (results) {
      // Organize questions by chapter
      questions = results.data.reduce((acc, row) => {
        const chapter = row.chapter;
        if (!acc[chapter]) acc[chapter] = [];

        // Convert CSV row into question object
        acc[chapter].push({
          question: row.question,
          options: [row.option1, row.option2, row.option3, row.option4],
          correct: parseInt(row.correct) - 1 // Convert to 0-based index
        });

        return acc;
      }, {});

      console.log("Questions Loaded:", questions);
      if (callback) callback(); // Call callback function once questions are loaded
    },
    error: function (error) {
      console.error("Error loading CSV:", error);
    }
  });
}

function startQuiz(chapter) {
  currentChapter = chapter;
  currentQuestionIndex = 0;
  score = 0;
  questionAnswered = false;

  document.getElementById("chapters").classList.add("hidden");
  document.getElementById("quiz-section").classList.remove("hidden");
  loadQuestion();
}

function loadQuestion() {
  questionAnswered = false; // Reset for the new question
  document.getElementById("next-btn").disabled = true; // Disable "Next" button until an option is selected

  const chapterQuestions = questions[currentChapter];
  const currentQuestion = chapterQuestions[currentQuestionIndex];

  document.getElementById("quiz-title").textContent = `Quiz - ${currentChapter.replace("chapter", "Chapter ")}`;
  document.getElementById("question").textContent = currentQuestion.question;

  const optionButtons = document.querySelectorAll(".option");
  optionButtons.forEach((button, index) => {
    button.textContent = currentQuestion.options[index];
    button.classList.remove("correct", "wrong"); // Reset colors
    button.disabled = false; // Enable buttons
  });
}

function selectOption(button, selectedIndex) {
  if (questionAnswered) return; // Prevent multiple answers for the same question
  questionAnswered = true;

  const correctIndex = questions[currentChapter][currentQuestionIndex].correct;

  // Highlight the selected button
  if (selectedIndex === correctIndex) {
    button.classList.add("correct"); // Green for correct
    score++;
  } else {
    button.classList.add("wrong"); // Red for wrong

    // Highlight the correct button for clarity
    const optionButtons = document.querySelectorAll(".option");
    optionButtons[correctIndex].classList.add("correct");
  }

  // Disable all buttons after a selection
  document.querySelectorAll(".option").forEach(btn => (btn.disabled = true));

  // Enable the "Next" button
  document.getElementById("next-btn").disabled = false;
}

function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions[currentChapter].length) {
    loadQuestion();
  } else {
    finishQuiz();
  }
}
function skipQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions[currentChapter].length) {
    loadQuestion();
  } else {
    finishQuiz();
  }
}
function endQuiz() {
  finishQuiz();
}

function finishQuiz() {
  document.getElementById("quiz-section").classList.add("hidden");
  document.getElementById("score-section").classList.remove("hidden");
  document.getElementById("score").textContent = `${score}/${questions[currentChapter].length}`;
}

function retryQuiz() {
  document.getElementById("score-section").classList.add("hidden");
  document.getElementById("chapters").classList.remove("hidden");
}

// Load the questions and initialize the quiz
document.addEventListener("DOMContentLoaded", () => {
  loadQuestionsFromCSV(() => {
    // After loading questions, you can make the quiz chapters available
    console.log("Quiz ready to start!");
  });
});
