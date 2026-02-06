import type { Language } from "@/features/ui/uiSlice";

type Namespace = "common" | "home" | "auth" | "dashboard";

type TranslationDict = Record<Namespace, Record<string, string>>;

const translations: Record<Language, TranslationDict> = {
  en: {
    common: {
      brand: "Abdoun Real Estate",
      home: "Home",
      login: "Login",
      signup: "Sign up",
      logout: "Logout",
      dashboard: "Dashboard",
      themeLight: "Light",
      themeDark: "Dark",
      language: "Language",
      user: "User",
      agent: "Agent",
      admin: "Admin",
    },
    home: {
      heroTitle: "Find your next property in Abdoun and beyond",
      heroSubtitle:
        "Browse curated listings, connect with trusted agents, and explore premium neighborhoods inspired by platforms like Zillow and Bayut.",
      ctaBrowse: "Browse listings (mock)",
      ctaGetStarted: "Get started",
      statsTitle: "Market snapshot (mock data)",
    },
    auth: {
      loginTitle: "Sign in to your account",
      signupTitle: "Create your account",
      email: "Email",
      password: "Password",
      role: "Role",
      chooseRole: "Choose a role",
      submitLogin: "Login",
      submitSignup: "Sign up",
      loginAsDemo: "Quick demo login",
    },
    dashboard: {
      welcomeUser: "Welcome to your buyer dashboard",
      welcomeAgent: "Welcome to your agent workspace",
      welcomeAdmin: "Welcome to the admin console",
      mockNotice:
        "All data shown here is mock data for UI and flows only.",
    },
  },
  ar: {
    common: {
      brand: "عبدون للعقارات",
      home: "الرئيسية",
      login: "تسجيل الدخول",
      signup: "إنشاء حساب",
      logout: "تسجيل الخروج",
      dashboard: "لوحة التحكم",
      themeLight: "فاتح",
      themeDark: "داكن",
      language: "اللغة",
      user: "مستخدم",
      agent: "وكيل",
      admin: "مدير",
    },
    home: {
      heroTitle: "ابحث عن عقارك القادم في عبدون وما حولها",
      heroSubtitle:
        "تصفح العقارات المختارة، تواصل مع الوسطاء الموثوقين، واستكشف الأحياء المميزة بإلهام من منصات مثل Zillow وBayut.",
      ctaBrowse: "تصفح العقارات (تجريبي)",
      ctaGetStarted: "ابدأ الآن",
      statsTitle: "نظرة على السوق (بيانات تجريبية)",
    },
    auth: {
      loginTitle: "تسجيل الدخول إلى حسابك",
      signupTitle: "إنشاء حساب جديد",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      role: "الدور",
      chooseRole: "اختر الدور",
      submitLogin: "تسجيل الدخول",
      submitSignup: "إنشاء حساب",
      loginAsDemo: "تسجيل دخول تجريبي سريع",
    },
    dashboard: {
      welcomeUser: "مرحباً بك في لوحة المشتري",
      welcomeAgent: "مرحباً بك في مساحة عمل الوكيل",
      welcomeAdmin: "مرحباً بك في لوحة التحكم الإدارية",
      mockNotice: "جميع البيانات المعروضة هنا تجريبية لأغراض الواجهة فقط.",
    },
  },
  fr: {
    common: {
      brand: "Abdoun Immobilier",
      home: "Accueil",
      login: "Connexion",
      signup: "Créer un compte",
      logout: "Déconnexion",
      dashboard: "Tableau de bord",
      themeLight: "Clair",
      themeDark: "Sombre",
      language: "Langue",
      user: "Utilisateur",
      agent: "Agent",
      admin: "Admin",
    },
    home: {
      heroTitle: "Trouvez votre prochain bien à Abdoun et ailleurs",
      heroSubtitle:
        "Parcourez des annonces sélectionnées, échangez avec des agents de confiance et explorez des quartiers premium inspirés de Zillow et Bayut.",
      ctaBrowse: "Parcourir les annonces (mock)",
      ctaGetStarted: "Commencer",
      statsTitle: "Aperçu du marché (données fictives)",
    },
    auth: {
      loginTitle: "Connectez-vous à votre compte",
      signupTitle: "Créez votre compte",
      email: "E-mail",
      password: "Mot de passe",
      role: "Rôle",
      chooseRole: "Choisissez un rôle",
      submitLogin: "Connexion",
      submitSignup: "Créer un compte",
      loginAsDemo: "Connexion démo rapide",
    },
    dashboard: {
      welcomeUser: "Bienvenue sur votre tableau de bord d’acheteur",
      welcomeAgent: "Bienvenue dans votre espace agent",
      welcomeAdmin: "Bienvenue sur la console admin",
      mockNotice:
        "Toutes les données affichées ici sont fictives pour la démo UI.",
    },
  },
  es: {
    common: {
      brand: "Abdoun Bienes Raíces",
      home: "Inicio",
      login: "Iniciar sesión",
      signup: "Registrarse",
      logout: "Cerrar sesión",
      dashboard: "Panel",
      themeLight: "Claro",
      themeDark: "Oscuro",
      language: "Idioma",
      user: "Usuario",
      agent: "Agente",
      admin: "Administrador",
    },
    home: {
      heroTitle: "Encuentra tu próxima propiedad en Abdoun y más allá",
      heroSubtitle:
        "Explora anuncios seleccionados, conéctate con agentes confiables y descubre barrios premium inspirados en Zillow y Bayut.",
      ctaBrowse: "Ver propiedades (mock)",
      ctaGetStarted: "Empezar",
      statsTitle: "Resumen del mercado (datos ficticios)",
    },
    auth: {
      loginTitle: "Inicia sesión en tu cuenta",
      signupTitle: "Crea tu cuenta",
      email: "Correo electrónico",
      password: "Contraseña",
      role: "Rol",
      chooseRole: "Elige un rol",
      submitLogin: "Iniciar sesión",
      submitSignup: "Registrarse",
      loginAsDemo: "Login demo rápido",
    },
    dashboard: {
      welcomeUser: "Bienvenido a tu panel de comprador",
      welcomeAgent: "Bienvenido a tu espacio de agente",
      welcomeAdmin: "Bienvenido a la consola de administrador",
      mockNotice:
        "Todos los datos mostrados aquí son ficticios solo para la interfaz.",
    },
  },
};

export function t(lang: Language, ns: Namespace, key: string): string {
  return translations[lang]?.[ns]?.[key] ?? translations.en[ns]?.[key] ?? key;
}

