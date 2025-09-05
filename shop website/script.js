/* 
  script.js
  - Holds product data (array)
  - Renders grid, filtering, sorting, pagination
  - Handles modal open/close
  - Keeps code simple & commented for customization
*/

// ---------- SAMPLE PRODUCT DATA (edit/add here) -----------
const PRODUCTS = [
  {
    id: "m1",
    title: "Levi's Men's Regular Fit T-Shirt",
    category: "mens",
    price: 899,
    currency: "INR",
    img: "https://m.media-amazon.com/images/I/71YXzeOuslL._AC_UL320_.jpg",
    url: "https://www.amazon.in/dp/B09V3J2WXX?tag=YOUR-AFFILIATE-ID",
    desc: "Comfortable cotton tee — everyday essential."
  },
  {
    id: "w1",
    title: "BTS Oversized Women's T-Shirt",
    category: "womens",
    price: 500,
    currency: "INR",
    img: "https://m.media-amazon.com/images/I/71t6YcGqGmL._AC_UL320_.jpg",
    url: "https://www.amazon.in/dp/B09QX28M5P?tag=YOUR-AFFILIATE-ID",
    desc: "Stylish oversized fit for casual wear."
  },
  {
    id: "e1",
    title: "Apple iPhone 13 (128GB) — Verified Seller",
    category: "electronics",
    price: 52999,
    currency: "INR",
    img: "https://m.media-amazon.com/images/I/71hIfcIPyxS._AC_UL320_.jpg",
    url: "https://www.amazon.in/dp/B09G9FPGTN?tag=YOUR-AFFILIATE-ID",
    desc: "A15 Bionic, excellent camera and battery life."
  },
  {
    id: "k1",
    title: "Remote Car Toy for Kids — Fast Racer",
    category: "kids",
    price: 1299,
    currency: "INR",
    img: "https://m.media-amazon.com/images/I/81gGK8m0eOL._AC_UL320_.jpg",
    url: "https://www.amazon.in/dp/B08N5WRWNW?tag=YOUR-AFFILIATE-ID",
    desc: "Safe & durable remote racer with rechargeable battery."
  },
  // Add more products here. Keep structure consistent.
];

// ---------- App State ----------
const state = {
  query: "",
  category: "all",
  sort: "relevance",
  page: 1,
  perPage: 8
};

// ---------- DOM nodes ----------
const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearch");
const categorySelect = document.getElementById("categorySelect");
const sortSelect = document.getElementById("sortSelect");
const resultsCount = document.getElementById("resultsCount");
const resetFilters = document.getElementById("resetFilters");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");
const productModal = document.getElementById("productModal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");
const yearSpan = document.getElementById("year");

// ---------- Utilities ----------
function formatPrice(p){
  // format INR with comma separators
  return p.toLocaleString('en-IN', {style:'currency', currency:'INR', maximumFractionDigits:0});
}

// filter & sort logic
function getFilteredProducts(){
  const q = state.query.trim().toLowerCase();
  let list = PRODUCTS.slice();

  if(state.category !== "all"){
    list = list.filter(p => p.category === state.category);
  }
  if(q.length){
    list = list.filter(p => (p.title + " " + p.desc).toLowerCase().includes(q));
  }

  // sorting
  if(state.sort === "price-asc"){
    list.sort((a,b) => a.price - b.price);
  } else if(state.sort === "price-desc"){
    list.sort((a,b) => b.price - a.price);
  }
  return list;
}

// render single product card
function renderCard(p){
  const div = document.createElement("article");
  div.className = "card";
  div.tabIndex = 0;
  div.setAttribute("data-id", p.id);
  div.innerHTML = `
    <div class="thumb" aria-hidden="true">
      <img loading="lazy" decoding="async" src="${p.img}" alt="${escapeHtml(p.title)}" width="160" height="160">
    </div>
    <div>
      <h3>${escapeHtml(p.title)}</h3>
      <div class="meta"><span class="pill">${p.category}</span></div>
      <div class="price">${formatPrice(p.price)}</div>
      <div class="cta">
        <a class="btn" href="${p.url}" target="_blank" rel="noopener noreferrer">Buy on Amazon</a>
        <button class="btn subtle details" data-id="${p.id}">Details</button>
      </div>
    </div>
  `;
  // clicking card details or keyboard enter opens modal
  div.querySelector(".details").addEventListener("click", ()=>openModal(p.id));
  div.addEventListener("keydown", (e)=>{
    if(e.key === "Enter" || e.key === " "){
      openModal(p.id);
      e.preventDefault();
    }
  });
  return div;
}

// render grid and UI
function render(){
  const all = getFilteredProducts();
  const total = all.length;
  const start = (state.page - 1) * state.perPage;
  const pageItems = all.slice(start, start + state.perPage);

  productGrid.innerHTML = "";
  if(pageItems.length === 0){
    productGrid.innerHTML = `<div class="center text-muted">No products found. Try a different search or reset filters.</div>`;
  } else {
    pageItems.forEach(p => productGrid.appendChild(renderCard(p)));
  }

  // update results & pagination
  resultsCount.textContent = `Showing ${Math.min(total, (state.page-1)*state.perPage + 1)} - ${Math.min(total, state.page * state.perPage)} of ${total} products`;
  const totalPages = Math.max(1, Math.ceil(total / state.perPage));
  pageInfo.textContent = `Page ${state.page} / ${totalPages}`;
  prevPageBtn.disabled = state.page <= 1;
  nextPageBtn.disabled = state.page >= totalPages;
  prevPageBtn.setAttribute('aria-disabled', prevPageBtn.disabled);
  nextPageBtn.setAttribute('aria-disabled', nextPageBtn.disabled);
}

// Modal
function openModal(id){
  const product = PRODUCTS.find(p => p.id === id);
  if(!product) return;
  modalContent.innerHTML = `
    <div class="modal-body">
      <img src="${product.img}" alt="${escapeHtml(product.title)}">
      <div>
        <h3 id="modalTitle">${escapeHtml(product.title)}</h3>
        <p class="text-muted">${escapeHtml(product.desc)}</p>
        <p class="price">${formatPrice(product.price)}</p>
        <p><a class="buy" href="${product.url}" target="_blank" rel="noopener noreferrer">Buy Now on Amazon</a></p>
        <hr>
        <p class="text-muted">Affiliate disclosure: we may earn a commission from qualifying purchases.</p>
      </div>
    </div>
  `;
  productModal.hidden = false;
  document.body.style.overflow = "hidden";
  productModal.focus();
}

function closeModalFn(){
  productModal.hidden = true;
  document.body.style.overflow = "";
}

// escape helper for safety (very small helper)
function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]); });
}

// ---------- Event wiring ----------
searchInput.addEventListener("input", (e)=>{
  state.query = e.target.value;
  state.page = 1;
  render();
});
clearSearchBtn.addEventListener("click", ()=>{
  searchInput.value = "";
  state.query = "";
  state.page = 1;
  render();
});

categorySelect.addEventListener("change", (e)=>{
  state.category = e.target.value;
  state.page = 1;
  render();
});

sortSelect.addEventListener("change", (e)=>{
  state.sort = e.target.value;
  state.page = 1;
  render();
});

resetFilters.addEventListener("click", ()=>{
  state.query = ""; state.category = "all"; state.sort = "relevance"; state.page = 1;
  searchInput.value = ""; categorySelect.value = "all"; sortSelect.value = "relevance";
  render();
});

prevPageBtn.addEventListener("click", ()=>{
  if(state.page > 1){ state.page--; render(); window.scrollTo({top: 0, behavior:'smooth'}); }
});
nextPageBtn.addEventListener("click", ()=>{
  const total = getFilteredProducts().length;
  const totalPages = Math.max(1, Math.ceil(total / state.perPage));
  if(state.page < totalPages){ state.page++; render(); window.scrollTo({top: 0, behavior:'smooth'}); }
});

// Modal events
closeModal.addEventListener("click", closeModalFn);
productModal.addEventListener("click", (e)=>{
  if(e.target === productModal) closeModalFn();
});
document.addEventListener("keydown", (e)=>{ if(e.key === "Escape") closeModalFn(); });

// populate initial UI values & render
(function init(){
  yearSpan.textContent = new Date().getFullYear();
  render();
})();
