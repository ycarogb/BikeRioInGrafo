const CENTRO_RIO = [-22.91, -43.2];
const ZOOM_INICIAL = 12;

if (typeof L === "undefined") {
  document.getElementById("status").textContent =
    "Não foi possível carregar o Leaflet. Verifique a conexão com a internet.";
  document.getElementById("status").className =
    "painel__status painel__status--erro";
  throw new Error("Leaflet não carregou");
}

const iconePadrao = L.divIcon({
  className: "marcador-estacao",
  html: '<span class="marcador-estacao__ponto"></span>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const iconeOrigem = L.divIcon({
  className: "marcador-estacao marcador-estacao--origem",
  html: '<span class="marcador-estacao__ponto"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const iconeDestino = L.divIcon({
  className: "marcador-estacao marcador-estacao--destino",
  html: '<span class="marcador-estacao__ponto"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const iconeParada = L.divIcon({
  className: "marcador-estacao marcador-estacao--parada",
  html: '<span class="marcador-estacao__ponto"></span>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const estado = {
  origem: null,
  destino: null,
  marcadoresPorId: new Map(),
  camadaCaminho: null,
  marcadoresParada: [],
};

const mapa = L.map("mapa").setView(CENTRO_RIO, ZOOM_INICIAL);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(mapa);

function ajustarTamanhoMapa() {
  mapa.invalidateSize();
}

window.addEventListener("load", ajustarTamanhoMapa);
window.addEventListener("resize", ajustarTamanhoMapa);
setTimeout(ajustarTamanhoMapa, 100);
setTimeout(ajustarTamanhoMapa, 500);

const elementos = {
  instrucao: document.getElementById("instrucao"),
  origemNome: document.getElementById("origem-nome"),
  destinoNome: document.getElementById("destino-nome"),
  limiar: document.getElementById("limiar"),
  botaoCalcular: document.getElementById("botao-calcular"),
  botaoLimpar: document.getElementById("botao-limpar"),
  status: document.getElementById("status"),
  resultado: document.getElementById("resultado"),
  totalParadas: document.getElementById("total-paradas"),
  distanciaTotal: document.getElementById("distancia-total"),
  listaCaminho: document.getElementById("lista-caminho"),
};

function definirStatus(mensagem, tipo = "") {
  elementos.status.textContent = mensagem;
  elementos.status.className = "painel__status";
  if (tipo) {
    elementos.status.classList.add(`painel__status--${tipo}`);
  }
}

function atualizarPainelSelecao() {
  elementos.origemNome.textContent = estado.origem
    ? estado.origem.nome
    : "—";
  elementos.destinoNome.textContent = estado.destino
    ? estado.destino.nome
    : "—";

  const pronto = Boolean(estado.origem && estado.destino);
  elementos.botaoCalcular.disabled = !pronto;

  if (!estado.origem) {
    elementos.instrucao.innerHTML =
      'Clique em uma estação de <strong>origem</strong> e depois na de <strong>destino</strong>.';
  } else if (!estado.destino) {
    elementos.instrucao.innerHTML =
      "Agora clique na estação de <strong>destino</strong>.";
  } else {
    elementos.instrucao.textContent =
      "Pronto. Ajuste o limiar se quiser e calcule o caminho.";
  }
}

function atualizarIconesMarcadores() {
  estado.marcadoresPorId.forEach((marcador, id) => {
    if (estado.origem && id === estado.origem.id) {
      marcador.setIcon(iconeOrigem);
    } else if (estado.destino && id === estado.destino.id) {
      marcador.setIcon(iconeDestino);
    } else {
      marcador.setIcon(iconePadrao);
    }
  });
}

function limparDesenhoCaminho() {
  if (estado.camadaCaminho) {
    mapa.removeLayer(estado.camadaCaminho);
    estado.camadaCaminho = null;
  }
  estado.marcadoresParada.forEach((marcador) => mapa.removeLayer(marcador));
  estado.marcadoresParada = [];
}

function limparSelecao() {
  estado.origem = null;
  estado.destino = null;
  limparDesenhoCaminho();
  elementos.resultado.hidden = true;
  elementos.listaCaminho.innerHTML = "";
  definirStatus("");
  atualizarIconesMarcadores();
  atualizarPainelSelecao();
}

function selecionarEstacao(estacao) {
  limparDesenhoCaminho();
  elementos.resultado.hidden = true;
  definirStatus("");

  if (!estado.origem || (estado.origem && estado.destino)) {
    estado.origem = estacao;
    estado.destino = null;
  } else if (estacao.id === estado.origem.id) {
    definirStatus("Escolha uma estação diferente para o destino.", "erro");
    return;
  } else {
    estado.destino = estacao;
  }

  atualizarIconesMarcadores();
  atualizarPainelSelecao();
}

function desenharCaminho(resultado) {
  limparDesenhoCaminho();

  const coordenadas = resultado.caminho.map((passo) => [
    passo.latitude,
    passo.longitude,
  ]);

  estado.camadaCaminho = L.polyline(coordenadas, {
    color: "#0d9488",
    weight: 5,
    opacity: 0.9,
  }).addTo(mapa);

  resultado.caminho.forEach((passo, indice) => {
    const ehExtremidade =
      indice === 0 || indice === resultado.caminho.length - 1;
    if (ehExtremidade) {
      return;
    }

    const marcador = L.marker([passo.latitude, passo.longitude], {
      icon: iconeParada,
      interactive: false,
    }).addTo(mapa);
    estado.marcadoresParada.push(marcador);
  });

  mapa.fitBounds(estado.camadaCaminho.getBounds(), { padding: [40, 40] });
}

function preencherResultado(resultado) {
  elementos.totalParadas.textContent = String(resultado.total_paradas);
  elementos.distanciaTotal.textContent =
    `${resultado.distancia_total_metros.toLocaleString("pt-BR")} m`;

  elementos.listaCaminho.innerHTML = "";
  resultado.caminho.forEach((passo, indice) => {
    const item = document.createElement("li");
    if (indice === 0) {
      item.classList.add("origem");
    }
    if (indice === resultado.caminho.length - 1) {
      item.classList.add("destino");
    }

    const distancia =
      passo.distancia_da_anterior_metros == null
        ? "início"
        : `+${passo.distancia_da_anterior_metros.toLocaleString("pt-BR")} m`;

    item.innerHTML = `
      <strong>${passo.ordem + 1}. ${passo.nome}</strong>
      <span class="passo-meta">id ${passo.id} · ${distancia}</span>
    `;
    elementos.listaCaminho.appendChild(item);
  });

  elementos.resultado.hidden = false;
}

async function calcularCaminho() {
  if (!estado.origem || !estado.destino) {
    return;
  }

  elementos.botaoCalcular.disabled = true;
  definirStatus("Calculando caminho…");

  try {
    const limiar = Number(elementos.limiar.value);
    const resultado = await buscarCaminho(
      estado.origem.id,
      estado.destino.id,
      limiar,
    );
    desenharCaminho(resultado);
    preencherResultado(resultado);
    definirStatus(
      `Caminho encontrado com ${resultado.total_paradas} parada(s).`,
      "ok",
    );
  } catch (erro) {
    limparDesenhoCaminho();
    elementos.resultado.hidden = true;
    definirStatus(erro.message || "Falha ao calcular o caminho.", "erro");
  } finally {
    atualizarPainelSelecao();
  }
}

async function iniciar() {
  definirStatus("Carregando estações…");

  try {
    const estacoes = await buscarEstacoes();

    estacoes.forEach((estacao) => {
      const marcador = L.marker([estacao.latitude, estacao.longitude], {
        icon: iconePadrao,
        title: estacao.nome,
      }).addTo(mapa);

      marcador.bindTooltip(estacao.nome);
      marcador.on("click", () => selecionarEstacao(estacao));
      estado.marcadoresPorId.set(estacao.id, marcador);
    });

    definirStatus(`${estacoes.length} estações carregadas.`);
    atualizarPainelSelecao();
    ajustarTamanhoMapa();
  } catch (erro) {
    definirStatus(erro.message || "Erro ao carregar estações.", "erro");
  }
}

elementos.botaoCalcular.addEventListener("click", calcularCaminho);
elementos.botaoLimpar.addEventListener("click", limparSelecao);

iniciar();
