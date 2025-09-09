// Ganti dengan URL spreadsheet Anda
const SPREADSHEET_URL = 'https://api.allorigins.win/get?url=' + 
  encodeURIComponent('https://script.google.com/macros/s/AKfycbyMH6fVVmj2X2rZn-APy6c_5-FCOb4kg6q9KWPim1ONfXbMLfQfHkW4hIDL1bQKu0Q0kQ/exec');

let products = [];
let cart = [];

// Ambil data dari spreadsheet
async function fetchProducts() {
  try {
    const response = await fetch(SPREADSHEET_URL);
    const data = await response.json();
    const csvContent = data.contents;
    
    // Parse CSV
    const rows = csvContent.split('\n').slice(1);
            products = rows.map(row => {
            const [id, nama_produk, harga, stok, deskripsi, gambar_url] = row.split(',');
            return {
                id,
                nama_produk,
                harga: parseInt(harga),
                stok: parseInt(stok),
                deskripsi,
                gambar_url
            };
        }).filter(p => p.id); // Filter row kosong
        
        renderProducts();
    } catch (error) {
        console.error('Gagal mengambil data:', error);
        document.getElementById('products-container').innerHTML = 
            '<p>Gagal memuat produk. Pastikan spreadsheet sudah dipublikasikan.</p>';
    }
}

// Tampilkan produk
function renderProducts() {
    const container = document.getElementById('products-container');
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.gambar_url}" alt="${product.nama_produk}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.nama_produk}</h3>
                <p class="product-price">Rp ${product.harga.toLocaleString('id-ID')}</p>
                <p class="product-description">${product.deskripsi}</p>
                <p>Stok: ${product.stok}</p>
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    Tambah ke Keranjang
                </button>
            </div>
        </div>
    `).join('');
}

// Tambah ke keranjang
function addToCart(productId) {
    const product = products.find(p => p.id == productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id == productId);
    
    if (existingItem) {
        if (existingItem.quantity < product.stok) {
            existingItem.quantity++;
        } else {
            alert('Stok tidak mencukupi!');
            return;
        }
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCartUI();
    saveCart();
}

// Update tampilan keranjang
function updateCartUI() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').textContent = cartCount;
    
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div>
                ${item.nama_produk} (x${item.quantity})
            </div>
            <div>
                Rp ${(item.harga * item.quantity).toLocaleString('id-ID')}
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.harga * item.quantity), 0);
    document.getElementById('cart-total').textContent = total.toLocaleString('id-ID');
}

// Simpan keranjang ke localStorage
function saveCart() {
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
}

// Muat keranjang dari localStorage
function loadCart() {
    const savedCart = localStorage.getItem('shoppingCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// Tampilkan modal keranjang
function showCart() {
    document.getElementById('cart-modal').style.display = 'block';
}

// Tutup modal keranjang
function closeCart() {
    document.getElementById('cart-modal').style.display = 'none';
}

// Proses checkout (sederhana)
function checkout() {
    if (cart.length === 0) {
        alert('Keranjang belanja kosong!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.harga * item.quantity), 0);
    const message = `Pesanan Anda:\n\n${cart.map(item => 
        `${item.nama_produk} x${item.quantity} = Rp ${(item.harga * item.quantity).toLocaleString('id-ID')}`
    ).join('\n')}\n\nTotal: Rp ${total.toLocaleString('id-ID')}\n\nTerima kasih telah berbelanja!`;
    
    alert(message);
    
    // Reset keranjang
    cart = [];
    saveCart();
    updateCartUI();
    closeCart();
}

// Inisialisasi
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    loadCart();

});




