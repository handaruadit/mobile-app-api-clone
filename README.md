### How to load environment variables

We use infisical to manage environment variables. To load environment variables, run the following command:

1. Install infisical

```bash
brew install infisical/get-cli/infisical
```

2. Login

```bash
infisical login
```

- Self Hosting
- Domain: https://vault.afnane.top

3. start the server

```bash
infisical run -- npm run dev
```

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
