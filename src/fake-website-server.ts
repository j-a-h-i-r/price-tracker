import { randomInt } from 'crypto';
import Fastify, { type FastifyInstance } from 'fastify';

const fastify: FastifyInstance = Fastify({
    logger: true
});

const numberOfPages = 1;
const productsPerPage = 20;

function generateProducts(page: number, website: string) {
    const pageOffset = (page - 1) * productsPerPage;
    return Array.from({ length: productsPerPage }, (_, i) => ({
        name: `Laptop Model ${ pageOffset + i + 1}`,
        price: Math.floor(Math.random() * 100000) + 20000, // Random price between 20,000 and 120,000
        image: `https://example.com/laptop-${pageOffset + i + 1}.jpg`,
        url: `http://localhost:5555/${website}/laptop-model-${pageOffset + i + 1}`,
        slug: `laptop-model-${pageOffset + i + 1}`
    }));
}

// HTML template
const generateStartechListingPage = (page: number) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Laptop - Notebook Price in BD | Star Tech</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 20px;
                }
                .product-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 20px;
                    margin-top: 20px;
                }
                .product-card {
                    border: 1px solid #ddd;
                    padding: 15px;
                    text-align: center;
                }
                .product-card img {
                    max-width: 100%;
                    height: auto;
                }
                .product-name {
                    margin: 10px 0;
                    font-size: 14px;
                }
                .product-price {
                    color: #ef4a23;
                    font-weight: bold;
                    font-size: 16px;
                }
                h1 {
                    color: #333;
                    font-size: 24px;
                }
            </style>
        </head>
        <body>
            <h1>Laptop - Notebook</h1>
            <div class="product-grid">
                ${generateProducts(page, 'startech').map(laptop => `
                    <div class="product-card">
                        <a href="http://localhost:5555/${laptop.slug}">
                            <img src="${laptop.image}" alt="${laptop.name}">
                            <h3 class="product-name">${laptop.name}</h3>
                            <div class="product-price">৳ ${laptop.price}</div>
                        </a>
                    </div>
                    <div class="p-item">
                        <div class="p-item-inner">
                            <div class="p-item-img">
                                <a href="${laptop.url}">
                                    <img src="${laptop.image}" alt="${laptop.name}" width="228" height="228">
                            </a></div>
                            <div class="p-item-details">
                                <h4 class="p-item-name"> <a href="${laptop.url}">
                                ${laptop.name}
                                </a></h4>
                                <div class="short-description">
                                    
                                </div>
                                <div class="p-item-price">
                                    <span>44,500৳</span>                      </div>
                                                        <div class="actions">
                                                                <span class="st-btn btn-add-cart" type="button" onclick="cart.add('38121', '1');"><i class="material-icons">shopping_cart</i> Buy Now</span>
                                                                <span class="st-btn btn-compare" onclick="compare.add('38121');"><i class="material-icons">library_add</i>Add to Compare</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="bottom-bar">
                <div class="row">
                    <div class="col-md-6 col-sm-12">
                        <ul class="pagination">
                            <li><span class="disabled">PREV</span>
                            </li><li class="active"><span>1</span></li>
                            <li><a href="https://www.startech.com.bd/laptop-notebook/laptop?page=2">2</a></li>
                            <li><a href="https://www.startech.com.bd/laptop-notebook/laptop?page=3">3</a></li>
                            <li><a href="https://www.startech.com.bd/laptop-notebook/laptop?page=4">4</a></li>
                            <li><a href="https://www.startech.com.bd/laptop-notebook/laptop?page=5">5</a></li>
                            <li><a href="https://www.startech.com.bd/laptop-notebook/laptop?page=6">6</a></li>
                            <li><a href="https://www.startech.com.bd/laptop-notebook/laptop?page=7">7</a></li>
                            <li><a href="https://www.startech.com.bd/laptop-notebook/laptop?page=8">8</a></li>
                            <li><a href="https://www.startech.com.bd/laptop-notebook/laptop?page=9">9</a></li>
                            <li><a href="https://www.startech.com.bd/laptop-notebook/laptop?page=2">NEXT</a></li>
                            </ul>              </div>
                    <div class="col-md-6 rs-none text-right">
                        <p>Showing 1 to 20 of 542 (${numberOfPages} Pages)</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
};

const generateTechlandListingPage = (page: number) => {
    return `
        <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Laptop - Notebook Price in BD | Star Tech</title>
    </head>

    <body>
        <div id="content">
            <div class="category-description">
            </div>

            <div class="main-products-wrapper">
                <div class="main-products product-grid">
                    ${generateProducts(page, 'techland').map(laptop => `
                        <div class="product-layout  has-extra-button">
                        <div class="product-thumb">
                            <div class="caption">
                                <div class="name"><a
                                        href="${laptop.url}">
                                        ${laptop.name}</a></div>
                                <div class="description">A4TECH BLOODY B135N NEON RGB GAMING KEYBOARD&nbsp;IN
                                    BANGLADESHAdjustable BacklightsLighting Effects: FN + F12 ( Solid / Breathing / Off )
                                    Brightness: FN + ↑ / ↓Game ModePress Fn + F8 will disable "Wi..</div>

                                <!-- Start Special Offers modification -->

                                <!-- End Special Offers modification -->
                                <div class="price">
                                    <div>
                                        <span class="price-new">${laptop.price}৳</span> <span class="price-old">1,800৳</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `).join('')}
                </div>
                <div class="row pagination-results">
                    <div class="col-sm-6 text-left">
                        <ul class="pagination">
                            <li class="active"><span>1</span></li>
                            <li><a href="https://www.techlandbd.com/accessories/computer-keyboard?page=2">2</a></li>
                            <li><a href="https://www.techlandbd.com/accessories/computer-keyboard?page=3">3</a></li>
                            <li><a href="https://www.techlandbd.com/accessories/computer-keyboard?page=4">4</a></li>
                            <li><a href="https://www.techlandbd.com/accessories/computer-keyboard?page=5">5</a></li>
                            <li><a href="https://www.techlandbd.com/accessories/computer-keyboard?page=6">6</a></li>
                            <li><a href="https://www.techlandbd.com/accessories/computer-keyboard?page=7">7</a></li>
                            <li><a href="https://www.techlandbd.com/accessories/computer-keyboard?page=8">8</a></li>
                            <li><a href="https://www.techlandbd.com/accessories/computer-keyboard?page=9">9</a></li>
                            <li><a href="https://www.techlandbd.com/accessories/computer-keyboard?page=2"
                                    class="next">&gt;</a></li>
                            <li><a href="https://www.techlandbd.com/accessories/computer-keyboard?page=${numberOfPages}">&gt;|</a></li>
                        </ul>
                    </div>
                    <div class="col-sm-6 text-right">Showing 1 to 20 of 1013 (51 Pages)</div>
                </div>
            </div>
        </div>
    </body>

    </html>`;
};

// Routes
fastify.get('/startech', async (request, reply) => {
    const { page } = request.query as { page: string | undefined };
    const currentPage = page ? parseInt(page, 10) : 1;
    reply.type('text/html').send(generateStartechListingPage(currentPage));
});

// Routes
fastify.get('/techland', async (request, reply) => {
    const { page } = request.query as { page: string | undefined };
    const currentPage = page ? parseInt(page, 10) : 1;
    reply.type('text/html').send(generateTechlandListingPage(currentPage));
});

// Individual product routes
fastify.get('/startech/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const productHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${slug}</title>
        </head>
        <body>
            <div class="product-detail">
                <h1>${slug}</h1>
                <p class="price">৳ ${randomInt(10000) + 10}</p>
            </div>
            <section class="specification-tab m-tb-10" id="specification">
                <div class="section-head">
                    <h2>Specification</h2>
                </div>
                <table class="data-table flex-table" cellpadding="0" cellspacing="0">
                    <colgroup>
                        <col class="name">
                        <col class="value">
                    </colgroup>
                            <thead>
                    <tr>
                        <td class="heading-row" colspan="3">Processor</td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td class="name">Processor Brand</td><td class="value">Intel</td>
                    </tr><tr>
                        <td class="name">Processor Model</td><td class="value">Core i7-1255U</td>
                    </tr><tr>
                        <td class="name">Generation</td><td class="value">12th Gen</td>
                    </tr><tr>
                        <td class="name">Processor Frequency</td><td class="value">3.50 GHz, up to 4.70 GHz</td>
                    </tr><tr>
                        <td class="name">Processor Core</td><td class="value">10</td>
                    </tr><tr>
                        <td class="name">Processor Thread</td><td class="value">12</td>
                    </tr><tr>
                        <td class="name">CPU Cache</td><td class="value">12MB</td>
                    </tr>        </tbody>
                            <thead>
                    <tr>
                        <td class="heading-row" colspan="3">Display</td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td class="name">Display Size</td><td class="value">13 Inch</td>
                    </tr><tr>
                        <td class="name">Display Type</td><td class="value">PixelSense Flow MultiTouch Display</td>
                    </tr><tr>
                        <td class="name">Display Resolution</td><td class="value">2880 X 1920 (267 PPI)</td>
                    </tr><tr>
                        <td class="name">Touch Screen</td><td class="value">10 point multi-touch</td>
                    </tr><tr>
                        <td class="name">Refresh Rate</td><td class="value">Up to 120Hz</td>
                    </tr><tr>
                        <td class="name">Display Features</td><td class="value">Color profile: sRGB and Vivid Refresh rate up to 120Hz (Dynamic refresh rate supported)<br>
            Aspect ratio: 3:2<br>
            Contrast ratio: 1200:1</td>
                    </tr>        </tbody>
                            <thead>
                    <tr>
                        <td class="heading-row" colspan="3">Memory</td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td class="name">RAM</td><td class="value">16GB</td>
                    </tr><tr>
                        <td class="name">RAM Type</td><td class="value">LPDDR4x</td>
                    </tr>        </tbody>
                            <thead>
                    <tr>
                        <td class="heading-row" colspan="3">Storage</td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td class="name">Storage Type</td><td class="value">SSD</td>
                    </tr><tr>
                        <td class="name">Storage Capacity</td><td class="value">512GB</td>
                    </tr><tr>
                        <td class="name">Extra M.2 Slot</td><td class="value">N/A</td>
                    </tr>        </tbody>
                            <thead>
                    <tr>
                        <td class="heading-row" colspan="3">Graphics</td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td class="name">Graphics Model</td><td class="value">Intel Iris Xe Graphics</td>
                    </tr><tr>
                        <td class="name">Graphics Memory</td><td class="value">Shared</td>
                    </tr><tr>
                        <td class="name">Graphics Type</td><td class="value">Integrated</td>
                    </tr>        </tbody>
                            <thead>
                    <tr>
                        <td class="heading-row" colspan="3">Keyboard &amp; TouchPad</td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td class="name">TouchPad</td><td class="value">Yes</td>
                    </tr>        </tbody>
                            <thead>
                    <tr>
                        <td class="heading-row" colspan="3">Camera &amp; Audio</td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td class="name">WebCam</td><td class="value">Front-facing camera with 1080p full HD video<br>
            10.0MP rear-facing autofocus camera with 1080p HD and 4k video</td>
                    </tr><tr>
                        <td class="name">Speaker</td><td class="value">Stereo speakers</td>
                    </tr><tr>
                        <td class="name">Microphone</td><td class="value">Dual 2W microphones</td>
                    </tr><tr>
                        <td class="name">Audio Features</td><td class="value">Dolby Atmos</td>
                    </tr>        </tbody>
                            <thead>
                    <tr>
                        <td class="heading-row" colspan="3">Ports &amp; Slots</td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td class="name">Optical Drive</td><td class="value">N/A</td>
                    </tr><tr>
                        <td class="name">Card Reader</td><td class="value">N/A</td>
                    </tr><tr>
                        <td class="name">USB Type-C / Thunderbolt Port</td><td class="value">2 x USB-C with USB 4.0/ Thunderbolt 4</td>
                    </tr>        </tbody>
                            <thead>
                    <tr>
                        <td class="heading-row" colspan="3">Network &amp; Connectivity</td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td class="name">LAN</td><td class="value">N/A</td>
                    </tr><tr>
                        <td class="name">WiFi</td><td class="value">Wi-Fi 6E (802.11ax); Tri-Band (2.4, 5, &amp; 6 GHz)</td>
                    </tr><tr>
                        <td class="name">Bluetooth</td><td class="value">Bluetooth Wireless 5.1 technology</td>
                    </tr>        </tbody>
                            <thead>
                    <tr>
                        <td class="heading-row" colspan="3">Security</td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td class="name">Fingerprint Sensor</td><td class="value">N/A</td>
                    </tr>        </tbody>
                            <thead>
                    <tr>
                        <td class="heading-row" colspan="3">Software</td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td class="name">Operating System</td><td class="value">Windows 11 Home</td>
                    </tr>        </tbody>
                            <thead>
                    <tr>
                        <td class="heading-row" colspan="3">Power</td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td class="name">Battery Type</td><td class="value">Integrated</td>
                    </tr><tr>
                        <td class="name">Battery Capacity</td><td class="value">47.7 Wh</td>
                    </tr><tr>
                        <td class="name">Backup Time (Approx)</td><td class="value">Up to 15.5 hours of typical device usage</td>
                    </tr>        </tbody>
                            <thead>
                    <tr>
                        <td class="heading-row" colspan="3">Physical Specification</td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td class="name">Color</td><td class="value">Graphite</td>
                    </tr><tr>
                        <td class="name">Dimensions</td><td class="value">11.3 x 8.2 x 0.4" / 287 x 209 x 9.3 mm</td>
                    </tr><tr>
                        <td class="name">Weight</td><td class="value">1.9 lb / 883 g</td>
                    </tr>        </tbody>
                            <thead>
                    <tr>
                        <td class="heading-row" colspan="3">Other Features</td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td class="name">Other Features</td><td class="value">Sensors: <br>
            Accelerometer<br>
            Gyroscope<br>
            Magnetometer<br>
            Ambient Color sensor</td>
                    </tr>        </tbody>
                            <thead>
                    <tr>
                        <td class="heading-row" colspan="3">Warranty</td>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td class="name">Warranty Details</td><td class="value">1-year</td>
                    </tr>        </tbody>
                        </table>
            </section>
        </body>
        </html>
    `;

    reply.type('text/html').send(productHTML);
});

// Individual product routes
fastify.get('/techland/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };

    const productHTML = `
    <!DOCTYPE html>
<html dir="ltr" lang="en"
    class="desktop win chrome chrome63 webkit oc30 is-guest route-product-product product-40184 store-0 skin-1 desktop-header-active mobile-sticky layout-2 flexbox no-touchevents"
    data-jb="45643a14" data-jv="3.1.12" data-ov="3.0.3.8">

<body class="">
    <div class="site-wrapper">
        <div id="product-product" class="container">
            <div class="row">
                <div id="content" class="">

                    <div class="product-info has-extra-button ">
                        <div class="product-left">
                            <div class="product-image direction-vertical position-left additional-images-loaded">
                                <div class="swiper main-image swiper-has-pages"
                                    data-options="{&quot;speed&quot;:0,&quot;autoplay&quot;:false,&quot;pauseOnHover&quot;:false,&quot;loop&quot;:false}"
                                    style="width: calc(100% - 80px)">
                                    <div
                                        class="swiper-container swiper-container-initialized swiper-container-horizontal">
                                        <div class="swiper-wrapper" style="transform: translate3d(0px, 0px, 0px);">
                                            <div class="swiper-slide swiper-slide-visible swiper-slide-active"
                                                data-gallery=".lightgallery-product-images" data-index="0"
                                                style="width: 416px;">
                                                <img src="https://www.techlandbd.com/image/cache/catalog/Fantech/fantech-atom-pro96-mk914-rgb-keyboard-saturn-550x550.jpg"
                                                    srcset="https://www.techlandbd.com/image/cache/catalog/Fantech/fantech-atom-pro96-mk914-rgb-keyboard-saturn-550x550.jpg 1x, https://www.techlandbd.com/image/cache/catalog/Fantech/fantech-atom-pro96-mk914-rgb-keyboard-saturn-1100x1100.jpg 2x"
                                                    data-largeimg="https://www.techlandbd.com/image/cache/catalog/Fantech/fantech-atom-pro96-mk914-rgb-keyboard-saturn-1000x1000.jpg"
                                                    alt="Fantech Atom63 MK874 V2 MIZU RGB Mechanical Gaming Keyboard (Sky Blue)"
                                                    title="Fantech Atom63 MK874 V2 MIZU RGB Mechanical Gaming Keyboard (Sky Blue)"
                                                    width="550" height="550">
                                            </div>
                                            <div class="swiper-slide swiper-slide-next"
                                                data-gallery=".lightgallery-product-images" data-index="1"
                                                style="width: 416px;">
                                                <img src="https://www.techlandbd.com/image/cache/catalog/Fantech/fantech-atom-pro96-mk914-rgb-keyboard-saturn-1-550x550.jpg"
                                                    srcset="https://www.techlandbd.com/image/cache/catalog/Fantech/fantech-atom-pro96-mk914-rgb-keyboard-saturn-1-550x550.jpg 1x, https://www.techlandbd.com/image/cache/catalog/Fantech/fantech-atom-pro96-mk914-rgb-keyboard-saturn-1-1100x1100.jpg 2x"
                                                    data-largeimg="https://www.techlandbd.com/image/cache/catalog/Fantech/fantech-atom-pro96-mk914-rgb-keyboard-saturn-1-1000x1000.jpg"
                                                    alt="Fantech Atom63 MK874 V2 MIZU RGB Mechanical Gaming Keyboard (Sky Blue)"
                                                    title="Fantech Atom63 MK874 V2 MIZU RGB Mechanical Gaming Keyboard (Sky Blue)"
                                                    width="550" height="550" loading="lazy">
                                            </div>
                                        </div>
                                        <span class="swiper-notification" aria-live="assertive"
                                            aria-atomic="true"></span>
                                    </div>
                                    <div class="swiper-controls">
                                        <div class="swiper-buttons">
                                            <div class="swiper-button-prev swiper-button-disabled" tabindex="0"
                                                role="button" aria-label="Previous slide" aria-disabled="true"></div>
                                            <div class="swiper-button-next" tabindex="0" role="button"
                                                aria-label="Next slide" aria-disabled="false"></div>
                                        </div>
                                        <div
                                            class="swiper-pagination swiper-pagination-clickable swiper-pagination-bullets">
                                            <span class="swiper-pagination-bullet swiper-pagination-bullet-active"
                                                tabindex="0" role="button" aria-label="Go to slide 1"></span><span
                                                class="swiper-pagination-bullet" tabindex="0" role="button"
                                                aria-label="Go to slide 2"></span>
                                        </div>
                                    </div>
                                    <div class="product-labels">
                                        <span class="product-label product-label-233 product-label-default"><b>Save:
                                                500৳</b></span>
                                    </div>


                                </div>
                                <div class="swiper additional-images"
                                    data-options="{&quot;slidesPerView&quot;:&quot;auto&quot;,&quot;spaceBetween&quot;:0,&quot;direction&quot;:&quot;vertical&quot;}"
                                    style="width: 80px; height: 421px;">
                                    <div
                                        class="swiper-container swiper-container-initialized swiper-container-vertical">
                                        <div class="swiper-wrapper"
                                            style="transition-duration: 0ms; transform: translate3d(0px, 0px, 0px);">
                                            <div class="swiper-slide additional-image swiper-slide-visible swiper-slide-active"
                                                data-index="0">
                                                <img src="https://www.techlandbd.com/image/cache/catalog/Fantech/fantech-atom-pro96-mk914-rgb-keyboard-saturn-80x80.jpg"
                                                    srcset="https://www.techlandbd.com/image/cache/catalog/Fantech/fantech-atom-pro96-mk914-rgb-keyboard-saturn-80x80.jpg 1x, https://www.techlandbd.com/image/cache/catalog/Fantech/fantech-atom-pro96-mk914-rgb-keyboard-saturn-160x160.jpg 2x"
                                                    alt="Fantech Atom63 MK874 V2 MIZU RGB Mechanical Gaming Keyboard (Sky Blue)"
                                                    title="Fantech Atom63 MK874 V2 MIZU RGB Mechanical Gaming Keyboard (Sky Blue)"
                                                    width="80" height="80">
                                            </div>
                                            <div class="swiper-slide additional-image swiper-slide-visible swiper-slide-next"
                                                data-index="1">
                                                <img src="https://www.techlandbd.com/image/cache/catalog/Fantech/fantech-atom-pro96-mk914-rgb-keyboard-saturn-1-80x80.jpg"
                                                    srcset="https://www.techlandbd.com/image/cache/catalog/Fantech/fantech-atom-pro96-mk914-rgb-keyboard-saturn-1-80x80.jpg 1x, https://www.techlandbd.com/image/cache/catalog/Fantech/fantech-atom-pro96-mk914-rgb-keyboard-saturn-1-160x160.jpg 2x"
                                                    alt="Fantech Atom63 MK874 V2 MIZU RGB Mechanical Gaming Keyboard (Sky Blue)"
                                                    title="Fantech Atom63 MK874 V2 MIZU RGB Mechanical Gaming Keyboard (Sky Blue)"
                                                    width="80" height="80" loading="lazy">
                                            </div>
                                        </div>
                                        <span class="swiper-notification" aria-live="assertive"
                                            aria-atomic="true"></span>
                                    </div>
                                    <div class="swiper-buttons">
                                        <div class="swiper-button-prev swiper-button-disabled" tabindex="0"
                                            role="button" aria-label="Previous slide" aria-disabled="true"></div>
                                        <div class="swiper-button-next swiper-button-disabled" tabindex="0"
                                            role="button" aria-label="Next slide" aria-disabled="true"></div>
                                    </div>
                                    <div
                                        class="swiper-pagination swiper-pagination-clickable swiper-pagination-bullets">
                                        <span class="swiper-pagination-bullet swiper-pagination-bullet-active"
                                            tabindex="0" role="button" aria-label="Go to slide 1"></span>
                                    </div>
                                </div>
                            </div>
                            <div class="lightgallery lightgallery-product-images"
                                data-images="[{&quot;src&quot;:&quot;https:\/\/www.techlandbd.com\/image\/cache\/catalog\/Fantech\/fantech-atom-pro96-mk914-rgb-keyboard-saturn-1000x1000.jpg&quot;,&quot;thumb&quot;:&quot;https:\/\/www.techlandbd.com\/image\/cache\/catalog\/Fantech\/fantech-atom-pro96-mk914-rgb-keyboard-saturn-80x80.jpg&quot;,&quot;subHtml&quot;:&quot;Fantech Atom63 MK874 V2 MIZU RGB Mechanical Gaming Keyboard (Sky Blue)&quot;},{&quot;src&quot;:&quot;https:\/\/www.techlandbd.com\/image\/cache\/catalog\/Fantech\/fantech-atom-pro96-mk914-rgb-keyboard-saturn-1-1000x1000.jpg&quot;,&quot;thumb&quot;:&quot;https:\/\/www.techlandbd.com\/image\/cache\/catalog\/Fantech\/fantech-atom-pro96-mk914-rgb-keyboard-saturn-1-80x80.jpg&quot;,&quot;subHtml&quot;:&quot;Fantech Atom63 MK874 V2 MIZU RGB Mechanical Gaming Keyboard (Sky Blue)&quot;}]"
                                data-options="{&quot;thumbWidth&quot;:80,&quot;thumbConHeight&quot;:80,&quot;addClass&quot;:&quot;lg-product-images&quot;,&quot;mode&quot;:&quot;lg-slide&quot;,&quot;download&quot;:true,&quot;fullScreen&quot;:false}">
                            </div>
                        </div>
                        <div class="product-right">






                            <div id="product" class="product-details">
                                <table class="table table-bordered">
                                    <tbody>
                                    </tbody>
                                    <caption>
                                        <div class="title page-title" style="text-align: left;">
                                            <h1>Fantech Atom63 MK874 V2 MIZU RGB Mechanical Gaming Keyboard (Sky Blue)
                                            </h1>
                                        </div>
                                    </caption>


                                    <tbody>
                                        <tr>
                                            <td>product price</td>
                                            <td>
                                                2,800৳
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>special price</td>
                                            <td>2,300৳</td>
                                        </tr>

                                        <tr>
                                            <td>Stock Status<br></td>
                                            <td>In Stock<br></td>
                                        </tr>

                                        <tr>
                                            <td>Product ID<br></td>
                                            <td>40184<br></td>
                                        </tr>



                                        <tr>
                                            <td>Brand<br></td>
                                            <td><a href="https://www.techlandbd.com/fantech">Fantech</a><br></td>
                                        </tr>
                                        <tr>
                                            <td>Product model</td>
                                            <td>Atom63 MK874V2<br></td>
                                        </tr>
                                        <tr>
                                            <td>Warranty </td>
                                            <td>1 Year<br></td>
                                        </tr>
                                        <tr>
                                            <td>Total Reviews<br></td>
                                            <td class="review-links">
                                                <a>Based on 0 reviews.</a>
                                                <b>-</b>
                                                <a>Write a review</a>

                                            </td>
                                        </tr>

                                    </tbody>
                                </table>



















                                <div class="rating rating-page">
                                    <div class="rating-stars">
                                        <span class="fa fa-stack">
                                            <i class="fa fa-star-o fa-stack-1x"></i>
                                        </span> <span class="fa fa-stack">
                                            <i class="fa fa-star-o fa-stack-1x"></i>
                                        </span> <span class="fa fa-stack">
                                            <i class="fa fa-star-o fa-stack-1x"></i>
                                        </span> <span class="fa fa-stack">
                                            <i class="fa fa-star-o fa-stack-1x"></i>
                                        </span> <span class="fa fa-stack">
                                            <i class="fa fa-star-o fa-stack-1x"></i>
                                        </span>
                                    </div>
                                    <div class="review-links">
                                        <a>Based on 0 reviews.</a>
                                        <b>-</b>
                                        <a>Write a review</a>
                                    </div>
                                </div>
                                <!-- start Special Offer Info -->

                                <div class="product-special-info">
                                    <div class="special_offer_timer">

                                        <!-- <div class="continuous"><div>Continuous offer</div></div> -->

                                    </div>
                                </div>
                                <!-- end Special Offer Info -->



                                <div class="product-price-group">
                                    <div class="price-wrapper">


                                        <div class="price-group">

                                            <div class="product-price-new">2,300৳</div>
                                            <div class="product-price-old">2,800৳</div>
                                        </div>


                                    </div>

                                </div>

                                <div class="button-group-page">
                                    <div class="buttons-wrapper">

                                        <div class="stepper-group cart-group">
                                            <div class="stepper">
                                                <label class="control-label" for="product-quantity">Qty</label>
                                                <input id="product-quantity" type="text" name="quantity" value="1"
                                                    data-minimum="1" class="form-control">
                                                <input id="product-id" type="hidden" name="product_id" value="40184">
                                                <span>
                                                    <i class="fa fa-angle-up"></i>
                                                    <i class="fa fa-angle-down"></i>
                                                </span>
                                            </div>
                                            <a id="button-cart"
                                                data-loading-text="&lt;span class='btn-text'&gt;Add to Cart&lt;/span&gt;"
                                                class="btn btn-cart"><span class="btn-text">Add to Cart</span></a>
                                            <div class="extra-group">
                                                <a class="btn btn-extra btn-extra-93 btn-1-extra" data-quick-buy=""
                                                    data-loading-text="&lt;span class='btn-text'&gt;Buy Now&lt;/span&gt;"><span
                                                        class="btn-text">Buy Now</span></a>
                                            </div>
                                        </div>


                                        <div class="wishlist-compare">
                                            <a class="btn btn-wishlist" onclick="parent.wishlist.add(40184);"><span
                                                    class="btn-text">Add to Wish List</span></a>
                                            <a class="btn btn-compare" onclick="parent.compare.add(40184);"><span
                                                    class="btn-text">Compare this Product</span></a>
                                        </div>
                                    </div>
                                </div>
                                <div class="product-blocks-details product-blocks-315 grid-rows">
                                    <div class="grid-row grid-row-315-1">
                                        <div class="grid-cols">
                                            <div class="grid-col grid-col-315-1-1">
                                                <div class="grid-items">
                                                    <div class="grid-item grid-item-315-1-1-1">
                                                        <div class="module module-blocks module-blocks-314 blocks-grid">
                                                            <div class="module-body">
                                                                <div class="module-item module-item-1 no-expand">
                                                                    <div class="block-body expand-block">




                                                                        <div class="block-header"><span
                                                                                class="block-header-text">Key
                                                                                Features</span></div>


                                                                        <div class="block-wrapper">


                                                                            <div
                                                                                class="block-content  block-short_description">
                                                                                <li>Number of Key: 63 Keys</li>
                                                                                <li>Switch Type : Mechanical</li>
                                                                                <li>Anti-Ghosting : 26 Keys</li>
                                                                                <li>Connection : Wired</li>
                                                                            </div>


                                                                            <div class="block-footer"><a class="btn"
                                                                                    href="javascript:void(0)"
                                                                                    onclick="$([document.documentElement, document.body]).animate({ scrollTop: $('#tab-specification').offset().top - 100 }, 200);">View
                                                                                    details</a></div>
                                                                        </div>




                                                                    </div>

                                                                </div>
                                                            </div>
                                                        </div>



                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="product-blocks-details product-blocks-323 grid-rows">
                                    <div class="grid-row grid-row-323-1">
                                        <div class="grid-cols">
                                            <div class="grid-col grid-col-323-1-1">
                                                <div class="grid-items">
                                                    <div class="grid-item grid-item-323-1-1-1">
                                                        <div
                                                            class="module module-blocks module-blocks-325 blocks-accordion">
                                                            <div class="module-body">
                                                                <div class="panel-group" id="blocks-314-1-collapse">
                                                                    <div class="module-item module-item-1 panel">
                                                                        <div class="panel-heading">
                                                                            <h4 class="panel-title">
                                                                                <a href="#blocks-314-1-collapse-1"
                                                                                    class="accordion-toggle collapsed"
                                                                                    data-toggle="collapse"
                                                                                    data-parent="#blocks-314-1-collapse"
                                                                                    aria-expanded="false">
                                                                                    Product Information Declaimer
                                                                                    <i class="fa fa-caret-down"></i>
                                                                                </a>
                                                                            </h4>
                                                                        </div>
                                                                        <div class="panel-collapse collapse"
                                                                            id="blocks-314-1-collapse-1">
                                                                            <div class="panel-body">
                                                                                <div class="block-body expand-block">






                                                                                    <div class="block-wrapper">


                                                                                        <div
                                                                                            class="block-content  block-html">
                                                                                            <ul>
                                                                                                <li>Stock availability
                                                                                                    is subject to
                                                                                                    change. Please
                                                                                                    confirm availability
                                                                                                    before shopping by
                                                                                                    calling us.</li>
                                                                                                <li>The product image is
                                                                                                    for illustration
                                                                                                    purposes only. The
                                                                                                    actual product may
                                                                                                    vary in size, color,
                                                                                                    and layout. No claim
                                                                                                    will be accepted for
                                                                                                    an image mismatch.
                                                                                                </li>
                                                                                                <li>Tech Land BD can
                                                                                                    change the price of
                                                                                                    any product at any
                                                                                                    moment due to the
                                                                                                    volatile price of
                                                                                                    the technology.</li>
                                                                                                <li>We cannot guarantee
                                                                                                    that the information
                                                                                                    on this page is 100%
                                                                                                    correct. Tech Land
                                                                                                    BD is not
                                                                                                    responsible for the
                                                                                                    results obtained
                                                                                                    from the use of this
                                                                                                    information.</li>
                                                                                            </ul>
                                                                                        </div>


                                                                                    </div>




                                                                                </div>

                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>



                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                    <div class="product-blocks blocks-default">
                        <div class="product-blocks-default product-blocks-305 grid-rows">
                            <div class="grid-row grid-row-305-2">
                                <div class="grid-cols">
                                    <div class="grid-col grid-col-305-2-1">
                                        <div class="grid-items">
                                            <div class="grid-item grid-item-305-2-1-1">
                                                <div class="module module-blocks module-blocks-306 blocks-tabs">
                                                    <div class="module-body">
                                                        <div class="tabs-container">
                                                            <ul class="nav nav-tabs">
                                                                <li class="tab-2">
                                                                    <a href="#blocks-1-tab-1"
                                                                        data-toggle="tab">Specification</a>
                                                                </li>
                                                                <li class="tab-3">
                                                                    <a href="#blocks-1-tab-2"
                                                                        data-toggle="tab">Description</a>
                                                                </li>
                                                                <li class="tab-4">
                                                                    <a href="#blocks-1-tab-3"
                                                                        data-toggle="tab">Videos</a>
                                                                </li>
                                                                <li class="tab-9">
                                                                    <a href="#blocks-1-tab-4"
                                                                        data-toggle="tab">Review</a>
                                                                </li>
                                                            </ul>
                                                            <div class="tab-content">
                                                                <div class="module-item module-item-2 tab-pane"
                                                                    id="blocks-1-tab-1">
                                                                    <div class="block-body expand-block">






                                                                        <div class="block-wrapper">


                                                                            <div
                                                                                class="block-content  block-attributes">
                                                                                <div id="tab-specification">
                                                                                    <div class="table-responsive">
                                                                                        <table
                                                                                            class="table table-bordered">
                                                                                            <thead>
                                                                                                <tr>
                                                                                                    <td colspan="2">
                                                                                                        <strong>Keyboard</strong>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </thead>
                                                                                            <tbody>
                                                                                                <tr>
                                                                                                    <td
                                                                                                        class="attribute-name">
                                                                                                        Number of Keys
                                                                                                    </td>
                                                                                                    <td
                                                                                                        class="attribute-value">
                                                                                                        63 Keys</td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td
                                                                                                        class="attribute-name">
                                                                                                        Switch Type
                                                                                                    </td>
                                                                                                    <td
                                                                                                        class="attribute-value">
                                                                                                        Mechanical
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                            <thead>
                                                                                                <tr>
                                                                                                    <td colspan="2">
                                                                                                        <strong>Special Features</strong>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </thead>
                                                                                            <tbody>
                                                                                                <tr>
                                                                                                    <td
                                                                                                        class="attribute-name">
                                                                                                        Key Features
                                                                                                    </td>
                                                                                                    <td
                                                                                                        class="attribute-value">
                                                                                                        BLUE &amp; RED
                                                                                                        SWITCH </td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td
                                                                                                        class="attribute-name">
                                                                                                        Lighting Effect
                                                                                                    </td>
                                                                                                    <td
                                                                                                        class="attribute-value">
                                                                                                        17 mode
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                            <thead>
                                                                                                <tr>
                                                                                                    <td colspan="2">
                                                                                                        <strong>Others</strong>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </thead>
                                                                                            <tbody>
                                                                                                <tr>
                                                                                                    <td
                                                                                                        class="attribute-name">
                                                                                                        Adjustable
                                                                                                        Keyboard Legs
                                                                                                    </td>
                                                                                                    <td
                                                                                                        class="attribute-value">
                                                                                                        Yes</td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td
                                                                                                        class="attribute-name">
                                                                                                        Other Features
                                                                                                    </td>
                                                                                                    <td
                                                                                                        class="attribute-value">
                                                                                                        Anti-Ghosting :
                                                                                                        26 Keys<br>
                                                                                                        60% layout</td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                            <thead>
                                                                                                <tr>
                                                                                                    <td colspan="2">
                                                                                                        <strong>Physical Specification</strong>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </thead>
                                                                                            <tbody>
                                                                                                <tr>
                                                                                                    <td
                                                                                                        class="attribute-name">
                                                                                                        Color</td>
                                                                                                    <td
                                                                                                        class="attribute-value">
                                                                                                        Sky Blue</td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td
                                                                                                        class="attribute-name">
                                                                                                        Materials</td>
                                                                                                    <td
                                                                                                        class="attribute-value">
                                                                                                        ABS
                                                                                                    </td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td
                                                                                                        class="attribute-name">
                                                                                                        Dimension</td>
                                                                                                    <td
                                                                                                        class="attribute-value">
                                                                                                        292*105*35 mm
                                                                                                    </td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td
                                                                                                        class="attribute-name">
                                                                                                        Weight</td>
                                                                                                    <td
                                                                                                        class="attribute-value">
                                                                                                        397.8 g</td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                            <thead>
                                                                                                <tr>
                                                                                                    <td colspan="2">
                                                                                                        <strong>Technical Info</strong>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </thead>
                                                                                            <tbody>
                                                                                                <tr>
                                                                                                    <td
                                                                                                        class="attribute-name">
                                                                                                        Model</td>
                                                                                                    <td
                                                                                                        class="attribute-value">
                                                                                                        Atom63 MK874V2
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                            <thead>
                                                                                                <tr>
                                                                                                    <td colspan="2">
                                                                                                        <strong>Warranty Information</strong>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </thead>
                                                                                            <tbody>
                                                                                                <tr>
                                                                                                    <td
                                                                                                        class="attribute-name">
                                                                                                        Warranty</td>
                                                                                                    <td
                                                                                                        class="attribute-value">
                                                                                                        1-year</td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </div>
                                                                                </div>

                                                                            </div>


                                                                        </div>




                                                                    </div>

                                                                </div>
                                                                <div class="module-item module-item-3 tab-pane"
                                                                    id="blocks-1-tab-2">
                                                                    <div class="block-body expand-block">




                                                                        <div class="block-header"><span
                                                                                class="block-header-text">Description</span>
                                                                        </div>


                                                                        <div class="block-wrapper">


                                                                            <div
                                                                                class="block-content  block-description">
                                                                                <h2><span style="font-size: 24px;"><b>Fantech
                                                                                            Atom63 MK874 V2 Sky Blue
                                                                                            Keyboard Price
                                                                                            In&nbsp;</b></span><span
                                                                                        style="color: inherit; font-family: inherit; font-size: 24px;"><b>Bangladesh</b></span>
                                                                                </h2>
                                                                                <p>The <a
                                                                                        href="https://www.techlandbd.com/accessories/computer-keyboard/fantech-keyboard"
                                                                                        target="_blank">Fantech</a>
                                                                                    Atom63 MK874V2 is a sleek, compact
                                                                                    mechanical gaming <a
                                                                                        href="https://www.techlandbd.com/accessories/computer-keyboard"
                                                                                        target="_blank">keyboard</a>
                                                                                    designed for enthusiasts who value
                                                                                    portability and performance. Its 60%
                                                                                    layout, sky-blue aesthetic, and
                                                                                    durable build make it a standout
                                                                                    choice for gaming or productivity
                                                                                    setups.</p>
                                                                                <p><br></p>
                                                                                <h2><b><span style="font-size: 20px;">Technical
                                                                                            Details</span></b></h2>
                                                                                <p>The Fantech Atom63 MK874V2 features a
                                                                                    compact 63-key layout and 26-key
                                                                                    anti-ghosting to ensure precise
                                                                                    input during fast-paced gaming. It
                                                                                    uses mechanical switches, available
                                                                                    in blue or red, and is equipped with
                                                                                    hot-swappable 3-pin compatibility
                                                                                    for customization. With 17 RGB
                                                                                    lighting modes, users can
                                                                                    personalize their keyboard’s look.
                                                                                    The double injection keycaps ensure
                                                                                    longevity, and the keyboard’s
                                                                                    adjustable feet enhance ergonomic
                                                                                    comfort. Weighing only 397.8 g and
                                                                                    measuring 292 x 105 x 35 mm, it’s a
                                                                                    portable yet powerful option.</p>
                                                                                <p><br></p>
                                                                                <h2><b><span style="font-size: 20px;">Availability
                                                                                            and Usability</span></b>
                                                                                </h2>
                                                                                <p>The Fantech Atom63 MK874V2
                                                                                    RGB&nbsp;Mechanical Wired Gaming
                                                                                    Keyboard (Sky Blue) is readily
                                                                                    available at <a
                                                                                        href="https://www.techlandbd.com"
                                                                                        target="_blank">Tech Land
                                                                                        BD</a>. Its compact design and
                                                                                    customizable features make it ideal
                                                                                    for gamers and professionals with
                                                                                    limited desk space or on-the-go
                                                                                    requirements. With its durable build
                                                                                    and aesthetic appeal, the Atom63
                                                                                    meets diverse user needs. For the
                                                                                    best Fantech Atom63 MK874V2
                                                                                    RGB&nbsp;Mechanical Wired Gaming
                                                                                    Keyboard Price in BD, visit Tech
                                                                                    Land BD today!</p>
                                                                                <p><br></p>
                                                                                <h2><b><span
                                                                                            style="font-size: 20px;">Highlights</span></b>
                                                                                </h2>
                                                                                <ul>
                                                                                    <li>Compact 60% layout with 63 keys.
                                                                                    </li>
                                                                                    <li>26-key anti-ghosting for
                                                                                        accurate inputs.</li>
                                                                                    <li>Hot-swappable 3-pin switch
                                                                                        compatibility.</li>
                                                                                    <li>17 spectrum RGB lighting modes.
                                                                                    </li>
                                                                                    <li>Durable double injection keycaps
                                                                                        with 3-color combinations.</li>
                                                                                </ul>
                                                                                <p><br></p>
                                                                                <h2><b><span style="font-size: 20px;">Grab
                                                                                            the Fantech Atom63 MK874V2
                                                                                            from Tech Land BD
                                                                                            Today!</span></b></h2>
                                                                                <p></p>
                                                                                <p>Enhance your gaming and productivity
                                                                                    setup with the Fantech Atom63
                                                                                    MK874V2 RGB&nbsp;Mechanical Wired
                                                                                    Gaming Keyboard. Its compact design,
                                                                                    hot-swappable switches, and stunning
                                                                                    RGB modes make it a versatile and
                                                                                    stylish addition to your gear. Don’t
                                                                                    miss out on the most competitive
                                                                                    Fantech Atom63 MK874V2
                                                                                    RGB&nbsp;Mechanical Wired Gaming
                                                                                    Keyboard Price in Bangladesh—shop at
                                                                                    Tech Land BD now!</p>
                                                                                <p><br></p>
                                                                                <p><br></p>
                                                                                <p><br></p>
                                                                                <p><br></p>
                                                                                <p><br></p>
                                                                                <p><br></p>
                                                                            </div>


                                                                        </div>




                                                                    </div>

                                                                </div>
                                                                <div class="module-item module-item-4 tab-pane no-expand"
                                                                    id="blocks-1-tab-3">
                                                                    <div class="block-body expand-block">






                                                                        <div class="block-wrapper">


                                                                            <div class="block-content  block-dynamic">



                                                                            </div>


                                                                        </div>




                                                                    </div>

                                                                </div>
                                                                <div class="module-item module-item-9 tab-pane"
                                                                    id="blocks-1-tab-4">
                                                                    <div class="block-body expand-block">






                                                                        <div class="block-wrapper">


                                                                            <div class="block-content  block-reviews">
                                                                                <style>
                                                                                    .review-header {
                                                                                        display: flex;
                                                                                        justify-content: space-between;
                                                                                        align-items: center;
                                                                                        border-bottom: 1px solid #ddd;
                                                                                        margin-bottom: 20px;
                                                                                        padding-bottom: 30px;
                                                                                    }

                                                                                    @media (max-width: 469px) {
                                                                                        .review-header {
                                                                                            flex-direction: column !important;
                                                                                            align-items: flex-start !important;
                                                                                        }

                                                                                        #open-form-add-review {
                                                                                            margin-top: 10px;
                                                                                        }
                                                                                    }

                                                                                    #form-review-container {
                                                                                        display: flex;
                                                                                        align-items: center;
                                                                                        flex-direction: column;
                                                                                    }

                                                                                    .block-content:not(.block-html):not(.block-text) {
                                                                                        height: auto !important;
                                                                                    }
                                                                                </style>


                                                                                <div class="review-header">
                                                                                    <div>
                                                                                        <h4 id="qa-title">Review</h4>
                                                                                        <span>Get specific details about
                                                                                            this product from customers
                                                                                            who own it.</span>
                                                                                    </div>
                                                                                    <div>
                                                                                        <button
                                                                                            id="open-form-add-review"
                                                                                            class="btn btn-info">Write a
                                                                                            Review</button>
                                                                                    </div>
                                                                                </div>



                                                                                <div id="form-review-container"
                                                                                    class="hidden">
                                                                                    <div class="tab-pane"
                                                                                        id="tab-review">
                                                                                        <form
                                                                                            class="form-horizontal ask-question-form"
                                                                                            id="form-review">
                                                                                            <h4 id="qa-title"
                                                                                                class="text-center">
                                                                                                Write A Review</h4>
                                                                                            <div
                                                                                                class="form-group required">
                                                                                                <label
                                                                                                    class="col-sm-2 control-label"
                                                                                                    for="input-name">Your
                                                                                                    Name</label>
                                                                                                <div class="col-sm-10">
                                                                                                    <input type="text"
                                                                                                        name="name"
                                                                                                        value=""
                                                                                                        id="input-name"
                                                                                                        class="form-control">
                                                                                                </div>
                                                                                            </div>
                                                                                            <div
                                                                                                class="form-group required">
                                                                                                <label
                                                                                                    class="col-sm-2 control-label"
                                                                                                    for="input-review">Your
                                                                                                    Review</label>
                                                                                                <div class="col-sm-10">
                                                                                                    <textarea
                                                                                                        name="text"
                                                                                                        rows="5"
                                                                                                        id="input-review"
                                                                                                        class="form-control"></textarea>
                                                                                                    <div
                                                                                                        class="help-block">
                                                                                                        <span
                                                                                                            class="text-danger">Note:</span>
                                                                                                        HTML is not
                                                                                                        translated!
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                            <div
                                                                                                class="form-group required">
                                                                                                <label
                                                                                                    class="col-sm-2 control-label">Rating</label>

                                                                                                <div
                                                                                                    class="col-sm-10 rate">
                                                                                                    <span>Bad</span>
                                                                                                    <input type="radio"
                                                                                                        name="rating"
                                                                                                        value="1">

                                                                                                    <input type="radio"
                                                                                                        name="rating"
                                                                                                        value="2">

                                                                                                    <input type="radio"
                                                                                                        name="rating"
                                                                                                        value="3">

                                                                                                    <input type="radio"
                                                                                                        name="rating"
                                                                                                        value="4">

                                                                                                    <input type="radio"
                                                                                                        name="rating"
                                                                                                        value="5">
                                                                                                    <span>Good</span>
                                                                                                </div>
                                                                                            </div>

                                                                                            <div class="text-center">
                                                                                                <button type="button"
                                                                                                    id="button-review"
                                                                                                    data-loading-text="Loading..."
                                                                                                    class="btn-info-submit btn btn-info">Continue</button>
                                                                                            </div>
                                                                                        </form>
                                                                                    </div>
                                                                                </div>
                                                                                <div id="review">
                                                                                    <p>There are no reviews for this
                                                                                        product.</p>
                                                                                </div>
                                                                            </div>


                                                                            <div class="block-footer"></div>
                                                                        </div>




                                                                    </div>

                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>



                                            </div>
                                            <div class="grid-item grid-item-305-2-1-2">

                                            </div>
                                        </div>
                                    </div>
                                    <div class="grid-col grid-col-305-2-2">
                                        <div class="grid-items">
                                            <div class="grid-item grid-item-305-2-2-1">
                                                <div class="module module-side_products module-side_products-222">
                                                    <div class="module-body side-products-blocks">
                                                        <div class="module-item module-item-2">
                                                            <h3 class="title module-title">Same Category Product</h3>
                                                            <div class="side-products">
                                                                <div class="product-layout  ">
                                                                    <div class="side-product">
                                                                        <div class="image">
                                                                            <a href="https://www.techlandbd.com/samsung-990-pro-1tb-ssd"
                                                                                class="product-img">
                                                                                <img src="https://www.techlandbd.com/image/cache/catalog/SSD/Samsung/samsung-990-pro/samsung-990-pro-33-120x120.jpg"
                                                                                    srcset="https://www.techlandbd.com/image/cache/catalog/SSD/Samsung/samsung-990-pro/samsung-990-pro-33-120x120.jpg 1x, https://www.techlandbd.com/image/cache/catalog/SSD/Samsung/samsung-990-pro/samsung-990-pro-33-240x240.jpg 2x"
                                                                                    width="120" height="120"
                                                                                    alt="SAMSUNG 990 PRO 1TB PCIE 4.0 M.2 NVME SSD"
                                                                                    title="SAMSUNG 990 PRO 1TB PCIE 4.0 M.2 NVME SSD"
                                                                                    class="img-first">
                                                                            </a>

                                                                            <div class="quickview-button">
                                                                                <a class="btn btn-quickview"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 quickview-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="quickview('28544')"
                                                                                    data-original-title="Quickview"><span
                                                                                        class="btn-text">Quickview</span></a>
                                                                            </div>
                                                                        </div>

                                                                        <div class="caption">
                                                                            <div class="name"><a
                                                                                    href="https://www.techlandbd.com/samsung-990-pro-1tb-ssd">SAMSUNG
                                                                                    990 PRO 1TB PCIE 4.0 M.2 NVME
                                                                                    SSD</a></div>

                                                                            <div class="price">
                                                                                <span class="price-new">14,000৳</span>
                                                                                <span class="price-old">15,500৳</span>
                                                                            </div>
                                                                            <div class="rating no-rating">
                                                                                <div class="rating-stars">
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="button-group">
                                                                                <a class="btn btn-cart"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 cart-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="cart.add('28544', $(this).closest('.product-thumb').find('.button-group input[name=\'quantity\']').val());"
                                                                                    data-loading-text="&lt;span class='btn-text'&gt;Add to Cart&lt;/span&gt;"
                                                                                    data-original-title="Add to Cart"><span
                                                                                        class="btn-text">Add to
                                                                                        Cart</span></a>
                                                                                <a class="btn btn-wishlist"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 wishlist-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="wishlist.add('28544')"
                                                                                    data-original-title="Add to Wish List"><span
                                                                                        class="btn-text">Add to Wish
                                                                                        List</span></a>
                                                                                <a class="btn btn-compare"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 compare-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="compare.add('28544')"
                                                                                    data-original-title="Compare this Product"><span
                                                                                        class="btn-text">Compare this
                                                                                        Product</span></a>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="product-layout  ">
                                                                    <div class="side-product">
                                                                        <div class="image">
                                                                            <a href="https://www.techlandbd.com/a4tech-bloody-b135n-mechanical-gaming-keyboard"
                                                                                class="product-img">
                                                                                <img src="https://www.techlandbd.com/image/cache/catalog/Keyboard/A4tech/Bloody/B135N/a4tech-bloody-b135n-mechanical-gaming-keyboard-01-120x120.jpg"
                                                                                    srcset="https://www.techlandbd.com/image/cache/catalog/Keyboard/A4tech/Bloody/B135N/a4tech-bloody-b135n-mechanical-gaming-keyboard-01-120x120.jpg 1x, https://www.techlandbd.com/image/cache/catalog/Keyboard/A4tech/Bloody/B135N/a4tech-bloody-b135n-mechanical-gaming-keyboard-01-240x240.jpg 2x"
                                                                                    width="120" height="120"
                                                                                    alt="A4TECH BLOODY B135N NEON RGB GAMING KEYBOARD"
                                                                                    title="A4TECH BLOODY B135N NEON RGB GAMING KEYBOARD"
                                                                                    class="img-first">
                                                                            </a>

                                                                            <div class="quickview-button">
                                                                                <a class="btn btn-quickview"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 quickview-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="quickview('27994')"
                                                                                    data-original-title="Quickview"><span
                                                                                        class="btn-text">Quickview</span></a>
                                                                            </div>
                                                                        </div>

                                                                        <div class="caption">
                                                                            <div class="name"><a
                                                                                    href="https://www.techlandbd.com/a4tech-bloody-b135n-mechanical-gaming-keyboard">A4TECH
                                                                                    BLOODY B135N NEON RGB GAMING
                                                                                    KEYBOARD</a></div>

                                                                            <div class="price">
                                                                                <span class="price-new">1,700৳</span>
                                                                                <span class="price-old">1,800৳</span>
                                                                            </div>
                                                                            <div class="rating no-rating">
                                                                                <div class="rating-stars">
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="button-group">
                                                                                <a class="btn btn-cart"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 cart-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="cart.add('27994', $(this).closest('.product-thumb').find('.button-group input[name=\'quantity\']').val());"
                                                                                    data-loading-text="&lt;span class='btn-text'&gt;Add to Cart&lt;/span&gt;"
                                                                                    data-original-title="Add to Cart"><span
                                                                                        class="btn-text">Add to
                                                                                        Cart</span></a>
                                                                                <a class="btn btn-wishlist"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 wishlist-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="wishlist.add('27994')"
                                                                                    data-original-title="Add to Wish List"><span
                                                                                        class="btn-text">Add to Wish
                                                                                        List</span></a>
                                                                                <a class="btn btn-compare"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 compare-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="compare.add('27994')"
                                                                                    data-original-title="Compare this Product"><span
                                                                                        class="btn-text">Compare this
                                                                                        Product</span></a>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="product-layout  out-of-stock">
                                                                    <div class="side-product">
                                                                        <div class="image">
                                                                            <a href="https://www.techlandbd.com/a4tech-bloody-s510n-mechanical-gaming-keyboard"
                                                                                class="product-img">
                                                                                <img src="https://www.techlandbd.com/image/cache/catalog/Keyboard/A4tech/Bloody/S510N/a4tech-bloody-s510n-mechanical-gaming-keyboard-01-120x120.jpg"
                                                                                    srcset="https://www.techlandbd.com/image/cache/catalog/Keyboard/A4tech/Bloody/S510N/a4tech-bloody-s510n-mechanical-gaming-keyboard-01-120x120.jpg 1x, https://www.techlandbd.com/image/cache/catalog/Keyboard/A4tech/Bloody/S510N/a4tech-bloody-s510n-mechanical-gaming-keyboard-01-240x240.jpg 2x"
                                                                                    width="120" height="120"
                                                                                    alt="A4TECH BLOODY S510N MECHANICAL RGB BROWN SWITCH GAMING KEYBOARD"
                                                                                    title="A4TECH BLOODY S510N MECHANICAL RGB BROWN SWITCH GAMING KEYBOARD"
                                                                                    class="img-first">
                                                                            </a>

                                                                            <div class="quickview-button">
                                                                                <a class="btn btn-quickview"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 quickview-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="quickview('27992')"
                                                                                    data-original-title="Quickview"><span
                                                                                        class="btn-text">Quickview</span></a>
                                                                            </div>
                                                                        </div>

                                                                        <div class="caption">
                                                                            <div class="name"><a
                                                                                    href="https://www.techlandbd.com/a4tech-bloody-s510n-mechanical-gaming-keyboard">A4TECH
                                                                                    BLOODY S510N MECHANICAL RGB BROWN
                                                                                    SWITCH GAMING KEYBOARD</a></div>

                                                                            <div class="price">
                                                                                <span class="price-new">3,299৳</span>
                                                                                <span class="price-old">3,500৳</span>
                                                                            </div>
                                                                            <div class="rating no-rating">
                                                                                <div class="rating-stars">
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="button-group">
                                                                                <a class="btn btn-cart"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 cart-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="cart.add('27992', $(this).closest('.product-thumb').find('.button-group input[name=\'quantity\']').val());"
                                                                                    data-loading-text="&lt;span class='btn-text'&gt;Add to Cart&lt;/span&gt;"
                                                                                    data-original-title="Add to Cart"><span
                                                                                        class="btn-text">Add to
                                                                                        Cart</span></a>
                                                                                <a class="btn btn-wishlist"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 wishlist-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="wishlist.add('27992')"
                                                                                    data-original-title="Add to Wish List"><span
                                                                                        class="btn-text">Add to Wish
                                                                                        List</span></a>
                                                                                <a class="btn btn-compare"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 compare-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="compare.add('27992')"
                                                                                    data-original-title="Compare this Product"><span
                                                                                        class="btn-text">Compare this
                                                                                        Product</span></a>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </div>
                                                        <div class="module-item module-item-4">
                                                            <h3 class="title module-title">Recently view</h3>
                                                            <div class="side-products">
                                                                <div class="product-layout  ">
                                                                    <div class="side-product">
                                                                        <div class="image">
                                                                            <a href="https://www.techlandbd.com/fantech-atom-pro96-mk914-rgb-keyboard-saturn"
                                                                                class="product-img">
                                                                                <img src="https://www.techlandbd.com/image/cache/catalog/Fantech/fantech-atom-pro96-mk914-rgb-keyboard-saturn-120x120.jpg"
                                                                                    srcset="https://www.techlandbd.com/image/cache/catalog/Fantech/fantech-atom-pro96-mk914-rgb-keyboard-saturn-120x120.jpg 1x, https://www.techlandbd.com/image/cache/catalog/Fantech/fantech-atom-pro96-mk914-rgb-keyboard-saturn-240x240.jpg 2x"
                                                                                    width="120" height="120"
                                                                                    alt="Fantech Atom63 MK874 V2 MIZU RGB Mechanical Gaming Keyboard (Sky Blue)"
                                                                                    title="Fantech Atom63 MK874 V2 MIZU RGB Mechanical Gaming Keyboard (Sky Blue)"
                                                                                    class="img-first">
                                                                            </a>

                                                                            <div class="quickview-button">
                                                                                <a class="btn btn-quickview"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 quickview-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="quickview('40184')"
                                                                                    data-original-title="Quickview"><span
                                                                                        class="btn-text">Quickview</span></a>
                                                                            </div>
                                                                        </div>

                                                                        <div class="caption">
                                                                            <div class="name"><a
                                                                                    href="https://www.techlandbd.com/fantech-atom-pro96-mk914-rgb-keyboard-saturn">Fantech
                                                                                    Atom63 MK874 V2 MIZU RGB Mechanical
                                                                                    Gaming Keyboard (Sky Blue)</a></div>

                                                                            <div class="price">
                                                                                <span class="price-new">2,300৳</span>
                                                                                <span class="price-old">2,800৳</span>
                                                                            </div>
                                                                            <div class="rating no-rating">
                                                                                <div class="rating-stars">
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="button-group">
                                                                                <a class="btn btn-cart"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 cart-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="cart.add('40184', $(this).closest('.product-thumb').find('.button-group input[name=\'quantity\']').val());"
                                                                                    data-loading-text="&lt;span class='btn-text'&gt;Add to Cart&lt;/span&gt;"
                                                                                    data-original-title="Add to Cart"><span
                                                                                        class="btn-text">Add to
                                                                                        Cart</span></a>
                                                                                <a class="btn btn-wishlist"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 wishlist-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="wishlist.add('40184')"
                                                                                    data-original-title="Add to Wish List"><span
                                                                                        class="btn-text">Add to Wish
                                                                                        List</span></a>
                                                                                <a class="btn btn-compare"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 compare-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="compare.add('40184')"
                                                                                    data-original-title="Compare this Product"><span
                                                                                        class="btn-text">Compare this
                                                                                        Product</span></a>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    class="product-layout  out-of-stock has-zero-price">
                                                                    <div class="side-product">
                                                                        <div class="image">
                                                                            <a href="https://www.techlandbd.com/aula-s2022-gaming-keyboard"
                                                                                class="product-img">
                                                                                <img src="https://www.techlandbd.com/image/cache/catalog/Mouse/Aula/aula-s2022/aula-s2022-120x120.jpg"
                                                                                    srcset="https://www.techlandbd.com/image/cache/catalog/Mouse/Aula/aula-s2022/aula-s2022-120x120.jpg 1x, https://www.techlandbd.com/image/cache/catalog/Mouse/Aula/aula-s2022/aula-s2022-240x240.jpg 2x"
                                                                                    width="120" height="120"
                                                                                    alt="AULA S2022 Mechanical Wired Gaming Keyboard (Blue)"
                                                                                    title="AULA S2022 Mechanical Wired Gaming Keyboard (Blue)"
                                                                                    class="img-first">
                                                                            </a>

                                                                            <div class="quickview-button">
                                                                                <a class="btn btn-quickview"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 quickview-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="quickview('24458')"
                                                                                    data-original-title="Quickview"><span
                                                                                        class="btn-text">Quickview</span></a>
                                                                            </div>
                                                                        </div>

                                                                        <div class="caption">
                                                                            <div class="name"><a
                                                                                    href="https://www.techlandbd.com/aula-s2022-gaming-keyboard">AULA
                                                                                    S2022 Mechanical Wired Gaming
                                                                                    Keyboard (Blue)</a></div>

                                                                            <div class="price">
                                                                                <span class="price-normal">0৳</span>
                                                                            </div>
                                                                            <div class="rating no-rating">
                                                                                <div class="rating-stars">
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="button-group">
                                                                                <a class="btn btn-cart"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 cart-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="cart.add('24458', $(this).closest('.product-thumb').find('.button-group input[name=\'quantity\']').val());"
                                                                                    data-loading-text="&lt;span class='btn-text'&gt;Add to Cart&lt;/span&gt;"
                                                                                    data-original-title="Add to Cart"><span
                                                                                        class="btn-text">Add to
                                                                                        Cart</span></a>
                                                                                <a class="btn btn-wishlist"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 wishlist-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="wishlist.add('24458')"
                                                                                    data-original-title="Add to Wish List"><span
                                                                                        class="btn-text">Add to Wish
                                                                                        List</span></a>
                                                                                <a class="btn btn-compare"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 compare-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="compare.add('24458')"
                                                                                    data-original-title="Compare this Product"><span
                                                                                        class="btn-text">Compare this
                                                                                        Product</span></a>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="product-layout  ">
                                                                    <div class="side-product">
                                                                        <div class="image">
                                                                            <a href="https://www.techlandbd.com/acer-predator-helios-neo-16-ph16-72-74w1-core-i7-14th-gen-gaming-laptop"
                                                                                class="product-img">
                                                                                <img src="https://www.techlandbd.com/image/cache/catalog/Acer/acer-predator-helios-neo-16-ph16-72-74w1-core-i7-14th-gen-gaming-laptop-120x120.jpg"
                                                                                    srcset="https://www.techlandbd.com/image/cache/catalog/Acer/acer-predator-helios-neo-16-ph16-72-74w1-core-i7-14th-gen-gaming-laptop-120x120.jpg 1x, https://www.techlandbd.com/image/cache/catalog/Acer/acer-predator-helios-neo-16-ph16-72-74w1-core-i7-14th-gen-gaming-laptop-240x240.jpg 2x"
                                                                                    width="120" height="120"
                                                                                    alt="Acer Predator Helios Neo 16 PHN16-72 Core I7 14th Gen RTX 4060 16&quot; QHD+ Gaming Laptop"
                                                                                    title="Acer Predator Helios Neo 16 PHN16-72 Core I7 14th Gen RTX 4060 16&quot; QHD+ Gaming Laptop"
                                                                                    class="img-first">
                                                                            </a>

                                                                            <div class="quickview-button">
                                                                                <a class="btn btn-quickview"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 quickview-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="quickview('37821')"
                                                                                    data-original-title="Quickview"><span
                                                                                        class="btn-text">Quickview</span></a>
                                                                            </div>
                                                                        </div>

                                                                        <div class="caption">
                                                                            <div class="name"><a
                                                                                    href="https://www.techlandbd.com/acer-predator-helios-neo-16-ph16-72-74w1-core-i7-14th-gen-gaming-laptop">Acer
                                                                                    Predator Helios Neo 16 PHN16-72 Core
                                                                                    I7 14th Gen RTX 4060 16" QHD+ Gaming
                                                                                    Laptop</a></div>

                                                                            <div class="price">
                                                                                <span class="price-new">203,000৳</span>
                                                                                <span class="price-old">223,000৳</span>
                                                                            </div>
                                                                            <div class="rating no-rating">
                                                                                <div class="rating-stars">
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="button-group">
                                                                                <a class="btn btn-cart"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 cart-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="cart.add('37821', $(this).closest('.product-thumb').find('.button-group input[name=\'quantity\']').val());"
                                                                                    data-loading-text="&lt;span class='btn-text'&gt;Add to Cart&lt;/span&gt;"
                                                                                    data-original-title="Add to Cart"><span
                                                                                        class="btn-text">Add to
                                                                                        Cart</span></a>
                                                                                <a class="btn btn-wishlist"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 wishlist-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="wishlist.add('37821')"
                                                                                    data-original-title="Add to Wish List"><span
                                                                                        class="btn-text">Add to Wish
                                                                                        List</span></a>
                                                                                <a class="btn btn-compare"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 compare-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="compare.add('37821')"
                                                                                    data-original-title="Compare this Product"><span
                                                                                        class="btn-text">Compare this
                                                                                        Product</span></a>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="product-layout  ">
                                                                    <div class="side-product">
                                                                        <div class="image">
                                                                            <a href="https://www.techlandbd.com/apple-macbook-pro-16-inch-m4-pro"
                                                                                class="product-img">
                                                                                <img src="https://www.techlandbd.com/image/cache/catalog/Apple/apple-macbook-pro-16-inch-m4-pro-120x120.jpg"
                                                                                    srcset="https://www.techlandbd.com/image/cache/catalog/Apple/apple-macbook-pro-16-inch-m4-pro-120x120.jpg 1x, https://www.techlandbd.com/image/cache/catalog/Apple/apple-macbook-pro-16-inch-m4-pro-240x240.jpg 2x"
                                                                                    width="120" height="120"
                                                                                    alt="Apple MacBook Pro 16-Inch M4 Pro 14 Core CPU 20 Core GPU 24GB RAM 512GB SSD"
                                                                                    title="Apple MacBook Pro 16-Inch M4 Pro 14 Core CPU 20 Core GPU 24GB RAM 512GB SSD"
                                                                                    class="img-first">
                                                                            </a>

                                                                            <div class="quickview-button">
                                                                                <a class="btn btn-quickview"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 quickview-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="quickview('43926')"
                                                                                    data-original-title="Quickview"><span
                                                                                        class="btn-text">Quickview</span></a>
                                                                            </div>
                                                                        </div>

                                                                        <div class="caption">
                                                                            <div class="name"><a
                                                                                    href="https://www.techlandbd.com/apple-macbook-pro-16-inch-m4-pro">Apple
                                                                                    MacBook Pro 16-Inch M4 Pro 14 Core
                                                                                    CPU 20 Core GPU 24GB RAM 512GB
                                                                                    SSD</a></div>

                                                                            <div class="price">
                                                                                <span class="price-new">340,000৳</span>
                                                                                <span class="price-old">365,000৳</span>
                                                                            </div>
                                                                            <div class="rating no-rating">
                                                                                <div class="rating-stars">
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="button-group">
                                                                                <a class="btn btn-cart"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 cart-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="cart.add('43926', $(this).closest('.product-thumb').find('.button-group input[name=\'quantity\']').val());"
                                                                                    data-loading-text="&lt;span class='btn-text'&gt;Add to Cart&lt;/span&gt;"
                                                                                    data-original-title="Add to Cart"><span
                                                                                        class="btn-text">Add to
                                                                                        Cart</span></a>
                                                                                <a class="btn btn-wishlist"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 wishlist-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="wishlist.add('43926')"
                                                                                    data-original-title="Add to Wish List"><span
                                                                                        class="btn-text">Add to Wish
                                                                                        List</span></a>
                                                                                <a class="btn btn-compare"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 compare-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="compare.add('43926')"
                                                                                    data-original-title="Compare this Product"><span
                                                                                        class="btn-text">Compare this
                                                                                        Product</span></a>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="product-layout  ">
                                                                    <div class="side-product">
                                                                        <div class="image">
                                                                            <a href="https://www.techlandbd.com/apple-macbook-air-13-inch-m2-chip-space-gray"
                                                                                class="product-img">
                                                                                <img src="https://www.techlandbd.com/image/cache/catalog/Apple/apple-macbook-air-13-inch-m2-chip-space-gray-120x120.jpg"
                                                                                    srcset="https://www.techlandbd.com/image/cache/catalog/Apple/apple-macbook-air-13-inch-m2-chip-space-gray-120x120.jpg 1x, https://www.techlandbd.com/image/cache/catalog/Apple/apple-macbook-air-13-inch-m2-chip-space-gray-240x240.jpg 2x"
                                                                                    width="120" height="120"
                                                                                    alt="Apple MacBook Air 13-inch M2 Chip 8C CPU 8C GPU 16GB RAM 256GB SSD Space Gray"
                                                                                    title="Apple MacBook Air 13-inch M2 Chip 8C CPU 8C GPU 16GB RAM 256GB SSD Space Gray"
                                                                                    class="img-first">
                                                                            </a>

                                                                            <div class="quickview-button">
                                                                                <a class="btn btn-quickview"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 quickview-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="quickview('42134')"
                                                                                    data-original-title="Quickview"><span
                                                                                        class="btn-text">Quickview</span></a>
                                                                            </div>
                                                                        </div>

                                                                        <div class="caption">
                                                                            <div class="name"><a
                                                                                    href="https://www.techlandbd.com/apple-macbook-air-13-inch-m2-chip-space-gray">Apple
                                                                                    MacBook Air 13-inch M2 Chip 8C CPU
                                                                                    8C GPU 16GB RAM 256GB SSD Space
                                                                                    Gray</a></div>

                                                                            <div class="price">
                                                                                <span class="price-new">102,490৳</span>
                                                                                <span class="price-old">113,000৳</span>
                                                                            </div>
                                                                            <div class="rating no-rating">
                                                                                <div class="rating-stars">
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="button-group">
                                                                                <a class="btn btn-cart"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 cart-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="cart.add('42134', $(this).closest('.product-thumb').find('.button-group input[name=\'quantity\']').val());"
                                                                                    data-loading-text="&lt;span class='btn-text'&gt;Add to Cart&lt;/span&gt;"
                                                                                    data-original-title="Add to Cart"><span
                                                                                        class="btn-text">Add to
                                                                                        Cart</span></a>
                                                                                <a class="btn btn-wishlist"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 wishlist-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="wishlist.add('42134')"
                                                                                    data-original-title="Add to Wish List"><span
                                                                                        class="btn-text">Add to Wish
                                                                                        List</span></a>
                                                                                <a class="btn btn-compare"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 compare-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="compare.add('42134')"
                                                                                    data-original-title="Compare this Product"><span
                                                                                        class="btn-text">Compare this
                                                                                        Product</span></a>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="product-layout  has-zero-price">
                                                                    <div class="side-product">
                                                                        <div class="image">
                                                                            <a href="https://www.techlandbd.com/lenovo-loq-15iax9-core-i5-12th-gen-gaming-laptop"
                                                                                class="product-img">
                                                                                <img src="https://www.techlandbd.com/image/cache/catalog/Lenovo/lenovo-loq-15iax9-core-i5-12th-gen-gaming-laptop-120x120.jpg"
                                                                                    srcset="https://www.techlandbd.com/image/cache/catalog/Lenovo/lenovo-loq-15iax9-core-i5-12th-gen-gaming-laptop-120x120.jpg 1x, https://www.techlandbd.com/image/cache/catalog/Lenovo/lenovo-loq-15iax9-core-i5-12th-gen-gaming-laptop-240x240.jpg 2x"
                                                                                    width="120" height="120"
                                                                                    alt="Lenovo LOQ 15IAX9 Core i5 12th Gen RTX 4050 6GB Graphics Gaming Laptop"
                                                                                    title="Lenovo LOQ 15IAX9 Core i5 12th Gen RTX 4050 6GB Graphics Gaming Laptop"
                                                                                    class="img-first">
                                                                            </a>

                                                                            <div class="quickview-button">
                                                                                <a class="btn btn-quickview"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 quickview-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="quickview('37110')"
                                                                                    data-original-title="Quickview"><span
                                                                                        class="btn-text">Quickview</span></a>
                                                                            </div>
                                                                        </div>

                                                                        <div class="caption">
                                                                            <div class="name"><a
                                                                                    href="https://www.techlandbd.com/lenovo-loq-15iax9-core-i5-12th-gen-gaming-laptop">Lenovo
                                                                                    LOQ 15IAX9 Core i5 12th Gen RTX 4050
                                                                                    6GB Graphics Gaming Laptop</a></div>

                                                                            <div class="price">
                                                                                <span class="price-normal">0৳</span>
                                                                            </div>
                                                                            <div class="rating no-rating">
                                                                                <div class="rating-stars">
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="button-group">
                                                                                <a class="btn btn-cart"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 cart-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="cart.add('37110', $(this).closest('.product-thumb').find('.button-group input[name=\'quantity\']').val());"
                                                                                    data-loading-text="&lt;span class='btn-text'&gt;Add to Cart&lt;/span&gt;"
                                                                                    data-original-title="Add to Cart"><span
                                                                                        class="btn-text">Add to
                                                                                        Cart</span></a>
                                                                                <a class="btn btn-wishlist"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 wishlist-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="wishlist.add('37110')"
                                                                                    data-original-title="Add to Wish List"><span
                                                                                        class="btn-text">Add to Wish
                                                                                        List</span></a>
                                                                                <a class="btn btn-compare"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 compare-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="compare.add('37110')"
                                                                                    data-original-title="Compare this Product"><span
                                                                                        class="btn-text">Compare this
                                                                                        Product</span></a>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="product-layout  has-zero-price">
                                                                    <div class="side-product">
                                                                        <div class="image">
                                                                            <a href="https://www.techlandbd.com/apple-iphone-16-a18-smartphone"
                                                                                class="product-img">
                                                                                <img src="https://www.techlandbd.com/image/cache/catalog/Apple/apple-iphone-16-a18-smartphone-1-120x120.jpg"
                                                                                    srcset="https://www.techlandbd.com/image/cache/catalog/Apple/apple-iphone-16-a18-smartphone-1-120x120.jpg 1x, https://www.techlandbd.com/image/cache/catalog/Apple/apple-iphone-16-a18-smartphone-1-240x240.jpg 2x"
                                                                                    width="120" height="120"
                                                                                    alt="Apple iPhone 16 A18 8GB 128GB 6.1 Inch Display Smartphone"
                                                                                    title="Apple iPhone 16 A18 8GB 128GB 6.1 Inch Display Smartphone"
                                                                                    class="img-first">
                                                                            </a>

                                                                            <div class="quickview-button">
                                                                                <a class="btn btn-quickview"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 quickview-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="quickview('38522')"
                                                                                    data-original-title="Quickview"><span
                                                                                        class="btn-text">Quickview</span></a>
                                                                            </div>
                                                                        </div>

                                                                        <div class="caption">
                                                                            <div class="name"><a
                                                                                    href="https://www.techlandbd.com/apple-iphone-16-a18-smartphone">Apple
                                                                                    iPhone 16 A18 8GB 128GB 6.1 Inch
                                                                                    Display Smartphone</a></div>

                                                                            <div class="price">
                                                                                <span class="price-normal">0৳</span>
                                                                            </div>
                                                                            <div class="rating no-rating">
                                                                                <div class="rating-stars">
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="button-group">
                                                                                <a class="btn btn-cart"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 cart-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="cart.add('38522', $(this).closest('.product-thumb').find('.button-group input[name=\'quantity\']').val());"
                                                                                    data-loading-text="&lt;span class='btn-text'&gt;Add to Cart&lt;/span&gt;"
                                                                                    data-original-title="Add to Cart"><span
                                                                                        class="btn-text">Add to
                                                                                        Cart</span></a>
                                                                                <a class="btn btn-wishlist"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 wishlist-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="wishlist.add('38522')"
                                                                                    data-original-title="Add to Wish List"><span
                                                                                        class="btn-text">Add to Wish
                                                                                        List</span></a>
                                                                                <a class="btn btn-compare"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 compare-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="compare.add('38522')"
                                                                                    data-original-title="Compare this Product"><span
                                                                                        class="btn-text">Compare this
                                                                                        Product</span></a>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="product-layout  ">
                                                                    <div class="side-product">
                                                                        <div class="image">
                                                                            <a href="https://www.techlandbd.com/hp-15-fd0283tu-13th-gen-i5-laptop"
                                                                                class="product-img">
                                                                                <img src="https://www.techlandbd.com/image/cache/catalog/HP/hp-15-fd0283tu-13th-gen-i5-laptop-120x120.jpg"
                                                                                    srcset="https://www.techlandbd.com/image/cache/catalog/HP/hp-15-fd0283tu-13th-gen-i5-laptop-120x120.jpg 1x, https://www.techlandbd.com/image/cache/catalog/HP/hp-15-fd0283tu-13th-gen-i5-laptop-240x240.jpg 2x"
                                                                                    width="120" height="120"
                                                                                    alt="HP 15-fd0283TU Core i5 13th Gen 16GB RAM 512GB SSD 15.6-inch FHD Laptop"
                                                                                    title="HP 15-fd0283TU Core i5 13th Gen 16GB RAM 512GB SSD 15.6-inch FHD Laptop"
                                                                                    class="img-first">
                                                                            </a>

                                                                            <div class="quickview-button">
                                                                                <a class="btn btn-quickview"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 quickview-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="quickview('42453')"
                                                                                    data-original-title="Quickview"><span
                                                                                        class="btn-text">Quickview</span></a>
                                                                            </div>
                                                                        </div>

                                                                        <div class="caption">
                                                                            <div class="name"><a
                                                                                    href="https://www.techlandbd.com/hp-15-fd0283tu-13th-gen-i5-laptop">HP
                                                                                    15-fd0283TU Core i5 13th Gen 16GB
                                                                                    RAM 512GB SSD 15.6-inch FHD
                                                                                    Laptop</a></div>

                                                                            <div class="price">
                                                                                <span class="price-new">75,500৳</span>
                                                                                <span class="price-old">83,500৳</span>
                                                                            </div>
                                                                            <div class="rating no-rating">
                                                                                <div class="rating-stars">
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="button-group">
                                                                                <a class="btn btn-cart"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 cart-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="cart.add('42453', $(this).closest('.product-thumb').find('.button-group input[name=\'quantity\']').val());"
                                                                                    data-loading-text="&lt;span class='btn-text'&gt;Add to Cart&lt;/span&gt;"
                                                                                    data-original-title="Add to Cart"><span
                                                                                        class="btn-text">Add to
                                                                                        Cart</span></a>
                                                                                <a class="btn btn-wishlist"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 wishlist-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="wishlist.add('42453')"
                                                                                    data-original-title="Add to Wish List"><span
                                                                                        class="btn-text">Add to Wish
                                                                                        List</span></a>
                                                                                <a class="btn btn-compare"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 compare-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="compare.add('42453')"
                                                                                    data-original-title="Compare this Product"><span
                                                                                        class="btn-text">Compare this
                                                                                        Product</span></a>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div class="product-layout  ">
                                                                    <div class="side-product">
                                                                        <div class="image">
                                                                            <a href="https://www.techlandbd.com/asus-vivobook-go-15-e1504fa-ryzen-5-laptop"
                                                                                class="product-img">
                                                                                <img src="https://www.techlandbd.com/image/cache/catalog/Asus/asus-vivobook-go-15-e1504fa-ryzen-5-laptop-120x120.jpg"
                                                                                    srcset="https://www.techlandbd.com/image/cache/catalog/Asus/asus-vivobook-go-15-e1504fa-ryzen-5-laptop-120x120.jpg 1x, https://www.techlandbd.com/image/cache/catalog/Asus/asus-vivobook-go-15-e1504fa-ryzen-5-laptop-240x240.jpg 2x"
                                                                                    width="120" height="120"
                                                                                    alt="ASUS Vivobook Go 15 E1504FA Ryzen 5 7520U, 8GB RAM, 512GB SSD, 15.6&quot; FHD Laptop"
                                                                                    title="ASUS Vivobook Go 15 E1504FA Ryzen 5 7520U, 8GB RAM, 512GB SSD, 15.6&quot; FHD Laptop"
                                                                                    class="img-first">
                                                                            </a>

                                                                            <div class="quickview-button">
                                                                                <a class="btn btn-quickview"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 quickview-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="quickview('40091')"
                                                                                    data-original-title="Quickview"><span
                                                                                        class="btn-text">Quickview</span></a>
                                                                            </div>
                                                                        </div>

                                                                        <div class="caption">
                                                                            <div class="name"><a
                                                                                    href="https://www.techlandbd.com/asus-vivobook-go-15-e1504fa-ryzen-5-laptop">ASUS
                                                                                    Vivobook Go 15 E1504FA Ryzen 5
                                                                                    7520U, 8GB RAM, 512GB SSD, 15.6" FHD
                                                                                    Laptop</a></div>

                                                                            <div class="price">
                                                                                <span
                                                                                    class="price-normal">66,500৳</span>
                                                                            </div>
                                                                            <div class="rating no-rating">
                                                                                <div class="rating-stars">
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="button-group">
                                                                                <a class="btn btn-cart"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 cart-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="cart.add('40091', $(this).closest('.product-thumb').find('.button-group input[name=\'quantity\']').val());"
                                                                                    data-loading-text="&lt;span class='btn-text'&gt;Add to Cart&lt;/span&gt;"
                                                                                    data-original-title="Add to Cart"><span
                                                                                        class="btn-text">Add to
                                                                                        Cart</span></a>
                                                                                <a class="btn btn-wishlist"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 wishlist-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="wishlist.add('40091')"
                                                                                    data-original-title="Add to Wish List"><span
                                                                                        class="btn-text">Add to Wish
                                                                                        List</span></a>
                                                                                <a class="btn btn-compare"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 compare-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="compare.add('40091')"
                                                                                    data-original-title="Compare this Product"><span
                                                                                        class="btn-text">Compare this
                                                                                        Product</span></a>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div
                                                                    class="product-layout  out-of-stock has-zero-price">
                                                                    <div class="side-product">
                                                                        <div class="image">
                                                                            <a href="https://www.techlandbd.com/chuwi-ubook-2-in-1-tablet-and-notebook"
                                                                                class="product-img">
                                                                                <img src="https://www.techlandbd.com/image/cache/catalog/Laptop/Chuwi/Chuwi%20UBook/chuwi-ubook-2-in-1-tablet-and-notebook-120x120.jpg"
                                                                                    srcset="https://www.techlandbd.com/image/cache/catalog/Laptop/Chuwi/Chuwi%20UBook/chuwi-ubook-2-in-1-tablet-and-notebook-120x120.jpg 1x, https://www.techlandbd.com/image/cache/catalog/Laptop/Chuwi/Chuwi%20UBook/chuwi-ubook-2-in-1-tablet-and-notebook-240x240.jpg 2x"
                                                                                    width="120" height="120"
                                                                                    alt="Chuwi UBook 11.6 inch Touch Screen 8GB RAM 256GB SSD 2 in 1 Tablet &amp; Notebook"
                                                                                    title="Chuwi UBook 11.6 inch Touch Screen 8GB RAM 256GB SSD 2 in 1 Tablet &amp; Notebook"
                                                                                    class="img-first">
                                                                            </a>

                                                                            <div class="quickview-button">
                                                                                <a class="btn btn-quickview"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 quickview-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="quickview('13641')"
                                                                                    data-original-title="Quickview"><span
                                                                                        class="btn-text">Quickview</span></a>
                                                                            </div>
                                                                        </div>

                                                                        <div class="caption">
                                                                            <div class="name"><a
                                                                                    href="https://www.techlandbd.com/chuwi-ubook-2-in-1-tablet-and-notebook">Chuwi
                                                                                    UBook 11.6 inch Touch Screen 8GB RAM
                                                                                    256GB SSD 2 in 1 Tablet &amp;
                                                                                    Notebook</a></div>

                                                                            <div class="price">
                                                                                <span class="price-normal">0৳</span>
                                                                            </div>
                                                                            <div class="rating no-rating">
                                                                                <div class="rating-stars">
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                    <span class="fa fa-stack"><i
                                                                                            class="fa fa-star-o fa-stack-2x"></i></span>
                                                                                </div>
                                                                            </div>
                                                                            <div class="button-group">
                                                                                <a class="btn btn-cart"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 cart-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="cart.add('13641', $(this).closest('.product-thumb').find('.button-group input[name=\'quantity\']').val());"
                                                                                    data-loading-text="&lt;span class='btn-text'&gt;Add to Cart&lt;/span&gt;"
                                                                                    data-original-title="Add to Cart"><span
                                                                                        class="btn-text">Add to
                                                                                        Cart</span></a>
                                                                                <a class="btn btn-wishlist"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 wishlist-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="wishlist.add('13641')"
                                                                                    data-original-title="Add to Wish List"><span
                                                                                        class="btn-text">Add to Wish
                                                                                        List</span></a>
                                                                                <a class="btn btn-compare"
                                                                                    data-toggle="tooltip"
                                                                                    data-tooltip-class="module-side_products-222 compare-tooltip"
                                                                                    data-placement="top" title=""
                                                                                    onclick="compare.add('13641')"
                                                                                    data-original-title="Compare this Product"><span
                                                                                        class="btn-text">Compare this
                                                                                        Product</span></a>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>


                    <div class="block-content "
                        style="padding: 10px 10px 10px 20px !important; margin-top: 20px; background-color: #F9FCFF; border-bottom: 1px #F1F3F4 solid !important;">





                        <h2>What is the Fantech Atom63 MK874 V2 MIZU RGB Mechanical Gaming Keyboard (Sky Blue) Price in
                            Bangladesh 2025?</h2>

                        The <a href="https://www.techlandbd.com/fantech">Fantech</a> Atom63 MK874V2 Price in BD is

                        <span> 2,300৳</span>
                        . This Fantech Atom63 MK874 V2 MIZU RGB Mechanical Gaming Keyboard (Sky Blue) Manufacturing by
                        <a href="https://www.techlandbd.com/fantech">Fantech</a> Comes With

                        <span> 1 Year Warranty &amp;</span>

                        <span> Based on 0 reviews.</span>
                        <a href="https://www.techlandbd.com/">Tech Land BD</a> Offers you Fantech Atom63 MK874V2 by

                        <span> 2,300৳ and its regular price is</span> 2,800৳
                        Which is also In Stock Now at our Showroom. Follow us on <a
                            href="http://www.facebook.com/techlandbd" target="_blank">Facebook </a> For Regular updates
                        &amp; Offer. Subscribe Our <a href="https://www.youtube.com/c/TechLandBangladesh"
                            target="_blank">YouTube </a> Channel for Product Reviews.




                        <div class="tags">
                            <span class="tags-title">Tags:</span>
                            <a
                                href="https://www.techlandbd.com/index.php?route=product/search&amp;tag=FANTECH">FANTECH</a>
                            <b>,</b> <a
                                href="https://www.techlandbd.com/index.php?route=product/search&amp;tag=ATOM63 MK874V2">ATOM63
                                MK874V2</a>
                            <b>,</b> <a
                                href="https://www.techlandbd.com/index.php?route=product/search&amp;tag=RGB">RGB</a>
                            <b>,</b> <a
                                href="https://www.techlandbd.com/index.php?route=product/search&amp;tag=MECHANICAL">MECHANICAL</a>
                            <b>,</b> <a
                                href="https://www.techlandbd.com/index.php?route=product/search&amp;tag=WIRED">WIRED</a>
                            <b>,</b> <a
                                href="https://www.techlandbd.com/index.php?route=product/search&amp;tag=GAMING">GAMING</a>
                            <b>,</b> <a
                                href="https://www.techlandbd.com/index.php?route=product/search&amp;tag=KEYBOARD">KEYBOARD</a>
                            <b>,</b> <a
                                href="https://www.techlandbd.com/index.php?route=product/search&amp;tag=SKY BLUE">SKY
                                BLUE</a>
                            <b>,</b> <a
                                href="https://www.techlandbd.com/index.php?route=product/search&amp;tag=FANTECH ATOM63 MK874V2 KEYBOARD">FANTECH
                                ATOM63 MK874V2 KEYBOARD</a>
                        </div>
                    </div>
                </div>
            </div>
        </div> <!--BOF Related Options--> <!--EOF Related Options-->
        <!-- End Special Offers modification -->

    </div><!-- .site-wrapper -->

</body>

</html>`;

    reply.type('text/html').send(productHTML);
});

// Start server
const start = async () => {
    try {
        await fastify.listen({ port: 5555, host: '0.0.0.0' });
        fastify.log.info('Server running at http://localhost:5555');
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();