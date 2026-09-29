/**
 * Hadith Lens - Application Configuration
 * You can easily customize the application name, branding, defaults, and sources here.
 */

export const appConfig = {
  // App Branding & Names (Easily rename here)
  appName: "Smart Translator of Islamic Values",
  appNameArabic: "المترجم الذكي ل القيم الأسلامية",
  tagline: "Instant authentic Prophetic Hadith discovery & multi-language translation engine",
  taglineArabic: "المحرك الذكي لاكتشاف الأحاديث النبوية الصحيحة والترجمة الفورية لجميع لغات العالم",
  version: "1.0.0",

  // Server & Environment
  server: {
    port: parseInt(process.env.PORT || "3000", 10),
    host: "localhost",
    defaultModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  },

  // Mandatory Authentic Hadith Collections
  sources: {
    bukhari: {
      id: "bukhari",
      titleEn: "Sahih al-Bukhari",
      titleAr: "صحيح البخاري",
      author: "الإمام محمد بن إسماعيل البخاري رحمه الله",
      grade: "صحيح (أعلى درجات الصحة)",
      badgeColor: "#059669"
    },
    muslim: {
      id: "muslim",
      titleEn: "Sahih Muslim",
      titleAr: "صحيح مسلم",
      author: "الإمام مسلم بن الحجاج النيسابوري رحمه الله",
      grade: "صحيح (أعلى درجات الصحة)",
      badgeColor: "#0284c7"
    }
  },

  // Search Engine Parameters
  search: {
    topCandidatesCount: 5,
    fuzzyThreshold: 0.2,
    prefixMatching: true,
    cacheTtlHours: 168 // 7 days in SQLite cache
  },

  // Footer & Copyright (mandatory requirement)
  footer: {
    copyrightArabic: "© 2026 عبدالحميد العتيبي — جميع الحقوق محفوظة",
    copyrightEnglish: "© 2026 Abdulhamid Alotaibi — All Rights Reserved"
  }
};

export default appConfig;
