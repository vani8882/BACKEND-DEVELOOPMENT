
const products = [
    {
        id: 1,
        name: "Wireless Headphones",
        category: "Electronics",
        price: 1999,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        description: "Enjoy high-quality wireless audio."
    },
    {
        id: 2,
        name: "Smart Watch",
        category: "Electronics",
        price: 2499,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        description: "Track your daily activities in style."
    },
    {
        id: 3,
        name: "Running Shoes",
        category: "Fashion",
        price: 1799,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
        description: "Comfortable shoes for everyday use."
    },
    {
        id: 4,
        name: "Classic Backpack",
        category: "Accessories",
        price: 1299,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
        description: "Carry your essentials wherever you go."
    },
    {
        id: 5,
        name: "Sunglasses",
        category: "Accessories",
        price: 799,
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500",
        description: "Complete your look with stylish shades."
    },
    {
        id: 6,
        name: "Casual T-Shirt",
        category: "Fashion",
        price: 599,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
        description: "A comfortable T-shirt for everyday wear."
    }
];



let cart = [];

try {
    const savedCart = JSON.parse(
        localStorage.getItem("shopEaseCart")
    );

    if (Array.isArray(savedCart)) {
        cart = savedCart
            .filter(item =>
                products.some(product => product.id === item.id) &&
                Number.isInteger(item.quantity) &&
                item.quantity > 0 &&
                item.quantity <= 99
            )
            .map(item => ({
                id: item.id,
                quantity: item.quantity
            }));
    }
} catch (error) {
    cart = [];
}

let appliedCoupon = null;




const productList = document.getElementById("product-list");

const categoryFilter =
    document.getElementById("category-filter");

const sortFilter =
    document.getElementById("sort-filter");

const productCount =
    document.getElementById("product-count");

const cartItems =
    document.getElementById("cart-items");

const cartCount =
    document.getElementById("cart-count");

const subtotalElement =
    document.getElementById("subtotal");

const discountElement =
    document.getElementById("discount");

const deliveryElement =
    document.getElementById("delivery");

const totalElement =
    document.getElementById("total");

const couponCode =
    document.getElementById("coupon-code");

const couponMessage =
    document.getElementById("coupon-message");

const applyCouponButton =
    document.getElementById("apply-coupon");

const checkoutButton =
    document.getElementById("checkout-btn");

const checkoutSection =
    document.getElementById("checkout");

const checkoutTotal =
    document.getElementById("checkout-total");

const checkoutForm =
    document.getElementById("checkout-form");

const orderMessage =
    document.getElementById("order-message");


function formatPrice(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2
    }).format(amount);
}



function getProduct(productId) {
    return products.find(product => product.id === productId);
}



function saveCart() {
    try {
        localStorage.setItem(
            "shopEaseCart",
            JSON.stringify(cart)
        );
    } catch (error) {
        console.error("Could not save cart:", error);
    }
}




function displayProducts() {

    
    let filteredProducts = [...products];

    const selectedCategory = categoryFilter.value;


    if (selectedCategory !== "all") {
        filteredProducts = filteredProducts.filter(
            product => product.category === selectedCategory
        );
    }

    
    const selectedSort = sortFilter.value;


    if (selectedSort === "low-high") {
        filteredProducts.sort(
            (a, b) => a.price - b.price
        );
    } else if (selectedSort === "high-low") {
        filteredProducts.sort(
            (a, b) => b.price - a.price
        );
    } else if (selectedSort === "name") {
        filteredProducts.sort(
            (a, b) => a.name.localeCompare(b.name)
        );
    }

    
    productCount.textContent =
        `${filteredProducts.length} products`;

    if (filteredProducts.length === 0) {
        productList.innerHTML =
            `<p>No products found.</p>`;

        return;
    }

    // Generate product cards dynamically.
    productList.innerHTML = filteredProducts.map(product => `
        <article class="product-card">

            <img
                src="${product.image}"
                alt="${product.name}"
                loading="lazy"
            >

            <div class="product-info">

                <p class="category">${product.category}</p>

                <h3>${product.name}</h3>

                <p class="product-description">
                    ${product.description}
                </p>

                <div class="product-bottom">

                    <span class="price">
                        ${formatPrice(product.price)}
                    </span>

                    <button
                        class="add-btn"
                        data-action="add"
                        data-id="${product.id}"
                    >
                        Add to Cart +
                    </button>

                </div>
            </div>
        </article>
    `).join("");
}



function addToCart(productId) {

    
    const existingItem = cart.find(
        item => item.id === productId
    );

    if (existingItem) {

        
        if (existingItem.quantity >= 99) {
            alert("Maximum quantity is 99.");
            return;
        }

        existingItem.quantity++;

    } else {

    
        cart.push({
            id: productId,
            quantity: 1
        });
    }

   
    saveCart();
    displayCart();
}




function changeQuantity(productId, change) {

    const item = cart.find(
        item => item.id === productId
    );

    if (!item) {
        return;
    }

    
    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {

        // Remove the product if quantity becomes zero.
        removeFromCart(productId);

        return;
    }

    if (newQuantity > 99) {
        alert("Maximum quantity is 99.");
        return;
    }

    item.quantity = newQuantity;

    saveCart();
    displayCart();
}




function removeFromCart(productId) {

    // Keep all products except the selected product.
    cart = cart.filter(
        item => item.id !== productId
    );

    saveCart();
    displayCart();
}



function calculateTotals() {

    // Calculate subtotal using product price × quantity.
    const subtotal = cart.reduce((sum, item) => {

        const product = getProduct(item.id);

        return sum + product.price * item.quantity;

    }, 0);

    let discount = 0;

    if (appliedCoupon === "SAVE10") {
        discount = subtotal * 0.10;
    } else if (appliedCoupon === "SAVE20") {
        discount = subtotal * 0.20;
    }

    discount = Math.round(discount * 100) / 100;

    
    const delivery = subtotal === 0
        ? 0
        : subtotal >= 2000
            ? 0
            : 99;

    
    const total = subtotal - discount + delivery;

    return {
        subtotal,
        discount,
        delivery,
        total
    };
}




function displayCart() {

    // Calculate total number of individual items.
    const totalItems = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    cartCount.textContent = totalItems;

    // Display an empty-cart message if necessary.
    if (cart.length === 0) {

        cartItems.innerHTML = `
            <div class="empty-cart">
                <h3>Your cart is empty 🛒</h3>
                <p>Add some products to start shopping!</p>
            </div>
        `;

    } else {

        
        cartItems.innerHTML = cart.map(item => {

            const product = getProduct(item.id);

            const itemTotal =
                product.price * item.quantity;

            return `
                <div class="cart-item">

                    <img
                        src="${product.image}"
                        alt="${product.name}"
                        loading="lazy"
                    >

                    <div class="cart-item-info">

                        <h4>${product.name}</h4>

                        <p>${formatPrice(product.price)} each</p>

                        <div class="quantity-controls">

                            <button
                                data-action="decrease"
                                data-id="${product.id}"
                                aria-label="Decrease quantity"
                            >−</button>

                            <span>${item.quantity}</span>

                            <button
                                data-action="increase"
                                data-id="${product.id}"
                                aria-label="Increase quantity"
                            >+</button>

                        </div>

                        <button
                            class="remove-btn"
                            data-action="remove"
                            data-id="${product.id}"
                        >
                            Remove
                        </button>

                    </div>

                    <strong>${formatPrice(itemTotal)}</strong>

                </div>
            `;

        }).join("");
    }

    // Update all price calculations.
    updateSummary();
}




function updateSummary() {

    const totals = calculateTotals();

    subtotalElement.textContent =
        formatPrice(totals.subtotal);

    discountElement.textContent =
        "-" + formatPrice(totals.discount);

    deliveryElement.textContent =
        formatPrice(totals.delivery);

    totalElement.textContent =
        formatPrice(totals.total);

    checkoutTotal.textContent =
        formatPrice(totals.total);

    checkoutButton.disabled = cart.length === 0;

    orderMessage.textContent = "";
}



function applyCoupon() {

    const code = couponCode.value.trim().toUpperCase();


    if (cart.length === 0) {

        couponMessage.textContent =
            "Add products before applying a coupon.";

        appliedCoupon = null;
        updateSummary();

        return;
    }

    // Check the coupon code.
    if (code === "SAVE10" || code === "SAVE20") {

        appliedCoupon = code;

        couponMessage.textContent =
            `${code} applied successfully!`;

        couponMessage.style.color = "green";

    } else {

        appliedCoupon = null;

        couponMessage.textContent =
            "Invalid coupon. Try SAVE10 or SAVE20.";

        couponMessage.style.color = "red";
    }

    updateSummary();
}




function openCheckout() {

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    // Update the latest order total.
    updateSummary();

    // Scroll to the checkout form.
    checkoutSection.scrollIntoView({
        behavior: "smooth"
    });
}




function placeOrder(event) {

    // Prevent the browser from reloading the page.
    event.preventDefault();

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const customerName =
        document.getElementById("customer-name").value.trim();

    const customerEmail =
        document.getElementById("customer-email").value.trim();

    const customerAddress =
        document.getElementById("customer-address").value.trim();

    if (!customerName || !customerEmail || !customerAddress) {
        alert("Please fill in all checkout fields.");
        return;
    }

    const totals = calculateTotals();


    orderMessage.textContent =
        `Thank you, ${customerName}! Your demo order has been placed successfully. Total: ${formatPrice(totals.total)}.`;

    cart = [];
    appliedCoupon = null;

    couponCode.value = "";
    couponMessage.textContent = "";

    saveCart();
    displayCart();

    
    checkoutForm.reset();

    
    orderMessage.textContent =
        `Thank you, ${customerName}! Your demo order has been placed successfully. Total: ${formatPrice(totals.total)}.`;
}



categoryFilter.addEventListener(
    "change",
    displayProducts
);

sortFilter.addEventListener(
    "change",
    displayProducts
);

productList.addEventListener("click", function(event) {

    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const productId = Number(button.dataset.id);

    if (button.dataset.action === "add") {
        addToCart(productId);
    }
});


cartItems.addEventListener("click", function(event) {

    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const productId = Number(button.dataset.id);

    switch (button.dataset.action) {

        case "increase":
            changeQuantity(productId, 1);
            break;

        case "decrease":
            changeQuantity(productId, -1);
            break;

        case "remove":
            removeFromCart(productId);
            break;
    }
});


applyCouponButton.addEventListener(
    "click",
    applyCoupon
);

couponCode.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        event.preventDefault();
        applyCoupon();
    }
});

checkoutButton.addEventListener(
    "click",
    openCheckout
);

checkoutForm.addEventListener(
    "submit",
    placeOrder
);



displayProducts();


displayCart();