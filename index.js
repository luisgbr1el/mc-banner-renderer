const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const COLORS = {
    white: [249, 255, 254],
    orange: [249, 128, 29],
    magenta: [199, 78, 189],
    light_blue: [58, 179, 218],
    yellow: [254, 216, 61],
    lime: [128, 199, 31],
    pink: [243, 139, 170],
    gray: [71, 79, 82],
    light_gray: [157, 157, 151],
    cyan: [22, 156, 156],
    purple: [137, 50, 184],
    blue: [60, 68, 170],
    brown: [131, 84, 50],
    green: [94, 124, 22],
    red: [176, 46, 38],
    black: [29, 29, 33]
};

const PATTERNS = {
    bs: 'stripe_bottom',
    ts: 'stripe_top',
    ls: 'stripe_left',
    rs: 'stripe_right',
    cs: 'stripe_center',
    ms: 'stripe_middle',
    drs: 'stripe_downright',
    dls: 'stripe_downleft',
    ss: 'small_stripes',
    cr: 'cross',
    sc: 'straight_cross',
    bt: 'triangle_bottom',
    tt: 'triangle_top',
    bts: 'triangles_bottom',
    tts: 'triangles_top',
    ld: 'diagonal_left',
    rd: 'diagonal_up_left',
    lud: 'diagonal_up_right',
    rud: 'diagonal_right',
    mc: 'circle',
    mr: 'rhombus',
    vh: 'half_vertical',
    hh: 'half_horizontal',
    vhr: 'half_vertical_right',
    hhb: 'half_horizontal_bottom',
    bl: 'square_bottom_left',
    br: 'square_bottom_right',
    tl: 'square_top_left',
    tr: 'square_top_right',
    bo: 'border',
    cbo: 'curly_border',
    bri: 'bricks',
    gra: 'gradient',
    gru: 'gradient_up',
    cre: 'creeper',
    sku: 'skull',
    flo: 'flower',
    moj: 'mojang',
    glb: 'globe',
    pig: 'piglin',
    flw: 'flow',
    gus: 'guster'
};

const PATTERN_NAMES = {
    'STRIPE_BOTTOM': 'stripe_bottom',
    'STRIPE_TOP': 'stripe_top',
    'STRIPE_LEFT': 'stripe_left',
    'STRIPE_RIGHT': 'stripe_right',
    'STRIPE_CENTER': 'stripe_center',
    'STRIPE_MIDDLE': 'stripe_middle',
    'STRIPE_DOWNRIGHT': 'stripe_downright',
    'STRIPE_DOWNLEFT': 'stripe_downleft',
    'SMALL_STRIPES': 'small_stripes',
    'CROSS': 'cross',
    'STRAIGHT_CROSS': 'straight_cross',
    'TRIANGLE_BOTTOM': 'triangle_bottom',
    'TRIANGLE_TOP': 'triangle_top',
    'TRIANGLES_BOTTOM': 'triangles_bottom',
    'TRIANGLES_TOP': 'triangles_top',
    'DIAGONAL_LEFT': 'diagonal_left',
    'DIAGONAL_UP_LEFT': 'diagonal_up_left',
    'DIAGONAL_UP_RIGHT': 'diagonal_up_right',
    'DIAGONAL_RIGHT': 'diagonal_right',
    'CIRCLE': 'circle',
    'RHOMBUS': 'rhombus',
    'HALF_VERTICAL': 'half_vertical',
    'HALF_HORIZONTAL': 'half_horizontal',
    'HALF_VERTICAL_RIGHT': 'half_vertical_right',
    'HALF_HORIZONTAL_BOTTOM': 'half_horizontal_bottom',
    'SQUARE_BOTTOM_LEFT': 'square_bottom_left',
    'SQUARE_BOTTOM_RIGHT': 'square_bottom_right',
    'SQUARE_TOP_LEFT': 'square_top_left',
    'SQUARE_TOP_RIGHT': 'square_top_right',
    'BORDER': 'border',
    'CURLY_BORDER': 'curly_border',
    'BRICKS': 'bricks',
    'GRADIENT': 'gradient',
    'GRADIENT_UP': 'gradient_up',
    'CREEPER': 'creeper',
    'SKULL': 'skull',
    'FLOWER': 'flower',
    'MOJANG': 'mojang',
    'GLOBE': 'globe',
    'PIGLIN': 'piglin',
    'FLOW': 'flow',
    'GUSTER': 'guster'
};

function normalizeColor(colorName) {
    return colorName.toLowerCase();
}

function normalizePattern(patternName) {
    if (PATTERNS[patternName]) {
        return PATTERNS[patternName];
    }
    if (PATTERN_NAMES[patternName]) {
        return PATTERN_NAMES[patternName];
    }
    if (PATTERN_NAMES[patternName.toUpperCase()]) {
        return PATTERN_NAMES[patternName.toUpperCase()];
    }
    return null;
}

async function upscaleImage(imageBuffer, scale) {
    const { data, info } = await sharp(imageBuffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const newWidth = info.width * scale;
    const newHeight = info.height * scale;
    const newData = Buffer.alloc(newWidth * newHeight * 4);

    for (let y = 0; y < newHeight; y++) {
        for (let x = 0; x < newWidth; x++) {
            const srcX = Math.floor(x / scale);
            const srcY = Math.floor(y / scale);
            const srcIdx = (srcY * info.width + srcX) * 4;
            const dstIdx = (y * newWidth + x) * 4;

            newData[dstIdx] = data[srcIdx];
            newData[dstIdx + 1] = data[srcIdx + 1];
            newData[dstIdx + 2] = data[srcIdx + 2];
            newData[dstIdx + 3] = data[srcIdx + 3];
        }
    }

    return sharp(newData, {
        raw: {
            width: newWidth,
            height: newHeight,
            channels: 4
        }
    }).png().toBuffer();
}

async function applyColor(imageBuffer, color) {
    const { data, info } = await sharp(imageBuffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.round((data[i] * color[0]) / 255);
        data[i + 1] = Math.round((data[i + 1] * color[1]) / 255);
        data[i + 2] = Math.round((data[i + 2] * color[2]) / 255);
    }

    return sharp(data, {
        raw: {
            width: info.width,
            height: info.height,
            channels: 4
        }
    }).png().toBuffer();
}

async function renderBanner(baseColor = 'white', patterns = [], scale = 1) {
    const normalizedBaseColor = normalizeColor(baseColor);

    if (!COLORS[normalizedBaseColor]) {
        throw new Error(`Invalid base color: ${baseColor}`);
    }

    const BANNER_WIDTH = 64;
    const BANNER_HEIGHT = 64;

    const baseRGB = COLORS[normalizedBaseColor];
    let bannerBuffer = await sharp({
        create: {
            width: BANNER_WIDTH,
            height: BANNER_HEIGHT,
            channels: 4,
            background: { r: baseRGB[0], g: baseRGB[1], b: baseRGB[2], alpha: 1 }
        }
    }).png().toBuffer();

    for (const layer of patterns) {
        if (!layer.pattern || !layer.color) {
            throw new Error('Each pattern must have "pattern" and "color" properties');
        }

        const patternName = normalizePattern(layer.pattern);
        if (!patternName) {
            throw new Error(`Invalid pattern: ${layer.pattern}`);
        }

        const normalizedColor = normalizeColor(layer.color);
        const patternColor = COLORS[normalizedColor];
        if (!patternColor) {
            throw new Error(`Invalid color: ${layer.color}`);
        }

        const patternPath = path.join(__dirname, 'resources', 'patterns', `${patternName}.png`);

        if (!fs.existsSync(patternPath)) {
            throw new Error(`Pattern texture not found: ${patternPath}`);
        }

        const patternBuffer = fs.readFileSync(patternPath);
        const patternRGBA = await sharp(patternBuffer).ensureAlpha().toBuffer();
        const coloredPattern = await applyColor(patternRGBA, patternColor);

        bannerBuffer = await sharp(bannerBuffer)
            .composite([{ input: coloredPattern, blend: 'over' }])
            .png()
            .toBuffer();
    }

    const finalBanner = await sharp(bannerBuffer)
        .extract({ left: 1, top: 1, width: 20, height: 40 })
        .png()
        .toBuffer();

    if (scale > 1) {
        const upscaled = await upscaleImage(finalBanner, scale);
        return upscaled.toString('base64');
    }

    return finalBanner.toString('base64');
}

async function renderBannerItem(baseColor = 'white', patterns = [], scale = 1) {
    const bannerBase64 = await renderBanner(baseColor, patterns, 1);
    const bannerBuffer = Buffer.from(bannerBase64, 'base64');

    const { data: bannerData, info: bannerInfo } = await sharp(bannerBuffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

    const bannerWidth = 20;
    const bannerHeight = 40;
    const poleHeight = 2;
    const depth = 1;
    const itemWidth = bannerWidth + depth;
    const itemHeight = bannerHeight + poleHeight + depth;

    const canvas = Buffer.alloc(itemWidth * itemHeight * 4);
    canvas.fill(0);

    const setPixel = (x, y, r, g, b, a) => {
        if (x >= 0 && x < itemWidth && y >= 0 && y < itemHeight) {
            const idx = (y * itemWidth + x) * 4;
            canvas[idx] = r;
            canvas[idx + 1] = g;
            canvas[idx + 2] = b;
            canvas[idx + 3] = a;
        }
    };

    const poleWidth = 2;
    const poleStartX = Math.floor((itemWidth - poleWidth) / 2);

    for (let y = 0; y < poleHeight; y++) {
        for (let x = 0; x < poleWidth; x++) {
            setPixel(poleStartX + x, y, 131, 84, 50, 255);
        }
    }

    setPixel(poleStartX + poleWidth, 0, 115, 73, 43, 255);

    for (let y = 0; y < poleHeight; y++) {
        setPixel(poleStartX + poleWidth, y + 1, 98, 63, 37, 255);
    }

    const bannerStartY = poleHeight;

    for (let y = 0; y < bannerHeight; y++) {
        for (let x = 0; x < bannerWidth; x++) {
            const srcIdx = (y * bannerWidth + x) * 4;
            const r = bannerData[srcIdx];
            const g = bannerData[srcIdx + 1];
            const b = bannerData[srcIdx + 2];
            const a = bannerData[srcIdx + 3];

            if (a > 0) {
                setPixel(x, bannerStartY + y, r, g, b, a);
            }
        }
    }

    for (let y = 0; y < bannerHeight; y++) {
        const srcIdx = (y * bannerWidth + (bannerWidth - 1)) * 4;
        const r = Math.floor(bannerData[srcIdx] * 0.6);
        const g = Math.floor(bannerData[srcIdx + 1] * 0.6);
        const b = Math.floor(bannerData[srcIdx + 2] * 0.6);
        const a = bannerData[srcIdx + 3];

        if (a > 0) {
            setPixel(bannerWidth, bannerStartY + y + 1, r, g, b, a);
        }
    }

    for (let x = 0; x < bannerWidth; x++) {
        const srcIdx = ((bannerHeight - 1) * bannerWidth + x) * 4;
        const r = Math.floor(bannerData[srcIdx] * 0.8);
        const g = Math.floor(bannerData[srcIdx + 1] * 0.8);
        const b = Math.floor(bannerData[srcIdx + 2] * 0.8);
        const a = bannerData[srcIdx + 3];

        if (a > 0) {
            setPixel(x + 1, bannerStartY + bannerHeight, r, g, b, a);
        }
    }

    const result = await sharp(canvas, {
        raw: {
            width: itemWidth,
            height: itemHeight,
            channels: 4
        }
    }).png().toBuffer();

    if (scale > 1) {
        const upscaled = await upscaleImage(result, scale);
        return upscaled.toString('base64');
    }

    return result.toString('base64');
}

async function renderBannerDataURL(baseColor = 'white', patterns = [], scale = 1) {
    const base64 = await renderBanner(baseColor, patterns, scale);
    return `data:image/png;base64,${base64}`;
}

async function renderBannerItemDataURL(baseColor = 'white', patterns = [], scale = 1) {
    const base64 = await renderBannerItem(baseColor, patterns, scale);
    return `data:image/png;base64,${base64}`;
}

function getAvailableColors() {
    return Object.keys(COLORS);
}

function getAvailablePatterns() {
    return Object.keys(PATTERNS);
}

async function renderBannerFromJson(bannerJson, scale = 1) {
    const data = typeof bannerJson === 'string' ? JSON.parse(bannerJson) : bannerJson;
    return renderBanner(data.base_color, data.patterns || [], scale);
}

async function renderBannerItemFromJson(bannerJson, scale = 1) {
    const data = typeof bannerJson === 'string' ? JSON.parse(bannerJson) : bannerJson;
    return renderBannerItem(data.base_color, data.patterns || [], scale);
}

module.exports = {
    renderBanner,
    renderBannerDataURL,
    renderBannerItem,
    renderBannerItemDataURL,
    renderBannerFromJson,
    renderBannerItemFromJson,
    getAvailableColors,
    getAvailablePatterns,
    COLORS,
    PATTERNS
};
