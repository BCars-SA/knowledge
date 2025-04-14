# Service with JWT authentication and API controllers
This is a boilerplate for a .NET service that uses JWT authentication and API controllers. 
It is designed to be a starting point for building a service with these features.

## Features
- [JWT authentication](Extensions/AuthenticationExtensions.cs)
- [Swagger setup](Extensions/SwaggerExtensions.cs) for [versioning](Extensions/ApiVersioningExtensions.cs) and JWT authentication
- [CurrentUser context](Middleware/CurrentUserContext/CurrentUserContext.cs) for accessing the current user in http context as a [middleware](Middleware/CurrentUserContext/CurrentUserContextMiddleware.cs)
- [NLog](Extensions/NLogExtensions.cs) for logging
- [JsonSerializerOptions](Extensions/NLogExtensions.cs) for serialization settings (with [DateTime converter](Converters/JsonDateTimeConverter.cs))
- [Cors setup](Extensions/CorsExtensions.cs) for allowing cross-origin requests
- [Simple health check](Controllers/HealthController.cs) for checking the health of the service
