class PomodoroTimer {
    constructor() {
        // Timer state
        this.isRunning = false;
        this.currentMode = 'work';
        this.timeRemaining = 25 * 60; // 25 minutes in seconds
        this.sessionsCompleted = 0;
        this.timerInterval = null;

        // Timer durations (in minutes)
        this.durations = {
            work: 25,
            shortBreak: 5,
            longBreak: 15
        };

        // DOM elements
        this.timeDisplay = document.querySelector('.time-display');
        this.sessionType = document.querySelector('.session-type');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.sessionCount = document.getElementById('sessionCount');
        this.breakCountdown = document.getElementById('breakCountdown');
        this.progressCircle = document.querySelector('.progress-ring-circle');
        this.notificationSound = document.getElementById('notificationSound');
        
        // Settings elements
        this.workDurationInput = document.getElementById('workDuration');
        this.shortBreakDurationInput = document.getElementById('shortBreakDuration');
        this.longBreakDurationInput = document.getElementById('longBreakDuration');
        this.soundEnabledInput = document.getElementById('soundEnabled');

        // Mode buttons
        this.modeButtons = document.querySelectorAll('.mode-btn');
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateDisplay();
        this.updateProgress();
        this.loadSettings();
    }

    bindEvents() {
        // Control buttons
        this.playPauseBtn.addEventListener('click', () => this.toggleTimer());
        this.resetBtn.addEventListener('click', () => this.resetTimer());

        // Mode buttons
        this.modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.switchMode(mode);
            });
        });

        // Settings inputs
        this.workDurationInput.addEventListener('change', () => this.updateSettings());
        this.shortBreakDurationInput.addEventListener('change', () => this.updateSettings());
        this.longBreakDurationInput.addEventListener('change', () => this.updateSettings());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.toggleTimer();
            } else if (e.code === 'KeyR') {
                e.preventDefault();
                this.resetTimer();
            }
        });

        // Page visibility for notifications
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isRunning) {
                this.updateTitle();
            }
        });
    }

    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }

    startTimer() {
        this.isRunning = true;
        this.updatePlayPauseButton();
        
        this.timerInterval = setInterval(() => {
            this.timeRemaining--;
            this.updateDisplay();
            this.updateProgress();
            this.updateTitle();

            if (this.timeRemaining <= 0) {
                this.completeSession();
            }
        }, 1000);
    }

    pauseTimer() {
        this.isRunning = false;
        this.updatePlayPauseButton();
        clearInterval(this.timerInterval);
        document.title = 'Focus Timer - Paused';
    }

    resetTimer() {
        this.pauseTimer();
        this.timeRemaining = this.durations[this.currentMode] * 60;
        this.updateDisplay();
        this.updateProgress();
        document.title = 'Focus Timer';
    }

    completeSession() {
        this.pauseTimer();
        this.playNotification();
        this.showNotification();

        if (this.currentMode === 'work') {
            this.sessionsCompleted++;
            this.updateSessionInfo();
            
            // Decide next break type
            const nextMode = this.sessionsCompleted % 4 === 0 ? 'longBreak' : 'shortBreak';
            this.switchMode(nextMode);
        } else {
            // Break completed, return to work
            this.switchMode('work');
        }
    }

    switchMode(mode) {
        this.currentMode = mode;
        this.timeRemaining = this.durations[mode] * 60;
        
        // Update active button
        this.modeButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        // Update colors and text
        this.updateModeDisplay();
        this.updateDisplay();
        this.updateProgress();
        
        this.pauseTimer();
    }

    updateModeDisplay() {
        const modeTexts = {
            work: 'Focus Time',
            shortBreak: 'Short Break',
            longBreak: 'Long Break'
        };

        const modeColors = {
            work: '#ff6b6b',
            shortBreak: '#4ade80',
            longBreak: '#6b8bff'
        };

        this.sessionType.textContent = modeTexts[this.currentMode];
        this.progressCircle.setAttribute('stroke', modeColors[this.currentMode]);
        
        // Update document title
        document.title = `Focus Timer - ${modeTexts[this.currentMode]}`;
    }

    updateDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateProgress() {
        const totalTime = this.durations[this.currentMode] * 60;
        const elapsed = totalTime - this.timeRemaining;
        const percentage = elapsed / totalTime;
        
        const circumference = 2 * Math.PI * 134; // radius = 134
        const offset = circumference - (percentage * circumference);
        
        this.progressCircle.style.strokeDashoffset = offset;
    }

    updatePlayPauseButton() {
        const playIcon = this.playPauseBtn.querySelector('.play-icon');
        const pauseIcon = this.playPauseBtn.querySelector('.pause-icon');

        if (this.isRunning) {
            playIcon.classList.add('hidden');
            pauseIcon.classList.remove('hidden');
        } else {
            playIcon.classList.remove('hidden');
            pauseIcon.classList.add('hidden');
        }
    }

    updateSessionInfo() {
        this.sessionCount.textContent = this.sessionsCompleted;
        
        const sessionsUntilLongBreak = 4 - (this.sessionsCompleted % 4);
        if (sessionsUntilLongBreak === 4) {
            this.breakCountdown.textContent = 'Long break time!';
        } else {
            this.breakCountdown.textContent = `${sessionsUntilLongBreak} sessions`;
        }
    }

    updateTitle() {
        if (this.isRunning) {
            const minutes = Math.floor(this.timeRemaining / 60);
            const seconds = this.timeRemaining % 60;
            document.title = `${minutes}:${seconds.toString().padStart(2, '0')} - Focus Timer`;
        }
    }

    playNotification() {
        if (this.soundEnabledInput.checked) {
            this.notificationSound.currentTime = 0;
            this.notificationSound.play().catch(e => console.log('Audio play failed:', e));
        }
    }

    showNotification() {
        if (!document.hidden) return;

        const messages = {
            work: 'Work session completed! Time for a break.',
            shortBreak: 'Break over! Ready to focus?',
            longBreak: 'Long break finished! Let\'s get back to work.'
        };

        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Focus Timer', {
                body: messages[this.currentMode],
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNmZjZiNmIiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0wIDE4Yy00LjQxIDAtOC0zLjU5LTgtOHMzLjU5LTggOC04IDggMy41OSA4IDgtMy41OSA4LTggOHoiLz4KPHN2ZyB4PSI4IiB5PSI4IiB3aWR0aD0iOCIgaGVpZ2h0PSI4IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9IndoaXRlIj4KPHBhdGggZD0iTTggNXYxNGwxMS03eiIvPgo8L3N2Zz4KPC9zdmc+Cg=='
            });
        }
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    loadSettings() {
        const saved = localStorage.getItem('pomodoroSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.durations.work = settings.work || 25;
            this.durations.shortBreak = settings.shortBreak || 5;
            this.durations.longBreak = settings.longBreak || 15;
            
            this.workDurationInput.value = this.durations.work;
            this.shortBreakDurationInput.value = this.durations.shortBreak;
            this.longBreakDurationInput.value = this.durations.longBreak;
        }

        // Load session count
        const sessionCount = localStorage.getItem('pomodoroSessions');
        if (sessionCount) {
            this.sessionsCompleted = parseInt(sessionCount, 10);
            this.updateSessionInfo();
        }
    }

    updateSettings() {
        this.durations.work = parseInt(this.workDurationInput.value, 10);
        this.durations.shortBreak = parseInt(this.shortBreakDurationInput.value, 10);
        this.durations.longBreak = parseInt(this.longBreakDurationInput.value, 10);

        // Save to localStorage
        localStorage.setItem('pomodoroSettings', JSON.stringify(this.durations));

        // Reset current timer if not running
        if (!this.isRunning) {
            this.timeRemaining = this.durations[this.currentMode] * 60;
            this.updateDisplay();
            this.updateProgress();
        }
    }

    saveSessionCount() {
        localStorage.setItem('pomodoroSessions', this.sessionsCompleted.toString());
    }
}

class FocusCoach {
    constructor(timer) {
        this.timer = timer;
        this.isOpen = false;
        
        // DOM elements
        this.toggleBtn = document.getElementById('chatbotToggle');
        this.window = document.getElementById('chatbotWindow');
        this.messages = document.getElementById('chatbotMessages');
        this.input = document.getElementById('chatbotInput');
        this.sendBtn = document.getElementById('chatbotSend');
        
        // Response patterns and knowledge base
        this.responses = this.initializeResponses();
        this.contextualTips = this.initializeContextualTips();
        
        this.init();
    }
    
    init() {
        this.bindEvents();
    }
    
    bindEvents() {
        // Toggle chat window
        this.toggleBtn.addEventListener('click', () => this.toggleChat());
        
        // Send message
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.chatbot-container') && this.isOpen) {
                this.toggleChat();
            }
        });
    }
    
    toggleChat() {
        this.isOpen = !this.isOpen;
        this.window.classList.toggle('hidden', !this.isOpen);
        
        const chatIcon = this.toggleBtn.querySelector('.chat-icon');
        const closeIcon = this.toggleBtn.querySelector('.close-icon');
        
        if (this.isOpen) {
            chatIcon.classList.add('hidden');
            closeIcon.classList.remove('hidden');
            this.input.focus();
        } else {
            chatIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
        }
    }
    
    sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;
        
        // Add user message
        this.addMessage(message, 'user');
        this.input.value = '';
        
        // Generate and add bot response
        setTimeout(() => {
            const response = this.generateResponse(message);
            this.addMessage(response, 'bot');
        }, 500);
    }
    
    addMessage(content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Support multiple paragraphs
        const paragraphs = content.split('\n').filter(p => p.trim());
        paragraphs.forEach(paragraph => {
            const p = document.createElement('p');
            p.textContent = paragraph;
            contentDiv.appendChild(p);
        });
        
        messageDiv.appendChild(contentDiv);
        this.messages.appendChild(messageDiv);
        
        // Scroll to bottom
        this.messages.scrollTop = this.messages.scrollHeight;
    }
    
    generateResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Check for exact pattern matches first
        for (const pattern of this.responses) {
            for (const keyword of pattern.keywords) {
                if (lowerMessage.includes(keyword)) {
                    const responses = pattern.responses;
                    return responses[Math.floor(Math.random() * responses.length)];
                }
            }
        }
        
        // Default encouraging response
        const defaultResponses = [
            "That's a great question! ✨ Remember, the Pomodoro Technique is all about focused work sessions followed by short breaks.",
            "I'm here to help you stay productive! 🌟 Try asking me about focus tips, break ideas, or timer settings.",
            "Every small step counts toward your goals! 💪 What specific area of productivity would you like to improve?"
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
    
    // Called by timer when sessions complete or start
    onTimerEvent(event, data = {}) {
        if (!this.isOpen) return;
        
        let message = '';
        
        switch (event) {
            case 'sessionComplete':
                if (data.mode === 'work') {
                    if (data.sessionsCompleted % 4 === 0) {
                        message = `Amazing work! 🎉 You've completed ${data.sessionsCompleted} sessions. Time for your well-deserved 15-minute long break!`;
                    } else {
                        message = `Great job finishing that focus session! 🌟 Take a 5-minute break and come back refreshed.`;
                    }
                } else {
                    message = `Break's over! 💪 Ready to dive into another productive focus session?`;
                }
                break;
                
            case 'halfwayPoint':
                if (data.mode === 'work') {
                    const encouragements = [
                        "You're halfway through! 🔥 Keep that momentum going!",
                        "Great progress! ⚡ You've got this - stay focused!",
                        "Halfway there! 🌟 Your brain is in the flow zone now."
                    ];
                    message = encouragements[Math.floor(Math.random() * encouragements.length)];
                }
                break;
        }
        
        if (message) {
            setTimeout(() => this.addMessage(message, 'bot'), 1000);
        }
    }
    
    initializeResponses() {
        return [
            {
                keywords: ['losing focus', 'distracted', 'can\'t focus', 'help focus'],
                responses: [
                    "Take a deep breath ✨ Let's get through this session together—you've got this!",
                    "Try the 2-minute rule: commit to just 2 more minutes of focus. Often that's all you need to get back in the zone! 🌟",
                    "Remove distractions around you. Put your phone away, close extra tabs, and return to your one important task. 💪"
                ]
            },
            {
                keywords: ['pomodoro technique', 'how does it work', 'what is pomodoro'],
                responses: [
                    "The Pomodoro Technique is simple: 25 minutes of focused work, followed by a 5-minute break. After 4 rounds, you take a longer 15-minute break! 🍅",
                    "It's a time management method that breaks work into focused intervals. The magic is in the rhythm—work, rest, repeat! ⏰"
                ]
            },
            {
                keywords: ['break', 'what to do', 'break ideas', 'break time'],
                responses: [
                    "Step away from your screen 🌱 Stretch, drink water, or take a short walk. Avoid checking social media—it can drag you in!",
                    "Perfect break activities: light stretching, deep breathing, getting some fresh air, or just looking out the window 🌿",
                    "Use your break to move your body! Do some jumping jacks, stretch your neck, or walk around your space. Your brain needs the reset! 💫"
                ]
            },
            {
                keywords: ['settings', 'customize', 'timer', 'duration', 'change time'],
                responses: [
                    "You can customize your timer durations in the settings panel below! 25 minutes is the sweet spot for most people, but feel free to adjust. ⚙️",
                    "If you're just starting, try 15-20 minutes. Once you build the habit, you can extend to the full 25 minutes! 📈",
                    "Your custom settings are automatically saved, so we'll remember your preferred rhythm! 💾"
                ]
            },
            {
                keywords: ['motivated', 'motivation', 'encourage', 'support'],
                responses: [
                    "You're building something amazing, one focused session at a time! 🚀 Every minute of focused work counts.",
                    "Remember why you started. Each Pomodoro session is a step toward your goals! 🎯",
                    "Progress over perfection! You're already ahead of everyone who didn't start. Keep going! 💪"
                ]
            },
            {
                keywords: ['completed', 'finished', 'done', 'sessions'],
                responses: [
                    "Fantastic! 🎉 Each completed session builds your focus muscle. You're developing a superpower!",
                    "Look at you go! 🌟 Consistency is key, and you're proving you can stick with it."
                ]
            },
            {
                keywords: ['tired', 'exhausted', 'can\'t continue'],
                responses: [
                    "It's okay to feel tired! 😌 Consider taking a longer break or switching to lighter tasks. Listen to your body.",
                    "Mental fatigue is real. Maybe it's time for that long break, some water, or even calling it a productive day! 🌙"
                ]
            },
            {
                keywords: ['shortcuts', 'keyboard', 'controls'],
                responses: [
                    "Great question! ⌨️ You can use the Spacebar to play/pause the timer, and 'R' to reset. These shortcuts help you stay in flow!",
                    "Keyboard shortcuts: Space (play/pause) and R (reset). Perfect for staying focused without reaching for the mouse! 🎯"
                ]
            },
            {
                keywords: ['notifications', 'sound', 'alerts'],
                responses: [
                    "I can send you desktop notifications when sessions end! Make sure to allow notifications in your browser settings. 🔔",
                    "You can toggle sound notifications in the settings panel. I'll also update your browser tab title with the countdown! 📢"
                ]
            }
        ];
    }
    
    initializeContextualTips() {
        return {
            workStart: [
                "Let's focus! 🎯 Remove distractions and tackle your most important task first.",
                "You've got 25 minutes of pure focus ahead. What's the one thing you want to accomplish? 💪",
                "New session, fresh start! 🌟 Set a clear intention for these next 25 minutes."
            ],
            breakStart: [
                "Break time! 🌿 Step away from the screen and let your mind reset.",
                "Perfect timing for a break! Get some water, stretch, or take a few deep breaths. 💧",
                "Your brain earned this rest! Use these 5 minutes to recharge fully. ✨"
            ],
            longBreakStart: [
                "Time for your long break! 🎉 You've earned 15 minutes to truly disconnect and recharge.",
                "Excellent work! This longer break is crucial—step outside, have a snack, or just relax. 🌞",
                "Four sessions complete! 🏆 Take this time to celebrate your progress and reset completely."
            ]
        };
    }
}

// Initialize the timer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const timer = new PomodoroTimer();
    const focusCoach = new FocusCoach(timer);
    
    // Connect timer events to chatbot
    const originalCompleteSession = timer.completeSession;
    timer.completeSession = function() {
        originalCompleteSession.call(this);
        focusCoach.onTimerEvent('sessionComplete', {
            mode: this.currentMode,
            sessionsCompleted: this.sessionsCompleted
        });
    };
    
    // Add halfway point notifications
    const originalStartTimer = timer.startTimer;
    timer.startTimer = function() {
        originalStartTimer.call(this);
        
        // Set halfway point notification
        const halfwayTime = Math.floor(this.timeRemaining / 2);
        setTimeout(() => {
            if (this.isRunning && this.timeRemaining <= halfwayTime) {
                focusCoach.onTimerEvent('halfwayPoint', { mode: this.currentMode });
            }
        }, (this.timeRemaining - halfwayTime) * 1000);
    };
    
    // Request notification permission
    timer.requestNotificationPermission();
    
    // Save session count periodically
    setInterval(() => {
        timer.saveSessionCount();
    }, 30000); // Save every 30 seconds
    
    // Save on page unload
    window.addEventListener('beforeunload', () => {
        timer.saveSessionCount();
    });
});
