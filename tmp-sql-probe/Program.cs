using Microsoft.Data.SqlClient;

var candidates = new[]
{
    "Server=.\\SQLEXPRESS;Database=master;Trusted_Connection=True;TrustServerCertificate=True;Encrypt=False;",
    "Server=(local)\\SQLEXPRESS;Database=master;Trusted_Connection=True;TrustServerCertificate=True;Encrypt=False;",
    "Server=lpc:(local)\\SQLEXPRESS;Database=master;Trusted_Connection=True;TrustServerCertificate=True;Encrypt=False;",
    "Server=np:\\\\.\\pipe\\MSSQL$SQLEXPRESS\\sql\\query;Database=master;Trusted_Connection=True;TrustServerCertificate=True;Encrypt=False;",
    "Server=np:(local)\\pipe\\MSSQL$SQLEXPRESS\\sql\\query;Database=master;Trusted_Connection=True;TrustServerCertificate=True;Encrypt=False;"
};

foreach (var connectionString in candidates)
{
    Console.WriteLine($"--- {connectionString}");

    try
    {
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        await using var command = connection.CreateCommand();
        command.CommandText = "select @@SERVERNAME";
        var serverName = await command.ExecuteScalarAsync();
        Console.WriteLine($"OK {serverName}");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"FAIL {ex.GetType().Name}: {ex.Message}");
    }
}
