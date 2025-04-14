using System.Security.Claims;

namespace Middleware.CurrentUserContext;

/**
 * Middleware for setting the current user context for the entire application.
 * It gets the current user from ClaimsPrincipal and uses NameIdentifier claim type to get the user ID.
 * The user ID is then stored in the CurrentUserContext accessible via ICurrentUserContextProvider.
 * It doesn't throw an exception if the user ID is not found. In this case the user context is set to null.
 */
public class CurrentUserContextMiddleware
{
    private readonly RequestDelegate _next;
    public CurrentUserContextMiddleware(RequestDelegate next)
    {
        _next = next;        
    }

    public async Task InvokeAsync(HttpContext context, ICurrentUserContextProvider currentUserContextProvider)
    {
        if (currentUserContextProvider != null) {
            var userId = GetUserId(context.User);
            currentUserContextProvider.SetContext(
                context, 
                new CurrentUserContext(userId) {
                    Name = GetUsername(context.User)
                }
            );
        }
        await _next(context);
    }

    private string GetUserId(ClaimsPrincipal? user, string claimIdentifier = ClaimTypes.NameIdentifier)
    {        
        var claimUserId = user?.FindFirst(claimIdentifier);
        return claimUserId != null ? claimUserId.Value as string : string.Empty;
    }

    private string? GetUsername(ClaimsPrincipal? user, string claimIdentifier = ClaimTypes.Name)
    {
        var claimName = user?.FindFirst(claimIdentifier);
        return claimName?.Value;
    }
}