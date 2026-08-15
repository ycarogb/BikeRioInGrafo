from collections import deque

def estacao_final_encontrada(estacao, id_destino):
    return estacao == id_destino

def caminho_com_menos_paradas(grafo, id_origem, id_destino):
    veio_de = {}
    fila_de_pesquisa = deque([id_origem])
    verificadas = []

    while fila_de_pesquisa:
        estacao_atual = fila_de_pesquisa.popleft()

        if estacao_atual in verificadas:
            continue

        if estacao_final_encontrada(estacao_atual, id_destino):
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

            if estacao_vizinha not in verificadas and id_estacao_vizinha not in veio_de:
                veio_de[id_estacao_vizinha] = estacao_atual
                fila_de_pesquisa.append(id_estacao_vizinha)
        verificadas.append(estacao_atual)

    return None