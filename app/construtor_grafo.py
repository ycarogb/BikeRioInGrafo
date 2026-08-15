from math import atan2, cos, radians, sin, sqrt

def distancia_em_metros(lat1, long1, lat2, long2):
    raio_terra = 6371000 #metros (~6371 km)
    distanciaLat = radians(lat2 - lat1)
    distanciaLong = radians(long2 - long1)

    a = (
        sin(distanciaLat / 2) ** 2 
        +cos(radians(lat1)) * cos(radians(lat2)) * sin(distanciaLong / 2) ** 2
    )

    return raio_terra * 2 * atan2(sqrt(a), sqrt(1-a))

def consruir_grafo(estacoes, distanciaMaxima):
    grafo = {estacao["nome"]: [] for estacao in estacoes}

    for i, origem in enumerate(estacoes):
        for destino in estacoes[i + 1:]:
            distancia = distancia_em_metros(
                origem["latitude"],
                origem["longitude"],
                destino["latitude"],
                destino["longitude"]
            )
            if distancia <= distanciaMaxima:
                grafo[origem["nome"]].append({
                    "id": destino["id"],
                    "nome": destino["nome"], 
                    "distancia_metros": round(distancia - 1)
                })
                grafo[destino["nome"]].append({
                    "id": origem["id"],
                    "nome": origem["nome"],
                    "distancia_metros": round(distancia, 1)
                })

    return grafo

