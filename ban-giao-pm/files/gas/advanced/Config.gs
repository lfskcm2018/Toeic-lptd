/**
 * Config.gs – cấu hình Pronunciation Master.
 * Sinh tự động bởi work/pm-core/build-pm-app.js — có thể chỉnh tay sau.
 */
var Config = {
  APP_NAME: 'Pronunciation Master – Advanced',
  APP_VERSION: '1.0.0',
  COURSE_ID: 'PRON_ADVANCED',
  CDN_BASE: 'https://lfskcm2018.github.io/Toeic-lptd/pm-advanced-audio',
  RECORDING_ENGINE_URL: 'https://lfskcm2018.github.io/Toeic-lptd/recording-engine/',
  MAX_UPLOAD_MB: 5,
  CACHE_TTL_SECONDS: 3600,
  ROLES: { STUDENT: 'STUDENT', TEACHER: 'TEACHER', ADMIN: 'ADMIN' },
  COMPLETION_THRESHOLDS: {
    SOUND_DISCRIMINATION: 80, WORD_STRESS: 80, SENTENCE_STRESS: 75,
    LINKING: 75, CONVERSATION: 75, INFORMATION_FOCUS: 80, INTONATION_FUNCTION: 75
  }
};
