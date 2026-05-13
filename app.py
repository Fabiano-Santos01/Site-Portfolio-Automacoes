import os
from flask_cors import CORS
from flask import (
    Flask,
    render_template,
    request,
    send_file,
    jsonify
)

from dotenv import load_dotenv

from automações.main_unificado import (
    gerar_dados_falsos_csv
)

from automações.services.email_service import (
    enviar_email,
    gerar_mensagem
)

from automações.services.api_service import (
    processar_api
)

from automações.services.roteiro_de_envio import (
    enviar_para_rede
)

# ==========================================
# CARREGAR .ENV
# ==========================================

load_dotenv()

# ==========================================
# CONFIG FLASK
# ==========================================

app = Flask(__name__, template_folder='.', static_url_path='', static_folder='.')

CORS(app)

# ==========================================
# ROTAS PRINCIPAIS
# ==========================================

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/projetos')
def projetos():
    return render_template('projetos.html')


@app.route('/automacoes')
def automacoes():
    return render_template('automacoes.html')


# ==========================================
# EXECUTAR AUTOMAÇÃO
# ==========================================

@app.route('/executar', methods=['POST'])
def executar():

    try:

        email = request.form.get('email')
        nome = request.form.get('nome', 'Dev')
        api_url = request.form.get('api_url')

        quantidade = int(
            request.form.get('quantidade', 10)
        )

        # ==================================
        # VALIDAÇÕES
        # ==================================

        if not email:
            return jsonify({
                "status": "erro",
                "mensagem": "E-mail obrigatório."
            })

        if not nome:
            return jsonify({
                "status": "erro",
                "mensagem": "Nome obrigatório."
            })

        # ==================================
        # GERAR CSV FAKE
        # ==================================

        gerar_dados_falsos_csv(
            quantidade
        )

        arquivo_fake = (
            'dados_falsos_organizados.csv'
        )

        # ==================================
        # MENSAGEM EMAIL
        # ==================================

        mensagem = gerar_mensagem(nome)

        # ==================================
        # PROCESSAR API
        # ==================================

        arquivo_processado = None
        dados = []

        if api_url:

            arquivo_processado, dados = (
                processar_api(api_url)
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

        # ==================================
        # RESPOSTA
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
        })

    except Exception as erro:

        return jsonify({
            "status": "erro",
            "mensagem": str(erro)
        })


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

        # ==================================
        # VALIDAÇÕES
        # ==================================

        if not tipo:

            return jsonify({
                "status": "erro",
                "mensagem": (
                    "Escolha uma plataforma."
                )
            })

        if not mensagem:

            return jsonify({
                "status": "erro",
                "mensagem": (
                    "Digite uma mensagem."
                )
            })

        # ==================================
        # EXECUTAR ENVIO
        # ==================================

        resultado = enviar_para_rede(
            tipo,
            mensagem
        )

        return jsonify({
            "status": "sucesso",
            "mensagem": resultado
        })

    except Exception as erro:

        return jsonify({
            "status": "erro",
            "mensagem": str(erro)
        })


# ==========================================
# DOWNLOAD CSV
# ==========================================

@app.route('/download')
def download():

    nome_arquivo = (
        'dados_falsos_organizados.csv'
    )

    if not os.path.exists(
        nome_arquivo
    ):

        return jsonify({
            "status": "erro",
            "mensagem": (
                "Arquivo não encontrado."
            )
        })

    return send_file(
        nome_arquivo,
        as_attachment=True
    )


# ==========================================
# START FLASK
# ==========================================

if __name__ == '__main__':

    app.run(
        debug=True
    )