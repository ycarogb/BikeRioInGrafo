# Aplicação do conceito de Pesquisa em Largura em solução para Sistemas de bicicletas compartilhadas

> Repositório público de estudos: aplico conceitos do livro [*Entendendo Algoritmos*](https://www.casadocodigo.com.br/products/livro-entendendo-algoritmos) (Aditya Y. Bhargava) em um cenário real de **mobilidade urbana** e **micromobilidade**.

API em **Python / FastAPI** que coleta estações reais do [BikeRio](https://www.bikerio.rio/) via [pybikes](https://github.com/eskerda/pybikes), calcula a distância entre elas com **Haversine** e monta um **grafo de vizinhança**. Esse grafo é a base para encontrar o **caminho mínimo** com **pesquisa em largura (BFS)**.

**Tópicos:** pesquisa em largura · grafos · caminho mínimo · Haversine · GBFS · API REST · Python · FastAPI

## O que estou aprendendo aqui

- **Grafos** como lista de adjacência (estações e suas vizinhas)
- Distância geográfica com a fórmula de **Haversine**
- Como o limiar de distância altera a densidade do grafo (ex.: 300 m vs 1000 m)
- **Pesquisa em largura (BFS)** para caminho com o menor número de saltos (próximo passo)
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

### Listar estações

```
http://127.0.0.1:8000/estacoes
```

### Montar o grafo de vizinhança

Estações a até **500 metros** uma da outra viram vizinhas (o limiar é configurável):

```
http://127.0.0.1:8000/grafo?distancia_maxima_metros=500
```

### PowerShell

```powershell
Invoke-RestMethod "http://127.0.0.1:8000/grafo?distancia_maxima_metros=500"
```

### Documentação interativa

Use o Swagger em **http://127.0.0.1:8000/docs** para disparar as requisições pelo navegador.

Dica: compare `300`, `500` e `1000` metros. Limiar maior gera mais vizinhos; limiar menor gera um grafo mais esparso. O resultado deve ser coerente com o mapa do BikeRio.

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/` | Confirma que a API está no ar |
| `GET` | `/estacoes` | Estações reais do BikeRio |
| `GET` | `/grafo` | Grafo de adjacência por distância |
| `GET` | `/estacoes/{id_estacao}/vizinhos` | Vizinhos de uma estação |
| `GET` | `/docs` | Documentação interativa (Swagger) |

### Parâmetros — `/grafo` e `/estacoes/{id_estacao}/vizinhos`

| Parâmetro | Obrigatório | Descrição |
|-----------|-------------|-----------|
| `distancia_maxima_metros` | Não | Distância máxima (em metros) para duas estações serem vizinhas. Padrão em `/grafo`: `500` |

## Como o grafo é montado

Arquivo: `app/construtor_grafo.py`

1. Cada estação é um **nó**.
2. A distância entre pares de estações é calculada com **Haversine** (metros na superfície da Terra).
3. Se a distância for **menor ou igual** ao limiar, as duas estações viram **vizinhas** (aresta nos dois sentidos).

O grafo é **não direcionado**: se A é vizinha de B, B também é vizinha de A.

## Onde está a pesquisa em largura

O BFS precisa exatamente desse grafo: uma lista de adjacência.

**Já feito:** coleta de estações + construção do grafo por distância.  
**Próximo passo:** percorrer o grafo com BFS para responder: *qual o caminho com menos paradas entre a estação A e a estação B?*

Lembrete do livro: BFS encontra o caminho com **menos arestas** (menos estações intermediárias), não o de menor quilometragem. Distância ponderada entra depois, com Dijkstra.

## Estrutura do projeto

```
BikeSharingCollector/
├── app/
│   ├── coletor_estacoes.py    # Coleta e normaliza estações do BikeRio
│   ├── construtor_grafo.py    # Haversine + montagem do grafo
│   └── main.py                # Endpoints da API
└── README.md
```

## Exemplo de resposta — `/estacoes`

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

## Exemplo de resposta — `/grafo`

```json
{
  "distancia_maxima_metros": 500,
  "total_estacoes": 80,
  "grafo": {
    "Praça Saens Peña": [
      {
        "id": "12",
        "nome": "Estação vizinha",
        "distancia_metros": 320.4
      }
    ]
  }
}
```

Os valores reais vêm do feed do BikeRio e mudam conforme as estações do sistema.

## Contexto

Este repositório complementa estudos sobre algoritmos (grafos, pesquisa em largura, caminho mínimo) aplicados a cenários de **micromobilidade** e feeds de bicicletas compartilhadas, onde decidir a próxima estação a partir da distância impacta diretamente a experiência de quem usa o sistema na cidade.
