from fastapi import FastAPI, Query  # type: ignore[reportMissingImports]
from app.coletor_estacoes import obter_estacoes
from app.construtor_grafo import consruir_grafo
from app.calculadora_melhor_caminho import (
    caminho_com_menos_paradas,
    detalhar_caminho,
)

app = FastAPI(title="Grafo de estações BikeRio")

@app.get("/")
def raiz():
    return {"ok": True}

@app.get("/estacoes")
def listar_estacoes():
    return obter_estacoes()

@app.get("/grafo")
def obter_grafo(
    distancia_maxima_metros: float = Query(default=500, gt=0) #Query(default=500, gt=0) vira ?distancia_maxima_metros=500 na URL e recusa valor negativo
):
    estacoes = obter_estacoes()
    return {
        "distancia_maxima_metros": distancia_maxima_metros,
        "total_estacoes": len(estacoes),
        "grafo": consruir_grafo(estacoes, distancia_maxima_metros)
    }

@app.get("/estacoes/{id_estacao}/vizinhos")
def obter_vizinhos(
    id_estacao: str,
    distancia_maxima_metros: float = Query(default=5800, gt=0)
):
    estacoes = obter_estacoes()
    grafo = consruir_grafo(estacoes, distancia_maxima_metros)
    vizinhos = grafo.get(id_estacao)

    if vizinhos is None: 
        return {"erro": "Estação não encontrada"}

    return {"id": id_estacao, "vizinhos": vizinhos}

@app.get("/caminho")
def obter_caminho(
    origem: str,
    destino: str,
    distancia_maxima_metros: float = Query(default=500, gt=0),
):
    estacoes = obter_estacoes()
    grafo = consruir_grafo(estacoes, distancia_maxima_metros)
    caminho_ids = caminho_com_menos_paradas(grafo, origem, destino)

    if caminho_ids is None:
        return {"erro": "Não há caminho entre as estações com esse limiar"}

    detalhe = detalhar_caminho(caminho_ids, estacoes, grafo)

    return {
        "origem": origem,
        "destino": destino,
        "distancia_maxima_metros": distancia_maxima_metros,
        "total_paradas": detalhe["total_paradas"],
        "distancia_total_metros": detalhe["distancia_total_metros"],
        "caminho": detalhe["caminho"],
    }