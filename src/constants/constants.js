
// only for /new route as that page needs value
//################################################################
export const CATEGORIES = [
  { value: "ai", label: "AI" },
  { value: "productivity", label: "Productivity" },
  { value: "marketing", label: "Marketing" },
  { value: "finance", label: "Finance" },
  { value: "hr", label: "HR & Recruitment" },
  { value: "ecommerce", label: "E-Commerce" },
  { value: "education", label: "Education" },
  { value: "healthcare", label: "Healthcare" },
  { value: "developer-tools", label: "Developer Tools" },
  { value: "analytics", label: "Analytics" },
  { value: "communication", label: "Communication" },
  { value: "design", label: "Design" },
  { value: "security", label: "Security" },
  { value: "other", label: "Other" },
];

export const ALL_TECH_STACKS = [
  "JavaScript","TypeScript","Python","Rust","Go","Java","Kotlin","Swift","C","C++","C#","PHP","Ruby","Scala","Elixir","Haskell","Dart","R","MATLAB","Bash","Lua","Perl","Clojure","F#","Erlang","Zig",
  "React","Next.js","Vue.js","Nuxt.js","Angular","Svelte","SvelteKit","Astro","Remix","Solid.js","Qwik","Alpine.js","HTMX","Ember.js","Backbone.js",
  "Tailwind CSS","CSS Modules","Styled Components","Sass","Less","Bootstrap","Material UI","Chakra UI","shadcn/ui","Radix UI","Ant Design","Mantine","DaisyUI",
  "Node.js","Express.js","Fastify","NestJS","Django","Flask","FastAPI","Spring Boot","Laravel","Rails","Phoenix","Actix","Axum","Fiber","Echo","Gin","Hono","Elysia",
  "PostgreSQL","MySQL","SQLite","MongoDB","Redis","DynamoDB","Cassandra","CockroachDB","PlanetScale","Supabase","Firebase","FaunaDB","EdgeDB","TiDB","ClickHouse","Turso",
  "Prisma","Drizzle","TypeORM","Sequelize","Mongoose","SQLAlchemy","Active Record","GORM","Hibernate",
  "AWS","GCP","Azure","Vercel","Netlify","Railway","Render","Fly.io","Heroku","DigitalOcean","Cloudflare","Hetzner",
  "Docker","Kubernetes","Terraform","Ansible","GitHub Actions","GitLab CI","CircleCI","Jenkins","ArgoCD",
  "NextAuth","Better Auth","Clerk","Auth0","Supabase Auth","Firebase Auth","Lucia","Passport.js","Keycloak",
  "Stripe","Paddle","LemonSqueezy","PayPal","SSLCommerz","bKash API","Nagad API",
  "OpenAI API","Anthropic API","Gemini API","Hugging Face","LangChain","LlamaIndex","Ollama","TensorFlow","PyTorch","scikit-learn","Keras","spaCy","NLTK",
  "Jest","Vitest","Playwright","Cypress","Testing Library","Pytest","RSpec","PHPUnit",
  "React Native","Flutter","Expo","Swift UI","Jetpack Compose","Ionic","Capacitor","Tauri",
  "GraphQL","tRPC","REST","gRPC","WebSockets","Socket.io","Kafka","RabbitMQ","Celery","BullMQ","Elasticsearch","Algolia","Cloudinary","S3","Resend","SendGrid","Twilio","Pusher","Sentry","Datadog","PostHog",
];


export const PRODUCT_TYPES = [
  { value: "free", label: "Free" },
  { value: "subscription", label: "Subscription Based" },
  { value: "one_time", label: "One Time Purchase" },
];
//################################################################


// these are for any other page
export const PRODUCT_TYPE_LABELS = {
  free: "Free", subscription: "Subscription Based", one_time: "One Time Purchase",
};


export const CATEGORY_LABELS = {
  ai: "AI", productivity: "Productivity", marketing: "Marketing", finance: "Finance",
  hr: "HR & Recruitment", ecommerce: "E-Commerce", education: "Education",
  healthcare: "Healthcare", "developer-tools": "Developer Tools", analytics: "Analytics",
  communication: "Communication", design: "Design", security: "Security", other: "Other",
};


export const TECH_ICONS = {
  "JavaScript": "javascript","TypeScript": "typescript","Python": "python","Rust": "rust",
  "Go": "go","Java": "java","Kotlin": "kotlin","Swift": "swift","C": "c","C++": "cplusplus",
  "C#": "csharp","PHP": "php","Ruby": "ruby","Scala": "scala","Elixir": "elixir",
  "Haskell": "haskell","Dart": "dart","R": "r","Bash": "bash","Lua": "lua","Perl": "perl",
  "React": "react","Next.js": "nextjs","Vue.js": "vuejs","Nuxt.js": "nuxtjs",
  "Angular": "angularjs","Svelte": "svelte","Astro": "astro","Ember.js": "ember",
  "Tailwind CSS": "tailwindcss","Sass": "sass","Less": "less","Bootstrap": "bootstrap",
  "Node.js": "nodejs","Express.js": "express","Django": "django","Flask": "flask",
  "FastAPI": "fastapi","Spring Boot": "spring","Laravel": "laravel","Rails": "rails","NestJS": "nestjs",
  "PostgreSQL": "postgresql","MySQL": "mysql","SQLite": "sqlite","MongoDB": "mongodb",
  "Redis": "redis","DynamoDB": "dynamodb","Cassandra": "cassandra","Firebase": "firebase","Supabase": "supabase",
  "AWS": "amazonwebservices","GCP": "googlecloud","Azure": "azure","Vercel": "vercel",
  "Netlify": "netlify","Heroku": "heroku","DigitalOcean": "digitalocean","Cloudflare": "cloudflare",
  "Docker": "docker","Kubernetes": "kubernetes","Terraform": "terraform","Ansible": "ansible","Jenkins": "jenkins",
  "Auth0": "auth0","Stripe": "stripe","TensorFlow": "tensorflow","PyTorch": "pytorch","Keras": "keras",
  "Jest": "jest","Cypress": "cypressio","React Native": "react","Flutter": "flutter","Ionic": "ionic",
  "GraphQL": "graphql","Elasticsearch": "elasticsearch","Nginx": "nginx","Linux": "linux",
  "Git": "git","GitHub": "github","GitLab": "gitlab","Figma": "figma","Webpack": "webpack","Vite": "vitejs",
};

export function TechIcon({ name, size = 14 }) {
  const slug = TECH_ICONS[name];
  if (!slug) return null;
  return (
    <img
      src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${slug}/${slug}-original.svg`}
      alt={name}
      width={size}
      height={size}
      style={{ width: size, height: size, flexShrink: 0 }}
      onError={(e) => { e.currentTarget.style.display = "none"; }}
    />
  );
}