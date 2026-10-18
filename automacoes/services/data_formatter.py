# ==========================================
# FORMATADOR DE DADOS
# ==========================================

def formatar_dados(dados):

    organizados = []

    if not dados:
        return organizados

    for item in dados:

        if not isinstance(item, dict):
            continue

        tipo = item.get("tipo", "").lower().strip()

        # ==================================
        # CRYPTO
        # ==================================

        if tipo == "crypto":

            organizados.append({
                "Categoria": "Crypto",
                "Nome": item.get("nome", "Não informado"),
                "Valor (USD)": item.get("preco_usd", "N/A")
            })

        # ==================================
        # IMAGEM
        # ==================================

        elif tipo == "imagem":

            organizados.append({
                "Categoria": "Imagem",
                "Autor": item.get("autor", "Desconhecido"),
                "Link": item.get("url_imagem", "Sem link")
            })

        # ==================================
        # IBGE
        # ==================================

        elif tipo == "ibge":

            organizados.append({
                "Categoria": "IBGE",
                "Local": item.get("localidade", "Não informado"),
                "Valor": item.get("valor", "N/A")
            })

        # ==================================
        # FALLBACK
        # ==================================

        else:
            # APIs como o endpoint de metadados do IBGE podem retornar campos
            # que não são séries históricas. Preserve esses campos para exportação.
            registro = {"Categoria": tipo.title() if tipo else "API"}
            for chave, valor in item.items():
                if chave == "tipo":
                    continue
                registro[str(chave)] = str(valor) if isinstance(valor, (dict, list)) else valor
            organizados.append(registro)

    return organizados