export const REX_API_BASE_URL =
  process.env.REX_API_BASE_URL || "https://api.retailexpress.com.au";

export const REX_API_VERSION = "v2.1";

export const REX_AUTH_URL = `${REX_API_BASE_URL}/v2/auth/token`;

export const REX_BASE_ENDPOINT = `${REX_API_BASE_URL}/${REX_API_VERSION}`;

export const TOKEN_REFRESH_BUFFER_MS = 2 * 60 * 1000; // 2 minutes before expiry

export const RATE_LIMIT_MAX_PER_MINUTE = 295; // 5-request safety buffer below 300

export const DEFAULT_PAGE_SIZE = 50;

export const MAX_PAGE_SIZE = 250;

// SOAP / IPS API
export const REX_SOAP_IPS_URL =
  process.env.REX_SOAP_IPS_URL ||
  "https://empirehomewares.retailexpress.com.au/DOTNET/Admin/WebServices/v2/inventoryplanning/inventoryplanningservice.asmx";

export const REX_SOAP_WEBSTORE_URL =
  process.env.REX_SOAP_WEBSTORE_URL ||
  "https://empirehomewares.retailexpress.com.au/DOTNET/Admin/WebServices/v2/Webstore/Service.asmx";

export const REX_SOAP_NAMESPACE = "http://retailexpress.com.au/";
