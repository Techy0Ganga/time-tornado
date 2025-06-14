/**
 * ALTER EGO CREATION - Character Creation System
 * Handles the creation and customization of user's alter ego persona
 */

class AlterEgoCreation {
  constructor() {
    // Creation state
    this.creationData = {
      name: "",
      personalityType: "",
      avatar: "👤",
      communicationStyle: "casual",
      focusAreas: [],
      step: 1,
    }

    // Personality data with sample messages
    this.personalityTypes = {
      motivator: {
        name: "The Motivator",
        description: "Encouraging, supportive, and always cheering you on",
        sampleMessages: [
          "You've got this! Every step forward is progress! 💪",
          "I believe in you! Let's crush these goals together! 🌟",
          "Amazing work! You're building incredible momentum! 🚀",
        ],
      },
      challenger: {
        name: "The Challenger",
        description: "Direct, intense, and pushes you to exceed limits",
        sampleMessages: [
          "No excuses. Time to prove what you're made of! 🔥",
          "Is that all you've got? I know you can push harder! ⚡",
          "Stop making excuses and start making progress! 💥",
        ],
      },
      strategist: {
        name: "The Strategist",
        description: "Analytical, logical, and focuses on optimization",
        sampleMessages: [
          "Let's analyze your patterns and optimize your workflow. 🧠",
          "Based on your data, I recommend adjusting your approach. 📊",
          "Efficiency is key. Let's streamline this process. ⚙️",
        ],
      },
      sage: {
        name: "The Sage",
        description: "Wise, philosophical, and provides deep insights",
        sampleMessages: [
          "Remember, the journey of a thousand miles begins with a single step. 🌟",
          "True growth comes from consistent small actions, not grand gestures. 🌱",
          "Patience and persistence are the keys to lasting transformation. ✨",
        ],
      },
    }

    this.initializeElements()
    this.setupEventListeners()
    this.updateUI()
  }

  /**
   * Initialize DOM element references
   */
  initializeElements() {
    // Progress elements
    this.progressFill = document.getElementById("progress-fill")
    this.progressText = document.getElementById("progress-text")

    // Step elements
    this.steps = {
      1: document.getElementById("step-1"),
      2: document.getElementById("step-2"),
      3: document.getElementById("step-3"),
    }

    // Input elements
    this.nameInput = document.getElementById("alter-ego-name")
    this.suggestionChips = document.querySelectorAll(".suggestion-chip")
    this.personalityCards = document.querySelectorAll(".personality-card")
    this.avatarOptions = document.querySelectorAll(".avatar-option")
    this.communicationRadios = document.querySelectorAll('input[name="communication"]')
    this.focusTags = document.querySelectorAll(".focus-tag")

    // Preview elements
    this.previewAvatar = document.getElementById("preview-avatar")
    this.previewName = document.getElementById("preview-name")
    this.previewType = document.getElementById("preview-type")
    this.previewMessage = document.getElementById("preview-message")

    // Navigation elements
    this.backBtn = document.getElementById("back-btn")
    this.nextBtn = document.getElementById("next-btn")
    this.createBtn = document.getElementById("create-btn")
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Name input
    this.nameInput.addEventListener("input", (e) => {
      this.creationData.name = e.target.value.trim()
      this.updatePreview()
      this.validateStep()
    })

    // Name suggestions
    this.suggestionChips.forEach((chip) => {
      chip.addEventListener("click", (e) => {
        const name = e.target.dataset.name
        this.nameInput.value = name
        this.creationData.name = name
        this.updatePreview()
        this.validateStep()
        this.animateChipSelection(e.target)
      })
    })

    // Personality selection
    this.personalityCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        this.selectPersonality(e.currentTarget)
      })
    })

    // Avatar selection
    this.avatarOptions.forEach((option) => {
      option.addEventListener("click", (e) => {
        this.selectAvatar(e.currentTarget)
      })
    })

    // Communication style
    this.communicationRadios.forEach((radio) => {
      radio.addEventListener("change", (e) => {
        this.creationData.communicationStyle = e.target.value
        this.updatePreview()
      })
    })

    // Focus areas
    this.focusTags.forEach((tag) => {
      tag.addEventListener("click", (e) => {
        this.toggleFocusArea(e.currentTarget)
      })
    })

    // Navigation
    this.backBtn.addEventListener("click", () => this.previousStep())
    this.nextBtn.addEventListener("click", () => this.nextStep())
    this.createBtn.addEventListener("click", () => this.createAlterEgo())
  }

  /**
   * Select personality type
   */
  selectPersonality(selectedCard) {
    // Remove previous selection
    this.personalityCards.forEach((card) => card.classList.remove("selected"))

    // Add selection to clicked card
    selectedCard.classList.add("selected")

    // Update creation data
    this.creationData.personalityType = selectedCard.dataset.type

    // Update preview
    this.updatePreview()
    this.validateStep()

    // Add selection animation
    this.animateCardSelection(selectedCard)
  }

  /**
   * Select avatar
   */
  selectAvatar(selectedOption) {
    // Remove previous selection
    this.avatarOptions.forEach((option) => option.classList.remove("active"))

    // Add selection to clicked option
    selectedOption.classList.add("active")

    // Update creation data
    this.creationData.avatar = selectedOption.dataset.avatar

    // Update preview
    this.updatePreview()
  }

  /**
   * Toggle focus area selection
   */
  toggleFocusArea(tag) {
    const focusArea = tag.dataset.focus

    if (tag.classList.contains("selected")) {
      // Remove from selection
      tag.classList.remove("selected")
      this.creationData.focusAreas = this.creationData.focusAreas.filter((area) => area !== focusArea)
    } else {
      // Add to selection
      tag.classList.add("selected")
      this.creationData.focusAreas.push(focusArea)
    }

    this.updatePreview()
  }

  /**
   * Navigate to next step
   */
  nextStep() {
    if (this.creationData.step < 3) {
      this.creationData.step++
      this.updateUI()
      this.validateStep()
    }
  }

  /**
   * Navigate to previous step
   */
  previousStep() {
    if (this.creationData.step > 1) {
      this.creationData.step--
      this.updateUI()
      this.validateStep()
    }
  }

  /**
   * Update UI based on current step
   */
  updateUI() {
    // Update progress bar
    const progressPercent = (this.creationData.step / 3) * 100
    this.progressFill.style.width = `${progressPercent}%`
    this.progressText.textContent = `Step ${this.creationData.step} of 3`

    // Show/hide steps
    Object.keys(this.steps).forEach((stepNum) => {
      const step = this.steps[stepNum]
      if (Number.parseInt(stepNum) === this.creationData.step) {
        step.classList.add("active")
      } else {
        step.classList.remove("active")
      }
    })

    // Update navigation buttons
    this.backBtn.disabled = this.creationData.step === 1

    if (this.creationData.step === 3) {
      this.nextBtn.style.display = "none"
      this.createBtn.style.display = "block"
    } else {
      this.nextBtn.style.display = "block"
      this.createBtn.style.display = "none"
    }

    this.validateStep()
  }

  /**
   * Validate current step and enable/disable next button
   */
  validateStep() {
    let isValid = false

    switch (this.creationData.step) {
      case 1:
        isValid = this.creationData.name.length >= 2
        break
      case 2:
        isValid = this.creationData.personalityType !== ""
        break
      case 3:
        isValid = true // Step 3 is always valid (customization is optional)
        break
    }

    this.nextBtn.disabled = !isValid
    this.createBtn.disabled = !isValid
  }

  /**
   * Update preview section
   */
  updatePreview() {
    // Update avatar
    this.previewAvatar.textContent = this.creationData.avatar

    // Update name
    if (this.creationData.name) {
      this.previewName.textContent = this.creationData.name
    } else {
      this.previewName.textContent = "Your Alter Ego"
    }

    // Update personality type
    if (this.creationData.personalityType) {
      const personality = this.personalityTypes[this.creationData.personalityType]
      this.previewType.textContent = personality.name

      // Show sample message
      const sampleMessage = personality.sampleMessages[Math.floor(Math.random() * personality.sampleMessages.length)]
      this.previewMessage.textContent = sampleMessage
    } else {
      this.previewType.textContent = "Select a personality type"
      this.previewMessage.textContent = "Ready to create your productivity twin?"
    }
  }

  /**
   * Create the alter ego and redirect to main app
   */
  createAlterEgo() {
    // Validate all required fields
    if (!this.creationData.name || !this.creationData.personalityType) {
      alert("Please complete all required fields.")
      return
    }

    // Save alter ego data to localStorage
    const alterEgoConfig = {
      name: this.creationData.name,
      personalityType: this.creationData.personalityType,
      avatar: this.creationData.avatar,
      communicationStyle: this.creationData.communicationStyle,
      focusAreas: this.creationData.focusAreas,
      created: new Date().toISOString(),
      isConfigured: true,
    }

    try {
      localStorage.setItem("alterEgoConfig", JSON.stringify(alterEgoConfig))

      // Show success animation
      this.showSuccessAnimation()

      // Redirect to main app after animation
      setTimeout(() => {
        window.location.href = "index.html"
      }, 2000)
    } catch (error) {
      console.error("Failed to save alter ego configuration:", error)
      alert("Failed to save your alter ego. Please try again.")
    }
  }

  /**
   * Show success animation
   */
  showSuccessAnimation() {
    // Create success overlay
    const successOverlay = document.createElement("div")
    successOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 10000;
      animation: fadeIn 0.5s ease-in-out;
    `

    const successContent = document.createElement("div")
    successContent.style.cssText = `
      text-align: center;
      color: var(--text-primary);
      font-family: 'Orbitron', monospace;
    `

    successContent.innerHTML = `
      <div style="font-size: 4rem; margin-bottom: 20px; animation: pulse 1s ease-in-out infinite;">🎉</div>
      <h2 style="font-size: 2rem; color: var(--neon-green); margin-bottom: 10px; text-shadow: 0 0 10px var(--neon-green);">
        ${this.creationData.name} Created!
      </h2>
      <p style="font-size: 1.2rem; color: var(--text-secondary);">
        Your productivity twin is ready to help you achieve greatness!
      </p>
    `

    successOverlay.appendChild(successContent)
    document.body.appendChild(successOverlay)

    // Remove overlay after animation
    setTimeout(() => {
      document.body.removeChild(successOverlay)
    }, 1800)
  }

  /**
   * Animation helpers
   */
  animateChipSelection(chip) {
    chip.style.transform = "scale(1.1)"
    chip.style.background = "var(--neon-cyan)"
    chip.style.color = "var(--primary-bg)"

    setTimeout(() => {
      chip.style.transform = ""
      chip.style.background = ""
      chip.style.color = ""
    }, 300)
  }

  animateCardSelection(card) {
    card.style.transform = "scale(1.02)"
    setTimeout(() => {
      card.style.transform = ""
    }, 300)
  }
}

// Initialize the creation system when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.alterEgoCreation = new AlterEgoCreation()
})
