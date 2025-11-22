# Contributing to AI Financial Guardian System

Thank you for considering contributing to the AI Financial Guardian System! We welcome contributions from the community.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/AI-Financial-Guardian-System.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit your changes: `git commit -m 'Add some feature'`
7. Push to the branch: `git push origin feature/your-feature-name`
8. Open a Pull Request

## Development Setup

Please refer to the [README.md](README.md) for detailed installation and setup instructions.

## Code Style

### Frontend (TypeScript/React)
- Use TypeScript for all new files
- Follow React best practices and hooks patterns
- Use functional components over class components
- Follow the existing code style (ESLint configuration)
- Add proper TypeScript types (avoid `any`)

### Backend (Python)
- Follow PEP 8 style guide
- Use type hints for function parameters and return values
- Write docstrings for all functions and classes
- Keep functions small and focused

## Testing

- Write tests for new features
- Ensure all tests pass before submitting PR: `npm test`
- Aim for high test coverage on critical business logic

## Pull Request Guidelines

1. **Title**: Use a clear and descriptive title
2. **Description**: Explain what changes you made and why
3. **Testing**: Describe how you tested your changes
4. **Screenshots**: Include screenshots for UI changes
5. **Documentation**: Update documentation if needed

### PR Title Format
- `feat: Add new feature`
- `fix: Fix bug in component`
- `docs: Update documentation`
- `style: Format code`
- `refactor: Refactor component`
- `test: Add tests`
- `chore: Update dependencies`

## Commit Message Guidelines

Follow the conventional commits specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Example:**
```
feat(dashboard): Add financial metrics chart

- Added Recharts integration
- Created MetricsChart component
- Added responsive design for mobile

Closes #123
```

## Code Review Process

1. All PRs require at least one review
2. Address all review comments
3. Keep PRs focused and manageable in size
4. Be respectful and constructive in reviews

## Reporting Bugs

Use GitHub Issues to report bugs. Include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Detailed steps to reproduce the issue
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Screenshots**: If applicable
6. **Environment**: Browser, OS, Node version, etc.

## Feature Requests

We welcome feature requests! Please:

1. Check if the feature already exists or is planned
2. Open an issue with a clear description
3. Explain the use case and benefits
4. Be open to discussion and feedback

## Security Issues

**Do NOT** open public issues for security vulnerabilities. Instead:

1. Email security concerns to the maintainers
2. Provide detailed information about the vulnerability
3. Wait for a response before public disclosure

## Questions?

If you have questions, feel free to:

1. Open a discussion in GitHub Discussions
2. Ask in the issue comments
3. Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for contributing! 🎉
