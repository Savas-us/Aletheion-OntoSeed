# Contributing to OntoSeed

Thank you for your interest in contributing to OntoSeed! This document provides guidelines for contributing to our scale-independent seed ontology project.

## Project Overview

OntoSeed is building a scale-independent "seed ontology" with four universal rules: identity, containment, cause, and reflection. Every new concept is auto-checked with SHACL validation.

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm
- Git

### Setup
1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/Aletheion-OntoSeed.git`
3. Install dependencies: `npm install`
4. Start development server: `npm run dev`

## How to Pick an Issue

### Issue Labels
- **feat**: New features and enhancements
- **bug**: Bug fixes and corrections
- **docs**: Documentation improvements
- **infra**: Infrastructure and CI/CD changes
- **refactor**: Code refactoring without feature changes
- **help-wanted**: Community contributions welcome
- **good-first-issue**: Perfect for new contributors

### Getting Started
1. Browse issues labeled `good-first-issue` for beginner-friendly tasks
2. Check `help-wanted` for community-driven features
3. Comment on an issue to express interest before starting work
4. Wait for maintainer assignment before beginning development

## Development Workflow

### Branching Strategy
- `main`: Production-ready code
- `release/*`: Release preparation branches
- `feat/*`: New features
- `fix/*`: Bug fixes
- `docs/*`: Documentation changes
- `chore/*`: Maintenance tasks

### Branch Naming
- `feat/add-identity-validation`
- `fix/shacl-validation-error`
- `docs/update-contributing-guide`
- `chore/update-dependencies`

### Commit Conventions
We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks

**Examples:**
```
feat(ontology): add reflection rule validation
fix(shacl): resolve containment shape error
docs(readme): update installation instructions
chore(deps): upgrade next.js to v15
```

## Ontology Development Guidelines

### Four Universal Rules
All contributions must respect these core principles:

1. **Identity**: Every entity must have a unique identifier and self-reference
2. **Containment**: Every entity can contain and be contained by other entities
3. **Cause**: Every entity can cause and be caused by other entities (with provenance)
4. **Reflection**: Every entity can reflect and be reflected by other entities

### File Structure
- `src/ontology/core.ttl`: Core ontology definitions
- `src/ontology/shapes.ttl`: SHACL validation shapes
- `src/lib/ontology.ts`: TypeScript ontology manager
- `src/lib/validator.ts`: Validation engine

### Validation Requirements
- All concepts must extend the core ontology
- SHACL shapes must validate successfully
- At minimum, concepts must follow the Identity rule
- CI pipeline validates ontology on every commit

## Pull Request Process

### Before Opening a PR
1. Ensure your branch is up-to-date with `main`
2. Run the validation suite:
   ```bash
   npm run lint
   npm run build
   ```
3. Test your changes thoroughly
4. Write clear commit messages

### PR Checklist
When opening a PR, ensure all items in the PR template are completed:

- [ ] Code follows project conventions
- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] SHACL validation passes
- [ ] Tests pass (if applicable)
- [ ] Documentation updated (if needed)
- [ ] Ontology impact assessed

### Review Process
1. Automated checks must pass
2. Code review by maintainers
3. Ontology validation review
4. Manual testing (if applicable)
5. Approval and merge

## Sprint Alignment

### Current Roadmap
- **Sprint 1**: Ontology seed + CI (current)
- **Sprint 2**: API wrapper + playground UI
- **Sprint 3**: Mini SemCom encoder/decoder PoC
- **Sprint 4**: ZKP-backed provenance ledger

### Issue Milestones
- **v0.1.1**: Bug fixes and minor improvements
- **v0.2**: API and playground features
- **v1.0**: Full ontology with ZKP provenance

## Code Style

### TypeScript
- Use TypeScript for all new code
- Follow ESLint configuration
- Prefer explicit types over `any`
- Use meaningful variable names

### File Organization
- Use the `@/*` import alias for `src/*`
- Group imports: external, internal, relative
- Export interfaces and types explicitly

### Component Structure
```typescript
// External imports
import { useState } from 'react'

// Internal imports
import { OntologyManager } from '@/lib/ontology'

// Component definition
export function MyComponent() {
  // Component logic
}
```

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- MyComponent.test.ts
```

### Test Guidelines
- Write tests for new features
- Maintain or improve code coverage
- Test ontology validation rules
- Include edge cases

## Documentation

### Code Documentation
- Add JSDoc comments for public APIs
- Document complex ontology logic
- Include examples for validation shapes

### README Updates
- Update installation instructions for new dependencies
- Add new features to feature list
- Update examples for API changes

## Community

### Communication
- Use GitHub Issues for bug reports and feature requests
- Join discussions in GitHub Discussions
- Be respectful and constructive in all interactions

### Code of Conduct
- Be welcoming to newcomers
- Focus on what's best for the community
- Show empathy towards other contributors
- Respect different viewpoints and experiences

## Questions?

If you have questions about contributing:
1. Check existing issues and discussions
2. Open a new issue with the `help-wanted` label
3. Review this contributing guide
4. Look at recent merged PRs for examples

Thank you for contributing to OntoSeed! 🌱