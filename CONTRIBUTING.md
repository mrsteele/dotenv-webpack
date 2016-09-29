# Contribute

Pull requests are accepted.

### Acceptance Criteria

Pull requests will be **considered** if they pass the following criteria:

1. Code passes all unit tests.
1. Code coverage is still above 95% accross the board.
1. Commit matches suggested format (see **Commit Format** below).

If all of the above is passed, your request will be considered. Please allow
for a few days for follow-up to your request. Any issues with your request
will be posted directly to the request itself.

### Commit Format

Commits should match the suggested workflow and format.

1. Change code.
1. Type `git commit -a -m "<type>(<scope>): <subject>"`
    1. The [standardjs](http://standardjs.com/) linter will run.
    1. We also use default parameters from [validate-commit-msg](https://github.com/kentcdodds/validate-commit-msg) for validation.
1. Type `git push`
    1. Tests will run before the commit is pushed to validate everything still runs as expected.
    1. When ready, open a [pull-request](https://github.com/mrsteele/dotenv-webpack/compare?expand=1).
