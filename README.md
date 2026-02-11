# rangeStringFilter (From-To Filter)

A Power BI custom visual that filters categorical period values using a **min/max dropdown range**.

## What This Visual Does

`rangeStringFilter` renders two controls:

- **Min Period** dropdown
- **Max Period** dropdown

When users choose a range, the visual applies a Power BI JSON filter (`In`) on the configured **Sorting Index** column so only values inside the selected range are kept.

## Repository Contents

```text
.
├─ assets/
│  └─ icon.png
├─ src/
│  ├─ visual.ts          # Power BI visual entry point and filter application
│  ├─ component.tsx      # React range filter UI (two dropdown controls)
│  └─ settings.ts        # Formatting model and defaults
├─ style/
│  └─ visual.less        # Styling for the visual controls
├─ capabilities.json     # Roles, mappings, and formatting properties
├─ pbiviz.json           # Visual metadata and packaging config
├─ package.json          # Scripts and dependencies
└─ docs/
   ├─ preview.html       # Static HTML preview of expected UI
   └─ preview.css        # Styling for preview.html
```

## Data Roles

This visual expects two fields:

- **Period Text** (`category`): Text shown in dropdown options (for example, `Jan 2024`, `Q1 FY25`)
- **Sorting Index** (`sortIndex`): Numeric value used for ordering and filtering range logic

## How Filtering Works

1. The visual reads both roles from the categorical data view.
2. It builds unique options keyed by `sortIndex` and sorts them ascending.
3. Selecting `From` and `To` computes all indexes between those values.
4. A Power BI `BasicFilter` is applied with operator `In` on the `sortIndex` target column.

## Getting Started

### Prerequisites

- Node.js + npm
- Power BI Custom Visuals tools (`pbiviz`)

### Install

```bash
npm install
```

### Run in Development

```bash
npm run start
```

### Lint

```bash
npm run lint
```

### Build Package

```bash
npm run package
```

The packaged visual is generated in the `dist/` folder as a `.pbiviz` file.

## Using the Visual in Power BI

1. Import the generated `.pbiviz` file in Power BI Desktop.
2. Add `From-To Filter` to your report canvas.
3. Map fields:
   - `Period Text` -> your display label field
   - `Sorting Index` -> numeric order/index field
4. Select min/max values from dropdowns to filter visuals on the page.

## Formatting Options

The visual exposes formatting cards for:

- **Labels**: label text, font family, font size, label color
- **Controls**: value font, colors, border, radius, control height
- **Layout**: icon visibility, control width, spacing, container padding/background

## UI Preview (HTML/CSS Mock)

To preview the expected appearance outside Power BI, open:

- `docs/preview.html`

This file is a static mock for visual guidance and does not apply actual Power BI filters.

## Notes

- `Sorting Index` must be numeric for correct range behavior.
- If multiple rows share the same index, the first label encountered is used.
- If no filter is selected, the visual defaults to the full available range.
