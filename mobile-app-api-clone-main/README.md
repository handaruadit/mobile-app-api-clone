## How To Run Locally

This guide walks you through setting up the project from scratch on a fresh machine.

### Prerequisites

#### 1. Install Node.js

We recommend using [nvm](https://github.com/nvm-sh/nvm) to manage Node versions.

**macOS / Linux:**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```
Restart your terminal, then install and use the required Node version:
```bash
nvm install 18
nvm use 18
```

**Windows:** Download and install Node.js 18 LTS directly from https://nodejs.org/

Verify the installation:
```bash
node -v   # should print v18.x.x
npm -v
```

#### 2. Install pnpm

This project uses `pnpm` as the package manager.
```bash
npm install -g pnpm
```

#### 3. Install MongoDB

The API requires a running MongoDB instance.

- **Option A (local):** Install MongoDB Community Edition from https://www.mongodb.com/try/download/community and start the service. The default connection URL is `mongodb://localhost:27017`.
- **Option B (Docker):**
  ```bash
  docker run -d -p 27017:27017 --name mongo mongo:6
  ```
- **Option C (cloud):** Create a free cluster at https://cloud.mongodb.com and use the connection string it provides.

#### 4. Install Redis (optional for basic usage)

Redis is used for caching. Skip this if you are not working on cache-related features.

**macOS:**
```bash
brew install redis
brew services start redis
```

**Docker:**
```bash
docker run -d -p 6379:6379 --name redis redis:7
```

---

### Running the Project

#### 1. Clone the repository
```bash
git clone <repository-url>
cd batari-core-api
```

#### 2. Install dependencies
```bash
pnpm install
```

#### 3. Set up environment variables

Copy the example env file and fill in the required values:
```bash
cp .env.example .env
```

Open `.env` and update at minimum:
- `MONGO_URI` — your MongoDB connection string (default `mongodb://localhost:27017/batari` works for a local install)
- `JWT_SECRET` and `JWT_REFRESH_SECRET` — any random string works locally (e.g. `mysecret`)
- Leave `REDIS_URL`, `RABBITMQ_URI`, `HIVEMQ_*`, and Firebase values empty or as-is unless you need those features

#### 4. Start the development server
```bash
pnpm dev
```

The API will be available at `http://localhost:8000` by default (controlled by `PORT` in `.env`).

---

### How to load environment variables for testing

1. Get to Know Infisical
   - We use infisical as a way to share environment secrets to avoid printmark anywhere and as secure way as possible.
     Infisical can be installed using Scoop packagemanager
2. Install Scoop on Windows
   - As in https://github.com/ScoopInstaller/Scoop;
   - Run windows power shell, change the execution policy to enable remote fetching:
   - ```
       Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
     ```
   - Then fetch scoop from shell:
   - ```
       Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression
     ```
   - Scoop should be successfuly installed on your machine
3. Install Infisical on your Machine
   - As in https://infisical.com/docs/cli/overview;
   - Stage infisical origin to your Scoop bucket
   - ```
       scoop bucket add org https://github.com/Infisical/scoop-infisical.git
     ```
   - Hit it
   - ```
       scoop install infisical
     ```
4. Update Ubuntu 18 to 22
   https://www.benjaminrancourt.ca/how-to-update-ubuntu-in-wsl-from-18-04-to-22-04/
5. Fetch the Environment via Token

### Commit Message Format

A commit message consists of a **type**, **scope** and **subject**:

```
<type>(<scope>): <subject>
```

The **header** is mandatory and the **scope** of the header is optional.

### Type

Must be one of the following:

- **build**: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
- **ci**: Changes to our CI configuration files and scripts (examples: CircleCi, SauceLabs)
- **docs**: Documentation only changes
- **feat**: A new feature
- **fix**: A bug fix
- **perf**: A code change that improves performance
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **test**: Adding missing tests or correcting existing tests

### Scope

The scope could be anything specifying place of the commit change. For example `shows, videos, core`

### Subject

The subject contains succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize first letter
- no dot (.) at the end
