/** Embeds content required by load external.
 * @param {Element} svg 
 */
async function embedLoadExternals(svg) {
    const elements = Array.from(
        svg.querySelectorAll("[necromax-load-external]")
    );

    await Promise.all(
        elements.map(async (el) => {
            const url = el.getAttribute("necromax-load-external");
            const content = await fetch(url).then(response => response.text());
            el.insertAdjacentHTML("beforeend", content);
            await embedSvgResources(el);
        })
    );
}

/** Embeds 
 * @param {Element} svg 
 */
async function embedSvgImages(svg) {

    const imageElements = svg.querySelectorAll('image[href], image[xlink\\:href]');

    for (const imageElement of imageElements) {
        const hrefAttr = imageElement.hasAttribute('href') ? 'href' : 'xlink:href';
        const currentHref = imageElement.getAttribute(hrefAttr);
        if (!currentHref || currentHref.startsWith('data:'))
            continue;

        try {
            const response = await fetch(currentHref);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const blob = await response.blob();
            const base64Data = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });

            imageElement.setAttribute(hrefAttr, base64Data);
        } catch (err) {
            console.error(`Failed to preload and embed asset: ${currentHref}`, err);
        }
    }
}

/** Embeds external svg resources.
 * @param {Element} svg
 */
export async function embedSvgResources(svg) {
    await Promise.all([
        embedSvgImages(svg),
        embedLoadExternals(svg)]
    );
}