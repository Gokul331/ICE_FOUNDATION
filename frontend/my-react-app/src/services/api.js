import axios from "axios";

const API = axios.create({
  baseURL: "https://ice-foundation-1.onrender.com/api",
});

// Add a response interceptor to handle errors consistently
API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Colleges
export const getColleges = async (params) => {
  try {
    const response = await API.get("colleges/", { params });
    return response.data; // Return just the data
  } catch (error) {
    console.error("Error fetching colleges:", error);
    throw error;
  }
};

export const getCollegeDetail = async (id) => {
  try {
    const response = await API.get(`colleges/${id}/`);
    return response.data; // Return just the data
  } catch (error) {
    console.error(`Error fetching college ${id}:`, error);
    throw error;
  }
};

export const getCollegeCourses = async (collegeId) => {
  try {
    // Try to fetch courses for this college
    const response = await API.get(`colleges/${collegeId}/courses/`);
    return response.data;
  } catch (error) {
    // If courses endpoint doesn't exist, return empty array
    console.log(`No courses found for college ${collegeId},`, error);
    return []; // Return empty array instead of throwing
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

// User Profiles
export const getProfiles = async () => {
  try {
    const response = await API.get("profiles/");
    return response.data;
  } catch (error) {
    console.error("Error fetching profiles:", error);
    throw error;
  }
};

export const getProfileDetail = async (id) => {
  try {
    const response = await API.get(`profiles/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching profile ${id}:`, error);
    throw error;
  }
};

export const createProfile = async (data) => {
  try {
    const response = await API.post("profiles/", data);
    return response.data;
  } catch (error) {
    console.error("Error creating profile:", error);
    throw error;
  }
};

export const updateProfile = async (id, data) => {
  try {
    const response = await API.patch(`profiles/${id}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating profile ${id}:`, error);
    throw error;
  }
};

// Companies
export const getCompanies = async () => {
  try {
    const response = await API.get("companies/");
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
};

export const getCompanyDetail = async (id) => {
  try {
    const response = await API.get(`companies/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching company ${id}:`, error);
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