# RetailExpress (REX) MCP Server

MCP server providing 45 tools for the RetailExpress (Maropost) REST API v2.1. Deployed on Vercel as a Streamable HTTP endpoint.

## Tools (45)

| Domain | Tools | Endpoints |
|--------|-------|-----------|
| Products | 7 | list, get, update, types, attributes, barcodes, prices |
| Orders | 5 | list, get, items, fulfilments, payments |
| Customers | 4 | list, get, types, survey segments |
| Inventory | 4 | list, movement logs, stock receipts, adjustment reasons |
| Purchasing | 8 | POs (list/get/items), transfers (list/items), suppliers, invoices, returns |
| Finance | 7 | vouchers, voucher types, credit notes, price groups (2), discount rules, loyalty reasons |
| Reference | 10 | outlets (list/get), countries, currencies, freight, shipment types, shipping (ports/status), return reasons, users |

## Setup

### 1. Generate a RetailExpress API Key

1. Log into REX Back Office
2. Navigate to **Settings > Integrations > API Management**
3. Ensure "API Management" permission is enabled on your Profile Security
4. Enter a name and description for the key
5. Select "Enabled" and click **Generate Keys**
6. Copy either the Primary or Secondary key

### 2. Environment Variables

```bash
# Required
REX_API_KEY=your_api_key_here

# Optional (defaults to https://api.retailexpress.com.au)
REX_API_BASE_URL=https://api.retailexpress.com.au
```

### 3. Deploy to Vercel

1. Push this repo to GitHub
2. Import the repo in Vercel
3. Add `REX_API_KEY` as an environment variable
4. Deploy

The MCP endpoint will be available at `https://your-project.vercel.app/mcp`

### 4. Connect from Claude Code

Add to your MCP config:

```json
{
  "mcpServers": {
    "rex": {
      "type": "url",
      "url": "https://your-project.vercel.app/mcp"
    }
  }
}
```

## Local Development

```bash
npm install
cp .env.example .env.local  # Add your REX_API_KEY
npm run dev
```

Test with MCP Inspector:
```bash
npx @modelcontextprotocol/inspector
```

## API Details

- **Base URL**: `https://api.retailexpress.com.au/v2.1/`
- **Auth**: Two-step token flow (API key -> Bearer token, 60min expiry)
- **Rate limits**: 300 requests/minute, 100K/day
- **Pagination**: All list tools support `page_number` and `page_size` (max 250)
- **Dates**: Sydney AEST/AEDT timezone (ISO 8601)

## Architecture

```
app/api/[transport]/route.ts    # Vercel entry (mcp-handler)
src/
  services/rex-client.ts        # API client (auth, rate limiting)
  schemas/                      # Zod input schemas per domain
  tools/                        # Tool registrations per domain
  utils.ts                      # Response formatting
  constants.ts                  # Config values
```

Token management is automatic (lazy acquire, proactive refresh, 401 retry). Rate limiting uses a sliding window with 295/min safety buffer.
