import { Chart } from "@/components/ui/chart"
/**
 * SCREEN TIME TRACKER - Digital Wellness Monitor
 * Track screen time, analyze patterns, and send messages to future self
 */

class ScreenTimeTracker {
  constructor() {
    // Core state management
    this.state = {
      screenTime: {
        today: 0, // minutes
        weekly: [],
        apps: {},
        goal: 360, // 6 hours in minutes
        streak: 0,
      },
      activities: [],
      futureMessages: [],
    }

    // App categories with icons
    this.appCategories = {
      social: { name: "Social Media", icon: "📱", color: "#ff6b6b" },
      work: { name: "Work/Productivity", icon: "💼", color: "#4ecdc4" },
      entertainment: { name: "Entertainment", icon: "🎬", color: "#45b7d1" },
      gaming: { name: "Gaming", icon: "🎮", color: "#96ceb4" },
      education: { name: "Education", icon: "📚", color: "#feca57" },
      communication: { name: "Communication", icon: "💬", color: "#ff9ff3" },
      other: { name: "Other", icon: "🔧", color: "#54a0ff" },
    }

    // Load saved data
    this.loadState()

    // Initialize UI elements
    this.initializeElements()

    // Set up event listeners
    this.setupEventListeners()

    // Initialize charts
    this.initializeCharts()

    // Update UI
    this.updateUI()

    // Check for due messages
    this.checkDueMessages()

    // Set current date
    this.updateCurrentDate()
  }

  /**
   * Initialize DOM element references
   */
  initializeElements() {
    // Stats elements
    this.todayScreenTime = document.getElementById("today-screen-time")
    this.weeklyAverage = document.getElementById("weekly-average")
    this.dailyGoal = document.getElementById("daily-goal")
    this.goalStreak = document.getElementById("goal-streak")

    // Form elements
    this.appSelect = document.getElementById("app-select")
    this.hoursInput = document.getElementById("hours-input")
    this.minutesInput = document.getElementById("minutes-input")
    this.activityNote = document.getElementById("activity-note")
    this.logTimeBtn = document.getElementById("log-time-btn")

    // Message elements
    this.futureMessage = document.getElementById("future-message")
    this.messageCharCount = document.getElementById("message-char-count")
    this.deliveryDate = document.getElementById("delivery-date")
    this.sendMessageBtn = document.getElementById("send-message-btn")
    this.deliveryRadios = document.querySelectorAll('input[name="delivery"]')

    // List elements
    this.activityList = document.getElementById("activity-list")
    this.messagesList = document.getElementById("messages-list")
    this.unreadCount = document.getElementById("unread-count")
    this.clearLogBtn = document.getElementById("clear-log-btn")

    // Date element
    this.currentDate = document.getElementById("current-date")

    // Chart elements
    this.weeklyChart = null
    this.appBreakdownChart = null
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Time logging
    this.logTimeBtn.addEventListener("click", () => this.logScreenTime())

    // Message composition
    this.sendMessageBtn.addEventListener("click", () => this.sendFutureMessage())
    this.futureMessage.addEventListener("input", () => this.updateCharCount())

    // Delivery option changes
    this.deliveryRadios.forEach((radio) => {
      radio.addEventListener("change", () => this.updateDeliveryDate())
    })

    // Clear log
    this.clearLogBtn.addEventListener("click", () => this.clearActivityLog())

    // Chart controls
    document.querySelectorAll(".chart-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => this.handleChartControl(e))
    })

    // Auto-save state periodically
    setInterval(() => this.saveState(), 30000) // Save every 30 seconds
  }

  /**
   * Initialize Chart.js charts
   */
  initializeCharts() {
    this.initializeVisualizations()
  }

  /**
   * Initialize CSS-based visualizations
   */
  initializeVisualizations() {
    // Animate data points
    const dataPoints = document.querySelectorAll(".data-point")
    dataPoints.forEach((point, index) => {
      setTimeout(() => {
        point.style.opacity = "1"
        point.style.transform = "scale(1)"
      }, index * 300)
    })

    // Update donut chart based on actual data
    this.updateDonutChart()
  }

  /**
   * Update donut chart with real data
   */
  updateDonutChart() {
    const apps = Object.entries(this.state.screenTime.apps)
    if (apps.length === 0) return

    const total = apps.reduce((sum, [, time]) => sum + time, 0)
    const donutContainer = document.querySelector(".donut-container")

    if (donutContainer && total > 0) {
      let currentAngle = 0
      const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#54a0ff", "#96ceb4"]

      const gradientStops = apps
        .map(([app, time], index) => {
          const percentage = (time / total) * 100
          const startAngle = currentAngle
          currentAngle += (percentage / 100) * 360

          return `${colors[index % colors.length]} ${startAngle}deg ${currentAngle}deg`
        })
        .join(", ")

      donutContainer.style.background = `conic-gradient(${gradientStops})`
    }
  }

  /**
   * Initialize weekly trend chart
   */
  initializeWeeklyChart() {
    const ctx = document.getElementById("weekly-chart").getContext("2d")

    // Generate last 7 days data
    const last7Days = []
    const screenTimeData = []
    const goalData = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      last7Days.push(date.toLocaleDateString("en-US", { weekday: "short" }))

      // Get or generate screen time data
      const dayData = this.state.screenTime.weekly[6 - i] || Math.floor(Math.random() * 480) + 120 // 2-10 hours
      screenTimeData.push(Math.floor((dayData / 60) * 10) / 10) // Convert to hours with 1 decimal
      goalData.push(this.state.screenTime.goal / 60) // Goal line
    }

    this.weeklyChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: last7Days,
        datasets: [
          {
            label: "Screen Time (hours)",
            data: screenTimeData,
            borderColor: "rgb(0, 255, 255)",
            backgroundColor: "rgba(0, 255, 255, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "rgb(57, 255, 20)",
            pointBorderColor: "rgb(0, 255, 255)",
            pointBorderWidth: 2,
            pointRadius: 6,
          },
          {
            label: "Daily Goal",
            data: goalData,
            borderColor: "rgb(255, 102, 102)",
            backgroundColor: "transparent",
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: "rgb(255, 255, 255)",
              font: {
                family: "Fira Code",
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: "rgb(176, 176, 176)",
              font: {
                family: "Fira Code",
              },
              callback: (value) => value + "h",
            },
            grid: {
              color: "rgba(51, 51, 102, 0.3)",
            },
          },
          x: {
            ticks: {
              color: "rgb(176, 176, 176)",
              font: {
                family: "Fira Code",
              },
            },
            grid: {
              color: "rgba(51, 51, 102, 0.3)",
            },
          },
        },
      },
    })
  }

  /**
   * Initialize app breakdown chart
   */
  initializeAppBreakdownChart() {
    const ctx = document.getElementById("app-breakdown-chart").getContext("2d")

    // Get app usage data
    const appData = Object.entries(this.state.screenTime.apps).map(([app, time]) => ({
      app,
      time,
      ...this.appCategories[app],
    }))

    // If no data, create sample data
    if (appData.length === 0) {
      const sampleApps = ["social", "work", "entertainment", "communication"]
      sampleApps.forEach((app) => {
        appData.push({
          app,
          time: Math.floor(Math.random() * 120) + 30,
          ...this.appCategories[app],
        })
      })
    }

    const labels = appData.map((item) => item.name)
    const data = appData.map((item) => Math.floor((item.time / 60) * 10) / 10) // Convert to hours
    const colors = appData.map((item) => item.color)

    this.appBreakdownChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: colors,
            borderColor: "rgba(255, 255, 255, 0.1)",
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "rgb(255, 255, 255)",
              font: {
                family: "Fira Code",
                size: 11,
              },
              padding: 15,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => context.label + ": " + context.parsed + "h",
            },
          },
        },
      },
    })
  }

  /**
   * Log screen time entry
   */
  logScreenTime() {
    const app = this.appSelect.value
    const hours = Number.parseInt(this.hoursInput.value) || 0
    const minutes = Number.parseInt(this.minutesInput.value) || 0
    const note = this.activityNote.value.trim()

    if (!app) {
      alert("Please select an app/platform")
      return
    }

    if (hours === 0 && minutes === 0) {
      alert("Please enter a time duration")
      return
    }

    const totalMinutes = hours * 60 + minutes
    const activity = {
      id: Date.now(),
      app: app,
      duration: totalMinutes,
      note: note,
      timestamp: new Date().toISOString(),
    }

    // Add to activities
    this.state.activities.unshift(activity)

    // Update screen time stats
    this.state.screenTime.today += totalMinutes
    this.state.screenTime.apps[app] = (this.state.screenTime.apps[app] || 0) + totalMinutes

    // Clear form
    this.appSelect.value = ""
    this.hoursInput.value = ""
    this.minutesInput.value = ""
    this.activityNote.value = ""

    // Update UI
    this.updateUI()
    this.updateCharts()
    this.saveState()

    // Show success feedback
    this.showNotification(`Logged ${hours}h ${minutes}m of ${this.appCategories[app].name}`, "success")
  }

  /**
   * Send message to future self
   */
  sendFutureMessage() {
    const message = this.futureMessage.value.trim()
    const deliveryOption = document.querySelector('input[name="delivery"]:checked').value

    if (!message) {
      alert("Please write a message")
      return
    }

    // Calculate delivery date
    const deliveryDate = new Date()
    switch (deliveryOption) {
      case "tomorrow":
        deliveryDate.setDate(deliveryDate.getDate() + 1)
        break
      case "week":
        deliveryDate.setDate(deliveryDate.getDate() + 7)
        break
      case "month":
        deliveryDate.setMonth(deliveryDate.getMonth() + 1)
        break
    }

    const futureMessage = {
      id: Date.now(),
      content: message,
      deliveryDate: deliveryDate.toISOString(),
      sentDate: new Date().toISOString(),
      read: false,
      screenTimeContext: {
        todayTime: this.state.screenTime.today,
        weeklyAverage: this.calculateWeeklyAverage(),
        topApp: this.getTopApp(),
      },
    }

    this.state.futureMessages.push(futureMessage)

    // Clear form
    this.futureMessage.value = ""
    this.updateCharCount()

    // Update UI
    this.updateUI()
    this.saveState()

    // Show success feedback
    const deliveryDateStr = deliveryDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    this.showNotification(`Message scheduled for delivery on ${deliveryDateStr}`, "success")
  }

  /**
   * Check for due messages and display them
   */
  checkDueMessages() {
    const now = new Date()
    const dueMessages = this.state.futureMessages.filter((msg) => {
      const deliveryDate = new Date(msg.deliveryDate)
      return deliveryDate <= now && !msg.read
    })

    if (dueMessages.length > 0) {
      // Mark messages as delivered (but not read)
      dueMessages.forEach((msg) => {
        msg.delivered = true
      })
      this.saveState()
      this.updateUI()
    }
  }

  /**
   * Update UI elements
   */
  updateUI() {
    this.updateStats()
    this.updateActivityList()
    this.updateMessagesList()
    this.updateDeliveryDate()
  }

  /**
   * Update statistics display
   */
  updateStats() {
    // Today's screen time
    const todayHours = Math.floor(this.state.screenTime.today / 60)
    const todayMinutes = this.state.screenTime.today % 60
    this.todayScreenTime.textContent = `${todayHours}h ${todayMinutes}m`

    // Weekly average
    const weeklyAvg = this.calculateWeeklyAverage()
    const avgHours = Math.floor(weeklyAvg / 60)
    const avgMinutes = Math.floor(weeklyAvg % 60)
    this.weeklyAverage.textContent = `${avgHours}h ${avgMinutes}m`

    // Daily goal
    const goalHours = Math.floor(this.state.screenTime.goal / 60)
    const goalMinutes = this.state.screenTime.goal % 60
    this.dailyGoal.textContent = `${goalHours}h ${goalMinutes}m`

    // Goal streak
    this.goalStreak.textContent = `${this.state.screenTime.streak} days`
  }

  /**
   * Update activity list
   */
  updateActivityList() {
    if (this.state.activities.length === 0) {
      this.activityList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">📱</div>
          <p>No screen time logged yet</p>
          <small>Start tracking your digital habits above</small>
        </div>
      `
      return
    }

    this.activityList.innerHTML = this.state.activities
      .slice(0, 10) // Show last 10 activities
      .map((activity) => {
        const app = this.appCategories[activity.app]
        const date = new Date(activity.timestamp)
        const hours = Math.floor(activity.duration / 60)
        const minutes = activity.duration % 60

        return `
        <div class="activity-item">
          <div class="activity-header">
            <div class="activity-app">
              ${app.icon} ${app.name}
            </div>
            <div class="activity-time">
              ${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
          <div class="activity-duration">${hours}h ${minutes}m</div>
          ${activity.note ? `<div class="activity-note">"${activity.note}"</div>` : ""}
        </div>
      `
      })
      .join("")
  }

  /**
   * Update messages list
   */
  updateMessagesList() {
    const now = new Date()
    const deliveredMessages = this.state.futureMessages.filter((msg) => {
      const deliveryDate = new Date(msg.deliveryDate)
      return deliveryDate <= now
    })

    const unreadCount = deliveredMessages.filter((msg) => !msg.read).length
    this.unreadCount.textContent = `${unreadCount} unread`

    if (deliveredMessages.length === 0) {
      this.messagesList.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">💌</div>
          <p>No messages yet</p>
          <small>Send yourself a message above to get started</small>
        </div>
      `
      return
    }

    this.messagesList.innerHTML = deliveredMessages
      .sort((a, b) => new Date(b.deliveryDate) - new Date(a.deliveryDate))
      .map((message) => {
        const deliveryDate = new Date(message.deliveryDate)
        const sentDate = new Date(message.sentDate)

        return `
        <div class="message-item ${!message.read ? "unread" : ""}" onclick="window.screenTimeTracker.markMessageAsRead('${message.id}')">
          <div class="message-header">
            <div class="message-subject">
              💌 Message from ${sentDate.toLocaleDateString()}
            </div>
            <div class="message-date">
              Delivered: ${deliveryDate.toLocaleDateString()}
            </div>
          </div>
          <div class="message-content">${message.content}</div>
          ${
            message.screenTimeContext
              ? `
            <div class="message-context" style="margin-top: 10px; padding: 10px; background: var(--primary-bg); border-radius: 5px; font-size: 0.8rem; color: var(--text-secondary);">
              Context when sent: ${Math.floor(message.screenTimeContext.todayTime / 60)}h ${message.screenTimeContext.todayTime % 60}m screen time that day
            </div>
          `
              : ""
          }
        </div>
      `
      })
      .join("")
  }

  /**
   * Mark message as read
   */
  markMessageAsRead(messageId) {
    const message = this.state.futureMessages.find((msg) => msg.id === Number.parseInt(messageId))
    if (message) {
      message.read = true
      this.saveState()
      this.updateUI()
    }
  }

  /**
   * Update character count for message
   */
  updateCharCount() {
    const count = this.futureMessage.value.length
    this.messageCharCount.textContent = `${count}/1000`

    if (count > 900) {
      this.messageCharCount.style.color = "var(--danger-color)"
    } else {
      this.messageCharCount.style.color = "var(--text-muted)"
    }
  }

  /**
   * Update delivery date display
   */
  updateDeliveryDate() {
    const selectedOption = document.querySelector('input[name="delivery"]:checked').value
    const deliveryDate = new Date()

    switch (selectedOption) {
      case "tomorrow":
        deliveryDate.setDate(deliveryDate.getDate() + 1)
        break
      case "week":
        deliveryDate.setDate(deliveryDate.getDate() + 7)
        break
      case "month":
        deliveryDate.setMonth(deliveryDate.getMonth() + 1)
        break
    }

    this.deliveryDate.textContent = `Delivers: ${deliveryDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    })}`
  }

  /**
   * Update current date display
   */
  updateCurrentDate() {
    const now = new Date()
    this.currentDate.textContent = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  /**
   * Update charts with new data
   */
  updateCharts() {
    // Update CSS visualizations
    this.updateDonutChart()

    // Animate data points for new data
    const dataPoints = document.querySelectorAll(".data-point")
    dataPoints.forEach((point) => {
      point.style.animation = "pulse 1s ease-in-out"
    })
  }

  /**
   * Handle chart control buttons
   */
  handleChartControl(e) {
    const btn = e.target
    const siblings = btn.parentElement.querySelectorAll(".chart-btn")

    // Update active state
    siblings.forEach((sibling) => sibling.classList.remove("active"))
    btn.classList.add("active")

    // Handle different chart controls
    const period = btn.dataset.period
    const view = btn.dataset.view

    if (period) {
      // Handle weekly/monthly chart view
      console.log(`Switching to ${period} view`)
    }

    if (view) {
      // Handle today/week app breakdown view
      console.log(`Switching to ${view} app view`)
    }
  }

  /**
   * Clear activity log
   */
  clearActivityLog() {
    if (confirm("Are you sure you want to clear all activity logs? This cannot be undone.")) {
      this.state.activities = []
      this.updateUI()
      this.saveState()
      this.showNotification("Activity log cleared", "info")
    }
  }

  /**
   * Utility functions
   */
  calculateWeeklyAverage() {
    if (this.state.screenTime.weekly.length === 0) return this.state.screenTime.today
    const total = this.state.screenTime.weekly.reduce((sum, day) => sum + day, 0)
    return Math.floor(total / this.state.screenTime.weekly.length)
  }

  getTopApp() {
    const apps = Object.entries(this.state.screenTime.apps)
    if (apps.length === 0) return "None"
    return apps.reduce((a, b) => (a[1] > b[1] ? a : b))[0]
  }

  /**
   * Show notification
   */
  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div")
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--secondary-bg);
      border: 1px solid var(--neon-cyan);
      border-radius: 8px;
      padding: 15px 20px;
      color: var(--text-primary);
      font-family: 'Fira Code', monospace;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
    `

    notification.textContent = message
    document.body.appendChild(notification)

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease-in"
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 300)
    }, 3000)
  }

  /**
   * State persistence
   */
  saveState() {
    try {
      localStorage.setItem("screenTimeTrackerState", JSON.stringify(this.state))
    } catch (error) {
      console.error("Failed to save screen time tracker state:", error)
    }
  }

  loadState() {
    try {
      const saved = localStorage.getItem("screenTimeTrackerState")
      if (saved) {
        const parsedState = JSON.parse(saved)
        this.state = { ...this.state, ...parsedState }
      }
    } catch (error) {
      console.error("Failed to load screen time tracker state:", error)
    }
  }
}

// Add CSS animations
const style = document.createElement("style")
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`
document.head.appendChild(style)

// Initialize the screen time tracker when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.screenTimeTracker = new ScreenTimeTracker()
})

// Prevent data loss on page unload
window.addEventListener("beforeunload", () => {
  if (window.screenTimeTracker) {
    window.screenTimeTracker.saveState()
  }
})
