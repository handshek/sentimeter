export const HERO_PHRASES = [
  "match your design system",
  "install in one command",
  "stream reactions in real time",
  "you actually own the code for",
  "cost less than a coffee to analyze",
];

export const PAIN_POINTS = [
  {
    icon: "🛠️",
    title: "Building from scratch takes forever",
    description:
      "Emoji pickers, star ratings, submit handlers, loading states, thank-you screens... for something that isn't even your core product.",
  },
  {
    icon: "🖥️",
    title: "Analytics means backend work",
    description:
      "Want to actually see the data? Now you need an API route, a database table, a dashboard page. It never ends.",
  },
  {
    icon: "🎨",
    title: "Third-party widgets look... off",
    description:
      "They bring their own CSS, their own fonts, their own opinions. Good luck matching your Tailwind theme.",
  },
];

export const STEPS = [
  {
    number: "01",
    title: "Install",
    description:
      "One shadcn CLI command. The code lands in your project - you own every line.",
    code: "npx shadcn@latest add ...",
  },
  {
    number: "02",
    title: "Embed",
    description:
      "Drop it inline, in a Popover, Dialog, Sheet - anywhere. It adapts to your design system.",
  },
  {
    number: "03",
    title: "Analyze",
    description:
      "Enable analytics with one config key. Reactions stream to your dashboard in real time.",
  },
];

export const SHOWCASE_WIDGETS = [
  { kind: "emoji", label: "Emoji Feedback" },
  { kind: "thumbs", label: "Like / Dislike" },
  { kind: "stars", label: "Star Rating" },
] as const;

export const PRICING = [
  {
    name: "Beta",
    price: "$0.99",
    period: "/month",
    description: "Full analytics dashboard. Cancel anytime.",
    features: [
      "Real-time reaction analytics",
      "Per-project dashboards",
      "Unlimited feedback submissions",
      "All future widget types",
    ],
    cta: "Subscribe for $0.99/mo",
    featured: false,
  },
  {
    name: "Lifetime",
    price: "$29.90",
    period: "one-time",
    description:
      "Pay once, own it forever. Limited seats - price goes up as they fill.",
    features: [
      "Everything in Beta",
      "Lifetime dashboard access",
      "No recurring payments ever",
      "Early supporter pricing",
    ],
    cta: "Get Lifetime Access",
    featured: true,
  },
];

export const FAQ_ITEMS = [
  {
    q: "What exactly is Sentimeter?",
    a: "Sentimeter is a feedback collection system built on shadcn. You install open-source React components into your project with a single CLI command, your users submit emoji/star/thumbs reactions, and you see real-time analytics on a hosted dashboard.",
  },
  {
    q: "Are the widgets really free?",
    a: "Yes. Every widget is 100% free and open-source. You install them into your codebase and own every line of code. The only paid part is the optional analytics dashboard that aggregates and visualizes your feedback data.",
  },
  {
    q: "Do I own the code?",
    a: "Completely. When you run the shadcn CLI command, the component source code is copied directly into your project. There's no runtime dependency on Sentimeter - you can modify, extend, or restyle the widgets however you want.",
  },
  {
    q: "What frameworks are supported?",
    a: "The widgets are built for React and require a shadcn/ui setup (Tailwind CSS + Radix UI primitives). They work with Next.js, Remix, Vite, and any other React framework that supports shadcn.",
  },
  {
    q: "How does the analytics dashboard work?",
    a: "When you enable analytics, each widget sends anonymized reaction data to our API. Your Sentimeter dashboard then displays real-time charts, breakdowns by widget type, and trends over time - all organized per project.",
  },
  {
    q: "Can I customize the look and feel?",
    a: "That's the whole point. Because the widgets live in your codebase and use your Tailwind theme tokens, they automatically match your design system. You can edit the source code directly - change colors, sizes, animations, layout, anything.",
  },
];
