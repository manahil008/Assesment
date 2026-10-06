const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f1f5f9'/%3E%3Cpath d='M260 180 L340 180 L300 220 Z' fill='%2394a3b8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%2364748b'%3EImage Unavailable%3C/text%3E%3C/svg%3E";

const mockEventsData = [
    {
        id: "evt-101",
        title: "Full-Stack Web Performance & Edge Computing Masterclass",
        organizer: "DevPulse Academy",
        date: "2026-11-15",
        category: "Tech",
        status: "Upcoming",
        image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
        description: "Join industry experts to explore modern frontend caching, serverless edge functions, WebAssembly optimizations, and streaming rendering techniques to boost page speeds by 300%."
    },
    {
        id: "evt-102",
        title: "Design Systems at Scale: Figma to Production Components",
        organizer: "UX Design Guild",
        date: "2026-10-28",
        category: "Design",
        status: "Upcoming",
        image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=600&q=80",
        description: "Learn how top tech organizations create unified design tokens, accessible color palettes, auto-layout UI component libraries, and automated design handoff pipelines."
    },
    {
        id: "evt-103",
        title: "Generative AI Integration with LangChain & Large Language Models for Enterprise Applications and Automated Workflow Pipelines",
        organizer: "AI Researchers Lab",
        date: "2026-09-12",
        category: "AI/ML",
        status: "Completed",
        image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80",
        description: "An intensive hands-on lab building custom vector store databases, Retrieval-Augmented Generation (RAG) agentic pipelines, prompt engineering patterns, and enterprise fine-tuning."
    },
    {
        id: "evt-104",
        title: "Product-Led Growth & SaaS Metrics Workshop",
        organizer: "SaaS Builders Network",
        date: "2026-08-04",
        category: "Business",
        status: "Completed",
        image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=600&q=80",
        description: "Deconstruct key growth loops, activation funnel retention, churn reduction tactics, and pricing strategies used by high-velocity B2B SaaS start-ups."
    },
    {
        id: "evt-105",
        title: "Cybersecurity Bootcamp: Threat Intelligence & Zero Trust",
        organizer: "SecOps Global",
        date: "2026-11-02",
        category: "Tech",
        status: "Cancelled",
        image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80",
        description: "Understanding Zero Trust network architecture, identity provider security, API penetration testing, and real-time incident response protocols."
    }
];

const state = {
    events: Array.isArray(mockEventsData) ? [...mockEventsData] : [],
    searchQuery: "",
    selectedStatus: "All",
    selectedCategory: "All"
};

const elements = {
    eventsGrid: document.getElementById('events-grid'),
    noResults: document.getElementById('no-results'),
    searchInput: document.getElementById('search-input'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    resetFiltersBtn: document.getElementById('reset-filters-btn'),
    noResultsResetBtn: document.getElementById('no-results-reset-btn'),
    statusContainer: document.getElementById('status-pill-container'),
    categorySelect: document.getElementById('category-select'),
    statTotal: document.getElementById('stat-total'),
    statShowing: document.getElementById('stat-showing'),
    activeFilterIndicator: document.getElementById('active-filter-indicator'),
    modal: document.getElementById('event-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalImage: document.getElementById('modal-image'),
    modalCategory: document.getElementById('modal-category-badge'),
    modalStatus: document.getElementById('modal-status-badge'),
    modalDate: document.getElementById('modal-date'),
    modalOrganizer: document.getElementById('modal-organizer'),
    modalDescription: document.getElementById('modal-description'),
    closeModalBtn: document.getElementById('close-modal-btn')
};

function escapeHTML(str) {
    if (!str || typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, match => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[match]));
}

function getFilteredEvents() {
    const query = state.searchQuery.trim().toLowerCase();

    return state.events.filter(event => {
        if (!event) return false;

        const title = (event.title || '').toLowerCase();
        const organizer = (event.organizer || '').toLowerCase();
        const description = (event.description || '').toLowerCase();

        const matchesSearch = !query ||
            title.includes(query) ||
            organizer.includes(query) ||
            description.includes(query);

        const matchesStatus = state.selectedStatus === 'All' || event.status === state.selectedStatus;
        const matchesCategory = state.selectedCategory === 'All' || event.category === state.selectedCategory;

        return matchesSearch && matchesStatus && matchesCategory;
    });
}

function initializeCategoryFilter() {
    const categories = ['All', ...new Set(state.events.map(e => e.category).filter(Boolean))];
    elements.categorySelect.innerHTML = categories.map(cat =>
        `<option value="${escapeHTML(cat)}">${cat === 'All' ? 'All Categories' : escapeHTML(cat)}</option>`
    ).join('');
}

function getStatusBadgeStyle(status) {
    switch (status) {
        case 'Upcoming':
            return 'bg-emerald-100 text-emerald-800 border-emerald-300';
        case 'Completed':
            return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'Cancelled':
            return 'bg-rose-100 text-rose-800 border-rose-300';
        default:
            return 'bg-slate-100 text-slate-800 border-slate-300';
    }
}

function formatDate(dateStr) {
    if (!dateStr) return 'TBA';
    try {
        const parsed = new Date(dateStr);
        if (isNaN(parsed.getTime())) return 'TBA';
        return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
        return 'TBA';
    }
}

function renderEvents() {
    const filteredEvents = getFilteredEvents();

    elements.statTotal.textContent = state.events.length;
    elements.statShowing.textContent = filteredEvents.length;

    let filterDesc = state.selectedStatus;
    if (state.selectedCategory !== 'All') filterDesc += ` • ${state.selectedCategory}`;
    if (state.searchQuery) filterDesc += ` • "${state.searchQuery}"`;
    elements.activeFilterIndicator.textContent = filterDesc;

    if (filteredEvents.length === 0) {
        elements.eventsGrid.innerHTML = '';
        elements.noResults.classList.remove('hidden');
        elements.noResults.classList.add('flex');
        return;
    } else {
        elements.noResults.classList.add('hidden');
        elements.noResults.classList.remove('flex');
    }

    elements.eventsGrid.innerHTML = filteredEvents.map(event => {
        const statusBadgeClass = getStatusBadgeStyle(event.status);
        const eventImage = event.image || FALLBACK_IMAGE;

        return `
          <article class="event-card group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden break-word-safe" data-id="${escapeHTML(event.id)}">

            <div class="relative h-40 sm:h-44 w-full bg-slate-100 overflow-hidden shrink-0">
                <img
                    src="${escapeHTML(eventImage)}"
                    alt="${escapeHTML(event.title || 'Event')}"
                    loading="lazy"
                    onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}';"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80"></div>

                <div class="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
                    <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-bold tracking-wider uppercase bg-slate-900/80 backdrop-blur-md text-white border border-white/10 truncate max-w-[50%]">
                        ${escapeHTML(event.category || 'General')}
                    </span>
                    <span class="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-bold tracking-wider uppercase border backdrop-blur-md ${statusBadgeClass}">
                        ${escapeHTML(event.status || 'Unknown')}
                    </span>
                </div>

                <div class="absolute bottom-2.5 left-2.5 text-[11px] sm:text-xs font-semibold text-white flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-md backdrop-blur-sm">
                    <i class="fa-regular fa-calendar text-blue-400"></i>
                    <span>${formatDate(event.date)}</span>
                </div>
            </div>

            <div class="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5 sm:space-y-4">
                <div class="space-y-1.5 sm:space-y-2">
                    <h3 class="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug break-word-safe">
                        ${escapeHTML(event.title || 'Untitled Event')}
                    </h3>

                    <p class="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                        <i class="fa-solid fa-user-tie text-blue-500 shrink-0"></i>
                        <span class="truncate">${escapeHTML(event.organizer || 'Anonymous')}</span>
                    </p>

                    <p class="text-xs text-slate-600 leading-relaxed line-clamp-3 break-word-safe">
                        ${escapeHTML(event.description || 'No description provided.')}
                    </p>
                </div>

                <div class="pt-2.5 sm:pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                        type="button"
                        onclick="openModal('${escapeHTML(event.id)}')"
                        class="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 text-xs font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 min-h-[38px] active:scale-[0.98]"
                    >
                        <i class="fa-solid fa-circle-info"></i> View Details
                    </button>
                </div>
            </div>

          </article>
        `;
    }).join('');
}

window.openModal = function(id) {
    const event = state.events.find(e => e && e.id === id);
    if (!event) return;

    elements.modalTitle.textContent = event.title || 'Untitled Event';
    elements.modalImage.src = event.image || FALLBACK_IMAGE;
    elements.modalImage.onerror = function() { this.src = FALLBACK_IMAGE; };
    elements.modalCategory.textContent = event.category || 'General';
    elements.modalDate.textContent = formatDate(event.date);
    elements.modalOrganizer.textContent = event.organizer || 'Anonymous';
    elements.modalDescription.textContent = event.description || 'No description provided.';

    elements.modalStatus.textContent = event.status || 'Unknown';
    elements.modalStatus.className = `px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border backdrop-blur-md ${getStatusBadgeStyle(event.status)}`;

    elements.modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};

function closeModal() {
    elements.modal.classList.add('hidden');
    document.body.style.overflow = '';
}

function resetAllFilters() {
    state.searchQuery = "";
    state.selectedStatus = "All";
    state.selectedCategory = "All";

    elements.searchInput.value = "";
    elements.clearSearchBtn.classList.add('hidden');
    elements.categorySelect.value = "All";

    document.querySelectorAll('.status-btn').forEach(btn => {
        const isAll = btn.dataset.status === 'All';
        btn.setAttribute('aria-selected', isAll ? 'true' : 'false');
        if (isAll) {
            btn.className = 'status-btn active-status min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border border-blue-600 bg-blue-600 text-white shadow-sm';
        } else {
            btn.className = 'status-btn min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100';
        }
    });

    renderEvents();
}

function setupEventListeners() {
    elements.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        if (state.searchQuery.length > 0) {
            elements.clearSearchBtn.classList.remove('hidden');
        } else {
            elements.clearSearchBtn.classList.add('hidden');
        }
        renderEvents();
    });

    elements.clearSearchBtn.addEventListener('click', () => {
        state.searchQuery = "";
        elements.searchInput.value = "";
        elements.clearSearchBtn.classList.add('hidden');
        elements.searchInput.focus();
        renderEvents();
    });

    elements.resetFiltersBtn.addEventListener('click', resetAllFilters);
    elements.noResultsResetBtn.addEventListener('click', resetAllFilters);

    elements.statusContainer.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.status-btn');
        if (!targetBtn) return;

        state.selectedStatus = targetBtn.dataset.status;

        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.setAttribute('aria-selected', 'false');
            btn.className = 'status-btn min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100';
        });

        targetBtn.setAttribute('aria-selected', 'true');
        targetBtn.className = 'status-btn active-status min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border border-blue-600 bg-blue-600 text-white shadow-sm';

        renderEvents();
    });

    elements.categorySelect.addEventListener('change', (e) => {
        state.selectedCategory = e.target.value;
        renderEvents();
    });

    elements.closeModalBtn.addEventListener('click', closeModal);
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !elements.modal.classList.contains('hidden')) {
            closeModal();
        }
    });
}

window.onload = function() {
    initializeCategoryFilter();
    setupEventListeners();
    renderEvents();
};