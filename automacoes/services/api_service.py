import csv
import random
import requests

from automacoes.services.data_formatter import formatar_dados


# ==========================================
# PROCESSADOR PRINCIPAL DE APIs
# ==========================================

def processar_api(url):

    dados_final = []

    nome_arquivo = "dados_processados.csv"

    if not url:
        return None, []

    try:

        # ==================================
        # API DE IMAGENS RANDOM
        # ==================================

        if "picsum" in url:

            pagina = random.randint(1, 50)

            resposta = requests.get(
                f"https://picsum.photos/v2/list?page={pagina}&limit=10",
                timeout=10
            )

            resposta.raise_for_status()

            imagens = resposta.json()

            for img in imagens:

                dados_final.append({
                    "tipo": "imagem",
                    "autor": img.get("author", "Desconhecido"),
                    "url_imagem": (
                        f"https://picsum.photos/500/300"
                        f"?random={random.randint(1,100000)}"
                    )
                })

        # ==================================
        # API CRYPTO
        # ==================================

        elif "coingecko" in url:

            resposta = requests.get(url, timeout=10)

            resposta.raise_for_status()

            cryptos = resposta.json()

            for moeda in cryptos[:10]:

                dados_final.append({
                    "tipo": "crypto",
                    "nome": moeda.get("name"),
                    "preco_usd": moeda.get("current_price")
                })

        # ==================================
        # API IBGE
        # ==================================

        elif "ibge" in url:

            resposta = requests.get(url, timeout=10)

            resposta.raise_for_status()

            dados_ibge = resposta.json()

            try:

                resultados = (
                    dados_ibge[0]
                    .get("resultados", [])
                )

                for resultado in resultados:

                    series = resultado.get("series", [])

                    for serie in series:

                        localidade = (
                            serie.get("localidade", {})
                            .get("nome", "Brasil")
                        )

                        serie_dados = serie.get("serie", {})

                        for ano, valor in serie_dados.items():

                            dados_final.append({
                                "tipo": "ibge",
                                "localidade": f"{localidade} ({ano})",
                                "valor": valor
                            })

            except Exception as erro_ibge:
                print(f"[ERRO IBGE] {erro_ibge}")

        # ==================================
        # API NÃO SUPORTADA
        # ==================================

        else:

            return None, []

        # ==================================
        # FORMATAR DADOS
        # ==================================

        dados_formatados = formatar_dados(
            dados_final
        )

        # ==================================
        # GERAR CSV
        # ==================================

        if dados_formatados:

            colunas = dados_formatados[0].keys()

            with open(
                nome_arquivo,
                mode="w",
                newline="",
                encoding="utf-8"
            ) as arquivo:

                writer = csv.DictWriter(
                    arquivo,
                    fieldnames=colunas
                )

                writer.writeheader()

                writer.writerows(
                    dados_formatados
                )

            return nome_arquivo, dados_formatados

    except requests.RequestException as erro_request:

        print(f"[ERRO REQUEST] {erro_request}")

    except Exception as erro:

        print(f"[ERRO API] {erro}")

    return None, []