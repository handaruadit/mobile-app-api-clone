### How to load environment variables
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
4. Fetch the Environment via Token

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

