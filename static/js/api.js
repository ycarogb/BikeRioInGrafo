async function buscarEstacoes() {
  const resposta = await fetch("/estacoes");
  if (!resposta.ok) {
    throw new Error("Não foi possível carregar as estações.");
  }
  return resposta.json();
}

async function buscarCaminho(origem, destino, distanciaMaximaMetros) {
  const parametros = new URLSearchParams({
    origem,
    destino,
    distancia_maxima_metros: String(distanciaMaximaMetros),
  });
  const resposta = await fetch(`/caminho?${parametros.toString()}`);
  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(dados.detail || "Erro ao calcular o caminho.");
  }

  if (dados.erro) {
    throw new Error(dados.erro);
  }

  return dados;
}
