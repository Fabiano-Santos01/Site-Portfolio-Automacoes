# main_unificado.py

import sys
import csv
from faker import Faker


def exibir_informacoes_sistema():
    print("----- INFORMAÇÕES DO SISTEMA -----")
    print(f"Plataforma: {sys.platform}")
    print(f"Python: {sys.version}")


def gerar_dados_falsos_csv(quantidade=10):
    print("\n----- GERANDO DADOS ORGANIZADOS -----")

    fake = Faker('pt-BR')
    nome_arquivo = "dados_falsos_organizados.csv"

    campos = [
        "Nome",
        "Email",
        "CPF",
        "RG",
        "Telefone",
        "Rua",
        "Numero",
        "Cidade",
        "Estado",
        "CEP",
        "Cartao",
        "Validade",
        "CVV"
    ]

    with open(nome_arquivo, mode="w", newline="", encoding="utf-8") as arquivo:
        writer = csv.DictWriter(arquivo, fieldnames=campos)
        writer.writeheader()

        for _ in range(quantidade):
            endereco = fake.address().replace("\n", ", ").split(", ")

            writer.writerow({
                "Nome": fake.name(),
                "Email": fake.email(),
                "CPF": fake.cpf(),
                "RG": fake.rg(),
                "Telefone": fake.phone_number(),
                "Rua": endereco[0] if len(endereco) > 0 else "",
                "Numero": fake.building_number(),
                "Cidade": fake.city(),
                "Estado": fake.state_abbr(),
                "CEP": fake.postcode(),
                "Cartao": fake.credit_card_number(),
                "Validade": fake.credit_card_expire(),
                "CVV": fake.credit_card_security_code()
            })

    print(f"{quantidade} registros salvos em '{nome_arquivo}'")


if __name__ == "__main__":
    exibir_informacoes_sistema()
    gerar_dados_falsos_csv(20)
    print("\nFinalizado.")