# GitHub Rules for Coding

## Branches

- **Main Branch**: The `main` branch is the default branch where the source code of `HEAD` always reflects a production-ready state.
- **Feature Branches**: Use feature branches for developing new features. These branches are created from the `main` branch.
- **Bugfix Branches**: Use bugfix branches for fixing bugs. These branches are also created from the `main` branch.
- **Refactor Branches**: Use refactor branches for refactoring code. These branches are created from the `main` branch.
- **Release Branches**: Use release branches for preparing a new release. These branches are created from the `main` branch.

## Pull Requests

- **Creating a Pull Request**: When your feature or bugfix is complete, create a pull request to merge your changes into the `main` branch.
- **Closing Issues**: Reference any related issues in your pull request description to automatically close them when the pull request is merged.
- **Review Process**: All pull requests should be reviewed by at least one other team member before being merged.
- **Merging**: Merge pull requests after they have been approved by the required reviewers and all checks have passed.


## Branch Naming Conventions

- **Feature Branches**: Use the format `feature/description`, e.g., `feature/add-login`.
- **Bugfix Branches**: Use the format `bugfix/description`, e.g., `bugfix/fix-login-error`.
- **Refactor Branches**: Use the format `refactor/description`, e.g., `refactor/update-logging`.
- **Release Branches**: Use the format `release/version`, e.g., `release/1.0.0`.

Following these guidelines will help maintain a clean and organized repository, making collaboration easier and more efficient.
