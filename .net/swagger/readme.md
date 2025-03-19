# Swagger Setup for API Versioning

This repository contains examples of setting up Swagger for API versioning in .NET applications. Below are three different examples demonstrating various configurations and authentication methods.

## Examples

1. **Simple Setup**  
    This example provides a basic setup for Swagger with API versioning without any authentication. It is a straightforward implementation suitable for simple applications.  
    [View the code](./code/simple/Program.cs)

2. **JWT Token Authentication**  
    This example demonstrates how to set up Swagger with API versioning and JWT token authentication. It includes configuration for adding security definitions and requirements for JWT tokens. The code includes a AuthService template for generating JWT tokens.  
    [View the code](./code/with-jwt-token/Program.cs)

3. **API Key Authentication**  
    This example shows how to configure Swagger with API versioning and API key authentication. It includes the necessary setup for adding API key authentication to the services. The code includes a Security folder with a custom API key handler. 
    [View the code](./code/with-api-key/Program.cs)


## Differences

- **Simple Setup**: This is a basic setup without any authentication. It is ideal for public APIs or internal services where security is not a primary concern.

- **JWT Token Authentication**: This setup includes JWT token authentication, which is useful for securing APIs with token-based authentication. It involves configuring Swagger to accept and validate JWT tokens.

- **API Key Authentication**: This configuration uses API key authentication, where clients must provide an API key to access the endpoints. It is simpler than JWT but still provides a layer of security.

Each example demonstrates how to integrate API versioning with Swagger, ensuring that your API documentation is versioned and easily accessible.