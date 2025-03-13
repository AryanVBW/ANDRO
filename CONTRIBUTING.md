# Contributing to ANDRO

Thank you for your interest in contributing to ANDRO! This document provides guidelines and instructions for contributing to this project.

## 📌 Table of Contents
- [Project Structure](#project-structure)
- [Branch Structure](#branch-structure)
- [Development Setup](#development-setup)
- [Contribution Workflow](#contribution-workflow)
- [Code Style Guidelines](#code-style-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)
- [Contact](#contact)

## 🏗️ Project Structure

ANDRO consists of the following main components:

- **Web Panel**: The administrative interface built with Express.js and EJS
- **Android Client**: The code that runs on target Android devices
- **Server**: The backend that manages connections and data

Key directories:
- `/assets`: Contains all web UI components (views, stylesheets, scripts)
- `/includes`: Server-side logic and utilities
- `/app`: Android client application files and build tools
- `/clientData`: Client database files (JSON)

## 🌿 Branch Structure

The project uses the following branch structure:

- `main`: The stable production branch. All final, tested changes go here.
- `WebPanel`: Development branch for the web interface. **This is the primary branch for UI contributions.**
- `website`: Branch specifically for the project's marketing website. Work on landing pages goes here.
- `dev`: General development branch for server-side and backend features.

**Important**: Changes merged to `WebPanel` are automatically merged to `main` after review and testing. Do not create pull requests directly to `main`.

## 💻 Development Setup

1. **Prerequisites**:
   - Node.js (v14 or newer)
   - npm (v6 or newer)
   - Java JDK (for APK building)

2. **Installation**:
   ```bash
   # Clone the repository
   git clone https://github.com/AryanVBW/ANDRO.git
   cd ANDRO
   
   # Install dependencies
   npm install
   
   # For development with auto-reload
   npm install --save-dev nodemon debug
   ```

3. **Run the development server**:
   ```bash
   DEBUG=andro:* npm run dev
   ```

4. **Environment setup**:
   Make sure you have the correct settings in `includes/const.js` for your environment.

## 🛠️ Contribution Workflow

### For Web Panel Contributions:

1. **Always branch from `WebPanel`**:
   ```bash
   git checkout WebPanel
   git pull origin WebPanel
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:
   - Focus on modifying files in `/assets/views` for UI components
   - Use the existing CSS classes and variables in `/assets/webpublic/css/custom.css`
   - Keep JavaScript modular in `/assets/webpublic/js/main.js`

3. **Test thoroughly** before submitting a pull request.

4. **Create a pull request to the `WebPanel` branch** (not to `main`).

### For Website Contributions:

1. **Always branch from `website`**:
   ```bash
   git checkout website
   git pull origin website
   git checkout -b website/feature-name
   ```

2. **Create a pull request to the `website` branch** when your changes are complete.

## 🎨 Code Style Guidelines

### JavaScript:
- Use ES6+ features when appropriate
- Maintain consistent indentation (2 spaces)
- Use camelCase for variables and functions
- Use PascalCase for classes

### CSS:
- Follow the existing variable system for theming
- Group related styles together
- Use comments to separate sections

### EJS Templates:
- Use correct indentation for nested elements
- Keep logic minimal in templates
- Use partials for reusable components
- Use the `<%- include('partials/component.ejs') %>` syntax for includes

## 📝 Pull Request Process

1. **Create a descriptive pull request title** that summarizes your changes.
2. **Fill out the PR template** with details about your changes.
3. **Link any related issues** using keywords (e.g., "Fixes #123").
4. **Wait for code review** from maintainers.
5. **Make requested changes** if any are suggested during review.
6. **Once approved**, your PR will be merged into the appropriate branch.

## 🧪 Testing

Before submitting your PR, ensure:

1. The application runs without errors
2. Your feature works as expected
3. You haven't broken existing features
4. The UI is responsive on mobile devices

## 📚 Documentation

- Add comments to complex code sections
- Update README or relevant documentation if your changes require it
- Document any new features or API changes

## 📱 Website Branch Specifics

The `website` branch contains the landing page and marketing materials:

- Changes to this branch don't affect the core application
- Focus on responsive design and clear communication
- Use the same styling variables when possible for consistency

## 📞 Contact

If you have questions about contributing, join our community channels:

- GitHub Issues: For bug reports and feature requests
- Discord: [Join our server](https://discord.gg/your-invite-link)

---

Thank you for contributing to ANDRO! Your efforts help make this project better for everyone.
