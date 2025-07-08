# Security Policy

## Supported Versions

We currently support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within OntoSeed, please send an email to:

**security@ontoseed.org**

### What to Include

Please include the following information in your report:

- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Any suggested fixes or mitigations

### Response Timeline

- **Initial Response**: We aim to respond within 48 hours
- **Status Updates**: We will provide regular updates on the progress
- **Resolution**: We will work to address critical vulnerabilities within 7 days

### Disclosure Policy

- We practice coordinated disclosure
- We will work with you to understand and resolve the issue
- We will credit you in our security advisory (if desired)
- Please allow us reasonable time to address the issue before public disclosure

## Security Considerations

### Zero-Knowledge Proofs

OntoSeed uses Circom circuits for zero-knowledge proofs. If you identify vulnerabilities in:

- Circuit implementations
- Proof generation/verification
- Trusted setup parameters

Please report these with high priority.

### Ontology Validation

Security issues related to:

- SHACL validation bypass
- RDF parsing vulnerabilities
- Ontology injection attacks

Are also considered high priority.

Thank you for helping keep OntoSeed secure!