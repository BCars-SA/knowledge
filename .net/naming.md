# Microsoft coding-style guideline
You can also Microsoft's guideline as a base reference:
- [C# identifier naming rules and conventions](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/identifier-names) 
- [Common C# code conventions](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/coding-style/coding-conventions)

# .NET Naming Conventions for API Controllers

## General Guidelines
- **PascalCase** for class names, method names, and properties.
- **camelCase** for local variables and method parameters.
- Avoid abbreviations and acronyms unless they are widely known and accepted.
- Use meaningful and descriptive names.

## API Controllers

### Controller Names
- Use the suffix `Controller` for all controller classes.
- Name controllers based on the resource they manage. For example, a controller managing products should be named `ProductsController`.

### Action Method Names
- Use verbs to describe the action performed by the method.
- Common verbs include `Get`, `Post`, `Put`, `Delete`, and `Patch`.
- For example, use `GetProducts` for a method that retrieves products.

### Route Naming
- Use attribute routing to define routes.
- Keep routes simple and intuitive.
- DO use kebab-casing for URL path segments. If the segment refers to a JSON field, use camel casing.
- Use nouns, not verbs: `/users` and NOT `/get-users`.
- Choose plural or singular naming for your resources and maintain this convention throughout the project, f.e.:
    * get the list of users `GET /api/users`
    * create new user `POST /api/users`
    * read a user by id `GET /api/users/:id`  or `GET /api/user/:id` - here you have choose what you prefer more and keep this convention for other resources as well


### Parameters
- Use descriptive names for parameters.
- For query parameters, use camelCase.
- For route parameters, use PascalCase.

## Models

### Model Class Names
- Use PascalCase for model class names.
- Name models based on the resource they represent. For example, a model representing a product should be named `Product`.

### Property Names
- Use PascalCase for property names.
- Use meaningful and descriptive names for properties.
- Avoid abbreviations and acronyms unless they are widely known and accepted.

### Request and Response Models
- If the request and response have differences or special fields, create separate models for request and response data.
- Use `Request` and `Response` suffixes to distinguish between them. For example, `CreateProductRequest` and `ProductResponse`.

## Examples

### Controller Class
```csharp
public class ProductsController : ControllerBase
{
    [HttpGet]
    [Route("api/products")]
    public IActionResult GetProducts(string? filter)
    {
        // ...code...
    }

    [HttpGet]
    [Route("api/product/{id}")]
    public IActionResult GetProduct(string id)
    {
        // ...code...
    }

    [HttpPost]
    [Route("api/products")]
    public IActionResult CreateProduct(CreateProductRequest request)
    {
        // ...code...
    }

    [HttpDelete]
    [Route("api/product/{id}")]
    public IActionResult DeleteProduct(string id)
    {
        // ...code...
    }

    [HttpPatch]
    [Route("api/product/{id}")]
    public IActionResult UpdateProduct(string id, UpdateProductRequest request)
    {
        // ...code...
    }
    // ...code...
}
```

### Model Classes
```csharp
public class Product
{
    public string Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public string Description { get; set; }
    [JsonIgnore] // if you want to hide this field in response
    public string SomeHiddenField { get; set; }
}

// OR clearly separate response and internal Product models

public class ProductResponse
{
    public string Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public string Description { get; set; }
}

public class CreateProductRequest
{
    public string Name { get; set; }
    public decimal Price { get; set; }
    public string Description { get; set; }
}

public class UpdateProductRequest
{
    public decimal Price { get; set; }
    public string Description { get; set; }
}
```

## Summary
Following these naming conventions helps maintain consistency and readability in your .NET API applications. 
Consistent naming makes it easier for developers to understand and navigate the codebase.
