// Pakistani Voting System - Main JavaScript File
// All issues fixed: party selection, checkbox validation, form reset, and consecutive voting

document.addEventListener('DOMContentLoaded', function() {
    console.log('Pakistani Voting System initialized');
    initApp();
});

// Application State
const appState = {
    currentSection: 'home',
    votes: [],
    politicalParties: [
        { id: 'pmln', name: 'Pakistan Muslim League (N)', color: 'party-pmln', leader: 'Nawaz Sharif', icon: 'PML-N' },
        { id: 'pti', name: 'Pakistan Tehreek-e-Insaf', color: 'party-pti', leader: 'Imran Khan', icon: 'PTI' },
        { id: 'ppp', name: 'Pakistan People\'s Party', color: 'party-ppp', leader: 'Bilawal Bhutto', icon: 'PPP' },
        { id: 'mqm', name: 'Muttahida Qaumi Movement', color: 'party-mqm', leader: 'Khalid Maqbool', icon: 'MQM' },
        { id: 'jui', name: 'Jamiat Ulema-e-Islam', color: 'party-jui', leader: 'Fazal-ur-Rehman', icon: 'JUI' },
        { id: 'other', name: 'Other Party / Independent', color: 'party-other', leader: 'Various', icon: 'OTH' }
    ]
};

// Initialize the application
function initApp() {
    console.log('Initializing application...');
    
    // Load votes from localStorage
    loadVotesFromStorage();
    
    // Set up navigation
    setupNavigation();
    
    // Set up voting form
    setupVotingForm();
    
    // Set up results section
    setupResults();
    
    // Set up modal
    setupModal();
    
    // Update UI based on initial state
    updateUI();
    
    console.log('Application initialized successfully');
}

// Load votes from localStorage
function loadVotesFromStorage() {
    console.log('Loading votes from localStorage...');
    const storedVotes = localStorage.getItem('pakistanVotes');
    
    if (storedVotes) {
        try {
            appState.votes = JSON.parse(storedVotes);
            console.log(`Loaded ${appState.votes.length} votes from storage`);
        } catch (error) {
            console.error('Error parsing stored votes:', error);
            appState.votes = [];
            localStorage.setItem('pakistanVotes', JSON.stringify([]));
        }
    } else {
        console.log('No votes found in localStorage, initializing empty array');
        appState.votes = [];
        localStorage.setItem('pakistanVotes', JSON.stringify([]));
    }
}

// Save votes to localStorage
function saveVotesToStorage() {
    console.log('Saving votes to localStorage...');
    localStorage.setItem('pakistanVotes', JSON.stringify(appState.votes));
    console.log(`Saved ${appState.votes.length} votes`);
}

// Set up navigation
function setupNavigation() {
    console.log('Setting up navigation...');
    
    const homeBtn = document.getElementById('homeBtn');
    const voteBtn = document.getElementById('voteBtn');
    const resultsBtn = document.getElementById('resultsBtn');
    const startVotingBtn = document.getElementById('startVotingBtn');
    
    if (homeBtn) homeBtn.addEventListener('click', () => switchSection('home'));
    if (voteBtn) voteBtn.addEventListener('click', () => switchSection('vote'));
    if (resultsBtn) resultsBtn.addEventListener('click', () => switchSection('results'));
    if (startVotingBtn) startVotingBtn.addEventListener('click', () => switchSection('vote'));
    
    console.log('Navigation setup complete');
}

// Switch between sections
function switchSection(sectionName) {
    console.log(`Switching to section: ${sectionName}`);
    
    // Update state
    appState.currentSection = sectionName;
    
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update navigation buttons
    updateNavigation();
    
    // Update content if needed
    if (sectionName === 'results') {
        updateResults();
    } else if (sectionName === 'vote') {
        loadPoliticalParties();
    }
    
    console.log(`Switched to ${sectionName} section`);
}

// Update navigation buttons
function updateNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.id === appState.currentSection + 'Btn') {
            btn.classList.add('active');
        }
    });
}

// Set up voting form
function setupVotingForm() {
    console.log('Setting up voting form...');
    
    const votingForm = document.getElementById('votingForm');
    const clearFormBtn = document.getElementById('clearFormBtn');
    const submitVoteBtn = document.getElementById('submitVoteBtn');
    const confirmVoteCheckbox = document.getElementById('confirmVote');
    
    // Load political parties into the form
    loadPoliticalParties();
    
    // Form submission handler
    if (votingForm) {
        votingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submission triggered');
            submitVote();
        });
    }
    
    // Clear form button
    if (clearFormBtn) {
        clearFormBtn.addEventListener('click', function() {
            console.log('Clearing form');
            clearForm();
        });
    }
    
    // Checkbox change handler
    if (confirmVoteCheckbox) {
        confirmVoteCheckbox.addEventListener('change', function() {
            console.log('Checkbox changed:', this.checked);
            updateSubmitButtonState();
        });
    }
    
    // Real-time validation for CNIC
    const cnicInput = document.getElementById('cnicInput');
    if (cnicInput) {
        cnicInput.addEventListener('input', function() {
            formatCNIC(this);
            validateForm();
        });
    }
    
    // Real-time validation for all inputs
    const formInputs = document.querySelectorAll('#votingForm input, #votingForm select, #votingForm textarea');
    formInputs.forEach(input => {
        input.addEventListener('input', validateForm);
        input.addEventListener('change', validateForm);
    });
    
    console.log('Voting form setup complete');
}

// Load political parties into the form
function loadPoliticalParties() {
    console.log('Loading political parties...');
    
    const partiesContainer = document.getElementById('partiesContainer');
    if (!partiesContainer) {
        console.error('Parties container not found');
        return;
    }
    
    // Clear container
    partiesContainer.innerHTML = '';
    
    // Create party options
    appState.politicalParties.forEach(party => {
        const partyOption = document.createElement('div');
        partyOption.className = 'party-option';
        
        partyOption.innerHTML = `
            <input type="radio" id="party-${party.id}" name="politicalParty" 
                   value="${party.name}" class="party-radio">
            <label for="party-${party.id}" class="party-label">
                <div class="party-icon ${party.color}">
                    ${party.icon}
                </div>
                <div class="party-info">
                    <h4>${party.name}</h4>
                    <p class="party-leader">${party.leader}</p>
                </div>
                <div class="radio-indicator"></div>
            </label>
        `;
        
        partiesContainer.appendChild(partyOption);
    });
    
    // Add event listeners to party radio buttons
    const partyRadios = document.querySelectorAll('.party-radio');
    partyRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            console.log('Party selected:', this.value);
            validateForm();
            updateSubmitButtonState();
        });
    });
    
    console.log(`Loaded ${appState.politicalParties.length} political parties`);
}

// Format CNIC input (XXXXX-XXXXXXX-X)
function formatCNIC(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 13) {
        value = value.substring(0, 13);
    }
    
    if (value.length > 5) {
        value = value.substring(0, 5) + '-' + value.substring(5);
    }
    
    if (value.length > 13) {
        value = value.substring(0, 13) + '-' + value.substring(13);
    }
    
    input.value = value;
}

// Validate form inputs
function validateForm() {
    const cnicInput = document.getElementById('cnicInput');
    const nameInput = document.getElementById('nameInput');
    const addressInput = document.getElementById('addressInput');
    const provinceSelect = document.getElementById('provinceSelect');
    const partySelected = document.querySelector('input[name="politicalParty"]:checked');
    
    // Validate CNIC (13 digits with dashes)
    const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
    const isCnicValid = cnicRegex.test(cnicInput.value);
    
    // Validate name (at least 2 characters)
    const isNameValid = nameInput.value.trim().length >= 2;
    
    // Validate address (at least 10 characters)
    const isAddressValid = addressInput.value.trim().length >= 10;
    
    // Validate province
    const isProvinceValid = provinceSelect.value !== '';
    
    // Validate party selection
    const isPartyValid = partySelected !== null;
    
    // Apply visual feedback
    cnicInput.classList.toggle('is-valid', isCnicValid);
    cnicInput.classList.toggle('is-invalid', !isCnicValid && cnicInput.value.length > 0);
    
    nameInput.classList.toggle('is-valid', isNameValid);
    nameInput.classList.toggle('is-invalid', !isNameValid && nameInput.value.length > 0);
    
    addressInput.classList.toggle('is-valid', isAddressValid);
    addressInput.classList.toggle('is-invalid', !isAddressValid && addressInput.value.length > 0);
    
    provinceSelect.classList.toggle('is-valid', isProvinceValid);
    provinceSelect.classList.toggle('is-invalid', !isProvinceValid && provinceSelect.value.length > 0);
    
    return isCnicValid && isNameValid && isAddressValid && isProvinceValid && isPartyValid;
}

// Update submit button state
function updateSubmitButtonState() {
    const submitVoteBtn = document.getElementById('submitVoteBtn');
    const confirmVoteCheckbox = document.getElementById('confirmVote');
    
    if (!submitVoteBtn || !confirmVoteCheckbox) return;
    
    const isFormValid = validateForm();
    const isConfirmed = confirmVoteCheckbox.checked;
    
    submitVoteBtn.disabled = !(isFormValid && isConfirmed);
    
    console.log(`Submit button: Form valid=${isFormValid}, Confirmed=${isConfirmed}, Disabled=${submitVoteBtn.disabled}`);
}

// Clear form
function clearForm() {
    const votingForm = document.getElementById('votingForm');
    const confirmVoteCheckbox = document.getElementById('confirmVote');
    const submitVoteBtn = document.getElementById('submitVoteBtn');
    
    if (votingForm) {
        votingForm.reset();
    }
    
    if (confirmVoteCheckbox) {
        confirmVoteCheckbox.checked = false;
    }
    
    if (submitVoteBtn) {
        submitVoteBtn.disabled = true;
    }
    
    // Clear validation classes
    const formInputs = document.querySelectorAll('#votingForm input, #votingForm select, #votingForm textarea');
    formInputs.forEach(input => {
        input.classList.remove('is-valid', 'is-invalid');
    });
    
    console.log('Form cleared');
}

// Submit vote
function submitVote() {
    console.log('Submitting vote...');
    
    // Get form values
    const cnic = document.getElementById('cnicInput').value.trim();
    const name = document.getElementById('nameInput').value.trim();
    const address = document.getElementById('addressInput').value.trim();
    const province = document.getElementById('provinceSelect').value;
    const partyElement = document.querySelector('input[name="politicalParty"]:checked');
    
    if (!partyElement) {
        alert('Please select a political party.');
        return;
    }
    
    const party = partyElement.value;
    
    // Validate all fields
    if (!validateForm()) {
        alert('Please fill all fields correctly.');
        return;
    }
    
    // Check if CNIC already voted
    const hasVoted = appState.votes.some(vote => vote.cnic === cnic);
    if (hasVoted) {
        const overwrite = confirm('This CNIC has already voted. Do you want to overwrite the previous vote?');
        if (!overwrite) {
            return;
        }
        // Remove previous vote
        appState.votes = appState.votes.filter(vote => vote.cnic !== cnic);
    }
    
    // Create vote object
    const vote = {
        id: 'VOTE-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
        cnic: cnic,
        name: name,
        address: address,
        province: province,
        party: party,
        timestamp: Date.now(),
        date: new Date().toLocaleString()
    };
    
    // Add to votes array
    appState.votes.push(vote);
    
    // Save to localStorage
    saveVotesToStorage();
    
    // Show success modal
    showSuccessModal(vote);
    
    // Clear form for next vote
    clearForm();
    
    console.log(`Vote submitted successfully. Total votes: ${appState.votes.length}`);
}

// Set up results section
function setupResults() {
    console.log('Setting up results section...');
    
    const refreshResultsBtn = document.getElementById('refreshResultsBtn');
    
    if (refreshResultsBtn) {
        refreshResultsBtn.addEventListener('click', function() {
            console.log('Refreshing results...');
            updateResults();
        });
    }
    
    console.log('Results section setup complete');
}

// Update results display
function updateResults() {
    console.log('Updating results display...');
    
    const totalVotesElement = document.getElementById('totalVotes');
    const uniqueVotersElement = document.getElementById('uniqueVoters');
    const provincesCountElement = document.getElementById('provincesCount');
    const resultsChart = document.getElementById('resultsChart');
    const recentVotesTable = document.querySelector('#recentVotesTable tbody');
    
    if (!totalVotesElement || !resultsChart || !recentVotesTable) {
        console.error('Results elements not found');
        return;
    }
    
    const votes = appState.votes;
    const totalVotes = votes.length;
    
    // Calculate unique voters (by CNIC)
    const uniqueCNICs = [...new Set(votes.map(vote => vote.cnic))];
    const uniqueVoters = uniqueCNICs.length;
    
    // Calculate provinces count
    const uniqueProvinces = [...new Set(votes.map(vote => vote.province))].filter(p => p);
    const provincesCount = uniqueProvinces.length;
    
    // Update summary cards
    totalVotesElement.textContent = totalVotes;
    uniqueVotersElement.textContent = uniqueVoters;
    provincesCountElement.textContent = provincesCount;
    
    // Calculate party-wise results
    const partyResults = {};
    appState.politicalParties.forEach(party => {
        partyResults[party.name] = 0;
    });
    
    votes.forEach(vote => {
        if (partyResults[vote.party] !== undefined) {
            partyResults[vote.party]++;
        } else {
            partyResults['Other Party / Independent'] = (partyResults['Other Party / Independent'] || 0) + 1;
        }
    });
    
    // Update results chart
    resultsChart.innerHTML = '';
    
    Object.entries(partyResults).forEach(([partyName, voteCount], index) => {
        if (voteCount === 0) return;
        
        const percentage = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : 0;
        
        // Find party color
        const party = appState.politicalParties.find(p => p.name === partyName) || 
                     appState.politicalParties.find(p => p.name === 'Other Party / Independent');
        
        const chartBar = document.createElement('div');
        chartBar.className = 'chart-bar';
        chartBar.innerHTML = `
            <div class="bar-label">${partyName}</div>
            <div class="bar-container">
                <div class="bar-fill ${party ? party.color : 'party-other'}" 
                     style="width: ${percentage}%" data-percentage="${percentage}"></div>
            </div>
            <div class="bar-value">${voteCount} votes (${percentage}%)</div>
        `;
        
        resultsChart.appendChild(chartBar);
    });
    
    // Update recent votes table
    recentVotesTable.innerHTML = '';
    
    // Show last 10 votes (most recent first)
    const recentVotes = [...votes].reverse().slice(0, 10);
    
    recentVotes.forEach(vote => {
        const row = document.createElement('tr');
        
        // Format CNIC for display (hide middle part for privacy)
        const cnicParts = vote.cnic.split('-');
        const maskedCNIC = cnicParts[0] + '-*******-' + (cnicParts[2] || '').slice(-1);
        
        row.innerHTML = `
            <td>${maskedCNIC}</td>
            <td>${vote.name}</td>
            <td>${vote.province}</td>
            <td>${vote.party}</td>
            <td>${new Date(vote.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
        `;
        
        recentVotesTable.appendChild(row);
    });
    
    // If no votes yet
    if (recentVotes.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" style="text-align: center; padding: 30px; color: var(--secondary-color);">
                <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                No votes have been cast yet. Be the first to vote!
            </td>
        `;
        recentVotesTable.appendChild(row);
    }
    
    console.log(`Results updated. Total votes: ${totalVotes}`);
}

// Set up modal
function setupModal() {
    console.log('Setting up modal...');
    
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const castAnotherBtn = document.getElementById('castAnotherBtn');
    const viewResultsModalBtn = document.getElementById('viewResultsModalBtn');
    const modalOverlay = document.getElementById('successModal');
    
    // Close modal button
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }
    
    // Cast another vote button
    if (castAnotherBtn) {
        castAnotherBtn.addEventListener('click', function() {
            closeModal();
            switchSection('vote');
        });
    }
    
    // View results button
    if (viewResultsModalBtn) {
        viewResultsModalBtn.addEventListener('click', function() {
            closeModal();
            switchSection('results');
        });
    }
    
    // Close modal when clicking outside
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    console.log('Modal setup complete');
}

// Show success modal
function showSuccessModal(vote) {
    console.log('Showing success modal...');
    
    const modalOverlay = document.getElementById('successModal');
    const modalVoterName = document.getElementById('modalVoterName');
    const modalSelectedParty = document.getElementById('modalSelectedParty');
    const modalVoteId = document.getElementById('modalVoteId');
    const modalVoteTime = document.getElementById('modalVoteTime');
    
    if (!modalOverlay) {
        console.error('Modal overlay not found');
        return;
    }
    
    // Set modal content
    if (modalVoterName) modalVoterName.textContent = vote.name;
    if (modalSelectedParty) modalSelectedParty.textContent = vote.party;
    if (modalVoteId) modalVoteId.textContent = vote.id;
    if (modalVoteTime) modalVoteTime.textContent = new Date(vote.timestamp).toLocaleTimeString();
    
    // Show modal
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    console.log('Success modal shown');
}

// Close modal
function closeModal() {
    console.log('Closing modal...');
    
    const modalOverlay = document.getElementById('successModal');
    
    if (modalOverlay) {
        modalOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    console.log('Modal closed');
}

// Update UI
function updateUI() {
    console.log('Updating UI...');
    
    // Update navigation
    updateNavigation();
    
    // Load political parties if on vote section
    if (appState.currentSection === 'vote') {
        loadPoliticalParties();
    }
    
    // Update results if on results section
    if (appState.currentSection === 'results') {
        updateResults();
    }
    
    console.log('UI updated');
}

// Initialize the application
console.log('Pakistani Voting System loading...');

// ===== SPLASH SCREEN FUNCTIONALITY =====
function initializeSplashScreen() {
    const splashScreen = document.getElementById('splashScreen');
    const loadingProgress = document.getElementById('loadingProgress');
    const loadingText = document.getElementById('loadingText');
    const loadingPercentage = document.getElementById('loadingPercentage');
    const steps = document.querySelectorAll('.step');
    
    if (!splashScreen) return;
    
    let progress = 0;
    const totalTime = 3000; // 3 seconds total loading time
    const interval = 30; // Update every 30ms
    const increment = 100 / (totalTime / interval);
    
    const messages = [
        "Initializing secure voting platform...",
        "Loading voter database...",
        "Establishing secure connection...",
        "Verifying system integrity...",
        "Loading political parties data...",
        "Setting up encryption protocols...",
        "Preparing ballot interface...",
        "Finalizing security checks...",
        "Ready to vote!"
    ];
    
    const stepIntervals = [0, 25, 50, 75]; // Percentage points for each step
    
    const progressInterval = setInterval(() => {
        progress += increment;
        
        if (progress > 100) {
            progress = 100;
            clearInterval(progressInterval);
            
            // Final update
            loadingProgress.style.width = '100%';
            loadingPercentage.textContent = '100%';
            loadingText.textContent = 'Ready to vote!';
            
            // Mark all steps as active
            steps.forEach(step => step.classList.add('active'));
            
            // Hide splash screen after delay
            setTimeout(() => {
                splashScreen.classList.add('hidden');
                
                // Remove from DOM after animation completes
                setTimeout(() => {
                    splashScreen.style.display = 'none';
                    // Initialize main app
                    initApp();
                }, 500);
            }, 800);
            
            return;
        }
        
        // Update progress bar
        loadingProgress.style.width = `${progress}%`;
        loadingPercentage.textContent = `${Math.floor(progress)}%`;
        
        // Update loading text based on progress
        const messageIndex = Math.min(
            Math.floor(progress / (100 / messages.length)), 
            messages.length - 1
        );
        loadingText.textContent = messages[messageIndex];
        
        // Update steps
        steps.forEach((step, index) => {
            if (progress >= stepIntervals[index]) {
                step.classList.add('active');
            }
        });
        
    }, interval);
    
    // Start with first message
    loadingText.textContent = messages[0];
}

// Modify your existing initApp function
function initApp() {
    console.log('Initializing main application...');
    
    // Load votes from localStorage
    loadVotesFromStorage();
    
    // Set up navigation
    setupNavigation();
    
    // Set up voting form
    setupVotingForm();
    
    // Set up results section
    setupResults();
    
    // Set up modal
    setupModal();
    
    // Update UI based on initial state
    updateUI();
    
    console.log('Main application initialized');
}

// Modify the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting splash screen...');
    initializeSplashScreen();
});