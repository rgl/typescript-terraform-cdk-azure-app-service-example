using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ExampleApp.Pages;

public class GeoIp
{
    public string? Ip { get; set; }
    public string? Country { get; set; }
    public string? Region { get; set; }
    public string? City { get; set; }
    public string? Organization { get; set; }
}

public class IndexModel : PageModel
{
    private readonly ILogger<IndexModel> _logger;
    private readonly IHttpClientFactory _httpClientFactory;

    public GeoIp? ServerPublicGeoIp { get; private set; }
    public GeoIp? ClientPublicGeoIp { get; private set; }

    public IndexModel(ILogger<IndexModel> logger, IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _httpClientFactory = httpClientFactory;
    }

    public async Task OnGet()
    {
        var client = _httpClientFactory.CreateClient();

        ServerPublicGeoIp = await client.GetFromJsonAsync<GeoIp>("https://ip.seeip.org/geoip");
        ClientPublicGeoIp = await client.GetFromJsonAsync<GeoIp>($"https://ip.seeip.org/geoip/{Uri.EscapeDataString(HttpContext.Connection.RemoteIpAddress?.ToString() ?? "")}");
    }
}
