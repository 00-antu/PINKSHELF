
/* ==============================
   PINKSHELF - JAVASCRIPT REVISADO
   Usa localStorage para simular banco de dados
   ============================== */

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
let graficoCategorias = null;
let graficoValores = null;

function pegarPecas() { return JSON.parse(localStorage.getItem('pecasPinkShelf')) || []; }
function salvarPecas(pecas) { localStorage.setItem('pecasPinkShelf', JSON.stringify(pecas)); }
function pegarLoja() { return JSON.parse(localStorage.getItem('lojaPinkShelf')) || null; }
function statusPeca(qtd) { if (qtd <= 0) return ['zerado', 'Zerado']; if (qtd <= 5) return ['baixo', 'Baixo estoque']; return ['ok', 'Disponível']; }
function irPara(caminho) { window.location.href = caminho; }
/* CADASTRO DA LOJA */
const formCadastro = document.getElementById('formCadastro');

if (formCadastro) {

   formCadastro.addEventListener('submit', function(e) {

      e.preventDefault();

      /* PEGA AS SENHAS */
      const senha = document.getElementById('senha').value;
      const confirmar = document.getElementById('confirmar').value;

      /* VALIDAÇÃO */
      if (senha !== confirmar) {

         alert('As senhas precisam ser iguais!');

         return;
      }

      /* DADOS DA LOJA */
      const loja = {

         loja: document.getElementById('loja').value.trim(),

         responsavel: document.getElementById('responsavel').value.trim(),

         email: document.getElementById('email').value.trim(),

         telefone: document.getElementById('telefone').value.trim(),

         plano: document.getElementById('plano').value,

         pagamento: document.getElementById('pagamento').value,

         senha: senha
      };

      /* SALVA */
      localStorage.setItem('lojaPinkShelf', JSON.stringify(loja));

      alert('Cadastro realizado com sucesso!');

      /* REDIRECIONA */
      window.location.href = 'cadastro-pecas.html';

   });

}
 


// Login
const formLogin = document.getElementById('formLogin');
if (formLogin) {
  formLogin.addEventListener('submit', function (e) {
    e.preventDefault();
    const loja = pegarLoja();
    const email = document.getElementById('emailLogin').value.trim();
    const senha = document.getElementById('senhaLogin').value;
    if (loja && loja.email === email && loja.senha === senha) {
      localStorage.setItem('sessaoPinkShelf', 'ativa');
      irPara('relatorio.html');
    } else {
      alert('E-mail ou senha incorretos. Confira os dados ou faça o cadastro da loja.');
    }
  });
}

// Cadastro e edição de peças
const formPeca = document.getElementById('formPeca');
if (formPeca) {
  const editando = localStorage.getItem('editarPecaIndex');
  if (editando !== null) {
    const peca = pegarPecas()[Number(editando)];
    if (peca) {
      document.getElementById('nomePeca').value = peca.nome;
      document.getElementById('categoriaPeca').value = peca.categoria;
      document.getElementById('tamanhoPeca').value = peca.tamanho;
      document.getElementById('corPeca').value = peca.cor;
      document.getElementById('quantidadePeca').value = peca.quantidade;
      document.getElementById('precoPeca').value = peca.preco;
      document.getElementById('mesPeca').value = peca.mes;
      document.getElementById('btnSalvarPeca').textContent = 'salvar alterações';
    }
  }
  formPeca.addEventListener('submit', function (e) {
    e.preventDefault();
    const peca = {
      nome: document.getElementById('nomePeca').value.trim(),
      categoria: document.getElementById('categoriaPeca').value,
      tamanho: document.getElementById('tamanhoPeca').value.trim(),
      cor: document.getElementById('corPeca').value.trim(),
      quantidade: Number(document.getElementById('quantidadePeca').value),
      preco: Number(document.getElementById('precoPeca').value),
      mes: document.getElementById('mesPeca').value
    };
    const pecas = pegarPecas();
    const indexEdicao = localStorage.getItem('editarPecaIndex');
    if (indexEdicao !== null) {
      pecas[Number(indexEdicao)] = peca;
      localStorage.removeItem('editarPecaIndex');
      alert('Peça atualizada com sucesso!');
      salvarPecas(pecas);
      irPara('estoque.html');
    } else {
      pecas.push(peca);
      salvarPecas(pecas);
      alert('Peça cadastrada com sucesso!');
      formPeca.reset();
    }
  });
  const limpar = document.getElementById('btnLimparEdicao');
  if (limpar) { limpar.addEventListener('click', () => { localStorage.removeItem('editarPecaIndex'); formPeca.reset(); }); }
}

function calcularResumo(pecas) {
  const quantidadeTotal = pecas.reduce((s, p) => s + Number(p.quantidade), 0);
  const valorTotal = pecas.reduce((s, p) => s + Number(p.quantidade) * Number(p.preco), 0);
  const baixoEstoque = pecas.filter(p => Number(p.quantidade) <= 5).length;
  return { quantidadeTotal, valorTotal, baixoEstoque };
}

function atualizarHome() {
  const total = document.getElementById('homeTotalPecas');
  if (!total) return;
  const pecas = pegarPecas();
  const resumo = calcularResumo(pecas);
  total.textContent = pecas.length;
  document.getElementById('homeEstoqueBaixo').textContent = resumo.baixoEstoque;
  document.getElementById('homeValorEstoque').textContent = moeda.format(resumo.valorTotal);
}

function renderizarEstoque() {
  const corpo = document.getElementById('tabelaEstoque');
  if (!corpo) return;
  const busca = (document.getElementById('buscaEstoque')?.value || '').toLowerCase();
  const pecas = pegarPecas();
  const filtradas = pecas.filter(p => `${p.nome} ${p.categoria} ${p.cor} ${p.tamanho}`.toLowerCase().includes(busca));
  const resumo = calcularResumo(pecas);
  document.getElementById('totalItens').textContent = pecas.length;
  document.getElementById('quantidadeTotal').textContent = resumo.quantidadeTotal;
  document.getElementById('valorTotal').textContent = moeda.format(resumo.valorTotal);
  document.getElementById('baixoEstoque').textContent = resumo.baixoEstoque;
  if (filtradas.length === 0) {
    corpo.innerHTML = '';
    document.getElementById('mensagemEstoque').textContent = 'Nenhuma peça encontrada. Cadastre uma peça para começar.';
    return;
  }
  document.getElementById('mensagemEstoque').textContent = '';
  corpo.innerHTML = filtradas.map((p) => {
    const indexReal = pecas.indexOf(p);
    const [classe, texto] = statusPeca(Number(p.quantidade));
    return `<tr><td>${p.nome}</td><td>${p.categoria}</td><td>${p.tamanho}</td><td>${p.cor}</td><td>${p.quantidade}</td><td>${moeda.format(p.preco)}</td><td><span class="status ${classe}">${texto}</span></td><td><div class="acoes"><button class="btn-mini editar" onclick="editarPeca(${indexReal})">Editar</button><button class="btn-mini excluir" onclick="excluirPeca(${indexReal})">Excluir</button></div></td></tr>`;
  }).join('');
}

function editarPeca(index) { localStorage.setItem('editarPecaIndex', String(index)); irPara('cadastro-pecas.html'); }
function excluirPeca(index) { if (confirm('Deseja excluir esta peça?')) { const pecas = pegarPecas(); pecas.splice(index, 1); salvarPecas(pecas); renderizarEstoque(); gerarRelatorio(); atualizarHome(); } }

const buscaEstoque = document.getElementById('buscaEstoque');
if (buscaEstoque) { buscaEstoque.addEventListener('input', renderizarEstoque); }

function agruparPorCategoria(pecas, tipo) {
  const mapa = {};
  pecas.forEach(p => {
    if (!mapa[p.categoria]) mapa[p.categoria] = 0;
    mapa[p.categoria] += tipo === 'valor' ? Number(p.quantidade) * Number(p.preco) : Number(p.quantidade);
  });
  return mapa;
}

function gerarRelatorio() {
  const resultado = document.getElementById('resultadoRelatorio');
  if (!resultado) return;
  const mes = document.getElementById('filtroMes').value;
  let pecas = pegarPecas();
  if (mes !== 'Todos') pecas = pecas.filter(p => p.mes === mes);
  const resumo = calcularResumo(pecas);
  document.getElementById('relTotalPecas').textContent = resumo.quantidadeTotal;
  document.getElementById('relValorEstoque').textContent = moeda.format(resumo.valorTotal);
  document.getElementById('relBaixoEstoque').textContent = resumo.baixoEstoque;
  const categoriasQtd = agruparPorCategoria(pecas, 'qtd');
  const categoriaDestaque = Object.entries(categoriasQtd).sort((a, b) => b[1] - a[1])[0];
  document.getElementById('relCategoriaDestaque').textContent = categoriaDestaque ? categoriaDestaque[0] : '-';
  if (pecas.length === 0) { resultado.innerHTML = '<p class="mensagem-vazia">Nenhuma peça cadastrada para esse filtro.</p>'; desenharGraficos({}, {}); return; }
  resultado.innerHTML = `<table><thead><tr><th>peça</th><th>categoria</th><th>qtd.</th><th>preço</th><th>mês</th><th>valor total</th></tr></thead><tbody>${pecas.map(p => `<tr><td>${p.nome}</td><td>${p.categoria}</td><td>${p.quantidade}</td><td>${moeda.format(p.preco)}</td><td>${p.mes}</td><td>${moeda.format(p.quantidade * p.preco)}</td></tr>`).join('')}</tbody></table>`;
  desenharGraficos(categoriasQtd, agruparPorCategoria(pecas, 'valor'));
}

function desenharGraficos(qtdPorCategoria, valorPorCategoria) {
  if (typeof Chart === 'undefined') return;
  const ctxCat = document.getElementById('graficoCategorias');
  const ctxVal = document.getElementById('graficoValores');
  if (!ctxCat || !ctxVal) return;
  if (graficoCategorias) graficoCategorias.destroy();
  if (graficoValores) graficoValores.destroy();
  graficoCategorias = new Chart(ctxCat, { type: 'bar', data: { labels: Object.keys(qtdPorCategoria), datasets: [{ label: 'Quantidade', data: Object.values(qtdPorCategoria), backgroundColor: '#ff8fbd' }] } });
  graficoValores = new Chart(ctxVal, { type: 'pie', data: { labels: Object.keys(valorPorCategoria), datasets: [{ label: 'Valor', data: Object.values(valorPorCategoria), backgroundColor: ['#ff8fbd', '#ffc1d9', '#d94f8f', '#ffe1ec', '#f7a7c8', '#b8326f'] }] } });
}

const btnGerar = document.getElementById('btnGerarRelatorio');
if (btnGerar) { btnGerar.addEventListener('click', gerarRelatorio); }

const formSuporte = document.getElementById('formSuporte');
if (formSuporte) { formSuporte.addEventListener('submit', e => { e.preventDefault(); alert('Mensagem enviada! Em um sistema real, isso iria para o suporte.'); formSuporte.reset(); }); }

atualizarHome();
renderizarEstoque();
gerarRelatorio();


// Carrossel da página inicial
function iniciarCarrosselOriginal() {
  const slides = document.querySelectorAll(".slide");
  if (slides.length === 0) return;
  let atual = 0;
  setInterval(() => {
    slides[atual].classList.remove("ativo");
    atual = (atual + 1) % slides.length;
    slides[atual].classList.add("ativo");
  }, 3500);
}
iniciarCarrosselOriginal();
