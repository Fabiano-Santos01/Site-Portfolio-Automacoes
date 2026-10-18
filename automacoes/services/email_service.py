import os
import base64
import html as html_lib
import mimetypes

import resend
from dotenv import load_dotenv

load_dotenv()
resend.api_key = os.getenv('RESEND_API_KEY')


def _safe_link(value):
    text = html_lib.escape(str(value))
    if isinstance(value, str) and value.startswith(('http://', 'https://')):
        return f'<a href="{text}" target="_blank" rel="noreferrer">{text}</a>'
    return text


def gerar_mensagem(nome):
    return f'''Olá {nome},\n\nSe você recebeu este e-mail, a automação funcionou.\n\nOs dados anexados foram processados automaticamente a partir do fluxo escolhido no laboratório do meu portfólio.\n\nA ideia é simples: eliminar tarefas repetitivas conectando APIs, dados e entrega.\n\nAbraço,\nFabiano Santos\nBackend • Automação • Dados'''


def gerar_chamada_vendas(tipo_api, nome=''):
    label = {
        'crypto': 'relatório de mercado',
        'ibge': 'dados públicos',
        'imagem': 'processamento de imagens',
    }.get((tipo_api or '').lower(), 'automação')
    return f'''<h3 style="margin-top:0">Automação {html_lib.escape(label)}</h3><p>Olá {html_lib.escape(nome)}. Este fluxo demonstra como uma tarefa manual pode virar um processo reproduzível.</p><p>Saída, integração e entrega podem ser adaptadas ao cenário do negócio.</p><p><a href="https://wa.me/5511972307705">Falar no WhatsApp</a> · <a href="https://fabiano.tec.br">fabiano.tec.br</a></p>'''


def gerar_relatorio_html(dados, chamada_comercial=None):
    if not dados:
        return '<p>Nenhum dado externo foi retornado. O arquivo de dados sintéticos segue anexado.</p>'
    rows = []
    for idx, item in enumerate(dados[:30], 1):
        cells = ''.join(f'<tr><td>{html_lib.escape(str(key))}</td><td>{_safe_link(value)}</td></tr>' for key, value in item.items())
        rows.append(f'<section><strong>Registro {idx}</strong><table>{cells}</table></section>')
    extra = chamada_comercial or ''
    return '<div style="font-family:Arial,sans-serif">' + ''.join(rows) + extra + '</div>'


def _attachments(path):
    if not path or not os.path.exists(path):
        return []
    mime, _ = mimetypes.guess_type(path)
    with open(path, 'rb') as file:
        content = base64.b64encode(file.read()).decode('utf-8')
    return [{'filename': os.path.basename(path), 'content': content}]


def enviar_email(destinatario, mensagem=None, anexo=None, dados=None, tipo_api=None, nome_usuario=None):
    key = os.getenv('RESEND_API_KEY')
    if not key:
        return 'Erro: RESEND_API_KEY não encontrada.'
    try:
        params = {
            'from': os.getenv('RESEND_FROM', 'Fabiano <contato@fabiano.tec.br>'),
            'to': [destinatario],
            'subject': 'Automação executada — Fabiano Santos',
            'text': mensagem or '',
            'html': gerar_relatorio_html(dados, gerar_chamada_vendas(tipo_api, nome_usuario or '')) if dados else f'<p>{html_lib.escape(mensagem or "")}</p><hr>{gerar_chamada_vendas(tipo_api, nome_usuario or "")}',
        }
        attachments = _attachments(anexo)
        if attachments:
            params['attachments'] = attachments
        resend.api_key = key
        resend.Emails.send(params)
        return 'E-mail enviado com sucesso.'
    except Exception as exc:
        return f'Erro Email API: {exc}'
