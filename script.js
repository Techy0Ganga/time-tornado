/**
 * ALTER EGO - Gamified Productivity Assistant
 * A futuristic productivity companion with XP system, focus sessions, and time capsule journaling
 */

class AlterEgo {
  constructor() {
    // Core state management
    this.state = {
      user: {
        name: "User",
        level: 1,
        xp: 0,
        totalSessions: 0,
        totalTime: 0, // in minutes
        streak: 0,
      },
      session: {
        active: false,
        startTime: null,
        duration: 0,
        paused: false,
      },
      capsule: {
        content: "",
        lastSaved: null,
      },
      reminders: [],
    }

    // Load saved data
    this.loadState()

    // Load alter ego configuration
    this.loadAlterEgoConfig()

    // Initialize UI elements
    this.initializeElements()

    // Set up event listeners
    this.setupEventListeners()

    // Initialize the interface
    this.updateUI()
    this.initializeFocusChart()
    this.addPersonaMessage("System online. Ready to boost your productivity! 🚀")

    // Timer interval reference
    this.timerInterval = null
  }

  /**
   * Load alter ego configuration from creation page
   */
  loadAlterEgoConfig() {
    try {
      const config = localStorage.getItem("alterEgoConfig")
      if (config) {
        this.alterEgoConfig = JSON.parse(config)

        // Update persona name and avatar
        if (this.alterEgoConfig.name) {
          // Update persona messages to use custom name
          const personaHeader = document.querySelector(".persona-panel h2")
          if (personaHeader) {
            personaHeader.textContent = `🧠 ${this.alterEgoConfig.name} Console`
          }

          // Update avatar
          const avatarFace = document.querySelector(".avatar-face")
          if (avatarFace && this.alterEgoConfig.avatar) {
            avatarFace.textContent = this.alterEgoConfig.avatar
          }

          // Update initial message
          this.addPersonaMessage(
            `I'm ${this.alterEgoConfig.name}, your ${this.getPersonalityDescription()}. Ready to level up? Type /help to begin.`,
          )
        }
      } else {
        // No configuration found, redirect to creation page
        if (window.location.pathname.includes("index.html") || window.location.pathname === "/") {
          window.location.href = "create-alter-ego.html"
        }
      }
    } catch (error) {
      console.error("Failed to load alter ego configuration:", error)
    }
  }

  /**
   * Get personality description based on type
   */
  getPersonalityDescription() {
    const descriptions = {
      motivator: "encouraging productivity twin",
      challenger: "no-nonsense productivity challenger",
      strategist: "analytical productivity strategist",
      sage: "wise productivity guide",
    }

    return descriptions[this.alterEgoConfig?.personalityType] || "productivity twin"
  }

  /**
   * Get personality-specific messages
   */
  getPersonalityMessage(context, defaultMessage) {
    if (!this.alterEgoConfig?.personalityType) return defaultMessage

    const personalityMessages = {
      motivator: {
        sessionStart: "You've got this! Let's make this session count! 💪",
        sessionComplete: "Outstanding work! You're building incredible momentum! 🌟",
        levelUp: "AMAZING! You've reached a new level! Keep pushing forward! 🚀",
        encouragement: "I believe in you! Every step forward is progress! ✨",
      },
      challenger: {
        sessionStart: "Time to prove what you're made of. No excuses! 🔥",
        sessionComplete: "Not bad, but I know you can push even harder next time! ⚡",
        levelUp: "Finally! Now let's see if you can maintain this momentum! 💥",
        encouragement: "Stop making excuses and start making progress! 🎯",
      },
      strategist: {
        sessionStart: "Initiating focus protocol. Let's optimize your productivity! 🧠",
        sessionComplete: "Session data logged. Analyzing patterns for improvement! 📊",
        levelUp: "Level advancement achieved. Recalibrating performance metrics! ⚙️",
        encouragement: "Consistent execution leads to exponential results! 📈",
      },
      sage: {
        sessionStart: "The journey of mastery begins with a single focused moment! 🌟",
        sessionComplete: "Well done. Remember, small consistent actions create lasting change! 🌱",
        levelUp: "Growth achieved through patience and persistence. Continue your path! ✨",
        encouragement: "True strength comes from consistent daily practice! 🧘",
      },
    }

    return personalityMessages[this.alterEgoConfig.personalityType]?.[context] || defaultMessage
  }

  /**
   * Initialize DOM element references
   */
  initializeElements() {
    // Command system
    this.commandInput = document.getElementById("command-input")
    this.consoleOutput = document.getElementById("console-output")

    // User info displays
    this.userLevel = document.getElementById("user-level")
    this.userXp = document.getElementById("user-xp")
    this.xpBar = document.getElementById("xp-bar")
    this.xpText = document.getElementById("xp-text")

    // Stats displays
    this.totalSessions = document.getElementById("total-sessions")
    this.totalTime = document.getElementById("total-time")
    this.streak = document.getElementById("streak")

    // Persona elements
    this.personaMessages = document.getElementById("persona-messages")
    this.personaStatus = document.getElementById("persona-status")
    this.sessionStatus = document.getElementById("session-status")

    // Timer elements
    this.timerOverlay = document.getElementById("timer-overlay")
    this.timerText = document.getElementById("timer-text")
    this.pauseTimer = document.getElementById("pause-timer")
    this.stopTimer = document.getElementById("stop-timer")

    // Capsule elements
    this.capsuleInput = document.getElementById("capsule-input")
    this.saveCapsule = document.getElementById("save-capsule")
    this.capsuleContent = document.getElementById("capsule-content")
    this.charCount = document.getElementById("char-count")
    this.lastSaved = document.getElementById("last-saved")
  }

  /**
   * Initialize focus chart with CSS animations
   */
  initializeFocusChart() {
    // Simple CSS-based chart - no Chart.js needed
    const chartBars = document.querySelectorAll(".bar")

    // Animate bars with random heights based on user stats
    chartBars.forEach((bar, index) => {
      const baseHeight = Math.max(30, this.state.user.totalTime / Math.max(this.state.user.totalSessions, 1))
      const variation = (Math.random() - 0.5) * 40
      const height = Math.max(20, Math.min(100, baseHeight + variation))

      setTimeout(() => {
        bar.style.height = `${height}px`
      }, index * 200)
    })
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Command input handling
    this.commandInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        this.processCommand(e.target.value.trim())
        e.target.value = ""
      }
    })

    // Timer controls
    this.pauseTimer.addEventListener("click", () => this.togglePause())
    this.stopTimer.addEventListener("click", () => this.stopSession())

    // Capsule functionality
    this.saveCapsule.addEventListener("click", () => this.saveCapsuleNote())
    this.capsuleInput.addEventListener("input", () => this.updateCharCount())

    // Auto-save state periodically
    setInterval(() => this.saveState(), 30000) // Save every 30 seconds
  }

  /**
   * Process user commands in the console
   */
  processCommand(command) {
    if (!command) return

    // Add command to console output
    this.addConsoleOutput(`shadow@productivity:~$ ${command}`)

    // Parse command
    const [cmd, ...args] = command.toLowerCase().split(" ")

    switch (cmd) {
      case "/start":
        this.startFocusSession(args.join(" "))
        break
      case "/stop":
        this.stopSession()
        break
      case "/pause":
        this.togglePause()
        break
      case "/stats":
        this.showStats()
        break
      case "/quote":
        this.showMotivationalQuote()
        break
      case "/remind":
        this.addReminder(args.join(" "))
        break
      case "/levelup":
        this.simulateXPGain()
        break
      case "/reset":
        this.resetData()
        break
      case "/help":
        this.showHelp()
        break
      default:
        this.addConsoleOutput(`Unknown command: ${cmd}. Type /help for available commands.`)
        this.addPersonaMessage(`I don't recognize that command. Try /help to see what I can do! 🤔`)
    }
  }

  /**
   * Start a focus session
   */
  startFocusSession(sessionName = "Focus Session") {
    if (this.state.session.active) {
      this.addConsoleOutput("Session already active. Use /stop to end current session.")
      return
    }

    this.state.session = {
      active: true,
      startTime: Date.now(),
      duration: 0,
      paused: false,
      name: sessionName,
    }

    this.sessionStatus.textContent = "ACTIVE"
    this.sessionStatus.style.background = "var(--neon-green)"

    this.addConsoleOutput(`Focus session "${sessionName}" started. Stay focused! 🎯`)
    this.addPersonaMessage(
      this.getPersonalityMessage(
        "sessionStart",
        `Excellent! Your "${sessionName}" session is now active. I'll be monitoring your progress. 💪`,
      ),
    )

    this.showTimer()
    this.startTimer()
    this.saveState()
  }

  /**
   * Stop the current focus session
   */
  stopSession() {
    if (!this.state.session.active) {
      this.addConsoleOutput("No active session to stop.")
      return
    }

    const sessionDuration = Math.floor((Date.now() - this.state.session.startTime) / 60000) // minutes

    // Award XP based on session length
    const xpGained = Math.max(10, sessionDuration * 2) // Minimum 10 XP, 2 XP per minute
    this.awardXP(xpGained)

    // Update stats
    this.state.user.totalSessions++
    this.state.user.totalTime += sessionDuration
    this.state.user.streak++

    // Reset session state
    this.state.session = {
      active: false,
      startTime: null,
      duration: 0,
      paused: false,
    }

    this.sessionStatus.textContent = "IDLE"
    this.sessionStatus.style.background = "var(--text-muted)"

    this.hideTimer()
    this.clearTimer()

    this.addConsoleOutput(`Session completed! Duration: ${sessionDuration}m | XP gained: +${xpGained}`)
    this.addPersonaMessage(
      this.getPersonalityMessage(
        "sessionComplete",
        `Outstanding work! You focused for ${sessionDuration} minutes and earned ${xpGained} XP. Keep the momentum going! 🔥`,
      ),
    )

    this.updateUI()
    this.saveState()
  }

  /**
   * Toggle pause/resume for active session
   */
  togglePause() {
    if (!this.state.session.active) return

    this.state.session.paused = !this.state.session.paused

    if (this.state.session.paused) {
      this.clearTimer()
      this.pauseTimer.textContent = "RESUME"
      this.addConsoleOutput("Session paused.")
      this.addPersonaMessage("Taking a breather? That's okay, just don't stay away too long! ⏸️")
    } else {
      this.startTimer()
      this.pauseTimer.textContent = "PAUSE"
      this.addConsoleOutput("Session resumed.")
      this.addPersonaMessage("Welcome back! Let's get back to crushing those goals! ▶️")
    }
  }

  /**
   * Show current statistics
   */
  showStats() {
    const { level, xp, totalSessions, totalTime, streak } = this.state.user
    const nextLevelXP = this.getXPForLevel(level + 1)

    this.addConsoleOutput("=== PRODUCTIVITY STATS ===")
    this.addConsoleOutput(`Level: ${level} ⭐`)
    this.addConsoleOutput(`XP: ${xp}/${nextLevelXP}`)
    this.addConsoleOutput(`Total Sessions: ${totalSessions}`)
    this.addConsoleOutput(`Total Focus Time: ${totalTime} minutes`)
    this.addConsoleOutput(`Current Streak: ${streak} sessions`)
    this.addConsoleOutput("========================")

    this.addPersonaMessage(
      `Your stats are looking ${streak > 5 ? "incredible" : "good"}! ${this.getEncouragementMessage()}`,
    )
  }

  /**
   * Display a motivational quote
   */
  showMotivationalQuote() {
    const quotes = [
      "The future depends on what you do today. - Mahatma Gandhi",
      "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
      "The only way to do great work is to love what you do. - Steve Jobs",
      "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
      "The secret of getting ahead is getting started. - Mark Twain",
      "Your limitation—it's only your imagination.",
      "Focus on being productive instead of busy. - Tim Ferriss",
      "The way to get started is to quit talking and begin doing. - Walt Disney",
    ]

    const quote = quotes[Math.floor(Math.random() * quotes.length)]
    this.addConsoleOutput(`💭 ${quote}`)
    this.addPersonaMessage(`Here's some wisdom to fuel your journey: "${quote}" 🌟`)
  }

  /**
   * Add a reminder
   */
  addReminder(reminder) {
    if (!reminder) {
      this.addConsoleOutput("Usage: /remind <message>")
      return
    }

    this.state.reminders.push({
      id: Date.now(),
      message: reminder,
      created: new Date().toLocaleString(),
    })

    this.addConsoleOutput(`Reminder added: "${reminder}"`)
    this.addPersonaMessage(`Got it! I'll remember: "${reminder}" 📝`)
    this.saveState()
  }

  /**
   * Simulate XP gain for testing
   */
  simulateXPGain() {
    const xpGain = Math.floor(Math.random() * 50) + 25 // 25-75 XP
    this.awardXP(xpGain)
    this.addConsoleOutput(`Debug: Awarded ${xpGain} XP`)
    this.addPersonaMessage(`Testing mode activated! You gained ${xpGain} XP. 🧪`)
  }

  /**
   * Reset all user data
   */
  resetData() {
    if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
      localStorage.removeItem("alterEgoState")
      this.state = {
        user: { name: "User", level: 1, xp: 0, totalSessions: 0, totalTime: 0, streak: 0 },
        session: { active: false, startTime: null, duration: 0, paused: false },
        capsule: { content: "", lastSaved: null },
        reminders: [],
      }

      this.updateUI()
      this.addConsoleOutput("All data has been reset.")
      this.addPersonaMessage("Fresh start! Ready to build new habits and reach new heights! 🚀")
    }
  }

  /**
   * Show help commands
   */
  showHelp() {
    const commands = [
      "/start [name] - Begin a focus session",
      "/stop - End current session",
      "/pause - Pause/resume session",
      "/stats - View your progress",
      "/quote - Get motivational quote",
      "/remind <message> - Add reminder",
      "/levelup - Test XP gain",
      "/reset - Reset all data",
      "/help - Show this help",
    ]

    this.addConsoleOutput("=== AVAILABLE COMMANDS ===")
    commands.forEach((cmd) => this.addConsoleOutput(cmd))
    this.addConsoleOutput("========================")

    this.addPersonaMessage("These are all the commands I understand. Ready to level up your productivity? 💪")
  }

  /**
   * Award XP and handle level ups
   */
  awardXP(amount) {
    this.state.user.xp += amount

    // Check for level up
    const requiredXP = this.getXPForLevel(this.state.user.level + 1)
    if (this.state.user.xp >= requiredXP) {
      this.levelUp()
    }

    this.updateUI()
    this.saveState()
  }

  /**
   * Handle level up
   */
  levelUp() {
    this.state.user.level++
    this.addConsoleOutput(`🎉 LEVEL UP! You are now Level ${this.state.user.level}!`)
    this.addPersonaMessage(
      this.getPersonalityMessage(
        "levelUp",
        `INCREDIBLE! You've reached Level ${this.state.user.level}! Your dedication is paying off! 🎉✨`,
      ),
    )

    // Visual celebration effect
    this.celebrateLevelUp()
  }

  /**
   * Calculate XP required for a given level
   */
  getXPForLevel(level) {
    return 100 * level // 100, 200, 300, etc.
  }

  /**
   * Timer management
   */
  startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.state.session.active && !this.state.session.paused) {
        const elapsed = Date.now() - this.state.session.startTime
        const minutes = Math.floor(elapsed / 60000)
        const seconds = Math.floor((elapsed % 60000) / 1000)

        this.timerText.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      }
    }, 1000)
  }

  clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  }

  showTimer() {
    this.timerOverlay.style.display = "flex"
  }

  hideTimer() {
    this.timerOverlay.style.display = "none"
  }

  /**
   * Capsule functionality
   */
  saveCapsuleNote() {
    const content = this.capsuleInput.value.trim()
    if (!content) {
      this.addPersonaMessage("Your time capsule is empty! Write something for your future self. 📝")
      return
    }

    this.state.capsule.content = content
    this.state.capsule.lastSaved = new Date().toLocaleString()

    this.capsuleContent.textContent = content
    this.lastSaved.textContent = `Saved: ${this.state.capsule.lastSaved}`

    this.addPersonaMessage("Time capsule saved! Your future self will thank you. 💌")
    this.saveState()
  }

  updateCharCount() {
    const count = this.capsuleInput.value.length
    this.charCount.textContent = `${count}/500`

    if (count > 450) {
      this.charCount.style.color = "var(--danger-color)"
    } else {
      this.charCount.style.color = "var(--text-muted)"
    }
  }

  /**
   * UI Updates
   */
  updateUI() {
    const { level, xp, totalSessions, totalTime, streak } = this.state.user
    const nextLevelXP = this.getXPForLevel(level + 1)
    const xpProgress = (xp / nextLevelXP) * 100

    // Update header
    this.userLevel.textContent = `Level ${level} ⭐`
    this.userXp.textContent = `XP: ${xp}/${nextLevelXP}`

    // Update XP bar
    this.xpBar.style.width = `${xpProgress}%`
    this.xpText.textContent = `${xp} / ${nextLevelXP} XP`

    // Update stats
    this.totalSessions.textContent = totalSessions
    this.totalTime.textContent = `${totalTime}m`
    this.streak.textContent = streak

    // Update capsule display
    if (this.state.capsule.content) {
      this.capsuleContent.textContent = this.state.capsule.content
      this.lastSaved.textContent = `Saved: ${this.state.capsule.lastSaved}`
    }

    // Update capsule input
    this.capsuleInput.value = this.state.capsule.content
    this.updateCharCount()
  }

  /**
   * Console and messaging
   */
  addConsoleOutput(message) {
    const outputLine = document.createElement("div")
    outputLine.className = "output-line"
    outputLine.innerHTML = `<span class="timestamp">[${new Date().toLocaleTimeString()}]</span> ${message}`

    this.consoleOutput.appendChild(outputLine)
    this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight
  }

  addPersonaMessage(message) {
    const messageDiv = document.createElement("div")
    messageDiv.className = "message shadow-message"
    messageDiv.innerHTML = `<span class="timestamp">[${new Date().toLocaleTimeString()}]</span> ${message}`

    this.personaMessages.appendChild(messageDiv)
    this.personaMessages.scrollTop = this.personaMessages.scrollHeight
  }

  /**
   * Utility functions
   */
  getEncouragementMessage() {
    const messages = [
      "Keep pushing forward! 🚀",
      "You're building incredible habits! 💪",
      "Your consistency is inspiring! ⭐",
      "Every session counts! 🎯",
      "You're unstoppable! 🔥",
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  celebrateLevelUp() {
    // Add visual celebration effect
    document.body.style.animation = "pulse-glow 0.5s ease-in-out 3"
    setTimeout(() => {
      document.body.style.animation = ""
    }, 1500)
  }

  /**
   * State persistence
   */
  saveState() {
    try {
      localStorage.setItem("alterEgoState", JSON.stringify(this.state))
    } catch (error) {
      console.error("Failed to save state:", error)
    }
  }

  loadState() {
    try {
      const saved = localStorage.getItem("alterEgoState")
      if (saved) {
        const parsedState = JSON.parse(saved)
        this.state = { ...this.state, ...parsedState }
      }
    } catch (error) {
      console.error("Failed to load state:", error)
    }
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.alterEgo = new AlterEgo()
})

// Prevent data loss on page unload
window.addEventListener("beforeunload", () => {
  if (window.alterEgo) {
    window.alterEgo.saveState()
  }
})
