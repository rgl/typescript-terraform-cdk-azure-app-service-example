import { Construct } from "constructs";
import {
  App,
  TerraformOutput,
  TerraformStack,
} from "cdktf";
import {
  ServicePlan,
  AzurermProvider,
  ResourceGroup,
  WindowsWebApp,
} from "@cdktf/provider-azurerm";

class ExampleStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    // NB you can test the relative speed from you browser to a location using https://azurespeedtest.azurewebsites.net/
    // get the available locations with: az account list-locations --output table
    const locationName = "northeurope";

    const resourceGroupName = "rgl-cdktf-app-service-example";

    // NB the app service name is shared between all azure customers. it will
    //    be used in the app service url, e.g., https://${appName}.azurewebsites.net/.
    const appName = resourceGroupName;

    // see https://azure.microsoft.com/en-us/pricing/details/app-service/windows/
    const servicePlanSkuName = "F1";
    const isFreeOrSharedServicePlan = servicePlanSkuName == "F1" || servicePlanSkuName == "D1";

    new AzurermProvider(this, "azure", {
      features: {},
    });

    const resourceGroup = new ResourceGroup(this, "resourceGroup", {
      name: resourceGroupName,
      location: locationName,
    });

    // see https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/service_plan
    const servicePlan = new ServicePlan(this, "servicePlan", {
      resourceGroupName: resourceGroup.name,
      location: resourceGroup.location,
      name: "Example",
      osType: "Windows",
      skuName: servicePlanSkuName,
    });

    // see https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/azurerm_windows_web_app
    const webApp = new WindowsWebApp(this, "webApp", {
      resourceGroupName: resourceGroup.name,
      location: resourceGroup.location,
      name: appName,
      servicePlanId: servicePlan.id,
      clientAffinityEnabled: false,
      httpsOnly: true,
      siteConfig: {
        alwaysOn: !isFreeOrSharedServicePlan,
        use32BitWorker: isFreeOrSharedServicePlan,
        http2Enabled: true,
        websocketsEnabled: true,
        applicationStack: {
          currentStack: "dotnet",
          dotnetVersion: "v6.0",
        },
      },
    });

    new TerraformOutput(this, "appResourceGroup", {
      value: webApp.resourceGroupName,
    });

    new TerraformOutput(this, "appName", {
      value: webApp.name,
    });

    new TerraformOutput(this, "appUrl", {
      value: `https://${webApp.name}.azurewebsites.net/`,
    });
  }
}

const app = new App();
new ExampleStack(app, "example");
app.synth();
