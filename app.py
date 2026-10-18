import os
import re
import shutil
from datetime import datetime
from pathlib import Path
from uuid import uuid4

from flask import Flask, jsonify, redirect, render_template, request, send_file, send_from_directory, url_for
from flask_cors import CORS
from dotenv import load_dotenv

from automacoes.main_unificado import gerar_dados_falsos_csv
from automacoes.services.api_service import processar_api
from automacoes.services.email_service import enviar_email, gerar_mensagem
from automacoes.services.roteiro_de_envio import enviar_para_rede
from automacoes.services.report_service import gerar_relatorio_xlsx

# ========================= CONFIGURAÇÃO PRINCIPAL =========================
BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / '.env')

app = Flask(__name__, template_folder=str(BASE_DIR), static_folder=str(BASE_DIR), static_url_path='')
CORS(app)

MAX_NAME = 120
MAX_EMAIL = 180
MAX_MESSAGE = 4000
REPORTS_DIR = BASE_DIR / 'relatorios'
REPORTS_DIR.mkdir(exist_ok=True)

# ========================= HELPERS / VALIDAÇÃO =========================
def clean_text(value, limit=500):
    return str(value or '').strip()[:limit]


def valid_email(value):
    return bool(re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", value or ''))


def request_context():
    ua = request.headers.get('User-Agent', '')
    forwarded = request.headers.get('X-Forwarded-For', request.remote_addr or 'unknown')
    ip = forwarded.split(',')[0].strip()
    if 'Windows' in ua: system = 'Windows'
    elif 'Android' in ua: system = 'Android'
    elif 'iPhone' in ua or 'iPad' in ua: system = 'iOS'
    elif 'Mac' in ua: system = 'macOS'
    elif 'Linux' in ua: system = 'Linux'
    else: system = 'Unknown'
    device = 'Mobile' if any(k in ua for k in ('Mobile','Android','iPhone','iPad')) else 'Desktop'
    return {'ip': ip, 'system': system, 'device': device, 'user_agent': ua}


def notify_telegram(action, name='', email='', whatsapp='', details=''):
    ctx = request_context()
    msg = (
        'NOVO USO NO PORTFÓLIO\n\n'
        f'Ação: {action}\n'
        f'Data/Hora: {datetime.now().strftime("%d/%m/%Y %H:%M:%S")}\n\n'
        f'Nome: {name or "Não informado"}\n'
        f'E-mail: {email or "Não informado"}\n'
        f'WhatsApp: {whatsapp or "Não informado"}\n'
        f'IP: {ctx["ip"]}\nSistema: {ctx["system"]}\nDispositivo: {ctx["device"]}\n\n{details}'
    )
    try:
        enviar_para_rede('telegram', msg)
    except Exception as exc:
        app.logger.warning('Falha no aviso Telegram: %s', exc)

# ========================= ROTAS PRINCIPAIS =========================
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/projetos')
def projetos():
    return redirect('/#projetos')

@app.route('/automacoes')
def automacoes():
    return redirect('/#laboratorio')

@app.route('/trabalhos')
def trabalhos():
    return redirect('/#trabalhos')

@app.route('/health')
def health():
    return jsonify({'status': 'ok', 'service': 'fabiano-portfolio'})

# ========================= AUTOMAÇÃO / API / E-MAIL =========================
@app.route('/executar', methods=['POST'])
def executar():
    try:
        name = clean_text(request.form.get('nome'), MAX_NAME)
        email = clean_text(request.form.get('email'), MAX_EMAIL)
        whatsapp = clean_text(request.form.get('whatsapp'), 40)
        api_url = clean_text(request.form.get('api_url'), 1000)
        quantity = int(request.form.get('quantidade', 10))
        if not name:
            return jsonify({'status': 'erro', 'mensagem': 'Nome obrigatório.'}), 400
        if not valid_email(email):
            return jsonify({'status': 'erro', 'mensagem': 'E-mail inválido.'}), 400
        if not 1 <= quantity <= 100:
            return jsonify({'status': 'erro', 'mensagem': 'Quantidade deve estar entre 1 e 100.'}), 400

        processed_file, data = (None, [])
        api_type = 'default'
        if api_url:
            processed_file, data = processar_api(api_url, output_dir=BASE_DIR)
            low = api_url.lower()
            if 'coingecko' in low:
                api_type = 'crypto'
            elif 'ibge' in low:
                api_type = 'ibge'
            elif 'picsum' in low:
                api_type = 'imagem'
            if not data:
                return jsonify({
                    'status': 'erro',
                    'mensagem': 'A API respondeu, mas nenhum registro compatível foi encontrado. Confira o endpoint e tente novamente.'
                }), 502

        # Sempre gera um XLSX confiável no diretório do projeto, sem depender
        # da pasta corrente usada para iniciar Flask/Gunicorn.
        if data:
            report_path = REPORTS_DIR / f'relatorio_api_{uuid4().hex[:12]}.xlsx'
            gerar_relatorio_xlsx(data, report_path)
        else:
            _, xlsx_path = gerar_dados_falsos_csv(quantity, output_dir=BASE_DIR)
            report_path = REPORTS_DIR / f'dados_teste_{uuid4().hex[:12]}.xlsx'
            shutil.copy2(xlsx_path, report_path)

        # Sem chave do Resend, o processamento/exportação ainda funciona em modo
        # local, sem fingir que o e-mail foi enviado.
        if not os.getenv('RESEND_API_KEY'):
            notify_telegram('Automação processada (modo sem e-mail)', name, email, whatsapp,
                            f'API: {api_url or "dados sintéticos"}; registros: {len(data)}')
            return jsonify({
                'status': 'parcial',
                'email_enviado': False,
                'registros': len(data),
                'download_url': url_for('download_relatorio', filename=report_path.name),
                'mensagem': 'Processamento concluído, mas o e-mail não foi enviado: RESEND_API_KEY não está configurada. Baixe o XLSX e configure a chave no ambiente para habilitar o envio.'
            }), 200

        attachment = processed_file or str(report_path)
        if data:
            attachment = str(report_path)
        result = enviar_email(destinatario=email, mensagem=gerar_mensagem(name), anexo=attachment,
                              dados=data, tipo_api=api_type, nome_usuario=name)
        if not result or 'Erro' in result:
            return jsonify({'status': 'erro', 'mensagem': result or 'Falha no envio.'}), 502
        notify_telegram('Automação executada', name, email, whatsapp, f'API: {api_url or "não informada"}')
        return jsonify({'status': 'sucesso', 'email_enviado': True, 'registros': len(data),
                        'download_url': url_for('download_relatorio', filename=report_path.name),
                        'mensagem': result})
    except ValueError as exc:
        message = str(exc) or 'Quantidade inválida.'
        return jsonify({'status': 'erro', 'mensagem': message}), 400
    except Exception as exc:
        if exc.__class__.__module__.startswith('requests'):
            app.logger.warning('Falha ao consultar API: %s', exc)
            return jsonify({'status': 'erro', 'mensagem': f'Falha ao consultar a API. Confira a URL e tente novamente. Detalhe: {exc}'}), 502
        app.logger.exception('Erro em /executar')
        return jsonify({'status': 'erro', 'mensagem': f'Falha no processamento: {exc}'}), 500

# ========================= BOT SOCIAL =========================
@app.route('/executar-bot', methods=['POST'])
def executar_bot():
    try:
        platform = clean_text(request.form.get('plataforma'), 30).lower()
        message = clean_text(request.form.get('mensagem'), MAX_MESSAGE)
        name = clean_text(request.form.get('nome'), MAX_NAME)
        email = clean_text(request.form.get('email'), MAX_EMAIL)
        if platform not in {'telegram','facebook','instagram','whatsapp'}:
            return jsonify({'status':'erro','mensagem':'Plataforma inválida.'}), 400
        if not message: return jsonify({'status':'erro','mensagem':'Digite uma mensagem.'}), 400
        if email and not valid_email(email): return jsonify({'status':'erro','mensagem':'E-mail inválido.'}), 400
        details = f'Nome: {name or "Não informado"}\nE-mail: {email or "Não informado"}\nMensagem: {message}'
        result = enviar_para_rede(platform, details)
        if not result or 'Erro' in result: return jsonify({'status':'erro','mensagem':result or 'Falha no envio.'}), 500
        notify_telegram(f'Bot social: {platform}', name, email, '', details)
        return jsonify({'status':'sucesso','mensagem':result})
    except Exception as exc:
        app.logger.exception('Erro em /executar-bot')
        return jsonify({'status':'erro','mensagem':str(exc)}), 500

# ========================= DOWNLOAD / GERAÇÃO =========================
@app.route('/download')
def download():
    path = BASE_DIR / 'dados_falsos_organizados.xlsx'
    if not path.exists():
        return jsonify({'status': 'erro', 'mensagem': 'Gere os dados antes de solicitar o arquivo.'}), 404
    return send_file(path, as_attachment=True, download_name='dados_falsos_organizados.xlsx')


@app.route('/download-relatorio/<path:filename>')
def download_relatorio(filename):
    # send_from_directory impede que o nome recebido escape da pasta de relatórios.
    return send_from_directory(str(REPORTS_DIR), filename, as_attachment=True)


@app.route('/gerar-dados', methods=['POST'])
def gerar_dados():
    try:
        quantity = int(request.form.get('quantidade', 10))
        if not 1 <= quantity <= 100:
            return jsonify({'status': 'erro', 'mensagem': 'Quantidade deve estar entre 1 e 100.'}), 400
        _, xlsx_path = gerar_dados_falsos_csv(quantity, output_dir=BASE_DIR)
        return send_file(xlsx_path, as_attachment=True, download_name='dados_falsos_organizados.xlsx',
                         mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    except ValueError as exc:
        return jsonify({'status': 'erro', 'mensagem': str(exc) or 'Quantidade inválida.'}), 400
    except Exception as exc:
        app.logger.exception('Erro em /gerar-dados')
        return jsonify({'status': 'erro', 'mensagem': f'Não foi possível gerar o XLSX: {exc}'}), 500

# ========================= EXECUÇÃO LOCAL / RENDER =========================
if __name__ == '__main__':
    port = int(os.getenv('PORT','5000'))
    app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_DEBUG','0') == '1')
