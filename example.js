const { renderBannerItemFromJson } = require('./index');
const fs = require('fs');

async function examples() {
    const minecraftJson = {"base_color":"BLACK","patterns":[{"color":"YELLOW","pattern":"GRADIENT_UP"},{"color":"PURPLE","pattern":"GRADIENT"},{"color":"LIME","pattern":"MOJANG"}]}
    const jsonItemBanner = await renderBannerItemFromJson(minecraftJson, 8);
    fs.writeFileSync('banner.png', Buffer.from(jsonItemBanner, 'base64'));
}

examples().catch(console.error);
