import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../styles/about.css";

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

function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page-premium">
      <Navbar />

      {/* Hero Section */}
      <section className="about-hero-premium">
        <div className="container">
          <SectionReveal className="about-hero-content">
            <div className="section-label-premium">
              <span className="label-dot" />
              About Us
            </div>
            <h1>Bridging Dreams to <br /><span className="title-highlight">Distinguished Careers</span></h1>
            <p>Empowering students with expert guidance for engineering and medical admissions across Tamil Nadu since 2026.</p>
          </SectionReveal>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="about-story-section">
        <div className="container">
          <div className="story-grid">
            <SectionReveal className="story-content" delay={0.1}>
              <h2>Who <span className="title-highlight">We Are</span></h2>
              <p>
                <strong>ACE CONSULTING</strong> is a MICRO, SMALL and MEDIUM ENTERPRISES (MSME), Government of India-registered concern specializing in admission services for engineering and medical programs, including MBBS, primarily in Tamil Nadu. As an MSME-registered entity, we benefit from government initiatives, ensuring credibility and access to resources that enhance our service quality.
              </p>
              <p>
                We guide students aspiring for engineering and medical courses by providing tailored admission assistance, including counseling on college selection, documentation, and logistical support. Leveraging our local expertise and networks, we help students navigate competitive exams and gain entry to reputable institutions.
              </p>
              <p>
                In medical admissions, we facilitate placements in both renowned Indian medical colleges and private institutions across Tamil Nadu. Operating in Tamil Nadu, we align our services with regional academic requirements to help students achieve their professional education goals.
              </p>
            </SectionReveal>
            <SectionReveal className="story-visual" delay={0.3}>
              <div className="story-image-wrapper card-3d">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80" 
                  alt="Team collaboration" 
                />
                <div className="story-badge">
                  <span>Govt. Registered</span>
                  <strong>MSME</strong>
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="about-values-section premium-3d-wrap">
        <div className="container">
          <div className="values-grid">
            <SectionReveal className="value-card-modern card-3d" delay={0.1}>
              <div className="value-icon-wrap">👁️</div>
              <h3>Our Vision</h3>
              <p>To empower students and institutions by bridging the gap between education and industry, creating a future-ready generation of professionals and innovators.</p>
            </SectionReveal>
            <SectionReveal className="value-card-modern card-3d" delay={0.2}>
              <div className="value-icon-wrap">🎯</div>
              <h3>Our Mission</h3>
              <ul className="mission-list">
                <li>Guide students in choosing the right academic paths and career opportunities</li>
                <li>Support institutions in curriculum development and research</li>
                <li>Facilitate holistic development through career counseling</li>
                <li>Promote global standards in education</li>
              </ul>
            </SectionReveal>
            <SectionReveal className="value-card-modern card-3d" delay={0.3}>
              <div className="value-icon-wrap">🤝</div>
              <h3>Our Impact</h3>
              <p>As a registered admission consultancy, we play a vital role in bridging students with suitable engineering and medical colleges, fostering educational growth and professional development.</p>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Key Focus Areas */}
      <section className="focus-areas-section">
        <div className="container">
          <SectionReveal className="section-header-centered">
            <div className="section-label-premium"><span className="label-dot" /> Core Domains</div>
            <h2 className="section-title-premium">Key Focus <span className="title-highlight">Areas</span></h2>
          </SectionReveal>

          <div className="focus-grid">
            <SectionReveal className="focus-card" delay={0.1}>
              <div className="focus-header">
                <span className="focus-icon">🎓</span>
                <h3>Student Support</h3>
              </div>
              <ul className="focus-list">
                <li>Admissions Guidance</li>
                <li>Career Counseling</li>
                <li>Entrance Exam Assistance</li>
                <li>Application Support</li>
                <li>Internships & Placements</li>
              </ul>
            </SectionReveal>

            <SectionReveal className="focus-card" delay={0.2}>
              <div className="focus-header">
                <span className="focus-icon">🏛️</span>
                <h3>Institutional Support</h3>
              </div>
              <ul className="focus-list">
                <li>Curriculum Development</li>
                <li>Industry Collaborations</li>
                <li>Research Support</li>
                <li>Infrastructure Enhancement</li>
                <li>Process Improvement</li>
              </ul>
            </SectionReveal>

            <SectionReveal className="focus-card" delay={0.3}>
              <div className="focus-header">
                <span className="focus-icon">📍</span>
                <h3>Regional Focus</h3>
              </div>
              <ul className="focus-list">
                <li>Tamil Nadu Engineering Colleges</li>
                <li>Tamil Nadu Medical Colleges</li>
                <li>Namakkal - Salem - Erode - Trichy</li>
                <li>Coimbatore & Surrounding Areas</li>
                
              </ul>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="success-cta-section">
        <div className="container">
          <SectionReveal className="cta-premium-inner">
            <h2>Start Your Success Story Today</h2>
            <p>Join 1000+ students who have achieved their educational dreams with ACE CONSULTING.</p>
            
            <div className="cta-contact-grid">
              <div className="cta-contact-item">
                <span className="cta-icon">📞</span>
                <div className="cta-text gap-10">
                  <strong>Call Us</strong>
                  <span>+91 87786 35855 | </span>
                  <span>+91 93600 38849</span>
                </div>
              </div>
              <div className="cta-contact-item">
                <span className="cta-icon">💬</span>
                <div className="cta-text">
                  <strong>WhatsApp</strong>
                  <span>Chat with us for instant response</span>
                </div>
              </div>
              <div className="cta-contact-item">
                <span className="cta-icon">📍</span>
                <div className="cta-text">
                  <strong>Visit Us</strong>
                  <span>Namakkal, Tamil Nadu</span>
                </div>
              </div>
            </div>

            <Link to="/contact" className="btn-cta-premium">Get Free Consultation</Link>
          </SectionReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default About;