platform-studio

A low-code service scaffolding studio with built-in platform capabilities
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YiTian-Cloud/platform-studio&env=NEXT_PUBLIC_PLATFORM_DOCS_URL)


Live Demo: https://platform-studio.vercel.app/
 (update after deployment)

Overview

platform-studio is a low-code scaffolding and platform-service generator that enables developers to create new backend services—with production-ready patterns—in seconds.

The studio provides:

A wizard-based UI to select plugins (auth, metrics, events, observability, etc.)

Instant preview of the generated file tree

Built-in support for Swagger/OpenAPI docs

Local-friendly config for both metrics and Swagger rendering

Strong foundations for agentic AI services, platform engineering, and service modernization

This project demonstrates a developer experience–first approach to building internal platforms and golden paths.

Key Features
⭐ Low-Code Service Creation

Wizard to configure service metadata and platform plugins

Auto-generated folder structure

Ready-to-use controllers, routes, tests, CI templates, and Docker assets

🔌 Platform Plugins

Toggle any combination of plugins, including:

authJwtPlugin – Secure-by-default JWT authentication

metricPlugin – Metrics endpoint + middleware

estsPlugin – End-to-end test scaffolding

debugToolkitPlugin – Debug utilities for development

obsDashboardPlugin – Observability boilerplate

containerizationPlugin – Dockerfile + compose setup

eventBusPlugin – Event emitter/subscriber foundation

serviceClientsPlugin – Typed downstream service client library

📘 Built-in Swagger Viewer

Landing page includes a "View Swagger Doc" button

Supports both local and production (Vercel) environments

Fully OpenAPI-compliant

🧪 CI/CD Ready

Generated services include:

ESLint configuration

Jest unit and API test scaffolding

GitHub Actions workflow (build + test)

Dockerfile validation

Architecture Principles

API-first, contract-first development

Event-driven extensibility

Secure-by-default routing and middleware

Unified platform services via plugins

Local-first development environment

Getting Started
1. Install dependencies
npm install

2. Start local development
npm run dev


Visit the studio at:

http://localhost:3000

3. Create a new service

Open the wizard

Select plugins

Preview the generated project structure

Download the scaffold

Deploy to Vercel

Click below to deploy your own instance:

You will be prompted to enter:

NEXT_PUBLIC_PLATFORM_DOCS_URL=https://your-docs-url.com


(You can leave it empty if not using external docs.)

Project Structure
app/
  page.tsx               # Main wizard
  swagger/               # Swagger UI viewer
src/
  scaffold/              # Service generator logic
  plugins/               # Toggleable platform plugins
  components/            # Shared UI components
public/
  logo.svg
README.md

Roadmap

AI-powered service spec generator

Plugin marketplace

Multi-template service generation (HTTP, events, workers, agents)

Infrastructure modules for AWS/GCP deployments

License

MIT License.