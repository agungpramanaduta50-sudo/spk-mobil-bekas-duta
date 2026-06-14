/* 
   SPK Pemilihan Mobil Bekas - Core Application Controller (js/app.js)
   Controls the SPA navigation, handles CRUD events, renders tables, and links modules together.
   Proudly features Duta Agung Pramana (NIM: 231011400036).
*/

// App State
let currentPage = 'dashboard';
let searchCarQuery = '';
let filterCarSeats = '';
let sortCarField = 'id';
let sortCarDir = 'asc';
let currentCarPage = 1;
const CARS_PER_PAGE = 10;

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
    // Initialize Local Storage
    initDataStore();
    
    // Set up router & page routing
    setupRouter();
    
    // Load initial data
    loadDashboardStats();
    renderCarTable();
    
    // Bind all event listeners
    bindEvents();
    
    // Hide loader
    setTimeout(() => {
        const loader = document.getElementById('app-loader');
        if (loader) loader.classList.add('hidden');
    }, 800);
});

// SPA Routing based on hash or sidebar clicks
function setupRouter() {
    const handleRoute = () => {
        const hash = window.location.hash || '#dashboard';
        const pageId = hash.replace('#', '');
        navigateToPage(pageId);
    };
    
    window.addEventListener('hashchange', handleRoute);
    
    // Initial route check
    if (window.location.hash) {
        handleRoute();
    } else {
        navigateToPage('dashboard');
    }
}

// Navigate to specific page
function navigateToPage(pageId) {
    const validPages = ['dashboard', 'data-mobil', 'kriteria', 'perhitungan-saw', 'perhitungan-wp', 'perhitungan-smart', 'perhitungan-topsis', 'perhitungan-moora', 'perhitungan-ahp', 'ranking', 'visualisasi', 'tentang'];
    if (!validPages.includes(pageId)) return;
    
    currentPage = pageId;
    
    // Show/hide sections
    validPages.forEach(p => {
        const section = document.getElementById(`section-${p}`);
        if (section) {
            if (p === pageId) {
                section.classList.remove('d-none');
            } else {
                section.classList.add('d-none');
            }
        }
    });
    
    // Update active state in sidebar
    document.querySelectorAll('.sidebar-menu-item').forEach(item => {
        const link = item.querySelector('.sidebar-link');
        if (link && link.getAttribute('href') === `#${pageId}`) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Page specific triggers
    if (pageId === 'dashboard') {
        loadDashboardStats();
    } else if (pageId === 'perhitungan-saw') {
        renderSAWTables();
    } else if (pageId === 'perhitungan-wp') {
        renderWPTables();
    } else if (pageId === 'perhitungan-smart') {
        renderSMARTTables();
    } else if (pageId === 'perhitungan-topsis') {
        renderTopsisTables();
    } else if (pageId === 'perhitungan-moora') {
        renderMooraTables();
    } else if (pageId === 'perhitungan-ahp') {
        renderAhpTables();
    } else if (pageId === 'ranking') {
        renderRankingAndRecommendations();
    } else if (pageId === 'visualisasi') {
        // Wait for page transition then render charts
        setTimeout(() => {
            renderAllCharts();
        }, 100);
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Close sidebar on mobile after navigation
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && sidebar.classList.contains('show')) {
        sidebar.classList.remove('show');
    }
}

// Bind DOM event listeners
function bindEvents() {
    // Sidebar Toggle for Mobile
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar) {
                sidebar.classList.toggle('show');
            }
        });
    }

    // Mobil Search
    const searchInput = document.getElementById('search-car');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchCarQuery = e.target.value;
            currentCarPage = 1;
            renderCarTable();
        });
    }
    
    // Seat Filter
    const seatFilter = document.getElementById('filter-seats');
    if (seatFilter) {
        seatFilter.addEventListener('change', (e) => {
            filterCarSeats = e.target.value;
            currentCarPage = 1;
            renderCarTable();
        });
    }
    
    // Sorting Table Headers in Data Mobil
    document.querySelectorAll('[data-sort]').forEach(header => {
        header.addEventListener('click', () => {
            const field = header.getAttribute('data-sort');
            if (sortCarField === field) {
                sortCarDir = sortCarDir === 'asc' ? 'desc' : 'asc';
            } else {
                sortCarField = field;
                sortCarDir = 'asc';
            }
            renderCarTable();
        });
    });
    
    // Add Mobil Form Submit
    const carForm = document.getElementById('form-car');
    if (carForm) {
        carForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const carId = document.getElementById('car-id').value;
            const carData = {
                name: document.getElementById('car-name').value,
                price: parseFloat(document.getElementById('car-price').value),
                engine: parseInt(document.getElementById('car-engine').value),
                mileage: parseInt(document.getElementById('car-mileage').value),
                seats: parseInt(document.getElementById('car-seats').value)
            };
            
            if (carId) {
                updateCar(carId, carData);
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Data mobil berhasil diperbarui.',
                    icon: 'success',
                    background: '#111827',
                    color: '#FFF'
                });
            } else {
                addCar(carData);
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Data mobil baru berhasil ditambahkan.',
                    icon: 'success',
                    background: '#111827',
                    color: '#FFF'
                });
            }
            
            // Close modal
            const modalEl = document.getElementById('modal-car');
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal.hide();
            
            // Reload tables & stats
            renderCarTable();
            loadDashboardStats();
        });
    }
    
    // Reset Data Mobil Modal Trigger
    const btnAddCar = document.getElementById('btn-add-car');
    if (btnAddCar) {
        btnAddCar.addEventListener('click', () => {
            document.getElementById('modal-title-car').innerText = 'Tambah Data Mobil';
            document.getElementById('car-id').value = '';
            carForm.reset();
        });
    }
    
    // CSV Import handling
    const csvFileInput = document.getElementById('csv-file');
    if (csvFileInput) {
        csvFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleCSVImport(file, (success, count) => {
                    if (success) {
                        Swal.fire({
                            title: 'Sukses!',
                            text: `Berhasil mengimpor ${count} data mobil dari CSV.`,
                            icon: 'success',
                            background: '#111827',
                            color: '#FFF'
                        });
                        renderCarTable();
                        loadDashboardStats();
                    } else {
                        Swal.fire({
                            title: 'Error!',
                            text: 'Gagal mengimpor file CSV. Pastikan format kolom sesuai.',
                            icon: 'error',
                            background: '#111827',
                            color: '#FFF'
                        });
                    }
                });
                // Reset file input
                csvFileInput.value = '';
            }
        });
    }
    
    // PDF Export Button triggers
    document.querySelectorAll('.btn-export-pdf').forEach(btn => {
        btn.addEventListener('click', () => {
            const method = btn.getAttribute('data-method');
            exportPDF(method);
        });
    });
}

// Load Dashboard Stat Counters
function loadDashboardStats() {
    const stats = getStatistics();
    const cars = getAllCars();
    
    const totalCarsEl = document.getElementById('stat-total-cars');
    const avgPriceEl = document.getElementById('stat-avg-price');
    const bestSawEl = document.getElementById('stat-best-saw');
    const bestSawScoreEl = document.getElementById('stat-best-saw-score');
    
    // Format Price nicely for UI representation
    const formatter = new Intl.NumberFormat('id-ID');
    
    if (totalCarsEl) totalCarsEl.innerText = stats.count;
    if (avgPriceEl) avgPriceEl.innerText = `Rp ${formatter.format(stats.avgPrice.toFixed(0))}`;
    
    if (cars.length > 0) {
        // Calculate consensus from all 6 methods - tally rank points per car
        // Lower rank = better, so rank 1 = n pts, rank n gets 1 pt
        const n = cars.length;
        const scoreMap = {}; // carId => total points
        cars.forEach(c => { scoreMap[c.id] = 0; });

        const getRanking = (rankingArr) => {
            if (!rankingArr || rankingArr.length === 0) return;
            rankingArr.forEach(item => {
                const pts = n - item.rank + 1;
                if (scoreMap[item.id] !== undefined) scoreMap[item.id] += pts;
            });
        };

        try { getRanking(calculateSAW().ranking); } catch(e) {}
        try { getRanking(calculateWP().ranking); } catch(e) {}
        try { getRanking(calculateSMART().ranking); } catch(e) {}
        try { getRanking(calculateTOPSIS().ranking); } catch(e) {}
        try { getRanking(calculateMOORA().ranking); } catch(e) {}
        try { getRanking(calculateAHP().ranking); } catch(e) {}

        // Find car with most points (Object.entries returns string keys, convert back to number)
        let bestId = null, bestPts = -1;
        Object.entries(scoreMap).forEach(([id, pts]) => {
            if (pts > bestPts) { bestPts = pts; bestId = Number(id); }
        });

        const bestCar = cars.find(c => c.id === bestId);
        if (bestCar) {
            if (bestSawEl) bestSawEl.innerText = bestCar.name;
            if (bestSawScoreEl) bestSawScoreEl.innerText = `Rekomendasi Terbaik (6 Metode)`;
        }
    } else {
        if (bestSawEl) bestSawEl.innerText = "-";
        if (bestSawScoreEl) bestSawScoreEl.innerText = `Rekomendasi Terbaik (6 Metode)`;
    }
    
    // Render brief preview table on dashboard
    renderDashboardPreviewTable();
}


// Render Dashboard Preview Table
function renderDashboardPreviewTable() {
    const cars = getAllCars().slice(0, 5); // top 5 only
    const tbody = document.getElementById('tbody-recent-cars');
    if (!tbody) return;
    
    if (cars.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Tidak ada data mobil.</td></tr>`;
        return;
    }
    
    const formatter = new Intl.NumberFormat('id-ID');
    tbody.innerHTML = cars.map((c, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td><strong>${c.name}</strong></td>
            <td>Rp ${formatter.format(c.price)}</td>
            <td>${c.engine.toLocaleString()} CC</td>
            <td>${c.mileage.toLocaleString()} KM</td>
        </tr>
    `).join('');
}

// Render Data Mobil Table (CRUD page) with search, filter, sort, and pagination
function renderCarTable() {
    let cars = getAllCars();
    const tbody = document.getElementById('tbody-cars');
    if (!tbody) return;
    
    // 1. Search Query Filter
    if (searchCarQuery) {
        cars = cars.filter(c => c.name.toLowerCase().includes(searchCarQuery.toLowerCase()));
    }
    
    // 2. Seats Filter
    if (filterCarSeats) {
        if (filterCarSeats === 'small') {
            cars = cars.filter(c => c.seats <= 4);
        } else if (filterCarSeats === 'medium') {
            cars = cars.filter(c => c.seats === 5);
        } else if (filterCarSeats === 'large') {
            cars = cars.filter(c => c.seats >= 6);
        }
    }
    
    // 3. Sorting
    cars.sort((a, b) => {
        let valA = a[sortCarField];
        let valB = b[sortCarField];
        
        if (typeof valA === 'string') {
            return sortCarDir === 'asc' 
                ? valA.localeCompare(valB) 
                : valB.localeCompare(valA);
        } else {
            return sortCarDir === 'asc' 
                ? valA - valB 
                : valB - valA;
        }
    });
    
    // Update sort headers styling
    document.querySelectorAll('[data-sort]').forEach(header => {
        const field = header.getAttribute('data-sort');
        const icon = header.querySelector('i');
        if (icon) {
            if (sortCarField === field) {
                icon.className = sortCarDir === 'asc' 
                    ? 'fa-solid fa-sort-up ms-1 text-info' 
                    : 'fa-solid fa-sort-down ms-1 text-info';
            } else {
                icon.className = 'fa-solid fa-sort ms-1 text-muted';
            }
        }
    });
    
    // 4. Pagination
    const totalCars = cars.length;
    const totalPages = Math.ceil(totalCars / CARS_PER_PAGE) || 1;
    
    if (currentCarPage > totalPages) currentCarPage = totalPages;
    
    const startIdx = (currentCarPage - 1) * CARS_PER_PAGE;
    const paginatedCars = cars.slice(startIdx, startIdx + CARS_PER_PAGE);
    
    const formatter = new Intl.NumberFormat('id-ID');
    
    if (paginatedCars.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">Tidak ada data mobil.</td></tr>`;
        renderCarPagination(totalPages);
        return;
    }
    
    tbody.innerHTML = paginatedCars.map((c, idx) => `
        <tr>
            <td>${startIdx + idx + 1}</td>
            <td><strong>${c.name}</strong></td>
            <td>Rp ${formatter.format(c.price)}</td>
            <td>${c.engine.toLocaleString()} CC</td>
            <td>${c.mileage.toLocaleString()} KM</td>
            <td><span class="badge bg-secondary">${c.seats} Kursi</span></td>
            <td>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-info py-1 px-2" onclick="editCarDialog(${c.id})">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger py-1 px-2" onclick="deleteCarDialog(${c.id})">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    renderCarPagination(totalPages);
}

// Render Car Table Pagination buttons
function renderCarPagination(totalPages) {
    const paginationContainer = document.getElementById('pagination-cars');
    if (!paginationContainer) return;
    
    let html = `
        <li class="page-item ${currentCarPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="changeCarPage(${currentCarPage - 1})">
                <i class="fa-solid fa-chevron-left"></i>
            </a>
        </li>
    `;
    
    for (let i = 1; i <= totalPages; i++) {
        html += `
            <li class="page-item ${currentCarPage === i ? 'active' : ''}">
                <a class="page-link" href="javascript:void(0)" onclick="changeCarPage(${i})">${i}</a>
            </li>
        `;
    }
    
    html += `
        <li class="page-item ${currentCarPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="changeCarPage(${currentCarPage + 1})">
                <i class="fa-solid fa-chevron-right"></i>
            </a>
        </li>
    `;
    
    paginationContainer.innerHTML = html;
}

function changeCarPage(page) {
    currentCarPage = page;
    renderCarTable();
}

// Trigger Edit Mobil Modal
window.editCarDialog = function(id) {
    const car = getCarById(id);
    if (!car) return;
    
    document.getElementById('modal-title-car').innerText = 'Edit Data Mobil';
    document.getElementById('car-id').value = car.id;
    document.getElementById('car-name').value = car.name;
    document.getElementById('car-price').value = car.price;
    document.getElementById('car-engine').value = car.engine;
    document.getElementById('car-mileage').value = car.mileage;
    document.getElementById('car-seats').value = car.seats;
    
    const modalEl = document.getElementById('modal-car');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
};

// Trigger Delete Mobil Confirmation Dialog
window.deleteCarDialog = function(id) {
    const car = getCarById(id);
    if (!car) return;
    
    Swal.fire({
        title: 'Apakah anda yakin?',
        text: `Ingin menghapus data mobil ${car.name}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#374151',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal',
        background: '#111827',
        color: '#FFF'
    }).then((result) => {
        if (result.isConfirmed) {
            deleteCar(id);
            Swal.fire({
                title: 'Dihapus!',
                text: 'Data mobil berhasil dihapus.',
                icon: 'success',
                background: '#111827',
                color: '#FFF'
            });
            renderCarTable();
            loadDashboardStats();
        }
    });
};

// Reset System Data trigger (Restores Duta's 4 default cars)
window.resetSystemData = function() {
    Swal.fire({
        title: 'Reset Data?',
        text: 'Mengembalikan dataset mobil bawaan dari buku catatan Anda (4 Alternatif)?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3A86FF',
        cancelButtonColor: '#374151',
        confirmButtonText: 'Ya, reset!',
        cancelButtonText: 'Batal',
        background: '#111827',
        color: '#FFF'
    }).then((result) => {
        if (result.isConfirmed) {
            resetDataToDefault();
            Swal.fire({
                title: 'Sukses!',
                text: 'Dataset telah di-reset ke 4 alternatif manual Anda.',
                icon: 'success',
                background: '#111827',
                color: '#FFF'
            });
            renderCarTable();
            loadDashboardStats();
        }
    });
};

// --- RENDER PERHITUNGAN TABLES (SAW) ---
function renderSAWTables() {
    const res = calculateSAW();
    const formatter = new Intl.NumberFormat('id-ID');
    
    // 1. Decision Matrix Table
    const tbodyMatrix = document.getElementById('tbody-saw-matrix');
    if (tbodyMatrix) {
        tbodyMatrix.innerHTML = res.matrix.map((c, idx) => `
            <tr>
                <td><strong>A${idx + 1} (${c.name})</strong></td>
                <td>Rp ${formatter.format(c.c1)}</td>
                <td>${c.c2.toLocaleString()} CC</td>
                <td>${c.c3.toLocaleString()} KM</td>
                <td>${c.c4} Kursi</td>
            </tr>
        `).join('');
    }
    
    // 2. Normalization Table
    const tbodyNorm = document.getElementById('tbody-saw-norm');
    if (tbodyNorm) {
        tbodyNorm.innerHTML = res.normalized.map((c, idx) => `
            <tr>
                <td><strong>A${idx + 1} (${c.name})</strong></td>
                <td>${c.r1.toFixed(4)}</td>
                <td>${c.r2.toFixed(4)}</td>
                <td>${c.r3.toFixed(4)}</td>
                <td>${c.r4.toFixed(4)}</td>
            </tr>
        `).join('');
    }
    
    // Normalization calculations explanation (show min/max)
    const normInfo = document.getElementById('saw-norm-info');
    if (normInfo) {
        normInfo.innerHTML = `
            <div class="row text-center mt-3">
                <div class="col-md-3 mb-2"><div class="p-2 border border-secondary rounded bg-dark"><strong>Harga Min:</strong> Rp ${formatter.format(res.minMax.minPrice)}</div></div>
                <div class="col-md-3 mb-2"><div class="p-2 border border-secondary rounded bg-dark"><strong>CC Max:</strong> ${res.minMax.maxEngine.toLocaleString()} CC</div></div>
                <div class="col-md-3 mb-2"><div class="p-2 border border-secondary rounded bg-dark"><strong>Kilometer Min:</strong> ${res.minMax.minMileage.toLocaleString()} KM</div></div>
                <div class="col-md-3 mb-2"><div class="p-2 border border-secondary rounded bg-dark"><strong>Kursi Max:</strong> ${res.minMax.maxSeats} Kursi</div></div>
            </div>
        `;
    }
    
    // 3. Weighting & Preference Table
    const tbodyWeight = document.getElementById('tbody-saw-weight');
    if (tbodyWeight) {
        tbodyWeight.innerHTML = res.scores.map((c, idx) => `
            <tr>
                <td><strong>A${idx + 1} (${c.name})</strong></td>
                <td style="font-family: monospace; font-size: 12px;" class="text-muted d-none d-lg-table-cell">${c.steps}</td>
                <td><strong>${c.score.toFixed(4)}</strong></td>
                <td><span class="text-info">${c.manualScore.toFixed(4)}</span></td>
            </tr>
        `).join('');
    }
    
    // 4. Ranking Table
    const tbodyRank = document.getElementById('tbody-saw-rank');
    if (tbodyRank) {
        tbodyRank.innerHTML = res.ranking.map((c, idx) => `
            <tr class="${idx === 0 ? 'table-success-glow' : ''}">
                <td><span class="badge-rank">${c.rank}</span></td>
                <td><strong>${c.name}</strong></td>
                <td><strong class="text-accent-blue">${c.score.toFixed(4)}</strong></td>
                <td>${idx === 0 ? '<span class="badge bg-success">Rekomendasi Utama</span>' : '-'}</td>
            </tr>
        `).join('');
    }
}

// --- RENDER PERHITUNGAN TABLES (WP) ---
function renderWPTables() {
    const res = calculateWP();
    const formatter = new Intl.NumberFormat('id-ID');
    
    // 1. Matrix Table (same raw values)
    const tbodyMatrix = document.getElementById('tbody-wp-matrix');
    if (tbodyMatrix) {
        tbodyMatrix.innerHTML = res.matrix.map((c, idx) => `
            <tr>
                <td><strong>A${idx + 1} (${c.name})</strong></td>
                <td>Rp ${formatter.format(c.c1)}</td>
                <td>${c.c2.toLocaleString()} CC</td>
                <td>${c.c3.toLocaleString()} KM</td>
                <td>${c.c4} Kursi</td>
            </tr>
        `).join('');
    }
    
    // 2. Vector S Table
    const tbodyS = document.getElementById('tbody-wp-s');
    if (tbodyS) {
        tbodyS.innerHTML = res.vectorS.map((c, idx) => `
            <tr>
                <td><strong>A${idx + 1} (${c.name})</strong></td>
                <td style="font-family: monospace; font-size: 11px;" class="text-muted d-none d-lg-table-cell">${c.steps}</td>
                <td><strong>${c.s.toFixed(8)}</strong></td>
            </tr>
        `).join('');
    }
    
    // Vector S Summary (Sum of S)
    const sInfo = document.getElementById('wp-s-info');
    if (sInfo) {
        sInfo.innerHTML = `<div class="p-3 border border-primary rounded bg-dark mt-3 text-center"><strong>Total Nilai Vektor S (&#931;S):</strong> ${res.sumS.toFixed(8)}</div>`;
    }
    
    // 3. Vector V Table
    const tbodyV = document.getElementById('tbody-wp-v');
    if (tbodyV) {
        tbodyV.innerHTML = res.vectorV.map((c, idx) => `
            <tr>
                <td><strong>A${idx + 1} (${c.name})</strong></td>
                <td style="font-family: monospace; font-size: 11px;" class="text-muted d-none d-lg-table-cell">${c.steps}</td>
                <td><strong>${c.v.toFixed(4)}</strong></td>
            </tr>
        `).join('');
    }
    
    // 4. Ranking Table
    const tbodyRank = document.getElementById('tbody-wp-rank');
    if (tbodyRank) {
        tbodyRank.innerHTML = res.ranking.map((c, idx) => `
            <tr>
                <td><span class="badge-rank">${c.rank}</span></td>
                <td><strong>${c.name}</strong></td>
                <td><strong class="text-accent-cyan">${c.v.toFixed(4)}</strong></td>
                <td>${idx === 0 ? '<span class="badge bg-info text-dark">WP Terbaik</span>' : '-'}</td>
            </tr>
        `).join('');
    }
}

// --- RENDER PERHITUNGAN TABLES (SMART) ---
function renderSMARTTables() {
    const res = calculateSMART();
    const formatter = new Intl.NumberFormat('id-ID');
    
    // 1. Matrix Table
    const tbodyMatrix = document.getElementById('tbody-smart-matrix');
    if (tbodyMatrix) {
        tbodyMatrix.innerHTML = res.matrix.map((c, idx) => `
            <tr>
                <td><strong>A${idx + 1} (${c.name})</strong></td>
                <td>Rp ${formatter.format(c.c1)}</td>
                <td>${c.c2.toLocaleString()} CC</td>
                <td>${c.c3.toLocaleString()} KM</td>
                <td>${c.c4} Kursi</td>
            </tr>
        `).join('');
    }
    
    // 2. Utility Values Table
    const tbodyUtility = document.getElementById('tbody-smart-utility');
    if (tbodyUtility) {
        tbodyUtility.innerHTML = res.utilities.map((c, idx) => `
            <tr>
                <td><strong>A${idx + 1} (${c.name})</strong></td>
                <td>${c.u1.toFixed(4)}</td>
                <td>${c.u2.toFixed(4)}</td>
                <td>${c.u3.toFixed(4)}</td>
                <td>${c.u4.toFixed(4)}</td>
            </tr>
        `).join('');
    }
    
    // Utility Bounds Info
    const boundsInfo = document.getElementById('smart-bounds-info');
    if (boundsInfo) {
        boundsInfo.innerHTML = `
            <div class="row text-center mt-3 fs-11">
                <div class="col-md-3 mb-2"><div class="p-2 border border-secondary rounded bg-dark"><strong>Harga Min/Max:</strong><br> Rp ${formatter.format(res.minMax.minPrice)} / Rp ${formatter.format(res.minMax.maxPrice)}</div></div>
                <div class="col-md-3 mb-2"><div class="p-2 border border-secondary rounded bg-dark"><strong>CC Min/Max:</strong><br> ${res.minMax.minEngine.toLocaleString()} / ${res.minMax.maxEngine.toLocaleString()} CC</div></div>
                <div class="col-md-3 mb-2"><div class="p-2 border border-secondary rounded bg-dark"><strong>KM Min/Max:</strong><br> ${res.minMax.minMileage.toLocaleString()} / ${res.minMax.maxMileage.toLocaleString()} KM</div></div>
                <div class="col-md-3 mb-2"><div class="p-2 border border-secondary rounded bg-dark"><strong>Kursi Min/Max:</strong><br> ${res.minMax.minSeats} / ${res.minMax.maxSeats} Kursi</div></div>
            </div>
        `;
    }
    
    // 3. Weighting & Preference Table
    const tbodyWeight = document.getElementById('tbody-smart-weight');
    if (tbodyWeight) {
        tbodyWeight.innerHTML = res.scores.map((c, idx) => `
            <tr>
                <td><strong>A${idx + 1} (${c.name})</strong></td>
                <td style="font-family: monospace; font-size: 11px;" class="text-muted d-none d-lg-table-cell">${c.steps}</td>
                <td><strong>${c.score.toFixed(4)}</strong></td>
            </tr>
        `).join('');
    }
    
    // 4. Ranking Table
    const tbodyRank = document.getElementById('tbody-smart-rank');
    if (tbodyRank) {
        tbodyRank.innerHTML = res.ranking.map((c, idx) => `
            <tr>
                <td><span class="badge-rank">${c.rank}</span></td>
                <td><strong>${c.name}</strong></td>
                <td><strong class="text-accent-purple">${c.score.toFixed(4)}</strong></td>
                <td>${idx === 0 ? '<span class="badge bg-purple text-light" style="background-color: var(--accent-purple) !important;">SMART Terbaik</span>' : '-'}</td>
            </tr>
        `).join('');
    }
}

// --- RENDER RANKING & RECOMMENDATION SCREEN ---
function renderRankingAndRecommendations() {
    const sawRes = calculateSAW();
    const wpRes = calculateWP();
    const smartRes = calculateSMART();
    const topsisRes = calculateTOPSIS();
    const mooraRes = calculateMOORA();
    const ahpRes = calculateAHP();
    
    const formatter = new Intl.NumberFormat('id-ID');
    
    // 1. RENDER TOP 5 ALTERNATIVE CAR CARDS (Based on SAW mostly as default)
    const cardsGrid = document.getElementById('recommendations-grid');
    if (cardsGrid) {
        if (sawRes.ranking.length === 0) {
            cardsGrid.innerHTML = `<div class="col-12 text-center text-muted">Tidak ada rekomendasi data mobil.</div>`;
        } else {
            const top5 = sawRes.ranking.slice(0, 5);
            cardsGrid.innerHTML = top5.map((item, index) => {
                const car = getCarById(item.id);
                const isBest = index === 0;
                
                const wpRank = wpRes.ranking.find(r => r.id === item.id)?.rank || '-';
                const smartRank = smartRes.ranking.find(r => r.id === item.id)?.rank || '-';
                const topsisRank = topsisRes.ranking.find(r => r.id === item.id)?.rank || '-';
                const mooraRank = mooraRes.ranking.find(r => r.id === item.id)?.rank || '-';
                const ahpRank = ahpRes.ranking.find(r => r.id === item.id)?.rank || '-';
                
                return `
                    <div class="col">
                        <div class="glass-panel car-card ${isBest ? 'glass-glow-cyan border-info' : ''}">
                            <div class="car-card-header">
                                ${isBest ? '<span class="car-card-badge">Rekomendasi Terbaik</span>' : ''}
                                <div class="car-card-title">${car.name}</div>
                                <div class="car-card-price">Rp ${formatter.format(car.price)}</div>
                            </div>
                            <div class="car-card-body">
                                <div class="car-specs">
                                    <div class="spec-item"><span class="spec-label">Kapasitas Mesin</span><span class="spec-val">${car.engine.toLocaleString()} CC</span></div>
                                    <div class="spec-item"><span class="spec-label">Kilometer</span><span class="spec-val">${car.mileage.toLocaleString()} KM</span></div>
                                    <div class="spec-item"><span class="spec-label">Kapasitas Kursi</span><span class="spec-val">${car.seats} Penumpang</span></div>
                                    <div class="spec-item"><span class="spec-label">Rank T/M/A</span><span class="spec-val">${topsisRank} / ${mooraRank} / ${ahpRank}</span></div>
                                </div>
                                <div class="car-score-container">
                                    <span class="score-lbl">Skor SAW Akhir:</span>
                                    <span class="score-val text-info">${item.score.toFixed(4)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
    
    // 2. RENDER METHOD COMPARISON TABLE
    const tbodyComparison = document.getElementById('tbody-ranking-comparison');
    if (tbodyComparison) {
        const cars = getAllCars();
        tbodyComparison.innerHTML = cars.map(car => {
            const saw = sawRes.ranking.find(r => r.id === car.id);
            const wp = wpRes.ranking.find(r => r.id === car.id);
            const smart = smartRes.ranking.find(r => r.id === car.id);
            const topsis = topsisRes.ranking.find(r => r.id === car.id);
            const moora = mooraRes.ranking.find(r => r.id === car.id);
            const ahp = ahpRes.ranking.find(r => r.id === car.id);
            
            if(!saw || !wp || !smart || !topsis || !moora || !ahp) return '';
            
            return `
                <tr>
                    <td><strong>${car.name}</strong></td>
                    <td class="text-center"><strong>${saw.rank}</strong> <span class="text-muted fs-11">(${saw.score.toFixed(4)})</span></td>
                    <td class="text-center"><strong>${wp.rank}</strong> <span class="text-muted fs-11">(${wp.v.toFixed(4)})</span></td>
                    <td class="text-center"><strong>${smart.rank}</strong> <span class="text-muted fs-11">(${smart.score.toFixed(4)})</span></td>
                    <td class="text-center"><strong>${topsis.rank}</strong> <span class="text-muted fs-11">(${topsis.score.toFixed(4)})</span></td>
                    <td class="text-center"><strong>${moora.rank}</strong> <span class="text-muted fs-11">(${moora.score.toFixed(4)})</span></td>
                    <td class="text-center"><strong>${ahp.rank}</strong> <span class="text-muted fs-11">(${ahp.score.toFixed(4)})</span></td>
                </tr>
            `;
        }).join('');
    }
}

// ==========================================
// RENDER TOPSIS TABLES
// ==========================================
function renderTopsisTables() {
    const res = calculateTOPSIS();
    
    const tNorm = document.getElementById('tbody-topsis-norm');
    if (tNorm) {
        tNorm.innerHTML = res.normalized.map(n => `
            <tr>
                <td>${n.name}</td>
                <td>${n.r1.toFixed(4)}</td>
                <td>${n.r2.toFixed(4)}</td>
                <td>${n.r3.toFixed(4)}</td>
                <td>${n.r4.toFixed(4)}</td>
            </tr>
        `).join('');
    }
    
    const tWeight = document.getElementById('tbody-topsis-weight');
    if (tWeight) {
        tWeight.innerHTML = res.weighted.map(w => `
            <tr>
                <td>${w.name}</td>
                <td>${w.y1.toFixed(4)}</td>
                <td>${w.y2.toFixed(4)}</td>
                <td>${w.y3.toFixed(4)}</td>
                <td>${w.y4.toFixed(4)}</td>
            </tr>
        `).join('');
    }
    
    const tPref = document.getElementById('tbody-topsis-pref');
    if (tPref) {
        tPref.innerHTML = res.distances.map(d => `
            <tr>
                <td>${d.name}</td>
                <td>${d.dPlus.toFixed(4)}</td>
                <td>${d.dMinus.toFixed(4)}</td>
                <td><strong>${d.score.toFixed(4)}</strong></td>
            </tr>
        `).join('');
    }
    
    const tRank = document.getElementById('tbody-topsis-rank');
    if (tRank) {
        tRank.innerHTML = res.ranking.map((r, idx) => `
            <tr>
                <td><span class="badge ${idx === 0 ? 'bg-danger' : 'bg-dark border border-secondary'} px-2 py-1">${r.rank}</span></td>
                <td><strong>${r.name}</strong></td>
                <td><strong class="text-warning">${r.score.toFixed(4)}</strong></td>
            </tr>
        `).join('');
    }
}

// ==========================================
// RENDER MOORA TABLES
// ==========================================
function renderMooraTables() {
    const res = calculateMOORA();
    
    const tNorm = document.getElementById('tbody-moora-norm');
    if (tNorm) {
        tNorm.innerHTML = res.normalized.map(n => `
            <tr>
                <td>${n.name}</td>
                <td>${n.r1.toFixed(4)}</td>
                <td>${n.r2.toFixed(4)}</td>
                <td>${n.r3.toFixed(4)}</td>
                <td>${n.r4.toFixed(4)}</td>
            </tr>
        `).join('');
    }
    
    const tWeight = document.getElementById('tbody-moora-weight');
    if (tWeight) {
        tWeight.innerHTML = res.weighted.map(w => `
            <tr>
                <td>${w.name}</td>
                <td>${w.y1.toFixed(4)}</td>
                <td>${w.y2.toFixed(4)}</td>
                <td>${w.y3.toFixed(4)}</td>
                <td>${w.y4.toFixed(4)}</td>
            </tr>
        `).join('');
    }
    
    const tOpt = document.getElementById('tbody-moora-opt');
    if (tOpt) {
        tOpt.innerHTML = res.scores.map(s => `
            <tr>
                <td>${s.name}</td>
                <td class="text-success">${s.benefit.toFixed(4)}</td>
                <td class="text-danger">${s.cost.toFixed(4)}</td>
                <td><strong>${s.score.toFixed(4)}</strong></td>
            </tr>
        `).join('');
    }
    
    const tRank = document.getElementById('tbody-moora-rank');
    if (tRank) {
        tRank.innerHTML = res.ranking.map((r, idx) => `
            <tr>
                <td><span class="badge ${idx === 0 ? 'bg-success' : 'bg-dark border border-secondary'} px-2 py-1">${r.rank}</span></td>
                <td><strong>${r.name}</strong></td>
                <td><strong class="text-success">${r.score.toFixed(4)}</strong></td>
            </tr>
        `).join('');
    }
}

// ==========================================
// RENDER AHP TABLES
// ==========================================
function renderAhpTables() {
    const res = calculateAHP();
    
    const tTrans = document.getElementById('tbody-ahp-trans');
    if (tTrans) {
        tTrans.innerHTML = res.transformed.map(t => `
            <tr>
                <td>${t.name}</td>
                <td>${t.t1.toFixed(6)}</td>
                <td>${t.t2}</td>
                <td>${t.t3.toFixed(6)}</td>
                <td>${t.t4}</td>
            </tr>
        `).join('');
    }
    
    const tNorm = document.getElementById('tbody-ahp-norm');
    if (tNorm) {
        tNorm.innerHTML = res.normalized.map(n => `
            <tr>
                <td>${n.name}</td>
                <td>${n.r1.toFixed(4)}</td>
                <td>${n.r2.toFixed(4)}</td>
                <td>${n.r3.toFixed(4)}</td>
                <td>${n.r4.toFixed(4)}</td>
            </tr>
        `).join('');
    }
    
    const tScore = document.getElementById('tbody-ahp-score');
    if (tScore) {
        tScore.innerHTML = res.scores.map(s => `
            <tr>
                <td>${s.name}</td>
                <td><strong>${s.score.toFixed(4)}</strong></td>
            </tr>
        `).join('');
    }
    
    const tRank = document.getElementById('tbody-ahp-rank');
    if (tRank) {
        tRank.innerHTML = res.ranking.map((r, idx) => `
            <tr>
                <td><span class="badge ${idx === 0 ? 'bg-info text-dark' : 'bg-dark border border-secondary'} px-2 py-1">${r.rank}</span></td>
                <td><strong>${r.name}</strong></td>
                <td><strong class="text-danger">${r.score.toFixed(4)}</strong></td>
            </tr>
        `).join('');
    }
}
