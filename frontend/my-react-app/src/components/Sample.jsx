import React from "react";
import "../styles/sample.css";
const Sample = () => {
  return (
    <>
      <div className="home-container">
        <nav>
          <div className="logo">
            <span className="first">ICE</span>
            <span className="sec">Foundation</span>
          </div>
          <ul>
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/colleges">Colleges</a>
            </li>
            <li>
              <a href="/college-suggestion">Suggestion</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
            <li>
              <a href="/login">Login / Register</a>
            </li>
          </ul>
        </nav>
        <div className="hero-section">
          <div className="hero-subtitle">
            Your gateway to finding the perfect college for you.
          </div>
          <div className="hero-main">
            <h1>Welcome to College Connect</h1>
            <p>
              Explore a wide range of colleges and find the one that best fits
              your needs.
            </p>
            <div className="cta-btn">
              <a href="/college-suggestion" className="cta-button">
                Get Suggestions
              </a>
              <a href="/colleges" className="cta-button">
                Explore Colleges
              </a>
            </div>
          </div>
          <div className="hero-stats">
            <div className="small-container">
              <span>100+ Colleges</span>
              <span>5k - 40k scholarships</span>
            </div>
          </div>
        </div>
        <div className="roadmap bg-slate-100 p-5 rounded flex flex-col items-center my-10 w-[80%] mx-auto">
          <span className = "bg-sky-100 text-sky-800 font-bold uppercase w-[150px] text-center  rounded-full ">Your Journey</span>
          <h2>How It Works</h2>
          <p className="text-center ">Simple to your dream college</p>
          <div className="roadmap-steps ">
            <div className="roadmap-step flex">
              <span>1</span>
              <h3>Explore Colleges</h3>
              <p>
                Browse through our extensive list of colleges to find the ones
                that interest you.
              </p>
            </div>
            <div className="roadmap-step">
              <h3>2. Get Suggestions</h3>
              <p>
                Use our college suggestion tool to receive personalized
                recommendations based on your preferences.
              </p>
            </div>
            <div className="roadmap-step">
              <h3>3. Apply</h3>
              <p>
                Apply to your chosen colleges and take the next step towards
                your future.
              </p>
            </div>
          </div>
        </div>
        <div className="featured-colleges w-[80%] mx-auto my-10">
          <h2 className="text-2xl font-bold text-center mb-5">Featured Colleges</h2>
          <div className="college-cards flex justify-between gap-5 flex-wrap">
            <div className="college-card bg-slate-100 p-5 rounded">
              <h3>College A</h3>
              <p>Location: City A</p>
              <p>Scholarship: Up to $20,000</p>
            </div> 
            <div className="college-card bg-slate-100 p-5 rounded">
              <h3 className="text-xl font-bold">College B</h3>
              <p className="">Location: City B</p>
              <p>Scholarship: Up to $15,000</p>
            </div>
            <div className="college-card bg-slate-100 p-5 rounded ">
              <h3>College C</h3>
              <p>Location: City C</p>
              <p>Scholarship: Up to $10,000</p>
            </div>
            <div className="view-all">
              <a href="/colleges" className="cta-button">
                View All Colleges
              </a>
            </div>
          </div>
        </div>
        <div className="banner">
          <h2>Ready to Find Your Perfect College?</h2>
          <a href="/college-suggestion" className="cta-button">
            Get Started Now
          </a>
        </div>
        <div className="footer">
          <p>&copy; 2024 College Connect. All rights reserved.</p>
        </div>
      </div>
    </>
  );
};

export default Sample;
