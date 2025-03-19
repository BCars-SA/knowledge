# Integrating NLog into Your .NET Project

This guide will help you integrate NLog into your .NET project for logging purposes. Follow the steps below to set up NLog using the provided `Program.cs` and `nlog.config` files.

## Step 1: Install NLog Packages

First, you need to install the necessary NLog packages. You can do this via the NuGet Package Manager or by running the following commands in the Package Manager Console:

```sh
dotnet add package NLog.Web.AspNetCore
dotnet add package NLog.Extensions.Logging
```

## Step 2: Configure NLog in `Program.cs`

In your `Program.cs` file, add the following code to configure NLog:

```csharp
using NLog.Web;
using NLog.Extensions.Logging;
using NLog;

var builder = WebApplication.CreateBuilder(args);

// Add NLog to the logging system
builder.Logging.ClearProviders();
builder.Logging.AddNLog();
builder.Host.UseNLog();

// ... other code
```

This code clears the existing logging providers and adds NLog as the logging provider.

## Step 3: Create `nlog.config`

Copy an [nlog.config](nlog.config) file in your project directory.
This configuration sets up various targets and rules for logging, including console logging and file logging with different levels and formats.
Edit the file as needed to customize the logging configuration.


## Step 4: Run Your Application

With the above configurations in place, you can now run your application. NLog will handle logging according to the rules defined in [nlog.config](nlog.config).

That's it! You've successfully integrated NLog into your .NET project.