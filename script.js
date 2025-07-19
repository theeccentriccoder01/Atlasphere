class AtlasExplorer {
    constructor() {
        this.map = null;
        this.markers = new Map();
        this.currentFilter = 'all';
        this.locations = [];
        this.userLocation = null;
        this.isFullscreen = false;
        this.isSidebarOpen = true;
        
        this.init();
    }

    init() {
        this.showLoading();
        this.setupMap();
        this.setupEventListeners();
        this.loadLocations();
        this.hideLoading();
    }

    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.remove('hidden');
    }

    hideLoading() {
        setTimeout(() => {
            const overlay = document.getElementById('loadingOverlay');
            overlay.classList.add('hidden');
        }, 1500);
    }

    setupMap() {
        this.map = L.map('map', {
            center: [40.7128, -74.0060],
            zoom: 12,
            zoomControl: false,
            attributionControl: false
        });
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© OpenStreetMap contributors, © CARTO',
            subdomains: 'abcd',
            maxZoom: 19
        }).addTo(this.map);
        L.control.attribution({
            position: 'bottomright',
            prefix: '🗺️ Atlasphere'
        }).addTo(this.map);
        this.map.on('load', () => {
            this.showToast('Map loaded successfully!', 'success');
        });
    }

    setupEventListeners() {
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        
        searchBtn.addEventListener('click', () => this.handleSearch());
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => this.handleFilter(btn.dataset.category));
        });

        document.getElementById('zoomInBtn').addEventListener('click', () => {
            this.map.zoomIn();
        });
        
        document.getElementById('zoomOutBtn').addEventListener('click', () => {
            this.map.zoomOut();
        });
        
        document.getElementById('resetViewBtn').addEventListener('click', () => {
            this.map.setView([40.7128, -74.0060], 12);
        });

        document.getElementById('locationBtn').addEventListener('click', () => {
            this.getUserLocation();
        });
        
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        document.getElementById('sidebarToggle').addEventListener('click', () => {
            this.toggleSidebar();
        });

        if (window.innerWidth <= 768) {
            this.isSidebarOpen = false;
            document.getElementById('sidebar').classList.add('collapsed');
        }

        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && !this.isSidebarOpen) {
                this.toggleSidebar();
            }
        });
    }

    loadLocations() {
        this.locations = [
            {
                id: 1,
                name: "Central Park",
                category: "park",
                lat: 40.7829,
                lng: -73.9654,
                description: "A magnificent urban oasis in the heart of Manhattan, offering 843 acres of green space, lakes, and recreational activities.",
                rating: 4.8,
                reviews: 12543,
                image: "🌳",
                details: "Open 6:00 AM - 1:00 AM daily"
            },
            {
                id: 2,
                name: "Metropolitan Museum of Art",
                category: "museum",
                lat: 40.7794,
                lng: -73.9632,
                description: "One of the world's largest and most prestigious art museums, housing over 2 million works spanning 5,000 years.",
                rating: 4.7,
                reviews: 8765,
                image: "🏛️",
                details: "Open 10:00 AM - 5:00 PM, closed Mondays"
            },
            {
                id: 3,
                name: "Brooklyn Bridge",
                category: "landmark",
                lat: 40.7061,
                lng: -73.9969,
                description: "An iconic suspension bridge connecting Manhattan and Brooklyn, offering stunning views of the NYC skyline.",
                rating: 4.6,
                reviews: 15432,
                image: "🌉",
                details: "Open 24/7, pedestrian walkway available"
            },
            {
                id: 4,
                name: "Le Bernardin",
                category: "restaurant",
                lat: 40.7614,
                lng: -73.9776,
                description: "A world-renowned French seafood restaurant with three Michelin stars, offering exquisite fine dining.",
                rating: 4.9,
                reviews: 2341,
                image: "🍽️",
                details: "Reservations required, $$"
            },
            {
                id: 5,
                name: "High Line Park",
                category: "park",
                lat: 40.7480,
                lng: -74.0048,
                description: "A unique elevated park built on a former railway line, featuring gardens, art installations, and city views.",
                rating: 4.5,
                reviews: 9876,
                image: "🌿",
                details: "Open 7:00 AM - 7:00 PM (seasonal hours)"
            },
            {
                id: 6,
                name: "Times Square",
                category: "landmark",
                lat: 40.7580,
                lng: -73.9855,
                description: "The bustling commercial intersection known as 'The Crossroads of the World', famous for its bright lights and energy.",
                rating: 4.2,
                reviews: 23456,
                image: "🌟",
                details: "Open 24/7, busiest area in NYC"
            },
            {
                id: 7,
                name: "SoHo Shopping District",
                category: "shopping",
                lat: 40.7230,
                lng: -74.0030,
                description: "A trendy neighborhood known for high-end boutiques, art galleries, and cast-iron architecture.",
                rating: 4.4,
                reviews: 5678,
                image: "🛍️",
                details: "Most shops open 10:00 AM - 8:00 PM"
            },
            {
                id: 8,
                name: "9/11 Memorial & Museum",
                category: "museum",
                lat: 40.7115,
                lng: -74.0134,
                description: "A moving tribute to the victims of September 11th, featuring twin reflecting pools and a comprehensive museum.",
                rating: 4.8,
                reviews: 11234,
                image: "🕊️",
                details: "Open 9:00 AM - 8:00 PM, timed entry tickets"
            }
        ];

        this.renderLocations();
        this.addMarkersToMap();
        this.updateStats();
    }
    renderLocations() {
        const locationsList = document.getElementById('locationsList');
        locationsList.innerHTML = '';

        const filteredLocations = this.currentFilter === 'all' 
            ? this.locations 
            : this.locations.filter(location => location.category === this.currentFilter);

        filteredLocations.forEach(location => {
            const locationCard = this.createLocationCard(location);
            locationsList.appendChild(locationCard);
        });
    }

    createLocationCard(location) {
        const card = document.createElement('div');
        card.className = 'location-card fade-in';
        card.innerHTML = `
            <div class="location-header">
                <div>
                    <div class="location-name">${location.name}</div>
                    <div class="location-category">${location.category}</div>
                </div>
                <div style="font-size: 1.5rem;">${location.image}</div>
            </div>
            <div class="location-description">${location.description}</div>
            <div class="location-rating">
                <div class="rating-stars">${'⭐'.repeat(Math.floor(location.rating))}</div>
                <div class="rating-text">${location.rating} (${location.reviews.toLocaleString()} reviews)</div>
            </div>
        `;

        card.addEventListener('click', () => {
            this.focusOnLocation(location);
        });

        return card;
    }

    addMarkersToMap() {
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers.clear();

        const filteredLocations = this.currentFilter === 'all' 
            ? this.locations 
            : this.locations.filter(location => location.category === this.currentFilter);

        filteredLocations.forEach(location => {
            const marker = this.createCustomMarker(location);
            marker.addTo(this.map);
            this.markers.set(location.id, marker);
        });
    }

    createCustomMarker(location) {
        const categoryColors = {
            restaurant: '#ef4444',
            park: '#22c55e',
            museum: '#8b5cf6',
            landmark: '#f59e0b',
            shopping: '#ec4899',
            default: '#10b981'
        };

        const color = categoryColors[location.category] || categoryColors.default;
        
        const customIcon = L.divIcon({
            html: `
                <div style="
                    background: ${color};
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    color: white;
                    font-weight: bold;
                    position: relative;
                    animation: pulse 2s infinite;
                ">${location.image}</div>
            `,
            className: 'custom-marker',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        const marker = L.marker([location.lat, location.lng], { icon: customIcon });
        
        const popupContent = `
            <div class="popup-content">
                <div class="popup-title">${location.name}</div>
                <div class="popup-category">${location.category}</div>
                <div class="popup-description">${location.description}</div>
                <div class="popup-rating">
                    <div class="rating-stars">${'⭐'.repeat(Math.floor(location.rating))}</div>
                    <div class="rating-text">${location.rating} (${location.reviews.toLocaleString()} reviews)</div>
                </div>
                <div style="color: #64748b; font-size: 0.75rem; margin-bottom: 1rem;">${location.details}</div>
                <div class="popup-actions">
                    <button class="popup-btn" onclick="atlasExplorer.getDirections(${location.lat}, ${location.lng})">
                        📍 Directions
                    </button>
                    <button class="popup-btn" onclick="atlasExplorer.shareLocation('${location.name}', ${location.lat}, ${location.lng})">
                        📤 Share
                    </button>
                </div>
            </div>
        `;

        marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-popup'
        });

        return marker;
    }

    handleSearch() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
        
        if (!searchTerm) {
            this.showToast('Please enter a search term', 'warning');
            return;
        }

        const foundLocation = this.locations.find(location => 
            location.name.toLowerCase().includes(searchTerm) ||
            location.category.toLowerCase().includes(searchTerm) ||
            location.description.toLowerCase().includes(searchTerm)
        );

        if (foundLocation) {
            this.focusOnLocation(foundLocation);
            this.showToast(`Found: ${foundLocation.name}`, 'success');
        } else {
            this.showToast('Location not found', 'error');
        }
    }

    handleFilter(category) {
        this.currentFilter = category;
        
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        this.renderLocations();
        this.addMarkersToMap();
        this.updateStats();
        
        this.showToast(`Filtered by: ${category === 'all' ? 'All categories' : category}`, 'success');
    }

    focusOnLocation(location) {
        this.map.setView([location.lat, location.lng], 16);
        
        const marker = this.markers.get(location.id);
        if (marker) {
            marker.openPopup();
        }
    }

    getUserLocation() {
        if (!navigator.geolocation) {
            this.showToast('Geolocation is not supported by this browser', 'error');
            return;
        }

        this.showToast('Getting your location...', 'success');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                this.userLocation = { lat: latitude, lng: longitude };
                
                if (this.userLocationMarker) {
                    this.map.removeLayer(this.userLocationMarker);
                }
                
                const userIcon = L.divIcon({
                    html: `
                        <div style="
                            background: #3b82f6;
                            width: 20px;
                            height: 20px;
                            border-radius: 50%;
                            border: 3px solid white;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                            animation: pulse 2s infinite;
                        "></div>
                    `,
                    className: 'user-location-marker',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });

                this.userLocationMarker = L.marker([latitude, longitude], { icon: userIcon })
                    .addTo(this.map)
                    .bindPopup('<div class="popup-content"><div class="popup-title">Your Location</div></div>');

                this.map.setView([latitude, longitude], 14);
                this.showToast('Location found!', 'success');
            },
            (error) => {
                let message = 'Failed to get location';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Location access denied by user';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        message = 'Location request timed out';
                        break;
                }
                this.showToast(message, 'error');
            }
        );
    }

    toggleFullscreen() {
        if (!this.isFullscreen) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            }
            this.isFullscreen = true;
            this.showToast('Entered fullscreen mode', 'success');
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            this.isFullscreen = false;
            this.showToast('Exited fullscreen mode', 'success');
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const toggleIcon = document.querySelector('.toggle-icon');
        
        if (this.isSidebarOpen) {
            sidebar.classList.add('collapsed');
            toggleIcon.textContent = '›';
            this.isSidebarOpen = false;
        } else {
            sidebar.classList.remove('collapsed');
            toggleIcon.textContent = '‹';
            this.isSidebarOpen = true;
        }
    }

    getDirections(lat, lng) {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(url, '_blank');
        this.showToast('Opening directions in new tab', 'success');
    }

    shareLocation(name, lat, lng) {
        const url = `https://www.google.com/maps/place/${lat},${lng}`;
        
        if (navigator.share) {
            navigator.share({
                title: name,
                text: `Check out ${name} on Atlasphere!`,
                url: url
            });
        } else {
            navigator.clipboard.writeText(url).then(() => {
                this.showToast('Location link copied to clipboard!', 'success');
            }).catch(() => {
                this.showToast('Failed to copy link', 'error');
            });
        }
    }

    updateStats() {
        const filteredCount = this.currentFilter === 'all' 
            ? this.locations.length 
            : this.locations.filter(location => location.category === this.currentFilter).length;
        
        document.getElementById('totalLocations').textContent = filteredCount;
        document.getElementById('activeFilters').textContent = this.currentFilter === 'all' ? 'All' : '1';
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out forwards';
            setTimeout(() => {
                container.removeChild(toast);
            }, 300);
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.atlasExplorer = new AtlasExplorer();
});

const style = document.createElement('style');
style.textContent = `
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
    
    @keyframes pulse {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.1);
            opacity: 0.8;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);