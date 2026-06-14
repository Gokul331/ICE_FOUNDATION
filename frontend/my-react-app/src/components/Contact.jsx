import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/contact.css";

/* ── animation helpers ── */
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

const Contact = () => {
  const [user, setUser] = useState(null);
  const [formState, setFormState] = useState("idle"); // idle, loading, success, error
  const [activeFaq, setActiveFaq] = useState(null);
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: ""
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    window.scrollTo(0, 0);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/";
  };

  // Validation functions
  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone) return "Phone number is required";
    if (!phoneRegex.test(phone)) return "Enter a valid 10-digit mobile number starting with 6,7,8,9";
    return "";
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Enter a valid email address";
    return "";
  };

  const validateName = (name) => {
    if (!name) return "Full name is required";
    if (name.length < 2) return "Name must be at least 2 characters";
    if (!/^[a-zA-Z\s]*$/.test(name)) return "Name should only contain letters";
    return "";
  };

  const validateSubject = (subject) => {
    if (!subject) return "Please select a subject";
    return "";
  };

  const validateMessage = (message) => {
    if (!message) return "Message is required";
    if (message.length < 10) return "Message must be at least 10 characters";
    return "";
  };

  // Input handlers
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, phone: value });
    setPhoneError(validatePhone(value));
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });
    setEmailError(validateEmail(value));
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const nameErr = validateName(formData.name);
    const phoneErr = validatePhone(formData.phone);
    const emailErr = validateEmail(formData.email);
    const subjectErr = validateSubject(formData.subject);
    const messageErr = validateMessage(formData.message);

    if (nameErr || phoneErr || emailErr || subjectErr || messageErr) {
      setPhoneError(phoneErr);
      setEmailError(emailErr);

      // Scroll to first error
      const firstError = document.querySelector(".error-message");
      if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setFormState("loading");

    // Simulate API call - Replace with your actual API endpoint
    try {
      // const response = await fetch('https://your-api.com/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      // const data = await response.json();

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Success
      setFormState("success");
      setFormData({
        name: "",
        phone: "",
        email: "",
        subject: "",
        message: ""
      });
      setPhoneError("");
      setEmailError("");

    } catch (error) {
      console.error("Error submitting form:", error);
      setFormState("error");
      setTimeout(() => setFormState("idle"), 3000);
    }
  };

  const faqs = [
    { q: "How soon will I hear back?", a: "We aim to respond to all enquiries within 24 hours on business days." },
    { q: "Is the initial consultation free?", a: "Yes! Your first 30-minute session with an VAMSHI Educare advisor is completely free." },
    { q: "Can I visit the office directly?", a: "Absolutely. Walk-ins are welcome during office hours at our Mannargudi locations." },
    { q: "Do you offer online counselling?", a: "Yes, we offer full online counselling via video call for students across Tamil Nadu." }
  ];

  return (
    <div className="contact-page-premium">
      <Navbar user={user} onLogout={handleLogout} />

      {/* ── HERO ── */}
      <section className="contact-hero-premium">
        <div className="container">
          <SectionReveal className="contact-hero-content">
            <div className="section-label-premium">
              <span className="label-dot" />
              Contact Us
            </div>
            <h1>Let's Start Your <br /><span className="title-highlight">Success Story</span></h1>
            <p>Have questions about colleges, admissions, or scholarships? Our expert team is ready to guide you through every step.</p>
          </SectionReveal>
        </div>
      </section>

      {/* ── INFO GRID ── */}
      <section className="contact-info-section">
        <div className="container">
          <div className="info-cards-grid">
            {[
              { icon: "📞", label: "Call Us", val: "+91 8925262724", sub: "Available 24/7 for queries" },
              { icon: "✉️", label: "Email Us", val: "hello@vamshieducare.in", sub: "Quick response within 24h" },
              { icon: "📍", label: "Visit Us", val: "Mannargudi, Tamil Nadu", sub: "Walk-in consultations welcome" }
            ].map((item, i) => (
              <SectionReveal key={i} className="info-card-premium" delay={i * 0.1}>
                <div className="info-card-icon">{item.icon}</div>
                <h3>{item.label}</h3>
                <p className="info-val">{item.val}</p>
                <p className="info-sub">{item.sub}</p>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── MAIN CONTENT ── */}
      <section className="contact-main-section">
        <div className="container">
          <div className="contact-split-layout">

            {/* Form Side */}
            <SectionReveal className="contact-form-side">
              <div className="premium-form-card">
                <AnimatePresence mode="wait">
                  {formState === "success" ? (
                    <motion.div
                      key="success"
                      className="form-success-view"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="success-icon-large">✓</div>
                      <h3>Message Sent Successfully!</h3>
                      <p>Thank you for reaching out. A counselor will contact you shortly.</p>
                      <button onClick={() => setFormState("idle")} className="btn-premium-action">Send Another Message</button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="form-header-box">
                        <h3>Send a Message</h3>
                        <p>Fill out the form below and we'll get back to you.</p>
                      </div>

                      <div className="form-row-dual">
                        <div className="input-group-premium">
                          <label>Full Name *</label>
                          <input
                            type="text"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={formData.name && validateName(formData.name) ? "error" : ""}
                            required
                          />
                          {formData.name && validateName(formData.name) && (
                            <span className="error-message">{validateName(formData.name)}</span>
                          )}
                        </div>
                        <div className="input-group-premium">
                          <label>Phone Number *</label>
                          <input
                            type="tel"
                            placeholder="9876543210"
                            maxLength={10}
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            className={phoneError ? "error" : ""}
                            required
                          />
                          {phoneError && <span className="error-message">{phoneError}</span>}
                        </div>
                      </div>

                      <div className="input-group-premium">
                        <label>Email Address *</label>
                        <input
                          type="email"
                          placeholder="name@example.com"
                          value={formData.email}
                          onChange={handleEmailChange}
                          className={emailError ? "error" : ""}
                          required
                        />
                        {emailError && <span className="error-message">{emailError}</span>}
                      </div>

                      <div className="input-group-premium">
                        <label>Subject *</label>
                        <select
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          className={formData.subject === "" && formState !== "idle" ? "error" : ""}
                          required
                        >
                          <option value="">Select a topic</option>
                          <option>Admissions Strategy</option>
                          <option>Scholarship Support</option>
                          <option>Course Guidance</option>
                          <option>Career Counselling</option>
                          <option>College Selection</option>
                          <option>Other Enquiry</option>
                        </select>
                      </div>

                      <div className="input-group-premium">
                        <label>Message *</label>
                        <textarea
                          placeholder="How can we help you today?"
                          rows="4"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className={formData.message && formData.message.length < 10 && formData.message.length > 0 ? "error" : ""}
                          required
                        ></textarea>
                        {formData.message && formData.message.length < 10 && formData.message.length > 0 && (
                          <span className="error-message">Message must be at least 10 characters</span>
                        )}
                      </div>

                      {formState === "loading" && (
                        <div className="loading-spinner">
                          <div className="spinner"></div>
                          <p>Sending your message...</p>
                        </div>
                      )}

                      {formState === "error" && (
                        <div className="error-message-box">
                          <span>⚠️</span>
                          <p>Something went wrong. Please try again.</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="btn-premium-action"
                        disabled={formState === "loading"}
                      >
                        {formState === "loading" ? "Sending..." : "Send Message"}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </SectionReveal>

            {/* Support Side */}
            <div className="contact-support-side">
              <SectionReveal className="faq-box-premium" delay={0.2}>
                <div className="support-header">
                  <h3>Quick Answers</h3>
                  <p>Common questions from students & parents.</p>
                </div>
                <div className="faq-list">
                  {faqs.map((faq, i) => (
                    <div
                      key={i}
                      className={`faq-item-premium ${activeFaq === i ? "active" : ""}`}
                      onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    >
                      <div className="faq-q-box">
                        <span>{faq.q}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </div>
                      <AnimatePresence>
                        {activeFaq === i && (
                          <motion.div
                            className="faq-a-box"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <p>{faq.a}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </SectionReveal>

              <SectionReveal className="map-card-premium" delay={0.3}>
                <div className="map-placeholder">
                  <div className="map-overlay">
                    <div className="pin-pulse-box">
                      <div className="pulse" />
                      <div className="dot" />
                    </div>
                    <span>Mannargudi Office</span>
                  </div>
                </div>
                <div className="map-card-footer">
                  <p>
                    VAMSHI EDUCARE CAREER GUIDANCE CENTER<br />
                    Mannargudi, Tamil Nadu - 614001
                  </p>
                  <a
                    href="https://www.google.com/maps/place/Mannargudi,+Tamil+Nadu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline-premium"
                  >
                    Get Directions
                  </a>
                </div>
              </SectionReveal>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;