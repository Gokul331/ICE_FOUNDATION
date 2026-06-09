import axios from "axios";

const API_URL = "https://ice-foundation-1.onrender.com";

const API = axios.create({
  baseURL: `${API_URL}/api`,
});

// Remove token interceptor - no authentication needed
API.interceptors.request.use(
  (config) => {
    // No token added - public access only
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (keep for error handling but remove auth-related)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ==================== PUBLIC ENDPOINTS (No Auth Required) ====================

// Password reset - Public
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

// ==================== HIERARCHICAL SELECTION ENDPOINTS ====================

/**
 * Get all colleges with their categories for dropdown initialization
 * @returns {Promise} List of colleges with category information
 */
export const getAllCollegesWithCategories = async () => {
  try {
    const response = await API.get("colleges/with-categories/");
    return response.data;
  } catch (error) {
    console.error("Error fetching colleges with categories:", error);
    throw error;
  }
};

/**
 * Step 1 & 2: Get categories offered by a specific college
 * @param {number} collegeId - The college ID
 * @returns {Promise} List of categories for the college
 */
export const getCollegeCategories = async (collegeId) => {
  try {
    const response = await API.get(`colleges/${collegeId}/categories/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching categories for college ${collegeId}:`, error);
    throw error;
  }
};

/**
 * Step 3: Get degree types for a specific college and category
 * @param {number} collegeId - The college ID
 * @param {string} category - The course category code
 * @returns {Promise} List of degree types for the category
 */
export const getCategoryDegreeTypes = async (collegeId, category) => {
  try {
    const response = await API.get(`colleges/${collegeId}/categories/${category}/degree-types/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching degree types for college ${collegeId} category ${category}:`, error);
    throw error;
  }
};

/**
 * Step 4: Get courses for a specific college, category, and degree type
 * @param {number} collegeId - The college ID
 * @param {string} category - The course category code
 * @param {string} degreeType - The degree type code (ug, pg, diploma, etc.)
 * @returns {Promise} List of courses matching the criteria
 */
export const getDegreeCourses = async (collegeId, category, degreeType) => {
  try {
    const response = await API.get(`colleges/${collegeId}/categories/${category}/degrees/${degreeType}/courses/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching courses:`, error);
    throw error;
  }
};

/**
 * Get detailed course information for the final selection
 * @param {number} courseId - The course ID
 * @returns {Promise} Detailed course information
 */
export const getCourseDetailsForSelection = async (courseId) => {
  try {
    const response = await API.get(`courses/${courseId}/details/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching course details for ${courseId}:`, error);
    throw error;
  }
};

/**
 * Get complete college hierarchy (all categories, degrees, courses at once)
 * @param {number} collegeId - The college ID
 * @returns {Promise} Complete hierarchical data for the college
 */
export const getCollegeHierarchy = async (collegeId) => {
  try {
    const response = await API.get(`colleges/${collegeId}/hierarchy/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching college hierarchy for ${collegeId}:`, error);
    throw error;
  }
};

/**
 * Submit application - No authentication required
 * @param {FormData} formData - Form data including selected_course_id
 * @returns {Promise} Submission response
 */
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

// ==================== COLLEGE IMAGE ENDPOINTS ====================

/**
 * Get college gallery images
 * @param {number} collegeId - The college ID
 * @returns {Promise} Gallery data including all images
 */
export const getCollegeGallery = async (collegeId) => {
  try {
    const response = await API.get(`colleges/${collegeId}/gallery/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching gallery for college ${collegeId}:`, error);
    throw error;
  }
};

/**
 * Get college images by category
 * @param {number} collegeId - The college ID
 * @param {string} category - 'general' or 'campus'
 * @returns {Promise} Images for the specified category
 */
export const getCollegeImagesByCategory = async (collegeId, category) => {
  try {
    const response = await API.get(`colleges/${collegeId}/gallery/${category}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${category} images:`, error);
    throw error;
  }
};

/**
 * Get featured colleges for homepage
 * @param {number} limit - Number of colleges to fetch
 * @returns {Promise} List of featured colleges
 */
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

/**
 * Get all course categories with statistics
 * @returns {Promise} Categories with college and course counts
 */
export const getCourseCategories = async () => {
  try {
    const response = await API.get("colleges/categories/");
    return response.data;
  } catch (error) {
    console.error("Error fetching course categories:", error);
    throw error;
  }
};

/**
 * Get colleges filtered by course categories
 * @param {Object} params - Filter parameters (categories, city, state, etc.)
 * @returns {Promise} Filtered colleges
 */
export const getCollegesByCategory = async (params) => {
  try {
    const response = await API.get("colleges/by-category/", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching colleges by category:", error);
    throw error;
  }
};

/**
 * Get courses filtered by category
 * @param {Object} params - Filter parameters
 * @returns {Promise} Filtered courses
 */
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

// Submit application - No authentication required
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

// ==================== USAGE EXAMPLE ====================
/*
// Example: Implementing the 4-step selection process

async function loadColleges() {
  const response = await getAllCollegesWithCategories();
  const colleges = response.colleges;
  // Populate college dropdown
}

async function onCollegeSelect(collegeId) {
  // Step 1 & 2: Load categories for selected college
  const categoriesRes = await getCollegeCategories(collegeId);
  const categories = categoriesRes.categories;
  // Populate category dropdown
}

async function onCategorySelect(collegeId, category) {
  // Step 3: Load degree types for selected category
  const degreeTypesRes = await getCategoryDegreeTypes(collegeId, category);
  const degreeTypes = degreeTypesRes.degree_types;
  // Populate degree type dropdown
}

async function onDegreeTypeSelect(collegeId, category, degreeType) {
  // Step 4: Load courses for selected degree type
  const coursesRes = await getDegreeCourses(collegeId, category, degreeType);
  const courses = coursesRes.courses;
  // Populate course dropdown
}

async function onCourseSelect(courseId) {
  // Get detailed course information
  const courseDetails = await getCourseDetailsForSelection(courseId);
  // Display course details to user
}

async function submitApplication(courseId, formData) {
  formData.append('selected_course_id', courseId);
  const result = await submitApplicationV2(formData);
  console.log('Application submitted:', result);
}
*/

export default API;