import React, { useState, useEffect } from 'react';
import { Leaf, CheckCircle } from 'lucide-react';
import Lottie from 'lottie-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const [iMessageAnimationData, setIMessageAnimationData] = useState(null);
  const [searchAnimationData, setSearchAnimationData] = useState(null);
  const [progressBarAnimationData, setProgressBarAnimationData] = useState(null);

  useEffect(() => {
    // Load the notification animation from the public folder
    fetch('/images/mockups/one-ttext.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error));
    
    // Load the iMessage animation
    fetch('/images/mockups/iMessage.json')
      .then(response => response.json())
      .then(data => setIMessageAnimationData(data))
      .catch(error => console.error('Error loading iMessage animation:', error));
    
    // Load the Search animation
    fetch('/images/mockups/Search.json')
      .then(response => response.json())
      .then(data => setSearchAnimationData(data))
      .catch(error => console.error('Error loading Search animation:', error));
    
    // Load the Progress Bar animation
    fetch('/images/mockups/Progress-Bar-(Line).json')
      .then(response => response.json())
      .then(data => setProgressBarAnimationData(data))
      .catch(error => console.error('Error loading Progress Bar animation:', error));
  }, []);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F6FBF8]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm shadow-black/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-[#00B377] rounded-xl flex items-center justify-center shadow-lg shadow-[#00B377]/25">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#1C3A32]">
              SproutLine
            </span>
          </div>
          <button
            onClick={onGetStarted}
            className="px-6 py-2.5 bg-[#00B377] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-[#00B377]/25 transition-all duration-300 hover:scale-105"
          >
            Try It
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-0 overflow-visible" style={{ minHeight: '650px' }}>
        {/* Bright mint background - airy and light */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F8FCF9] via-[#F2F9F4] to-[#EAF5EF]" />
        <div className="absolute inset-0 bg-gradient-to-tr from-white/60 via-transparent to-white/40" />
        
        <div className="max-w-7xl mx-auto px-6 py-12 relative" style={{ zIndex: 1 }}>
          <div className="grid lg:grid-cols-5 gap-2 items-center">
            {/* Left: Text Content */}
            <div className="lg:col-span-2 space-y-8 relative" style={{ zIndex: 30 }}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black font-landing text-[#1C3A32] leading-tight">
                Your plants,
                <br />
                texting you!
              </h1>
              <p className="text-xl md:text-2xl text-[#4A5D57] font-body leading-relaxed max-w-xl">
                They'll remind you to water them, roast you when you forget, and become the best group chat you've ever been in.
              </p>
              <div>
                <button
                  onClick={onGetStarted}
                  className="px-8 py-4 bg-[#00B377] text-white rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-[#00B377]/40 hover:scale-105 transition-all duration-500 relative group"
                  style={{ zIndex: 40 }}
                >
                  <span className="relative z-10">Get on the list 🌱</span>
                  <div className="absolute inset-0 bg-[#00C585] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </button>
              </div>
            </div>

            {/* Right: iPhone Animation - BEHIND wave */}
            <div className="hidden lg:flex lg:col-span-3 justify-end items-center relative" style={{ zIndex: 1, marginRight: '-5%', marginTop: '240px' }}>
              <div 
                className="w-full" 
                style={{ 
                  width: '100%',
                  transform: 'scale(2.0) translateX(25%)',
                  transformOrigin: 'right center',
                  filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.15))'
                }}
              >
                {iMessageAnimationData && (
                  <Lottie 
                    animationData={iMessageAnimationData}
                    loop={true}
                    className="w-full h-auto"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Wave that rises up into hero - Dark grounding green */}
        <div 
          className="hidden lg:block absolute left-0 w-full overflow-visible leading-[0] pointer-events-none"
          style={{ 
            bottom: '-70px',
            height: '250px',
            zIndex: 20
          }}
        >
          {/* Gradient blend layer behind wave */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1C3A32]/5 to-[#1C3A32]/10" />
          
          <svg 
            className="relative block w-full h-full" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1440 250" 
            preserveAspectRatio="none"
            style={{
              filter: 'drop-shadow(0 -8px 32px rgba(28, 58, 50, 0.15))'
            }}
          >
            {/* Wave rises up ~80px into the hero */}
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1C3A32" stopOpacity="1" />
                <stop offset="100%" stopColor="#15302A" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path 
              d="M0,80 Q360,25 720,80 T1440,80 L1440,250 L0,250 Z" 
              fill="url(#waveGradient)"
            />
          </svg>
        </div>

        {/* Mobile Wave - IN FRONT of content */}
        <div 
          className="lg:hidden absolute left-0 w-full overflow-visible leading-[0] pointer-events-none"
          style={{ 
            bottom: '-50px',
            height: '170px',
            zIndex: 20
          }}
        >
          <svg 
            className="relative block w-full h-full" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1440 170" 
            preserveAspectRatio="none"
            style={{
              filter: 'drop-shadow(0 -4px 20px rgba(28, 58, 50, 0.12))'
            }}
          >
            <defs>
              <linearGradient id="waveGradientMobile" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1C3A32" stopOpacity="1" />
                <stop offset="100%" stopColor="#15302A" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path 
              d="M0,65 Q360,15 720,65 T1440,65 L1440,170 L0,170 Z" 
              fill="url(#waveGradientMobile)"
            />
          </svg>
        </div>
      </section>

      {/* How It Works - Alternating Steps */}
      <section className="relative -mt-[70px]">
        {/* Header */}
        <div className="relative py-24 text-center overflow-hidden" style={{ position: 'relative', zIndex: 30 }}>
          {/* Dark grounding green background with top lighting */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1C3A32] via-[#15302A] to-[#1C3A32]" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/8 via-transparent to-transparent" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold font-landing text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto font-body leading-relaxed px-6">
              Three simple steps to never kill a plant again
            </p>
          </div>
        </div>

        {/* Step 1 - Text Left, Animation Right - LIGHT */}
        <div className="relative py-28 px-6 overflow-hidden">
          {/* Very light, almost white background with subtle top lighting */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-[#FAFCFA] to-[#F5F9F6]" />
          <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-transparent" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Text Content */}
              <div className="space-y-8 animate-fade-in-up">
                <div className="text-6xl md:text-7xl font-bold text-[#00B377]">01</div>
                <h3 className="text-4xl md:text-5xl font-bold font-landing text-[#1C3A32] leading-tight">Add your plants</h3>
                <p className="text-xl text-[#4A5D57] font-body leading-relaxed max-w-lg">
                  Pick from our catalog, give them names and personalities
                </p>
                <div className="space-y-5 pt-6">
                  <div className="flex items-start space-x-4 group">
                    <div className="w-7 h-7 rounded-full bg-[#00B377] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-[#00B377]/30 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-sm font-semibold">✓</span>
                    </div>
                    <p className="text-lg text-[#4A5D57] font-body">Choose from 200+ plant species</p>
                  </div>
                  <div className="flex items-start space-x-4 group">
                    <div className="w-7 h-7 rounded-full bg-[#00B377] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-[#00B377]/30 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-sm font-semibold">✓</span>
                    </div>
                    <p className="text-lg text-[#4A5D57] font-body">Pick a personality type</p>
                  </div>
                  <div className="flex items-start space-x-4 group">
                    <div className="w-7 h-7 rounded-full bg-[#00B377] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-[#00B377]/30 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-sm font-semibold">✓</span>
                    </div>
                    <p className="text-lg text-[#4A5D57] font-body">Give them a unique name</p>
                  </div>
                </div>
              </div>
              
              {/* Animation */}
              <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="relative w-full max-w-md">
                  {searchAnimationData && (
                    <Lottie 
                      animationData={searchAnimationData}
                      loop={true}
                      className="w-full h-auto drop-shadow-2xl"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 - Animation Left, Text Right - MID TONE */}
        <div className="relative py-28 px-6 overflow-hidden">
          {/* Mid-tone mint background with subtle top lighting */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#E8F4EE] via-[#DFF0E7] to-[#D6ECE0]" />
          <div className="absolute inset-0 bg-gradient-to-tl from-white/20 via-transparent to-white/30" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Animation */}
              <div className="flex justify-center lg:order-1 animate-fade-in-up">
                <div className="relative w-full max-w-md group">
                  {/* Soft glow behind animation */}
                  <div className="absolute -inset-8 bg-gradient-to-br from-[#00B377]/15 via-[#00B377]/10 to-[#00B377]/15 rounded-3xl blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  {animationData && (
                    <Lottie 
                      animationData={animationData}
                      loop={true}
                      className="w-full h-auto drop-shadow-2xl relative z-10"
                    />
                  )}
                </div>
              </div>
              
              {/* Text Content */}
              <div className="space-y-8 lg:order-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="text-6xl md:text-7xl font-bold text-[#00B377]">02</div>
                <h3 className="text-4xl md:text-5xl font-bold font-landing text-[#1C3A32] leading-tight">They text you</h3>
                <p className="text-xl text-[#4A5D57] font-body leading-relaxed max-w-lg">
                  Get reminders, jokes, and updates — all in their unique voice
                </p>
                <div className="space-y-5 pt-6">
                  <div className="flex items-start space-x-4 group">
                    <div className="w-7 h-7 rounded-full bg-[#00B377] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-[#00B377]/30 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-sm font-semibold">✓</span>
                    </div>
                    <p className="text-lg text-[#4A5D57] font-body">Sarcastic, dramatic, or chill vibes</p>
                  </div>
                  <div className="flex items-start space-x-4 group">
                    <div className="w-7 h-7 rounded-full bg-[#00B377] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-[#00B377]/30 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-sm font-semibold">✓</span>
                    </div>
                    <p className="text-lg text-[#4A5D57] font-body">Watering & care reminders</p>
                  </div>
                  <div className="flex items-start space-x-4 group">
                    <div className="w-7 h-7 rounded-full bg-[#00B377] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-[#00B377]/30 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-sm font-semibold">✓</span>
                    </div>
                    <p className="text-lg text-[#4A5D57] font-body">Weather-based adjustments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 - Text Left, Animation Right - DARK */}
        <div className="relative py-28 px-6 overflow-hidden">
          {/* Cooler forest green background with subtle top lighting */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1F4A3C] via-[#1A3F34] to-[#16362D]" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#B8E0CA]/10 via-transparent to-transparent" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Text Content */}
              <div className="space-y-8 animate-fade-in-up">
                <div className="text-6xl md:text-7xl font-bold text-[#00B377]">03</div>
                <h3 className="text-4xl md:text-5xl font-bold font-landing text-white leading-tight">Watch them thrive</h3>
                <p className="text-xl text-white/80 font-body leading-relaxed max-w-lg">
                  Never forget to water. Healthier plants, more fun.
                </p>
                <div className="space-y-5 pt-6">
                  <div className="flex items-start space-x-4 group">
                    <div className="w-7 h-7 rounded-full bg-[#00B377] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-[#00B377]/40 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-sm font-semibold">✓</span>
                    </div>
                    <p className="text-lg text-white/80 font-body">Track growth & health</p>
                  </div>
                  <div className="flex items-start space-x-4 group">
                    <div className="w-7 h-7 rounded-full bg-[#00B377] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-[#00B377]/40 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-sm font-semibold">✓</span>
                    </div>
                    <p className="text-lg text-white/80 font-body">Build relationships with your plants</p>
                  </div>
                  <div className="flex items-start space-x-4 group">
                    <div className="w-7 h-7 rounded-full bg-[#00B377] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg shadow-[#00B377]/40 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-white text-sm font-semibold">✓</span>
                    </div>
                    <p className="text-lg text-white/80 font-body">Join the best group chat ever</p>
                  </div>
                </div>
              </div>
              
              {/* Animation */}
              <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="relative w-full max-w-xs group">
                  {/* Soft glow behind animation */}
                  <div className="absolute -inset-8 bg-gradient-to-br from-[#00B377]/25 via-[#00B377]/15 to-[#00B377]/25 rounded-3xl blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                  {progressBarAnimationData && (
                    <Lottie 
                      animationData={progressBarAnimationData}
                      loop={true}
                      className="w-full h-auto drop-shadow-2xl relative z-10"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave to Waitlist - Softer transition */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] -mb-px">
          <svg className="relative block w-full h-20 md:h-24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="waitlistWaveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#16362D" stopOpacity="1" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
              </linearGradient>
            </defs>
            <path d="M0,60 Q360,0 720,60 T1440,60 L1440,100 L0,100 Z" fill="url(#waitlistWaveGradient)"></path>
          </svg>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="relative py-24 px-6 overflow-hidden">
        {/* Layered gradient backgrounds - Navy/Slate with natural lighting */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#334155]" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left: iMessage Animation */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative group w-full">
                {/* Soft glow effect */}
                <div className="absolute -inset-12 bg-gradient-to-br from-[#00B377]/20 via-[#00B377]/10 to-[#00B377]/20 rounded-[4rem] blur-3xl group-hover:blur-[80px] transition-all duration-700"></div>
                
                {/* iMessage Animation */}
                <div className="relative transform transition-all duration-700 group-hover:scale-[1.03]">
                  {iMessageAnimationData && (
                    <Lottie 
                      animationData={iMessageAnimationData}
                      loop={true}
                      className="w-full h-auto drop-shadow-2xl"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right: Waitlist Form */}
            <div className="relative rounded-3xl p-12 text-white shadow-2xl overflow-hidden group">
              {/* Layered gradient background with Sproutline green accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#00B377] via-[#009368] to-[#007A56]" />
              <div className="absolute inset-0 bg-gradient-to-tl from-[#007A56]/50 via-transparent to-[#00B377]/30" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-[#00C585]/30 via-transparent to-[#00B377]/30" />
              
              {!isSubmitted ? (
                <div className="text-center space-y-8 relative z-10">
                  <h3 className="text-4xl font-bold font-landing">Join the waitlist</h3>
                  <p className="text-white/90 font-body text-lg leading-relaxed">Get notified when we launch new features</p>

                  <form onSubmit={handleWaitlistSubmit} className="space-y-4 pt-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email"
                      required
                      className="w-full px-6 py-4 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/40 transition-all duration-300 shadow-lg"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Your phone (optional)"
                      className="w-full px-6 py-4 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/40 transition-all duration-300 shadow-lg"
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full px-8 py-4 bg-white text-[#00B377] rounded-2xl font-bold text-lg hover:bg-gray-50 hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:opacity-50 shadow-xl"
                    >
                      {isLoading ? 'Joining...' : 'Join Waitlist'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center space-y-6 relative z-10">
                  <div className="flex justify-center">
                    <CheckCircle className="w-20 h-20 drop-shadow-lg" />
                  </div>
                  <h3 className="text-4xl font-bold font-landing">You're in! 🌱</h3>
                  <p className="text-white/90 font-body text-lg">We'll be in touch soon</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative overflow-hidden">
        {/* 40px fade divider for continuity */}
        <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#334155] to-transparent" />
        
        {/* Lighter bluish-green gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#4A6B68] via-[#5B7D7A] to-[#7A9B98]" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/8 via-transparent to-transparent" />
        
        <div className="relative py-16 px-6">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 text-sm text-white/90 relative z-10">
            <div className="flex items-center space-x-3 group">
              <div className="w-8 h-8 bg-[#00B377] rounded-lg flex items-center justify-center shadow-md shadow-[#00B377]/30 group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-white">Sproutline</span>
            </div>
            <div className="flex items-center space-x-8">
              <a href="/privacy.html" className="hover:text-[#00B377] transition-colors duration-300 font-medium">Privacy</a>
              <a href="/terms.html" className="hover:text-[#00B377] transition-colors duration-300 font-medium">Terms</a>
            </div>
            <span className="font-medium">© 2025 Made with 💚</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;