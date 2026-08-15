# Aplicação do conceito de Pesquisa em Largura em solução para Sistemas de bicicletas compartilhadas

> Repositório público de estudos: aplico conceitos do livro [*Entendendo Algoritmos*](https://www.casadocodigo.com.br/products/livro-entendendo-algoritmos) (Aditya Y. Bhargava) em um cenário real de **mobilidade urbana** e **micromobilidade**.

API em **Python / FastAPI** que coleta estações reais do [BikeRio](https://www.bikerio.rio/) via [pybikes](https://github.com/eskerda/pybikes), monta um **grafo de vizinhança** com **Haversine** e encontra o **caminho com menos paradas** com **pesquisa em largura (BFS)**. O frontend em **HTML + Leaflet** mostra as estações no mapa e deixa escolher origem e destino com um clique.

**Tópicos:** pesquisa em largura · grafos · caminho mínimo · Haversine · Leaflet · GBFS · API REST · Python · FastAPI

## O que estou aprendendo aqui

- **Grafos** como lista de adjacência (estações e suas vizinhas)
- Distância geográfica com a fórmula de **Haversine**
- Como o limiar de distância altera a densidade do grafo (ex.: 300 m vs 1000 m)
- **Pesquisa em largura (BFS)** para caminho com o menor número de saltos
- Visualização em mapa e interação origem/destino
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

- **Mapa (frontend):** http://127.0.0.1:8000/
- **Health check:** http://127.0.0.1:8000/health
- **Documentação da API:** http://127.0.0.1:8000/docs

A primeira carga das estações pode demorar alguns segundos: o `pybikes` busca os dados na rede.

## Como usar o mapa

1. Abra http://127.0.0.1:8000/
2. Clique em uma estação de **origem** (marcador verde)
3. Clique em uma estação de **destino** (marcador vermelho)
4. Ajuste o limiar de vizinhança (300 / 500 / 800 / 1000 m), se quiser
5. Clique em **Calcular caminho**

O mapa desenha a polilinha entre as estações do caminho. O painel mostra total de paradas (saltos do BFS), distância total em metros e a lista ordenada.

**Limpar** remove a seleção e o desenho.

Lembrete do livro: BFS encontra o caminho com **menos arestas** (menos estações intermediárias), não o de menor quilometragem.

## Endpoints

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/` | Frontend com o mapa |
| `GET` | `/health` | Confirma que a API está no ar |
| `GET` | `/estacoes` | Estações reais do BikeRio |
| `GET` | `/grafo` | Grafo de adjacência por distância |
| `GET` | `/estacoes/{id_estacao}/vizinhos` | Vizinhos de uma estação |
| `GET` | `/caminho` | Caminho com menos paradas (BFS) |
| `GET` | `/docs` | Documentação interativa (Swagger) |

### Parâmetros — `/caminho`

| Parâmetro | Obrigatório | Descrição |
|-----------|-------------|-----------|
| `origem` | Sim | Id da estação de origem |
| `destino` | Sim | Id da estação de destino |
| `distancia_maxima_metros` | Não | Limiar para montar o grafo. Padrão: `500` |

### Parâmetros — `/grafo` e `/estacoes/{id_estacao}/vizinhos`

| Parâmetro | Obrigatório | Descrição |
|-----------|-------------|-----------|
| `distancia_maxima_metros` | Não | Distância máxima (em metros) para duas estações serem vizinhas. Padrão: `500` |

## Como o grafo é montado

Arquivo: `app/construtor_grafo.py`

1. Cada estação é um **nó**.
2. A distância entre pares de estações é calculada com **Haversine**.
3. Se a distância for **menor ou igual** ao limiar, as duas estações viram **vizinhas** (aresta nos dois sentidos).

O grafo é **não direcionado**: se A é vizinha de B, B também é vizinha de A.

## Onde está a pesquisa em largura

Arquivo: `app/calculadora_melhor_caminho.py`

O BFS percorre a lista de adjacência, guarda `veio_de` para reconstruir o caminho e devolve a sequência com menos saltos. O endpoint `/caminho` enriquece cada passo com nome, coordenadas e distância até a estação anterior.

## Estrutura do projeto

```
BikeSharingCollector/
├── app/
│   ├── coletor_estacoes.py           # Coleta e normaliza estações do BikeRio
│   ├── construtor_grafo.py           # Haversine + montagem do grafo
│   ├── calculadora_melhor_caminho.py # BFS + detalhamento do caminho
│   └── main.py                       # Endpoints da API + estáticos
├── static/
│   ├── index.html                    # Página do mapa
│   ├── css/estilo.css
│   └── js/
│       ├── api.js                    # Chamadas à API
│       └── mapa.js                   # Leaflet e interação
└── README.md
```

## Exemplo de resposta — `/caminho`

```json
{
  "origem": "488",
  "destino": "173",
  "distancia_maxima_metros": 500,
  "total_paradas": 2,
  "distancia_total_metros": 740.5,
  "caminho": [
    {
      "ordem": 0,
      "id": "488",
      "nome": "Estação A",
      "latitude": -22.91,
      "longitude": -43.17,
      "distancia_da_anterior_metros": null
    },
    {
      "ordem": 1,
      "id": "200",
      "nome": "Estação B",
      "latitude": -22.92,
      "longitude": -43.18,
      "distancia_da_anterior_metros": 320.4
    }
  ]
}
```

Os valores reais vêm do feed do BikeRio e mudam conforme as estações do sistema.

## Contexto

Este repositório complementa estudos sobre algoritmos (grafos, pesquisa em largura, caminho mínimo) aplicados a cenários de **micromobilidade** e feeds de bicicletas compartilhadas, onde decidir a próxima estação a partir da distância impacta diretamente a experiência de quem usa o sistema na cidade.
