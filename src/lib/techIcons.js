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