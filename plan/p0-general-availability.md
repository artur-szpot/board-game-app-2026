As the app's developer, I want to make it publicly accessible (still in beta though).

What needs to happen before:

- prepare a more realistic initial set of games, tags and locations to replace the current test set
- wire a path in the backend that resets the database to just the above test set of data (to be removed once beta period is over)
- allow Google-based authentication for account creation
- if created via email, require account activation before access is granted
- deploy with production-safe configuration, HTTPS, a real domain, and non-development secrets
- add an about page stating how fragile the beta state is
