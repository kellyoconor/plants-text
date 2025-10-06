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
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 via-white to-emerald-50/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-green-100/50 shadow-sm shadow-green-900/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-600/25">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              SproutLine
            </span>
          </div>
          <button
            onClick={onGetStarted}
            className="px-6 py-2.5 bg-gradient-to-r from-gray-900 to-slate-800 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-gray-900/25 transition-all duration-300 hover:scale-105"
          >
            Try It
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-0 overflow-visible" style={{ minHeight: '650px' }}>
        {/* Layered gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/60 via-emerald-50/40 to-teal-50/30" />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/60 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 py-12 relative" style={{ zIndex: 1 }}>
          <div className="grid lg:grid-cols-5 gap-2 items-center">
            {/* Left: Text Content */}
            <div className="lg:col-span-2 space-y-8 relative" style={{ zIndex: 30 }}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black font-landing bg-gradient-to-br from-gray-900 via-gray-800 to-slate-700 bg-clip-text text-transparent leading-tight">
                Your plants,
                <br />
                texting you!
              </h1>
              <p className="text-xl md:text-2xl text-gray-700 font-body leading-relaxed max-w-xl">
                They'll remind you to water them, roast you when you forget, and become the best group chat you've ever been in.
              </p>
              <div>
                <button
                  onClick={onGetStarted}
                  className="px-8 py-4 bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 text-white rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-gray-900/30 hover:scale-105 transition-all duration-500 relative group"
                  style={{ zIndex: 40 }}
                >
                  <span className="relative z-10">Get on the list 🌱</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </button>
              </div>
            </div>

            {/* Right: iPhone Animation - BEHIND wave */}
            <div className="hidden lg:flex lg:col-span-3 justify-end items-center relative" style={{ zIndex: 1, marginRight: '-5%', marginTop: '170px' }}>
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

        {/* Wave that rises up into hero - IN FRONT of iPhone, BELOW text */}
        <div 
          className="hidden lg:block absolute left-0 w-full overflow-visible leading-[0] pointer-events-none"
          style={{ 
            bottom: '-70px',
            height: '250px',
            zIndex: 20
          }}
        >
          {/* Gradient blend layer behind wave */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/5 to-slate-900/10" />
          
          <svg 
            className="relative block w-full h-full" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 1440 250" 
            preserveAspectRatio="none"
            style={{
              filter: 'drop-shadow(0 -8px 32px rgba(0, 0, 0, 0.12))'
            }}
          >
            {/* Wave rises up ~80px into the hero */}
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="1" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
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
              filter: 'drop-shadow(0 -4px 20px rgba(0, 0, 0, 0.1))'
            }}
          >
            <defs>
              <linearGradient id="waveGradientMobile" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" stopOpacity="1" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
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
          {/* Gradient background layers */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-emerald-900/20" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold font-landing text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-body leading-relaxed px-6">
              Three simple steps to never kill a plant again
            </p>
          </div>
        </div>

        {/* Step 1 - Text Left, Animation Right */}
        <div className="relative bg-gradient-to-br from-green-50 to-emerald-100 py-24 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div className="space-y-6 animate-fade-in-up">
                <div className="text-5xl md:text-6xl font-bold text-gray-900">01</div>
                <h3 className="text-4xl md:text-5xl font-bold font-landing text-gray-900">Add your plants</h3>
                <p className="text-xl text-gray-700 font-body leading-relaxed">
                  Pick from our catalog, give them names and personalities
                </p>
                <div className="space-y-4 pt-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-lg text-gray-700 font-body">Choose from 200+ plant species</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-lg text-gray-700 font-body">Pick a personality type</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-lg text-gray-700 font-body">Give them a unique name</p>
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

        {/* Step 2 - Animation Left, Text Right */}
        <div className="relative bg-gradient-to-br from-emerald-100 to-teal-100 py-24 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Animation */}
              <div className="flex justify-center lg:order-1 animate-fade-in-up">
                <div className="relative w-full max-w-md">
                  {animationData && (
                    <Lottie 
                      animationData={animationData}
                      loop={true}
                      className="w-full h-auto drop-shadow-2xl"
                    />
                  )}
                </div>
              </div>
              
              {/* Text Content */}
              <div className="space-y-6 lg:order-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="text-5xl md:text-6xl font-bold text-gray-900">02</div>
                <h3 className="text-4xl md:text-5xl font-bold font-landing text-gray-900">They text you</h3>
                <p className="text-xl text-gray-700 font-body leading-relaxed">
                  Get reminders, jokes, and updates — all in their unique voice
                </p>
                <div className="space-y-4 pt-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-lg text-gray-700 font-body">Sarcastic, dramatic, or chill vibes</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-lg text-gray-700 font-body">Watering & care reminders</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <p className="text-lg text-gray-700 font-body">Weather-based adjustments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 - Text Left, Animation Right */}
        <div className="relative bg-gradient-to-br from-teal-900 to-slate-900 py-24 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div className="space-y-6 animate-fade-in-up">
                <div className="text-5xl md:text-6xl font-bold text-white">03</div>
                <h3 className="text-4xl md:text-5xl font-bold font-landing text-white">Watch them thrive</h3>
                <p className="text-xl text-gray-300 font-body leading-relaxed">
                  Never forget to water. Healthier plants, more fun.
                </p>
                <div className="space-y-4 pt-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-gray-900 text-xs">✓</span>
                    </div>
                    <p className="text-lg text-gray-300 font-body">Track growth & health</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-gray-900 text-xs">✓</span>
                    </div>
                    <p className="text-lg text-gray-300 font-body">Build relationships with your plants</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-gray-900 text-xs">✓</span>
                    </div>
                    <p className="text-lg text-gray-300 font-body">Join the best group chat ever</p>
                  </div>
                </div>
              </div>
              
              {/* Animation */}
              <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="relative w-full max-w-xs">
                  {progressBarAnimationData && (
                    <Lottie 
                      animationData={progressBarAnimationData}
                      loop={true}
                      className="w-full h-auto drop-shadow-2xl"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave to Waitlist */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] -mb-px">
          <svg className="relative block w-full h-16 md:h-20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path d="M0,60 Q360,0 720,60 T1440,60 L1440,100 L0,100 Z" fill="#ecfdf5"></path>
          </svg>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="py-20 px-6 bg-gradient-to-b from-emerald-50 to-green-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: iMessage Animation */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative group w-full">
                {/* Soft glow effect */}
                <div className="absolute -inset-8 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-[3rem] blur-3xl"></div>
                
                {/* iMessage Animation */}
                <div className="relative transform transition-all duration-500 group-hover:scale-[1.02]">
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
            <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-12 text-white shadow-2xl">
              {!isSubmitted ? (
                <div className="text-center space-y-6">
                  <h3 className="text-3xl font-bold font-landing">Join the waitlist</h3>
                  <p className="text-green-50 font-body">Get notified when we launch new features</p>

                  <form onSubmit={handleWaitlistSubmit} className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email"
                      required
                      className="w-full px-5 py-3 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Your phone (optional)"
                      className="w-full px-5 py-3 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
                    />
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full px-6 py-3 bg-white text-green-700 rounded-full font-semibold hover:bg-green-50 transition-all duration-300 hover:scale-105 disabled:opacity-50"
                    >
                      {isLoading ? 'Joining...' : 'Join Waitlist'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle className="w-16 h-16" />
                  </div>
                  <h3 className="text-3xl font-bold font-landing">You're in! 🌱</h3>
                  <p className="text-green-50 font-body">We'll be in touch soon</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <Leaf className="w-4 h-4 text-green-600" />
            <span>Sproutline</span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="/privacy.html" className="hover:text-green-600 transition-colors">Privacy</a>
            <a href="/terms.html" className="hover:text-green-600 transition-colors">Terms</a>
          </div>
          <span>© 2025 Made with 💚</span>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;