(() => {
const all = Array.isArray(window.FALLBACK_PRODUCTS) ? window.FALLBACK_PRODUCTS : [];
const $ = s => document.querySelector(s);
const pageSize = 24;
let page = 1;
let favOnly = false;
let favorites = JSON.parse(localStorage.getItem('mj_favorites') || '{}');
let quote = JSON.parse(localStorage.getItem('mj_quote') || '{}');

const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const norm = v => String(v ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const save = () => {
  localStorage.setItem('mj_favorites', JSON.stringify(favorites));
  localStorage.setItem('mj_quote', JSON.stringify(quote));
  updateQuoteCount();
};

function categories() {
  const values = [...new Set(all.map(p => p.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
  $('#category').innerHTML = '<option value="">Todas las categorías</option>' + values.map(x=>'<option>'+esc(x)+'</option>').join('');
}

function filtered() {
  const q = norm($('#search').value);
  const cat = $('#category').value;
  return all.filter(p => {
    if (cat && p.category !== cat) return false;
    if (favOnly && !favorites[p.sku]) return false;
    if (!q) return true;
    return norm(p.name).includes(q) || norm(p.sku).includes(q) || norm(p.rawCategory).includes(q);
  });
}

function render() {
  const list = filtered();
  const pages = Math.max(1, Math.ceil(list.length / pageSize));
  if (page > pages) page = pages;
  const start = (page - 1) * pageSize;
  const show = list.slice(start, start + pageSize);
  $('#resultCount').textContent = list.length + ' productos';
  $('#pageInfo').textContent = 'Página ' + page + ' de ' + pages;
  $('#prev').disabled = page <= 1;
  $('#next').disabled = page >= pages;
  $('#favFilter').textContent = favOnly ? '★ Mostrando favoritos' : '☆ Solo favoritos';

  $('#grid').innerHTML = show.map(p => `
    <article class="card">
      <div class="pic">
        <img loading="lazy" src="${esc(p.image)}" alt="${esc(p.name)}">
        <button class="fav" data-fav="${esc(p.sku)}">${favorites[p.sku] ? '★' : '☆'}</button>
      </div>
      <div class="body">
        <div class="sku">Código ${esc(p.sku)}</div>
        <div class="name">${esc(p.name)}</div>
        <div class="cat">${esc(p.category || p.rawCategory || '')}</div>
        <button class="add" data-add="${esc(p.sku)}">${quote[p.sku] ? 'Agregar otra' : 'Agregar a cotización'}</button>
      </div>
    </article>`).join('') || '<div class="empty">No se encontraron productos.</div>';
}

function updateQuoteCount() {
  const n = Object.values(quote).reduce((s,x)=>s+(x.qty||0),0);
  $('#quoteCount').textContent = n;
}

function product(sku) { return all.find(p => String(p.sku) === String(sku)); }

function addQuote(sku) {
  const p = product(sku);
  if (!p) return;
  if (!quote[sku]) quote[sku] = {sku:p.sku,name:p.name,image:p.image,qty:0};
  quote[sku].qty++;
  save();
  render();
  toast('Producto agregado');
}

function changeQty(sku, delta) {
  if (!quote[sku]) return;
  quote[sku].qty += delta;
  if (quote[sku].qty <= 0) delete quote[sku];
  save();
  renderQuote();
  render();
}

function renderQuote() {
  const rows = Object.values(quote);
  $('#quoteItems').innerHTML = rows.length ? rows.map(x=>`
    <div class="qrow">
      <img src="${esc(x.image)}" alt="">
      <div><b>${esc(x.name)}</b><small>Código ${esc(x.sku)}</small></div>
      <div class="qty"><button data-minus="${esc(x.sku)}">−</button><b>${x.qty}</b><button data-plus="${esc(x.sku)}">+</button></div>
    </div>`).join('') : '<div class="empty">Todavía no has agregado productos.</div>';
}

function quoteText() {
  const rows = Object.values(quote);
  if (!rows.length) return '';
  return 'MERCADOS JEHOSUA - COTIZACIÓN\n\n' +
    rows.map((x,i)=>(i+1)+'. '+x.name+' | Código '+x.sku+' | Cantidad: '+x.qty).join('\n') +
    '\n\nGenerado desde la aplicación offline Mercados Jehosua.';
}

function toast(text) {
  const e = document.createElement('div');
  e.className = 'toast';
  e.textContent = text;
  document.body.appendChild(e);
  setTimeout(()=>e.remove(),1600);
}

document.addEventListener('click', e => {
  const add = e.target.closest('[data-add]');
  if (add) addQuote(add.dataset.add);

  const fav = e.target.closest('[data-fav]');
  if (fav) {
    const sku = fav.dataset.fav;
    if (favorites[sku]) delete favorites[sku]; else favorites[sku] = true;
    save(); render();
  }

  const minus = e.target.closest('[data-minus]');
  if (minus) changeQty(minus.dataset.minus,-1);
  const plus = e.target.closest('[data-plus]');
  if (plus) changeQty(plus.dataset.plus,1);
});

$('#search').addEventListener('input',()=>{page=1;render()});
$('#category').addEventListener('change',()=>{page=1;render()});
$('#favFilter').addEventListener('click',()=>{favOnly=!favOnly;page=1;render()});
$('#prev').addEventListener('click',()=>{if(page>1){page--;render();scrollTo(0,0)}});
$('#next').addEventListener('click',()=>{page++;render();scrollTo(0,0)});
$('#openQuote').addEventListener('click',()=>{$('#drawer').classList.add('show');renderQuote()});
$('#closeQuote').addEventListener('click',()=>$('#drawer').classList.remove('show'));
$('#closeShade').addEventListener('click',()=>$('#drawer').classList.remove('show'));
$('#clearQuote').addEventListener('click',()=>{quote={};save();renderQuote();render()});
$('#shareQuote').addEventListener('click',()=>{
  const text = quoteText();
  if (!text) return toast('La cotización está vacía');
  if (window.Android && Android.share) Android.share(text);
  else if (navigator.clipboard) navigator.clipboard.writeText(text).then(()=>toast('Cotización copiada'));
});

categories();
updateQuoteCount();
render();
})();