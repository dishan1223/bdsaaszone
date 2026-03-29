<div align="center">
  <img src="public/logo.svg" alt="BD SaaS Zone Logo" width="120" height="120">

  # BDSaaSZone 🇧🇩
  **The definitive directory for Made-in-Bangladesh software.**

  A collaborative hub for founders to showcase startups, buyers to acquire local products, and developers to find inspiration.

  [Report Issue](https://github.com)
</div>

---

## The Vision
**BDSaaSZone** is an open-source platform built to empower the Bangladeshi SaaS ecosystem.
- **Showcase:** Founders get a dedicated space showcase their SaaS startups.
- **Acquire:** A marketplace for products ready to be handed over to new owners.
- **Inspire:** A living database for developers to study market-ready ideas.


## Core Features
- **Listing Directory:** Easily add and categorize your SaaS products.
- **Exit Strategy:** Toggle a "For Sale" status on your startup to attract potential buyers.
- **Market Research Hub:** Study the current Bangladeshi SaaS landscape to identify market gaps and validated ideas before building your own startup.


## Tech Stack
- **Framework:** [Next.js](https://nextjs.org) (App Router)
- **Database:** [MongoDB](https://www.mongodb.com)
- **Authentication:** [Better Auth](https://www.better-auth.com)
- **Media Management:** [Cloudinary](https://cloudinary.com)
- **Styling:** Tailwind CSS & DaisyUI


## Installation & Setup

1. **Clone the Repo**
   ```bash
   git clone https://github.com/dishan1223/bdsaaszone
   cd bdsaaszone
   ```
2. **Install Dependencies**
   ```bash
   npm i
   ```
3. **Configure Environment Variables**<br>
   create a `.env.local` file in the root directory
   ```bash
    NEXT_PUBLIC_APP_URL=http://localhost:3000

    # google authentication
    GOOGLE_CLIENT_ID=oauth_client_id
    GOOGLE_CLIENT_SECRET=oauth_client_secret

    # mongodb database
    DB="development"
    MONGODB_URI=your_mongoDB_connection_string

    # better auth credentials
    # in your terminal, type : openssl rand -base64 32 (in linux terminal, Don't know if it works on windows)
    # this command will generate you a string that can be used as BETTER_AUTH_SECRET
    BETTER_AUTH_BASE_URL=http://localhost:3000
    BETTER_AUTH_SECRET=generate_a_secret_with_openssl


    # CLOUDINARY credentials
    CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
    CLOUDINARY_API_KEY=your_cloudinary_api_key
    CLOUDINARY_API_SECRET=your_cloudinary_api_secret
    ```
4. **Run development environment**
   ```bash
    npm run dev
    # switch to node js latest version with this command(if needed)
    nvm use --lts
   ```


## Contributing
Contributions are what make the open-source community so powerful!
1. **Fork** the Project.
2. Create your **Feature Branch** (`git checkout -b feature/AmazingFeature`).
3. **Commit** your Changes.
4. **Push** to the Branch.
5. Open a **Pull Request**.

## License
Distributed under the **GNU General Public License v3.0**. See `LICENSE` for details.

---
<div align="center">
Building with 💚 for the Bangladesh Tech Community.
</div>
