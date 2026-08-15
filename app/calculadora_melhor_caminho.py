from collections import deque

def estacao_final_encontrada(estacao, id_destino):
    return estacao == id_destino


def caminho_com_menos_paradas(grafo, id_origem, id_destino):
    if id_origem == id_destino:
        return [id_origem]

    if id_origem not in grafo or id_destino not in grafo:
        return None

    veio_de = {}
    fila_de_pesquisa = deque([id_origem])
    verificadas = []

    while fila_de_pesquisa:
        estacao_atual = fila_de_pesquisa.popleft()

        if estacao_atual in verificadas:
            continue

        if estacao_final_encontrada(estacao_atual, id_destino):
            caminho = []
            atual = id_destino
            while atual != id_origem:
                caminho.append(atual)
                atual = veio_de[atual]
            caminho.append(id_origem)
            caminho.reverse()
            return caminho

        for estacao_vizinha in grafo[estacao_atual]:
            id_estacao_vizinha = estacao_vizinha["id"]

            if id_estacao_vizinha not in verificadas and id_estacao_vizinha not in veio_de:
                veio_de[id_estacao_vizinha] = estacao_atual
                fila_de_pesquisa.append(id_estacao_vizinha)

        verificadas.append(estacao_atual)

    return None


def _distancia_entre_vizinhos(grafo, id_origem, id_destino):
    for vizinho in grafo.get(id_origem, []):
        if vizinho["id"] == id_destino:
            return vizinho["distancia_metros"]
    return None


def detalhar_caminho(caminho_ids, estacoes, grafo):
    estacoes_por_id = {estacao["id"]: estacao for estacao in estacoes}
    caminho_detalhado = []
    distancia_total_metros = 0.0

    for indice, id_estacao in enumerate(caminho_ids):
        estacao = estacoes_por_id[id_estacao]
        distancia_da_anterior = None

        if indice > 0:
            id_anterior = caminho_ids[indice - 1]
            distancia_da_anterior = _distancia_entre_vizinhos(
                grafo,
                id_anterior,
                id_estacao,
            )
            if distancia_da_anterior is not None:
                distancia_total_metros += distancia_da_anterior

        caminho_detalhado.append({
            "ordem": indice,
            "id": estacao["id"],
            "nome": estacao["nome"],
            "latitude": estacao["latitude"],
            "longitude": estacao["longitude"],
            "distancia_da_anterior_metros": distancia_da_anterior,
        })

    return {
        "total_paradas": len(caminho_ids) - 1,
        "distancia_total_metros": round(distancia_total_metros, 1),
        "caminho": caminho_detalhado,
    }
