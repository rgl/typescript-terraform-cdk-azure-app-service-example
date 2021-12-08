# Usage (on a Ubuntu Desktop)

Install the tools:

```bash
./provision-tools.sh
hash -r
```

Install this project dependencies:

```bash
npm install
```

Login into azure-cli:

```bash
az login
```

List the subscriptions and select the current one if the default is not OK:

```bash
az account list --all
az account set --subscription=<id>
az account show
```

Review `main.ts` and maybe change the `resourceGroupName` and `locationName` variables.

Deploy the infrastructure:

```bash
npx cdktf deploy
```

Build and deploy the example application:

```bash
pushd example-app
# NB Free/Shared App Service Plans only support 32-bit apps.
# see https://docs.microsoft.com/en-us/azure/app-service/deploy-zip
dotnet publish --configuration Release --runtime win-x86 --no-self-contained
(rm -f *.zip && TOP="$PWD" && cd bin/Release/net6.0/win-x86/publish && zip -r "$TOP/example-app.zip" .)
unzip -l example-app.zip
az webapp deployment source config-zip \
    --resource-group "$(jq -r .outputs.appResourceGroup.value ../terraform.example.tfstate)" \
    --name "$(jq -r .outputs.appName.value ../terraform.example.tfstate)" \
    --src example-app.zip
popd
```

Destroy the infrastructure:

```bash
npx cdktf destroy
```

# Notes

* terraform-cdk is still very rough.
  * Error messages are still very cryptic (it helps consulting the Azure resource `Activity log` for error messages).
* The free SKU provides a free .azurewebsites.net public certificate.
* For using a custom certificate and domain, you must use a non-free SKU.
  * See https://docs.microsoft.com/en-us/azure/app-service/configure-ssl-certificate
* TLS is terminated at the Azure managed network load balancers and all HTTPS requests reach the app as unencrypted HTTP requests. To ensure the request is made with HTTPS, [configure the Forwarded Headers Middleware (e.g. `X-Forwarded-Proto`)](https://docs.microsoft.com/en-us/azure/app-service/configure-language-dotnetcore?pivots=platform-windows#detect-https-session).
