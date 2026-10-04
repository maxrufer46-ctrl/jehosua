(() => {
const all=Array.isArray(window.PRODUCTS)?window.PRODUCTS:[];
const $=s=>document.querySelector(s);
const pageSize=30;
let page=1,favOnly=false;
let favorites=JSON.parse(localStorage.getItem('mj_favorites')||'{}');
let quote=JSON.parse(localStorage.getItem('mj_quote')||'{}');
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const norm=v=>String(v??'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const iconFor=c=>({Alimentos:'A',Bebidas:'B',Limpieza:'L','Cuidado personal':'C','Hogar y desechables':'H','Dulces y snacks':'D',Bebés:'BB',Mascotas:'M'}[c]||'MJ');

function save(){localStorage.setItem('mj_favorites',JSON.stringify(favorites));localStorage.setItem('mj_quote',JSON.stringify(quote));updateCount()}
function setupCats(){const xs=[...new Set(all.map(p=>p.c).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));$('#category').innerHTML='<option value="">Todas las categorías</option>'+xs.map(x=>'<option>'+esc(x)+'</option>').join('')}
function filtered(){const q=norm($('#search').value),cat=$('#category').value;return all.filter(p=>(!cat||p.c===cat)&&(!favOnly||favorites[p.s])&&(!q||norm(p.n).includes(q)||norm(p.s).includes(q)||norm(p.r).includes(q)))}
function render(){const list=filtered(),pages=Math.max(1,Math.ceil(list.length/pageSize));page=Math.min(page,pages);const show=list.slice((page-1)*pageSize,page*pageSize);$('#resultCount').textContent=list.length+' productos';$('#pageInfo').textContent='Página '+page+' de '+pages;$('#prev').disabled=page<=1;$('#next').disabled=page>=pages;$('#favFilter').textContent=favOnly?'★ Mostrando favoritos':'☆ Solo favoritos';$('#grid').innerHTML=show.map(p=>`<article class="card"><div class="cardTop"><div class="icon">${esc(iconFor(p.c))}</div><button class="fav" data-fav="${esc(p.s)}">${favorites[p.s]?'★':'☆'}</button></div><div class="sku">Código ${esc(p.s)}</div><div class="name">${esc(p.n)}</div><div class="cat">${esc(p.c)} · ${esc(p.r)}</div><button class="add" data-add="${esc(p.s)}">${quote[p.s]?'Agregar otra':'Agregar al pedido'}</button></article>`).join('')||'<div class="empty">No se encontraron productos.</div>'}
function product(s){return all.find(p=>String(p.s)===String(s))}
function add(s){const p=product(s);if(!p)return;if(!quote[s])quote[s]={s:p.s,n:p.n,q:0};quote[s].q++;save();render();toast('Producto agregado')}
function change(s,d){if(!quote[s])return;quote[s].q+=d;if(quote[s].q<=0)delete quote[s];save();renderQuote();render()}
function updateCount(){$('#quoteCount').textContent=Object.values(quote).reduce((a,x)=>a+(x.q||0),0)}
function renderQuote(){const rows=Object.values(quote);$('#quoteItems').innerHTML=rows.length?rows.map(x=>`<div class="qrow"><div><b>${esc(x.n)}</b><small>Código ${esc(x.s)}</small></div><div class="qty"><button data-minus="${esc(x.s)}">−</button><b>${x.q}</b><button data-plus="${esc(x.s)}">+</button></div></div>`).join(''):'<div class="empty">El pedido está vacío.</div>'}
function orderText(){const rows=Object.values(quote);return rows.length?'MERCADOS JEHOSUA - PEDIDO\n\n'+rows.map((x,i)=>(i+1)+'. '+x.n+' | Código '+x.s+' | Cantidad: '+x.q).join('\n')+'\n\nGenerado desde la app Mercados Jehosua.':''}
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),1500)}
document.addEventListener('click',e=>{let x=e.target.closest('[data-add]');if(x)add(x.dataset.add);x=e.target.closest('[data-fav]');if(x){favorites[x.dataset.fav]?delete favorites[x.dataset.fav]:favorites[x.dataset.fav]=true;save();render()}x=e.target.closest('[data-minus]');if(x)change(x.dataset.minus,-1);x=e.target.closest('[data-plus]');if(x)change(x.dataset.plus,1)});
$('#search').addEventListener('input',()=>{page=1;render()});$('#category').addEventListener('change',()=>{page=1;render()});$('#favFilter').addEventListener('click',()=>{favOnly=!favOnly;page=1;render()});$('#prev').addEventListener('click',()=>{if(page>1){page--;render();scrollTo(0,0)}});$('#next').addEventListener('click',()=>{page++;render();scrollTo(0,0)});$('#openQuote').addEventListener('click',()=>{$('#drawer').classList.add('show');renderQuote()});$('#closeQuote').addEventListener('click',()=>$('#drawer').classList.remove('show'));$('#shade').addEventListener('click',()=>$('#drawer').classList.remove('show'));$('#clearQuote').addEventListener('click',()=>{quote={};save();renderQuote();render()});$('#shareQuote').addEventListener('click',()=>{const t=orderText();if(!t)return toast('El pedido está vacío');if(window.Android&&Android.share)Android.share(t);else toast('No disponible')});
setupCats();updateCount();render();
})();