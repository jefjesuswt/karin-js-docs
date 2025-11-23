# Karin.js Documentation

This repository contains the source code for the official Karin.js documentation website. The site is built using [VitePress](https://vitepress.dev/).

## Development Setup

### Prerequisites

- [Bun](https://bun.sh/) must be installed on your system.

### Running Locally

1.  **Install Dependencies:**
    Clone the repository and install the necessary dependencies using Bun.

    ```bash
    git clone <repository-url>
    cd karin-js-docs
    bun install
    ```

2.  **Start the Development Server:**
    Run the following command to start the local VitePress development server.

    ```bash
    bun run docs:dev
    ```

    The site will be available at `http://localhost:5173`.

## Available Scripts

- `bun run docs:dev`: Starts the local development server.
- `bun run docs:build`: Creates a production-ready build of the documentation site.
- `bun run docs:preview`: Previews the production build locally.

## Contributing

Contributions to the documentation are welcome! Please feel free to open an issue or submit a pull request if you find any errors or have suggestions for improvement.
