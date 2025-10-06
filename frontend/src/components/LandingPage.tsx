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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Sproutline
            </span>
          </div>
          <button
            onClick={onGetStarted}
            className="px-6 py-2 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all duration-300"
          >
            Try It
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-50/50 via-white to-emerald-50/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-32 md:pb-40">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-8 z-10 relative">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black font-landing text-gray-900 leading-tight">
                Your plants,
                <br />
                texting you!
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 font-body leading-relaxed">
                They'll remind you to water them, roast you when you forget, and become the best group chat you've ever been in.
              </p>
              <div>
                <button
                  onClick={onGetStarted}
                  className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-semibold text-lg hover:bg-gray-800 transition-all duration-300"
                >
                  Join the waitlist
                </button>
              </div>
            </div>

            {/* Right: iPhone Animation */}
            <div className="hidden lg:flex justify-end relative z-10">
              <div className="w-full max-w-[550px]">
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
        </div>

        {/* Wave that cuts across the bottom */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-20 -mb-px">
          <svg className="relative block w-full h-16 md:h-20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" preserveAspectRatio="none">
            <path d="M0,40 Q360,100 720,40 T1440,40 L1440,100 L0,100 Z" className="fill-slate-900"></path>
          </svg>
        </div>
      </section>

      {/* How It Works - Dark Section */}
      <section className="relative bg-slate-900">
        <div className="relative pt-20 pb-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold font-landing text-white mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto font-body leading-relaxed">
                Three simple steps to never kill a plant again
              </p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Step 1 - Search Animation */}
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 hover:bg-white/20 transition-all duration-300">
                <div className="relative w-full max-w-sm h-auto mx-auto mb-6">
                  <div className="absolute -inset-6 bg-gradient-to-br from-green-400/20 via-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
                  <div className="relative">
                    {searchAnimationData && (
                      <Lottie 
                        animationData={searchAnimationData}
                        loop={true}
                        className="w-full h-auto drop-shadow-2xl"
                      />
                    )}
                  </div>
                </div>
                <h3 className="text-3xl font-bold font-landing text-white mb-4 text-center">Add your plants</h3>
                <p className="text-lg text-gray-300 font-body leading-relaxed text-center mb-6">
                  Pick from our catalog, give them names and personalities
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-green-400/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-400 text-xs">✓</span>
                    </div>
                    <p className="text-gray-300 font-body">Choose from 200+ plant species</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-green-400/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-400 text-xs">✓</span>
                    </div>
                    <p className="text-gray-300 font-body">Pick a personality type</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-green-400/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-400 text-xs">✓</span>
                    </div>
                    <p className="text-gray-300 font-body">Give them a unique name</p>
                  </div>
                </div>
              </div>

              {/* Step 2 - Hero Animation */}
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 hover:bg-white/20 transition-all duration-300">
                <div className="relative w-full max-w-sm h-auto mx-auto mb-6">
                  <div className="absolute -inset-6 bg-gradient-to-br from-green-400/20 via-emerald-400/20 to-teal-400/20 rounded-full blur-3xl"></div>
                  <div className="relative">
                    {animationData && (
                      <Lottie 
                        animationData={animationData}
                        loop={true}
                        className="w-full h-auto drop-shadow-2xl"
                      />
                    )}
                  </div>
                </div>
                <h3 className="text-3xl font-bold font-landing text-white mb-4 text-center">They text you</h3>
                <p className="text-lg text-gray-300 font-body leading-relaxed text-center mb-6">
                  Get reminders, jokes, and updates — all in their unique voice
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-green-400/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-400 text-xs">✓</span>
                    </div>
                    <p className="text-gray-300 font-body">Sarcastic, dramatic, or chill vibes</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-green-400/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-400 text-xs">✓</span>
                    </div>
                    <p className="text-gray-300 font-body">Watering & care reminders</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-green-400/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-400 text-xs">✓</span>
                    </div>
                    <p className="text-gray-300 font-body">Weather-based adjustments</p>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 hover:bg-white/20 transition-all duration-300">
                <div className="text-6xl mb-6 text-center">🌿</div>
                <h3 className="text-3xl font-bold font-landing text-white mb-4 text-center">Watch them thrive</h3>
                <p className="text-lg text-gray-300 font-body leading-relaxed text-center mb-6">
                  Never forget to water. Healthier plants, more fun.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-green-400/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-400 text-xs">✓</span>
                    </div>
                    <p className="text-gray-300 font-body">Track growth & health</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-green-400/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-400 text-xs">✓</span>
                    </div>
                    <p className="text-gray-300 font-body">Build relationships with your plants</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-green-400/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-green-400 text-xs">✓</span>
                    </div>
                    <p className="text-gray-300 font-body">Join the best group chat ever</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
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