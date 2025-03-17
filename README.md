# Learning Journey

It is an AI-powered web app where you can create course of any topic 

https://github.com/user-attachments/assets/dbc03411-a6dc-4c70-8b7f-632dfde63dbe

## How to run locally ?

**1.Clone the repo**

```bash 
git clone https://github.com/Virajb19/Learning-Journey
cd Learning-Journey
```

**2. Install pnpm and then dependencies**

```bash 
npm i -g pnpm
```
```bash
pnpm install
```

**3. Run the server**

```bash
pnpm dev
```

**4. Create .env and add environment variables**

Refer .env.example

**5. Start Database**

Pull postgres image

```bash
docker pull postgres
```
Run docker container

```bash
docker run --name postgres-ctr -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres

```
Run this command

```bash
pnpm dlx prisma migrate deploy
```

Run this command to open prisma studio

```bash
pnpm dlx prisma studio
```
Open [http://localhost:5555]

**6. Authentication**

Run this to generate a key

```bash
openssl rand -base64 32
```

Add the key to AUTH_SECRET env var

Go to [https://github.com/settings/apps] and create an OAuth app

GITHUB_CLIENT_ID=""  
GITHUB_CLIENT_SECRET=""  

(Optional. You can just login using Github)

Go to [https://console.cloud.google.com/] and create an OAuth app

GOOGLE_CLIENT_ID="" GOOGLE_CLIENT_SECRET=""

**7. Gemini API**

Go to [https://aistudio.google.com/] and create an API key

GEMINI_API_KEY="your_gemini_api_key"

GOOGLE_GENERATIVE_AI_API_KEY="your_gemini_api_key"

**8. Youtube API**

Go to [https://console.cloud.google.com/], select a project and enable YouTube Data API v3
Go to credentials and create an API key

YOUTUBE_API_KEY="your_youtube_api_key"

**9. Unsplash API**

Go to [https://unsplash.com/developers] and create an API key

UNSPLASH_API_KEY="your_unsplash_api_key"

**11. Stripe**

Go to [https://dashboard.stripe.com/apikeys]

STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="your_stripe_publishable_key"

Install stripe CLI in your system

Run this command

```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

A secret will be generated. Add that secret to 

STRIPE_WEBHOOK_SECRET=""

