import pybikes

def obter_estacoes():
    sistema = pybikes.get('bikerio')
    sistema.update()

    estacoes = []
    for estacao in sistema.stations:
        identificador = estacao.extra.get("uid", estacao.name)
        estacoes.append({
            "id": str(identificador),
            "nome": estacao.name,
            "latitude": estacao.latitude ,
            "longitude": estacao.longitude
        })

    return estacoes