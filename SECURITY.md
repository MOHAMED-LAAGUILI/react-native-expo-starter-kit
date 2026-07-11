# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 2.1.x   | :white_check_mark: |
| < 2.1   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly.

**Do NOT open a public issue.**

Instead, please email the maintainer directly at [INSERT EMAIL] with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You should receive a response within 48 hours.

## Security Best Practices

When using this starter kit:

- Never commit API keys, secrets, or tokens to version control
- Use environment variables for sensitive configuration
- Enable code signing for production builds
- Keep dependencies updated (`bun run deps:fix`)
- Run `bun run doctor` to check for known vulnerabilities
