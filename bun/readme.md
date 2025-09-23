# Bun with VS Code

## What is Bun?

Bun is a fast, all-in-one JavaScript runtime and toolkit designed as a drop-in replacement for Node.js. It provides:

- **Fast startup and execution**: Written in Zig, Bun offers significantly faster performance than Node.js
- **Built-in bundler**: No need for separate bundlers like Webpack or Vite
- **Native TypeScript support**: Run TypeScript files directly without compilation
- **Package manager**: Faster alternative to npm with built-in package management
- **Test runner**: Built-in test runner for JavaScript/TypeScript
- **Web APIs**: Implements Web APIs like `fetch`, `WebSocket`, and more

## Installation

### Windows

#### Using PowerShell (Official Installer)
```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

#### Using Chocolatey
```powershell
choco install bun
```

### Other platforms
```bash
curl -fsSL https://bun.sh/install | bash
```

Verify installation:
```bash
bun --version
```

## VS Code Integration

### Debugging with Bun

This folder contains VS Code configuration files for debugging Bun applications.

#### Launch Configurations (`launch.json`)

The `launch.json` file provides debug configurations for Bun applications:

- **Bun: HTTP Server**: Launches an HTTP server with debugging enabled on port 9229
  - Uses `${workspaceFolder}/src/http-server.ts` as the entry point
  - Runs in watch mode for automatic restarts on file changes
  - Includes a post-debug task to clean up processes

- **Bun: WS Server**: Launches a WebSocket server with debugging enabled on port 9230
  - Uses `${workspaceFolder}/src/ws-server.ts` as the entry point
  - Similar watch mode and cleanup configuration

- **🚀 Bun: Run All**: Compound configuration that launches both servers simultaneously

#### Tasks (`tasks.json`)

The `tasks.json` file contains custom tasks:

- **kill-bun-processes**: Terminates all running Bun processes
  - Used as a post-debug task to ensure clean shutdown
  - Uses `taskkill /IM bun.exe /F /T` on Windows

### Known Issues and Solutions

#### Bun processes not properly terminated after debug stop

**Problem**: When stopping a debug session, Bun processes may continue running in the background.

**Solution**: The launch configurations include a `postDebugTask` that automatically runs the `kill-bun-processes` task to terminate any remaining Bun processes.

You can also manually run this task from VS Code's Command Palette (Ctrl+Shift+P) → "Tasks: Run Task" → "kill-bun-processes".

## Usage Examples

### Running a Bun script
```bash
bun run script.ts
```

### Starting a development server
```bash
bun dev
```

### Installing packages
```bash
bun add package-name
```

### Running tests
```bash
bun test
```

## Resources

- [Official Bun Documentation](https://bun.sh/docs)
- [Bun GitHub Repository](https://github.com/oven-sh/bun)
- [VS Code Debugging Guide](https://code.visualstudio.com/docs/editor/debugging)