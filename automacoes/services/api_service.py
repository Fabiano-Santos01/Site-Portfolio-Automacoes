import csv
import json
import random
from pathlib import Path
from urllib.parse import urlparse

import requests

from automacoes.services.data_formatter import formatar_dados

BASE_DIR = Path(__file__).resolve().parents[2]
ALLOWED_HOSTS = {"servicodados.ibge.gov.br", "api.coingecko.com", "picsum.photos"}


def _normalizar_host(url: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme != "https" or not parsed.hostname:
        raise ValueError("Use uma URL HTTPS de uma API compatível.")
    host = parsed.hostname.lower().rstrip(".")
    if host not in ALLOWED_HOSTS:
        raise ValueError("API não permitida. Use IBGE, CoinGecko ou Picsum.")
    return host


def _flatten_json(value, prefix=""):
    """Transforma estruturas JSON simples em linhas legíveis para XLSX/CSV."""
    rows = []
    if isinstance(value, list):
        for i, item in enumerate(value, start=1):
            if isinstance(item, dict):
                row = {"Registro": i}
                for key, val in item.items():
                    row[str(key)] = json.dumps(val, ensure_ascii=False) if isinstance(val, (dict, list)) else val
                rows.append(row)
            else:
                rows.append({"Registro": i, "Valor": item})
    elif isinstance(value, dict):
        rows.append({str(k): (json.dumps(v, ensure_ascii=False) if isinstance(v, (dict, list)) else v) for k, v in value.items()})
    else:
        rows.append({"Valor": value})
    return rows


def processar_api(url, output_dir=None):
    """Consulta uma API compatível, normaliza os dados e salva CSV no projeto."""
    if not url:
        return None, []

    host = _normalizar_host(url)
    destino = Path(output_dir).resolve() if output_dir else BASE_DIR
    destino.mkdir(parents=True, exist_ok=True)
    nome_arquivo = destino / "dados_processados.csv"
    dados_final = []

    if host == "picsum.photos":
        # A integração usa a API oficial de listagem do Picsum; evita URLs arbitrárias.
        pagina = random.randint(1, 50)
        resposta = requests.get(f"https://picsum.photos/v2/list?page={pagina}&limit=10", timeout=15)
        resposta.raise_for_status()
        for img in resposta.json():
            dados_final.append({
                "tipo": "imagem",
                "autor": img.get("author", "Desconhecido"),
                "url_imagem": img.get("download_url") or img.get("url") or f"https://picsum.photos/500/300?random={random.randint(1,100000)}",
            })

    elif host == "api.coingecko.com":
        resposta = requests.get(url, timeout=15, headers={"User-Agent": "FabianoPortfolio/1.0"})
        resposta.raise_for_status()
        payload = resposta.json()
        if isinstance(payload, list):
            for moeda in payload[:100]:
                if isinstance(moeda, dict):
                    dados_final.append({
                        "tipo": "crypto",
                        "nome": moeda.get("name", moeda.get("id", "Desconhecido")),
                        "preco_usd": moeda.get("current_price", moeda.get("market_data", {}).get("current_price", {}).get("usd") if isinstance(moeda.get("market_data"), dict) else None),
                    })
        if not dados_final:
            dados_final = [{"tipo": "generico", **row} for row in _flatten_json(payload)]

    elif host == "servicodados.ibge.gov.br":
        resposta = requests.get(url, timeout=20, headers={"User-Agent": "FabianoPortfolio/1.0"})
        resposta.raise_for_status()
        payload = resposta.json()
        # APIs de agregados em formato de série histórica.
        if isinstance(payload, list) and payload and isinstance(payload[0], dict) and "resultados" in payload[0]:
            for conjunto in payload:
                for resultado in conjunto.get("resultados", []):
                    for serie in resultado.get("series", []):
                        localidade = serie.get("localidade", {})
                        local_nome = localidade.get("nome", "Brasil") if isinstance(localidade, dict) else str(localidade)
                        valores = serie.get("serie", {})
                        if isinstance(valores, dict):
                            for ano, valor in valores.items():
                                dados_final.append({"tipo": "ibge", "localidade": f"{local_nome} ({ano})", "valor": valor})
        # O endpoint /variaveis retorna metadados da variável, não série temporal.
        if not dados_final:
            for row in _flatten_json(payload):
                dados_final.append({"tipo": "generico", **row})

    if not dados_final:
        return None, []

    dados_formatados = formatar_dados(dados_final)
    # Preserva campos de metadados genéricos com os nomes originais.
    if not dados_formatados:
        dados_formatados = _flatten_json(dados_final)

    colunas = list(dict.fromkeys(chave for linha in dados_formatados for chave in linha.keys()))
    with open(nome_arquivo, mode="w", newline="", encoding="utf-8-sig") as arquivo:
        writer = csv.DictWriter(arquivo, fieldnames=colunas, delimiter=";")
        writer.writeheader()
        writer.writerows(dados_formatados)

    return str(nome_arquivo), dados_formatados
