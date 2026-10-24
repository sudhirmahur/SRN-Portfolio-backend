// Initial content, copied from the original portfolio. It is inserted into MongoDB
// only once (when the database has no Profile). After that, everything is edited
// from the admin panel.

export const defaultProfile = {
  name: 'Sudhir Mahur',
  role: 'Full Stack Developer',
  availability: 'Open to opportunities',
  location: 'Ghaziabad, U.P, India',
  email: 'sudhirmahur29@gmail.com',
  phone: '+91 8477959291',

  heroLine1: 'Sudhir Mahur builds',
  heroHighlight: 'full stack experiences',
  heroLine3: 'that feel effortless.',
  heroDescription:
    'Full Stack Developer specialising in CRM and enterprise applications — building scalable Node.js backends, REST APIs, and accessible, high-performance React interfaces.',
  terminalLines: [
    { prompt: '$ whoami', output: 'Sudhir Mahur — Full Stack Developer' },
    { prompt: '$ stack', output: 'React · Node.js · Express · MongoDB' },
    { prompt: '$ status', output: 'Open to opportunities' },
  ],

  aboutParagraphs: [
    "I'm a Full Stack Developer with over a year of experience in Node.js and React.js, specialising in CRM and enterprise application development. I build scalable backend services, REST APIs, and dynamic frontend interfaces, with a consistent focus on accessibility (WCAG 2.1) and performance optimisation.",
    'At Infoprolearning, I work on live CRM and enterprise applications end to end — from requirements analysis through deployment — in an Agile environment. Earlier, at JPR Technosoft, I shipped production features across the MERN stack, including role-based access control, payment integrations, and notification services.',
  ],
  aboutStats: [
    { target: 4, suffix: '+', label: 'Projects shipped' },
    { target: 15, suffix: '+', label: 'Technologies' },
    { target: 1, suffix: '+', label: 'Year experience' },
    { target: 1, suffix: '', label: 'Certification' },
  ],
  aboutFacts: [
    { icon: 'map-pin', text: 'Ghaziabad, U.P, India' },
    { icon: 'briefcase', text: 'Full Stack Developer at Infoprolearning' },
    { icon: 'calendar-clock', text: '1+ year of full stack experience' },
    { icon: 'graduation-cap', text: 'B.Tech CSE, Sunder Deep Engineering College' },
  ],

  avatar: null,
  // Local file served by the frontend (public/Sudhir_Resume.pdf). Upload a new one from the admin panel anytime.
  resume: { url: '/Sudhir_Resume.pdf', publicId: '', resourceType: 'raw', fileName: 'Sudhir_Resume.pdf' },

  socials: [
    { label: 'GitHub', url: 'https://github.com/sudhirmahur', icon: 'github' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/sudhirmahur', icon: 'linkedin' },
    { label: 'Email', url: 'mailto:sudhirmahur29@gmail.com', icon: 'mail' },
  ],

  footerText: 'Full Stack Developer building accessible, high-performance CRM and enterprise web applications.',
  footerNote: 'Built with React',
  siteTitle: 'Sudhir Mahur — Full Stack Developer',
  siteDescription:
    'Sudhir Mahur is a Full Stack Developer specialising in CRM and enterprise applications, building with Node.js, React.js, REST APIs, and accessible, high-performance frontend interfaces.',
};

export const builtinPages = [
  { slug: 'home', label: 'Home', kicker: '', title: '', description: '' },
  {
    slug: 'about',
    label: 'About',
    kicker: 'About',
    title: 'A full stack developer who cares about the details.',
    description:
      'B.Tech in Computer Science, now building CRM and enterprise applications end to end — scalable backend services, REST APIs, and accessible, high-performing frontend interfaces.',
  },
  {
    slug: 'experience',
    label: 'Experience',
    kicker: 'Experience',
    title: "Where I've worked.",
    description: 'Professional experience building and maintaining production frontend interfaces.',
  },
  {
    slug: 'skills',
    label: 'Skills',
    kicker: 'Skills',
    title: 'Tools I reach for every day.',
    description:
      'A practical toolkit for building, styling, and shipping accessible frontend interfaces — with enough backend to be dangerous.',
  },
  {
    slug: 'projects',
    label: 'Projects',
    kicker: 'Projects',
    title: "A few things I've built.",
    description:
      'A mix of full-stack apps and frontend-only builds, each one built to be responsive, accessible, and genuinely usable.',
  },
  {
    slug: 'education',
    label: 'Education',
    kicker: 'Education',
    title: 'Academic background.',
    description:
      'Foundations in computer science that continue to shape how I approach frontend engineering.',
  },
  {
    slug: 'contact',
    label: 'Contact',
    kicker: 'Contact',
    title: "Let's build something together.",
    description: "Have a role, project, or idea in mind? I'd like to hear about it.",
  },
];

export const defaultExperience = [
  {
    position: 'Full Stack Developer (Contract)',
    company: 'Infoprolearning',
    location: 'Ghaziabad, India',
    duration: 'April 2026 — September 2026',
    description:
      'Contributed to live CRM and enterprise applications, working full stack across Node.js services and React.js interfaces with a strong focus on accessibility and performance.',
    responsibilities: [
      'Developed and maintained WCAG 2.1 compliant web applications, ensuring accessibility for users with disabilities',
      'Collaborated on live CRM/enterprise applications using Node.js and React.js',
      'Implemented REST APIs for seamless frontend-backend integration and CRUD operations',
      'Optimized application performance and database interactions',
      'Worked in an Agile environment, contributing to the full SDLC from requirements analysis to deployment',
    ],
    technologies: ['Node.js', 'React.js', 'REST APIs', 'WCAG 2.1', 'Agile'],
  },
  {
    position: 'MERN Stack Developer',
    company: 'JPR Technosoft Ltd',
    location: 'West Noida, India',
    duration: 'April 2025 — March 2026',
    description:
      'Built and shipped production-ready features for enterprise clients, from reusable React components to secure, payment-integrated backend workflows.',
    responsibilities: [
      'Developed responsive web applications using React.js with a focus on component reusability',
      'Built and integrated RESTful APIs with Node.js/Express.js for dynamic data handling',
      'Implemented role-based access control (RBAC) and Redux state management for complex workflows',
      'Integrated Razorpay payment gateway, OTP verification, and email notification services',
      'Collaborated with cross-functional teams to deliver production-ready features for enterprise clients',
    ],
    technologies: ['React.js', 'Node.js', 'Express.js', 'Redux', 'Razorpay', 'RBAC'],
  },
];

export const defaultSkills = [
  {
    title: 'Languages',
    skills: [
      { name: 'JavaScript (ES6+)', icon: 'braces', level: 90, description: 'Core language across the stack' },
      { name: 'Python', icon: 'terminal', level: 75, description: 'Scripting & backend logic' },
      { name: 'HTML5', icon: 'file-code', level: 92, description: 'Semantic, accessible markup' },
      { name: 'CSS3', icon: 'layout', level: 88, description: 'Modern layout & responsive UI' },
    ],
  },
  {
    title: 'Frontend',
    skills: [
      { name: 'React.js', icon: 'atom', level: 90, description: 'Component-driven interfaces' },
      { name: 'Redux', icon: 'layers', level: 82, description: 'Complex state management' },
      { name: 'Tailwind CSS', icon: 'wind', level: 88, description: 'Utility-first styling' },
      { name: 'Bootstrap', icon: 'pointer', level: 78, description: 'Rapid responsive UI' },
      { name: 'Axios', icon: 'send', level: 85, description: 'API integration' },
    ],
  },
  {
    title: 'Backend',
    skills: [
      { name: 'Node.js', icon: 'server', level: 85, description: 'Server-side JavaScript' },
      { name: 'Express.js', icon: 'boxes', level: 84, description: 'REST API design' },
      { name: 'Django', icon: 'globe', level: 68, description: 'Python web framework' },
      { name: 'REST APIs', icon: 'send', level: 86, description: 'CRUD & data integration' },
    ],
  },
  {
    title: 'Database',
    skills: [
      { name: 'MongoDB', icon: 'database', level: 82, description: 'Document data modelling' },
      { name: 'MySQL', icon: 'database', level: 72, description: 'Relational data storage' },
    ],
  },
  {
    title: 'Tools',
    skills: [
      { name: 'Git', icon: 'git-branch', level: 86, description: 'Version control workflows' },
      { name: 'GitHub', icon: 'github', level: 86, description: 'Collaboration & CI' },
      { name: 'VS Code', icon: 'app-window', level: 90, description: 'Daily editor' },
      { name: 'Postman', icon: 'send', level: 84, description: 'API testing' },
    ],
  },
  {
    title: 'Integrations',
    skills: [
      { name: 'Razorpay', icon: 'credit-card', level: 80, description: 'Payment gateway integration' },
      { name: 'JWT Authentication', icon: 'shield-check', level: 80, description: 'Secure auth flows' },
      { name: 'OTP Verification', icon: 'key', level: 78, description: 'Identity verification' },
      { name: 'Email APIs', icon: 'mail', level: 78, description: 'Transactional notifications' },
    ],
  },
  {
    title: 'Accessibility',
    skills: [{ name: 'WCAG 2.1', icon: 'eye', level: 84, description: 'Standards-driven compliance' }],
  },
];

export const defaultProjects = [
  {
    title: 'Wizly — E-commerce Platform',
    description:
      'A full-stack e-commerce platform with a customer-facing site and admin panel, handling inventory, membership tiers, and end-to-end order management.',
    tags: ['MERN Stack', 'Redux', 'Tailwind CSS', 'Razorpay'],
    features: [
      'Inventory tracking, discounts, prime/normal member tags',
      'Dynamic CMS for content management',
      'Cart system with order tracking',
      'Razorpay payment integration',
      'Role-based access control',
    ],
    githubUrl: 'https://github.com/sudhirmahur/wizly',
    liveUrl: '',
    category: 'Full Stack',
    featured: true,
  },
  {
    title: 'Millio — Task & Workflow Management',
    description:
      'An internal task and workflow management system built to streamline team operations, with configurable permissions and a full audit trail.',
    tags: ['MERN Stack', 'Redux', 'Tailwind CSS'],
    features: [
      'Role-based access control with configurable permissions',
      'Task workflows with audit history',
      'Status, assignment, and action tracking',
    ],
    githubUrl: 'https://github.com/sudhirmahur/millio',
    liveUrl: '',
    category: 'Full Stack',
    featured: true,
  },
  {
    title: 'Quickbite — Food Platform',
    description:
      'A food ordering platform with full CRUD for users and restaurant records, integrated payments, and real-time order status updates.',
    tags: ['MERN Stack', 'Redux', 'Tailwind CSS', 'Razorpay'],
    features: [
      'CRUD for users and restaurant records',
      'Razorpay payment integration',
      'Real-time order status updates',
      'Responsive UI with Bootstrap & Tailwind CSS',
    ],
    githubUrl: 'https://github.com/sudhirmahur/quickbite',
    liveUrl: 'https://quickbite1-ashen.vercel.app/',
    category: 'Full Stack',
    featured: true,
  },
  {
    title: 'Spendly — Expense Tracker',
    description:
      'A full-stack MERN expense management application for tracking income and expenses, managing categories and workspaces, and viewing financial summaries through a responsive dashboard.',
    tags: ['MERN Stack', 'React.js', 'Node.js', 'MongoDB', 'Tailwind CSS'],
    features: [
      'User authentication and protected routes',
      'Income and expense transaction management',
      'Category and workspace management',
      'Financial summary dashboard',
      'REST API integration with Node.js and Express',
      'MongoDB database integration',
      'Responsive React frontend',
    ],
    githubUrl: 'https://github.com/sudhirmahur/spendly-frontend',
    liveUrl: 'https://spendly-frontend-mu.vercel.app/',
    category: 'Full Stack',
  },
  {
    title: 'DNA Admin Panel',
    description:
      'An admin dashboard for a medical education platform, managing students, teachers, and courses through a clean, filterable interface.',
    tags: ['React.js', 'Tailwind CSS'],
    features: [
      'Reusable React components',
      'Axios API integration',
      'React Router navigation',
      'Data filtering, search & pagination',
    ],
    githubUrl: 'https://github.com/sudhirmahur/dna-admin-panel',
    liveUrl: '',
    category: 'Frontend',
  },
  {
    title: 'Suru Design — Creative Frontend',
    description:
      'A modern React-based frontend website focused on clean visual design, responsive layouts, smooth interactions, and reusable UI components.',
    tags: ['React.js', 'Vite', 'Tailwind CSS', 'Responsive Design'],
    features: [
      'Modern responsive UI',
      'Reusable React components',
      'Responsive layouts across devices',
      'Interactive frontend experience',
      'Clean and structured component architecture',
    ],
    githubUrl: '',
    liveUrl: 'https://suru-design.vercel.app/',
    category: 'Frontend',
  },
  {
    title: 'Lavaniya Bio Farm — Business Website',
    description:
      'A responsive business website for Lavaniya Bio Farm, designed with a modern visual interface to present the brand, products, and business information.',
    tags: ['React.js', 'Vite', 'Tailwind CSS', 'Responsive Design'],
    features: [
      'Responsive business website',
      'Modern landing page design',
      'Reusable React components',
      'Mobile-friendly layouts',
      'Interactive UI sections',
    ],
    githubUrl: '',
    liveUrl: 'https://lavaniya-bio-farm.vercel.app/',
    category: 'Frontend',
  },
  {
    title: 'Weather Podcast — Weather Experience',
    description:
      'A frontend weather and podcast experience combining weather information with podcast-style content in an interactive and responsive interface.',
    tags: ['React.js', 'Vite', 'API Integration', 'Tailwind CSS'],
    features: [
      'Weather information interface',
      'Podcast-style content experience',
      'Responsive React UI',
      'API-based data integration',
      'Interactive frontend components',
    ],
    githubUrl: '',
    liveUrl: 'https://weather-podcast-tau.vercel.app/',
    category: 'Frontend',
  },
  {
    title: 'Eagle — Cab Service Website',
    description:
      'A modern frontend website for a cab and transportation service, designed to provide a professional booking-focused experience with responsive layouts.',
    tags: ['React.js', 'Vite', 'Tailwind CSS', 'Responsive Design'],
    features: [
      'Professional cab service interface',
      'Responsive landing page',
      'Service-focused sections',
      'Modern navigation and UI',
      'Mobile-friendly design',
    ],
    githubUrl: '',
    liveUrl: 'https://eagle-beige.vercel.app/',
    category: 'Frontend',
  },
  {
    title: 'Blog Management System',
    description:
      'A React-based blog management frontend with a clean dashboard interface for managing blog content. The frontend is currently deployed and functional, while the backend deployment is still in progress.',
    tags: ['React.js', 'Vite', 'Tailwind CSS', 'REST API'],
    features: [
      'Blog management dashboard',
      'React-based component architecture',
      'Responsive user interface',
      'Blog content management UI',
      'Frontend deployment on Vercel',
      'Backend integration ready',
    ],
    githubUrl: '',
    liveUrl: 'https://blog-management-ten-blue.vercel.app/',
    category: 'Frontend',
  },
];

export const defaultEducation = [
  {
    degree: 'Bachelor of Technology — Computer Science & Engineering',
    institute: 'Sunder Deep Engineering College, Ghaziabad',
    duration: '2021 — 2025',
    cgpa: '7.29 / 10',
    subjects: [
      'Data Structures & Algorithms',
      'Database Management Systems',
      'Web Technologies',
      'Software Engineering',
      'Computer Networks',
    ],
  },
];

export const defaultCertifications = [
  { title: 'Python Full Stack Development Training', issuer: 'Ducat, Ghaziabad', year: '2025' },
];
