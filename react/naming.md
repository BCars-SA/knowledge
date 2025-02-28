# Naming Conventions for React Applications

This guide outlines the naming conventions we use in our React application to ensure consistency, readability, and maintainability.

## Event Handlers (Props and Functions)

We follow a consistent pattern for event handlers, distinguishing between the prop name used in the JSX and the actual handler function.

- **Prop Names (JSX):** Use the `onEventName` pattern for event handler props. This clearly indicates that the prop expects a function to handle a specific event. Examples: `onClick`, `onChange`, `onSubmit`, `onFocus`, `onBlur`, `onKeyDown`, `onMouseEnter`, `onMouseLeave`. Be as specific as possible with the event name.

- **Handler Function Names:** Use the `handleEventName` pattern for the corresponding handler functions within your component. This clearly links the prop to its implementation. Examples: `handleClick`, `handleChange`, `handleSubmit`, `handleFocus`, `handleBlur`, `handleKeyDown`, `handleMouseEnter`, `handleMouseLeave`.

```javascript
function DefaultButton() {
    const handleClick = () => {
        // Handle the click event
    };

    const handleChange = (event) => {
        // Handle the change event
        console.log(event.target.value);
    };

    return (
        <div>
            <button onClick={handleClick}>Click me</button>
            <input type="text" onChange={handleChange} />
        </div>
    );
}
```

## `useState` Variables

For `useState` hooks, we adhere to the `[variableName, setVariableName]` pattern.

- **State Variables:** Choose descriptive names that reflect the state's purpose. Use camelCase. Examples: `userName`, `isLoggedIn`, `productPrice`, `items`.

- **Setter Functions:** React automatically prefixes the setter function with `set`. We don't need to add anything extra.

- **Visibility State:** For boolean state variables controlling component visibility, the `[isVisible, setIsVisible]` or `[isOpen, setIsOpen]` (for modals) pattern is recommended. This clearly communicates the purpose of the state. Other boolean states should also be named descriptively (e.g. `isLoading`, `hasError`).

```javascript
const [userName, setUserName] = useState('');
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [isVisible, setIsVisible] = useState(false);
const [isButtonVisible, setIsButtonVisible] = useState(false);
const [isModalOpen, setIsModalOpen] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [hasError, setHasError] = useState(false);
```

## Component Names

- **PascalCase:** Use PascalCase (e.g., `DefaultButton`, `UserProfile`, `ProductDetails`) for component names. This convention is widely used in the React community and clearly distinguishes components from regular functions or variables.

## Prop Names

- **camelCase:** Use camelCase (e.g., `firstName`, `productPrice`, `onClick`).

- **Descriptive Names:** Choose names that clearly indicate the prop's purpose.

- **Avoid Boolean Prop Names:** While sometimes used, boolean prop names can be ambiguous (e.g., `hidden`). Consider using more explicit names like `isHidden` or `isVisible`.

## Other Variables and Functions

- **camelCase:** Use camelCase for all other variables and functions (e.g., `const testVariable = ...`, `function customFunction() { ... }`).

- **Descriptive Names:** Choose names that are clear, concise, and reflect the variable or function's purpose.

## Singular vs. Plural (Types/Interfaces and Components)

Use singular names for types/interfaces and other variables that represent a single entity (e.g., User, Product). Use plural names for types/interfaces that represent a collection of entities (e.g., Users, Products).
And for the component you can use UserPage, UserList, ProductPage, ProductList then, i.e. try to add the suffix Page, List, Button, Section to the component name.
If you have to name the type or interface CarList and you have the component CarList, then you can use CarListData, CarListResponse, CarListType for the type/interface.

## Constants

*   **UPPER_SNAKE_CASE:** Use UPPER_SNAKE_CASE for constants (e.g., `API_URL`, `MAX_VALUE`).

## File Names

*   **kebab-case:** Use kebab-case (lowercase with hyphens) for all file names (e.g., `button.tsx`, `auth-context.tsx`, `product-details.tsx`). This applies to component files, context files, utility files, etc.

*   **Component with Multiple Files:** If a component requires multiple files (e.g., a component with sub-components, styles, tests), organize them in a directory named after the component (kebab-case) and use `index.tsx` for the main component file.  Other files within the directory should also use kebab-case.

## Custom Hooks

*   **useCamelCase:** Custom hook names should start with `use` followed by a descriptive name in camelCase (e.g., `useAuth`, `useForm`, `useLocalStorage`).  File names for custom hooks should also follow this convention (e.g., `use-auth.ts`, `use-form.tsx`).

## API Function Names

*   **Descriptive and Concise:** Choose names that clearly indicate the API endpoint's purpose and the data being fetched or manipulated.
*   **HTTP Verb + Resource:**  A common and effective pattern is to start with the HTTP verb (e.g., `get`, `post`, `update`, `delete`) followed by the resource name.  This makes it easy to understand the action being performed.
*   **camelCase:** Use camelCase for consistency.

```javascript
// Examples:
async function getUsers() { /* ... */ }             // GET /users
async function getUser(userId) { /* ... */ }        // GET /users/:id
async function createUser(userData) { /* ... */ }    // POST /users
async function updateUser(userId, userData) { /* ... */ } // PUT /users/:id
async function deleteUser(userId) { /* ... */ }    // DELETE /users/:id

async function getProducts() { /* ... */ }          // GET /products
async function createProduct(productData) { /* ... */ } // POST /products

async function getOrders(userId) { /* ... */ }      // GET /users/:id/orders
````

- **Specific Actions:** If the API endpoint performs a more specific action, reflect that in the name.

```javascript
async function resetPassword(email) {
    /* ... */
}
async function uploadProfileImage(formData) {
    /* ... */
}
```

## Directory Structure (Recommended)

A well-organized directory structure can significantly improve maintainability. A feature-based structure is highly recommended:

```
src/
  components/        // Reusable UI components
    button.tsx
      ...
    form/
      index.tsx
      ...
    ...
  features/         // Feature-specific code (components, contexts, hooks)
    authentication/
      components/
        login.tsx
        register.tsx
      context/
        auth-context.tsx
      hooks/
        use-auth.ts
    products/
      ...
  context/          // Global contexts (if not feature-specific)
  hooks/            // Custom hooks (if not feature-specific)
  lib/              // External / common (for multiple projects) libraries, utilities
  utils/            // Utility functions
  app.tsx           // Main application component
  index.tsx         // Entry point
```

By following these naming conventions, you'll create a more consistent and maintainable codebase, making it easier for yourself and other developers to understand and work with your React application.
