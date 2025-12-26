# Minecraft Banner Renderer

A Node.js package that renders Minecraft banners (version 1.21) as 3D isometric items and returns them as PNG in base64 format.

## Features

**3D Isometric Rendering** - Renders banners as they appear in Minecraft inventory  
**All 16 Colors** - Supports all Minecraft dye colors  
**42 Patterns** - Includes all banner patterns from Minecraft 1.21  
**Upscaling** - Nearest neighbor upscaling for crisp pixel-perfect images  
**JSON Support** - Accepts Minecraft JSON format directly  
**Fast** - Uses Sharp for high-performance image processing

## Installation

```bash
npm install mc-banner-renderer
```

## Usage

### Basic Usage

```javascript
const { renderBannerItem, renderBannerItemFromJson } = require('mc-banner-renderer');

// Render a 3D banner item (with 8x upscale)
const banner = await renderBannerItem('red', [], 8);
// Returns: base64 string

// Render Creeper banner
const creeperBanner = await renderBannerItem('lime', [
    { pattern: 'mc', color: 'black' },
    { pattern: 'cre', color: 'black' }
], 8);

// Get Data URL for HTML
const dataURL = await renderBannerItemDataURL('white', [
    { pattern: 'bs', color: 'red' }
], 8);
// Returns: "data:image/png;base64,..."
```

### Minecraft JSON Format

```javascript
// Accept Minecraft's native JSON format
const minecraftJson = {
    "base_color": "WHITE",
    "patterns": [
        {"color": "LIME", "pattern": "STRIPE_LEFT"},
        {"color": "YELLOW", "pattern": "STRIPE_MIDDLE"},
        {"color": "CYAN", "pattern": "STRAIGHT_CROSS"}
    ]
};

const banner = await renderBannerItemFromJson(minecraftJson, 8);
```

## API

### `renderBannerItem(baseColor, patterns, scale)`

Renders a Minecraft banner as a 3D isometric item.

**Parameters:**
- `baseColor` (string): Base color (accepts `'white'`, `'WHITE'`, etc.)
- `patterns` (Array): Array of pattern objects `{ pattern: 'bs' or 'STRIPE_BOTTOM', color: 'red' or 'RED' }`
- `scale` (number, optional): Upscale factor (default: 1). Use 4-8 for high-res images

**Returns:** Promise<string> - Base64 PNG data

### `renderBannerItemFromJson(bannerJson, scale)`

Renders from Minecraft JSON format.

**Parameters:**
- `bannerJson` (Object|string): Minecraft banner JSON object or string
- `scale` (number, optional): Upscale factor (default: 1)

**Returns:** Promise<string> - Base64 PNG data

### `renderBanner(baseColor, patterns, scale)`

Renders a flat banner texture (20x40 pixels).

**Parameters:**
- Same as `renderBannerItem`

**Returns:** Promise<string> - Base64 PNG data

### Other Functions

- `renderBannerItemDataURL(baseColor, patterns, scale)` - Returns data URL with prefix
- `renderBannerDataURL(baseColor, patterns, scale)` - Returns flat banner as data URL
- `getAvailableColors()` - Returns array of color names
- `getAvailablePatterns()` - Returns array of pattern codes

## Colors

Accepts both **lowercase** and **UPPERCASE** formats:

```
white / WHITE
orange / ORANGE
magenta / MAGENTA
light_blue / LIGHT_BLUE
yellow / YELLOW
lime / LIME
pink / PINK
gray / GRAY
light_gray / LIGHT_GRAY
cyan / CYAN
purple / PURPLE
blue / BLUE
brown / BROWN
green / GREEN
red / RED
black / BLACK
```

## Patterns

Accepts **short codes** or **Minecraft format** (UPPERCASE with underscores):

| Short Code | Minecraft Format | Pattern Name |
|------------|------------------|--------------|
| `bs` | `STRIPE_BOTTOM` | Stripe Bottom |
| `ts` | `STRIPE_TOP` | Stripe Top |
| `ls` | `STRIPE_LEFT` | Stripe Left |
| `rs` | `STRIPE_RIGHT` | Stripe Right |
| `cs` | `STRIPE_CENTER` | Stripe Center |
| `ms` | `STRIPE_MIDDLE` | Stripe Middle |
| `drs` | `STRIPE_DOWNRIGHT` | Stripe Down Right |
| `dls` | `STRIPE_DOWNLEFT` | Stripe Down Left |
| `ss` | `SMALL_STRIPES` | Small Stripes |
| `cr` | `CROSS` | Cross |
| `sc` | `STRAIGHT_CROSS` | Straight Cross |
| `bt` | `TRIANGLE_BOTTOM` | Triangle Bottom |
| `tt` | `TRIANGLE_TOP` | Triangle Top |
| `bts` | `TRIANGLES_BOTTOM` | Triangles Bottom |
| `tts` | `TRIANGLES_TOP` | Triangles Top |
| `ld` | `DIAGONAL_LEFT` | Diagonal Left |
| `rd` | `DIAGONAL_UP_LEFT` | Diagonal Up Left |
| `lud` | `DIAGONAL_UP_RIGHT` | Diagonal Up Right |
| `rud` | `DIAGONAL_RIGHT` | Diagonal Right |
| `mc` | `CIRCLE` | Circle |
| `mr` | `RHOMBUS` | Rhombus |
| `vh` | `HALF_VERTICAL` | Half Vertical |
| `hh` | `HALF_HORIZONTAL` | Half Horizontal |
| `vhr` | `HALF_VERTICAL_RIGHT` | Half Vertical Right |
| `hhb` | `HALF_HORIZONTAL_BOTTOM` | Half Horizontal Bottom |
| `bl` | `SQUARE_BOTTOM_LEFT` | Square Bottom Left |
| `br` | `SQUARE_BOTTOM_RIGHT` | Square Bottom Right |
| `tl` | `SQUARE_TOP_LEFT` | Square Top Left |
| `tr` | `SQUARE_TOP_RIGHT` | Square Top Right |
| `bo` | `BORDER` | Border |
| `cbo` | `CURLY_BORDER` | Curly Border |
| `bri` | `BRICKS` | Bricks |
| `gra` | `GRADIENT` | Gradient |
| `gru` | `GRADIENT_UP` | Gradient Up |
| `cre` | `CREEPER` | Creeper |
| `sku` | `SKULL` | Skull |
| `flo` | `FLOWER` | Flower |
| `moj` | `MOJANG` | Mojang |
| `glb` | `GLOBE` | Globe |
| `pig` | `PIGLIN` | Piglin |
| `flw` | `FLOW` | Flow |
| `gus` | `GUSTER` | Guster |

## Examples

### Creeper Banner (High-Res)
```javascript
const banner = await renderBannerItem('lime', [
    { pattern: 'mc', color: 'black' },
    { pattern: 'cre', color: 'black' }
], 8); // 8x upscale for crisp display
```

### Pirate Flag
```javascript
const flag = await renderBannerItem('black', [
    { pattern: 'sku', color: 'white' }
], 8);
```

### Using Minecraft JSON
```javascript
const json = {
    "base_color": "RED",
    "patterns": [
        {"color": "WHITE", "pattern": "CROSS"},
        {"color": "BLACK", "pattern": "BORDER"}
    ]
};
const banner = await renderBannerItemFromJson(json, 8);
```

### Save to File
```javascript
const fs = require('fs');
const banner = await renderBannerItem('purple', [], 8);
fs.writeFileSync('banner.png', Buffer.from(banner, 'base64'));
```

## Output

- **Without scale**: 21x43 pixels (original size with 3D depth)
- **With scale 4**: 84x172 pixels
- **With scale 8**: 168x344 pixels (recommended for web)
- **Format**: PNG with transparency
- **Rendering**: Nearest neighbor (pixel-perfect, no blur)

## License

MIT
