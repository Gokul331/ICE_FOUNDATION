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
  const [formState, setFormState] = useState("idle"); // idle, loading, success
  const [activeFaq, setActiveFaq] = useState(null);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormState("loading");
    setTimeout(() => setFormState("success"), 2000);
  };

  const faqs = [
    { q: "How soon will I hear back?", a: "We aim to respond to all enquiries within 24 hours on business days." },
    { q: "Is the initial consultation free?", a: "Yes! Your first 30-minute session with an VAMSHI Educare advisor is completely free." },
    { q: "Can I visit the office directly?", a: "Absolutely. Walk-ins are welcome during office hours at our Thiruvarur locations." },
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
              { icon: "📞", label: "Call Us", val: "+91 8925262724 ", sub: "Available 24/7 for queries" },
              { icon: "✉️", label: "Email Us", val: "hello@vamshieducare.in", sub: "Quick response within 24h" },
              { icon: "📍", label: "Visit Us", val: "Thiruvarur, Tamil Nadu", sub: "Walk-in consultations welcome" }
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
                    >
                      <div className="success-icon-large">✓</div>
                      <h3>Message Sent!</h3>
                      <p>Thank you for reaching out. A counselor will contact you shortly.</p>
                      <button onClick={() => setFormState("idle")} className="btn-premium-action">Send Another</button>
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
                          <label>Full Name</label>
                          <input type="text" placeholder="Enter your name" required />
                        </div>
                        <div className="input-group-premium">
                          <label>Phone Number</label>
                          <input type="tel" placeholder="9876543210" required />
                        </div>
                      </div>

                      <div className="input-group-premium">
                        <label>Email Address</label>
                        <input type="email" placeholder="name@example.com" required />
                      </div>

                      <div className="input-group-premium">
                        <label>Subject</label>
                        <select required>
                          <option value="">Select a topic</option>
                          <option>Admissions Strategy</option>
                          <option>Scholarship Support</option>
                          <option>Course Guidance</option>
                          <option>Other Enquiry</option>
                        </select>
                      </div>

                      <div className="input-group-premium">
                        <label>Message</label>
                        <textarea placeholder="How can we help you today?" rows="4" required></textarea>
                      </div>

                      <button type="submit" className="btn-premium-action" disabled={formState === "loading"}>
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
                    <div key={i} className={`faq-item-premium ${activeFaq === i ? "active" : ""}`} onClick={() => setActiveFaq(activeFaq === i ? null : i)}>
                      <div className="faq-q-box">
                        <span>{faq.q}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                      <AnimatePresence>
                        {activeFaq === i && (
                          <motion.div 
                            className="faq-a-box"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
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
                    <span>Thiruvarur Office</span>
                  </div>
                </div>
                <div className="map-card-footer">
                  <p>VAMSHI EDUCARE. <br />Thiruvarur, Tamil Nadu</p>
                  <button className="btn-outline-premium">Get Directions</button>
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