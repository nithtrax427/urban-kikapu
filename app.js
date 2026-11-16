// Sample Inventory (Using Placehold.co until you upload your real product photos)
const products = [
  {
    id: 1,
    name: "Air Retro Street Sneakers",
    category: "sneakers",
    price: 3800,
    sizes: ["EU 40", "EU 41", "EU 42", "EU 43", "EU 44"],
    image: "https://placehold.co/400x300?text=Air+Retro+Sneakers"
  },
  {
    id: 2,
    name: "Classic White Court Trainers",
    category: "sneakers",
    price: 3200,
    sizes: ["EU 38", "EU 39", "EU 40", "EU 41", "EU 42"],
    image: "https://placehold.co/400x300?text=Court+Trainers"
  },
  {
    id: 3,
    name: "Heavyweight Graphic Hoodie",
    category: "clothing",
    price: 2200,
    sizes: ["S", "M", "L", "XL"],
    image: "https://placehold.co/400x300?text=Graphic+Hoodie"
  },
  {
    id: 4,
    name: "Relaxed Cargo Joggers",
    category: "clothing",
    price: 1850,
    sizes: ["M", "L", "XL"],
    image: "https://placehold.co/400x300?text=Cargo+Joggers"
  },
  {
    id: 5,
    name: "Non-Stick Silicone Utensil Set (12 Pcs)",
    category: "kitchen",
    price: 1650,
    sizes: [],
    image: "https://placehold.co/400x300?text=Utensil+Set"
  },
  {
    id: 6,
    name: "Stainless Steel Chef Knife Set",
    category: "kitchen",
    price: 2400,
    sizes: [],
    image: "https://placehold.co/400x300?text=Chef+Knife+Set"
  },
  {
    id: 7,
    name: "Plush Anti-Slip Living Room Mat",
    category: "home",
    price: 2900,
    sizes: ["150x200 cm", "200x300 cm"],
    image: "https://placehold.co/400x300?text=Living+Room+Mat"
  },
  {
    id: 8,
    name: "Absorbent Bathroom Door Mat Set",
    category: "home",
    price: 950,
    sizes: [],
    image: "https://placehold.co/400x300?text=Bathroom+Mat"
  }
];

let cart = JSON.parse(localStorage.getItem("urbanKikapuCart")) || [];
let activeCategory = "all";

const productGrid = document.getElementById("productGrid");
const cartItemsEl = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cartCount");
const cartTotalEl = document.getElementById("cartTotal");
const searchInput = document.getElementById("searchInput");

// Render Product Cards
function renderProducts() {
  const query = searchInput.value.toLowerCase().trim();
  const filtered = products.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:#64748b; padding: 40px 0;">No products found matching "${searchInput.value}".</p>`;
    return;
  }

  productGrid.innerHTML = filtered
    .map((item) => {
      const sizeDropdown =
        item.sizes.length > 0
          ? `<select class="size-select" id="size-${item.id}">
              ${item.sizes.map((s) => `<option value="${s}">Option: ${s}</option>`).join("")}
            </select>`
          : "";

      return `
        <div class="card">
          <img src="${item.image}" alt="${item.name}" loading="lazy" />
          <div class="card-body">
            <span class="badge">${item.category}</span>
            <h3 class="card-title">${item.name}</h3>
            <p class="card-price">KES ${item.price.toLocaleString()}</p>
            ${sizeDropdown}
            <button class="add-btn" onclick="addToCart(${item.id})">Add to Kikapu</button>
          </div>
        </div>
      `;
    })
    .join("");
}

// Add Item to Cart
function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const sizeEl = document.getElementById(`size-${productId}`);
  const selectedSize = sizeEl ? sizeEl.value : "Standard";
  const cartKey = `${product.id}-${selectedSize}`;

  const existing = cart.find((item) => item.cartKey === cartKey);
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

// Update Quantity
function changeQty(cartKey, delta) {
  const item = cart.find((i) => i.cartKey === cartKey);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((i) => i.cartKey !== cartKey);
  }
  saveAndRenderCart();
}

// Render Cart UI
function saveAndRenderCart() {
  localStorage.setItem("urbanKikapuCart", JSON.stringify(cart));

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  cartCountEl.textContent = totalItems;
  cartTotalEl.textContent = totalAmount.toLocaleString();

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p style="color:#64748b; text-align:center; margin-top:40px;">Your kikapu is empty.</p>`;
    return;
  }

  cartItemsEl.innerHTML = cart
    .map(
      (item) => `
      <div class="cart-item">
        <div>
          <strong>${item.name}</strong>
          <div style="font-size:0.85rem; color:#64748b;">
            ${item.size !== "Standard" ? `Size: ${item.size} • ` : ""}KES ${item.price.toLocaleString()}
          </div>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeQty('${item.cartKey}', -1)">-</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.cartKey}', 1)">+</button>
        </div>
      </div>
    `
    )
    .join("");
}

// Category Button Events
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelector(".filter-btn.active")?.classList.remove("active");
    btn.classList.add("active");
    activeCategory = btn.dataset.category;
    renderProducts();
  });
});

searchInput.addEventListener("input", renderProducts);

// Drawer Toggle
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");

function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("open");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");
}

document.getElementById("openCartBtn").addEventListener("click", openCart);
document.getElementById("closeCartBtn").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

// WhatsApp Checkout
document.getElementById("whatsappCheckoutBtn").addEventListener("click", () => {
  if (cart.length === 0) return alert("Add items to your kikapu first!");

  const name = document.getElementById("customerName").value.trim() || "Customer";
  const location = document.getElementById("customerLocation").value.trim() || "Not specified";

  const orderLines = cart
    .map((i) => `- ${i.name} (${i.size}) x${i.qty} = KES ${(i.price * i.qty).toLocaleString()}`)
    .join("\n");
  const total = cartTotalEl.textContent;

  const rawMessage = `Hello Urban Kikapu! I'd like to place an order:\n\n*Name:* ${name}\n*Delivery:* ${location}\n\n*Items:*\n${orderLines}\n\n*Total:* KES ${total}`;
  const businessWhatsApp = "254799299478";
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${businessWhatsApp}&text=${encodeURIComponent(rawMessage)}`;

  const newWindow = window.open(whatsappUrl, "_blank");
  if (!newWindow || newWindow.closed || typeof newWindow.closed === "undefined") {
    window.location.href = whatsappUrl;
  }
});

// M-PESA Express Placeholder (Connects to backend STK Push endpoint later)
document.getElementById("mpesaCheckoutBtn").addEventListener("click", () => {
  if (cart.length === 0) return alert("Add items to your kikapu first!");
  const phone = document.getElementById("mpesaPhone").value.trim();

  const kenyanPhoneRegex = /^(?:254|\+254|0)?([71][0-9]{8})$/;
  if (!kenyanPhoneRegex.test(phone)) {
    return alert("Please enter a valid Safaricom M-PESA number (e.g., 0712345678).");
  }

  alert(
    `STK Push Trigger Ready!\n\nIn production, this sends KES ${cartTotalEl.textContent} prompt to ${phone} via Daraja or IntaSend API.`
  );
});

// Initialize
renderProducts();
saveAndRenderCart();
