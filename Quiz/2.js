// Firebase configuration - REPLACE WITH YOUR ACTUAL CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyDrAPn3jpFCerhRoQw07ycJwPHzYy31mo8",
    authDomain: "srfinal-43e07.firebaseapp.com",
    projectId: "srfinal-43e07",
    storageBucket: "srfinal-43e07.firebasestorage.app",
    messagingSenderId: "1026803486835",
    appId: "1:1026803486835:web:4f4c2a1582b09c64e35a06",
    measurementId: "G-YCH1PNX6CK"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const auth = firebase.auth();
  
  // Quiz Questions
  const quizData = {
    "solar-system": [
      {
        question: "What is the largest planet in our solar system?",
        options: ["Earth", "Saturn", "Jupiter", "Neptune"],
        answer: "Jupiter"
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        answer: "Mars"
      },
      {
        question: "What is the hottest planet in our solar system?",
        options: ["Mercury", "Venus", "Mars", "Jupiter"],
        answer: "Venus"
      },
      {
        question: "Which planet has the most moons?",
        options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
        answer: "Saturn"
      },
      {
        question: "What is the smallest planet in our solar system?",
        options: ["Mars", "Mercury", "Venus", "Earth"],
        answer: "Mercury"
      }
    ],
    "astronauts": [
      {
        question: "Who was the first human to walk on the Moon?",
        options: ["Yuri Gagarin", "Neil Armstrong", "Buzz Aldrin", "Alan Shepard"],
        answer: "Neil Armstrong"
      },
      {
        question: "Who was the first woman in space?",
        options: ["Sally Ride", "Valentina Tereshkova", "Mae Jemison", "Christina Koch"],
        answer: "Valentina Tereshkova"
      },
      {
        question: "Which astronaut has spent the most cumulative time in space?",
        options: ["Scott Kelly", "Peggy Whitson", "Christina Koch", "Gennady Padalka"],
        answer: "Gennady Padalka"
      },
      {
        question: "Who was the first American woman in space?",
        options: ["Sally Ride", "Judith Resnik", "Kathryn Sullivan", "Anna Fisher"],
        answer: "Sally Ride"
      },
      {
        question: "Which astronaut famously said 'That's one small step for man, one giant leap for mankind'?",
        options: ["Buzz Aldrin", "Neil Armstrong", "Michael Collins", "John Glenn"],
        answer: "Neil Armstrong"
      }
    ],
    "galaxies": [
      {
        question: "What galaxy do we live in?",
        options: ["Andromeda", "Whirlpool", "Milky Way", "Sombrero"],
        answer: "Milky Way"
      },
      {
        question: "Which is the closest major galaxy to the Milky Way?",
        options: ["Triangulum", "Andromeda", "Pinwheel", "Black Eye"],
        answer: "Andromeda"
      },
      {
        question: "What type of galaxy is the Milky Way?",
        options: ["Elliptical", "Spiral", "Irregular", "Lenticular"],
        answer: "Spiral"
      },
      {
        question: "What is at the center of most galaxies, including our own?",
        options: ["A massive black hole", "A neutron star", "A quasar", "A white dwarf"],
        answer: "A massive black hole"
      },
      {
        question: "Which galaxy is known for its prominent dust lane?",
        options: ["Andromeda", "Whirlpool", "Sombrero", "Pinwheel"],
        answer: "Sombrero"
      }
    ]
  };
  
  // DOM Elements
  const domainButtons = document.querySelectorAll('.domain-btn');
  const quizSelection = document.querySelector('.quiz-selection');
  const quizContainer = document.querySelector('.quiz-container');
  const quizDomainTitle = document.getElementById('quiz-domain-title');
  const questionText = document.getElementById('question-text');
  const optionsContainer = document.querySelector('.options-container');
  const nextButton = document.querySelector('.next-btn');
  const progressBar = document.querySelector('.progress-bar');
  const progressText = document.querySelector('.progress-text');
  const celebration = document.querySelector('.celebration');
  const starsContainer = document.querySelector('.stars');
  
  // Sound Elements
  const correctSound = document.getElementById('correct-sound');
  const wrongSound = document.getElementById('wrong-sound');
  const buttonSound = document.getElementById('button-sound');
  const celebrationSound = document.getElementById('celebration-sound');
  const backgroundMusic = document.getElementById('background-music');
  
  // Quiz State
  let currentDomain = '';
  let currentQuestionIndex = 0;
  let score = 0;
  let quizActive = false;
  let skippedQuestions = 0;
  let soundEnabled = true;
  let quizHistory = JSON.parse(localStorage.getItem('spaceQuizHistory')) || [];
  let quizTimer;
  let timeElapsed = 0;
  let currentUser = null;
  
  // Authentication Providers
  const authProviders = {
    google: new firebase.auth.GoogleAuthProvider()
  };
  
  // Initialize the app
  document.addEventListener('DOMContentLoaded', () => {
    initSoundControls();
    initAuth();
    loadHistory();
    
    // Add event listeners
    document.querySelector('.view-scorecard').addEventListener('click', showScorecard);
    document.querySelector('.close-scorecard').addEventListener('click', () => {
      document.querySelector('.scorecard-modal').classList.add('hidden');
      playSound(buttonSound);
    });
    
    document.querySelector('.view-leaderboard').addEventListener('click', showLeaderboard);
    document.querySelector('.close-leaderboard').addEventListener('click', () => {
      document.querySelector('.leaderboard-modal').classList.add('hidden');
      playSound(buttonSound);
    });
  });
  
  // Event Listeners
  domainButtons.forEach(button => {
    button.addEventListener('click', () => {
      playSound(buttonSound);
      currentDomain = button.dataset.domain;
      startQuiz();
    });
  });
  
  nextButton.addEventListener('click', () => {
    playSound(buttonSound);
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData[currentDomain].length) {
      showQuestion();
    } else {
      endQuiz();
    }
  });
  
  // Sound Control Functions
  function initSoundControls() {
    const savedSoundPref = localStorage.getItem('soundEnabled');
    if (savedSoundPref !== null) {
      soundEnabled = savedSoundPref === 'true';
    }
    
    const soundControls = document.createElement('div');
    soundControls.className = 'sound-controls';
    soundControls.innerHTML = `
      <button class="sound-btn" id="toggle-sound">
        <i class="fas ${soundEnabled ? 'fa-volume-up' : 'fa-volume-mute'}"></i>
      </button>
    `;
    document.body.appendChild(soundControls);
    
    document.getElementById('toggle-sound').addEventListener('click', toggleSound);
  }
  
  function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundBtn = document.getElementById('toggle-sound');
    
    if (soundEnabled) {
      soundBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
      if (quizActive) {
        backgroundMusic.play().catch(e => console.log("Auto-play prevented"));
      }
    } else {
      soundBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
      backgroundMusic.pause();
    }
    
    localStorage.setItem('soundEnabled', soundEnabled);
  }
  
  function playSound(sound) {
    if (!soundEnabled) return;
    
    sound.currentTime = 0;
    sound.play().catch(e => console.log("Sound play prevented:", e));
  }
  
  // Authentication Functions
  function initAuth() {
    const signInBtn = document.getElementById('sign-in-btn');
    const signOutBtn = document.getElementById('sign-out-btn');
    const authProvidersDiv = document.getElementById('auth-providers');
    
    signInBtn.addEventListener('click', () => {
      authProvidersDiv.classList.toggle('hidden');
    });
    
    signOutBtn.addEventListener('click', () => {
      auth.signOut().then(() => {
        updateAuthUI(null);
      });
    });
    
    // Add provider buttons
    for (const [providerName, provider] of Object.entries(authProviders)) {
      const btn = document.querySelector(`.auth-provider-btn[data-provider="${providerName}"]`);
      if (btn) {
        btn.addEventListener('click', () => signInWithProvider(provider));
      }
    }
    
    // Listen for auth state changes
    auth.onAuthStateChanged(user => {
      updateAuthUI(user);
      currentUser = user;
    });
  }
  
  function signInWithProvider(provider) {
    auth.signInWithPopup(provider)
      .then(result => {
        console.log("Signed in as:", result.user.displayName);
        document.getElementById('auth-providers').classList.add('hidden');
      })
      .catch(error => {
        console.error("Authentication error:", error);
        alert(`Authentication failed: ${error.message}`);
      });
  }
  
  function updateAuthUI(user) {
    const userNameSpan = document.getElementById('user-name');
    const signInBtn = document.getElementById('sign-in-btn');
    const signOutBtn = document.getElementById('sign-out-btn');
    
    if (user) {
      userNameSpan.textContent = user.displayName || "Authenticated User";
      signInBtn.classList.add('hidden');
      signOutBtn.classList.remove('hidden');
    } else {
      userNameSpan.textContent = "Guest";
      signInBtn.classList.remove('hidden');
      signOutBtn.classList.add('hidden');
    }
  }
  
  // Quiz Functions
  function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    skippedQuestions = 0;
    quizActive = true;
    timeElapsed = 0;
    
    startTimer();
    
    const domainNames = {
      "solar-system": "Solar System",
      "astronauts": "Astronauts",
      "galaxies": "Galaxies"
    };
    quizDomainTitle.textContent = `${domainNames[currentDomain]} Quiz`;
    
    quizSelection.classList.add('hidden');
    quizContainer.classList.remove('hidden');
    
    if (soundEnabled) {
      backgroundMusic.play().catch(e => console.log("Auto-play prevented"));
    }
    
    showQuestion();
  }
  
  function showQuestion() {
    resetState();
    const currentQuestion = quizData[currentDomain][currentQuestionIndex];
    
    const controls = document.querySelector('.controls');
    while (controls.firstChild) {
      controls.removeChild(controls.firstChild);
    }
    
    addSkipButton();
    if (currentQuestionIndex > 0) {
      addEndQuizButton();
    }
    nextButton.classList.add('hidden');
    controls.appendChild(nextButton);
    
    const progressPercent = ((currentQuestionIndex + 1) / quizData[currentDomain].length) * 100;
    progressBar.style.width = `${progressPercent}%`;
    progressText.textContent = `Question ${currentQuestionIndex + 1} of ${quizData[currentDomain].length}`;
    
    questionText.textContent = currentQuestion.question;
    
    currentQuestion.options.forEach(option => {
      const button = document.createElement('button');
      button.textContent = option;
      button.classList.add('option-btn');
      button.addEventListener('click', () => selectAnswer(option));
      optionsContainer.appendChild(button);
    });
  }
  
  function resetState() {
    nextButton.classList.add('hidden');
    while (optionsContainer.firstChild) {
      optionsContainer.removeChild(optionsContainer.firstChild);
    }
  }
  
  function selectAnswer(selectedOption) {
    const currentQuestion = quizData[currentDomain][currentQuestionIndex];
    const options = document.querySelectorAll('.option-btn');
    
    options.forEach(option => {
      option.disabled = true;
    });
    
    if (selectedOption === currentQuestion.answer) {
      options.forEach(option => {
        if (option.textContent === currentQuestion.answer) {
          option.classList.add('correct');
        }
      });
      
      score++;
      playSound(correctSound);
      playSound(celebrationSound);
      showCelebration();
    } else {
      options.forEach(option => {
        if (option.textContent === currentQuestion.answer) {
          option.classList.add('correct');
        } else if (option.textContent === selectedOption) {
          option.classList.add('incorrect');
        }
      });
      playSound(wrongSound);
    }
    
    nextButton.classList.remove('hidden');
  }
  
  function showCelebration() {
    celebration.classList.remove('hidden');
    
    for (let i = 0; i < 100; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      
      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 100;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      particle.style.left = `calc(50% + ${x}px)`;
      particle.style.top = `calc(50% + ${y}px)`;
      
      const size = Math.random() * 10 + 5;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.animationDelay = `${Math.random() * 0.5}s`;
      
      const hue = 20 + Math.random() * 40;
      particle.style.background = `hsl(${hue}, 100%, 50%)`;
      
      starsContainer.appendChild(particle);
    }
    
    const feedback = document.querySelector('.correct-feedback');
    feedback.classList.add('neon-text');
    
    setTimeout(() => {
      celebration.classList.add('hidden');
      feedback.classList.remove('neon-text');
      
      while (starsContainer.firstChild) {
        starsContainer.removeChild(starsContainer.firstChild);
      }
    }, 2500);
  }
  
  function endQuiz() {
    quizActive = false;
    backgroundMusic.pause();
    clearInterval(quizTimer);
    quizContainer.classList.add('hidden');
    quizSelection.classList.remove('hidden');
    
    const totalQuestions = quizData[currentDomain].length;
    const answeredQuestions = (currentQuestionIndex + 1) - skippedQuestions;
    const percentage = Math.round((score / answeredQuestions) * 100) || 0;
    
    saveQuizResult(currentDomain, score, totalQuestions, skippedQuestions, timeElapsed);
    submitToLeaderboard(currentDomain, score, totalQuestions, skippedQuestions, timeElapsed, percentage);
    
    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'score-display';
    scoreDisplay.innerHTML = `
      <div class="score-container">
        <h3>Quiz Complete!</h3>
        <p>Your score: ${score}/${answeredQuestions}</p>
        <p>Percentage: ${percentage}%</p>
        <p>Time taken: ${formatTime(timeElapsed)}</p>
        <p>Skipped: ${skippedQuestions}</p>
        <div class="score-buttons">
          <button class="restart-btn">Take Another Quiz</button>
          <button class="view-scorecard-btn">View Scorecard</button>
          <button class="view-leaderboard-btn">View Leaderboard</button>
        </div>
      </div>
    `;
    document.body.appendChild(scoreDisplay);
    
    scoreDisplay.querySelector('.restart-btn').addEventListener('click', () => {
      playSound(buttonSound);
      scoreDisplay.remove();
    });
    
    scoreDisplay.querySelector('.view-scorecard-btn').addEventListener('click', () => {
      playSound(buttonSound);
      scoreDisplay.remove();
      showScorecard();
    });
    
    scoreDisplay.querySelector('.view-leaderboard-btn').addEventListener('click', () => {
      playSound(buttonSound);
      scoreDisplay.remove();
      showLeaderboard();
    });
  }
  
  // Timer Functions
  function startTimer() {
    quizTimer = setInterval(() => {
      timeElapsed++;
      updateTimerDisplay();
    }, 1000);
  }
  
  function updateTimerDisplay() {
    const timerElement = document.getElementById('quiz-timer') || createTimerElement();
    timerElement.textContent = `Time: ${formatTime(timeElapsed)}`;
  }
  
  function createTimerElement() {
    const timerElement = document.createElement('div');
    timerElement.id = 'quiz-timer';
    timerElement.style.position = 'absolute';
    timerElement.style.top = '10px';
    timerElement.style.right = '10px';
    timerElement.style.color = '#ff8906';
    timerElement.style.fontFamily = "'Orbitron', sans-serif";
    document.querySelector('.quiz-container').appendChild(timerElement);
    return timerElement;
  }
  
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  
  // Scorecard Functions
  function saveQuizResult(domain, score, totalQuestions, skipped, timeTaken) {
    const quizResult = {
      date: new Date().toISOString(),
      domain: domain,
      score: score,
      totalQuestions: totalQuestions,
      skipped: skipped,
      percentage: Math.round((score / (totalQuestions - skipped)) * 100) || 0,
      timeTaken: timeTaken
    };
    
    quizHistory.unshift(quizResult);
    if (quizHistory.length > 10) quizHistory = quizHistory.slice(0, 10);
    
    localStorage.setItem('spaceQuizHistory', JSON.stringify(quizHistory));
  }
  
  function loadHistory() {
    const historyTable = document.querySelector('#history-table tbody');
    historyTable.innerHTML = '';
    
    quizHistory.forEach(result => {
      const row = document.createElement('tr');
      
      const formattedDate = new Date(result.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      const domainNames = {
        "solar-system": "Solar System",
        "astronauts": "Astronauts",
        "galaxies": "Galaxies"
      };
      
      row.innerHTML = `
        <td>${formattedDate}</td>
        <td>${domainNames[result.domain] || result.domain}</td>
        <td>${result.score}/${result.totalQuestions - result.skipped}</td>
        <td>${formatTime(result.timeTaken)}</td>
      `;
      
      historyTable.appendChild(row);
    });
    
    updateStats();
  }
  
  function updateStats() {
    if (quizHistory.length === 0) return;
    
    const totalQuizzes = quizHistory.length;
    const totalPercentage = quizHistory.reduce((sum, quiz) => sum + quiz.percentage, 0);
    const averageScore = Math.round(totalPercentage / totalQuizzes);
    const bestScore = Math.max(...quizHistory.map(quiz => quiz.percentage));
    
    document.getElementById('total-quizzes').textContent = totalQuizzes;
    document.getElementById('average-score').textContent = `${averageScore}%`;
    document.getElementById('best-score').textContent = `${bestScore}%`;
  }
  
  function showScorecard() {
    playSound(buttonSound);
    loadHistory();
    document.querySelector('.scorecard-modal').classList.remove('hidden');
  }
  
  // Leaderboard Functions
  function showLeaderboard() {
    playSound(buttonSound);
    document.querySelector('.leaderboard-modal').classList.remove('hidden');
    loadLeaderboard('all');
    
    document.querySelectorAll('.tab-btn').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        loadLeaderboard(tab.dataset.domain);
      });
    });
  }
  
  function loadLeaderboard(domain) {
    const leaderboardTable = document.querySelector('#leaderboard-table tbody');
    leaderboardTable.innerHTML = '<tr><td colspan="5">Loading leaderboard...</td></tr>';
    
    let query = db.collection('leaderboard')
                 .orderBy('percentage', 'desc')
                 .orderBy('timeTaken')
                 .limit(50);
    
    if (domain !== 'all') {
      query = query.where('domain', '==', domain);
    }
    
    query.get().then((querySnapshot) => {
      leaderboardTable.innerHTML = '';
      
      if (querySnapshot.empty) {
        leaderboardTable.innerHTML = '<tr><td colspan="5">No records found</td></tr>';
        return;
      }
      
      let rank = 1;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const row = document.createElement('tr');
        
        if (rank === 1) row.classList.add('gold');
        if (rank === 2) row.classList.add('silver');
        if (rank === 3) row.classList.add('bronze');
        
        const formattedDate = new Date(data.timestamp?.toDate() || new Date()).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        });
        
        row.innerHTML = `
          <td>${rank}</td>
          <td class="player-cell">
            ${data.photoURL ? `<img src="${data.photoURL}" class="player-avatar">` : ''}
            ${data.playerName || 'Anonymous'}
          </td>
          <td>${data.score}/${data.totalQuestions - data.skipped} (${data.percentage}%)</td>
          <td>${formatTime(data.timeTaken)}</td>
          <td>${formattedDate}</td>
        `;
        
        leaderboardTable.appendChild(row);
        rank++;
      });
    }).catch((error) => {
      console.error("Error loading leaderboard: ", error);
      leaderboardTable.innerHTML = '<tr><td colspan="5">Error loading leaderboard</td></tr>';
    });
  }
  
  function submitToLeaderboard(domain, score, totalQuestions, skipped, timeTaken, percentage) {
    if (currentUser) {
      const submission = {
        domain: domain,
        score: score,
        totalQuestions: totalQuestions,
        skipped: skipped,
        timeTaken: timeTaken,
        percentage: percentage,
        playerName: currentUser.displayName || "Anonymous",
        userId: currentUser.uid,
        photoURL: currentUser.photoURL || null,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      submitScore(submission);
    } else {
      const playerName = prompt("Enter your name for the leaderboard (or leave blank for Anonymous):");
      if (playerName === null) return;
      
      const submission = {
        domain: domain,
        score: score,
        totalQuestions: totalQuestions,
        skipped: skipped,
        timeTaken: timeTaken,
        percentage: percentage,
        playerName: playerName || "Anonymous",
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      submitScore(submission);
    }
  }
  
  function submitScore(submission) {
    db.collection('leaderboard').add(submission)
      .then(() => {
        console.log("Score submitted to leaderboard");
        if (document.querySelector('.leaderboard-modal:not(.hidden)')) {
          loadLeaderboard('all');
        }
      })
      .catch(error => {
        console.error("Error submitting score:", error);
        alert("Failed to submit score to leaderboard. Please try again.");
      });
  }
  
  // Control Button Functions
  function addSkipButton() {
    const skipBtn = document.createElement('button');
    skipBtn.textContent = 'Skip Question';
    skipBtn.className = 'skip-btn';
    skipBtn.addEventListener('click', () => {
      playSound(buttonSound);
      skipQuestion();
    });
    document.querySelector('.controls').prepend(skipBtn);
  }
  
  function skipQuestion() {
    skippedQuestions++;
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData[currentDomain].length) {
      showQuestion();
    } else {
      endQuiz();
    }
  }
  
  function addEndQuizButton() {
    const endBtn = document.createElement('button');
    endBtn.textContent = 'End Quiz';
    endBtn.className = 'end-btn';
    endBtn.addEventListener('click', () => {
      playSound(buttonSound);
      endQuiz();
    });
    document.querySelector('.controls').appendChild(endBtn);
  }