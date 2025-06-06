import { randomInt } from 'crypto';
import Fastify, { FastifyInstance } from 'fastify';

const fastify: FastifyInstance = Fastify({
    logger: true
});

const numberOfPages = 20;
const productsPerPage = 20;

function generateProducts(page: number) {
    const pageOffset = (page - 1) * productsPerPage;
    return Array.from({ length: productsPerPage }, (_, i) => ({
        name: `Laptop Model ${ pageOffset + i + 1}`,
        price: Math.floor(Math.random() * 100000) + 20000, // Random price between 20,000 and 120,000
        image: `https://example.com/laptop-${pageOffset + i + 1}.jpg`,
        url: `http://localhost:5555/laptop-model-${pageOffset + i + 1}`,
        slug: `laptop-model-${pageOffset + i + 1}`
    }));
}

// HTML template
const generateHTML = (page: number) => {
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
                ${generateProducts(page).map(laptop => `
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

// Routes
fastify.get('/', async (request, reply) => {
    const { page } = request.query as { page: string | undefined };
    const currentPage = page ? parseInt(page, 10) : 1;
    reply.type('text/html').send(generateHTML(currentPage));
});

// Individual product routes
fastify.get('/:slug', async (request, reply) => {
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
        </body>
        </html>
    `;

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