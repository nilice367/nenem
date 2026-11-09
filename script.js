// ================================================
//  Galáxia para o Kauã
//  Para mudar frases ou fotos, edite as listas abaixo.
// ================================================

const NOME = "Kauã";

const FOTOS = [
  { arquivo: "fotos/1.jpg", mensagem: "Eu e você, sempre juntinhos" },
  { arquivo: "fotos/2.jpg", mensagem: "Eu depois de espocar meu bucho no rodizio" },
  { arquivo: "fotos/3.jpg", mensagem: "Eu e vc neném lindu" },
  { arquivo: "fotos/4.jpg", mensagem: "Meu cantinho preferido é nos seus braços(tbm amo amo amo de ser a conchinha grande)" },
  { arquivo: "fotos/5.jpg", mensagem: "A gente mimindo juntos" },
  { arquivo: "fotos/6.jpg", mensagem: "a primeira figu que enviei pra vc" }
];

const FRASES = [
  "Você é meu neném",
  "Meu tudo",
  "Te gosto muito muitoooooooo",
  "Meu bubu",
  "Você é bebezinho linduuuu",
  "Meu docinho de coco",
  "Minha pessoa favorita",
];

// Configuração do Firebase (banco de dados onde ficam as frases e fotos adicionadas)
const firebaseConfig = {
  apiKey: "AIzaSyBDxjd9633f5kUWVCoFduSWpC28MRienIw",
  authDomain: "site-ka.firebaseapp.com",
  projectId: "site-ka",
  storageBucket: "site-ka.firebasestorage.app",
  messagingSenderId: "173712802300",
  appId: "1:173712802300:web:947fb6d3603f5cf5ebf279"
};

// ------------------------------------------------

const menosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const celular = window.matchMedia("(max-width: 600px), (pointer: coarse)").matches;

if (celular) {
  document.getElementById("dica").textContent = "Arraste com o dedo para girar · Toque nas fotos";
}
const canvas = document.getElementById("cena");

if (!window.THREE) {
  document.getElementById("dica").textContent = "Não consegui carregar a galáxia. Verifique a internet e recarregue a página.";
  throw new Error("Three.js não carregou");
}

// ===== Cena, câmera e controles =====
const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, celular ? 1.5 : 2));

const cena = new THREE.Scene();
cena.background = new THREE.Color(0x020810);
cena.fog = new THREE.FogExp2(0x020810, 0.012);

const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 400);

const controles = new THREE.OrbitControls(camera, canvas);
controles.enableDamping = true;
controles.dampingFactor = 0.06;
controles.enablePan = false;
controles.minDistance = 8;
controles.maxDistance = 60;
controles.rotateSpeed = celular ? 0.6 : 1;
controles.autoRotate = !menosMovimento;
controles.autoRotateSpeed = 0.5;
controles.target.set(0, 2, 0);
controles.enabled = false;

// ===== Textura de pontinho brilhante =====
function criarPontinho() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.25, "rgba(255,255,255,0.85)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
const PONTINHO = criarPontinho();

function materialDePontos(tamanho) {
  return new THREE.PointsMaterial({
    size: tamanho,
    map: PONTINHO,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
}

function criarPontos(posicoes, cores, tamanho) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(posicoes, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(cores, 3));
  return new THREE.Points(geo, materialDePontos(tamanho));
}

// ===== Estrelas no fundo =====
(function criarEstrelas() {
  const n = 4000;
  const pos = new Float32Array(n * 3);
  const cor = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = 90 + Math.random() * 120;
    const t = Math.random() * Math.PI * 2;
    const f = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(f) * Math.cos(t);
    pos[i * 3 + 1] = r * Math.cos(f);
    pos[i * 3 + 2] = r * Math.sin(f) * Math.sin(t);
    const brilho = 0.7 + Math.random() * 0.3;
    const ciano = Math.random() < 0.25;
    cor[i * 3] = ciano ? brilho * 0.6 : brilho;
    cor[i * 3 + 1] = brilho;
    cor[i * 3 + 2] = brilho;
  }
  const estrelas = criarPontos(pos, cor, 1.1);
  estrelas.material.fog = false;
  cena.add(estrelas);
})();

// ===== Galáxia em espiral =====
const galaxia = (function criarGalaxia() {
  const n = celular ? 14000 : 26000;
  const bracos = 3;
  const raio = 13;
  const giro = 0.9;
  const pos = new Float32Array(n * 3);
  const cor = new Float32Array(n * 3);
  const centro = new THREE.Color("#effeff");
  const meio = new THREE.Color("#00e5ff");
  const borda = new THREE.Color("#2a6bff");
  const c = new THREE.Color();

  for (let i = 0; i < n; i++) {
    const r = Math.pow(Math.random(), 1.6) * raio;
    const angulo = ((i % bracos) / bracos) * Math.PI * 2 + r * giro;
    const espalhar = 0.35 + r * 0.09;
    pos[i * 3] = Math.cos(angulo) * r + (Math.random() - 0.5) * espalhar * 2 * Math.random();
    pos[i * 3 + 1] = (Math.random() - 0.5) * (1.2 - r / raio) * 0.9 * Math.random();
    pos[i * 3 + 2] = Math.sin(angulo) * r + (Math.random() - 0.5) * espalhar * 2 * Math.random();

    const t = r / raio;
    if (t < 0.35) c.copy(centro).lerp(meio, t / 0.35);
    else c.copy(meio).lerp(borda, (t - 0.35) / 0.65);
    cor[i * 3] = c.r;
    cor[i * 3 + 1] = c.g;
    cor[i * 3 + 2] = c.b;
  }

  const pontos = criarPontos(pos, cor, 0.11);
  cena.add(pontos);

  // brilho no centro
  const gc = document.createElement("canvas");
  gc.width = gc.height = 256;
  const g = gc.getContext("2d");
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, "rgba(225,255,255,0.9)");
  grad.addColorStop(0.3, "rgba(0,229,255,0.35)");
  grad.addColorStop(1, "rgba(0,229,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  const brilho = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(gc),
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true
  }));
  brilho.scale.set(9, 9, 1);
  cena.add(brilho);

  return pontos;
})();

// ===== Coração de estrelas =====
const coracao = new THREE.Group();
coracao.position.set(0, 6.5, 0);
cena.add(coracao);

(function criarCoracao() {
  const n = 5000;
  const escala = 0.24;
  const pos = new Float32Array(n * 3);
  const cor = new Float32Array(n * 3);
  const ciano = new THREE.Color("#5ff3ff");
  const branco = new THREE.Color("#ffffff");
  const c = new THREE.Color();

  for (let i = 0; i < n; i++) {
    const t = Math.random() * Math.PI * 2;
    const naBorda = Math.random() < 0.72;
    const k = naBorda ? 1 + (Math.random() - 0.5) * 0.08 : Math.sqrt(Math.random()) * 0.95;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    pos[i * 3] = x * escala * k;
    pos[i * 3 + 1] = y * escala * k;
    pos[i * 3 + 2] = (Math.random() - 0.5) * (naBorda ? 0.3 : 0.8);
    c.copy(ciano).lerp(branco, naBorda ? Math.random() * 0.5 : 0.2 + Math.random() * 0.3);
    cor[i * 3] = c.r;
    cor[i * 3 + 1] = c.g;
    cor[i * 3 + 2] = c.b;
  }
  coracao.add(criarPontos(pos, cor, 0.09));
})();

// ===== Texto brilhante no espaço =====
function criarTexto(texto, opcoes) {
  const o = Object.assign({
    fonte: "700 64px 'Dancing Script', cursive",
    brilho: "#00e5ff",
    altura: 1
  }, opcoes);
  const c = document.createElement("canvas");
  const g = c.getContext("2d");
  g.font = o.fonte;
  const largura = Math.ceil(g.measureText(texto).width) + 60;
  const altura = 110;
  c.width = largura;
  c.height = altura;
  g.font = o.fonte;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = "#effcff";
  g.shadowColor = o.brilho;
  g.shadowBlur = 22;
  g.fillText(texto, largura / 2, altura / 2);
  g.shadowBlur = 8;
  g.fillText(texto, largura / 2, altura / 2);

  const textura = new THREE.CanvasTexture(c);
  textura.minFilter = THREE.LinearFilter;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: textura, transparent: true, depthWrite: false }));
  sprite.scale.set(o.altura * largura / altura, o.altura, 1);
  return sprite;
}

// ===== Coraçõezinhos subindo =====
const coracoezinhos = [];
(function criarCoracoezinhos() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  g.fillStyle = "#4ff0ff";
  g.shadowColor = "#00e5ff";
  g.shadowBlur = 10;
  g.beginPath();
  g.moveTo(32, 54);
  g.bezierCurveTo(4, 34, 10, 8, 32, 22);
  g.bezierCurveTo(54, 8, 60, 34, 32, 54);
  g.fill();
  const textura = new THREE.CanvasTexture(c);

  for (let i = 0; i < 40; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: textura, transparent: true, depthWrite: false, opacity: 0.8 }));
    const r = 3 + Math.random() * 14;
    const a = Math.random() * Math.PI * 2;
    s.position.set(Math.cos(a) * r, Math.random() * 14 - 3, Math.sin(a) * r);
    const tam = 0.25 + Math.random() * 0.35;
    s.scale.set(tam, tam, 1);
    s.userData.velocidade = 0.4 + Math.random() * 0.6;
    cena.add(s);
    coracoezinhos.push(s);
  }
})();

// ===== Anel com frases e posições das fotos =====
const anel = new THREE.Group();
cena.add(anel);

function esperarFontes() {
  if (!document.fonts || !document.fonts.load) return Promise.resolve();
  return Promise.race([
    Promise.all([
      document.fonts.load("700 64px 'Dancing Script'"),
      document.fonts.load("700 48px 'Quicksand'")
    ]),
    new Promise(function (ok) { setTimeout(ok, 2500); })
  ]).catch(function () {});
}

const fontes = esperarFontes();

fontes.then(function () {
  const titulo = criarTexto("Te gosto muito muito muitoooooooooooo", { altura: celular ? 1.2 : 1.5 });
  titulo.position.set(0, 0.2, 0.4);
  coracao.add(titulo);
});

// ----- Frases flutuando -----
const frasesNaCena = [];

function organizarFrases() {
  const n = frasesNaCena.length;
  frasesNaCena.forEach(function (s, i) {
    const a = (i / n) * Math.PI * 2 + 0.3;
    const r = 10 + (i % 3) * 2.2;
    s.userData.base = 0.8 + ((i * 1.7) % 4);
    s.userData.fase = i;
    s.position.set(Math.cos(a) * r, s.userData.base, Math.sin(a) * r);
  });
}

function adicionarFrase(texto, id) {
  fontes.then(function () {
    const s = criarTexto(texto, { fonte: "700 48px 'Quicksand', sans-serif", altura: 0.62, brilho: "#3aa8ff" });
    s.userData.id = id || null;
    anel.add(s);
    frasesNaCena.push(s);
    organizarFrases();
  });
}

function removerFrase(id) {
  fontes.then(function () {
    const i = frasesNaCena.findIndex(function (s) { return s.userData.id === id; });
    if (i < 0) return;
    const s = frasesNaCena[i];
    anel.remove(s);
    s.material.map.dispose();
    s.material.dispose();
    frasesNaCena.splice(i, 1);
    organizarFrases();
  });
}

FRASES.forEach(function (frase) { adicionarFrase(frase); });

// ----- Fotos (elementos HTML que seguem pontos invisíveis no anel 3D) -----
const areaFotos = document.getElementById("fotos");
const fotos = [];
const RAIOS = [7.5, 5.3, 9.6, 4.2];

function organizarFotos() {
  const porVolta = celular ? 6 : 8;
  const n = fotos.length;
  fotos.forEach(function (f, i) {
    const volta = Math.floor(i / porVolta);
    const naVolta = Math.min(porVolta, n - volta * porVolta);
    const a = ((i % porVolta) / naVolta) * Math.PI * 2 + volta * 0.5;
    const r = RAIOS[volta % RAIOS.length];
    f.ponto.userData.base = 2.6 + (i % 2) * 1.6 + (volta % 2) * 0.8;
    f.ponto.userData.fase = i * 1.3;
    f.ponto.position.set(Math.cos(a) * r, f.ponto.userData.base, Math.sin(a) * r);
  });
}

function adicionarFoto(foto) {
  const ponto = new THREE.Object3D();
  anel.add(ponto);

  const el = document.createElement("button");
  el.type = "button";
  el.className = "polaroid";
  el.setAttribute("aria-label", foto.mensagem);
  el.innerHTML = '<img alt=""><span></span>';
  el.querySelector("img").src = foto.arquivo;
  el.querySelector("span").textContent = foto.mensagem;
  el.style.opacity = "0";
  el.addEventListener("click", function () { abrirCartao(foto); });
  areaFotos.appendChild(el);

  fotos.push({ ponto: ponto, el: el, id: foto.id || null });
  organizarFotos();
}

function removerFoto(id) {
  const i = fotos.findIndex(function (f) { return f.id === id; });
  if (i < 0) return;
  anel.remove(fotos[i].ponto);
  fotos[i].el.remove();
  fotos.splice(i, 1);
  organizarFotos();
}

FOTOS.forEach(adicionarFoto);

const vetor = new THREE.Vector3();
const posCamera = new THREE.Vector3();

function posicionarFotos() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.getWorldPosition(posCamera);

  // ordenar: as mais perto ficam por cima
  const lista = fotos.map(function (f) {
    f.ponto.getWorldPosition(vetor);
    const distancia = vetor.distanceTo(posCamera);
    const tela = vetor.clone().project(camera);
    return { f: f, distancia: distancia, tela: tela };
  }).sort(function (a, b) { return b.distancia - a.distancia; });

  lista.forEach(function (item, ordem) {
    const el = item.f.el;
    if (item.tela.z > 1 || !aberto) {
      el.style.opacity = "0";
      el.style.pointerEvents = "none";
      return;
    }
    const x = (item.tela.x * 0.5 + 0.5) * w;
    const y = (-item.tela.y * 0.5 + 0.5) * h;
    const escala = Math.max(0.3, Math.min(1.1, 18 / item.distancia));
    el.style.transform = "translate(" + x + "px," + y + "px) translate(-50%,-50%) scale(" + escala + ")";
    el.style.opacity = String(Math.max(0.35, Math.min(1, 26 / item.distancia)));
    el.style.zIndex = String(ordem + 1);
    el.style.pointerEvents = "auto";
  });
}

// ===== Cartão da foto =====
const fundoCartao = document.getElementById("fundoCartao");

function abrirCartao(foto) {
  document.getElementById("cartaoImagem").src = foto.arquivo;
  document.getElementById("cartaoImagem").alt = foto.mensagem;
  document.getElementById("cartaoMensagem").textContent = foto.mensagem + " ♡";
  fundoCartao.hidden = false;
  controles.autoRotate = false;
  document.getElementById("botaoVoltar").focus();
}

function fecharCartao() {
  fundoCartao.hidden = true;
  controles.autoRotate = !menosMovimento;
}

document.getElementById("botaoVoltar").addEventListener("click", fecharCartao);
fundoCartao.addEventListener("click", function (e) { if (e.target === fundoCartao) fecharCartao(); });
document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !fundoCartao.hidden) fecharCartao(); });

// ===== Adicionar frases e fotos (salvas no Firebase) =====
const painel = document.getElementById("painel");
const formEntrar = document.getElementById("formEntrar");
const formAdicionar = document.getElementById("formAdicionar");
const avisoEntrar = document.getElementById("avisoEntrar");
const avisoAdicionar = document.getElementById("avisoAdicionar");
const campoFoto = document.getElementById("campoFoto");
const arquivoFoto = document.getElementById("arquivoFoto");
const previa = document.getElementById("previa");
const campoTexto = document.getElementById("texto");
const botaoSalvar = document.getElementById("botaoSalvar");
const listaItens = document.getElementById("listaItens");

let banco = null;
let usuario = null; // vira true depois de digitar a senha certa
let fotoPronta = null; // foto já diminuída, pronta para salvar
const itensSalvos = {}; // id -> dados

function avisar(el, texto, erro) {
  el.textContent = texto;
  el.classList.toggle("erro", !!erro);
}

function tipoEscolhido() {
  return formAdicionar.querySelector('input[name="tipo"]:checked').value;
}

function atualizarPainel() {
  const conectado = !!banco;
  document.getElementById("semConexao").hidden = conectado;
  formEntrar.hidden = !conectado || !!usuario;
  formAdicionar.hidden = !conectado || !usuario;
}

function abrirPainel() {
  atualizarPainel();
  painel.hidden = false;
  controles.autoRotate = false;
}

function fecharPainel() {
  painel.hidden = true;
  controles.autoRotate = !menosMovimento;
}

document.getElementById("botaoMais").addEventListener("click", abrirPainel);
document.getElementById("fecharPainel").addEventListener("click", fecharPainel);
painel.addEventListener("click", function (e) { if (e.target === painel) fecharPainel(); });
document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !painel.hidden) fecharPainel(); });

// Trocar entre "frase" e "foto com mensagem"
formAdicionar.querySelectorAll('input[name="tipo"]').forEach(function (r) {
  r.addEventListener("change", function () {
    const foto = tipoEscolhido() === "foto";
    campoFoto.hidden = !foto;
    previa.hidden = !foto || !fotoPronta;
    document.getElementById("rotuloTexto").textContent = foto ? "Mensagem da foto" : "Frase";
    campoTexto.placeholder = foto ? "Ex.: Nosso primeiro encontro" : "Ex.: Você é meu sol";
    avisar(avisoAdicionar, "");
  });
});

// Diminuir a foto para caber no banco de dados (máximo ~600 KB)
function diminuirFoto(arquivo) {
  return new Promise(function (ok, falhou) {
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = function () {
      const c = document.createElement("canvas");
      const g = c.getContext("2d");
      let maximo = 800;
      let qualidade = 0.82;
      let dados;
      do {
        const escala = Math.min(1, maximo / Math.max(img.width, img.height));
        c.width = Math.round(img.width * escala);
        c.height = Math.round(img.height * escala);
        g.fillStyle = "#ffffff";
        g.fillRect(0, 0, c.width, c.height);
        g.drawImage(img, 0, 0, c.width, c.height);
        dados = c.toDataURL("image/jpeg", qualidade);
        maximo *= 0.8;
        qualidade -= 0.08;
      } while (dados.length > 600000 && maximo > 200);
      URL.revokeObjectURL(url);
      ok(dados);
    };
    img.onerror = function () {
      URL.revokeObjectURL(url);
      falhou(new Error("imagem"));
    };
    img.src = url;
  });
}

arquivoFoto.addEventListener("change", function () {
  fotoPronta = null;
  previa.hidden = true;
  const arquivo = arquivoFoto.files && arquivoFoto.files[0];
  if (!arquivo) return;
  avisar(avisoAdicionar, "Preparando a foto…");
  diminuirFoto(arquivo).then(function (dados) {
    fotoPronta = dados;
    previa.src = dados;
    previa.hidden = false;
    avisar(avisoAdicionar, "");
  }).catch(function () {
    avisar(avisoAdicionar, "Não consegui abrir essa foto. Tente outra, em JPG ou PNG.", true);
  });
});

// Entrar só com a senha: o dia em que começamos a conversar (21/05)
const SENHA = "2105";

// Aceita "2105", "21/05", "21/5", "21 de maio"... e transforma tudo em "2105"
function arrumarSenha(texto) {
  const t = texto.toLowerCase().replace("maio", "05");
  const numeros = t.match(/\d+/g) || [];
  if (numeros.length >= 2) {
    return numeros[0].padStart(2, "0") + numeros[1].padStart(2, "0");
  }
  return numeros.join("");
}

formEntrar.addEventListener("submit", function (e) {
  e.preventDefault();
  const senha = arrumarSenha(document.getElementById("senha").value);
  if (!senha) { avisar(avisoEntrar, "Digite a senha.", true); return; }
  if (senha !== SENHA) {
    avisar(avisoEntrar, "vamo ta lembrando da senha ne flopadeeeeeeee!!!!!!!!", true);
    return;
  }
  avisar(avisoEntrar, "");
  document.getElementById("senha").value = "";
  usuario = true;
  try { localStorage.setItem("galaxia-entrou", "sim"); } catch (erro) {}
  atualizarPainel();
  campoTexto.focus();
});

document.getElementById("botaoSair").addEventListener("click", function () {
  usuario = null;
  try { localStorage.removeItem("galaxia-entrou"); } catch (erro) {}
  atualizarPainel();
});

// Se já entrou antes neste celular, não pede a senha de novo
try { if (localStorage.getItem("galaxia-entrou") === "sim") usuario = true; } catch (erro) {}

// Salvar frase ou foto
formAdicionar.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!banco || !usuario) return;
  const texto = campoTexto.value.trim();
  const tipo = tipoEscolhido();
  if (!texto) { avisar(avisoAdicionar, "Escreva a frase ou a mensagem.", true); return; }
  if (tipo === "foto" && !fotoPronta) { avisar(avisoAdicionar, "Escolha uma foto primeiro.", true); return; }

  const dados = { tipo: tipo, texto: texto, criadoEm: Date.now() };
  if (tipo === "foto") dados.imagem = fotoPronta;

  botaoSalvar.disabled = true;
  avisar(avisoAdicionar, "Salvando…");
  banco.collection("itens").add(dados).then(function () {
    avisar(avisoAdicionar, tipo === "foto" ? "Foto colocada na galáxia ♡" : "Frase colocada na galáxia ♡");
    campoTexto.value = "";
    arquivoFoto.value = "";
    fotoPronta = null;
    previa.hidden = true;
  }).catch(function (erro) {
    if (erro && erro.code === "permission-denied") avisar(avisoAdicionar, "O banco recusou. Confira se as regras do Firestore foram publicadas.", true);
    else avisar(avisoAdicionar, "Não consegui salvar. Verifique a internet e tente de novo.", true);
  }).then(function () {
    botaoSalvar.disabled = false;
  });
});

// Lista do que já foi adicionado (com botão de apagar)
function desenharLista() {
  listaItens.textContent = "";
  const ids = Object.keys(itensSalvos).sort(function (a, b) {
    return (itensSalvos[b].criadoEm || 0) - (itensSalvos[a].criadoEm || 0);
  });
  if (!ids.length) {
    const li = document.createElement("li");
    li.className = "vazio";
    li.textContent = "Nada adicionado ainda.";
    listaItens.appendChild(li);
    return;
  }
  ids.forEach(function (id) {
    const item = itensSalvos[id];
    const li = document.createElement("li");
    if (item.imagem) {
      const img = document.createElement("img");
      img.src = item.imagem;
      img.alt = "";
      li.appendChild(img);
    }
    const span = document.createElement("span");
    span.textContent = item.texto;
    li.appendChild(span);

    const apagar = document.createElement("button");
    apagar.type = "button";
    apagar.textContent = "Apagar";
    apagar.addEventListener("click", function () {
      if (apagar.dataset.confirmar !== "1") {
        apagar.dataset.confirmar = "1";
        apagar.textContent = "Tem certeza?";
        return;
      }
      apagar.disabled = true;
      banco.collection("itens").doc(id).delete().catch(function () {
        avisar(avisoAdicionar, "Não consegui apagar. Tente de novo.", true);
        apagar.disabled = false;
      });
    });
    li.appendChild(apagar);
    listaItens.appendChild(li);
  });
}

// Ligar o Firebase
(function ligarFirebase() {
  if (!window.firebase) {
    console.warn("Firebase não carregou");
    return;
  }
  try {
    firebase.initializeApp(firebaseConfig);
    banco = firebase.firestore();
  } catch (erro) {
    console.warn("Erro ao iniciar o Firebase", erro);
    banco = null;
    return;
  }

  banco.collection("itens").onSnapshot(function (snap) {
    snap.docChanges().forEach(function (mudanca) {
      const id = mudanca.doc.id;
      const item = mudanca.doc.data();
      if (mudanca.type === "added") {
        itensSalvos[id] = item;
        if (item.tipo === "foto" && item.imagem) {
          adicionarFoto({ arquivo: item.imagem, mensagem: item.texto, id: id });
        } else if (item.texto) {
          adicionarFrase(item.texto, id);
        }
      } else if (mudanca.type === "removed") {
        delete itensSalvos[id];
        removerFoto(id);
        removerFrase(id);
      }
    });
    desenharLista();
  }, function (erro) {
    console.warn("Não consegui ler o banco de dados", erro);
  });
})();

// ===== Abertura com a câmera voando =====
const inicioCamera = new THREE.Vector3(0, 34, 70);
let fimCamera = new THREE.Vector3(0, 9, 24);
let voando = false;
let progressoVoo = 0;
let aberto = false;

camera.position.copy(inicioCamera);

document.getElementById("botaoAbrir").addEventListener("click", function () {
  document.getElementById("abertura").classList.add("sumiu");
  document.getElementById("botaoMais").hidden = false;
  aberto = true;
  if (menosMovimento) {
    camera.position.copy(fimCamera);
    controles.enabled = true;
  } else {
    voando = true;
    progressoVoo = 0;
  }
  setTimeout(function () { document.getElementById("dica").style.opacity = "0.35"; }, 7000);
});

// ===== Ajustar ao tamanho da tela =====
function ajustarTamanho() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  const empe = w < h; // celular em pé
  camera.fov = empe ? 70 : 60;
  fimCamera = empe ? new THREE.Vector3(0, 14, 40) : new THREE.Vector3(0, 9, 24);
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", ajustarTamanho);
ajustarTamanho();

// ===== Animação =====
const relogio = new THREE.Clock();

function animar() {
  const dt = Math.min(relogio.getDelta(), 0.05);
  const t = relogio.elapsedTime;

  if (voando) {
    progressoVoo = Math.min(progressoVoo + dt / 3.2, 1);
    const suave = 1 - Math.pow(1 - progressoVoo, 3);
    camera.position.lerpVectors(inicioCamera, fimCamera, suave);
    camera.lookAt(controles.target);
    if (progressoVoo >= 1) {
      voando = false;
      controles.enabled = true;
    }
  } else if (controles.enabled) {
    controles.update();
  } else {
    camera.lookAt(controles.target);
  }

  if (!menosMovimento) {
    galaxia.rotation.y += dt * 0.05;
    anel.rotation.y -= dt * 0.03;
    coracao.scale.setScalar(1 + Math.sin(t * 2.4) * 0.05);
    anel.children.forEach(function (obj) {
      if (obj.userData.base != null) {
        obj.position.y = obj.userData.base + Math.sin(t * 0.8 + obj.userData.fase) * 0.35;
      }
    });
    coracoezinhos.forEach(function (s) {
      s.position.y += dt * s.userData.velocidade;
      if (s.position.y > 14) s.position.y = -3;
    });
  }

  coracao.quaternion.copy(camera.quaternion);
  renderer.render(cena, camera);
  posicionarFotos();
  requestAnimationFrame(animar);
}

animar();
