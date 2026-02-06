export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const homeTranslations: Record<
  LanguageCode,
  {
    heroTitle: string;
    heroSubtitle: string;
    heroTabs: { buy: string; rent: string; sell: string };
    heroLocationLabel: string;
    heroLocationPlaceholder: string;
    heroTypeLabel: string;
    heroBudgetLabel: string;
    heroSearch: string;
    featuredTitle: string;
    featuredSubtitle: string;
    featuredViewAll: string;
    servicesTitle: string;
    servicesSubtitle: string;
    servicesCards: { buying: string; selling: string; management: string };
    whyTitle: string;
    whyPoints: {
      trusted: string;
      transparency: string;
      advisors: string;
      exclusive: string;
    };
    footerDescription: string;
    footerQuickLinks: { buy: string; rent: string; sell: string; agents: string };
    footerCompany: { about: string; contact: string; careers: string; privacy: string };
    footerStayUpdatedTitle: string;
    footerStayUpdatedCopy: string;
    footerEmailPlaceholder: string;
    footerSubscribe: string;
    footerTerms: string;
    footerPrivacy: string;
  }
> = {
  en: {
    heroTitle: "Find Your Dream Home in Amman",
    heroSubtitle:
      "Discover luxury properties, exclusive villas, and modern apartments in the most prestigious neighborhoods.",
    heroTabs: { buy: "Buy", rent: "Rent", sell: "Sell" },
    heroLocationLabel: "Location",
    heroLocationPlaceholder: "City, Zip, or Neighborhood",
    heroTypeLabel: "Type",
    heroBudgetLabel: "Budget",
    heroSearch: "Search",
    featuredTitle: "Featured Properties",
    featuredSubtitle: "Handpicked homes for every lifestyle",
    featuredViewAll: "View all properties →",
    servicesTitle: "Our Services",
    servicesSubtitle:
      "From buying and selling to property management, our dedicated team supports you at every step.",
    servicesCards: {
      buying: "Buying a Home",
      selling: "Selling Property",
      management: "Property Management",
    },
    whyTitle: "Why Choose Abdoun Real Estate?",
    whyPoints: {
      trusted: "Trusted Excellence",
      transparency: "Complete Transparency",
      advisors: "Dedicated Advisors",
      exclusive: "Exclusive Listings",
    },
    footerDescription:
      "Premium real estate agency helping families and investors find exceptional properties across Amman's top neighborhoods.",
    footerQuickLinks: { buy: "Buy", rent: "Rent", sell: "Sell", agents: "Agents" },
    footerCompany: {
      about: "About",
      contact: "Contact",
      careers: "Careers",
      privacy: "Privacy Policy",
    },
    footerStayUpdatedTitle: "Stay Updated",
    footerStayUpdatedCopy:
      "Subscribe for the latest listings and market insights from Abdoun and beyond.",
    footerEmailPlaceholder: "Email address",
    footerSubscribe: "Subscribe",
    footerTerms: "Terms of Service",
    footerPrivacy: "Privacy Policy",
  },
  ar: {
    heroTitle: "ابحث عن منزلك المثالي في عمّان",
    heroSubtitle:
      "اكتشف العقارات الفاخرة والفلل الحصرية والشقق الحديثة في أرقى الأحياء السكنية.",
    heroTabs: { buy: "شراء", rent: "إيجار", sell: "بيع" },
    heroLocationLabel: "الموقع",
    heroLocationPlaceholder: "المدينة أو الرمز البريدي أو الحي",
    heroTypeLabel: "النوع",
    heroBudgetLabel: "الميزانية",
    heroSearch: "بحث",
    featuredTitle: "العقارات المميزة",
    featuredSubtitle: "اختيارات خاصة تناسب أسلوب حياتك",
    featuredViewAll: "عرض كل العقارات ←",
    servicesTitle: "خدماتنا",
    servicesSubtitle:
      "من الشراء والبيع إلى إدارة العقارات، فريقنا المتخصص يرافقك في كل خطوة.",
    servicesCards: {
      buying: "شراء عقار",
      selling: "بيع عقار",
      management: "إدارة عقارات",
    },
    whyTitle: "لماذا تختار عبدون العقارية؟",
    whyPoints: {
      trusted: "خبرة موثوقة",
      transparency: "شفافية كاملة",
      advisors: "مستشارون مخصصون",
      exclusive: "عقارات حصرية",
    },
    footerDescription:
      "شركة عقارية رائدة تساعد العائلات والمستثمرين في إيجاد أفضل العقارات في أحياء عمّان المرموقة.",
    footerQuickLinks: { buy: "شراء", rent: "إيجار", sell: "بيع", agents: "الوكلاء" },
    footerCompany: {
      about: "من نحن",
      contact: "اتصل بنا",
      careers: "الوظائف",
      privacy: "سياسة الخصوصية",
    },
    footerStayUpdatedTitle: "كن على اطلاع",
    footerStayUpdatedCopy:
      "اشترك للحصول على أحدث العروض العقارية وتحليلات السوق في عمّان وما حولها.",
    footerEmailPlaceholder: "البريد الإلكتروني",
    footerSubscribe: "اشترك",
    footerTerms: "شروط الاستخدام",
    footerPrivacy: "سياسة الخصوصية",
  },
  es: {
    heroTitle: "Encuentra la casa de tus sueños en Ammán",
    heroSubtitle:
      "Descubre propiedades de lujo, villas exclusivas y apartamentos modernos en los barrios más prestigiosos.",
    heroTabs: { buy: "Comprar", rent: "Alquilar", sell: "Vender" },
    heroLocationLabel: "Ubicación",
    heroLocationPlaceholder: "Ciudad, código postal o barrio",
    heroTypeLabel: "Tipo",
    heroBudgetLabel: "Presupuesto",
    heroSearch: "Buscar",
    featuredTitle: "Propiedades destacadas",
    featuredSubtitle: "Hogares seleccionados para cada estilo de vida",
    featuredViewAll: "Ver todas las propiedades →",
    servicesTitle: "Nuestros servicios",
    servicesSubtitle:
      "Desde la compra y venta hasta la gestión de propiedades, nuestro equipo te acompaña en cada paso.",
    servicesCards: {
      buying: "Compra de vivienda",
      selling: "Venta de propiedad",
      management: "Gestión de propiedades",
    },
    whyTitle: "¿Por qué elegir Abdoun Real Estate?",
    whyPoints: {
      trusted: "Excelencia confiable",
      transparency: "Transparencia total",
      advisors: "Asesores dedicados",
      exclusive: "Listados exclusivos",
    },
    footerDescription:
      "Agencia inmobiliaria premium que ayuda a familias e inversores a encontrar propiedades excepcionales en los mejores barrios de Ammán.",
    footerQuickLinks: {
      buy: "Comprar",
      rent: "Alquilar",
      sell: "Vender",
      agents: "Agentes",
    },
    footerCompany: {
      about: "Sobre nosotros",
      contact: "Contacto",
      careers: "Empleo",
      privacy: "Política de privacidad",
    },
    footerStayUpdatedTitle: "Mantente informado",
    footerStayUpdatedCopy:
      "Suscríbete para recibir las últimas propiedades y análisis del mercado en Abdoun y más allá.",
    footerEmailPlaceholder: "Correo electrónico",
    footerSubscribe: "Suscribirse",
    footerTerms: "Términos de servicio",
    footerPrivacy: "Política de privacidad",
  },
  fr: {
    heroTitle: "Trouvez la maison de vos rêves à Amman",
    heroSubtitle:
      "Découvrez des propriétés de luxe, des villas exclusives et des appartements modernes dans les quartiers les plus prestigieux.",
    heroTabs: { buy: "Acheter", rent: "Louer", sell: "Vendre" },
    heroLocationLabel: "Localisation",
    heroLocationPlaceholder: "Ville, code postal ou quartier",
    heroTypeLabel: "Type",
    heroBudgetLabel: "Budget",
    heroSearch: "Rechercher",
    featuredTitle: "Biens immobiliers en vedette",
    featuredSubtitle: "Des maisons sélectionnées pour chaque style de vie",
    featuredViewAll: "Voir toutes les propriétés →",
    servicesTitle: "Nos services",
    servicesSubtitle:
      "De l'achat et la vente à la gestion locative, notre équipe vous accompagne à chaque étape.",
    servicesCards: {
      buying: "Achat de bien",
      selling: "Vente de bien",
      management: "Gestion de biens",
    },
    whyTitle: "Pourquoi choisir Abdoun Real Estate ?",
    whyPoints: {
      trusted: "Excellence reconnue",
      transparency: "Transparence totale",
      advisors: "Conseillers dédiés",
      exclusive: "Biens exclusifs",
    },
    footerDescription:
      "Agence immobilière haut de gamme aidant les familles et les investisseurs à trouver des biens d'exception dans les meilleurs quartiers d'Amman.",
    footerQuickLinks: {
      buy: "Acheter",
      rent: "Louer",
      sell: "Vendre",
      agents: "Agents",
    },
    footerCompany: {
      about: "À propos",
      contact: "Contact",
      careers: "Carrières",
      privacy: "Politique de confidentialité",
    },
    footerStayUpdatedTitle: "Restez informé",
    footerStayUpdatedCopy:
      "Abonnez-vous pour recevoir les dernières annonces et analyses du marché à Abdoun et au-delà.",
    footerEmailPlaceholder: "Adresse e-mail",
    footerSubscribe: "S'abonner",
    footerTerms: "Conditions d'utilisation",
    footerPrivacy: "Politique de confidentialité",
  },
};

