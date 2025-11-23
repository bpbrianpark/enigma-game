# 100 Man Roster

A fast-paced trivia game where players race against the clock to name as many items as possible from various categories. Test your knowledge across topics like anime, sports, movies, video games, and more!

**100 Man Roster** is a web-based trivia game that challenges players to name items from specific categories within a time limit. The game features:

- **Multiple Game Modes**: Normal mode (name as many as possible) and Blitz mode (race against time)
- **Daily Challenges**: A new category every day for all players
- **Leaderboards**: Compete with other players and track your rankings
- **Dynamic Categories**: Categories that can search Wikidata in real-time for answers

## 🏗️ Architecture Overview

This is a full-stack web application built with modern technologies:

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **Prisma ORM** - Database access and migrations
- **PostgreSQL** - Relational database (via Supabase)

### Authentication & Security
- **Supabase Auth** - User authentication and session management
- **Row Level Security (RLS)** - PostgreSQL policies that restrict data access
- **Admin Prisma Client** - Separate database client for admin operations (bypasses RLS)

### Data Sources
- **Wikidata Query Service (WDQS)** - SPARQL queries to fetch category entries

## 📊 Database Schema

The application uses PostgreSQL with the following main models:

### User
- Stores user accounts (email, username, password hash)
- Linked to Supabase Auth via UUID

### Category
- Quiz categories (name, slug, SPARQL queries)
- Can be dynamic (searches Wikidata in real-time) or static
- Can be daily challenges or regular categories
- Has tags for organization

### Entry
- Individual items that can be guessed in a category
- Includes normalized labels for fuzzy matching
- Has aliases for alternative names

### Game
- Records of completed games
- Tracks time, score, difficulty, and game mode
- Links to user and category

### Difficulty
- Defines difficulty levels for each category
- Sets target counts (e.g., Easy: 10, Medium: 50, Hard: 100)
- Can have time limits for Blitz mode

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Supabase recommended)
- Supabase account for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd enigma-game
   ```

2. **Install dependencies**
   ```bash
   cd core
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `core` directory:
   ```env
   # Database
   DATABASE_URL="postgresql://..."
   ADMIN_DATABASE_URL="postgresql://admin_user:password@..."
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   
   # NextAuth (if needed)
   NEXTAUTH_SECRET="your-secret"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
npx prisma generate
   
   # Run migrations
npx prisma migrate dev --name init
   
   # Seed the database
npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Scripts & Tools

### Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Database Scripts

#### Create New Category

Create a new dynamic (non-daily) category from a JSON configuration file.

**Step 1: Create or edit the configuration file**

The script always uses `scripts/category-config.json`. Create or edit this file:
```json
{
  "name": "Anime: Shonen",
  "wdtValues": ["P31", "P136"],
  "wdValues": ["Q1107", "Q744038"],
  "tags": ["anime"]
}
```

**Configuration fields:**
- `name`: Display name (slug auto-generated)
- `wdtValues`: Wikidata property IDs (e.g., `["P31", "P21"]`)
- `wdValues`: Wikidata entity IDs (e.g., `["Q5", "Q6581072"]`)
- `tags`: Tag strings for grouping (e.g., `["anime", "tv"]`)

**Note:** `wdtValues` and `wdValues` must have matching lengths.

**Step 2: Run the script**

```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/create-category.ts
```

The script automatically reads from `scripts/category-config.json`.

The script will:
- Validate the configuration
- Generate SPARQL queries (initial and updateSparql)
- Auto-generate a slug from the category name
- Create the category with default difficulties (Level 1: 10, Level 2: 50, Level 3: 100)
- Assign tags for grouping

#### Create Daily Categories

Generate daily challenge categories:

```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/create-daily-categories.ts
```

### Game Modes

**Normal Mode (Rush)**
- Name as many items as possible
- No time limit (or very long limit)
- Goal: Reach the target count

**Blitz Mode**
- Race against a timer
- Fast-paced gameplay
- Score based on correct answers within time limit

**Daily Challenge**
- Same category for all players each day
- Rotates automatically
- Special leaderboard for daily games

### Category Organization

Categories are organized by tags:
- **People**: Real-life men, women, celebrities
- **Anime**: Anime characters, series, genres
- **Sports**: NBA players, NFL teams, etc.
- **Movies**: Films, directors, genres
- **Video Games**: Games by console, genre
- **TV**: Television series
- **Biology**: Diseases, animals, etc.
- **World**: Countries, cities, landmarks

## 🧪 Technologies Used

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **PostgreSQL** - Database
- **Supabase** - Authentication & database hosting
- **Wikidata Query Service** - Data source
- **SPARQL** - Query language for Wikidata
- **React Hooks** - State management
- **SWR** - Data fetching
- **Zod** - Schema validation
- **bcrypt** - Password hashing

## 📝 Development Notes

### Database Migrations

When modifying the Prisma schema:
```bash
npx prisma migrate dev --name description-of-change
```

### Admin Operations

Scripts that modify categories, entries, or other protected data must use `prismaAdmin` from `lib/prisma-admin.ts` to bypass Row Level Security.

### Adding New Categories

1. Use the `create-category.ts` script with a JSON config
2. Or manually add via Prisma/API (requires admin access)
3. Update categories with `updateCategories.ts` to fetch entries

## 📄 License

See LICENSE file for details.

---
