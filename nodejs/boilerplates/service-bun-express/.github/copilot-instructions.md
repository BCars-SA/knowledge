# GitHub Copilot Instructions for My Super Service

## Project Overview

My Super Service is a backend service built with Bun and Express.js, designed to provide AI-powered functionalities using LangChain and LangGraph. It leverages Postgres and Redis for data storage and caching.

## Technology Stack & Architecture

- **Runtime**: Bun (JavaScript runtime and package manager)
- **Language**: TypeScript (strict mode)
- **AI Framework**: LangChain/LangGraph TypeScript
- **Web Sockets**: Native Bun WebSocket implementation
- **HTTP Server**: Express.js
- **Database**: Postgres, Redis

## TypeScript Development Standards

### Strict TypeScript Configuration

```typescript
// Always use strict TypeScript settings
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "strictFunctionTypes": true,
  "noImplicitReturns": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

### Code Quality Rules

1. **No `any` type**: Always provide explicit types
2. **Strict null checks**: Handle null/undefined explicitly
3. **Immutable patterns**: Prefer readonly and const assertions
4. **Error handling**: Use Result/Either patterns or proper error types
5. **Dependency injection**: Use interfaces for loose coupling
6. **Split into pieces**: Break down large files into smaller, focused modules if needed. Ideally one file per class /  service. Look at the existing directory structure for guidance.
7. **Keep it simple**: Do not over-engineer solutions. Aim for simplicity and clarity. No functions for "just in case" scenarios.


## Architecture Patterns

### Loose Coupling Principles

1. **Dependency Inversion**: Depend on abstractions, not concretions
2. **Interface Segregation**: Create focused, single-purpose interfaces
3. **Single Responsibility**: Each module has one reason to change
4. **Repository Pattern**: Abstract data access behind interfaces

### Example Structure

```typescript
// Core interfaces
interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  search(query: SearchQuery): Promise<SearchResult>;
  upsert(item: T): Promise<void>;
}

interface IService {
  doSmth(var1: string): Promise<string[]>;
}

interface IStore {
  upsert(document: Document): Promise<void>;
  search(query: string, limit: number): Promise<Result[]>;
}

// Implementation with dependency injection
class CarSearchService {
  constructor(
    private readonly repo: IRepository<Car>,
    private readonly store: IStore,
  ) {}
}
```

### Code Organization
```typescript
// File structure follows domain boundaries
src/
├── config-service/    # Configuration management
├── lib/               # Shared libraries
├── services/          # Business logic services
├── repositories/      # Data access layer
├── schemas/           # Zod schemas for validation
├── types/             # shared types and interfaces
├── utils/             # Utility functions
└── api/               # API layer
    ├── types/
    ├── controllers/
    |── middleware/
    |── server.ts
    └── routes.ts
```

### Logging

- Log only in the outermost layers (e.g., orchestrators, routers). 
- Do not log in services, libraries, utilities, modules or repositories. 
- Use structured logging with context.
- In try catch blocks, do not log errors if we rethrow them.

### Error Handling
```typescript
// Use Result pattern for error handling
type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

// Or use proper error types
class CarNotFoundError extends Error {
  constructor(carId: string) {
    super(`Car with ID ${carId} not found`);
    this.name = 'CarNotFoundError';
  }
}
```

### Async/Await Patterns
```typescript
// Always handle errors explicitly
async function fetchCar(id: string): Promise<Result<Car>> {
  try {
    const car = await carRepository.findById(id);
    if (!car) {
      return { success: false, error: new CarNotFoundError(id) };
    }
    return { success: true, data: car };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

### Testing Requirements

For **all**:
- Do not test logging outputs

For **new code**:
- Minimum 90% code coverage
- Test all public methods
- Test error conditions
- Mock external dependencies

For **refactoring/fixes**:
- Ensure existing tests still pass
- Add tests for previously uncovered scenarios
- Update tests that validate changed behavior

#### Testing Patterns

```typescript
// Use dependency injection for testability
describe('CarSearchService', () => {
  let searchService: CarSearchService;
  let mockCarRepo: jest.Mocked<ICarRepository>;
  let mockVectorStore: jest.Mocked<IVectorStore>;

  beforeEach(() => {
    mockCarRepo = createMockCarRepository();
    mockVectorStore = createMockVectorStore();
    searchService = new CarSearchService(mockCarRepo, mockVectorStore);
  });

  describe('search', () => {
    it('should combine semantic and metadata results', async () => {
      // Arrange
      const query = { query: 'sporty SUV', filters: { maxPrice: 50000 } };
      mockVectorStore.search.mockResolvedValue(mockSemanticResults);
      mockCarRepo.search.mockResolvedValue(mockMetadataResults);

      // Act
      const result = await searchService.search(query);

      // Assert
      expect(result.success).toBe(true);
      expect(result.data.results).toHaveLength(expectedLength);
      expect(mockVectorStore.search).toHaveBeenCalledWith(expectedVector, 10);
    });

    it('should handle empty results gracefully', async () => {
      // Test edge cases
    });

    it('should handle service errors', async () => {
      // Test error conditions
    });
  });
});
```

#### Integration Tests
```typescript
// Test real database interactions
describe('Car Repository Integration', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  it('should persist and retrieve car data', async () => {
    // Test with real database
  });
});
```

## Development Workflow

When adding or modifying any code, **ALWAYS** follow these steps:

### 1. Build a Plan

Before implementing, create a detailed plan that includes:

- **Objective**: What specific functionality are we implementing?
- **Components**: Which files/modules will be affected?
- **Interfaces**: What new types/interfaces are needed?
- **Dependencies**: What external services or modules are required?
- **Testing Strategy**: What needs to be tested and how?
- **Breaking Changes**: Will this affect existing APIs or behavior?

**Example Plan Format:**
```markdown
## Implementation Plan: Car Search API

### Objective
Implement hybrid search endpoint combining semantic and metadata filtering

### Components Affected
- `src/api/routes/search.ts` (new)
- `src/search/hybrid.ts` (new)
- `src/types/search.ts` (modify)

### New Interfaces
- `SearchRequest`, `SearchResponse`, `HybridSearchOptions`

### Dependencies
- LangChain VectorStore
- PostgreSQL for metadata filtering
- OpenAI embeddings service

### Testing Strategy
- Unit tests for search logic
- Integration tests for API endpoints
- Mock external dependencies
```

### 2. Start Implementation After User's Confirmation

- Present the plan to the user
- Wait for explicit confirmation before proceeding
- Ask for clarification on any ambiguous requirements

### 3. Implement

Proceed with implementation according to the plan.

### 4. Cover with Unit Tests

Add unit tests for all new functionality, including edge cases and error conditions.

### 5. Output Summary of Changes

After implementation, provide a comprehensive summary:

#### Summary Format
```markdown
## Implementation Summary

### Files Added/Modified
- ✅ `src/search/hybrid.ts` - New hybrid search service
- ✅ `src/api/routes/search.ts` - Search API endpoints
- ✅ `src/types/search.ts` - Search-related type definitions
- ✅ `tests/search/hybrid.test.ts` - Unit tests for hybrid search
- ✅ `tests/api/search.integration.test.ts` - Integration tests

### Key Features Implemented
- Hybrid search combining semantic and metadata filtering
- Type-safe API with comprehensive error handling
- Caching layer for improved performance
- Comprehensive test coverage (90%)

### Breaking Changes
- None

### Next Steps
- [ ] Add query performance monitoring
- [ ] Implement search analytics
- [ ] Add more sophisticated ranking algorithms

### Testing Results
- Unit tests: 23 passed, 0 failed
- Integration tests: 5 passed, 0 failed
- Coverage: 93% (exceeds 90% requirement)
```

## Domain-Specific Guidelines

### API Design
- Follow RESTful conventions
- Implement proper HTTP status codes
- Provide comprehensive error messages
- Version APIs for backward compatibility

## Performance Considerations

- Use connection pooling for database operations
- Implement query result caching
- Batch vector operations where possible
- Monitor and log performance metrics
- Use lazy loading for heavy operations

## Input Validation

- Implement comprehensive input validation using Zod schemas
- Ensure all user inputs are validated before processing
- Provide clear error messages for invalid inputs

## Security Guidelines

- Validate all input data
- Sanitize database queries
- Implement proper authentication
- Log security-relevant events
- Never expose internal error details in API responses

Remember: Every piece of code should be type-safe, testable, and loosely coupled. When in doubt, favor explicit types and clear interfaces over clever implementations.