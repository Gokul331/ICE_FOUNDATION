import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import { getColleges, getCollegeCourses } from "../services/api";
import Footer from "./Footer";
import "../styles/colleges.css";
import { FaBars, FaExternalLinkAlt, FaHeart, FaMapMarkerAlt, FaSearch, FaTh, FaFilter, FaSortAmountDown, FaChevronDown } from "react-icons/fa";

/* ── animation helpers ── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

function CollegeImageDisplay({ college, getLogoLetters }) {
  // Use all_images from serializer or combine college_images and campus_images
  const allImages = Array.isArray(college.all_images)
    ? college.all_images.filter(Boolean)
    : (college.college_images || []).concat(college.campus_images || []).filter(Boolean);

  const fallbackImage = college.banner_image || "";
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasImageError, setHasImageError] = useState(false);

  const rotationInterval = 5000;
  const zoomAmount = 1.03;

  useEffect(() => {
    if (allImages.length <= 1) return;

    const interval = window.setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    }, rotationInterval);

    return () => window.clearInterval(interval);
  }, [allImages.length, rotationInterval]);

  const hasImages = allImages.length > 0;
  const activeImage = hasImages ? allImages[currentImageIndex] : fallbackImage;
  const shouldShowImage = hasImages || (fallbackImage && !hasImageError);

  return (
    <div className="card-image-box">
      {shouldShowImage ? (
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImage}
            src={activeImage}
            alt={college.college_name || college.name}
            className="card-image"
            initial={{ opacity: 0, scale: zoomAmount + 0.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: zoomAmount }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            onError={() => setHasImageError(true)}
          />
        </AnimatePresence>
      ) : (
        <div className="card-image-placeholder">
          <div className="card-image-placeholder-badge">
            {getLogoLetters(college.college_name || college.name)}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionReveal({ children, className, delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { delay, duration: 0.5 } }
      }}
    >
      {children}
    </motion.div>
  );
}

// Mobile Filter Drawer Component
function MobileFilterDrawer({ filters, setFilters, uniqueCities, uniqueCategories, isOpen, onClose }) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    setFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({ city: "All", category: "All" });
    setFilters({ city: "All", category: "All" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="mobile-filter-overlay" onClick={onClose}>
      <div className="mobile-filter-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-filter-header">
          <h3>Filter Colleges</h3>
          <button className="mobile-filter-close" onClick={onClose}>×</button>
        </div>

        <div className="mobile-filter-content">
          <div className="mobile-filter-group">
            <label>City</label>
            <select
              value={localFilters.city}
              onChange={(e) => setLocalFilters({ ...localFilters, city: e.target.value })}
            >
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className="mobile-filter-group">
            <label>Course Category</label>
            <select
              value={localFilters.category}
              onChange={(e) => setLocalFilters({ ...localFilters, category: e.target.value })}
            >
              {uniqueCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mobile-filter-actions">
          <button className="filter-reset-btn" onClick={handleReset}>Reset</button>
          <button className="filter-apply-btn" onClick={handleApply}>Apply Filters</button>
        </div>
      </div>
    </div>
  );
}

function Colleges() {
  const navigate = useNavigate();
  const [colleges, setColleges] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({ city: "All", category: "All" });
  const [sortBy, setSortBy] = useState("popularity");
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Priority order for cities (popularity based)
  const cityPriorityOrder = ["TRICHY", "Perambalur", "Coimbatore"];

  // Check screen size for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get unique cities for filters with priority sorting
  const uniqueCities = useMemo(() => {
    const cities = new Set();
    colleges.forEach(college => {
      if (college.location_city) cities.add(college.location_city);
    });

    const cityArray = Array.from(cities);

    // Sort cities: priority cities first, then alphabetical
    const priorityCities = cityArray.filter(city => cityPriorityOrder.includes(city));
    const otherCities = cityArray.filter(city => !cityPriorityOrder.includes(city)).sort();

    // Sort priority cities according to the priority order
    priorityCities.sort((a, b) => {
      return cityPriorityOrder.indexOf(a) - cityPriorityOrder.indexOf(b);
    });

    return ["All", ...priorityCities, ...otherCities];
  }, [colleges]);

  // Get unique categories from courses_offered_display array
  const uniqueCategories = useMemo(() => {
    const categories = new Set();
    colleges.forEach(college => {
      // Handle courses_offered_display as an array
      if (college.courses_offered_display && Array.isArray(college.courses_offered_display)) {
        college.courses_offered_display.forEach(course => {
          if (course && typeof course === 'string') {
            categories.add(course);
          }
        });
      }
      // Fallback to courses_offered string if available
      else if (college.courses_offered && typeof college.courses_offered === 'string') {
        categories.add(college.courses_offered);
      }
      // Fallback to category field
      else if (college.category && typeof college.category === 'string') {
        categories.add(college.category);
      }
    });
    return ["All", ...Array.from(categories).sort()];
  }, [colleges]);

  const getLogoLetters = (name) => {
    if (!name) return "CL";
    return name.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
  };

  const handleApplyNow = (college) => {
    const collegeData = {
      college_id: college.college_id || college.id,
      college_name: college.college_name || college.name,
    };
    // Direct navigation to application form without login check
    navigate("/application-form", { state: { college: collegeData, quotaType: "management" } });
  };

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoading(true);
        const data = await getColleges();
        const collegesArray = Array.isArray(data) ? data : (data.results || []);
        setColleges(collegesArray);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching colleges:", err);
        setError("Failed to load colleges");
        setLoading(false);
      }
    };
    fetchColleges();
  }, []);

  const filteredAndSortedColleges = useMemo(() => {
    let filtered = colleges.filter(college => {
      const name = college.college_name || college.name || "";
      const city = college.location_city || "";

      // Check if college matches selected category
      let matchesCategory = filters.category === "All";
      if (!matchesCategory && filters.category !== "All") {
        // Check courses_offered_display array
        if (college.courses_offered_display && Array.isArray(college.courses_offered_display)) {
          matchesCategory = college.courses_offered_display.includes(filters.category);
        }
        // Fallback to courses_offered string
        else if (college.courses_offered && typeof college.courses_offered === 'string') {
          matchesCategory = college.courses_offered === filters.category;
        }
        // Fallback to category field
        else if (college.category && typeof college.category === 'string') {
          matchesCategory = college.category === filters.category;
        }
      }

      const matchesSearch = searchQuery === "" ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCity = filters.city === "All" || city === filters.city;

      return matchesSearch && matchesCity && matchesCategory;
    });

    // Sorting logic with popularity-based default
    filtered.sort((a, b) => {
      const nameA = a.college_name || a.name || "";
      const nameB = b.college_name || b.name || "";
      const cityA = a.location_city || "";
      const cityB = b.location_city || "";

      switch (sortBy) {
        case "name":
          return nameA.localeCompare(nameB);

        case "rating":
          return (b.rating || 0) - (a.rating || 0);

        case "popularity":
        default:
          // Popularity-based sorting: Priority cities first (Trichy, Perambalur, Coimbatore)
          const getCityPriority = (city) => {
            const index = cityPriorityOrder.indexOf(city);
            return index === -1 ? 999 : index;
          };

          const priorityA = getCityPriority(cityA);
          const priorityB = getCityPriority(cityB);

          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }

          // If same priority, sort by name
          return nameA.localeCompare(nameB);
      }
    });

    return filtered;
  }, [colleges, searchQuery, filters, sortBy]);

  // Count active filters
  const activeFilterCount = (filters.city !== "All" ? 1 : 0) + (filters.category !== "All" ? 1 : 0);

  // Get display categories for the select dropdown
  const categoryOptions = useMemo(() => {
    return uniqueCategories.map(category => ({
      value: category,
      label: category === "All" ? "All Categories" : category
    }));
  }, [uniqueCategories]);

  return (
    <div className="colleges-page">
      <Navbar />

      {/* ── HERO ── */}
      <section className="colleges-hero">
        <div className="hero-bg-pattern" />
        <div className="container">
          <motion.div
            className="colleges-hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="section-label-premium">
              <span className="label-dot" />
              Institutions Directory
            </div>
            <h1>Explore Top <span className="title-highlight">Colleges</span></h1>
            <p>Discover India's premier educational institutions tailored to your career aspirations.</p>

            <div className="hero-search-box">
              <div className="search-input-wrapper">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search by college name or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FILTERS BAR (Responsive - No Horizontal Scroll) ── */}
      <div className="filters-sticky-bar">
        <div className="container">
          <div className="filters-layout">
            {/* Sticky search box */}
            <div className="sticky-search-box">
              <FaSearch className="sticky-search-icon" />
              <input
                type="text"
                className="sticky-search-input"
                placeholder="Search colleges or cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Desktop Filters - Hidden on mobile */}
            {!isMobile && (
              <>
                <div className="filter-select-group">
                  <div className="filter-select-wrapper">
                    <select
                      className="filter-select"
                      value={filters.city}
                      onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                    >
                      {uniqueCities.map(city => (
                        <option key={city} value={city}>
                          {city === "All" ? "All Cities" : city}
                        </option>
                      ))}
                    </select>
                    <FaChevronDown className="select-icon" />
                  </div>

                  <div className="filter-select-wrapper">
                    <select
                      className="filter-select"
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    >
                      {categoryOptions.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    <FaChevronDown className="select-icon" />
                  </div>
                </div>

                <div className="sort-view-controls">
                  <div className="sort-select-wrapper">
                    <FaSortAmountDown className="sort-icon" />
                    <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="popularity">Sort: Popularity</option>
                      <option value="name">Sort: Name A-Z</option>
                      <option value="rating">Sort: Rating</option>
                    </select>
                  </div>
                  <div className="view-toggle">
                    <button className={`vt-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}>
                      <FaTh />
                    </button>
                    <button className={`vt-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>
                      <FaBars />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Mobile Filters - Compact layout */}
            {isMobile && (
              <div className="mobile-filters-bar">
                <button
                  className="mobile-filter-trigger"
                  onClick={() => setIsMobileFilterOpen(true)}
                >
                  <FaFilter />
                  <span>Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="filter-badge">{activeFilterCount}</span>
                  )}
                </button>

                <div className="mobile-sort-view">
                  <div className="sort-select-wrapper mobile">
                    <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="popularity">Popularity</option>
                      <option value="name">Name A-Z</option>
                      <option value="rating">Rating</option>
                    </select>
                  </div>
                  <div className="view-toggle">
                    <button className={`vt-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}>
                      <FaTh />
                    </button>
                    <button className={`vt-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}>
                      <FaBars />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Chips (Mobile) */}
      {isMobile && activeFilterCount > 0 && (
        <div className="active-filter-chips">
          <div className="container">
            <div className="filter-chips-container">
              {filters.city !== "All" && (
                <span className="filter-chip-active">
                  City: {filters.city}
                  <button onClick={() => setFilters({ ...filters, city: "All" })}>×</button>
                </span>
              )}
              {filters.category !== "All" && (
                <span className="filter-chip-active">
                  Category: {filters.category}
                  <button onClick={() => setFilters({ ...filters, category: "All" })}>×</button>
                </span>
              )}
              <button
                className="clear-all-filters"
                onClick={() => setFilters({ city: "All", category: "All" })}
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        uniqueCities={uniqueCities}
        uniqueCategories={uniqueCategories}
      />

      {/* ── RESULTS ── */}
      <section className="results-section premium-3d-wrap">
        <div className="container">
          {loading ? (
            <div className="loading-grid">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton-card" />)}
            </div>
          ) : error ? (
            <div className="error-state">
              <h3>{error}</h3>
              <button onClick={() => window.location.reload()} className="btn-dark">Try Again</button>
            </div>
          ) : (
            <>
              <div className="results-count">
                Showing <strong>{filteredAndSortedColleges.length}</strong> institutions found
              </div>

              <div className={`colleges-${viewMode}`}>
                {filteredAndSortedColleges.map((college, i) => (
                  <SectionReveal key={college.college_id || college.id} className="college-card-wrapper" delay={i % 6 * 0.05}>
                    <div className="college-card-premium card-3d">
                      <CollegeImageDisplay college={college} getLogoLetters={getLogoLetters} />

                      <div className="card-details">
                        <div className="card-top">
                          <div className="card-logo">
                            {getLogoLetters(college.college_name || college.name)}
                          </div>
                          <div className="card-loc">
                            <FaMapMarkerAlt />
                            {college.location_city || "City"}, {college.location_state || "State"}
                          </div>
                        </div>

                        <h3 className="card-name">{college.college_name || college.name}</h3>

                        <div className="card-stats">
                          <div className="c-stat">
                            <span className="c-stat-label">Short Name</span>
                            <span className="c-stat-val">{college.short_name || "-"}</span>
                          </div>
                          <div className="c-stat">
                            <span className="c-stat-label">Courses</span>
                            <span className="c-stat-val">
                              {college.courses_offered_display?.length ||
                                college.courses_offered?.length || 0}
                            </span>
                          </div>
                        </div>

                        {/* Display course categories as chips */}
                        {college.courses_offered_display && college.courses_offered_display.length > 0 && (
                          <div className="course-categories">
                            {college.courses_offered_display.slice(0, 3).map((course, idx) => (
                              <span key={idx} className="course-chip">{course}</span>
                            ))}
                            {college.courses_offered_display.length > 3 && (
                              <span className="course-chip-more">+{college.courses_offered_display.length - 3}</span>
                            )}
                          </div>
                        )}

                        <div className="card-actions">
                          <Link to={`/colleges/${college.college_id || college.id}`} className="btn-view">
                            View Details
                          </Link>
                          <button className="btn-apply-card" onClick={() => handleApplyNow(college)}>
                            Apply Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </SectionReveal>
                ))}
              </div>

              {filteredAndSortedColleges.length === 0 && (
                <div className="no-results">
                  <p>No colleges found matching your criteria.</p>
                  <button onClick={() => {
                    setSearchQuery("");
                    setFilters({ city: "All", category: "All" });
                  }} className="btn-dark">Clear all filters</button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default Colleges;