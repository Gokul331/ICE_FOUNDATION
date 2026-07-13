import axios from "axios";

const API_URL = "https://ice-foundation-1.onrender.com";

const API = axios.create({
  baseURL: `${API_URL}/api`,
});

// No authentication interceptor - public access only
API.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ==================== PUBLIC ENDPOINTS ====================

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

// Colleges
export const getColleges = async (params) => {
  try {
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

// Hostels
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

// Courses
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

export const getCourseFees = async (courseId) => {
  try {
    const response = await API.get(`courses/${courseId}/fees/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching fees for course ${courseId}:`, error);
    return [];
  }
};

// Fees
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

// Timeline Events
export const getTimelineEvents = async (params) => {
  try {
    const response = await API.get("timeline/", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching timeline events:", error);
    throw error;
  }
};

// ==================== HIERARCHICAL SELECTION ENDPOINTS ====================

export const getAllCollegesWithCategories = async () => {
  try {
    const response = await API.get("colleges/with-categories/");
    return response.data;
  } catch (error) {
    console.error("Error fetching colleges with categories:", error);
    throw error;
  }
};

export const getCollegeCategories = async (collegeId) => {
  try {
    const response = await API.get(`colleges/${collegeId}/categories/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching categories for college ${collegeId}:`, error);
    throw error;
  }
};

export const getCategoryDegreeTypes = async (collegeId, category) => {
  try {
    const response = await API.get(`colleges/${collegeId}/categories/${category}/degree-types/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching degree types for college ${collegeId} category ${category}:`, error);
    throw error;
  }
};

export const getDegreeCourses = async (collegeId, category, degreeType) => {
  try {
    const response = await API.get(`colleges/${collegeId}/categories/${category}/degrees/${degreeType}/courses/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching courses:`, error);
    throw error;
  }
};

export const getCourseDetailsForSelection = async (courseId) => {
  try {
    const response = await API.get(`courses/${courseId}/details/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching course details for ${courseId}:`, error);
    throw error;
  }
};

export const getCollegeHierarchy = async (collegeId) => {
  try {
    const response = await API.get(`colleges/${collegeId}/hierarchy/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching college hierarchy for ${collegeId}:`, error);
    throw error;
  }
};

// ==================== COLLEGE IMAGE ENDPOINTS ====================

export const getCollegeGallery = async (collegeId) => {
  try {
    const response = await API.get(`colleges/${collegeId}/gallery/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching gallery for college ${collegeId}:`, error);
    throw error;
  }
};

export const getCollegeImagesByCategory = async (collegeId, category) => {
  try {
    const response = await API.get(`colleges/${collegeId}/gallery/${category}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${category} images:`, error);
    throw error;
  }
};

export const getFeaturedColleges = async (limit = 6) => {
  try {
    const response = await API.get(`colleges/featured/`, { params: { limit } });
    return response.data;
  } catch (error) {
    console.error("Error fetching featured colleges:", error);
    throw error;
  }
};

// ==================== COURSE CATEGORY ENDPOINTS ====================

export const getCourseCategories = async () => {
  try {
    const response = await API.get("colleges/categories/");
    return response.data;
  } catch (error) {
    console.error("Error fetching course categories:", error);
    throw error;
  }
};

export const getCollegesByCategory = async (params) => {
  try {
    const response = await API.get("colleges/by-category/", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching colleges by category:", error);
    throw error;
  }
};

export const getCoursesByCategory = async (params) => {
  try {
    const response = await API.get("courses/categories/", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching courses by category:", error);
    throw error;
  }
};

// ==================== APPLICATION FORM ====================

export const getApplicationFormData = async () => {
  try {
    const response = await API.get('application-form-data/');
    return response.data;
  } catch (error) {
    console.error('Error fetching application form data:', error);
    throw error;
  }
};

// Submit application - NO AUTHENTICATION REQUIRED
export const submitApplication = async (formData) => {
  try {
    const response = await API.post('/submit-application/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting application:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export const submitApplicationV2 = async (formData) => {
  try {
    const response = await API.post('/submit-application-v2/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting application V2:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export const submitScholarshipApplication = async (formData) => {
  try {
    const response = await API.post('/submit-scholarship-application/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting scholarship application:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

// Get applications (public)
export const getMyApplications = async () => {
  try {
    const response = await API.get('/my-applications/');
    return response.data;
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
};

// Download application PDF
export const downloadApplicationPDF = async (applicationId) => {
  try {
    const response = await API.get(`/download-application-pdf/${applicationId}/`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error;
  }
};

// Get single application details
export const getApplicationDetail = async (applicationId) => {
  try {
    const response = await API.get(`/my-applications/${applicationId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching application detail:', error);
    throw error;
  }
};

export default API;