/* ==========================================
   MEDICARE AI - CORE APPLICATION LOGIC
   ========================================== */

class MediCareApp {
  constructor() {
    this.state = {
      isLoggedIn: false,
      user: {
        name: 'John Doe',
        email: 'john.doe@medicare.ai',
        age: 65,
        phone: '+1 (555) 321-7654',
        role: 'patient' // patient | caregiver
      },
      caregiver: {
        name: 'Sarah Doe',
        email: 'sarah.m.doe@family.com',
        enabled: true,
        escalateThreshold: 2
      },
      medications: [],
      symptomLogs: [],
      appointments: [],
      chatHistory: [],
      notifications: [],
      activeMedListTab: 'active', // active | completed
      ocrResults: null,
      missedDoseTracking: null, // Stores active missed dose for justification form
      theme: 'light' // light | dark
    };

    // Bind event handlers
    this.init();
  }

  safeCreateIcons() {
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      try {
        lucide.createIcons();
      } catch (e) {
        console.warn("Lucide icons failed to render", e);
      }
    }
  }

  // Initialize App
  init() {
    try {
      this.loadState();
      this.applyTheme();
      this.renderAll();
      
      // Register OCR drag & drop handlers
      this.setupOcrDragDrop();
      
      // Refresh Icons
      this.safeCreateIcons();
    } catch (error) {
      console.error("Initialization failed, resetting local state...", error);
      try {
        localStorage.removeItem('medicare_ai_state');
        this.seedInitialData();
        this.applyTheme();
        this.renderAll();
        this.setupOcrDragDrop();
        this.safeCreateIcons();
      } catch (e) {
        console.error("Critical initialization failure", e);
      }
    }
  }

  // Load state from local storage or seed initial dummy data
  loadState() {
    const saved = localStorage.getItem('medicare_ai_state');
    if (saved) {
      try {
        this.state = JSON.parse(saved);
        // Ensure some arrays exist
        if (!this.state.medications) this.state.medications = [];
        if (!this.state.symptomLogs) this.state.symptomLogs = [];
        if (!this.state.appointments) this.state.appointments = [];
        if (!this.state.chatHistory) this.state.chatHistory = [];
        if (!this.state.notifications) this.state.notifications = [];
      } catch (e) {
        console.error("Error loading saved state", e);
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }
  }

  // Save current state to local storage
  saveState() {
    localStorage.setItem('medicare_ai_state', JSON.stringify(this.state));
  }

  // Seed data so the dashboards look fully populated and impressive on first load
  seedInitialData() {
    this.state.isLoggedIn = false;
    this.state.theme = 'light';
    
    // Seed Medications
    this.state.medications = [
      {
        id: 'med-1',
        name: 'Atorvastatin (Lipitor)',
        dosage: '20mg',
        frequency: 'once',
        times: ['morning'],
        duration: 30,
        route: 'oral',
        instructions: 'Take in the morning with food. Avoid Grapefruit.',
        status: 'active',
        createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        history: [
          { date: this.getRelativeDateStr(-2), slot: 'morning', status: 'taken' },
          { date: this.getRelativeDateStr(-1), slot: 'morning', status: 'taken' },
          { date: this.getRelativeDateStr(0), slot: 'morning', status: 'pending' }
        ]
      },
      {
        id: 'med-2',
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'once',
        times: ['morning'],
        duration: 45,
        route: 'oral',
        instructions: 'Take on empty stomach, drink plenty of water.',
        status: 'active',
        createdDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        history: [
          { date: this.getRelativeDateStr(-2), slot: 'morning', status: 'taken' },
          { date: this.getRelativeDateStr(-1), slot: 'morning', status: 'skipped', reason: 'Experiencing side-effects (dry cough)' },
          { date: this.getRelativeDateStr(0), slot: 'morning', status: 'pending' }
        ]
      },
      {
        id: 'med-3',
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'daily',
        times: ['morning', 'night'],
        duration: 60,
        route: 'oral',
        instructions: 'Take during or immediately after meals to reduce stomach upset.',
        status: 'active',
        createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        history: [
          { date: this.getRelativeDateStr(-1), slot: 'morning', status: 'taken' },
          { date: this.getRelativeDateStr(-1), slot: 'night', status: 'taken' },
          { date: this.getRelativeDateStr(0), slot: 'morning', status: 'taken' },
          { date: this.getRelativeDateStr(0), slot: 'night', status: 'pending' }
        ]
      }
    ];

    // Seed Symptoms
    this.state.symptomLogs = [
      {
        id: 'symp-1',
        type: 'bp',
        value: 135,
        valueDiastolic: 85,
        notes: 'Slightly elevated, recorded in the afternoon.',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 4 * 60 * 60 * 1000).toISOString() // 2 days ago
      },
      {
        id: 'symp-2',
        type: 'pain',
        value: 4,
        notes: 'Mild lower back pain after walking.',
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        id: 'symp-3',
        type: 'fever',
        value: 98.6,
        notes: 'Temperature normal.',
        date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hrs ago
      }
    ];

    // Seed Appointments
    this.state.appointments = [
      {
        id: 'app-1',
        doctor: 'Dr. Evelyn Parker',
        specialty: 'Cardiologist',
        date: this.getRelativeDateStr(2), // 2 days from now
        time: '10:30',
        type: 'telehealth',
        notes: 'Routine blood pressure review. Bring recent symptom readings.',
        status: 'upcoming'
      },
      {
        id: 'app-2',
        doctor: 'St. Jude Health Lab',
        specialty: 'Diagnostic Lab',
        date: this.getRelativeDateStr(5), // 5 days from now
        time: '08:00',
        type: 'clinic',
        notes: 'Fasting lipid panel check. Do not eat 12 hours prior.',
        status: 'upcoming'
      }
    ];

    // Seed Notifications
    this.state.notifications = [
      { id: 'notif-1', title: 'Medication Added', body: 'Lisinopril scheduled successfully.', time: '3 days ago' },
      { id: 'notif-2', title: 'Missed Dose Recorded', body: 'Lisinopril scheduled at 8:00 AM yesterday was logged as skipped.', time: '1 day ago' }
    ];

    this.saveState();
  }

  // Helper: Get date string relative to today (YYYY-MM-DD)
  getRelativeDateStr(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // ==================== NAVIGATION & SHELL FUNCTIONS ====================
  
  // Switch visible layout: Landing Mode vs. App Authenticated layout
  updateLayoutMode() {
    const appEl = document.getElementById('app');
    const landingEl = document.getElementById('view-landing');
    const layoutEl = document.getElementById('app-layout');
    
    if (this.state.isLoggedIn) {
      appEl.classList.remove('landing-mode');
      landingEl.classList.remove('active');
      layoutEl.classList.add('active');
      
      // Update names
      document.getElementById('sidebar-name').innerText = this.state.user.name;
      document.getElementById('header-user-name').innerText = this.state.user.name;
      document.getElementById('sidebar-avatar').innerText = this.getUserInitials(this.state.user.name);
      document.getElementById('dashboard-welcome-name').innerText = this.state.user.name.split(' ')[0];
      
      // Set appropriate view
      if (this.state.user.role === 'caregiver') {
        this.setRole('caregiver');
      } else {
        this.setRole('patient');
      }
    } else {
      appEl.classList.add('landing-mode');
      landingEl.classList.add('active');
      layoutEl.classList.remove('active');
    }
  }

  getUserInitials(name) {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  }

  // Switch between sections inside the app panel
  switchView(viewId) {
    // Hide all views
    const views = document.querySelectorAll('.app-view');
    views.forEach(v => v.classList.remove('active'));

    // Show selected view
    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) {
      targetView.classList.add('active');
    }

    // Update sidebar navigation links active class
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      if (item.getAttribute('data-view') === viewId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update Topbar View Title
    const titles = {
      'patient-dashboard': 'Patient Dashboard',
      'medication-manager': 'Medication Scheduler',
      'symptom-journal': 'Symptom & Vitals Journal',
      'appointment-manager': 'Doctor Appointments',
      'ai-chat': 'AI Health Agent Chat',
      'reports': 'Reports & Analytics Logs',
      'caregiver-dashboard': 'Caregiver Portal',
      'settings': 'Account & Alert Settings'
    };
    document.getElementById('view-title').innerText = titles[viewId] || 'MediCare AI';
    
    // Close sidebar on mobile
    document.querySelector('.app-sidebar').classList.remove('active');

    // Scroll main body back to top
    document.querySelector('.view-content').scrollTop = 0;

    // Refresh charts or graphs if reports page is open
    if (viewId === 'reports') {
      this.renderReports();
    }
    
    this.safeCreateIcons();
  }

  // Handle switching user context (Patient Dashboard vs Caregiver Portal)
  setRole(role) {
    this.state.user.role = role;
    this.saveState();

    const patientNav = document.getElementById('patient-nav');
    const caregiverNav = document.getElementById('caregiver-nav');
    const btnPatient = document.getElementById('btn-role-patient');
    const btnCaregiver = document.getElementById('btn-role-caregiver');
    const badgeRole = document.getElementById('sidebar-role-badge');

    if (role === 'caregiver') {
      patientNav.classList.add('hidden');
      caregiverNav.classList.remove('hidden');
      
      btnPatient.classList.remove('active');
      btnCaregiver.classList.add('active');
      
      badgeRole.innerText = 'Caregiver';
      
      this.switchView('caregiver-dashboard');
    } else {
      patientNav.classList.remove('hidden');
      caregiverNav.classList.add('hidden');
      
      btnPatient.classList.add('active');
      btnCaregiver.classList.remove('active');
      
      badgeRole.innerText = 'Patient';
      
      this.switchView('patient-dashboard');
    }
    this.renderAll();
  }

  // Handle Sidebar Drawer Toggle (mobile responsive)
  toggleSidebar() {
    const sidebar = document.querySelector('.app-sidebar');
    sidebar.classList.toggle('active');
  }

  // Handle Scroll to anchors on marketing landing
  scrollToSection(id) {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // ==================== AUTHENTICATION SIMULATOR ====================
  showAuthModal(mode) {
    const modal = document.getElementById('modal-auth');
    modal.classList.add('active');
    this.setAuthMode(mode);
  }

  closeAuthModal() {
    document.getElementById('modal-auth').classList.remove('active');
  }

  setAuthMode(mode) {
    const modalTitle = document.getElementById('auth-modal-title');
    const btnSubmit = document.getElementById('btn-auth-submit');
    const groupName = document.getElementById('auth-group-name');
    const groupRole = document.getElementById('auth-group-role');
    const toggleText = document.getElementById('auth-toggle-text');
    const inputMode = document.getElementById('auth-mode');

    inputMode.value = mode;

    if (mode === 'register') {
      modalTitle.innerText = 'Create your Health Account';
      btnSubmit.innerText = 'Sign Up';
      groupName.classList.remove('hidden');
      groupRole.classList.remove('hidden');
      toggleText.innerHTML = 'Already have an account? <a href="#" onclick="app.setAuthMode(\'login\')">Log In</a>';
    } else {
      modalTitle.innerText = 'Sign In to MediCare AI';
      btnSubmit.innerText = 'Log In';
      groupName.classList.add('hidden');
      groupRole.classList.add('hidden');
      toggleText.innerHTML = 'Don\'t have an account? <a href="#" onclick="app.setAuthMode(\'register\')">Sign Up</a>';
    }
  }

  handleAuthSubmit(event) {
    event.preventDefault();
    const mode = document.getElementById('auth-mode').value;
    const email = document.getElementById('auth-email').value;
    
    if (mode === 'register') {
      const name = document.getElementById('auth-name').value || 'John Doe';
      const role = document.getElementById('auth-role').value || 'patient';
      
      this.state.user = {
        name: name,
        email: email,
        age: 65,
        phone: '+1 (555) 321-7654',
        role: role
      };
    } else {
      // Login - search if we already have a user, else standard
      this.state.user.email = email;
    }

    this.state.isLoggedIn = true;
    this.closeAuthModal();
    this.updateLayoutMode();
    this.addNotification('Welcome back!', `Logged in successfully as ${this.state.user.name}.`);
    this.saveState();
  }

  handleOAuthMock(provider) {
    this.state.user = {
      name: 'Google User',
      email: 'user@gmail.com',
      age: 42,
      phone: '+1 (555) 987-6543',
      role: 'patient'
    };
    this.state.isLoggedIn = true;
    this.closeAuthModal();
    this.updateLayoutMode();
    this.addNotification('Linked OAuth', `Authenticated successfully via ${provider}.`);
    this.saveState();
  }

  handleLogout() {
    this.state.isLoggedIn = false;
    this.saveState();
    this.updateLayoutMode();
  }

  // ==================== THEME MANAGEMENT ====================
  toggleDarkMode() {
    this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
    this.applyTheme();
    this.saveState();
  }

  applyTheme() {
    const body = document.body;
    const btn = document.getElementById('btn-dark-mode');
    
    if (this.state.theme === 'dark') {
      body.classList.add('dark-theme');
      if (btn) btn.innerHTML = `<i data-lucide="sun"></i>`;
    } else {
      body.classList.remove('dark-theme');
      if (btn) btn.innerHTML = `<i data-lucide="moon"></i>`;
    }
    this.safeCreateIcons();
  }

  // ==================== MEDICATION SCHEDULER ====================
  toggleAddMedicationModal(show) {
    const modal = document.getElementById('modal-add-med');
    if (show) {
      modal.classList.add('active');
    } else {
      modal.classList.remove('active');
      document.getElementById('medication-form').reset();
      this.handleMedFrequencyChange();
    }
  }

  handleMedFrequencyChange() {
    const freq = document.getElementById('med-frequency').value;
    const timePickers = document.getElementById('med-time-pickers');
    const customTime = document.getElementById('med-custom-time-group');

    if (freq === 'daily' || freq === 'once') {
      timePickers.classList.remove('hidden');
      customTime.classList.add('hidden');
      
      // If once daily, force single check selection
      const boxes = document.querySelectorAll('.time-checkboxes input');
      if (freq === 'once') {
        boxes.forEach((box, idx) => {
          box.type = 'radio';
          box.name = 'time-radio';
          if (idx === 0) box.checked = true;
        });
      } else {
        boxes.forEach(box => {
          box.type = 'checkbox';
          box.name = '';
        });
      }
    } else {
      timePickers.classList.add('hidden');
      customTime.classList.remove('hidden');
    }
  }

  handleMedicationSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('med-name').value;
    const dosage = document.getElementById('med-dosage').value;
    const freq = document.getElementById('med-frequency').value;
    const duration = parseInt(document.getElementById('med-duration').value) || 30;
    const route = document.getElementById('med-route').value;
    const instructions = document.getElementById('med-instructions').value || 'None';

    let slots = [];
    if (freq === 'daily' || freq === 'once') {
      if (document.getElementById('time-morning').checked) slots.push('morning');
      if (document.getElementById('time-afternoon').checked) slots.push('afternoon');
      if (document.getElementById('time-night').checked) slots.push('night');
    } else {
      // custom / weekly - assign a slot depending on time
      const timeVal = document.getElementById('med-custom-time').value || '09:00';
      const hour = parseInt(timeVal.split(':')[0]);
      if (hour < 12) slots.push('morning');
      else if (hour < 17) slots.push('afternoon');
      else slots.push('night');
    }

    if (slots.length === 0) slots.push('morning'); // fallback

    const newMed = {
      id: 'med-' + Date.now(),
      name: name,
      dosage: dosage,
      frequency: freq,
      times: slots,
      duration: duration,
      route: route,
      instructions: instructions,
      status: 'active',
      createdDate: new Date().toISOString(),
      history: [
        { date: this.getRelativeDateStr(0), slot: slots[0], status: 'pending' }
      ]
    };

    this.state.medications.push(newMed);
    this.addNotification('Medication Scheduled', `${name} (${dosage}) has been added to your planner.`);
    this.saveState();
    this.toggleAddMedicationModal(false);
    this.renderAll();
  }

  deleteMedication(id) {
    this.state.medications = this.state.medications.filter(m => m.id !== id);
    this.addNotification('Medication Deleted', `Medication schedule removed.`);
    this.saveState();
    this.renderAll();
  }

  toggleMedComplete(id) {
    const medIndex = this.state.medications.findIndex(m => m.id === id);
    if (medIndex > -1) {
      const currentStatus = this.state.medications[medIndex].status;
      this.state.medications[medIndex].status = currentStatus === 'active' ? 'completed' : 'active';
      this.saveState();
      this.renderAll();
    }
  }

  setMedListTab(tab) {
    this.state.activeMedListTab = tab;
    
    const activeBtn = document.getElementById('btn-tab-active-meds');
    const completedBtn = document.getElementById('btn-tab-completed-meds');

    if (tab === 'completed') {
      activeBtn.classList.remove('active');
      completedBtn.classList.add('active');
    } else {
      activeBtn.classList.add('active');
      completedBtn.classList.remove('active');
    }
    
    this.renderMedications();
  }

  // ==================== TODAY'S LOGS & ADHERENCE PROGRESS ====================
  
  // Mark a specific scheduled dose as taken today
  markDoseStatus(medId, slot, status, reason = '') {
    const today = this.getRelativeDateStr(0);
    const med = this.state.medications.find(m => m.id === medId);
    
    if (med) {
      if (!med.history) med.history = [];
      const index = med.history.findIndex(h => h.date === today && h.slot === slot);
      
      if (index > -1) {
        med.history[index].status = status;
        if (reason) med.history[index].reason = reason;
      } else {
        med.history.push({ date: today, slot: slot, status: status, reason: reason });
      }

      this.saveState();
      
      // If skipped or missed consecutively and caregiver notifications enabled, trigger alert
      if (status === 'skipped') {
        this.addNotification('Dose Logged as Skipped', `You marked ${med.name} (${slot}) as skipped.`);
        
        // Show missed dose logic pop up to understand reason
        this.state.missedDoseTracking = { medId, slot, name: med.name };
        this.renderMissedDoseAlert();
        
        this.evaluateCaregiverEscalation(med.name, slot);
      } else if (status === 'taken') {
        this.addNotification('Dose Marked as Taken', `Great! Logged ${med.name} (${slot}) dose.`);
        
        // If we marked the dose that was displaying the missed pop-up, hide it
        if (this.state.missedDoseTracking && this.state.missedDoseTracking.medId === medId && this.state.missedDoseTracking.slot === slot) {
          this.state.missedDoseTracking = null;
          this.renderMissedDoseAlert();
        }
      }

      this.renderAll();
    }
  }

  // Check if patient consecutively skips meds, and raise warning for caregiver
  evaluateCaregiverEscalation(medName, slot) {
    // Check if notifications are enabled and details set
    if (!this.state.caregiver.enabled) return;

    // Simulate warning trigger logic
    const recentMissed = this.state.medications.flatMap(m => m.history)
      .filter(h => h.status === 'skipped')
      .slice(-this.state.caregiver.escalateThreshold);

    if (recentMissed.length >= this.state.caregiver.escalateThreshold) {
      // Escalate to Caregiver Board
      const alertTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      this.addCaregiverAlert('alert_missed', `ALERT: Patient missed ${recentMissed.length} consecutive doses! Last missed: ${medName} (${slot}).`);
    }
  }

  addCaregiverAlert(type, text) {
    if (!this.state.caregiverAlerts) this.state.caregiverAlerts = [];
    this.state.caregiverAlerts.unshift({
      id: 'alert-' + Date.now(),
      type: type,
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' today'
    });
    this.saveState();
  }

  renderMissedDoseAlert() {
    const alertBox = document.getElementById('missed-dose-alert-box');
    const alertText = document.getElementById('missed-dose-text');
    
    if (this.state.missedDoseTracking) {
      alertBox.classList.remove('hidden');
      alertText.innerText = `You marked ${this.state.missedDoseTracking.name} scheduled for today's ${this.state.missedDoseTracking.slot} segment as skipped.`;
    } else {
      alertBox.classList.add('hidden');
    }
  }

  submitMissedReason() {
    const reasonSelect = document.getElementById('missed-reason');
    const reasonText = reasonSelect.options[reasonSelect.selectedIndex].text;
    
    if (this.state.missedDoseTracking) {
      const { medId, slot } = this.state.missedDoseTracking;
      const today = this.getRelativeDateStr(0);
      const med = this.state.medications.find(m => m.id === medId);
      
      if (med) {
        const index = med.history.findIndex(h => h.date === today && h.slot === slot);
        if (index > -1) {
          med.history[index].reason = reasonText;
        }
      }

      this.addNotification('Reason Saved', `AI recorded missed dose reason: "${reasonText}"`);
      this.state.missedDoseTracking = null;
      this.saveState();
      this.renderAll();
    }
  }

  // ==================== PRESCRIPTION OCR EXTRACTOR SIMULATOR ====================
  setupOcrDragDrop() {
    const dropZone = document.getElementById('ocr-drop-zone');
    if (!dropZone) return;

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--color-primary)';
        dropZone.style.backgroundColor = 'var(--color-primary-light)';
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--border-color)';
        dropZone.style.backgroundColor = 'var(--bg-app)';
      }, false);
    });

    dropZone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        this.processMockOcr(files[0]);
      }
    });

    dropZone.addEventListener('click', () => {
      document.getElementById('ocr-file-input').click();
    });
  }

  handlePrescriptionUpload(event) {
    const files = event.target.files;
    if (files.length > 0) {
      this.processMockOcr(files[0]);
    }
  }

  processMockOcr(file) {
    const statusBox = document.getElementById('ocr-status-box');
    const dropZone = document.getElementById('ocr-drop-zone');
    const resultsBox = document.getElementById('ocr-results-box');

    // Show Scanning Screen
    dropZone.classList.add('hidden');
    statusBox.classList.remove('hidden');
    resultsBox.classList.add('hidden');

    const spinnerTexts = [
      'Uploading prescription file...',
      'Preprocessing image contrast layers...',
      'OCR engine identifying text boundaries...',
      'MediCare AI extracting medicine formulas & dosages...'
    ];

    let step = 0;
    const interval = setInterval(() => {
      document.getElementById('ocr-spinner-text').innerText = spinnerTexts[step];
      step++;
      if (step >= spinnerTexts.length) {
        clearInterval(interval);
        
        // Mock OCR Result Output
        this.state.ocrResults = [
          { name: 'Amoxicillin', dosage: '500mg', frequency: 'daily', times: ['morning', 'afternoon', 'night'], duration: 7, route: 'oral', instructions: 'Take 3 times daily with water for 7 days. Finish full course.' },
          { name: 'Lipitor (Atorvastatin)', dosage: '10mg', frequency: 'once', times: ['night'], duration: 30, route: 'oral', instructions: 'Take 1 tablet daily at night.' }
        ];

        this.renderOcrResults();
      }
    }, 800);
  }

  renderOcrResults() {
    const statusBox = document.getElementById('ocr-status-box');
    const resultsBox = document.getElementById('ocr-results-box');
    const tbody = document.getElementById('ocr-extracted-rows');

    statusBox.classList.add('hidden');
    resultsBox.classList.remove('hidden');
    tbody.innerHTML = '';

    this.state.ocrResults.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${item.name}</strong></td>
        <td>${item.dosage}</td>
        <td>${item.frequency === 'once' ? 'Once Daily' : '3x Daily'}</td>
        <td>${item.duration} Days</td>
        <td><span class="text-muted">${item.instructions}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  cancelOcrResults() {
    this.state.ocrResults = null;
    document.getElementById('ocr-drop-zone').classList.remove('hidden');
    document.getElementById('ocr-results-box').classList.add('hidden');
  }

  confirmOcrResults() {
    if (this.state.ocrResults) {
      this.state.ocrResults.forEach(item => {
        const newMed = {
          id: 'med-ocr-' + Date.now() + Math.random().toString(36).substr(2, 5),
          name: item.name,
          dosage: item.dosage,
          frequency: item.frequency,
          times: item.times,
          duration: item.duration,
          route: item.route,
          instructions: item.instructions,
          status: 'active',
          createdDate: new Date().toISOString(),
          history: [
            { date: this.getRelativeDateStr(0), slot: item.times[0], status: 'pending' }
          ]
        };
        this.state.medications.push(newMed);
      });

      this.addNotification('Prescription Extracted', `Successfully imported ${this.state.ocrResults.length} medications to planner.`);
      this.state.ocrResults = null;
      this.saveState();
      
      // Hide results box, restore drop zone
      document.getElementById('ocr-results-box').classList.add('hidden');
      document.getElementById('ocr-drop-zone').classList.remove('hidden');
      
      this.renderAll();
      this.switchView('patient-dashboard');
    }
  }

  // ==================== SYMPTOM JOURNAL ====================
  handleSymptomTypeChange() {
    const type = document.getElementById('symp-type').value;
    const valGroup = document.getElementById('input-group-value');
    const valLabel = document.getElementById('symp-value-label');
    const valInput = document.getElementById('symp-value');
    const bpGroup = document.getElementById('input-group-bp');

    if (type === 'bp') {
      valGroup.classList.add('hidden');
      bpGroup.classList.remove('hidden');
      valInput.required = false;
    } else {
      valGroup.classList.remove('hidden');
      bpGroup.classList.add('hidden');
      valInput.required = true;

      // Adjust limits dynamically
      const ranges = {
        pain: { label: 'Pain Level (1-10)', min: 1, max: 10, step: 1, val: 5 },
        fever: { label: 'Body Temperature (°F)', min: 95, max: 110, step: 0.1, val: 98.6 },
        sugar: { label: 'Blood Sugar (mg/dL)', min: 50, max: 400, step: 1, val: 100 },
        mood: { label: 'Mood Rating (1-10)', min: 1, max: 10, step: 1, val: 8 },
        sleep: { label: 'Hours of Sleep', min: 0, max: 24, step: 0.5, val: 7 },
        weight: { label: 'Weight (kg)', min: 20, max: 250, step: 0.1, val: 70 }
      };

      const set = ranges[type];
      valLabel.innerText = set.label;
      valInput.min = set.min;
      valInput.max = set.max;
      valInput.step = set.step;
      valInput.value = set.val;
    }
  }

  handleSymptomSubmit(event) {
    event.preventDefault();
    const type = document.getElementById('symp-type').value;
    const notes = document.getElementById('symp-notes').value || 'None';
    
    let log = {
      id: 'symp-' + Date.now(),
      type: type,
      notes: notes,
      date: new Date().toISOString()
    };

    if (type === 'bp') {
      const systolic = parseInt(document.getElementById('bp-systolic').value) || 120;
      const diastolic = parseInt(document.getElementById('bp-diastolic').value) || 80;
      log.value = systolic;
      log.valueDiastolic = diastolic;
    } else {
      log.value = parseFloat(document.getElementById('symp-value').value);
    }

    this.state.symptomLogs.unshift(log);
    this.addNotification('Symptom Logged', `Symptom data for ${type.toUpperCase()} recorded.`);
    this.saveState();
    
    document.getElementById('symptom-log-form').reset();
    this.handleSymptomTypeChange();
    
    this.renderAll();
  }

  deleteSymptom(id) {
    this.state.symptomLogs = this.state.symptomLogs.filter(s => s.id !== id);
    this.saveState();
    this.renderAll();
  }

  // AI evaluation insights on logged items
  getSymptomAiAdvice() {
    if (this.state.symptomLogs.length === 0) return 'No logged items today. Log some vitals to see trends.';
    
    const latest = this.state.symptomLogs[0];
    if (latest.type === 'pain' && latest.value > 6) {
      return `⚠️ **Attention:** Your logged pain index is high (${latest.value}/10). Resting and taking a scheduled analgesic can assist. Please consult your physician if it persists over 24 hours.`;
    }
    if (latest.type === 'fever' && latest.value > 100.4) {
      return `⚠️ **Fever Detected:** Body temp is elevated at ${latest.value}°F. Keep hydrated, rest, and monitor closely. Seek immediate attention if temp rises above 102.5°F.`;
    }
    if (latest.type === 'bp' && (latest.value > 140 || latest.valueDiastolic > 90)) {
      return `⚠️ **High Blood Pressure:** Logged BP of ${latest.value}/${latest.valueDiastolic} mmHg sits in Stage 1/2 Hypertension. Rest in a quiet space, avoid caffeine or salt, and check again in 30 minutes. Consult your cardiologist if it remains high.`;
    }
    if (latest.type === 'sugar' && latest.value > 180) {
      return `⚠️ **Hyperglycemia Warning:** Sugar level is elevated at ${latest.value} mg/dL. Monitor insulin schedule, drink plenty of water, and avoid carbohydrate intake.`;
    }
    
    return `✅ **Status Stable:** Your latest logs (${latest.type.toUpperCase()}: ${latest.value}${latest.valueDiastolic ? '/' + latest.valueDiastolic : ''}) indicate safe parameters. Keep up the regular monitoring!`;
  }

  // ==================== APPOINTMENT MANAGER ====================
  handleAppointmentSubmit(event) {
    event.preventDefault();
    const doctor = document.getElementById('app-doctor').value;
    const specialty = document.getElementById('app-specialty').value;
    const date = document.getElementById('app-date').value;
    const time = document.getElementById('app-time').value;
    const type = document.getElementById('app-type').value;
    const notes = document.getElementById('app-notes').value || 'None';

    const newApp = {
      id: 'app-' + Date.now(),
      doctor: doctor,
      specialty: specialty,
      date: date,
      time: time,
      type: type,
      notes: notes,
      status: 'upcoming'
    };

    this.state.appointments.push(newApp);
    // Sort appointments chronologically
    this.state.appointments.sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
    
    this.addNotification('Appointment Logged', `Visit with ${doctor} scheduled.`);
    this.saveState();

    document.getElementById('appointment-form').reset();
    this.renderAll();
  }

  deleteAppointment(id) {
    this.state.appointments = this.state.appointments.filter(a => a.id !== id);
    this.saveState();
    this.renderAll();
  }

  completeAppointment(id) {
    const appIndex = this.state.appointments.findIndex(a => a.id === id);
    if (appIndex > -1) {
      this.state.appointments[appIndex].status = 'completed';
      this.addNotification('Appointment Completed', `Visit logged as completed.`);
      this.saveState();
      this.renderAll();
    }
  }

  // Simulate entering telehealth call
  joinMeeting(doctor) {
    alert(`Connecting to MediCare Secure Video Gateway...\nJoining Telehealth Room with ${doctor}. Please allow webcam and microphone permissions.`);
  }

  // ==================== AI HEALTH CHAT AGENT ====================
  sendQuickPrompt(text) {
    document.getElementById('chat-user-input').value = text;
    this.handleChatSubmit({ preventDefault: () => {} });
  }

  handleChatSubmit(event) {
    if (event && event.preventDefault) event.preventDefault();
    const inputEl = document.getElementById('chat-user-input');
    const query = inputEl.value.trim();
    if (!query) return;

    // Render User Message
    this.appendChatMessage('user', query);
    inputEl.value = '';

    // Trigger AI response loading simulation
    const chatContainer = document.getElementById('chat-messages-box');
    const loadingBubble = document.createElement('div');
    loadingBubble.className = 'message incoming loading-bubble';
    loadingBubble.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">
        <div class="spinner-container" style="flex-direction:row; gap:6px;">
          <div class="spinner" style="width:16px; height:16px; border-width:2px;"></div>
          <span>MediCare Agent analyzing response...</span>
        </div>
      </div>
    `;
    chatContainer.appendChild(loadingBubble);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Generate responsive medical recommendations
    setTimeout(() => {
      chatContainer.removeChild(loadingBubble);
      const reply = this.getAiAgentResponse(query);
      this.appendChatMessage('agent', reply);
    }, 1200);
  }

  appendChatMessage(sender, text) {
    const box = document.getElementById('chat-messages-box');
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const bubble = document.createElement('div');
    bubble.className = `message ${sender === 'user' ? 'outgoing' : 'incoming'}`;
    bubble.innerHTML = `
      <div class="message-avatar">${sender === 'user' ? '👤' : '🤖'}</div>
      <div class="message-content">
        <p>${text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}</p>
        <span class="message-time">${timeStr}</span>
      </div>
    `;

    box.appendChild(bubble);
    box.scrollTop = box.scrollHeight;
    
    // Save to state history
    this.state.chatHistory.push({ sender, text, time: timeStr });
    this.saveState();
  }

  getAiAgentResponse(query) {
    const lower = query.toLowerCase();
    
    // Knowledge Base responses
    if (lower.includes('atorvastatin') || lower.includes('lipitor')) {
      return `**Atorvastatin (Lipitor)** belongs to a class of medications called statins.
      - **Purpose:** Used to lower LDL "bad" cholesterol and triglycerides, reducing the risk of heart disease and strokes.
      - **Guidelines:** Take exactly as prescribed (usually once daily in the morning or evening). Avoid eating large amounts of Grapefruit, as it increases statin levels in your blood.
      - **Side Effects:** Common mild issues include muscle aches or joint stiffness. Inform your cardiologist immediately if you experience severe unexplained muscle pain or tea-colored urine.
      
      *Disclaimer: I am your AI reminder helper. Please consult your physician before altering dosage.*`;
    }
    
    if (lower.includes('lisinopril')) {
      return `**Lisinopril** is an ACE (Angiotensin-Converting Enzyme) Inhibitor.
      - **Purpose:** Prescribed to manage High Blood Pressure (Hypertension) and treat congestive heart failure.
      - **Guidelines:** Take once daily. It's best to take it at the same hour each morning. Make sure to stay adequately hydrated.
      - **Side Effects:** May cause a dry cough, dizziness, or mild headaches. If you develop swelling in the throat, lips, or tongue, seek emergency care immediately.
      
      *Disclaimer: Always check with your cardiologist regarding blood pressure targets.*`;
    }

    if (lower.includes('metformin')) {
      return `**Metformin** is a vital oral anti-diabetic drug.
      - **Purpose:** Helps control blood sugar levels in type 2 diabetes by reducing glucose production in the liver.
      - **Guidelines:** Take during or immediately after meals (breakfast and dinner if twice daily) to minimize stomach upset.
      - **Precautions:** Limit alcohol intake to prevent lactic acidosis risk. 
      
      *Disclaimer: Confirm glucose goals with your endocrinologist.*`;
    }

    if (lower.includes('miss') || lower.includes('skip') || lower.includes('forgot')) {
      return `If you miss a dose of your scheduled medication, follow these general clinical parameters:
      1. **Rule of Thumb:** Take it as soon as you remember. However, if the time is close to your next scheduled dose, **SKIP** the missed dose and resume your regular sequence.
      2. **Never Double Up:** Taking two tablets at once to compensate for a missed dose is dangerous and can lead to adverse toxicity or hypotension.
      3. **Tracking:** Log the event as "Skipped" in the MediCare Dashboard. This logs it in the adherence summary so we can advise caregiver sync or optimization.
      
      *Disclaimer: Check specific instructions for your drug on the prescription insert, or consult your pharmacist.*`;
    }

    if (lower.includes('food') || lower.includes('dairy') || lower.includes('amoxicillin')) {
      return `Taking medicine with food can significantly affect absorption:
      - **Amoxicillin:** Can be taken with or without food. It doesn't bind to calcium, so dairy is fine.
      - **NSAIDs (Ibuprofen, etc.):** Take with meals or milk to protect stomach lining.
      - **Iron Supplements:** Best taken on an empty stomach for maximum absorption, but if it causes stomach cramps, a small meal can help.
      
      *Disclaimer: Always review the label instructions.*`;
    }

    if (lower.includes('tips') || lower.includes('remember')) {
      return `Here are some effective habits to keep your adherence high:
      - **Habit Stacking:** Connect pill-taking with a daily routine (e.g., right after brushing teeth).
      - **Visual Cues:** Place a pillbox on the kitchen table where it remains highly visible.
      - **MediCare Reminders:** Keep our notification bells active for SMS alerts.
      - **Caregiver Linking:** Use the caregiver settings to keep your family updated on compliance progress.`;
    }

    return `I've noted your question: "${query}". 
    As your MediCare Agent, I can analyze trends or clarify dosage instructions. 
    Could you tell me more about which specific medication or symptom this relates to? 
    
    *Reminder: In case of chest pains, shortness of breath, or serious fever symptoms, seek professional medical help immediately.*`;
  }

  // ==================== NOTIFICATIONS DRAWER ====================
  addNotification(title, body) {
    const notif = {
      id: 'notif-' + Date.now(),
      title: title,
      body: body,
      time: 'Just now'
    };
    this.state.notifications.unshift(notif);
    
    // Play subtle notification alert
    this.playNotificationSound();
    
    this.saveState();
    this.renderNotifications();
  }

  playNotificationSound() {
    // Simple synthesized browser beep tone
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // high note
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch(e) {
      console.log('AudioContext not allowed or not supported yet');
    }
  }

  toggleNotificationsDrawer() {
    const drawer = document.getElementById('notifications-drawer');
    drawer.classList.toggle('hidden');
  }

  clearNotifications() {
    this.state.notifications = [];
    this.saveState();
    this.renderNotifications();
  }

  // ==================== PROFILE & SETTINGS SUBMISSIONS ====================
  handleProfileSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('set-name').value;
    const email = document.getElementById('set-email').value;
    const age = parseInt(document.getElementById('set-age').value) || 65;
    const phone = document.getElementById('set-phone').value;

    this.state.user.name = name;
    this.state.user.email = email;
    this.state.user.age = age;
    this.state.user.phone = phone;

    this.addNotification('Settings Updated', 'Personal health profile settings saved.');
    this.saveState();
    this.updateLayoutMode();
    this.renderAll();
  }

  toggleCaregiverEnableState() {
    const enabled = document.getElementById('set-caregiver-enabled').checked;
    const fields = document.getElementById('caregiver-input-fields');
    if (enabled) {
      fields.classList.remove('hidden');
    } else {
      fields.classList.add('hidden');
    }
  }

  handleCaregiverSubmit(event) {
    event.preventDefault();
    const enabled = document.getElementById('set-caregiver-enabled').checked;
    const name = document.getElementById('set-caregiver-name').value;
    const email = document.getElementById('set-caregiver-email').value;
    const threshold = parseInt(document.getElementById('set-caregiver-escalate').value) || 2;

    this.state.caregiver = {
      name: name,
      email: email,
      enabled: enabled,
      escalateThreshold: threshold
    };

    this.addNotification('Caregiver Linked', `Caregiver linkage details configured successfully.`);
    this.saveState();
    this.renderAll();
  }

  // ==================== RENDERING COMPONENT UPDATES ====================
  renderAll() {
    this.renderNotifications();
    this.renderPatientDashboard();
    this.renderMedications();
    this.renderSymptomJournal();
    this.renderAppointments();
    this.renderCaregiverDashboard();
    this.renderSettings();
  }

  // Header notifications rendering
  renderNotifications() {
    const badge = document.getElementById('notification-badge');
    const list = document.getElementById('notifications-list');

    if (this.state.notifications.length > 0) {
      badge.classList.remove('hidden');
      list.innerHTML = '';
      
      this.state.notifications.forEach(notif => {
        const item = document.createElement('div');
        item.className = 'notification-item';
        item.innerHTML = `
          <span class="title">${notif.title}</span>
          <span class="text-muted">${notif.body}</span>
          <span class="time">${notif.time}</span>
        `;
        list.appendChild(item);
      });
    } else {
      badge.classList.add('hidden');
      list.innerHTML = `<div class="empty-state">No notifications.</div>`;
    }
  }

  // Patient Dashboard UI Widgets
  renderPatientDashboard() {
    const welcomeName = document.getElementById('dashboard-welcome-name');
    if (welcomeName) welcomeName.innerText = this.state.user.name.split(' ')[0];

    const todayStr = this.getRelativeDateStr(0);
    const checklistContainer = document.getElementById('dashboard-meds-checklist');
    if (!checklistContainer) return;
    
    checklistContainer.innerHTML = '';

    // Filter active medications
    const activeMeds = this.state.medications.filter(m => m.status === 'active');
    
    // Resolve scheduled slots
    const slotDoses = { morning: [], afternoon: [], night: [] };
    activeMeds.forEach(med => {
      med.times.forEach(slot => {
        // Find if history exists for today
        const hist = med.history ? med.history.find(h => h.date === todayStr && h.slot === slot) : null;
        const status = hist ? hist.status : 'pending';
        slotDoses[slot].push({ med, status });
      });
    });

    let totalDosesToday = 0;
    let takenDosesToday = 0;
    
    // Render slots visually
    const slotLabels = { morning: 'Morning (8:00 AM)', afternoon: 'Afternoon (1:00 PM)', night: 'Night (8:00 PM)' };
    
    Object.keys(slotDoses).forEach(slot => {
      const doses = slotDoses[slot];
      if (doses.length === 0) return;

      const groupDiv = document.createElement('div');
      groupDiv.className = 'segment-group';
      groupDiv.innerHTML = `<div class="segment-group-title">${slotLabels[slot]}</div>`;
      
      const listDiv = document.createElement('div');
      listDiv.className = 'segment-list';

      doses.forEach(({ med, status }) => {
        totalDosesToday++;
        if (status === 'taken') takenDosesToday++;

        const item = document.createElement('div');
        item.className = `checklist-item ${status === 'skipped' ? 'skipped' : ''}`;
        
        let checkboxHtml = `<div class="checklist-checkbox" onclick="app.markDoseStatus('${med.id}', '${slot}', 'taken')"><i data-lucide="check" class="hidden"></i></div>`;
        if (status === 'taken') {
          checkboxHtml = `<div class="checklist-checkbox checked" onclick="app.markDoseStatus('${med.id}', '${slot}', 'pending')"><i data-lucide="check"></i></div>`;
        }

        item.innerHTML = `
          ${checkboxHtml}
          <div class="checklist-info">
            <span class="checklist-name">${med.name}</span>
            <span class="checklist-meta">${med.dosage} &bull; ${med.instructions}</span>
          </div>
          <div class="checklist-actions">
            ${status === 'pending' ? `<button class="btn-skip" onclick="app.markDoseStatus('${med.id}', '${slot}', 'skipped')">Skip</button>` : ''}
            ${status === 'skipped' ? `<span class="badge-danger">Skipped</span> <button class="btn-skip" onclick="app.markDoseStatus('${med.id}', '${slot}', 'taken')">Undo</button>` : ''}
          </div>
        `;
        listDiv.appendChild(item);
      });

      groupDiv.appendChild(listDiv);
      checklistContainer.appendChild(groupDiv);
    });

    if (totalDosesToday === 0) {
      checklistContainer.innerHTML = `<div class="empty-state">No medications scheduled for today. Add items in Medications tab!</div>`;
    }

    // Update Adherence fractions & percent
    const fractionText = `${takenDosesToday} of ${totalDosesToday}`;
    const fractionEl = document.getElementById('adherence-today-fraction');
    if (fractionEl) fractionEl.innerText = fractionText;

    const percentVal = totalDosesToday > 0 ? Math.round((takenDosesToday / totalDosesToday) * 100) : 100;
    const percentEl = document.getElementById('dashboard-adherence-pct');
    if (percentEl) percentEl.innerText = `${percentVal}%`;

    // Overall Adherence Score Ring
    const { totalLogs, takenLogs } = this.calculateAdherenceStats();
    const overallPct = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 100;
    
    const overallPercentEl = document.getElementById('overall-adherence-pct');
    if (overallPercentEl) overallPercentEl.innerText = `${overallPct}%`;
    
    const takenCountEl = document.getElementById('stat-taken-count');
    if (takenCountEl) takenCountEl.innerText = takenLogs;
    
    const missedCountEl = document.getElementById('stat-missed-count');
    if (missedCountEl) missedCountEl.innerText = (totalLogs - takenLogs);
    
    // Update SVG stroke-dashoffset: Circumference = 2 * PI * r (r=40) = 251.2
    const circleEl = document.getElementById('adherence-circle');
    if (circleEl) {
      const offset = 251.2 - (overallPct / 100) * 251.2;
      circleEl.style.strokeDashoffset = offset;
    }

    // Next Reminder Details
    this.renderNextReminderWidget();

    // Render Missed Dose intelligence Box
    this.renderMissedDoseAlert();

    // Upcoming dashboard appointment preview
    const appPreviewContainer = document.getElementById('dashboard-appointment-preview');
    const upcomingApps = this.state.appointments.filter(a => a.status === 'upcoming');
    
    if (upcomingApps.length > 0) {
      const nextApp = upcomingApps[0];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dateObj = new Date(nextApp.date + 'T' + nextApp.time);
      const mth = months[dateObj.getMonth()];
      const day = dateObj.getDate();

      appPreviewContainer.innerHTML = `
        <div class="dashboard-app-preview-item">
          <div class="app-preview-date">
            <span class="mth">${mth}</span>
            <span class="day">${day}</span>
          </div>
          <div class="app-preview-info">
            <span class="app-preview-doc">${nextApp.doctor}</span>
            <span class="app-preview-time">${nextApp.specialty} &bull; ${nextApp.time}</span>
          </div>
        </div>
      `;
    } else {
      appPreviewContainer.innerHTML = `<div class="empty-state">No scheduled visits.</div>`;
    }
  }

  // Next reminder ticker widget calculation
  renderNextReminderWidget() {
    const nextTimeEl = document.getElementById('dashboard-next-time');
    const nextNameEl = document.getElementById('dashboard-next-name');
    const nextActionsEl = document.getElementById('dashboard-next-actions');
    
    const activeMeds = this.state.medications.filter(m => m.status === 'active');
    if (activeMeds.length === 0) {
      nextTimeEl.innerText = '--:--';
      nextNameEl.innerText = 'No active meds';
      nextActionsEl.classList.add('hidden');
      return;
    }

    // Sort scheduled slot hours
    const slotsMap = { morning: '08:00 AM', afternoon: '01:00 PM', night: '08:00 PM' };
    
    // Find first slot that is pending
    const today = this.getRelativeDateStr(0);
    let nextReminder = null;

    for (let slot of ['morning', 'afternoon', 'night']) {
      const medsInSlot = activeMeds.filter(m => {
        if (!m.times.includes(slot)) return false;
        const hist = m.history ? m.history.find(h => h.date === today && h.slot === slot) : null;
        return !hist || hist.status === 'pending';
      });

      if (medsInSlot.length > 0) {
        nextReminder = {
          slot: slot,
          time: slotsMap[slot],
          meds: medsInSlot
        };
        break;
      }
    }

    if (nextReminder) {
      nextTimeEl.innerText = nextReminder.time;
      nextNameEl.innerText = nextReminder.meds.map(m => m.name).join(', ');
      nextActionsEl.classList.remove('hidden');
    } else {
      nextTimeEl.innerText = 'Done!';
      nextNameEl.innerText = 'All doses complete for today';
      nextActionsEl.classList.add('hidden');
    }
  }

  markNextTaken() {
    const activeMeds = this.state.medications.filter(m => m.status === 'active');
    const today = this.getRelativeDateStr(0);
    
    // Find next pending slot
    let targetSlot = null;
    for (let slot of ['morning', 'afternoon', 'night']) {
      const medsInSlot = activeMeds.filter(m => {
        if (!m.times.includes(slot)) return false;
        const hist = m.history ? m.history.find(h => h.date === today && h.slot === slot) : null;
        return !hist || hist.status === 'pending';
      });
      if (medsInSlot.length > 0) {
        targetSlot = slot;
        break;
      }
    }

    if (targetSlot) {
      activeMeds.forEach(m => {
        if (m.times.includes(targetSlot)) {
          this.markDoseStatus(m.id, targetSlot, 'taken');
        }
      });
    }
  }

  snoozeNext(mins) {
    this.addNotification('Reminder Snoozed', `Snoozed upcoming medications for ${mins} minutes.`);
  }

  calculateAdherenceStats() {
    let totalLogs = 0;
    let takenLogs = 0;
    
    this.state.medications.forEach(med => {
      if (med.history) {
        med.history.forEach(h => {
          totalLogs++;
          if (h.status === 'taken') takenLogs++;
        });
      }
    });

    return { totalLogs, takenLogs };
  }

  // Medications Scheduler Tab Card Lists
  renderMedications() {
    const listGrid = document.getElementById('medications-list-grid');
    if (!listGrid) return;

    listGrid.innerHTML = '';

    const filterStatus = this.state.activeMedListTab;
    const filtered = this.state.medications.filter(m => m.status === filterStatus);

    if (filtered.length === 0) {
      listGrid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1">No ${filterStatus} medications listed in your system.</div>`;
      return;
    }

    filtered.forEach(med => {
      const card = document.createElement('div');
      card.className = 'med-card';
      
      const slotsText = med.times.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ');
      
      card.innerHTML = `
        <div class="med-card-header">
          <div class="header-title">
            <div class="med-card-icon"><i data-lucide="pill"></i></div>
            <div>
              <h3>${med.name}</h3>
              <span class="subtitle">${med.dosage}</span>
            </div>
          </div>
          <button class="btn btn-icon-only text-danger" onclick="app.deleteMedication('${med.id}')" title="Delete Schedule">
            <i data-lucide="trash-2" style="width:16px;height:16px;"></i>
          </button>
        </div>
        <div class="med-card-body">
          <div class="med-detail-item">
            <span class="lbl">Route</span>
            <strong>${med.route.toUpperCase()}</strong>
          </div>
          <div class="med-detail-item">
            <span class="lbl">Frequency</span>
            <strong>${med.frequency === 'once' ? 'Once Daily' : med.frequency === 'daily' ? 'Daily' : med.frequency.toUpperCase()}</strong>
          </div>
          <div class="med-detail-item">
            <span class="lbl">Schedules</span>
            <strong>${slotsText}</strong>
          </div>
          <div class="med-detail-item">
            <span class="lbl">Duration</span>
            <strong>${med.duration} Days</strong>
          </div>
          <div class="med-detail-item" style="flex-direction:column; gap:4px; border-top:1px solid var(--border-color); padding-top:12px; margin-top:8px;">
            <span class="lbl">Instructions</span>
            <span class="text-muted" style="font-size:12px; line-height:1.4;">${med.instructions}</span>
          </div>
        </div>
        <div class="med-card-footer">
          <button class="btn ${med.status === 'active' ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="app.toggleMedComplete('${med.id}')">
            ${med.status === 'active' ? 'Mark Completed' : 'Activate Course'}
          </button>
        </div>
      `;
      listGrid.appendChild(card);
    });
    
    this.safeCreateIcons();
  }

  // Symptom Journal Logging list
  renderSymptomJournal() {
    const list = document.getElementById('symptom-history-list');
    if (!list) return;
    list.innerHTML = '';

    const aiEl = document.getElementById('symptom-ai-analysis');
    aiEl.innerHTML = this.getSymptomAiAdvice().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    if (this.state.symptomLogs.length === 0) {
      list.innerHTML = `<div class="empty-state">No health observations logged yet.</div>`;
      return;
    }

    const labels = { pain: 'Pain', fever: 'Fever', bp: 'Blood Pressure', sugar: 'Blood Sugar', mood: 'Mood', sleep: 'Sleep', weight: 'Weight' };
    const units = { pain: '/10', fever: '°F', bp: 'mmHg', sugar: 'mg/dL', mood: '/10', sleep: 'hrs', weight: 'kg' };

    this.state.symptomLogs.forEach(log => {
      const item = document.createElement('div');
      item.className = 'symptom-item';

      let valText = `${log.value}${units[log.type]}`;
      if (log.type === 'bp') {
        valText = `${log.value}/${log.valueDiastolic} ${units[log.type]}`;
      }

      const formattedDate = new Date(log.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

      item.innerHTML = `
        <div class="symptom-badge ${log.type}">${labels[log.type][0]}</div>
        <div class="symptom-info">
          <span class="symptom-title">${labels[log.type]} &bull; <strong>${valText}</strong></span>
          <span class="symptom-notes">${log.notes}</span>
        </div>
        <div class="symptom-date">
          <span>${formattedDate}</span>
          <button class="btn btn-icon-only text-danger" style="width:24px; height:24px; margin-left:8px;" onclick="app.deleteSymptom('${log.id}')">
            <i data-lucide="trash-2" style="width:12px; height:12px;"></i>
          </button>
        </div>
      `;
      list.appendChild(item);
    });
    this.safeCreateIcons();
  }

  // Appointment Calendar views
  renderAppointments() {
    const list = document.getElementById('appointments-list');
    if (!list) return;
    list.innerHTML = '';

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (this.state.appointments.length === 0) {
      list.innerHTML = `<div class="empty-state">No scheduled doctor visits or diagnostics.</div>`;
      return;
    }

    this.state.appointments.forEach(appItem => {
      const item = document.createElement('div');
      item.className = 'appointment-item';
      
      const dateObj = new Date(appItem.date + 'T' + appItem.time);
      const mth = months[dateObj.getMonth()] || 'Mth';
      const day = dateObj.getDate() || '0';

      let actionsHtml = '';
      if (appItem.status === 'upcoming') {
        if (appItem.type === 'telehealth') {
          actionsHtml = `<button class="telehealth-link" onclick="app.joinMeeting('${appItem.doctor}')"><i data-lucide="video"></i> Join Call</button>`;
        }
        actionsHtml += `
          <button class="btn btn-secondary btn-sm" onclick="app.completeAppointment('${appItem.id}')">Mark Complete</button>
        `;
      } else {
        actionsHtml = `<span class="badge-success">Completed</span>`;
      }

      item.innerHTML = `
        <div class="appointment-date-badge">
          <span class="month">${mth}</span>
          <span class="day">${day}</span>
        </div>
        <div class="appointment-details">
          <span class="appointment-doc">${appItem.doctor}</span>
          <span class="appointment-meta">
            <span>Specialty: <strong>${appItem.specialty}</strong></span>
            <span>Time: <strong>${appItem.time}</strong></span>
            <span>Type: <strong>${appItem.type === 'telehealth' ? 'Telehealth' : 'In-Clinic'}</strong></span>
          </span>
          <span class="text-muted" style="font-size:12px; margin-top:6px;">Notes: ${appItem.notes}</span>
        </div>
        <div class="appointment-actions">
          ${actionsHtml}
          <button class="btn btn-icon-only text-danger" style="width:32px; height:32px;" onclick="app.deleteAppointment('${appItem.id}')">
            <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
          </button>
        </div>
      `;
      list.appendChild(item);
    });
    this.safeCreateIcons();
  }

  // Reports & Analytics Charts View
  renderReports() {
    // Overall Stats calculations
    const { totalLogs, takenLogs } = this.calculateAdherenceStats();
    const overallPct = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 100;

    document.getElementById('report-adherence-rate').innerText = `${overallPct}%`;
    document.getElementById('report-missed-count').innerText = (totalLogs - takenLogs);
    document.getElementById('report-active-count').innerText = this.state.medications.filter(m => m.status === 'active').length;
    document.getElementById('report-symptom-count').innerText = this.state.symptomLogs.length;

    // Set Comment on Adherence
    const commentEl = document.getElementById('report-adherence-comment');
    if (overallPct >= 90) {
      commentEl.innerText = 'Excellent Compliance!';
      commentEl.className = 'desc text-success';
    } else if (overallPct >= 75) {
      commentEl.innerText = 'Moderate adherence. Try setting evening reminders.';
      commentEl.className = 'desc text-primary';
    } else {
      commentEl.innerText = 'Action Suggested: Link Caregiver Alerts.';
      commentEl.className = 'desc text-danger';
    }

    // Populate Missed Reasons Table Log list
    const logList = document.getElementById('missed-reason-logs-list');
    logList.innerHTML = '';
    
    const missedHistory = [];
    this.state.medications.forEach(med => {
      if (med.history) {
        med.history.forEach(h => {
          if (h.status === 'skipped') {
            missedHistory.push({
              name: med.name,
              date: h.date,
              slot: h.slot,
              reason: h.reason || 'No justification provided'
            });
          }
        });
      }
    });

    if (missedHistory.length === 0) {
      logList.innerHTML = `<div class="empty-state">No missed dose records.</div>`;
    } else {
      // Sort newest first
      missedHistory.sort((a,b) => new Date(b.date) - new Date(a.date));
      
      missedHistory.forEach(h => {
        const item = document.createElement('div');
        item.className = 'reason-log-item';
        item.innerHTML = `
          <div class="reason-log-header">
            <span>${h.name} (${h.slot.toUpperCase()})</span>
            <span class="text-danger">${h.date}</span>
          </div>
          <span class="reason-log-text">Justification: <em>"${h.reason}"</em></span>
        `;
        logList.appendChild(item);
      });
    }
  }

  // Caregiver Monitoring Panel
  renderCaregiverDashboard() {
    const warningBanner = document.getElementById('caregiver-banner-warning');
    const warningDesc = document.getElementById('caregiver-banner-desc');
    const alertsList = document.getElementById('caregiver-alerts-list');
    
    if (!alertsList) return;

    // Overall stats recalculation
    const { totalLogs, takenLogs } = this.calculateAdherenceStats();
    const compliancePct = totalLogs > 0 ? Math.round((takenLogs / totalLogs) * 100) : 100;
    
    document.getElementById('caregiver-gauge-value').innerText = `${compliancePct}%`;
    document.getElementById('caregiver-taken-count').innerText = takenLogs;
    document.getElementById('caregiver-missed-count').innerText = (totalLogs - takenLogs);
    
    const activeTodayMedsCount = this.state.medications.filter(m => m.status === 'active').reduce((acc, m) => acc + m.times.length, 0);
    document.getElementById('caregiver-med-count').innerText = activeTodayMedsCount;

    // Check alert logs
    if (!this.state.caregiverAlerts) this.state.caregiverAlerts = [];
    
    if (this.state.caregiverAlerts.length > 0) {
      alertsList.innerHTML = '';
      
      // Update header status banner warning
      warningBanner.classList.add('danger');
      warningBanner.innerHTML = `
        <div class="banner-icon"><i data-lucide="shield-alert"></i></div>
        <div class="banner-text">
          <h3>System Alert: Active Missed Doses</h3>
          <p id="caregiver-banner-desc">Escalated triggers logged: Patient shows missed targets consecutively. Recommended check-in.</p>
        </div>
      `;

      this.state.caregiverAlerts.forEach(alert => {
        const item = document.createElement('div');
        item.className = 'caregiver-alert-item';
        item.innerHTML = `
          <div class="caregiver-alert-icon danger"><i data-lucide="alert-triangle"></i></div>
          <div class="caregiver-alert-body">
            <span class="caregiver-alert-title">${alert.text}</span>
            <span class="caregiver-alert-time">${alert.time}</span>
          </div>
        `;
        alertsList.appendChild(item);
      });
    } else {
      warningBanner.classList.remove('danger');
      warningBanner.innerHTML = `
        <div class="banner-icon"><i data-lucide="shield-check"></i></div>
        <div class="banner-text">
          <h3>System Status: Stable</h3>
          <p id="caregiver-banner-desc">Patient John Doe is currently matching his prescription targets. Caregiver notifications active.</p>
        </div>
      `;
      alertsList.innerHTML = `<div class="empty-state">No caregiver warning triggers logged. All clear.</div>`;
    }

    // Mirror list of symptoms on Caregiver board
    const vitalsList = document.getElementById('caregiver-symptom-list');
    vitalsList.innerHTML = '';
    
    if (this.state.symptomLogs.length > 0) {
      const labels = { pain: 'Pain', fever: 'Fever', bp: 'Blood Pressure', sugar: 'Blood Sugar', mood: 'Mood', sleep: 'Sleep', weight: 'Weight' };
      const units = { pain: '/10', fever: '°F', bp: 'mmHg', sugar: 'mg/dL', mood: '/10', sleep: 'hrs', weight: 'kg' };

      this.state.symptomLogs.forEach(log => {
        const item = document.createElement('div');
        item.className = 'symptom-item';

        let valText = `${log.value}${units[log.type]}`;
        if (log.type === 'bp') valText = `${log.value}/${log.valueDiastolic} ${units[log.type]}`;

        item.innerHTML = `
          <div class="symptom-badge ${log.type}">${labels[log.type][0]}</div>
          <div class="symptom-info">
            <span class="symptom-title">${labels[log.type]} &bull; <strong>${valText}</strong></span>
            <span class="symptom-notes">${log.notes}</span>
          </div>
          <div class="symptom-date">${new Date(log.date).toLocaleDateString()}</div>
        `;
        vitalsList.appendChild(item);
      });
    } else {
      vitalsList.innerHTML = `<div class="empty-state">No patient symptoms logged.</div>`;
    }

    // Mirror list of appointments
    const caregiverAppList = document.getElementById('caregiver-appointments-list');
    caregiverAppList.innerHTML = '';
    
    const upcoming = this.state.appointments.filter(a => a.status === 'upcoming');
    if (upcoming.length > 0) {
      upcoming.forEach(appItem => {
        const item = document.createElement('div');
        item.className = 'appointment-item';
        item.innerHTML = `
          <div class="appointment-details">
            <span class="appointment-doc">${appItem.doctor}</span>
            <span class="appointment-meta">
              <span>Date: <strong>${appItem.date}</strong></span>
              <span>Time: <strong>${appItem.time}</strong></span>
              <span>Type: <strong>${appItem.type.toUpperCase()}</strong></span>
            </span>
          </div>
        `;
        caregiverAppList.appendChild(item);
      });
    } else {
      caregiverAppList.innerHTML = `<div class="empty-state">No scheduled doctor visits.</div>`;
    }

    this.safeCreateIcons();
  }

  // Settings view inputs configuration
  renderSettings() {
    const profileForm = document.getElementById('settings-profile-form');
    if (!profileForm) return;

    document.getElementById('set-name').value = this.state.user.name;
    document.getElementById('set-email').value = this.state.user.email;
    document.getElementById('set-age').value = this.state.user.age;
    document.getElementById('set-phone').value = this.state.user.phone;

    // Caregiver sync
    document.getElementById('set-caregiver-enabled').checked = this.state.caregiver.enabled;
    document.getElementById('set-caregiver-name').value = this.state.caregiver.name;
    document.getElementById('set-caregiver-email').value = this.state.caregiver.email;
    document.getElementById('set-caregiver-escalate').value = this.state.caregiver.escalateThreshold;

    this.toggleCaregiverEnableState();
  }

  // ==================== OTHER POPUP MODALS ====================
  showPrivacyModal() {
    document.getElementById('modal-privacy').classList.add('active');
  }

  closePrivacyModal() {
    document.getElementById('modal-privacy').classList.remove('active');
  }
}

// Instantiate application
var app;
const initApp = () => {
  app = new MediCareApp();
  window.app = app;
};

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
