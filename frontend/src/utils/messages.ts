/**
 * Personality-driven messages for PlantTexts
 * Keep the brand voice: playful but not silly, helpful but not preachy
 */

export const messages = {
  // Empty States
  emptyStates: {
    noPlants: {
      title: "Your plant family awaits 🌱",
      description: "Add your first plant and start building better care habits — with a little personality.",
      cta: "Adopt your first plant"
    },
    noPlantsYet: {
      title: "Ready to meet your new plant friends?",
      description: "Each plant gets its own personality and will text you when they need care.",
      cta: "Browse plants"
    },
    noSearchResults: (searchTerm: string) => ({
      title: `No plants named "${searchTerm}"... yet`,
      description: "Try a different search or browse all plants to find your perfect match.",
      cta: "Clear search"
    }),
    noChatSelected: {
      title: "Pick a plant to chat with",
      description: "Your plants are waiting to hear from you. (Yes, they're dramatic like that.)",
    }
  },

  // Loading States
  loading: {
    addingPlant: [
      "Finding the perfect personality...",
      "Teaching your plant to text...",
      "Setting up their contact card...",
      "Getting them settled in...",
      "Almost there..."
    ],
    sendingMessage: [
      "Delivering your message...",
      "Your plant is typing...",
      "Getting a response...",
    ],
    loadingPlants: [
      "Waking up the plants...",
      "Checking the greenhouse...",
      "Gathering your plant family...",
    ],
    generalLoading: [
      "One moment...",
      "Loading...",
      "Just a sec...",
    ]
  },

  // Error Messages
  errors: {
    addPlantFailed: {
      title: "Oops, something went wrong",
      message: "We couldn't add your plant just now. Give it another try?",
      cta: "Try again"
    },
    chatFailed: {
      message: "Your plant seems to be offline right now. Give it a moment and try again! 🌱",
    },
    loadFailed: {
      title: "Hmm, this isn't working",
      message: "We're having trouble loading your plants. Check your connection?",
      cta: "Retry"
    },
    deleteFailed: {
      message: "Couldn't remove that plant. (They're pretty stubborn sometimes.)",
    },
    updateFailed: {
      message: "That didn't save. Want to try again?",
    },
    phoneInvalid: {
      message: "Hmm, that number doesn't look quite right. Try: +1 (555) 123-4567",
    },
    phoneTooShort: {
      message: "That number's a bit short. Need all 10 digits! (Like: 555-123-4567)",
    },
    phoneTooLong: {
      message: "That's a lot of digits. US numbers are 10 digits: (555) 123-4567",
    },
    generic: {
      message: "Something went wrong. Not sure what, but... yeah. Try again?",
    }
  },

  // Success Messages
  success: {
    plantAdded: (nickname: string) => ({
      message: `${nickname} has been added to your plant family! Check your phone for their first message.`,
    }),
    messageSent: {
      message: "Message sent! 🌱",
    },
    careLogged: (careType: string) => ({
      message: `${careType} logged! Your plant appreciates you.`,
    }),
    plantDeleted: (nickname: string) => ({
      message: `${nickname} has been removed. (We'll miss the drama.)`,
    }),
    accountDeleted: {
      message: "Your account has been deleted. Your plants will miss you.",
    }
  },

  // Confirmation Messages
  confirmations: {
    deletePlant: (nickname: string) => ({
      title: `Remove ${nickname}?`,
      message: "This plant will stop texting you. You can always add them back later.",
      confirmText: "Remove plant",
      cancelText: "Keep them"
    }),
    deleteAccount: {
      title: "Delete your account?",
      message: "This will permanently delete all your plants and data. This can't be undone.",
      confirmText: "Delete everything",
      cancelText: "Never mind"
    }
  },

  // Onboarding
  onboarding: {
    welcome: {
      title: "Give your plants a voice.",
      subtitle: "They already brighten your space — now they're part of your group chat.",
      subtext: "Setup takes less than a minute — bring them to life."
    },
    phonePrompt: {
      title: "Where should your plants text you?",
      subtitle: "Don't worry — your number stays private and only your plants will text.",
      placeholder: "(555) 123-4567",
      cta: "Continue"
    },
    plantSelection: {
      title: "Who's joining your plant family?",
      subtitle: "Pick a plant and give them a name. They'll develop their own personality.",
      searchPlaceholder: "Search for a plant...",
      namePlaceholder: "What do you call them?",
      cta: "Add plant"
    },
    firstHello: {
      title: "Your plant is ready to text!",
      message: (nickname: string) => `${nickname} just sent you their first message. Check your phone! 📱`,
      cta: "Go to dashboard"
    }
  }
};

/**
 * Get a random message from an array of options
 */
export const getRandomMessage = (messages: string[]): string => {
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Get a loading message with personality
 */
export const getLoadingMessage = (type: keyof typeof messages.loading = 'generalLoading'): string => {
  return getRandomMessage(messages.loading[type]);
};
