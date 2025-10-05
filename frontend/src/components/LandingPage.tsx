import React, { useState } from 'react';
import { ArrowRight, Leaf, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
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
            className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            Try It
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <h1 className="text-6xl md:text-7xl font-bold font-landing text-gray-900 leading-tight animate-fade-in">
            Your Plants,
            <br />
            <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Texting You
            </span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-600 max-w-2xl mx-auto font-body leading-relaxed animate-fade-in-delay-1">
            Give them a personality. They'll remind you to water them, roast you when you forget, and become the best group chat you've ever been in.
          </p>
          <div className="animate-fade-in-delay-2">
            <button
              onClick={onGetStarted}
              className="group px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full font-semibold text-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 inline-flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Premium Showcase Section */}
      <section className="py-20 md:py-28 px-6 bg-gradient-to-b from-gray-900 to-gray-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* iPhone with video/image */}
          <div className="flex justify-center items-center opacity-0 animate-fade-in">
            <div className="relative group">
              {/* Soft glow */}
              <div className="absolute -inset-8 bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20 rounded-[4rem] blur-3xl"></div>
              
              {/* iPhone frame mask */}
              <div className="relative transform transition-all duration-500 group-hover:scale-[1.02]">
                <div className="relative w-full max-w-sm md:max-w-md mx-auto aspect-[9/19.5] rounded-[3rem] overflow-hidden shadow-2xl">
                  {/* Static image (replace with video when ready) */}
                  <img 
                    src="/images/mockups/Thread-portrait.png" 
                    alt="Rocky Rootboa conversation showing sarcastic plant personality"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Uncomment for video:
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src="/images/mockups/Thread-portrait.mp4" type="video/mp4" />
                  </video>
                  */}
                </div>
                
                {/* iPhone notch overlay (optional) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-8 bg-black rounded-b-3xl opacity-90"></div>
              </div>
            </div>
          </div>

        </div>

        {/* Curved SVG divider to next section */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-1">
          <svg 
            viewBox="0 0 1440 120" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            <path 
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" 
              fill="rgb(240, 253, 244)"
            />
          </svg>
        </div>
      </section>

      {/* How It Works - Enhanced Single Section */}
      <section className="py-32 px-6 bg-gradient-to-b from-green-50 via-white to-emerald-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold font-landing text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-body leading-relaxed">
              Three simple steps to never kill a plant again
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Step 1 */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                  <div className="text-6xl">📱</div>
                </div>
                <h3 className="text-3xl font-bold font-landing text-gray-900 mb-4 text-center">Add your plants</h3>
                <p className="text-lg text-gray-600 font-body leading-relaxed text-center mb-6">
                  Pick from our catalog, give them names and personalities
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <p className="text-gray-600 font-body">Choose from 200+ plant species</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <p className="text-gray-600 font-body">Pick a personality type</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-green-600 text-sm">✓</span>
                    </div>
                    <p className="text-gray-600 font-body">Give them a unique name</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mb-6">
                  <div className="text-6xl">💬</div>
                </div>
                <h3 className="text-3xl font-bold font-landing text-gray-900 mb-4 text-center">They text you</h3>
                <p className="text-lg text-gray-600 font-body leading-relaxed text-center mb-6">
                  Get reminders, jokes, and updates — all in their unique voice
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-emerald-600 text-sm">✓</span>
                    </div>
                    <p className="text-gray-600 font-body">Sarcastic, dramatic, or chill vibes</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-emerald-600 text-sm">✓</span>
                    </div>
                    <p className="text-gray-600 font-body">Watering & care reminders</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-emerald-600 text-sm">✓</span>
                    </div>
                    <p className="text-gray-600 font-body">Weather-based adjustments</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-br from-teal-100 to-green-100 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-teal-100 to-green-100 rounded-2xl flex items-center justify-center mb-6">
                  <div className="text-6xl">🌿</div>
                </div>
                <h3 className="text-3xl font-bold font-landing text-gray-900 mb-4 text-center">Watch them thrive</h3>
                <p className="text-lg text-gray-600 font-body leading-relaxed text-center mb-6">
                  Never forget to water. Healthier plants, more fun.
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-teal-600 text-sm">✓</span>
                    </div>
                    <p className="text-gray-600 font-body">Track growth & health</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-teal-600 text-sm">✓</span>
                    </div>
                    <p className="text-gray-600 font-body">Build relationships with your plants</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-teal-600 text-sm">✓</span>
                    </div>
                    <p className="text-gray-600 font-body">Join the best group chat ever</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="py-24 px-6 bg-gradient-to-b from-emerald-50 to-green-50">
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-3xl p-12 text-white shadow-2xl transform transition-all duration-500 hover:scale-105 hover:shadow-3xl">
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