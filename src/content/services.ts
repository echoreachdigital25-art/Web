import type { CategorySlug } from "./categories";

export type Service = {
  slug: string;
  number: string;
  title: string;
  short: string;
  summary: string;
  flagship?: boolean;
  /** Deliverables grouped for progressive disclosure on the services page. */
  groups: { title: string; items: string[] }[];
  /** Portfolio categories that genuinely demonstrate this service. */
  workCategories: CategorySlug[];
  cta: string;
};

export const services: Service[] = [
  {
    slug: "creative-production",
    number: "01",
    title: "Creative Production & Video Advertising",
    short:
      "Creator-style ads, product commercials, brand films and explainers — concepted, produced and finished for the platforms your audience uses.",
    summary:
      "Our flagship service. We take an idea from concept to finished film: realistic AI UGC and creator-style advertising, cinematic product work, explainers and brand storytelling, edited and finished for every placement you need.",
    flagship: true,
    groups: [
      {
        title: "Advertising",
        items: [
          "Realistic AI UGC and creator-style advertisements",
          "Cinematic product commercials",
          "Ecommerce and direct-response video ads",
          "Product demonstrations",
        ],
      },
      {
        title: "Storytelling",
        items: [
          "Brand films and visual storytelling",
          "Animated explainers",
          "Social media videos",
        ],
      },
      {
        title: "Craft",
        items: [
          "Concepts, scripting and storyboarding",
          "Editing and post-production",
          "Motion graphics and visual effects",
        ],
      },
    ],
    workCategories: ["ugc-ai-video-ads", "product-commercials", "brand-films", "product-explainers"],
    cta: "Start a video project",
  },
  {
    slug: "website-design-development",
    number: "02",
    title: "Website Design & Development",
    short: "Fast, responsive websites designed to explain what you do clearly and turn visitors into enquiries.",
    summary:
      "We design and build websites that present your business with clarity and confidence — responsive, quick to load and structured around the actions you want visitors to take.",
    groups: [
      {
        title: "Websites",
        items: [
          "Business and corporate websites",
          "Custom websites",
          "Landing pages",
          "Portfolio and service websites",
        ],
      },
      {
        title: "Improvement",
        items: [
          "Redesigns and modernisation",
          "Responsive development",
          "User experience and performance improvements",
          "Conversion-focused experiences",
        ],
      },
    ],
    workCategories: ["website-design"],
    cta: "Discuss a website",
  },
  {
    slug: "shopify-ecommerce",
    number: "03",
    title: "Shopify & E-commerce Development",
    short: "Shopify stores and ecommerce experiences that make products easy to discover and simple to buy.",
    summary:
      "From a new Shopify store to a considered redesign, we shape the shopping experience around your products — collections, product pages, integrations and checkout flow.",
    groups: [
      {
        title: "Build",
        items: [
          "Shopify design and development",
          "Store setup and configuration",
          "Theme customisation",
          "Store redesign",
        ],
      },
      {
        title: "Experience",
        items: [
          "Product pages and collections",
          "Payment and app integrations",
          "Shopping experience improvements",
          "Ecommerce landing pages",
          "Conversion optimisation",
        ],
      },
    ],
    workCategories: ["shopify-ecommerce"],
    cta: "Discuss your store",
  },
  {
    slug: "marketing-automation-ai",
    number: "04",
    title: "Marketing Automation & AI Solutions",
    short: "CRM workflows, lead handling, booking and AI assistants that keep enquiries moving without extra admin.",
    summary:
      "We map how leads and customers move through your business, then connect the tools that handle the repetitive work — so follow-ups happen on time and nothing is missed.",
    groups: [
      {
        title: "Systems",
        items: [
          "Business process automation",
          "CRM setup and workflows",
          "Workflow integrations",
        ],
      },
      {
        title: "Leads & customers",
        items: [
          "Lead capture and management",
          "Follow-up and nurturing systems",
          "Customer onboarding",
          "Appointment booking",
        ],
      },
      {
        title: "AI assistants",
        items: ["AI chatbots", "AI voice agents and virtual receptionists"],
      },
    ],
    workCategories: [],
    cta: "Discuss automation",
  },
  {
    slug: "email-marketing",
    number: "05",
    title: "Email Marketing",
    short: "Campaigns and automated sequences that welcome, nurture and bring customers back.",
    summary:
      "We plan, design and set up email that earns its place in the inbox — from welcome and abandoned-cart flows to launches and regular newsletters.",
    groups: [
      {
        title: "Automations",
        items: [
          "Automated sequences",
          "Welcome and onboarding emails",
          "Abandoned-cart recovery",
          "Lead nurturing",
          "Customer retention",
        ],
      },
      {
        title: "Campaigns",
        items: ["Strategy and campaigns", "Product launches", "Newsletters"],
      },
      {
        title: "Foundations",
        items: ["Template design", "Segmentation and optimisation"],
      },
    ],
    workCategories: [],
    cta: "Discuss email",
  },
  {
    slug: "social-media-management",
    number: "06",
    title: "Social Media Management",
    short: "Planning, content and day-to-day management that keeps your brand consistent and present.",
    summary:
      "We plan what to say, create the content and manage your channels week to week — with reporting that shows what is working.",
    groups: [
      {
        title: "Plan",
        items: ["Strategy and planning", "Content calendars", "Profile optimisation"],
      },
      {
        title: "Create",
        items: ["Content creation and graphic design", "Short-form videos and Reels"],
      },
      {
        title: "Manage",
        items: [
          "Account management",
          "Scheduling and publishing",
          "Community management",
          "Performance reporting",
        ],
      },
    ],
    workCategories: [],
    cta: "Discuss social",
  },
];

export const serviceOptions = [
  ...services.map((s) => s.title),
  "Multiple services",
  "Not sure yet",
] as const;
