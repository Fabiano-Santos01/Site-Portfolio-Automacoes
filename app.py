import os

from datetime import datetime

from flask_cors import CORS

from flask import (
    Flask,
    render_template,
    request,
    send_file,
    jsonify
)

from dotenv import load_dotenv

from automacoes.main_unificado import (
    gerar_dados_falsos_csv
)

from automacoes.services.email_service import (
    enviar_email,
    gerar_mensagem
)

from automacoes.services.api_service import (
    processar_api
)

from automacoes.services.roteiro_de_envio import (
    enviar_para_rede
)

# ==========================================
# CARREGAR .ENV
# ==========================================

load_dotenv()

# ==========================================
# CONFIG FLASK
# ==========================================

app = Flask(
    __name__,
    template_folder='.',
    static_url_path='',
    static_folder='.'
)

CORS(app)

# ==========================================
# ROTAS PRINCIPAIS
# ==========================================

@app.route('/')
def home():

    return render_template(
        'index.html'
    )


@app.route('/projetos')
def projetos():

    return render_template(
        'projetos.html'
    )


@app.route('/automacoes')
def automacoes():

    return render_template(
        'automacoes.html'
    )

# ==========================================
# EXECUTAR AUTOMAÇÃO
# ==========================================

@app.route('/executar', methods=['POST'])
def executar():

    try:

        email = request.form.get(
            'email'
        )

        nome = request.form.get(
            'nome',
            'Dev'
        )

        api_url = request.form.get(
            'api_url'
        )

        quantidade = int(
            request.form.get(
                'quantidade',
                10
            )
        )

        # ==================================
        # VALIDAÇÕES
        # ==================================

        if not email:

            return jsonify({
                "status": "erro",
                "mensagem": (
                    "E-mail obrigatório."
                )
            }), 400

        if not nome:

            return jsonify({
                "status": "erro",
                "mensagem": (
                    "Nome obrigatório."
                )
            }), 400

        # ==================================
        # GERAR CSV E XLSX
        # ==================================

        arquivo_csv, arquivo_xlsx = gerar_dados_falsos_csv(
            quantidade
        )

        arquivo_fake = arquivo_xlsx

        # ==================================
        # GERAR MENSAGEM
        # ==================================

        mensagem = gerar_mensagem(
            nome
        )

        # ==================================
        # PROCESSAR API
        # ==================================

        arquivo_processado = None
        dados = []

        if api_url:

            arquivo_processado, dados = (
                processar_api(
                    api_url
                )
            )

        # ==================================
        # DEFINIR ANEXO
        # ==================================

        anexo = (
            arquivo_processado
            if arquivo_processado
            else arquivo_fake
        )

        # ==================================
        # ENVIAR EMAIL
        # ==================================

        resultado_email = enviar_email(
            destinatario=email,
            mensagem=mensagem,
            anexo=anexo,
            dados=dados
        )

        print(
            f"[EMAIL RESULTADO] {resultado_email}"
        )

        # ==================================
        # VALIDAR RESULTADO
        # ==================================

        if (
            not resultado_email
            or "Erro" in resultado_email
        ):

            return jsonify({
                "status": "erro",
                "mensagem": resultado_email
            }), 500

        # ==================================
        # SUCESSO
        # ==================================

        return jsonify({
            "status": "sucesso",
            "mensagem": resultado_email
        })

    except ValueError:

        return jsonify({
            "status": "erro",
            "mensagem": (
                "Quantidade inválida."
            )
        }), 400

    except Exception as erro:

        print(
            f"[ERRO EXECUTAR] {erro}"
        )

        return jsonify({
            "status": "erro",
            "mensagem": str(erro)
        }), 500

# ==========================================
# BOT SOCIAL
# ==========================================

@app.route('/executar-bot', methods=['POST'])
def executar_bot():

    try:

        tipo = request.form.get(
            "plataforma"
        )

        mensagem = request.form.get(
            "mensagem"
        )

        nome = request.form.get(
            "nome",
            ""
        ).strip() or "Não informado"

        email = request.form.get(
            "email",
            ""
        ).strip() or "Não informado"

        # ==================================
        # CAPTURAR INFORMAÇÕES DO REQUEST
        # ==================================

        ip = request.headers.get(
            "X-Forwarded-For",
            request.remote_addr or "desconhecido"
        )

        user_agent = request.headers.get(
            "User-Agent",
            "desconhecido"
        )

        agora = datetime.now().strftime(
            "%d/%m/%Y %H:%M:%S"
        )

        # ==================================
        # VALIDAÇÕES
        # ==================================

        if not tipo:

            return jsonify({
                "status": "erro",
                "mensagem": (
                    "Escolha uma plataforma."
                )
            }), 400

        if not mensagem:

            return jsonify({
                "status": "erro",
                "mensagem": (
                    "Digite uma mensagem."
                )
            }), 400

        # ==================================
        # MONTAR MENSAGEM IDENTIFICADA
        # ==================================

        mensagem_identificada = (
            f"🧾 Nova solicitação do site\n"
            f"Nome: {nome}\n"
            f"E-mail: {email}\n"
            f"IP: {ip}\n"
            f"User-Agent: {user_agent}\n"
            f"Data: {agora}\n\n"
            f"Mensagem:\n{mensagem}"
        )

        # ==================================
        # EXECUTAR ENVIO
        # ==================================

        resultado = enviar_para_rede(
            tipo,
            mensagem_identificada
        )

        print(
            f"[BOT RESULTADO] {resultado}"
        )

        # ==================================
        # VALIDAR RESULTADO
        # ==================================

        if (
            not resultado
            or "Erro" in resultado
        ):

            return jsonify({
                "status": "erro",
                "mensagem": resultado
            }), 500

        # ==================================
        # SUCESSO
        # ==================================

        return jsonify({
            "status": "sucesso",
            "mensagem": resultado
        })

    except Exception as erro:

        print(
            f"[ERRO BOT] {erro}"
        )

        return jsonify({
            "status": "erro",
            "mensagem": str(erro)
        }), 500

# ==========================================
# DOWNLOAD CSV
# ==========================================

@app.route('/download')
def download():

    nome_arquivo = (
        'dados_falsos_organizados.xlsx'
    )

    if not os.path.exists(
        nome_arquivo
    ):

        return jsonify({
            "status": "erro",
            "mensagem": (
                "Arquivo não encontrado."
            )
        }), 404

    return send_file(
        nome_arquivo,
        as_attachment=True
    )

# ==========================================
# GERAR DADOS
# ==========================================

@app.route('/gerar-dados', methods=['POST'])
def gerar_dados():

    try:

        quantidade = int(
            request.form.get(
                'quantidade',
                10
            )
        )

        # ==================================
        # GERAR CSV
        # ==================================

        gerar_dados_falsos_csv(
            quantidade
        )

        # ==================================
        # RETORNAR ARQUIVO
        # ==================================

        return send_file(
            'dados_falsos_organizados.xlsx',
            as_attachment=True
        )

    except ValueError:

        return jsonify({
            "status": "erro",
            "mensagem": (
                "Quantidade inválida."
            )
        }), 400

    except Exception as erro:

        print(
            f"[ERRO GERAR DADOS] {erro}"
        )

        return jsonify({
            "status": "erro",
            "mensagem": str(erro)
        }), 500

# ==========================================
# START FLASK
# ==========================================

if __name__ == '__main__':

    app.run(
        debug=True
    )