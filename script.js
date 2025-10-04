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
        this.requestLocationPermission();
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

    requestLocationPermission() {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            this.showLocationModal(false);
            return;
        }

        // Show location permission modal
        this.showLocationModal(true);
    }

    showLocationModal(geolocationSupported) {
        const modal = document.createElement('div');
        modal.className = 'location-modal';
        modal.innerHTML = `
            <div class="location-modal-content">
                <div class="location-modal-header">
                    <span class="location-icon">📍</span>
                    <h2>Location Access</h2>
                </div>
                <div class="location-modal-body">
                    <p>Atlasphere would like to access your location to show you nearby places and provide a personalized experience.</p>
                    <p class="location-benefits">
                        <span class="benefit">✓ Find places near you</span>
                        <span class="benefit">✓ Get personalized recommendations</span>
                        <span class="benefit">✓ Quick access to your area</span>
                    </p>
                </div>
                <div class="location-modal-actions">
                    ${geolocationSupported ? `
                        <button class="btn btn-primary" id="allowLocationBtn">
                            <span class="btn-icon">✅</span>
                            Allow Location
                        </button>
                        <button class="btn btn-secondary" id="denyLocationBtn">
                            <span class="btn-icon">❌</span>
                            Use Default Location
                        </button>
                    ` : `
                        <button class="btn btn-primary" id="continueWithoutLocationBtn">
                            <span class="btn-icon">🗺️</span>
                            Continue with Default Location
                        </button>
                    `}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners
        if (geolocationSupported) {
            document.getElementById('allowLocationBtn').addEventListener('click', () => {
                this.getUserLocationAndInitialize();
                document.body.removeChild(modal);
            });

            document.getElementById('denyLocationBtn').addEventListener('click', () => {
                this.initializeWithDefaultLocation();
                document.body.removeChild(modal);
            });
        } else {
            document.getElementById('continueWithoutLocationBtn').addEventListener('click', () => {
                this.initializeWithDefaultLocation();
                document.body.removeChild(modal);
            });
        }
    }

    getUserLocationAndInitialize() {
        this.showToast('Getting your location...', 'success');
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                this.userLocation = { lat: latitude, lng: longitude };
                this.initializeMap(this.userLocation);
                this.showToast('Location found! Showing your area.', 'success');
            },
            (error) => {
                console.warn('Location access denied or failed:', error);
                this.initializeWithDefaultLocation();
                this.showToast('Using default location instead.', 'warning');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            }
        );
    }

    initializeWithDefaultLocation() {
        const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // New York City
        this.initializeMap(defaultLocation);
    }

    initializeMap(centerLocation) {
        this.setupMap(centerLocation);
        this.setupEventListeners();
        this.initAutocomplete();
        this.loadLocations();
        this.hideLoading();
    }

    setupMap(centerLocation = { lat: 40.7128, lng: -74.0060 }) {
        this.map = new google.maps.Map(document.getElementById('map'), {
            center: centerLocation,
            zoom: 13,
            disableDefaultUI: true,
            styles: [
    {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "all",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#000000"
            },
            {
                "lightness": 13
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#144b53"
            },
            {
                "lightness": 14
            },
            {
                "weight": 1.4
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#08304b"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#0c4152"
            },
            {
                "lightness": 5
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#0b434f"
            },
            {
                "lightness": 25
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry.stroke",
        "stylers": [
            {
                "color": "#0b3d51"
            },
            {
                "lightness": 16
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#000000"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "color": "#146474"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#021019"
            }
        ]
    }
]
        });

        this.map.addListener('tilesloaded', () => {
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
            this.map.setZoom(this.map.getZoom() + 1);
        });

        document.getElementById('zoomOutBtn').addEventListener('click', () => {
            this.map.setZoom(this.map.getZoom() - 1);
        });

        document.getElementById('resetViewBtn').addEventListener('click', () => {
            const currentCenter = this.map.getCenter();
            this.map.setCenter(currentCenter);
            this.map.setZoom(13);
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
            card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        return card;
    }

    addMarkersToMap() {
        this.markers.forEach(marker => marker.setMap(null));
        this.markers.clear();

        const filtered = this.currentFilter === 'all' 
            ? this.locations 
            : this.locations.filter(l => l.category === this.currentFilter);

        filtered.forEach(location => {
            const marker = this.createCustomMarker(location);
            this.markers.set(location.id, marker);
        });
    }

    createCustomMarker(location) {
        const categoryIcons = {
            restaurant: '🍽️',
            park: '🌳',
            museum: '🏛️',
            landmark: '🗼',
            shopping: '🛍️',
            default: '📍'
        };

        const iconLabel = categoryIcons[location.category] || categoryIcons.default;

        const marker = new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: this.map,
            label: {
                text: iconLabel,
                fontSize: '14px',
                color: '#fff',
                fontWeight: 'bold'
            },
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: this.getCategoryColor(location.category),
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 2,
                scale: 10
            }
        });

        const content = `
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
                    <button class="popup-btn" onclick="atlasExplorer.getDirections(${location.lat}, ${location.lng})">📍 Directions</button>
                    <button class="popup-btn" onclick="atlasExplorer.shareLocation('${location.name}', ${location.lat}, ${location.lng})">📤 Share</button>
                </div>
            </div>
        `;

        const infoWindow = new google.maps.InfoWindow({ content });

        marker.addListener('click', () => {
            infoWindow.open(this.map, marker);
        });

        return marker;
    }

    getCategoryColor(category) {
        const colors = {
            restaurant: '#ef4444',
            park: '#22c55e',
            museum: '#8b5cf6',
            landmark: '#f59e0b',
            shopping: '#ec4899',
            default: '#10b981'
        };
        return colors[category] || colors.default;
    }

    handleSearch() {
        const input = document.getElementById('searchInput');
        const query = input.value.trim();

        if (!query) {
            this.showToast('Please enter a search term', 'warning');
            return;
        }

        const service = new google.maps.places.PlacesService(this.map);
        const request = {
            query: query,
            fields: ['name', 'geometry'],
            bounds: this.map.getBounds()
        };

        service.findPlaceFromQuery(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                const place = results[0];
                const location = place.geometry.location;
                this.map.setCenter(location);
                this.map.setZoom(15);
                this.showToast(`Found: ${place.name}`, 'success');
                this.fetchNearbyPlaces(location);
            } else {
                this.showToast('Location not found', 'error');
            }
        });
    }

    initAutocomplete() {
        const input = document.getElementById("searchInput");
        const autocomplete = new google.maps.places.Autocomplete(input, {
            types: ['geocode'],
            fields: ['geometry', 'name']
        });

        autocomplete.bindTo("bounds", this.map);

        autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) {
                this.showToast("Location not found", "error");
                return;
            }

            this.map.setCenter(place.geometry.location);
            this.map.setZoom(15);

            this.showToast(`Found: ${place.name}`, 'success');
            this.fetchNearbyPlaces(place.geometry.location);
        });
    }

    fetchNearbyPlaces(center) {
        const categoryMap = {
            restaurant: 'restaurant',
            park: 'park',
            museum: 'museum',
            landmark: 'tourist_attraction',
            shopping: 'shopping_mall',
            all: null
        };

        const selectedType = categoryMap[this.currentFilter];

        const service = new google.maps.places.PlacesService(this.map);

        const request = {
            location: center,
            radius: 3000,
            type: selectedType || undefined
        };

        service.nearbySearch(request, (results, status) => {
            this.locations = [];
            this.markers.forEach(m => m.setMap(null));
            this.markers.clear();

            if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
                this.locations = results.map(place => ({
                    id: place.place_id,
                    name: place.name,
                    category: this.currentFilter || 'unknown',
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    description: place.vicinity || 'No description available.',
                    rating: place.rating || 0,
                    reviews: place.user_ratings_total || 0,
                    image: this.getCategoryEmoji(this.currentFilter),
                    details: place.opening_hours?.open_now ? 'Open now' : 'Closed'
                }));

                this.renderLocations();
                this.addMarkersToMap();
                this.updateStats();
            } else {
                this.showToast('No nearby places found', 'warning');
                this.renderLocations();
                this.updateStats();
            }
        });
    }

    getCategoryEmoji(category) {
        const icons = {
            restaurant: '🍽️',
            park: '🌳',
            museum: '🏛️',
            landmark: '🗼',
            shopping: '🛍️',
            default: '📍'
        };
        return icons[category] || icons.default;
    }

    handleFilter(category) {
        this.currentFilter = category;

        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        const center = this.map.getCenter();
        if (center) {
            this.fetchNearbyPlaces(center);
        } else {
            this.showToast("Map not ready", "error");
        }
    }

    focusOnLocation(location) {
        this.map.panTo({ lat: location.lat, lng: location.lng });
        this.map.setZoom(16);
        
        const marker = this.markers.get(location.id);
        if (marker) google.maps.event.trigger(marker, 'click');
    }

    getUserLocation() {
        if (!navigator.geolocation) {
            this.showToast('Geolocation is not supported', 'error');
            return;
        }

        this.showToast('Locating...', 'success');

        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            this.userLocation = { lat: latitude, lng: longitude };

            if (this.userLocationMarker) {
                this.userLocationMarker.setMap(null);
            }

            this.userLocationMarker = new google.maps.Marker({
                position: { lat: latitude, lng: longitude },
                map: this.map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 9,
                    fillColor: '#f91717ff',
                    fillOpacity: 1,
                    strokeColor: '#fff',
                    strokeWeight: 2
                },
                title: 'Your Location'
            });

            this.map.panTo(this.userLocation);
            this.map.setZoom(14);
            this.showToast('Location found!', 'success');
        }, (error) => {
            this.showToast('Failed to get location', 'error');
        });
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
        const appContainer = document.querySelector('.app-container');

        this.isSidebarOpen = !this.isSidebarOpen;

        sidebar.classList.toggle('collapsed', !this.isSidebarOpen);
        appContainer.classList.toggle('sidebar-collapsed', !this.isSidebarOpen);
        toggleIcon.textContent = this.isSidebarOpen ? '‹' : '›';

        google.maps.event.trigger(this.map, 'resize');
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