import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { getColleges } from "../services/api";
import "../styles/home.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import img1 from "/1.jpg";
import img2 from "/2.jpg";
import img3 from "/3.jpg";
import img4 from "/4.jpg";

/* ── animation helpers ── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};
const stagger = (delay = 0) => ({
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: delay } },
});
const cardHover = { y: -8, boxShadow: "0 20px 40px rgba(37,86,105,0.12)" };

function SectionReveal({ children, className, delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={stagger(delay)}
    >
      {children}
    </motion.div>
  );
}

function Home() {
  const [colleges, setColleges] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const heroSlides = [
    {
      image: img1,
      badge: "Trusted by 100+ colleges across Tamil Nadu",
      lines: ["Bridge the gap to", "your dream", "college journey"],
      desc: "Personalized guidance, scholarship support, and admissions strategy from experts who know what top colleges want.",
      primaryLabel: "Start Your College Plan",
      primaryTo: "/register",
      authLabel: "Book Free Consultation",
      authTo: "/college-suggestion",
    },
    {
      image: img2,
      badge: "5000+ Scholarships Available",
      lines: ["Discover the", "right library", "for your future"],
      desc: "Explore thousands of resources, scholarship opportunities and academic support to help you succeed in your higher education journey.",
      primaryLabel: "Find Scholarships",
      primaryTo: "/college-suggestion",
      authLabel: "Explore Colleges",
      authTo: "/colleges",
    },
    {
      image: img3,
      badge: "World-Class Laboratory Facilities",
      lines: ["Hands-on learning", "in cutting-edge", "laboratories"],
      desc: "Find colleges equipped with state-of-the-art labs for Engineering, Medical, and Allied Sciences to ignite your passion for research.",
      primaryLabel: "Explore Engineering",
      primaryTo: "/courses",
      authLabel: "View Colleges",
      authTo: "/colleges",
    },
    {
      image: img4,
      badge: "95% Student Success Rate",
      lines: ["Your dream campus", "is just one step", "away"],
      desc: "From application to admission, our expert counselors walk you through every stage of your college journey with confidence.",
      primaryLabel: "Get Expert Guidance",
      primaryTo: "/contact",
      authLabel: "Browse Colleges",
      authTo: "/colleges",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        setLoading(true);
        const data = await getColleges();
        const arr = Array.isArray(data) ? data : data.results || [];
        setColleges(
          arr.slice(0, 12).map((c) => ({
            ...c,
            displayImage: c.cover_image || c.college_images?.[0] || c.logo_url || null,
          }))
        );
      } catch (err) {
        setError("Failed to load colleges.");
      } finally {
        setLoading(false);
      }
    };
    fetchColleges();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (stored && token) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
  }, []);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = Math.max(scrollWidth - clientWidth, 1);
      setShowLeftArrow(scrollLeft > 20);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 20);
      setScrollProgress((scrollLeft / maxScroll) * 100);
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const updateScrollState = () => {
      requestAnimationFrame(checkScrollPosition);
    };

    updateScrollState();
    container.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);

    return () => {
      container.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [colleges, loading]);

  const scrollColleges = (dir) => {
    scrollContainerRef.current?.scrollBy({ left: dir * 380, behavior: "smooth" });
    requestAnimationFrame(checkScrollPosition);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  const placeholder = (name) =>
    `https://via.placeholder.com/400x300/f8fafc/255669?text=${encodeURIComponent(name || "College")}`;

  const serviceItems = [
    { icon: "🎓", title: "Admission Guidance", desc: "Expert guidance to navigate the complex admission process of top-tier colleges and universities." },
    { icon: "🎯", title: "Career Counseling", desc: "Personalized counseling sessions to align your interests and strengths with the right career path." },
    { icon: "📚", title: "Course Selection", desc: "Helping you choose from a wide range of courses that best suit your academic background and goals." },
    { icon: "🏛️", title: "University Selection", desc: "Strategic selection of institutions based on rankings, infrastructure, placements, and your profile." },
    { icon: "💰", title: "Scholarship Support", desc: "Information and assistance for securing various merit-based and need-based scholarships." },
    { icon: "📝", title: "Documentation", desc: "Complete support for application forms, SOPs, and all required documentation for a smooth process." },
  ];

  const processSteps = [
    { number: "01", title: "Initial Consultation", desc: "Discuss your goals, interests, and academic background with our experts." },
    { number: "02", title: "Profile Analysis", desc: "Comprehensive evaluation of your scores and profile to match with top institutions." },
    { number: "03", title: "Documentation", desc: "Support in preparing and submitting application forms with precision." },
    { number: "04", title: "Admission Success", desc: "Get your offer letter and secure your seat in your dream college." },
  ];

  return (
    <div className="home-container">
      <Navbar user={user} onLogout={handleLogout} />

      {/* ── HERO ── */}
      <section className="hero-split">
        {/* Background images */}
        <div className="hero-background">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              className="hero-bg-image-wrapper"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <img 
                src={heroSlides[currentSlide].image} 
                alt="Hero Slide" 
                className="hero-full-img"
              />
            </motion.div>
          </AnimatePresence>
          <div className="hero-bg-overlay" />
          <div className="hero-bg-gradient" />
        </div>

        {/* Slide content — animates on slide change */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${currentSlide}`}
            className="hero-split-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hero-badge floating-3d">
              <span className="badge-pulse" />
              Direct Admission 2025-26 Open
            </div>

            <h1 className="hero-title">
              <span className="line-1">{heroSlides[currentSlide].lines[0]}</span>
              <span className="line-2">{heroSlides[currentSlide].lines[1]}</span>
              <span className="line-3">{heroSlides[currentSlide].lines[2]}</span>
            </h1>

            <p className="hero-desc">{heroSlides[currentSlide].desc}</p>

            <div className="hero-buttons">
              <Link
                to={user ? heroSlides[currentSlide].authTo : heroSlides[currentSlide].primaryTo}
                className="btn-dark"
              >
                {user ? heroSlides[currentSlide].authLabel : heroSlides[currentSlide].primaryLabel}
              </Link>
              <Link to="/colleges" className="btn-outline">
                <span>Explore Colleges</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="hero-trust">
              {[["10+", "Colleges"], ["5k–40k", "Scholarships"], ["95%", "Success Rate"]].map(
                ([num, label], i) => (
                  <div key={i} className="trust-item">
                    <span className="trust-num">{num}</span>
                    <span className="trust-label">{label}</span>
                  </div>
                )
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide controls */}
        <div className="hero-navigation-center-bottom">
          <div className="hero-nav-container">
            <button
              className="hero-nav-arrow"
              onClick={() => setCurrentSlide((p) => (p - 1 + heroSlides.length) % heroSlides.length)}
              aria-label="Previous slide"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            
            <div className="hero-nav-dots">
              {heroSlides.map((_, i) => (
                <button
                  key={i}
                  className={`hero-nav-dot${i === currentSlide ? " active" : ""}`}
                  onClick={() => setCurrentSlide(i)}
                />
              ))}
            </div>

            <button
              className="hero-nav-arrow"
              onClick={() => setCurrentSlide((p) => (p + 1) % heroSlides.length)}
              aria-label="Next slide"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Right visual cards */}
        <motion.div
          className="hero-split-right"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="hero-visual">
            {[
              { icon: "🎓", text: "Top Universities", cls: "card-1" },
              { icon: "💰", text: "Scholarships", cls: "card-2" },
              { icon: "📚", text: "Courses", cls: "card-3" },
              { icon: "🏆", text: "Expert Guide", cls: "card-4" },
            ].map((c, i) => (
              <motion.div
                key={i}
                className={`visual-card ${c.cls}`}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.15, type: "spring", stiffness: 260, damping: 20 }}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(37,86,105,0.15)" }}
              >
                <div className="vc-icon">{c.icon}</div>
                <div className="vc-text">{c.text}</div>
              </motion.div>
            ))}
            <div className="visual-bg-circle-1" />
            <div className="visual-bg-circle-2" />
          </div>
        </motion.div>
      </section>

      {/* ── MARQUEE ── */}
      <section className="marquee-section">
        <div className="marquee-wrapper">
          {[0, 1].map((copy) => (
            <div key={copy} className="marquee-track" aria-hidden={copy === 1}>
              {["Engineering", "Medical", "Nursing", "Allied Health Science", "Arts & Science", "Polytechnic", "Law", "Architecture", "MBA", "Pharmacy"].map((item, i) => (
                <span key={i} className="marquee-item">
                  <span className="marquee-dot">◆</span>
                  {item}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── COLLEGES HORIZONTAL SCROLL ── */}
      <section className="colleges-horizontal-section">
        <div className="colleges-horizontal-container">
          <SectionReveal className="section-header-horizontal">
            <motion.div className="section-label-premium" variants={fadeUp}>
              <span className="label-dot" />
              Featured Institutions
              <span className="label-count">{colleges.length > 0 ? `${colleges.length} colleges` : ""}</span>
            </motion.div>
            <motion.h2 className="section-title-premium" variants={fadeUp}>
              Discover Top Colleges
              <span className="title-highlight"> Near You</span>
            </motion.h2>
            <motion.p className="section-subtitle-premium" variants={fadeUp}>
              Handpicked premier institutions with world-class infrastructure,
              exceptional faculty, and outstanding placement records.
            </motion.p>
          </SectionReveal>

          {loading && (
            <div className="horizontal-loading">
              <div style={{ display: "flex", gap: "24px", overflow: "hidden" }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{ flex: "0 0 320px", height: "350px", background: "var(--bg-alt)", borderRadius: "24px", animation: "pulse 1.5s infinite" }} />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="error-premium" style={{ textAlign: "center", padding: "60px 20px" }}>
              <h3>Unable to load colleges</h3>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="btn-dark" style={{ marginTop: "20px" }}>
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && colleges.length > 0 && (
            <>
              <AnimatePresence>
                {showLeftArrow && (
                  <motion.button
                    className="horizontal-scroll-arrow left"
                    onClick={() => scrollColleges(-1)}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                  </motion.button>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showRightArrow && (
                  <motion.button
                    className="horizontal-scroll-arrow right"
                    onClick={() => scrollColleges(1)}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                  </motion.button>
                )}
              </AnimatePresence>

              <div className="horizontal-scroll-wrapper" ref={scrollContainerRef}>
                <div className="horizontal-scroll-track">
                  {colleges.map((college, index) => (
                    <motion.div
                      key={college.college_id}
                      initial={{ opacity: 0, x: 40 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.07, duration: 0.5, ease: "easeOut" }}
                      whileHover={cardHover}
                      style={{ flex: "0 0 350px" }}
                    >
                      <Link to={`/colleges/${college.college_id}`} className="horizontal-college-card" style={{ flex: "unset", display: "block" }}>
                        <div className="horizontal-card-inner">
                          <div className="horizontal-card-image">
                            <img
                              src={college.displayImage || college.campus_images}
                              alt={college.college_name}
                              loading="lazy"
                              onError={(e) => { e.target.src = placeholder(college.college_name); }}
                            />
                            <div className="image-overlay" />
                            {college.type && (
                              <div className={`horizontal-badge ${college.type}`}>
                                {college.type === "government" && "🏛️ Government"}
                                {college.type === "private" && "🏢 Private"}
                                {college.type === "autonomous" && "🎓 Autonomous"}
                                {college.type === "aided" && "🤝 Aided"}
                              </div>
                            )}
                          </div>
                          <div className="horizontal-card-content">
                            <h3 className="horizontal-college-title">{college.college_name || "College Name"}</h3>
                            <div className="horizontal-college-location">
                              <svg className="location-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" fill="currentColor" />
                              </svg>
                              <span>{college.location_city || "City"}, {college.location_state || "State"}</span>
                            </div>
                           <div className = "horizontal-card-separator"></div>
                            <div className="horizontal-card-action">
                              <span>Explore College</span>
                              <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="scroll-progress-indicator">
                <div className="scroll-progress-bar">
                  <motion.div
                    className="scroll-progress-fill"
                    style={{ width: `${scrollProgress}%` }}
                    animate={{ width: `${scrollProgress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>

              <motion.div className="view-all-horizontal" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <Link to="/colleges" className="btn-premium-primary">
                  <span>Explore All Colleges</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </section>

      {/* ── WHAT WE DO SECTION ── */}
      <section className="services-section premium-3d-wrap">
        <div className="services-container">
          <SectionReveal className="section-header-centered">
            <motion.div className="section-label-premium" variants={fadeUp}>
              <span className="label-dot" />
              Our Expertise
            </motion.div>
            <motion.h2 className="section-title-premium" variants={fadeUp}>
              What <span className="title-highlight">We Do</span>
            </motion.h2>
            <motion.p className="section-subtitle-premium" variants={fadeUp}>
              Providing comprehensive support for your educational journey with personalized solutions and expert advice.
            </motion.p>
          </SectionReveal>

          <div className="services-grid">
            {serviceItems.map((service, i) => (
              <motion.div
                key={i}
                className="service-card card-3d"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -10 }}
              >
                <div className="service-icon-wrapper">
                  <div className="service-icon-bg" />
                  <span className="service-icon">{service.icon}</span>
                </div>
                <h3 className="service-card-title">{service.title}</h3>
                <p className="service-card-desc">{service.desc}</p>
                <div className="service-card-line" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ADMISSION PROCESS SECTION ── */}
      <section className="process-section premium-3d-wrap">
        <div className="process-container">
          <SectionReveal className="section-header-centered">
            <motion.div className="section-label-premium" variants={fadeUp}>
              <span className="label-dot" />
              How It Works
            </motion.div>
            <motion.h2 className="section-title-premium" variants={fadeUp}>
              Admission <span className="title-highlight">Process</span>
            </motion.h2>
          </SectionReveal>

          <div className="process-steps">
            <div className="process-line-connector" />
            {processSteps.map((step, i) => (
              <motion.div
                key={i}
                className="process-step-item card-3d"
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
              >
                <div className="step-number-box">
                  <span className="step-number">{step.number}</span>
                </div>
                <div className="step-content">
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUCCESS STORY CTA ── */}
      <section className="success-cta-section">
        {/* Animated background orbs */}
        <div className="success-bg-orb orb-1" />
        <div className="success-bg-orb orb-2" />
        <div className="success-bg-orb orb-3" />
        {/* Floating dots */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="floating-dot"
            style={{
              left: `${8 + i * 8}%`,
              top: `${20 + (i % 3) * 25}%`,
              width: i % 3 === 0 ? 6 : 4,
              height: i % 3 === 0 ? 6 : 4,
            }}
            animate={{ y: [-8, 8, -8], opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.25 }}
          />
        ))}

        <div className="success-cta-inner">
          {/* Header */}
          <motion.div
            className="success-cta-header"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="success-badge">
              <span className="badge-star">★</span>
              Trusted Education Consultancy
            </div>
            <h2 className="success-cta-title">
              Start Your <span className="success-highlight">Success Story</span> Today
            </h2>
            <p className="success-cta-sub">
              Join <strong>1000+ students</strong> who have achieved their educational dreams with ACE COUNSULTING.
              Expert guidance for every step of your admission journey.
            </p>
          </motion.div>

          {/* Contact Cards */}
          <div className="success-contact-grid">
            {[
              {
                icon: "📞",
                label: "Call Us",
                lines: ["+91 87786 35855 ", "+91 93600 38049"],
                sub: "Available 24/7 for your queries",
                color: "#255669",
                action: "tel:+918778635855",
                actionLabel: "Call Now",
              },
              {
                icon: "💬",
                label: "WhatsApp",
                lines: ["Chat with us"],
                sub: "Instant responses & file sharing",
                color: "#25D366",
                action: "https://wa.me/+918778635855",
                actionLabel: "Open WhatsApp",
              },
              {
                icon: "📍",
                label: "Visit Us",
                lines: ["Namakkal, Tamil Nadu"],
                sub: "Walk-in consultations welcome",
                color: "#ff7300",
                action: "/contact",
                actionLabel: "Get Directions",
                internal: true,
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                className="success-contact-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -10, transition: { duration: 0.25 } }}
              >
                <div className="contact-card-glow" style={{ background: card.color }} />
                <div className="contact-card-icon" style={{ background: `${card.color}18`, color: card.color }}>
                  {card.icon}
                </div>
                <div className="contact-card-label">{card.label}</div>
                <div className="contact-card-lines">
                  {card.lines.map((l, j) => (
                    <div key={j} className="contact-card-line">{l}</div>
                  ))}
                </div>
                <p className="contact-card-sub">{card.sub}</p>
                {card.internal ? (
                  <Link to={card.action} className="contact-card-btn" style={{ background: card.color }}>
                    {card.actionLabel}
                  </Link>
                ) : (
                  <a href={card.action} className="contact-card-btn" target="_blank" rel="noreferrer" style={{ background: card.color }}>
                    {card.actionLabel}
                  </a>
                )}
              </motion.div>
            ))}
          </div>

          {/* Main CTA Button */}
          <motion.div
            className="success-cta-bottom"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link to="/register" className="success-main-btn">
                <span className="btn-shimmer" />
                Get Free Consultation
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </motion.div>
            <p className="success-cta-fine">No registration fee · 100% free consultation · Trusted by 1000+ students</p>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            className="success-stats-strip"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            {[["1000+", "Students Helped"], ["10+", "Colleges"], ["95%", "Success Rate"], ["24/7", "Support"]].map(([num, label], i) => (
              <div key={i} className="success-stat">
                <span className="success-stat-num">{num}</span>
                <span className="success-stat-label">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* ── Scroll to Top ── */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            className="scroll-to-top show"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Home;