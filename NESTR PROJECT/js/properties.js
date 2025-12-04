// Properties Service with Backend API Integration
console.log('Loading properties.js...');

class PropertyService {
    static init() {
        console.log('PropertyService initialized');
    }

    // Get all properties from backend
    static async getProperties(filters = {}) {
        try {
            let url = '/api/properties';
            const params = new URLSearchParams();
            
            if (filters.search) params.append('search', filters.search);
            if (filters.state && filters.state !== 'all') params.append('state', filters.state);
            if (filters.city && filters.city !== 'all') params.append('city', filters.city);
            if (filters.type && filters.type !== 'all') params.append('type', filters.type);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.bedrooms) params.append('bedrooms', filters.bedrooms);
            
            if (params.toString()) {
                url += '?' + params.toString();
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch properties');
            }
            
            return data.properties || [];
        } catch (error) {
            console.error('Error getting properties:', error);
            return [];
        }
    }

    // Get property by ID
    static async getPropertyById(id) {
        try {
            const response = await fetch(`/api/properties/${id}`);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch property');
            }
            
            return data.property || null;
        } catch (error) {
            console.error('Error getting property:', error);
            return null;
        }
    }

    // Create new property
    static async createProperty(propertyData) {
        try {
            Utils.showLoading();
            
            const user = Utils.getCurrentUser();
            if (!user || user.role !== 'landlord') {
                throw new Error('Only landlords can create properties');
            }

            const token = localStorage.getItem('user_token');
            const response = await fetch('/api/properties', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(propertyData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to create property');
            }
            
            Utils.showNotification('Property listed successfully!', 'success');
            return data.property;
        } catch (error) {
            console.error('Create property error:', error);
            Utils.showNotification(error.message, 'error');
            throw error;
        } finally {
            Utils.hideLoading();
        }
    }

    // Upload image for property
    static async uploadImage(file, propertyId = null) {
        try {
            Utils.showLoading();
            
            const user = Utils.getCurrentUser();
            if (!user) {
                throw new Error('Must be logged in to upload');
            }

            const formData = new FormData();
            formData.append('file', file);
            if (propertyId) {
                formData.append('property_id', propertyId);
            }

            const token = localStorage.getItem('user_token');
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }
            
            Utils.showNotification('Image uploaded successfully!', 'success');
            return data;
        } catch (error) {
            console.error('Upload error:', error);
            Utils.showNotification(error.message, 'error');
            throw error;
        } finally {
            Utils.hideLoading();
        }
    }

    // Like/unlike property
    static async likeProperty(propertyId) {
        try {
            const user = Utils.getCurrentUser();
            if (!user) {
                Utils.showNotification('Please login to like properties', 'warning');
                return null;
            }

            const token = localStorage.getItem('user_token');
            const response = await fetch(`/api/properties/${propertyId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Like action failed');
            }
            
            Utils.showNotification(data.action === 'liked' ? 'Property liked!' : 'Property unliked', 'success');
            return data.property;
        } catch (error) {
            console.error('Like error:', error);
            Utils.showNotification(error.message, 'error');
            return null;
        }
    }
}

// Make PropertyService available globally
window.PropertyService = PropertyService;
console.log('PropertyService loaded successfully');