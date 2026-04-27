import axios from "axios";

const API_URL = "https://ice-foundation-1.onrender.com";

const API = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add a request interceptor to add token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.warn('Authentication failed. Clearing stored token.');
      // Clear invalid token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Optional: Redirect to login page
      // window.location.href = '/login';
    }
    
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ==================== AUTHENTICATION ====================

// Password reset
export const requestPasswordReset = async (email) => {
  try {
    const response = await API.post("password-reset/", { email });
    return response.data;
  } catch (error) {
    console.error("Error requesting password reset:", error);
    throw error;
  }
};

export const confirmPasswordReset = async (resetData) => {
  try {
    const response = await API.post("password-reset-confirm/", resetData);
    return response.data;
  } catch (error) {
    console.error("Error confirming password reset:", error);
    throw error;
  }
};

// Colleges - Public
export const getColleges = async (params) => {
  try {
    // Remove any Authorization header for this request
    const response = await API.get("colleges/", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching colleges:", error);
    throw error;
  }
};

export const getCollegeDetail = async (id) => {
  try {
    const response = await API.get(`colleges/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching college ${id}:`, error);
    throw error;
  }
};

export const getCollegeCourses = async (collegeId) => {
  try {
    const response = await API.get(`colleges/${collegeId}/courses/`);
    return response.data;
  } catch (error) {
    console.log(`No courses found for college ${collegeId}`);
    return [];
  }
};

export const getCollegeFees = async (collegeId, params = {}) => {
  try {
    const response = await API.get(`colleges/${collegeId}/fees/`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error fetching fees for college ${collegeId}:`, error);
    return [];
  }
};

// Hostels - Public
export const getCollegeHostels = async (collegeId) => {
  try {
    const response = await API.get(`colleges/${collegeId}/hostels/`);
    return response.data;
  } catch (error) {
    console.log(`No hostels found for college ${collegeId}`);
    return [];
  }
};

export const getHostelDetail = async (hostelId) => {
  try {
    const response = await API.get(`hostels/${hostelId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching hostel ${hostelId}:`, error);
    throw error;
  }
};

export const getAvailableHostels = async (params = {}) => {
  try {
    const response = await API.get("hostels/", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching available hostels:", error);
    throw error;
  }
};

export const getHostelByRoomType = async (collegeId, roomType) => {
  try {
    const response = await API.get(`colleges/${collegeId}/hostels/${roomType}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching hostel with room type ${roomType}:`, error);
    throw error;
  }
};

export const suggestColleges = async (params) => {
  try {
    const response = await API.get("colleges/suggest/", { params });
    return response.data;
  } catch (error) {
    console.error("Error suggesting colleges:", error);
    throw error;
  }
};

// Courses - Public
export const getCourses = async (params) => {
  try {
    const response = await API.get("courses/", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};

export const getCourseDetail = async (id) => {
  try {
    const response = await API.get(`courses/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching course ${id}:`, error);
    throw error;
  }
};

// Get course fees
export const getCourseFees = async (courseId) => {
  try {
    const response = await API.get(`courses/${courseId}/fees/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching fees for course ${courseId}:`, error);
    return [];
  }
};

// Fees - Public
export const getFilteredFees = async (params = {}) => {
  try {
    const response = await API.get("fees/filter/", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching filtered fees:", error);
    throw error;
  }
};

export const getFeeDetail = async (feeId) => {
  try {
    const response = await API.get(`fees/${feeId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching fee ${feeId}:`, error);
    throw error;
  }
};

export const getFeeStatistics = async (params = {}) => {
  try {
    const response = await API.get("fees/statistics/", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching fee statistics:", error);
    throw error;
  }
};

export const getFeeComparison = async (collegeIds, params = {}) => {
  try {
    const queryParams = { ...params, college_ids: collegeIds };
    const response = await API.get("fees/comparison/", { params: queryParams });
    return response.data;
  } catch (error) {
    console.error("Error fetching fee comparison:", error);
    throw error;
  }
};

// Timeline Events - Public
export const getTimelineEvents = async (params) => {
  try {
    const response = await API.get("timeline/", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching timeline events:", error);
    throw error;
  }
};

// ==================== AUTH ENDPOINTS (No Auth Required) ====================

export const register = async (userData) => {
  try {
    const response = await API.post("register/", userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    console.error("Error registering:", error);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await API.post("login/", credentials);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      await API.post("logout/", {}, {
        headers: { Authorization: `Token ${token}` }
      });
    }
  } catch (error) {
    console.error("Error logging out:", error);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

export const checkAuth = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return { isAuthenticated: false };
    
    const response = await API.get("check-auth/", {
      headers: { Authorization: `Token ${token}` }
    });
    return response.data;
  } catch (error) {
    return { isAuthenticated: false };
  }
};

// ==================== PROTECTED ENDPOINTS (Requires Auth) ====================

export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await API.get("profile/", {
      headers: { Authorization: `Token ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const updateUserProfile = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await API.put("profile/", data, {
      headers: { Authorization: `Token ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// User Profiles - Admin/Protected
export const getProfiles = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await API.get("user-profiles/", {
      headers: { Authorization: `Token ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching profiles:", error);
    throw error;
  }
};

export const getProfileDetail = async (id) => {
  try {
    const token = localStorage.getItem("token");
    const response = await API.get(`user-profiles/${id}/`, {
      headers: { Authorization: `Token ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching profile ${id}:`, error);
    throw error;
  }
};

export const createProfile = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await API.post("user-profiles/", data, {
      headers: { Authorization: `Token ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error creating profile:", error);
    throw error;
  }
};

export const updateProfile = async (id, data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await API.patch(`user-profiles/${id}/`, data, {
      headers: { Authorization: `Token ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating profile ${id}:`, error);
    throw error;
  }
};

// ==================== PROFILE UPDATE & PASSWORD CHANGE (Requires Auth) ====================

export const getCurrentUserProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await API.get("/profile/me/", {
      headers: { Authorization: `Token ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching current user profile:", error);
    throw error;
  }
};

export const updateCurrentUserProfile = async (profileData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await API.put("/profile/update/", profileData, {
      headers: { Authorization: `Token ${token}` }
    });
    
    // Update localStorage with new user data
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

export const patchCurrentUserProfile = async (profileData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await API.patch("/profile/update/", profileData, {
      headers: { Authorization: `Token ${token}` }
    });
    
    // Update localStorage with new user data
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error("Error patching profile:", error);
    throw error;
  }
};

export const createOrUpdateProfile = async (profileData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await API.post("/profile/create-update/", profileData, {
      headers: { Authorization: `Token ${token}` }
    });
    
    // Update localStorage with new user data
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error("Error creating/updating profile:", error);
    throw error;
  }
};

export const updateProfileById = async (profileId, profileData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await API.patch(`/profile/update/${profileId}/`, profileData, {
      headers: { Authorization: `Token ${token}` }
    });
    
    // Only update localStorage if it's the current user's profile
    if (response.data.user) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.id === response.data.user.id) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error updating profile ${profileId}:`, error);
    throw error;
  }
};

export const changePassword = async (passwordData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await API.post("/change-password/", passwordData, {
      headers: { Authorization: `Token ${token}` }
    });
    
    // Update token in localStorage if a new one is returned
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};

// ==================== HOSTEL APPLICATION (Requires Auth) ====================

export const applyForHostel = async (applicationData) => {
  try {
    const token = localStorage.getItem("token");
    const response = await API.post("/hostel/apply/", applicationData, {
      headers: { Authorization: `Token ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error("Error applying for hostel:", error);
    throw error;
  }
};

// ==================== APPLICATION FORM ====================

export const getApplicationFormData = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await API.get('application-form-data/', {
      headers: { Authorization: `Token ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching application form data:', error);
    throw error;
  }
};

// FIXED: Submit Application Function
export const submitApplication = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found. Please login again.');
    }
    
    const response = await API.post('/submit-application/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Token ${token}`,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error submitting application:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

// ==================== HELPER FUNCTIONS ====================

// Helper function to get user data from localStorage
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

// Helper function to check if user is staff
export const isStaff = () => {
  const user = getStoredUser();
  return user?.is_staff || false;
};

// Helper function to get auth token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to clear auth data
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export default API;