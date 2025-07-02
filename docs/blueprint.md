# **App Name**: Codelits Studio Invoice Manager

## Core Features:

- Invoice Form: Simple form for creation of invoice with client and project information.
- Invoice list: Display a listing of the generated invoices.
- PDF Generation Tool: PDF generation of the created invoices. Invoices can be downloaded. This tool takes into account payment status and renders an appropriate watermark.
- AI-Powered Description Assistant: Automatically suggest similar line item descriptions for invoices based on previous entries using AI.
- Real-time Calculations: Calculates amounts and summaries, updating invoice details dynamically.
- Tax Toggles & Percent Inputs: Optional fields for VAT (with % input — e.g., 13%) and TDS (with % input — e.g., 1.5%)
- Invoice Status Tracking: The system should let you mark invoice as: Paid, Unpaid, Partial (with amount received input). Status will reflect on: Dashboard listing and PDF watermark ( “PAID”, “UNPAID”, “PARTIAL”)
- Branding and Company Profile: The invoice template should automatically use: Company logo, PAN, Address, and Footer notes (e.g., “Codelits Studio Pvt. Ltd. is a PAN registered company”). Either hardcode or manage via a company config JSON/db

## Style Guidelines:

- Primary color: Deep Indigo (#3F51B5) to evoke professionalism and trust.
- Background color: Light Gray (#ECEFF1) to ensure readability and reduce eye strain.
- Accent color: Teal (#009688) to highlight key actions and information, creating a fresh and modern look.
- Font: 'Inter', a sans-serif font, for both headlines and body text. This ensures a clean and modern look across the app.
- Use modern line icons for invoice actions (edit, download, send) for a clean interface.
- Emphasize clear visual hierarchy with distinct sections for invoice details, line items, and totals.