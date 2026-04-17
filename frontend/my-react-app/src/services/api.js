import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});

// Colleges
export const getColleges = (params) => API.get("colleges/", { params });
export const getCollegeDetail = (id) => API.get(`colleges/${id}/`);
export const suggestColleges = (params) => API.get("colleges/suggest/", { params });

// Courses
export const getCourses = (params) => API.get("courses/", { params });
export const getCourseDetail = (id) => API.get(`courses/${id}/`);

// User Profiles
export const getProfiles = () => API.get("profiles/");
export const getProfileDetail = (id) => API.get(`profiles/${id}/`);
export const createProfile = (data) => API.post("profiles/", data);
export const updateProfile = (id, data) => API.patch(`profiles/${id}/`, data);

// Companies
export const getCompanies = () => API.get("companies/");
export const getCompanyDetail = (id) => API.get(`companies/${id}/`);

// Timeline Events
export const getTimelineEvents = (params) => API.get("timeline/", { params });
