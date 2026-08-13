# Aplicação do conceito de Pesquisa em Largura em solução para Sistemas de bicicletas compartilhadas

> Repositório público de estudos: aplico conceitos do livro [*Entendendo Algoritmos*](https://www.casadocodigo.com.br/products/livro-entendendo-algoritmos) (Aditya Y. Bhargava) em um cenário real de **mobilidade urbana** e **micromobilidade**.

API em **Python / FastAPI** que coleta estações reais do [BikeRio](https://www.bikerio.rio/) via [pybikes](https://github.com/eskerda/pybikes) e expõe um grafo de vizinhança baseado na **distância** entre elas, base para encontrar o **caminho mínimo** com **pesquisa em largura (BFS)**.

**Tópicos:** pesquisa em largura · grafos · caminho mínimo · Haversine · GBFS · API REST · Python · FastAPI

## O que estou aprendendo aqui

- **Grafos** como lista de adjacência (estações e suas vizinhas)
- **Pesquisa em largura (BFS)** para caminho com o menor número de saltos
- Distância geográfica com a fórmula de **Haversine**
- Aplicação prática em **mobilidade urbana** (ir de uma estação a outra no BikeRio)

## Pré-requisitos

- [Python 3](https://www.python.org/downloads/) (3.10 ou superior)

Verifique a instalação:

```powershell
python --version
```

## Como executar

Na raiz do repositório, crie e ative o ambiente virtual:

```powershell
python -m venv .venv
& .\.venv\Scripts\Activate.ps1
pip install fastapi uvicorn pybikes
```

Suba a API:

```powershell
uvicorn app.main:app --reload
```

A API sobe em **http://127.0.0.1:8000**. A documentação interativa fica em **http://127.0.0.1:8000/docs**.

## Teste com o BikeRio (Rio de Janeiro)

A coleta usa estações reais do sistema BikeRio. A primeira chamada pode demorar alguns segundos, porque o `pybikes` busca os dados na rede.

### Navegador

Abra:

```
http://127.0.0.1:8000/estacoes
```

### PowerShell

```powershell
Invoke-RestMethod "http://127.0.0.1:8000/estacoes"
```

### Documentação interativa

Use o Swagger em **http://127.0.0.1:8000/docs** para disparar as requisições pelo navegador.

A resposta traz `id`, `nome`, `latitude` e `longitude` de cada estação.

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/` | Confirma que a API está no ar |
| `GET` | `/estacoes` | Estações reais do BikeRio |
| `GET` | `/docs` | Documentação interativa (Swagger) |

## Onde está a pesquisa em largura

O BFS precisa de um **grafo**: cada estação (nó) ligada às vizinhas (arestas) quando a distância entre elas fica abaixo de um limiar.

Hoje a API entrega a lista de estações com coordenadas. O próximo passo é montar esse grafo e percorrê-lo com BFS para responder: *qual o caminho com menos paradas entre a estação A e a estação B?*

Lembrete do livro: BFS encontra o caminho com **menos arestas** (menos estações intermediárias), não o de menor quilometragem. Distância ponderada entra depois, com Dijkstra.

## Estrutura do projeto

```
BikeSharingCollector/
├── app/
│   ├── coletor_estacoes.py    # Coleta e normaliza estações do BikeRio
│   └── main.py                # Endpoints da API
├── PyBikeService.py           # Script inicial de exploração do pybikes
└── README.md
```

## Exemplo de resposta

```json
[
  {
    "id": "1",
    "nome": "Praça Saens Peña",
    "latitude": -22.928611,
    "longitude": -43.237778
  }
]
```

Os valores reais vêm do feed do BikeRio e mudam conforme as estações do sistema.

## Contexto

Este repositório complementa estudos sobre algoritmos (grafos, pesquisa em largura, caminho mínimo) aplicados a cenários de **micromobilidade** e feeds de bicicletas compartilhadas, onde decidir a próxima estação a partir da distância impacta diretamente a experiência de quem usa o sistema na cidade.
