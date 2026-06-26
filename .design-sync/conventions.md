# Keren Sarig Clinic UI — Design Conventions

## No provider needed
All components are self-contained. Import and render directly — no ThemeProvider, RouterProvider, or context wrapper required.

## Layout is RTL
The page has `direction: rtl` on `html`/`body`. Use RTL-aware Tailwind utilities (`start-*`, `end-*`, `ms-*`, `me-*`) for directional spacing, or explicit `right`/`left` when you need to break out of RTL.

## Two-layer styling idiom

**Layout → Tailwind utility classes** (from `_ds_bundle.css`):
```jsx
<div className="flex items-center gap-4 p-6 mt-8">
```
All standard Tailwind spacing, flex, grid, overflow, and typography utilities are available.

**Color → inline `style` props using the brand palette** (never Tailwind bg-*/text-* for brand colors — they're not in the theme):

| Role | Hex | When |
|---|---|---|
| Ink (primary text, dark bg) | `#1C2A24` | headings, dark surfaces, primary button |
| Moss | `#4A6B5C` | secondary actions, muted text, accents |
| Terracotta | `#C4634A` | destructive, highlight, seal elements |
| Cream | `#F5F1EA` | page background, light text on dark |
| Vellum | `#EBE4D6` | quiet button bg, card borders |

Example:
```jsx
<div style={{ background: '#F5F1EA', color: '#1C2A24' }}>
  <Button variant="primary">אישור</Button>
</div>
```

## Form inputs — always use `.field-input`
```jsx
<input className="field-input" placeholder="050-0000000" />
<textarea className="field-input" rows={3} />
```
This class wires the white bg, subtle border, focus ring, and Heebo font. Use `<FormField>` to wrap it with a label.

## Button API
```jsx
<Button variant="primary|moss|ghost|seal|quiet" size="sm|md|lg" pill disabled>
  label
</Button>
```
`pill` rounds to fully rounded; omit for squared (borderRadius: 2). Default size `md`, default variant `primary`.

## Brand typography
- **Serif headings**: `style={{ fontFamily: "'Frank Ruhl Libre', serif" }}` (loaded from Google Fonts at runtime)
- **Body / UI text**: Heebo — set globally, no class needed
- **Monospace / labels**: `style={{ fontFamily: "'JetBrains Mono', monospace" }}`

## A minimal idiomatic layout
```jsx
import { Button, FormField, Enso } from 'keren-sarig-ui'

export default function Card() {
  return (
    <div className="p-8 max-w-[400px] mx-auto" style={{ background: '#F5F1EA' }}>
      <div className="flex items-center gap-3 mb-8">
        <Enso size={36} />
        <div style={{ fontFamily: "'Frank Ruhl Libre', serif", fontSize: 22 }}>קרן שריג</div>
      </div>
      <FormField label="שם מלא" required>
        <input className="field-input" placeholder="ישראל ישראלי" />
      </FormField>
      <div className="mt-6">
        <Button variant="primary" pill className="w-full">המשך ←</Button>
      </div>
    </div>
  )
}
```
