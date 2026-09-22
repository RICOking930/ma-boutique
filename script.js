const firebaseConfig = {
  apiKey: "AIzaSyAujAtX1jWdgTpPrqVI6bD1s6792WiOVgI",
  authDomain: "ma-boutique-33a29.firebaseapp.com",
  databaseURL: "https://ma-boutique-33a29-default-rtdb.firebaseio.com",
  projectId: "ma-boutique-33a29",
  storageBucket: "ma-boutique-33a29.firebasestorage.app",
  messagingSenderId: "458036073354",
  appId: "1:458036073354:web:0908ef9d10424b6851ae73"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const WHATSAPP_NUMBER = "+2250140587890";

let products = [];
let cart = [];
let selectedCategory = 'all';

// Écoute en direct des articles publiés par l'Admin
database.ref('products').on('value', (snapshot) => {
    const data = snapshot.val();
    products = [];
    if (data) {
        Object.keys(data).forEach(key => {
            products.push({ id: key, ...data[key] });
        });
    }
    renderProducts();
});

function renderProducts() {
    const grid = document.getElementById('articles-container');
    grid.innerHTML = '';

    const searchKeyword = document.getElementById('search-input').value.toLowerCase();

    const filtered = products.filter(p => {
        const matchesCategory = (selectedCategory === 'all' || p.category === selectedCategory);
        const matchesSearch = p.title.toLowerCase().includes(searchKeyword);
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#888;">Aucun article disponible pour le moment.</p>';
        return;
    }

    filtered.forEach(p => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${p.image}" alt="${p.title}">
            <span class="badge-category">${p.category}</span>
            <h3>${p.title}</h3>
            <div class="product-price">${p.price.toLocaleString()} FCFA</div>
            <div class="product-size">Tailles : ${p.size}</div>
            <button class="btn-add-cart" onclick="addToCart('${p.id}')">Ajouter au panier</button>
        `;
        grid.appendChild(card);
    });
}

function filterCategory(cat, btn) {
    selectedCategory = cat;
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProducts();
}

function filterProducts() {
    renderProducts();
}

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('open');
}

function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (product) {
        cart.push(product);
        updateCart();
        toggleCart();
    }
}

function updateCart() {
    document.getElementById('cart-count').innerText = cart.length;
    const cartItems = document.getElementById('cart-items');
    cartItems.innerHTML = '';

    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.marginBottom = '10px';
        div.innerHTML = `
            <div>
                <strong>${item.title}</strong><br>
                <small>${item.price.toLocaleString()} FCFA</small>
            </div>
            <button onclick="removeFromCart(${index})" style="border:none; background:none; color:red; cursor:pointer; font-weight:bold;">&times;</button>
        `;
        cartItems.appendChild(div);
    });

    document.getElementById('cart-total-price').innerText = total.toLocaleString() + ' FCFA';
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
}

function sendOrderToWhatsApp() {
    if (cart.length === 0) {
        alert("Votre panier est vide !");
        return;
    }

    const name = document.getElementById('client-name').value;
    const phone = document.getElementById('client-phone').value;
    const zone = document.getElementById('client-zone').value;
    const payment = document.getElementById('payment-method').value;

    if (!name || !phone) {
        alert("Veuillez remplir votre nom et numéro.");
        return;
    }

    let message = `Bonjour Elegance Boutique, je passe une commande :\n\n`;
    message += `👤 *Nom :* ${name}\n`;
    message += `📞 *Téléphone :* ${phone}\n`;
    message += `📍 *Zone :* ${zone}\n`;
    message += `💳 *Paiement :* ${payment}\n\n`;
    message += `🛍️ *Articles :*\n`;

    let total = 0;
    cart.forEach((item, i) => {
        message += `${i + 1}. ${item.title} - ${item.price.toLocaleString()} FCFA\n`;
        total += item.price;
    });

    message += `\n💰 *Total : ${total.toLocaleString()} FCFA*`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
}
