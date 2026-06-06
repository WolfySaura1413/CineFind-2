const STORAGE_KEYS = {
  user: 'cinefind_user',
  users: 'cinefind_users',
  watchlists: 'cinefind_watchlists',
  watched: 'cinefind_watched',
  reviews: 'cinefind_reviews',
};

const SAMPLE_TITLES = [
  {
    id: 3021,
    name: 'Skyline Chase',
    type: 'movie',
    year: 2024,
    poster: 'https://via.placeholder.com/400x600?text=Skyline+Chase',
    rating: 4,
    genres: ['Action', 'Adventure'],
    overview: 'A high-speed rescue mission across an urban skyline.',
  },
  {
    id: 4232,
    name: 'Midnight Harvest',
    type: 'tv_series',
    year: 2023,
    poster: 'https://via.placeholder.com/400x600?text=Midnight+Harvest',
    rating: 5,
    genres: ['Drama', 'Mystery'],
    overview: 'A small town secrets thriller with a festival at its heart.',
  },
  {
    id: 5187,
    name: 'Neon Alley',
    type: 'movie',
    year: 2025,
    poster: 'https://via.placeholder.com/400x600?text=Neon+Alley',
    rating: 3,
    genres: ['Sci-Fi', 'Crime'],
    overview: 'An investigator chases a missing AI through a neon metropolis.',
  },
];

const STREAMING_SAMPLES = [
  { name: 'Netflix', type: 'flatrate' },
  { name: 'Hulu', type: 'flatrate' },
  { name: 'Amazon', type: 'buy' },
];

const state = {
  currentUser: null,
  activeView: 'home',
  previousView: 'home',
  selectedList: 'watchlist',
  cachedConfig: null,
};

const elements = {
  appStatus: document.getElementById('appStatus'),
  homeSearchInput: document.getElementById('homeSearchInput'),
  homeSearchButton: document.getElementById('homeSearchButton'),
  refreshTrending: document.getElementById('refreshTrending'),
  trendingGrid: document.getElementById('trendingGrid'),
  searchInput: document.getElementById('searchInput'),
  searchButton: document.getElementById('searchButton'),
  searchStatus: document.getElementById('searchStatus'),
  searchResults: document.getElementById('searchResults'),
  detailView: document.getElementById('detailView'),
  detailBack: document.getElementById('detailBack'),
  detailCard: document.getElementById('detailCard'),
  listItems: document.getElementById('listItems'),
  watchlistTab: document.getElementById('watchlistTab'),
  watchedTab: document.getElementById('watchedTab'),
  profileContent: document.getElementById('profileContent'),
  tabButtons: Array.from(document.querySelectorAll('.tab-button')),
};

function getStoredValue(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch {
    return fallback;
  }
}

function saveStoredValue(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadUser() {
  state.currentUser = getStoredValue(STORAGE_KEYS.user, null);
}

function saveUser(user) {
  state.currentUser = user;
  saveStoredValue(STORAGE_KEYS.user, user);
}

function getUserKey() {
  return state.currentUser?.email ?? 'guest';
}

function getList(listName) {
  const all = getStoredValue(STORAGE_KEYS[listName], {});
  return all[getUserKey()] || [];
}

function saveList(listName, list) {
  const all = getStoredValue(STORAGE_KEYS[listName], {});
  all[getUserKey()] = list;
  saveStoredValue(STORAGE_KEYS[listName], all);
}

function getReviews() {
  const all = getStoredValue(STORAGE_KEYS.reviews, {});
  return all[getUserKey()] || {};
}

function saveReviews(reviews) {
  const all = getStoredValue(STORAGE_KEYS.reviews, {});
  all[getUserKey()] = reviews;
  saveStoredValue(STORAGE_KEYS.reviews, all);
}

function setStatus(message, type = 'info') {
  elements.appStatus.textContent = message;
  elements.appStatus.style.color = type === 'error' ? '#b91c1c' : type === 'success' ? 'var(--confirm)' : 'var(--primary-strong)';
}

function clearStatus() {
  elements.appStatus.textContent = '';
}

function formatStars(value) {
  return Array.from({ length: 5 }, (_, index) => (index < value ? '★' : '☆')).join('');
}

function createCard(item, options = {}) {
  const card = document.createElement('article');
  card.className = 'card';

  const poster = document.createElement('img');
  poster.src = item.poster || `https://via.placeholder.com/400x600?text=${encodeURIComponent(item.name)}`;
  poster.alt = item.name;
  card.appendChild(poster);

  const body = document.createElement('div');
  body.className = 'card-body';

  const title = document.createElement('h3');
  title.className = 'card-title';
  title.textContent = item.name;
  body.appendChild(title);

  const meta = document.createElement('p');
  meta.className = 'card-meta';
  meta.textContent = `${item.type === 'tv_series' ? 'TV Series' : 'Movie'} · ${item.year || 'TBD'}`;
  body.appendChild(meta);

  const rating = document.createElement('div');
  rating.className = 'stars';
  rating.textContent = formatStars(item.rating || 4);
  body.appendChild(rating);

  const streaming = document.createElement('div');
  streaming.className = 'streaming-list';
  (options.sources || STREAMING_SAMPLES).slice(0, 3).forEach((source) => {
    const pill = document.createElement('span');
    pill.className = 'streaming-pill';
    pill.textContent = source.name;
    streaming.appendChild(pill);
  });
  body.appendChild(streaming);

  card.appendChild(body);

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const detailButton = document.createElement('button');
  detailButton.className = 'secondary-button';
  detailButton.textContent = 'View details';
  detailButton.addEventListener('click', () => showDetail(item));
  actions.appendChild(detailButton);

  const watchButton = document.createElement('button');
  watchButton.className = 'primary-button';
  watchButton.textContent = 'Save';
  watchButton.addEventListener('click', () => addToList('watchlist', item));
  actions.appendChild(watchButton);

  card.appendChild(actions);
  return card;
}

async function loadConfig() {
  if (state.cachedConfig) {
    return state.cachedConfig;
  }

  try {
    const module = await import('./config.js');
    state.cachedConfig = {
      apiKey1: module.WATCHMODE_API_KEY_1,
      apiKey2: module.WATCHMODE_API_KEY_2,
      baseUrl: module.WATCHMODE_BASE_URL,
    };
  } catch {
    state.cachedConfig = { apiKey1: '', apiKey2: '', baseUrl: 'https://api.watchmode.com/v1' };
  }

  return state.cachedConfig;
}

async function fetchWatchmode(path, useFallback = false) {
  const config = await loadConfig();
  const apiKey = useFallback ? config.apiKey2 : config.apiKey1;

  if (!apiKey) {
    throw new Error('Watchmode API key is not configured. Copy config.example.js to config.js and fill in your key.');
  }

  const separator = path.includes('?') ? '&' : '?';
  const url = `${config.baseUrl}${path}${separator}apiKey=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 429 && config.apiKey2 && !useFallback) {
      return fetchWatchmode(path, true);
    }
    throw new Error('Watchmode request failed.');
  }

  return response.json();
}

async function fetchTrending() {
  try {
    const data = await fetchWatchmode('/list-titles/?sort_by=popularity_desc&page=1&limit=12');
    return (data.results || data.title_results || []).map((item) => ({
      id: item.id,
      name: item.name || item.title || item.title_name,
      poster: item.poster || item.image || item.backdrop || `https://via.placeholder.com/400x600?text=${encodeURIComponent(item.name || item.title)}`,
      type: item.type || 'movie',
      year: item.release_year || item.year || 'TBD',
      rating: 4,
      overview: item.overview || item.plot_overview || '',
    })).slice(0, 8);
  } catch (error) {
    console.warn(error.message);
    return SAMPLE_TITLES;
  }
}

async function searchTitles(query) {
  if (!query || query.trim().length < 2) {
    setStatus('Please enter at least two characters to search.', 'error');
    return [];
  }

  setStatus('Searching titles...');
  try {
    const data = await fetchWatchmode(`/search/?search_field=name&search_value=${encodeURIComponent(query)}&types=movie,tv_movie,tv_series`);
    const results = (data.results || []).map((item) => ({
      id: item.id,
      name: item.name || item.title || item.title_name,
      poster: item.poster || item.image || `https://via.placeholder.com/400x600?text=${encodeURIComponent(item.name || item.title)}`,
      type: item.type || 'movie',
      year: item.release_year || item.year || 'TBD',
      rating: 4,
      overview: item.overview || item.plot_overview || '',
    }));

    clearStatus();
    return results.length ? results : SAMPLE_TITLES.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
  } catch (error) {
    console.warn(error.message);
    setStatus('Unable to reach Watchmode. Showing local sample results.', 'error');
    return SAMPLE_TITLES.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()));
  }
}

async function fetchTitleDetails(id) {
  try {
    const data = await fetchWatchmode(`/title/${id}/details/`);
    return {
      id: data.id,
      name: data.title || data.name,
      poster: data.poster || data.image || `https://via.placeholder.com/400x600?text=${encodeURIComponent(data.title || data.name)}`,
      type: data.type || 'movie',
      year: data.year || data.release_year || 'TBD',
      rating: data.user_rating || 4,
      genres: data.genres?.map((genre) => genre.name) || [],
      overview: data.plot_overview || data.overview || '',
      runtime: data.runtime_minutes || data.length || null,
      releaseDate: data.release_date || null,
    };
  } catch (error) {
    console.warn(error.message);
    return SAMPLE_TITLES.find((item) => item.id === Number(id)) || SAMPLE_TITLES[0];
  }
}

async function fetchSources(id) {
  try {
    const data = await fetchWatchmode(`/title/${id}/sources/?region=US`);
    return data.sources?.slice(0, 4).map((source) => ({
      name: source.name,
      type: source.type,
      url: source.deeplink_android || source.deeplink_ios || source.web_url || '',
    })) || [];
  } catch (error) {
    console.warn(error.message);
    return STREAMING_SAMPLES;
  }
}

function renderList(listName) {
  const items = getList(listName);
  elements.listItems.innerHTML = '';

  if (items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'card-empty';
    empty.textContent = listName === 'watchlist' ? 'Your Watch List is empty.' : 'Your Watched list is empty.';
    elements.listItems.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const card = createCard(item, { sources: STREAMING_SAMPLES });
    const action = card.querySelector('.primary-button');
    action.textContent = listName === 'watchlist' ? 'Mark watched' : 'Remove';
    action.addEventListener('click', () => {
      if (listName === 'watchlist') {
        addToList('watched', item);
        removeFromList('watchlist', item.id);
      } else {
        removeFromList('watched', item.id);
      }
    });
    elements.listItems.appendChild(card);
  });
}

function ensureLoggedIn() {
  if (!state.currentUser) {
    setStatus('Sign in first to save lists and reviews.', 'error');
    showView('profile');
    return false;
  }
  return true;
}

function addToList(listName, item) {
  if (!ensureLoggedIn()) {
    return;
  }

  const current = getList(listName);
  if (current.some((entry) => entry.id === item.id)) {
    setStatus(`${item.name} is already in your ${listName === 'watchlist' ? 'Watch List' : 'Watched'} list.`, 'error');
    return;
  }

  const entry = {
    id: item.id,
    name: item.name,
    poster: item.poster,
    type: item.type,
    year: item.year,
    rating: item.rating,
  };

  saveList(listName, [...current, entry]);
  setStatus(`${entry.name} added to ${listName === 'watchlist' ? 'Watch List' : 'Watched list'}.`, 'success');
  if (state.activeView === 'lists') {
    renderList(state.selectedList);
  }
}

function removeFromList(listName, id) {
  const current = getList(listName).filter((item) => item.id !== Number(id));
  saveList(listName, current);
  setStatus(listName === 'watched' ? 'Removed from Watched.' : 'Removed from Watch List.', 'success');
  if (state.activeView === 'lists') {
    renderList(state.selectedList);
  }
}

function buildStreamingMarkup(sources) {
  if (!sources || sources.length === 0) {
    const empty = document.createElement('p');
    empty.textContent = 'Not currently available to stream.';
    return empty;
  }

  const container = document.createElement('div');
  container.className = 'streaming-list';
  sources.forEach((source) => {
    const pill = document.createElement('a');
    pill.className = 'streaming-pill';
    pill.href = source.url || '#';
    pill.target = '_blank';
    pill.rel = 'noreferrer noopener';
    pill.textContent = source.name;
    container.appendChild(pill);
  });
  return container;
}

function buildReviewSection(titleId) {
  const reviews = getReviews();
  const existing = reviews[titleId] || { rating: 0, body: '', isPublic: false };

  const section = document.createElement('div');
  section.className = 'section-block';

  const header = document.createElement('h3');
  header.textContent = 'Your review';
  section.appendChild(header);

  const ratingLabel = document.createElement('label');
  ratingLabel.textContent = 'Rating';
  const ratingInput = document.createElement('input');
  ratingInput.type = 'number';
  ratingInput.min = '1';
  ratingInput.max = '5';
  ratingInput.value = existing.rating || 4;
  ratingInput.style.maxWidth = '120px';
  ratingInput.required = true;
  section.appendChild(ratingLabel);
  section.appendChild(ratingInput);

  const bodyLabel = document.createElement('label');
  bodyLabel.textContent = 'Review (optional)';
  const reviewBody = document.createElement('textarea');
  reviewBody.value = existing.body || '';
  section.appendChild(bodyLabel);
  section.appendChild(reviewBody);

  const publicLabel = document.createElement('label');
  const publicCheckbox = document.createElement('input');
  publicCheckbox.type = 'checkbox';
  publicCheckbox.checked = existing.isPublic;
  publicLabel.appendChild(publicCheckbox);
  publicLabel.appendChild(document.createTextNode(' Make review public'));
  section.appendChild(publicLabel);

  const saveButton = document.createElement('button');
  saveButton.className = 'primary-button';
  saveButton.textContent = 'Save review';
  saveButton.addEventListener('click', () => {
    if (!ensureLoggedIn()) {
      return;
    }
    const rating = Number(ratingInput.value) || 1;
    const body = reviewBody.value.trim();
    const isPublic = publicCheckbox.checked;
    const updated = { rating, body, isPublic, updatedAt: new Date().toISOString() };
    const all = getReviews();
    all[titleId] = updated;
    saveReviews(all);
    setStatus('Your review has been saved.', 'success');
  });
  section.appendChild(saveButton);

  return section;
}

async function showDetail(item) {
  state.previousView = state.activeView;
  showView('detail');
  elements.detailCard.innerHTML = '<p>Loading details…</p>';

  const details = await fetchTitleDetails(item.id);
  const sources = await fetchSources(item.id);

  elements.detailCard.innerHTML = '';
  const detailGrid = document.createElement('div');
  detailGrid.className = 'detail-grid';

  const poster = document.createElement('img');
  poster.className = 'detail-poster';
  poster.src = details.poster;
  poster.alt = details.name;

  const info = document.createElement('div');
  info.className = 'detail-info';

  const title = document.createElement('h2');
  title.className = 'detail-title';
  title.textContent = details.name;
  info.appendChild(title);

  const meta = document.createElement('p');
  meta.className = 'detail-meta';
  meta.innerHTML = `${details.year} · ${details.type === 'tv_series' ? 'TV Series' : 'Movie'} · ${details.genres?.join(', ') || 'Genre unavailable'}`;
  info.appendChild(meta);

  const rating = document.createElement('div');
  rating.className = 'stars';
  rating.textContent = formatStars(details.rating || 4);
  info.appendChild(rating);

  const overview = document.createElement('p');
  overview.textContent = details.overview || 'Synopsis unavailable.';
  info.appendChild(overview);

  const sourceSection = document.createElement('div');
  sourceSection.className = 'details-section';
  const sourceHeader = document.createElement('h3');
  sourceHeader.textContent = 'Where to watch';
  sourceSection.appendChild(sourceHeader);
  sourceSection.appendChild(buildStreamingMarkup(sources));
  info.appendChild(sourceSection);

  const actions = document.createElement('div');
  actions.className = 'detail-actions';

  const saveButton = document.createElement('button');
  saveButton.className = 'primary-button';
  saveButton.textContent = 'Add to Watch List';
  saveButton.addEventListener('click', () => addToList('watchlist', details));
  actions.appendChild(saveButton);

  const watchedButton = document.createElement('button');
  watchedButton.className = 'secondary-button';
  watchedButton.textContent = 'Mark as Watched';
  watchedButton.addEventListener('click', () => addToList('watched', details));
  actions.appendChild(watchedButton);

  info.appendChild(actions);
  info.appendChild(buildReviewSection(details.id));

  detailGrid.appendChild(poster);
  detailGrid.appendChild(info);
  elements.detailCard.appendChild(detailGrid);
}

function showView(view) {
  state.activeView = view;
  document.querySelectorAll('.view').forEach((section) => {
    section.classList.toggle('active', section.id === `${view}View`);
  });

  elements.tabButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.view === view);
  });

  clearStatus();

  if (view === 'home') {
    loadTrending();
  }

  if (view === 'lists') {
    if (!ensureLoggedIn()) {
      return;
    }
    renderList(state.selectedList);
  }

  if (view === 'profile') {
    renderProfile();
  }
}

async function loadTrending() {
  elements.trendingGrid.innerHTML = '<p>Loading trending titles…</p>';
  const trending = await fetchTrending();
  elements.trendingGrid.innerHTML = '';
  trending.forEach((item) => {
    elements.trendingGrid.appendChild(createCard(item));
  });
}

async function doSearch() {
  const query = elements.searchInput.value.trim() || elements.homeSearchInput.value.trim();
  if (!query) {
    setStatus('Search query cannot be empty.', 'error');
    return;
  }

  showView('search');
  elements.searchResults.innerHTML = '<p>Searching…</p>';
  const results = await searchTitles(query);
  elements.searchResults.innerHTML = '';

  if (!results.length) {
    elements.searchStatus.textContent = 'No results found.';
    return;
  }

  elements.searchStatus.textContent = `Showing ${results.length} results.`;
  results.forEach((item) => {
    elements.searchResults.appendChild(createCard(item));
  });
}

function renderProfile() {
  const container = document.createElement('div');
  if (state.currentUser) {
    container.className = 'profile-card';
    container.innerHTML = `
      <h2>Welcome back</h2>
      <p>You are signed in as <strong>${state.currentUser.email}</strong>.</p>
      <p>Use the My Lists tab to manage saved titles and mark watched items.</p>
    `;
    const logoutButton = document.createElement('button');
    logoutButton.className = 'secondary-button';
    logoutButton.textContent = 'Logout';
    logoutButton.addEventListener('click', () => {
      saveUser(null);
      setStatus('Signed out successfully.', 'success');
      renderProfile();
    });
    container.appendChild(logoutButton);
  } else {
    container.className = 'login-card';
    container.innerHTML = `
      <h2>Sign in or create account</h2>
      <p>Static sign-in stores your profile locally in this browser.</p>
    `;

    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.placeholder = 'Email address';
    emailInput.required = true;

    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.placeholder = 'Password';
    passwordInput.required = true;

    const signInButton = document.createElement('button');
    signInButton.className = 'primary-button';
    signInButton.textContent = 'Sign in / Register';
    signInButton.addEventListener('click', () => {
      const email = emailInput.value.trim().toLowerCase();
      const password = passwordInput.value.trim();
      if (!email || !password) {
        setStatus('Email and password are required.', 'error');
        return;
      }
      const users = getStoredValue(STORAGE_KEYS.users, {});
      if (users[email] && users[email] !== password) {
        setStatus('Password does not match our records.', 'error');
        return;
      }
      users[email] = password;
      saveStoredValue(STORAGE_KEYS.users, users);
      saveUser({ email });
      setStatus('Signed in successfully.', 'success');
      renderProfile();
    });

    container.appendChild(emailInput);
    container.appendChild(passwordInput);
    container.appendChild(signInButton);
  }

  elements.profileContent.innerHTML = '';
  elements.profileContent.appendChild(container);
}

function wireEvents() {
  elements.tabButtons.forEach((button) => {
    button.addEventListener('click', () => showView(button.dataset.view));
  });

  elements.homeSearchButton.addEventListener('click', doSearch);
  elements.searchButton.addEventListener('click', doSearch);
  elements.refreshTrending.addEventListener('click', loadTrending);
  elements.detailBack.addEventListener('click', () => showView(state.previousView || 'home'));
  elements.watchlistTab.addEventListener('click', () => {
    state.selectedList = 'watchlist';
    elements.watchlistTab.classList.add('active');
    elements.watchedTab.classList.remove('active');
    renderList('watchlist');
  });
  elements.watchedTab.addEventListener('click', () => {
    state.selectedList = 'watched';
    elements.watchedTab.classList.add('active');
    elements.watchlistTab.classList.remove('active');
    renderList('watched');
  });
}

function initialize() {
  loadUser();
  wireEvents();
  showView('home');
}

initialize();
