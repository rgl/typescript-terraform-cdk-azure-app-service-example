using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ExampleApp.Pages;

public class IndexModel : PageModel
{
    private readonly ILogger<IndexModel> _logger;
    private readonly IHttpClientFactory _httpClientFactory;

    public string ServerPublicIpAddress { get; private set; } = "";

    public IndexModel(ILogger<IndexModel> logger, IHttpClientFactory httpClientFactory)
    {
        _logger = logger;
        _httpClientFactory = httpClientFactory;
    }

    public async Task OnGet()
    {
        var client = _httpClientFactory.CreateClient();

        ServerPublicIpAddress = await client.GetStringAsync("https://ip.seeip.org/");
    }
}
