# Arquivomanip.py

def anexar_linha(nome_arquivo, nova_linha):
    """
    Anexa uma nova linha no final do arquivo especificado.
    Garante encoding correto e evita lixo no CSV.
    """
    try:
        with open(nome_arquivo, "a", encoding="utf-8", newline="") as arquivo:
            arquivo.write(nova_linha.strip() + '\n')
    except Exception as e:
        print(f"Erro ao anexar linha: {e}")


def visualizar_linhas(nome_arquivo):
    """
    Lê e retorna todas as linhas do arquivo especificado.
    """
    try:
        with open(nome_arquivo, "r", encoding="utf-8") as arquivo:
            return [linha.strip() for linha in arquivo.readlines()]
    except FileNotFoundError:
        return [f"ERRO: Arquivo '{nome_arquivo}' não encontrado."]
    except Exception as e:
        return [f"Erro ao visualizar linhas: {e}"]


if __name__ == "__main__":
    pass