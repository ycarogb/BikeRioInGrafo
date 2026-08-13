from fastapi import FastAPI  # type: ignore[reportMissingImports]
from app.coletor_estacoes import obter_estacoes

app = FastAPI(title="Grafo de estações BikeRio")

@app.get("/")
def raiz():
    return {"ok": True}

@app.get("/estacoes")
def listar_estacoes():
    return obter_estacoes()