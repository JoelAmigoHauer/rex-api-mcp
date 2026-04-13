import { REX_SOAP_IPS_URL, REX_SOAP_WEBSTORE_URL, REX_SOAP_NAMESPACE } from "../constants";

interface SoapConfig {
  clientId: string;
  username: string;
  password: string;
}

interface SoapResponse {
  success: boolean;
  status: string;
  raw: string;
  data: Record<string, unknown>;
}

class RexSoapClient {
  private config: SoapConfig;

  constructor(config: SoapConfig) {
    this.config = config;
  }

  private buildEnvelope(action: string, bodyContent: string): string {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ret="${REX_SOAP_NAMESPACE}">
  <soap:Header>
    <ret:ClientHeader>
      <ret:ClientID>${this.config.clientId}</ret:ClientID>
      <ret:UserName>${this.config.username}</ret:UserName>
      <ret:Password>${this.config.password}</ret:Password>
    </ret:ClientHeader>
  </soap:Header>
  <soap:Body>
    <ret:${action}>
      ${bodyContent}
    </ret:${action}>
  </soap:Body>
</soap:Envelope>`;
  }

  async call(action: string, bodyContent: string, endpoint?: "ips" | "webstore"): Promise<SoapResponse> {
    const envelope = this.buildEnvelope(action, bodyContent);
    const url = endpoint === "webstore" ? REX_SOAP_WEBSTORE_URL : REX_SOAP_IPS_URL;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: `${REX_SOAP_NAMESPACE}${action}`,
      },
      body: envelope,
    });

    const buffer = await res.arrayBuffer();
    let text: string;

    // Handle gzip-compressed responses
    const contentEncoding = res.headers.get("content-encoding");
    if (contentEncoding === "gzip") {
      const ds = new DecompressionStream("gzip");
      const decompressed = new Response(
        new Blob([buffer]).stream().pipeThrough(ds)
      );
      text = await decompressed.text();
    } else {
      text = new TextDecoder().decode(buffer);
    }

    if (!res.ok) {
      const faultMatch = text.match(/<faultstring>([\s\S]*?)<\/faultstring>/);
      const message = faultMatch?.[1] ?? `SOAP fault: HTTP ${res.status}`;
      throw Object.assign(new Error(message), { status: res.status });
    }

    return this.parseResponse(action, text);
  }

  private parseResponse(action: string, xml: string): SoapResponse {
    // Extract status
    const statusMatch = xml.match(/<Status>([\s\S]*?)<\/Status>/);
    const status = statusMatch?.[1] ?? "Unknown";

    // Check for errors in the response
    const errors = this.extractErrors(xml);
    if (errors.length > 0) {
      return {
        success: false,
        status: "Error",
        raw: xml,
        data: { errors },
      };
    }

    // Extract result data based on action
    const data = this.extractData(action, xml);

    return {
      success: status === "Success" || !statusMatch,
      status,
      raw: xml,
      data,
    };
  }

  private extractErrors(xml: string): Array<Record<string, string>> {
    const errors: Array<Record<string, string>> = [];
    const errorRegex =
      /<Error>([\s\S]*?)<\/Error>/g;
    let match: RegExpExecArray | null;
    while ((match = errorRegex.exec(xml)) !== null) {
      const errorXml = match[1]!;
      const error: Record<string, string> = {};
      const fieldRegex = /<(\w+)>([\s\S]*?)<\/\1>/g;
      let fieldMatch: RegExpExecArray | null;
      while ((fieldMatch = fieldRegex.exec(errorXml)) !== null) {
        error[fieldMatch[1]!] = fieldMatch[2]!;
      }
      if (Object.keys(error).length > 0) {
        errors.push(error);
      }
    }
    return errors;
  }

  private extractData(
    action: string,
    xml: string
  ): Record<string, unknown> {
    const data: Record<string, unknown> = {};

    // Extract created/updated IDs from response
    switch (action) {
      case "CreateStockAdjustments": {
        data.adjustment_ids = this.extractValues(xml, "AdjustmentID");
        break;
      }
      case "CreateUpdateITOs": {
        data.ito_ids = this.extractValues(xml, "ItoId");
        break;
      }
      case "CreateUpdatePurchaseOrders": {
        data.po_ids = this.extractValues(xml, "POID");
        data.external_order_ids = this.extractValues(xml, "ExternalOrderID");
        break;
      }
      case "CreateUpdateSuppliers": {
        data.supplier_ids = this.extractValues(xml, "SupplierID");
        break;
      }
      case "SaveProductAttributes": {
        data.attribute_ids = this.extractValues(xml, "AttributeID");
        break;
      }
      case "SaveProductOutletDetails":
      case "SaveProducts": {
        data.saved_product_ids = this.extractValues(xml, "ProductId");
        data.saved_supplier_skus = this.extractValues(xml, "SupplierSKU");
        // Extract counts if present
        const updatedMatch = xml.match(
          /<UpdatedCount>(\d+)<\/UpdatedCount>/
        );
        const createdMatch = xml.match(
          /<CreatedCount>(\d+)<\/CreatedCount>/
        );
        if (updatedMatch) data.updated_count = parseInt(updatedMatch[1]!, 10);
        if (createdMatch) data.created_count = parseInt(createdMatch[1]!, 10);
        break;
      }
    }

    // Always include the status from Details if present
    const detailsMatch = xml.match(/<Details>([\s\S]*?)<\/Details>/);
    if (detailsMatch) {
      data.details_xml = detailsMatch[1]!.trim();
    }

    return data;
  }

  private extractValues(xml: string, tag: string): string[] {
    const values: string[] = [];
    const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "g");
    let match: RegExpExecArray | null;
    while ((match = regex.exec(xml)) !== null) {
      values.push(match[1]!.trim());
    }
    return values;
  }
}

/**
 * Parse flat XML elements into a key-value record.
 * Handles simple <Tag>Value</Tag> patterns (no nesting).
 */
export function xmlToRecord(xml: string): Record<string, string> {
  const record: Record<string, string> = {};
  const regex = /<(\w+)>([^<]*)<\/\1>/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(xml)) !== null) {
    record[m[1]!] = m[2]!;
  }
  return record;
}

/**
 * Extract repeating XML elements into an array of records.
 * E.g. extractRecords(xml, "Product") finds all <Product>...</Product> blocks.
 */
export function extractRecords(xml: string, elementTag: string): Record<string, string>[] {
  const records: Record<string, string>[] = [];
  const regex = new RegExp(`<${elementTag}\\b[^>]*>([\\s\\S]*?)<\\/${elementTag}>`, "g");
  let m: RegExpExecArray | null;
  while ((m = regex.exec(xml)) !== null) {
    records.push(xmlToRecord(m[1]!));
  }
  return records;
}

/**
 * Extract the SOAP result element content for a given action.
 * Handles namespace-prefixed tags (e.g. <ret:GetGroupsResult>).
 */
export function extractSoapResult(xml: string, action: string): string {
  // Match with or without namespace prefix
  const regex = new RegExp(
    `<(?:\\w+:)?${action}Result\\b[^>]*>([\\s\\S]*?)<\\/(?:\\w+:)?${action}Result>`
  );
  const match = xml.match(regex);
  return match?.[1]?.trim() ?? "";
}

/**
 * Decode base64-encoded gzip-compressed XML data.
 * IPS SOAP read methods return data in this format inside the Result element.
 */
export async function decodeBase64Gzip(base64Data: string): Promise<string> {
  // Decode base64 to binary
  const binaryStr = atob(base64Data);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  // Decompress gzip
  const ds = new DecompressionStream("gzip");
  const decompressed = new Response(
    new Blob([bytes]).stream().pipeThrough(ds)
  );
  return decompressed.text();
}

/**
 * Extract and decode the SOAP read result for IPS API methods.
 * Handles the base64+gzip encoding used by IPS read responses.
 * Falls back to plain XML if not base64-encoded.
 */
export async function extractAndDecodeSoapResult(xml: string, action: string): Promise<string> {
  const raw = extractSoapResult(xml, action);
  if (!raw) return "";

  // Check if it looks like base64 (no XML tags, mostly alphanumeric + /+=)
  if (!raw.startsWith("<") && /^[A-Za-z0-9+/=\s]+$/.test(raw.substring(0, 100))) {
    try {
      return await decodeBase64Gzip(raw.replace(/\s/g, ""));
    } catch {
      // Not base64+gzip, return as-is
      return raw;
    }
  }
  return raw;
}

// XML builder helpers

export function xmlElement(tag: string, value: string | number | boolean): string {
  return `<${tag}>${String(value)}</${tag}>`;
}

export function xmlOptional(
  tag: string,
  value: string | number | boolean | undefined | null
): string {
  if (value === undefined || value === null) return "";
  return xmlElement(tag, value);
}

export function xmlMoney(
  tag: string,
  value: number | undefined | null
): string {
  if (value === undefined || value === null) return "";
  return xmlElement(tag, `$${value.toFixed(2)}`);
}

// Module-level singleton
let soapClientInstance: RexSoapClient | null = null;

export function getSoapClient(): RexSoapClient {
  if (!soapClientInstance) {
    const clientId = process.env.REX_SOAP_CLIENT_ID;
    const username = process.env.REX_SOAP_USERNAME;
    const password = process.env.REX_SOAP_PASSWORD;

    if (!clientId || !username || !password) {
      throw new Error(
        "REX_SOAP_CLIENT_ID, REX_SOAP_USERNAME, and REX_SOAP_PASSWORD environment variables are required for SOAP/IPS API access."
      );
    }

    soapClientInstance = new RexSoapClient({ clientId, username, password });
  }
  return soapClientInstance;
}

export type { RexSoapClient, SoapResponse };
