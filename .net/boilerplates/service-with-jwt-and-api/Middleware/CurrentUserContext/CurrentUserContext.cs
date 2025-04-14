namespace Middleware.CurrentUserContext;

/**
 * Interface for the current user context (in http context).
 * This context is used to store the current user's ID.
 * And to be able to access it from anywhere in the application.
 */
public interface ICurrentUserContext
{
    string Id { get; }

    string? Name { get; }

    string? Roles { get; }
}

public class CurrentUserContext : ICurrentUserContext {
    public string Id { get; set; }

    public string? Name { get; set; }

    public string? Roles { get; set; }

    public CurrentUserContext(string id)
    {        
        Id = id;
    }
}