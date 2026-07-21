// App UI string translations keyed by a stable key, for English and Hindi.
// Dynamic content (module/category/form labels) is localized by the API; this
// covers the static app chrome. Use `{name}`-style placeholders for values
// interpolated at call time.

// English strings (also the fallback for any missing Hindi key).
const en = {
  // Bottom tab bar.
  'tab.home': 'Home',
  'tab.chat': 'Chat',
  'tab.wishlist': 'Wishlist',
  'tab.profile': 'Profile',

  // Common actions / labels.
  'common.cart': 'Cart',
  'common.notifications': 'Notifications',
  'common.retry': 'Retry',
  'common.cancel': 'Cancel',
  'common.logout': 'Log out',
  'common.loggingOut': 'Signing out…',
  'common.appearance': 'Appearance: {value}',

  // Home screen.
  'home.greeting': 'Hello, {name}',
  'home.prompt': 'What are you looking for?',
  'home.featured.title': 'Featured',
  'home.featured.subtitle': 'Curated picks for you',
  'home.featured.emptyTitle': 'No products yet',
  'home.featured.emptyDesc':
    'Connect the catalog service to display featured products here.',

  // Sell sheet.
  'sell.title': 'Sell on Tantra',
  'sell.subtitle': 'Choose what you want to sell.',
  'sell.loadErrorTitle': "Couldn't load options",
  'sell.loadErrorDesc': 'Please check your connection and try again.',
  'sell.emptyTitle': 'Nothing to sell yet',
  'sell.emptyDesc':
    "Selling options aren't available right now. Please check back soon.",

  // Sell categories / listing form.
  'sell.categoriesTitle': 'Categories',
  'sell.formErrorRetry': 'Try again',
  'form.subtitle': 'Fill in the details to post your listing.',
  'form.submit': 'Post listing',
  'form.addMore': 'Add more details (optional)',
  'form.hideMore': 'Hide extra details',
  'form.selectDescription': 'Choose a {label} from the list.',
  'form.submitSuccess': 'Listing posted successfully.',
  'form.submitError': "Couldn't post the listing. Please try again.",
  'form.locked': 'Locked — delete and recreate to change.',

  // Chat screen.
  'chat.title': 'Chat',
  'chat.emptyTitle': 'No conversations yet',
  'chat.emptyDesc': 'Messages with buyers and sellers will appear here.',

  // Wishlist screen.
  'wishlist.title': 'Wishlist',
  'wishlist.emptyTitle': 'Your wishlist is empty',
  'wishlist.emptyDesc': 'Tap the heart on any product to save it here.',
  'wishlist.browse': 'Browse products',

  // Cart screen.
  'cart.title': 'Cart',
  'cart.emptyTitle': 'Your cart is empty',

  // Profile screen.
  'profile.title': 'Profile',

  // My Listings.
  'listing.myListingsTitle': 'My Listings',
  'listing.editTitle': 'Edit Listing',
  'listing.emptyTitle': 'No listings yet',
  'listing.emptyDesc': 'Your posted listings will appear here.',
  'listing.edit': 'Edit',
  'listing.quickEdit': 'Quick edit',
  'listing.markSold': 'Mark as sold',
  'listing.markActive': 'Mark as active',
  'listing.markInactive': 'Mark inactive',
  'listing.delete': 'Delete',
  'listing.moreActions': 'More actions',
  'listing.deleteTitle': 'Delete listing?',
  'listing.deleteMessage':
    'This listing will be removed. This cannot be undone.',
  'listing.deleteSuccess': 'Listing deleted.',
  'listing.deleteError': "Couldn't delete the listing. Please try again.",
  'listing.updateSuccess': 'Listing updated.',
  'listing.updateError': "Couldn't update the listing. Please try again.",
  'listing.statusUpdated': 'Status updated.',
  'listing.saveChanges': 'Save changes',
  'listing.quickEditTitle': 'Quick edit',
  'listing.quickEditSubtitle': 'Update the highlighted fields and save.',
  'listing.noInlineFields': 'No quick-editable fields for this listing.',
  'listing.type.sell': 'Sell',
  'listing.type.rent': 'Rent',
  'listing.status.all': 'All',
  'listing.status.active': 'Active',
  'listing.status.sold': 'Sold',
  'listing.status.inactive': 'Inactive',
} as const;

// Supported translation keys.
export type TranslationKey = keyof typeof en;

// Hindi strings.
const hi: Record<TranslationKey, string> = {
  'tab.home': 'होम',
  'tab.chat': 'चैट',
  'tab.wishlist': 'विशलिस्ट',
  'tab.profile': 'प्रोफ़ाइल',

  'common.cart': 'कार्ट',
  'common.notifications': 'सूचनाएं',
  'common.retry': 'पुनः प्रयास करें',
  'common.cancel': 'रद्द करें',
  'common.logout': 'लॉग आउट',
  'common.loggingOut': 'साइन आउट हो रहा है…',
  'common.appearance': 'रूप: {value}',

  'home.greeting': 'नमस्ते, {name}',
  'home.prompt': 'आप क्या खोज रहे हैं?',
  'home.featured.title': 'विशेष',
  'home.featured.subtitle': 'आपके लिए चुनी हुई चीज़ें',
  'home.featured.emptyTitle': 'अभी कोई उत्पाद नहीं',
  'home.featured.emptyDesc':
    'यहां विशेष उत्पाद दिखाने के लिए कैटलॉग सेवा कनेक्ट करें।',

  'sell.title': 'Tantra पर बेचें',
  'sell.subtitle': 'चुनें कि आप क्या बेचना चाहते हैं।',
  'sell.loadErrorTitle': 'विकल्प लोड नहीं हो सके',
  'sell.loadErrorDesc': 'कृपया अपना कनेक्शन जांचें और फिर से प्रयास करें।',
  'sell.emptyTitle': 'अभी बेचने के लिए कुछ नहीं',
  'sell.emptyDesc':
    'बेचने के विकल्प अभी उपलब्ध नहीं हैं। कृपया कुछ देर बाद देखें।',

  'sell.categoriesTitle': 'श्रेणियां',
  'sell.formErrorRetry': 'फिर से प्रयास करें',
  'form.subtitle': 'अपनी लिस्टिंग पोस्ट करने के लिए विवरण भरें।',
  'form.submit': 'लिस्टिंग पोस्ट करें',
  'form.addMore': 'और विवरण जोड़ें (वैकल्पिक)',
  'form.hideMore': 'अतिरिक्त विवरण छिपाएं',
  'form.selectDescription': 'सूची में से {label} चुनें।',
  'form.submitSuccess': 'लिस्टिंग सफलतापूर्वक पोस्ट हो गई।',
  'form.submitError': 'लिस्टिंग पोस्ट नहीं हो सकी। कृपया फिर से प्रयास करें।',
  'form.locked': 'लॉक किया गया — बदलने के लिए हटाएं और दोबारा बनाएं।',

  'chat.title': 'चैट',
  'chat.emptyTitle': 'अभी कोई बातचीत नहीं',
  'chat.emptyDesc': 'खरीदारों और विक्रेताओं के साथ संदेश यहां दिखाई देंगे।',

  'wishlist.title': 'विशलिस्ट',
  'wishlist.emptyTitle': 'आपकी विशलिस्ट खाली है',
  'wishlist.emptyDesc': 'इसे यहां सहेजने के लिए किसी भी उत्पाद पर दिल दबाएं।',
  'wishlist.browse': 'उत्पाद ब्राउज़ करें',

  'cart.title': 'कार्ट',
  'cart.emptyTitle': 'आपकी कार्ट खाली है',

  'profile.title': 'प्रोफ़ाइल',

  'listing.myListingsTitle': 'मेरी लिस्टिंग',
  'listing.editTitle': 'लिस्टिंग संपादित करें',
  'listing.emptyTitle': 'अभी कोई लिस्टिंग नहीं',
  'listing.emptyDesc': 'आपकी पोस्ट की गई लिस्टिंग यहां दिखाई देंगी।',
  'listing.edit': 'संपादित करें',
  'listing.quickEdit': 'त्वरित संपादन',
  'listing.markSold': 'बिका हुआ चिह्नित करें',
  'listing.markActive': 'सक्रिय चिह्नित करें',
  'listing.markInactive': 'निष्क्रिय चिह्नित करें',
  'listing.delete': 'हटाएं',
  'listing.moreActions': 'और विकल्प',
  'listing.deleteTitle': 'लिस्टिंग हटाएं?',
  'listing.deleteMessage': 'यह लिस्टिंग हटा दी जाएगी। इसे पूर्ववत नहीं किया जा सकता।',
  'listing.deleteSuccess': 'लिस्टिंग हटा दी गई।',
  'listing.deleteError': 'लिस्टिंग हटाई नहीं जा सकी। कृपया फिर से प्रयास करें।',
  'listing.updateSuccess': 'लिस्टिंग अपडेट हो गई।',
  'listing.updateError': 'लिस्टिंग अपडेट नहीं हो सकी। कृपया फिर से प्रयास करें।',
  'listing.statusUpdated': 'स्थिति अपडेट हो गई।',
  'listing.saveChanges': 'बदलाव सहेजें',
  'listing.quickEditTitle': 'त्वरित संपादन',
  'listing.quickEditSubtitle': 'चिह्नित फ़ील्ड अपडेट करें और सहेजें।',
  'listing.noInlineFields': 'इस लिस्टिंग के लिए कोई त्वरित-संपादन फ़ील्ड नहीं।',
  'listing.type.sell': 'बेचें',
  'listing.type.rent': 'किराया',
  'listing.status.all': 'सभी',
  'listing.status.active': 'सक्रिय',
  'listing.status.sold': 'बिका हुआ',
  'listing.status.inactive': 'निष्क्रिय',
};

// Translation dictionaries by locale code.
export const translations = { en, hi } as const;
