# Layout Components

Reusable layout components for consistent spacing and responsive design.

## Container

A responsive container component that constrains content width on ultrawide displays while remaining full-width on smaller screens.

### Industry Standards

The `Container` component defaults to **1280px max-width**, which is the most common standard across modern design systems:

| Design System | Max Width | Notes |
|--------------|-----------|-------|
| **Tailwind CSS** | 1280px | `max-w-7xl` - Most popular utility framework |
| **Material Design** | 1280px | Google's design system standard |
| **Bootstrap 5** | 1320px | `container-xxl` |
| **Chakra UI** | 1280px | `container.xl` |
| **Webflow (originals)** | 1280-1440px | Used in this project |

**Why 1280px?**
- ✅ Optimal reading line length (45-75 characters per line)
- ✅ Comfortable viewing distance on large displays
- ✅ Works well on most common screen sizes (1366px, 1920px, 2560px)
- ✅ Prevents content from stretching too wide on ultrawide displays (3440px+)

### Usage

```tsx
import { Container } from "@/components/layout";

// Default 1280px container
export default function Page() {
  return (
    <Container>
      <h1>Your content here</h1>
    </Container>
  );
}

// Wide container (1440px) for hero sections
export default function HeroSection() {
  return (
    <Container maxWidth="1440px">
      <div className="hero">Wide hero content</div>
    </Container>
  );
}

// Extra wide (1536px) for data tables
export default function Dashboard() {
  return (
    <Container maxWidth="1536px">
      <table>Large data table</table>
    </Container>
  );
}

// No constraint (full width) for special layouts
export default function FullWidth() {
  return (
    <Container maxWidth="none">
      <div>Edge-to-edge content</div>
    </Container>
  );
}

// With additional classes
export default function CustomPage() {
  return (
    <Container className="py-8 px-4">
      <div>Content with custom spacing</div>
    </Container>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Content to render inside container |
| `maxWidth` | `"1280px" \| "1440px" \| "1536px" \| "none"` | `"1280px"` | Maximum width of container |
| `className` | `string` | `""` | Additional Tailwind classes |

### Examples by Use Case

**Standard Content Pages:**
```tsx
<Container>  {/* 1280px - Default */}
  <article>Blog post content</article>
</Container>
```

**Marketing/Hero Sections:**
```tsx
<Container maxWidth="1440px">
  <div className="hero">Wide promotional content</div>
</Container>
```

**Data Tables/Dashboards:**
```tsx
<Container maxWidth="1536px">
  <table>Multi-column data table</table>
</Container>
```

**Full-Width Layouts:**
```tsx
<Container maxWidth="none">
  <div>Checkout with custom column splits</div>
</Container>
```

### Responsive Behavior

The container is fully responsive:
- **Mobile (< 768px):** Full width with natural padding
- **Tablet (768px - 1024px):** Full width with padding
- **Desktop (1024px - maxWidth):** Full width
- **Ultrawide (> maxWidth):** Constrained to maxWidth, centered

### Accessibility

- Uses semantic HTML (`<div>`)
- Maintains proper content hierarchy
- No accessibility barriers introduced

