// Récupère la liste enregistrée ou démarre avec une liste vide
let listeArticles = JSON.parse(localStorage.getItem('mes_vetements')) || [];
let panier = [];

// Numéro WhatsApp configuré au format international (+225)
const numeroWhatsApp = "2250140587890";

// 1. Afficher les vêtements sur la boutique
function afficherArticles(articles = listeArticles) {
    const grille = document.getElementById('grille-produits');
    grille.innerHTML = '';

    if (articles.length === 0) {
        grille.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #777; padding: 40px 0;">Aucun article disponible pour le moment.</p>`;
        return;
    }

    articles.forEach(article => {
        const carte = document.createElement('div');
        carte.className = 'carte-produit';
        
        const message = `Bonjour ELEGANCE BOUTIQUE BY ROXANE, je souhaite commander cet article :\n- Nom : ${article.nom}\n- Prix : ${article.prix.toLocaleString()} FCFA`;
        const lienWhatsapp = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(message)}`;

        carte.innerHTML = `
            <img src="${article.image}" alt="${article.nom}">
            <div class="infos-produit">
                <span class="badge-categorie">${article.categorie}</span>
                <h3>${article.nom}</h3>
                <div class="prix">${article.prix.toLocaleString()} FCFA</div>
                <div class="tailles"><strong>Tailles :</strong> ${article.tailles}</div>
                <div class="actions-produit">
                    <button class="btn-ajouter" onclick="ajouterAuPanier(${article.id})">
                        <i class="fa-solid fa-cart-plus"></i> Ajouter au panier
                    </button>
                    <a href="${lienWhatsapp}" target="_blank" class="btn-whatsapp">
                        <i class="fa-brands fa-whatsapp"></i> Commander sur WhatsApp
                    </a>
                </div>
            </div>
        `;
        grille.appendChild(carte);
    });
}

// 2. Recherche rapide
function rechercherProduit() {
    const recherche = document.getElementById('recherche-input').value.toLowerCase();
    const resultats = listeArticles.filter(art => 
        art.nom.toLowerCase().includes(recherche) || 
        art.categorie.toLowerCase().includes(recherche)
    );
    afficherArticles(resultats);
}

// 3. Filtrer par catégorie
function filtrer(categorie) {
    document.querySelectorAll('.btn-filtre').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (categorie === 'tous') {
        afficherArticles(listeArticles);
    } else {
        const resultat = listeArticles.filter(art => art.categorie === categorie);
        afficherArticles(resultat);
    }
}

// 4. Ajouter au panier
function ajouterAuPanier(id) {
    const vêtement = listeArticles.find(art => art.id === id);
    panier.push(vêtement);
    mettreAJourPanier();
    alert(`"${vêtement.nom}" a été ajouté à votre panier !`);
}

// 5. Mettre à jour l'affichage du panier
function mettreAJourPanier() {
    document.getElementById('badge-panier').innerText = panier.length;
    const zonePanier = document.getElementById('liste-panier');
    zonePanier.innerHTML = '';
    let total = 0;

    panier.forEach((item, index) => {
        total += item.prix;
        zonePanier.innerHTML += `
            <div class="item-panier">
                <div>
                    <strong>${item.nom}</strong><br>
                    <small>${item.prix.toLocaleString()} FCFA</small>
                </div>
                <button onclick="retirerDuPanier(${index})" style="color:red; border:none; background:none; cursor:pointer;">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        `;
    });

    document.getElementById('total-prix').innerText = total.toLocaleString();
}

// 6. Supprimer un élément du panier
function retirerDuPanier(index) {
    panier.splice(index, 1);
    mettreAJourPanier();
}

// 7. Ouvrir / Fermer le panier
function togglePanier() {
    document.getElementById('modal-panier').classList.toggle('cache');
}

// 8. Envoyer la commande du panier via WhatsApp
function validerPaiement() {
    if (panier.length === 0) {
        alert("Votre panier est vide !");
        return;
    }

    const nom = document.getElementById('client-nom').value;
    const tel = document.getElementById('client-tel').value;
    const mode = document.getElementById('mode-paiement').value;

    if (!nom || !tel) {
        alert("Veuillez renseigner votre nom et votre numéro de téléphone.");
        return;
    }

    let recapPanier = panier.map(item => `- ${item.nom} (${item.prix.toLocaleString()} FCFA)`).join('\n');
    let totalPrix = document.getElementById('total-prix').innerText;
    
    let messagePaiement = `Bonjour ELEGANCE BOUTIQUE BY ROXANE,\n\nJe souhaite valider ma commande :\n${recapPanier}\n\nTotal : ${totalPrix} FCFA\nMoyen de paiement : ${mode}\nNom : ${nom}\nTéléphone : ${tel}`;

    window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(messagePaiement)}`, '_blank');

    panier = [];
    mettreAJourPanier();
    togglePanier();
}

// Initialisation
afficherArticles();