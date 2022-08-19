import { Construct } from "constructs";
import {
  App,
  TerraformOutput,
  TerraformStack,
} from "cdktf";
import {
  AppService,
  AppServicePlan,
  AzurermProvider,
  ResourceGroup,
} from "@cdktf/provider-azurerm";

class ExampleStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    // NB you can test the relative speed from you browser to a location using https://azurespeedtest.azurewebsites.net/
    // get the available locations with: az account list-locations --output table
    const locationName = "northeurope";

    const resourceGroupName = "rgl-cdktf-app-service-example";

    // NB the app service name is shared between all azure customers. it will
    //    be used in the app service url, e.g., https://${appServiceName}.azurewebsites.net/.
    const appServiceName = resourceGroupName;

    new AzurermProvider(this, "azure", {
      features: {},
    });

    const resourceGroup = new ResourceGroup(this, "resourceGroup", {
      name: resourceGroupName,
      location: locationName,
    });

    // see https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/app_service_plan
    const appServicePlan = new AppServicePlan(this, "appServicePlan", {
      resourceGroupName: resourceGroup.name,
      location: resourceGroup.location,
      name: "Example",
      kind: "Windows",
      // see https://azure.microsoft.com/en-us/pricing/details/app-service/windows/
      sku: {
        size: "F1",
        tier: "Free",
      },
    });

    // see https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/app_service
    const appService = new AppService(this, "appService", {
      resourceGroupName: resourceGroup.name,
      location: resourceGroup.location,
      name: appServiceName,
      appServicePlanId: appServicePlan.id,
      clientAffinityEnabled: false,
      httpsOnly: true,
      siteConfig: {
        use32BitWorkerProcess: true, // NB MUST be true for Free/Shared App Service Plans.
        dotnetFrameworkVersion: "v6.0",
        http2Enabled: true,
        websocketsEnabled: true,
      },
    });

    new TerraformOutput(this, "appResourceGroup", {
      value: appService.resourceGroupName,
    });

    new TerraformOutput(this, "appName", {
      value: appService.name,
    });

    new TerraformOutput(this, "appUrl", {
      value: `https://${appService.name}.azurewebsites.net/`,
    });
  }
}

const app = new App();
new ExampleStack(app, "example");
app.synth();
