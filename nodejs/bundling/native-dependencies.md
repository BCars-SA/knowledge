# Bundling Backends with Native Dependencies

## The Problem

When bundling Node.js backend applications using tools like `bun build`, `esbuild`, or `webpack`, you may encounter runtime errors with certain npm packages, even though they work perfectly in development. This is typically caused by native C++ addons that cannot be properly bundled.

## A General Rule for Bundling Backends

**Any npm package that relies on native C++ addons should almost always be marked as external.**

This means these packages should be excluded from the bundle and installed separately in the deployment environment.

## Common Libraries That Need to Be External

Here are some frequently used backend libraries that typically require the `--external` flag:

### Communication & APIs
- `grpc-js` - gRPC implementation
- `@google-cloud/speech` - Google Cloud Speech-to-Text
- `@google-cloud/*` - Most Google Cloud SDK packages

### Database Drivers
- `pg` - PostgreSQL driver
- `mysql2` - MySQL driver  
- `sqlite3` - SQLite driver
- `mongodb` - MongoDB driver
- `redis` - Redis client

### Image Processing
- `sharp` - High-performance image processing
- `canvas` - HTML5 Canvas API implementation

### Cryptography & Security
- `bcrypt` - Password hashing
- `argon2` - Modern password hashing
- `node-forge` - Cryptographic utilities (some versions)

### File System & OS
- `fsevents` - macOS file system events
- `chokidar` - File watcher (depends on native modules)

## Example: Fixing Build Issues

### Problem Scenario
You're building a backend service that uses Google Cloud Speech-to-Text:

```bash
bun build src/index.ts --outdir=dist --target=node
```

At runtime, you get an error like:
```
Error: Cannot find module '@google-cloud/speech'
```

### Solution
Add the problematic package to the external list:

```bash
bun build src/index.ts --outdir=dist --target=node --external @google-cloud/speech
```

### Multiple External Dependencies
For projects with multiple native dependencies:

```bash
bun build src/index.ts --outdir=dist --target=node \
  --external @google-cloud/speech \
  --external pg \
  --external sharp \
  --external bcrypt
```

## How to Identify Native Dependencies

1. **Runtime Errors**: If your bundled app fails with "Cannot find module" errors for packages that are installed, they likely need to be external.

2. **Build Warnings**: Look for warnings about native modules during the build process.

3. **Package Investigation**: Check if a package has:
   - `.node` files in `node_modules`
   - `binding.gyp` files
   - References to "native" in documentation
   - Dependencies on `node-gyp`

4. **File Extensions**: Native modules often have files with extensions like `.node`, `.so`, `.dll`, or `.dylib`.

## Best Practices

### 1. Production Configuration
Create a build script that explicitly lists all external dependencies:

```json
{
  "scripts": {
    "build": "bun build src/index.ts --outdir=dist --target=node --external pg --external @google-cloud/speech --external sharp"
  }
}
```

### 2. Dockerfile Considerations
When using Docker, ensure external packages are installed in the final image:

```dockerfile
# Install dependencies (including native modules)
COPY package.json bun.lockb ./
RUN bun install --production

# Copy built application
COPY dist/ ./dist/
```

### 3. Configuration Files
Some bundlers support configuration files to manage externals:

```javascript
// bun.config.js
export default {
  entrypoints: ['src/index.ts'],
  outdir: 'dist',
  target: 'node',
  external: [
    'pg',
    '@google-cloud/speech',
    'sharp',
    'bcrypt'
  ]
}
```

## Debugging Tips

1. **Incremental Testing**: Add packages to external one by one to identify the problematic dependency.

2. **Bundle Analysis**: Use tools to inspect what's being included in your bundle.

3. **Environment Parity**: Ensure your production environment has the same architecture as your build environment for native modules.

4. **Version Consistency**: Keep package versions consistent between development and production.

## Real-World Example

A developer spent a full day debugging a production deployment that worked locally but failed in production. The issue was resolved by adding `--external @google-cloud/speech` to the build command. This single flag change fixed the entire deployment pipeline.

This highlights the importance of understanding which dependencies contain native code and properly configuring your build process accordingly.

## Summary

When bundling Node.js backends:
- Always mark native C++ addon packages as external
- Test your bundled application thoroughly before deployment  
- Maintain a list of known problematic packages for your project
- Consider using configuration files for complex external dependency lists

This approach will save you significant debugging time and prevent production deployment issues.