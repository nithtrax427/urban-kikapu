
// ============================================
// URBAN KIKAPU - MAIN JAVASCRIPT
// ============================================

// PRODUCT INVENTORY


const products = [
  {
    id: 1,
    name: "Air Retro Street Sneakers",
    category: "sneakers",
    price: 3800,
    description: "Stylish everyday sneakers designed for comfort and streetwear fashion.",
    availability: "In Stock",
    sizes: ["EU 40", "EU 41", "EU 42", "EU 43", "EU 44"],
    images: ["images/air retro sneakers 1.webp", "images/air retro sneakers 2.webp", "images/air retro sneakers 3.jpeg"]
  },
  {
    id: 2,
    name: "Classic White Court Trainers",
    category: "sneakers",
    price: 3200,
    description: "Clean white trainers for casual outfits and everyday wear.",
    availability: "In Stock",
    sizes: ["EU 38", "EU 39", "EU 40", "EU 41", "EU 42"],
    images: ["images/classic white court trainers 1.webp", "images/classic white court trainers 2.jpeg"]
  },
  {
    id: 3,
    name: "Heavyweight Graphic Hoodie",
    category: "clothing",
    price: 2200,
    description: "A comfortable graphic hoodie for relaxed everyday styling.",
    availability: "In Stock",
    sizes: ["S", "M", "L", "XL"],
    images: ["images/graphic hoodie 1.webp", "images/graphic hoodie 2.webp"]
  },
  {
    id: 4,
    name: "Relaxed Cargo Joggers",
    category: "clothing",
    price: 1850,
    description: "Relaxed-fit cargo joggers combining comfort and practical style.",
    availability: "In Stock",
    sizes: ["M", "L", "XL"],
    images: ["images/relaxed cargo joggers 1.webp", "images/relaxed cargo joggers 2.webp"]
  },
  {
    id: 5,
    name: "Non-Stick Silicone Utensil Set (12 Pcs)",
    category: "kitchen",
    price: 1650,
    description: "A versatile 12-piece silicone utensil set for everyday kitchen tasks.",
    availability: "In Stock",
    sizes: [],
    images: ["images/non-stock silicone utensil 1.webp", "images/non-stock silicone utensil 2.webp"]
  },
  {
    id: 6,
    name: "Stainless Steel Chef Knife Set",
    category: "kitchen",
    price: 2400,
    description: "A practical stainless steel knife set for everyday food preparation.",
    availability: "In Stock",
    sizes: [],
    images: ["images/stain less still chef knife.webp"]
  },
  {
    id: 7,
    name: "Plush Anti-Slip Living Room Mat",
    category: "home",
    price: 2900,
    description: "A soft living room mat designed to add comfort to your home.",
    availability: "In Stock",
    sizes: ["150x200 cm", "200x300 cm"],
    images: ["images/plus anti-slipliving room mat.jpeg"]
  },
  {
    id: 8,
    name: "Absorbent Bathroom Door Mat Set",
    category: "home",
    price: 950,
    description: "An absorbent bathroom mat set for a more comfortable bathroom.",
    availability: "In Stock",
    sizes: [],
    images: ["images/absorbent bathroom door mat set 1.jpeg", "images/absorbent bathroom door mat set 2.jpeg"]
  }
];

// ============================================
// APPLICATION STATE
// ============================================

let cart = [];

try {
  const savedCart = JSON.parse(
    localStorage.getItem("urbanKikapuCart")
  );

  if (Array.isArray(savedCart)) {
    cart = savedCart.filter(
      item =>
        item &&
        Number.isInteger(item.id) &&
        Number.isFinite(item.price) &&
        Number.isInteger(item.qty) &&
        item.qty > 0
    );
  }
} catch (error) {
  console.warn("Could not load saved cart:", error);
}

let activeCategory = "all";

// ============================================
// HTML ELEMENTS
// ============================================

const productGrid = document.getElementById("productGrid");
const cartItemsEl = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cartCount");
const cartTotalEl = document.getElementById("cartTotal");
const searchInput = document.getElementById("searchInput");

const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");

// ============================================
// PRODUCT DISPLAY
// ============================================

function renderProducts() {
  if (!productGrid) return;

  const query = searchInput
    ? searchInput.value.toLowerCase().trim()
    : "";

  const filtered = products.filter(item => {
    const matchesCategory =
      activeCategory === "all" ||
      item.category === activeCategory;

    const matchesSearch =
      item.name.toLowerCase().includes(query) ||
      (item.description || "").toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    productGrid.innerHTML = `
      <p style="grid-column:1/-1;text-align:center;padding:40px 0;">
        No products found.
      </p>
    `;
    return;
  }

  productGrid.innerHTML = filtered.map(item => {
    const sizeDropdown = item.sizes && item.sizes.length > 0
      ? `
        <select class="size-select" id="size-${item.id}">
          ${item.sizes.map(size => `
            <option value="${size}">Option: ${size}</option>
          `).join("")}
        </select>
      `
      : "";

    return `
      <div class="card">

        <div class="product-gallery">
          <img
            id="product-image-${item.id}"
            src="${item.images[0]}"
            alt="${item.name}"
            loading="lazy"
          />

          <div class="product-thumbnails">
            ${item.images.map((src, index) => `
              <button
                type="button"
                class="product-thumb"
                onclick="setProductImage(${item.id}, ${index})"
                aria-label="View image ${index + 1}"
              >
                <img
                  src="${src}"
                  alt="${item.name} view ${index + 1}"
                  loading="lazy"
                />
              </button>
            `).join("")}
          </div>
        </div>

        <div class="card-body">

          <span class="badge">${item.category}</span>

          <h3 class="card-title">${item.name}</h3>

          <p class="product-description">
            ${item.description || ""}
          </p>

          <p class="stock-status">
            ${item.availability || "Availability not confirmed"}
          </p>

          <p class="card-price">
            KES ${item.price.toLocaleString()}
          </p>

          ${sizeDropdown}

          <button
            class="add-btn"
            onclick="addToCart(${item.id})"
          >
            Add to Kikapu
          </button>

        </div>
      </div>
    `;
  }).join("");
}
// ============================================
// PRODUCT IMAGE GALLERY
// ============================================

function setProductImage(productId, imageIndex) {
  const product = products.find(
    item => item.id === productId
  );

  if (!product || !product.images[imageIndex]) return;

  const mainImage = document.getElementById(
    `product-image-${productId}`
  );

  if (mainImage) {
    mainImage.src = product.images[imageIndex];
  }
}

// ============================================
// SHOPPING CART
// ============================================

function addToCart(productId) {
  const product = products.find(
    item => item.id === productId
  );

  if (!product) return;

  const sizeEl = document.getElementById(
    `size-${productId}`
  );

  const selectedSize = sizeEl
    ? sizeEl.value
    : "Standard";

  const cartKey = `${product.id}-${selectedSize}`;

  const existing = cart.find(
    item => item.cartKey === cartKey
  );

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      cartKey,
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      qty: 1
    });
  }

  saveAndRenderCart();
  openCart();
}

function changeQty(cartKey, delta) {
  const item = cart.find(
    product => product.cartKey === cartKey
  );

  if (!item) return;

  item.qty += delta;

  if (item.qty <= 0) {
    cart = cart.filter(
      product => product.cartKey !== cartKey
    );
  }

  saveAndRenderCart();
}

function saveAndRenderCart() {
  localStorage.setItem(
    "urbanKikapuCart",
    JSON.stringify(cart)
  );

  const totalItems = cart.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  if (cartCountEl) {
    cartCountEl.textContent = totalItems;
  }

  if (cartTotalEl) {
    cartTotalEl.textContent =
      totalAmount.toLocaleString();
  }

  if (!cartItemsEl) return;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `
      <p style="color:#64748b;text-align:center;margin-top:40px;">
        Your kikapu is empty.
      </p>
    `;
    return;
  }

  cartItemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">

      <div>
        <strong>${item.name}</strong>

        <div style="font-size:0.85rem;color:#64748b;">
          ${item.size !== "Standard"
            ? `Size: ${item.size} • `
            : ""}
          KES ${item.price.toLocaleString()}
        </div>
      </div>

      <div class="qty-controls">

        <button
          class="qty-btn"
          onclick="changeQty('${item.cartKey}', -1)"
        >-</button>

        <span>${item.qty}</span>

        <button
          class="qty-btn"
          onclick="changeQty('${item.cartKey}', 1)"
        >+</button>

      </div>

    </div>
  `).join("");
}

// ============================================
// CATEGORY FILTERS
// ============================================

function selectCategory(category) {
  const validCategories = [
    "all",
    "sneakers",
    "clothing",
    "kitchen",
    "home"
  ];

  if (!validCategories.includes(category)) return;

  activeCategory = category;

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle(
      "active",
      btn.dataset.category === category
    );
  });

  renderProducts();
}

// Existing category filter buttons
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    selectCategory(btn.dataset.category);
  });
});

// NEW: Featured shopping category cards
document.querySelectorAll("[data-category-link]").forEach(card => {
  card.addEventListener("click", () => {
    const category = card.dataset.categoryLink;
    selectCategory(category);
  });
});

// ============================================
// PRODUCT SEARCH
// ============================================

if (searchInput) {
  searchInput.addEventListener("input", renderProducts);
}

// ============================================
// CART DRAWER
// ============================================

function openCart() {
  if (cartDrawer) {
    cartDrawer.classList.add("open");
  }

  if (cartOverlay) {
    cartOverlay.classList.add("open");
  }
}

function closeCart() {
  if (cartDrawer) {
    cartDrawer.classList.remove("open");
  }

  if (cartOverlay) {
    cartOverlay.classList.remove("open");
  }
}

document.getElementById("openCartBtn")
  ?.addEventListener("click", openCart);

document.getElementById("closeCartBtn")
  ?.addEventListener("click", closeCart);

cartOverlay?.addEventListener("click", closeCart);

// ============================================
// WHATSAPP CHECKOUT
// ============================================

document.getElementById("whatsappCheckoutBtn")
  ?.addEventListener("click", () => {

    if (cart.length === 0) {
      alert("Add items to your kikapu first!");
      return;
    }

    const name =
      document.getElementById("customerName")
        ?.value.trim() || "Customer";

    const location =
      document.getElementById("customerLocation")
        ?.value.trim() || "Not specified";

    const orderLines = cart.map(item =>
      `- ${item.name} (${item.size}) x${item.qty} = KES ${(item.price * item.qty).toLocaleString()}`
    ).join("\n");

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    ).toLocaleString();

    const rawMessage = `
Hello Urban Kikapu! I'd like to place an order:

*Name:* ${name}
*Delivery:* ${location}

*Items:*
${orderLines}

*Total:* KES ${total}
    `.trim();

    const businessWhatsApp = "254799299478";

    const whatsappUrl =
      `https://api.whatsapp.com/send?phone=${businessWhatsApp}&text=${encodeURIComponent(rawMessage)}`;

    const newWindow = window.open(
      whatsappUrl,
      "_blank"
    );

    if (
      !newWindow ||
      newWindow.closed ||
      typeof newWindow.closed === "undefined"
    ) {
      window.location.href = whatsappUrl;
    }
  });

// ============================================
// M-PESA CHECKOUT PLACEHOLDER
// ============================================

document.getElementById("mpesaCheckoutBtn")
  ?.addEventListener("click", () => {

    if (cart.length === 0) {
      alert("Add items to your kikapu first!");
      return;
    }

    const phone =
      document.getElementById("mpesaPhone")
        ?.value.trim() || "";

    const kenyanPhoneRegex =
      /^(?:254|\+254|0)?([71][0-9]{8})$/;

    if (!kenyanPhoneRegex.test(phone)) {
      alert(
        "Please enter a valid Safaricom M-PESA number (e.g., 0712345678)."
      );
      return;
    }

    alert(
      `M-PESA integration is not connected yet.\n\nOrder total: KES ${cartTotalEl?.textContent || "0"}\nPhone: ${phone}\n\nReal STK Push payments will be implemented through a secure backend.`
    );
  });

// ============================================
// INITIALIZE WEBSITE
// ============================================

renderProducts();
saveAndRenderCart();
