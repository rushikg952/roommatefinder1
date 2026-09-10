/**
 * Roommate Finder - 35% MVP Core JavaScript
 * Handles navigation, dummy data rendering, dynamic filtering,
 * profile creation, and profile detail modal interactions.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. Initial Dummy Data (Roommate Profiles)
  // ==========================================================================
  const initialRoommates = [
    {
      id: 1,
      name: "Abhilata building",
      age: 21,
      gender: "male",
      location: "Shirpur",
      budget: 850,
      preferredGender: "male only",
      lifestyle: "Early Riser & Quiet",
      bio: "Senior studying Computer Science at BU. Very tidy, loves making herbal tea, and keeps weeknights quiet for studying and coding projects.",
      avatar: "🌸",
      contactEmail: "maya.patel@example.edu"
    },
    {
      id: 2,
      name: "ajinkya Apartment",
      age: 24,
      gender: "Non-binary",
      location: "Jalgoan",
      budget: 1200,
      preferredGender: "Any",
      lifestyle: "Neat & Organized",
      bio: "Graphic designer working in hybrid mode. I keep common areas spotless, enjoy cooking weekend dinners, and love indie film screenings.",
      avatar: "🎨",
      contactEmail: "jordan.lee@example.com"
    },
    {
      id: 3,
      name: "Asusde Building",
      age: 22,
      gender: "Female",
      location: "Austin, TX",
      budget: 750,
      preferredGender: "Any",
      lifestyle: "Pet-Friendly & Relaxed",
      bio: "Grad student with an affectionate, well-trained tabby cat named Mochi. Passionate about live music, park runs, and baking sourdough.",
      avatar: "🐱",
      contactEmail: "samira.k@example.com"
    },
    {
      id: 4,
      name: "GADHE villa",
      age: 23,
      gender: "ANY",
      location: "Chicago, IL",
      budget: 5000,
      preferredGender: "ANY",
      lifestyle: "Social & Active",
      bio: "Junior financial analyst who enjoys gym sessions, basketball, and trying new local diners. Respectful of quiet hours and always pays bills early.",
      avatar: "🏀",
      contactEmail: "lucas.rivera@example.com"
    },
    {
      id: 5,
      name: "Chloe Bennett",
      age: 20,
      gender: "Female",
      location: "San Francisco, CA",
      budget: 1400,
      preferredGender: "Female only",
      lifestyle: "Early Riser & Quiet",
      bio: "Bioengineering sophomore. Spends most days in labs or campus libraries. Looking for a calm, friendly flatmate for a shared 2-bed apartment.",
      avatar: "🔬",
      contactEmail: "chloe.b@example.edu"
    },
    {
      id: 6,
      name: "David Kim",
      age: 25,
      gender: "Male",
      location: "Seattle, WA",
      budget: 1100,
      preferredGender: "Any",
      lifestyle: "Night Owl & Studious",
      bio: "Software developer and hobbyist music producer (always with headphones on!). Enjoys bouldering, board games, and weekend hiking trips.",
      avatar: "🎧",
      contactEmail: "david.kim@example.com"
    }
  ];

  // In-memory profiles list (persisted in localStorage for convenience during testing)
  let roommates = [];
  const storedProfiles = localStorage.getItem('rf_roommates');
  if (storedProfiles) {
    try {
      roommates = JSON.parse(storedProfiles);
    } catch (e) {
      roommates = [...initialRoommates];
    }
  } else {
    roommates = [...initialRoommates];
  }

  // ==========================================================================
  // 2. DOM Elements Selection
  // ==========================================================================
  // Navigation elements
  const navLinks = document.querySelectorAll('.nav-link');
  const viewSections = document.querySelectorAll('.view-section');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const directViewTriggers = document.querySelectorAll('[data-view]');

  // Search & Filter elements
  const filterLocation = document.getElementById('filter-location');
  const filterBudget = document.getElementById('filter-budget');
  const budgetValueDisplay = document.getElementById('budget-value-display');
  const resetFiltersBtn = document.getElementById('reset-filters-btn');
  const noResultsResetBtn = document.getElementById('no-results-reset-btn');
  const roommatesGrid = document.getElementById('roommates-grid');
  const resultsCount = document.getElementById('results-count');
  const noResultsBox = document.getElementById('no-results');

  // Modal elements
  const profileModal = document.getElementById('profile-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalDismissBtn = document.getElementById('modal-dismiss-btn');
  const modalContactBtn = document.getElementById('modal-contact-btn');
  const contactFeedback = document.getElementById('contact-feedback');
  const modalAvatar = document.getElementById('modal-avatar');
  const modalName = document.getElementById('modal-name');
  const modalLocation = document.getElementById('modal-location');
  const modalBudget = document.getElementById('modal-budget');
  const modalGender = document.getElementById('modal-gender');
  const modalPrefGender = document.getElementById('modal-pref-gender');
  const modalLifestyle = document.getElementById('modal-lifestyle');
  const modalBio = document.getElementById('modal-bio');
  const contactEmail = document.getElementById('contact-email');

  // Profile Form elements
  const profileForm = document.getElementById('profile-form');
  const formAlert = document.getElementById('form-alert');

  // Currently viewed profile tracker
  let activeSelectedRoommate = null;

  // ==========================================================================
  // 3. Navigation & View Routing
  // ==========================================================================
  function switchView(viewName, updateHash = true) {
    // Hide all view sections
    viewSections.forEach(section => section.classList.remove('active'));

    // Highlight corresponding section
    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Update active state on nav links
    navLinks.forEach(link => {
      if (link.getAttribute('data-view') === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update URL hash for direct bookmarking/linking
    if (updateHash && window.location.hash !== `#${viewName}`) {
      window.location.hash = viewName;
    }

    // Close mobile menu if open
    if (navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // If switching to search, refresh cards
    if (viewName === 'search') {
      applyFiltersAndRender();
    }
  }

  function handleHashRouting() {
    const hash = window.location.hash.replace('#', '').trim().toLowerCase();
    if (['home', 'search', 'create'].includes(hash)) {
      switchView(hash, false);
    } else {
      switchView('home', false);
    }
  }

  // Handle URL hash changes (e.g. browser back/forward buttons or direct links)
  window.addEventListener('hashchange', handleHashRouting);

  // Bind clicks for all elements with data-view attribute
  directViewTriggers.forEach(element => {
    element.addEventListener('click', (e) => {
      e.preventDefault();
      const targetView = element.getAttribute('data-view');
      if (targetView) {
        switchView(targetView);
      }
    });
  });

  // Mobile menu toggle
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }

  // ==========================================================================
  // 4. Roommate Rendering & Filtering
  // ==========================================================================
  function getFilteredRoommates() {
    const selectedLocation = filterLocation.value;
    const maxBudget = parseInt(filterBudget.value, 10);

    return roommates.filter(roommate => {
      // Location check
      const matchesLocation =
        selectedLocation === 'all' ||
        roommate.location.toLowerCase().includes(selectedLocation.toLowerCase());

      // Budget check
      const matchesBudget = roommate.budget <= maxBudget;

      return matchesLocation && matchesBudget;
    });
  }

  function renderRoommateCards(profiles) {
    roommatesGrid.innerHTML = '';

    if (profiles.length === 0) {
      roommatesGrid.classList.add('hidden');
      noResultsBox.classList.remove('hidden');
      resultsCount.textContent = 'No matching roommates found.';
      return;
    }

    roommatesGrid.classList.remove('hidden');
    noResultsBox.classList.add('hidden');
    resultsCount.textContent = `Showing ${profiles.length} available ${profiles.length === 1 ? 'roommate' : 'roommates'}`;

    profiles.forEach(profile => {
      const card = document.createElement('div');
      card.className = 'roommate-card';
      card.innerHTML = `
        <div class="card-top">
          <div class="card-avatar">${profile.avatar || '👤'}</div>
          <div class="card-title-group">
            <h3>${escapeHtml(profile.name)}, ${profile.age}</h3>
            <span class="card-location">📍 ${escapeHtml(profile.location)}</span>
          </div>
        </div>

        <div class="card-meta-pills">
          <span class="tag tag-budget">$${profile.budget}/mo</span>
          <span class="tag tag-lifestyle">${escapeHtml(profile.lifestyle)}</span>
        </div>

        <p class="card-bio">${escapeHtml(profile.bio)}</p>

        <div class="card-footer">
          <button class="btn btn-outline btn-sm btn-block view-profile-btn" data-id="${profile.id}">
            View Profile & Details
          </button>
        </div>
      `;

      // Attach click event to View Profile button
      const viewBtn = card.querySelector('.view-profile-btn');
      viewBtn.addEventListener('click', () => openProfileModal(profile.id));

      roommatesGrid.appendChild(card);
    });
  }

  function applyFiltersAndRender() {
    const filtered = getFilteredRoommates();
    renderRoommateCards(filtered);
  }

  // Budget slider event listener
  filterBudget.addEventListener('input', (e) => {
    budgetValueDisplay.textContent = `$${e.target.value}/mo`;
    applyFiltersAndRender();
  });

  // Location filter event listener
  filterLocation.addEventListener('change', () => {
    applyFiltersAndRender();
  });

  // Reset filters
  function resetFilters() {
    filterLocation.value = 'all';
    filterBudget.value = 2000;
    budgetValueDisplay.textContent = `$2000/mo`;
    applyFiltersAndRender();
  }

  resetFiltersBtn.addEventListener('click', resetFilters);
  noResultsResetBtn.addEventListener('click', resetFilters);

  // ==========================================================================
  // 5. Profile Details Modal Logic
  // ==========================================================================
  function openProfileModal(profileId) {
    const profile = roommates.find(r => r.id === profileId);
    if (!profile) return;

    activeSelectedRoommate = profile;

    // Populate modal values
    modalAvatar.textContent = profile.avatar || '👤';
    modalName.textContent = `${profile.name}, ${profile.age}`;
    modalLocation.textContent = `📍 ${profile.location}`;
    modalBudget.textContent = `$${profile.budget}/mo`;
    modalGender.textContent = profile.gender;
    modalPrefGender.textContent = profile.preferredGender;
    modalLifestyle.textContent = profile.lifestyle;
    modalBio.textContent = profile.bio;

    // Reset contact box
    contactFeedback.classList.add('hidden');
    modalContactBtn.textContent = `✉️ Contact ${profile.name.split(' ')[0]}`;
    contactEmail.textContent = profile.contactEmail || `${profile.name.toLowerCase().replace(/\s+/g, '.')}@example.com`;

    // Show modal
    profileModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // prevent background scrolling
  }

  function closeProfileModal() {
    profileModal.classList.add('hidden');
    document.body.style.overflow = '';
    activeSelectedRoommate = null;
  }

  modalCloseBtn.addEventListener('click', closeProfileModal);
  modalDismissBtn.addEventListener('click', closeProfileModal);

  // Close when clicking outside the modal dialog
  profileModal.addEventListener('click', (e) => {
    if (e.target === profileModal) {
      closeProfileModal();
    }
  });

  // Close on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !profileModal.classList.contains('hidden')) {
      closeProfileModal();
    }
  });

  // Contact Roommate button (Simulated contact action)
  modalContactBtn.addEventListener('click', () => {
    contactFeedback.classList.remove('hidden');
    modalContactBtn.textContent = '✓ Message Sent (Demo)';
  });

  // ==========================================================================
  // 6. User Profile Form Submission & Validation
  // ==========================================================================
  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset error messages
    clearFormErrors();

    // Get form inputs
    const nameInput = document.getElementById('user-name');
    const ageInput = document.getElementById('user-age');
    const genderInput = document.getElementById('user-gender');
    const locationInput = document.getElementById('user-location');
    const budgetInput = document.getElementById('user-budget');
    const prefGenderInput = document.getElementById('user-pref-gender');
    const lifestyleInput = document.getElementById('user-lifestyle');
    const bioInput = document.getElementById('user-bio');

    let isValid = true;

    // Validation checks
    if (!nameInput.value.trim()) {
      showFieldError('error-name', nameInput, 'Please enter your full name.');
      isValid = false;
    }

    const ageVal = parseInt(ageInput.value, 10);
    if (isNaN(ageVal) || ageVal < 17 || ageVal > 99) {
      showFieldError('error-age', ageInput, 'Please enter a valid age (17-99).');
      isValid = false;
    }

    if (!genderInput.value) {
      showFieldError('error-gender', genderInput, 'Please select your gender.');
      isValid = false;
    }

    if (!locationInput.value.trim()) {
      showFieldError('error-location', locationInput, 'Please enter your city / location.');
      isValid = false;
    }

    const budgetVal = parseInt(budgetInput.value, 10);
    if (isNaN(budgetVal) || budgetVal <= 0) {
      showFieldError('error-budget', budgetInput, 'Please enter a valid monthly budget.');
      isValid = false;
    }

    if (!lifestyleInput.value) {
      showFieldError('error-lifestyle', lifestyleInput, 'Please select a primary lifestyle preference.');
      isValid = false;
    }

    if (!bioInput.value.trim() || bioInput.value.trim().length < 10) {
      showFieldError('error-bio', bioInput, 'Please write a short bio (at least 10 characters).');
      isValid = false;
    }

    if (!isValid) return;

    // Build new profile object
    const newProfile = {
      id: Date.now(),
      name: nameInput.value.trim(),
      age: ageVal,
      gender: genderInput.value,
      location: locationInput.value.trim(),
      budget: budgetVal,
      preferredGender: prefGenderInput.value,
      lifestyle: lifestyleInput.value,
      bio: bioInput.value.trim(),
      avatar: getAvatarForGender(genderInput.value),
      contactEmail: `${nameInput.value.trim().toLowerCase().replace(/\s+/g, '.')}@example.com`
    };

    // Prepend to profiles list so user can see it right away
    roommates.unshift(newProfile);
    try {
      localStorage.setItem('rf_roommates', JSON.stringify(roommates));
    } catch (err) {
      // localStorage may fail in some sandboxed environments, in-memory array works
    }

    // Add city to location dropdown filter if not present
    addLocationOptionIfNew(newProfile.location);

    // Show success message
    formAlert.textContent = `🎉 Profile created successfully! We added "${newProfile.name}" to the roommate listings.`;
    formAlert.className = 'alert alert-success';
    formAlert.classList.remove('hidden');

    // Reset the form
    profileForm.reset();

    // After 1.5 seconds, redirect user to search page so they can view their card
    setTimeout(() => {
      formAlert.classList.add('hidden');
      resetFilters();
      switchView('search');
    }, 1500);
  });

  function showFieldError(errorSpanId, inputElement, message) {
    const errorSpan = document.getElementById(errorSpanId);
    if (errorSpan) errorSpan.textContent = message;
    if (inputElement) inputElement.classList.add('error');
  }

  function clearFormErrors() {
    const errorSpans = document.querySelectorAll('.field-error');
    errorSpans.forEach(span => span.textContent = '');

    const errorInputs = document.querySelectorAll('.form-control.error');
    errorInputs.forEach(input => input.classList.remove('error'));
  }

  function getAvatarForGender(gender) {
    const avatars = ['🌟', '🎒', '✨', '☕', '🚀', '🌿', '🎧'];
    return avatars[Math.floor(Math.random() * avatars.length)];
  }

  function addLocationOptionIfNew(locationName) {
    const options = Array.from(filterLocation.options).map(opt => opt.value.toLowerCase());
    if (!options.includes(locationName.toLowerCase())) {
      const newOption = document.createElement('option');
      newOption.value = locationName;
      newOption.textContent = locationName;
      filterLocation.appendChild(newOption);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================================================
  // 7. Initial Initialization
  // ==========================================================================
  // Render search cards and activate view according to URL hash (e.g. #search)
  applyFiltersAndRender();
  handleHashRouting();

});
