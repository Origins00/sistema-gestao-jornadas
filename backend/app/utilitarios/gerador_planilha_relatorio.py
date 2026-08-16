from datetime import date, datetime, time, timedelta, timezone
from io import BytesIO
from pathlib import Path
from xml.sax.saxutils import escape
from zipfile import ZIP_DEFLATED, ZipFile


COR_AZUL = "155E8A"
COR_AZUL_CLARO = "DDECF5"
COR_CREME = "FFFDF8"
COR_VERDE = "257044"
COR_VERDE_FUNDO = "E4EEE7"
COR_VERMELHO = "B42318"
COR_VERMELHO_FUNDO = "FEF3F2"
COR_BRANCO = "FFFFFF"
COR_TEXTO = "2B241F"
COR_BORDA = "DED3C2"

CAMINHO_LOGO = (
    Path(__file__).resolve().parents[3] /
    "frontend" /
    "imagens" /
    "logo-gestor-jornadas.png"
)


def _referencia_coluna(numero: int) -> str:
    referencia = ""

    while numero > 0:
        numero, resto = divmod(numero - 1, 26)
        referencia = chr(65 + resto) + referencia

    return referencia


def _referencia_celula(
    linha: int,
    coluna: int
) -> str:
    return (
        _referencia_coluna(coluna) +
        str(linha)
    )


def _chave_ordenacao_jornada(jornada: dict) -> tuple:
    data_jornada = jornada["data_jornada"]

    if isinstance(data_jornada, datetime):
        data_jornada = data_jornada.date()

    data_ordenacao = (
        data_jornada.isoformat()
        if isinstance(data_jornada, date)
        else str(data_jornada)
    )

    return (
        data_ordenacao,
        str(jornada.get("nome_completo") or "").casefold(),
        int(jornada.get("id_jornada") or 0)
    )


def _texto_seguro(valor) -> str:
    return escape(
        str(valor if valor is not None else ""),
        {
            "\"": "&quot;",
            "'": "&apos;"
        }
    )


def _celula_texto(
    linha: int,
    coluna: int,
    valor,
    estilo: int = 0
) -> str:
    referencia = _referencia_celula(
        linha,
        coluna
    )

    return (
        f'<c r="{referencia}" s="{estilo}" t="inlineStr">'
        '<is><t xml:space="preserve">'
        f'{_texto_seguro(valor)}'
        '</t></is></c>'
    )


def _celula_numero(
    linha: int,
    coluna: int,
    valor: int | float,
    estilo: int = 0
) -> str:
    referencia = _referencia_celula(
        linha,
        coluna
    )

    return (
        f'<c r="{referencia}" s="{estilo}">'
        f'<v>{valor}</v></c>'
    )


def _celula_data(
    linha: int,
    coluna: int,
    valor: date,
    estilo: int = 4
) -> str:
    serial_excel = (
        valor -
        date(1899, 12, 30)
    ).days

    return _celula_numero(
        linha,
        coluna,
        serial_excel,
        estilo
    )


def _formatar_horario(
    horario: time | timedelta | None
) -> str:
    if horario is None:
        return ""

    if isinstance(horario, timedelta):
        minutos_totais = int(
            horario.total_seconds() // 60
        )
    else:
        minutos_totais = (
            horario.hour * 60 +
            horario.minute
        )

    horas = minutos_totais // 60
    minutos = minutos_totais % 60

    return f"{horas:02d}:{minutos:02d}"


def _formatar_minutos(
    minutos: int
) -> str:
    sinal = ""

    if minutos < 0:
        sinal = "-"
        minutos = abs(minutos)

    return (
        f"{sinal}{minutos // 60:02d}h"
        f"{minutos % 60:02d}"
    )


def _formatar_tipo_trabalho(jornada: dict) -> str:
    tipo_inicial = jornada["tipo_trabalho_inicio"]
    tipo_apos_almoco = jornada[
        "tipo_trabalho_apos_almoco"
    ]

    if (
        tipo_apos_almoco
        and tipo_apos_almoco != tipo_inicial
    ):
        return "Misto"

    if tipo_inicial == "OPERACIONAL":
        return "Operacional"

    if tipo_inicial == "ADMINISTRATIVO":
        return "Administrativo"

    return ""


def _xml_estilos(
    preto_e_branco: bool = False
) -> str:
    cor_texto = (
        "1F1F1F"
        if preto_e_branco
        else COR_TEXTO
    )
    cor_texto_contraste = (
        cor_texto
        if preto_e_branco
        else COR_BRANCO
    )
    cor_destaque = (
        cor_texto
        if preto_e_branco
        else COR_AZUL
    )
    cor_faixa_principal = (
        "E6E6E6"
        if preto_e_branco
        else COR_AZUL
    )
    cor_faixa_secundaria = (
        COR_BRANCO
        if preto_e_branco
        else COR_AZUL_CLARO
    )
    cor_fundo_resumo = (
        COR_BRANCO
        if preto_e_branco
        else COR_CREME
    )
    cor_totais = (
        "D9D9D9"
        if preto_e_branco
        else COR_VERDE
    )
    cor_borda = (
        "A6A6A6"
        if preto_e_branco
        else COR_BORDA
    )

    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
    <numFmts count="1">
        <numFmt numFmtId="164" formatCode="dd/mm/yyyy"/>
    </numFmts>
    <fonts count="7">
        <font><sz val="10"/><color rgb="FF{cor_texto}"/><name val="Aptos"/></font>
        <font><b/><sz val="16"/><color rgb="FF{cor_texto_contraste}"/><name val="Aptos Display"/></font>
        <font><b/><sz val="10"/><color rgb="FF{cor_texto_contraste}"/><name val="Aptos"/></font>
        <font><b/><sz val="10"/><color rgb="FF{cor_destaque}"/><name val="Aptos"/></font>
        <font><b/><sz val="14"/><color rgb="FF{cor_destaque}"/><name val="Aptos Display"/></font>
        <font><b/><sz val="10"/><color rgb="FF{cor_texto_contraste}"/><name val="Aptos"/></font>
        <font><b/><sz val="20"/><color rgb="FF{cor_destaque}"/><name val="Aptos Display"/></font>
    </fonts>
    <fills count="6">
        <fill><patternFill patternType="none"/></fill>
        <fill><patternFill patternType="gray125"/></fill>
        <fill><patternFill patternType="solid"><fgColor rgb="FF{cor_faixa_principal}"/><bgColor indexed="64"/></patternFill></fill>
        <fill><patternFill patternType="solid"><fgColor rgb="FF{cor_faixa_secundaria}"/><bgColor indexed="64"/></patternFill></fill>
        <fill><patternFill patternType="solid"><fgColor rgb="FF{cor_fundo_resumo}"/><bgColor indexed="64"/></patternFill></fill>
        <fill><patternFill patternType="solid"><fgColor rgb="FF{cor_totais}"/><bgColor indexed="64"/></patternFill></fill>
    </fills>
    <borders count="2">
        <border><left/><right/><top/><bottom/><diagonal/></border>
        <border>
            <left/><right/><top/>
            <bottom style="thin"><color rgb="FF{cor_borda}"/></bottom>
            <diagonal/>
        </border>
    </borders>
    <cellStyleXfs count="1">
        <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
    </cellStyleXfs>
    <cellXfs count="11">
        <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
        <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyAlignment="1">
            <alignment horizontal="left" vertical="center"/>
        </xf>
        <xf numFmtId="0" fontId="3" fillId="3" borderId="0" xfId="0"/>
        <xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyAlignment="1">
            <alignment horizontal="center" vertical="center" wrapText="1"/>
        </xf>
        <xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyAlignment="1">
            <alignment horizontal="center" vertical="center"/>
        </xf>
        <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyAlignment="1">
            <alignment vertical="center"/>
        </xf>
        <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyAlignment="1">
            <alignment horizontal="center" vertical="center"/>
        </xf>
        <xf numFmtId="0" fontId="4" fillId="4" borderId="0" xfId="0"/>
        <xf numFmtId="0" fontId="5" fillId="5" borderId="0" xfId="0" applyAlignment="1">
            <alignment horizontal="center" vertical="center"/>
        </xf>
        <xf numFmtId="0" fontId="3" fillId="0" borderId="1" xfId="0" applyAlignment="1">
            <alignment horizontal="center" vertical="center"/>
        </xf>
        <xf numFmtId="0" fontId="6" fillId="4" borderId="0" xfId="0" applyAlignment="1">
            <alignment horizontal="center" vertical="center"/>
        </xf>
    </cellXfs>
    <cellStyles count="1">
        <cellStyle name="Normal" xfId="0" builtinId="0"/>
    </cellStyles>
    <dxfs count="0"/>
    <tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>
</styleSheet>"""


def _xml_planilha_resumo(
    jornadas: list[dict],
    data_inicio: date,
    data_fim: date,
    preto_e_branco: bool = False
) -> str:
    total_trabalhado = sum(
        int(item["minutos_trabalhados"] or 0)
        for item in jornadas
    )

    total_esperado = sum(
        int(item["minutos_esperados"] or 0)
        for item in jornadas
    )

    total_extra = sum(
        int(item["minutos_extras"] or 0)
        for item in jornadas
    )

    total_saldo = sum(
        int(item["minutos_saldo"] or 0)
        for item in jornadas
    )

    quantidade_funcionarios = len({
        item["id_usuario"]
        for item in jornadas
    })

    linhas = [
        (
            1,
            _celula_texto(
                1,
                1,
                "Relatório de Jornadas — Gestor de Jornadas",
                1
            )
        ),
        (
            2,
            (
                _celula_texto(2, 1, "Período", 2) +
                _celula_texto(
                    2,
                    2,
                    (
                        data_inicio.strftime("%d/%m/%Y") +
                        " a " +
                        data_fim.strftime("%d/%m/%Y")
                    ),
                    5
                )
            )
        ),
        (
            4,
            (
                _celula_texto(4, 1, "Indicador", 3) +
                _celula_texto(4, 2, "Resultado", 3)
            )
        )
    ]

    indicadores = [
        ("Funcionários com jornada", quantidade_funcionarios),
        ("Quantidade de jornadas", len(jornadas)),
        ("Horas trabalhadas", _formatar_minutos(total_trabalhado)),
        ("Horas esperadas", _formatar_minutos(total_esperado)),
        ("Horas extras", _formatar_minutos(total_extra)),
        ("Saldo do período", _formatar_minutos(total_saldo))
    ]

    for indice, (nome, valor) in enumerate(
        indicadores,
        start=5
    ):
        if isinstance(valor, int):
            celula_valor = _celula_numero(
                indice,
                2,
                valor,
                7
            )
        else:
            celula_valor = _celula_texto(
                indice,
                2,
                valor,
                7
            )

        linhas.append(
            (
                indice,
                (
                    _celula_texto(
                        indice,
                        1,
                        nome,
                        5
                    ) +
                    celula_valor
                )
            )
        )

    linhas_xml = "".join(
        f'<row r="{numero}" ht="24" customHeight="1">{celulas}</row>'
        for numero, celulas in linhas
    )

    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
    <sheetViews>
        <sheetView showGridLines="0" workbookViewId="0"/>
    </sheetViews>
    <cols>
        <col min="1" max="1" width="31" customWidth="1"/>
        <col min="2" max="2" width="24" customWidth="1"/>
        <col min="3" max="5" width="12" customWidth="1"/>
    </cols>
    <sheetData>{linhas_xml}</sheetData>
    <mergeCells count="1"><mergeCell ref="A1:E1"/></mergeCells>
    <pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.2" footer="0.2"/>
    <pageSetup paperSize="9" orientation="portrait"
        blackAndWhite="{1 if preto_e_branco else 0}"/>
</worksheet>"""


def _xml_planilha_jornadas(
    jornadas: list[dict],
    data_inicio: date,
    data_fim: date,
    preto_e_branco: bool = False
) -> str:
    total_trabalhado = sum(
        int(item["minutos_trabalhados"] or 0)
        for item in jornadas
    )

    total_esperado = sum(
        int(item["minutos_esperados"] or 0)
        for item in jornadas
    )

    total_extra = sum(
        int(item["minutos_extras"] or 0)
        for item in jornadas
    )

    total_saldo = sum(
        int(item["minutos_saldo"] or 0)
        for item in jornadas
    )

    total_abonado = sum(
        int(item["minutos_abonados"] or 0)
        for item in jornadas
    )

    quantidade_funcionarios = len({
        item["id_usuario"]
        for item in jornadas
    })

    cabecalhos = [
        "Data",
        "Funcionário",
        "Tipo de trabalho",
        "Entrada",
        "Início do almoço",
        "Fim do almoço",
        "Saída",
        "Horas trabalhadas",
        "Horas esperadas",
        "Horas extras",
        "Saldo",
        "Atividade"
    ]

    cabecalho_empresa = (
        _celula_texto(
            1,
            1,
            "",
            10
        ) +
        _celula_texto(
            1,
            2,
            "EMPRESA DEMONSTRAÇÃO",
            10
        )
    )

    linhas = [
        (
            1,
            cabecalho_empresa
        ),
        (
            4,
            _celula_texto(
                4,
                1,
                "Detalhamento das Jornadas",
                1
            )
        ),
        (
            5,
            _celula_texto(
                5,
                1,
                (
                    "Período: " +
                    data_inicio.strftime("%d/%m/%Y") +
                    " a " +
                    data_fim.strftime("%d/%m/%Y")
                ),
                2
            )
        ),
        (
            6,
            "".join(
                _celula_texto(
                    6,
                    indice,
                    titulo,
                    3
                )
                for indice, titulo
                in enumerate(
                    cabecalhos,
                    start=1
                )
            )
        )
    ]

    for numero_linha, jornada in enumerate(
        jornadas,
        start=7
    ):
        minutos_saldo = int(
            jornada["minutos_saldo"] or 0
        )

        estilo_saldo = (
            9
            if minutos_saldo != 0
            else 6
        )

        valores = [
            _celula_data(
                numero_linha,
                1,
                jornada["data_jornada"]
            ),
            _celula_texto(
                numero_linha,
                2,
                jornada["nome_completo"],
                5
            ),
            _celula_texto(
                numero_linha,
                3,
                _formatar_tipo_trabalho(jornada),
                6
            ),
            _celula_texto(
                numero_linha,
                4,
                _formatar_horario(
                    jornada["horario_entrada"]
                ),
                6
            ),
            _celula_texto(
                numero_linha,
                5,
                _formatar_horario(
                    jornada["horario_inicio_almoco"]
                ),
                6
            ),
            _celula_texto(
                numero_linha,
                6,
                _formatar_horario(
                    jornada["horario_fim_almoco"]
                ),
                6
            ),
            _celula_texto(
                numero_linha,
                7,
                _formatar_horario(
                    jornada["horario_saida"]
                ),
                6
            ),
            _celula_texto(
                numero_linha,
                8,
                _formatar_minutos(
                    int(
                        jornada["minutos_trabalhados"] or 0
                    )
                ),
                6
            ),
            _celula_texto(
                numero_linha,
                9,
                _formatar_minutos(
                    int(
                        jornada["minutos_esperados"] or 0
                    )
                ),
                6
            ),
            _celula_texto(
                numero_linha,
                10,
                _formatar_minutos(
                    int(
                        jornada["minutos_extras"] or 0
                    )
                ),
                6
            ),
            _celula_texto(
                numero_linha,
                11,
                _formatar_minutos(
                    minutos_saldo
                ),
                estilo_saldo
            ),
            _celula_texto(
                numero_linha,
                12,
                jornada["atividade_do_dia"] or "",
                5
            )
        ]

        linhas.append(
            (
                numero_linha,
                "".join(valores)
            )
        )

    ultima_linha_dados = max(
        6,
        len(jornadas) + 6
    )

    linha_totais = (
        len(jornadas) + 7
    )

    texto_totais = (
        "TOTAIS DO PERÍODO • " +
        str(quantidade_funcionarios) +
        (
            " funcionário • "
            if quantidade_funcionarios == 1
            else " funcionários • "
        ) +
        str(len(jornadas)) +
        (
            " jornada • "
            if len(jornadas) == 1
            else " jornadas • "
        ) +
        "Abonadas: " +
        _formatar_minutos(total_abonado)
    )

    linhas.append(
        (
            linha_totais,
            (
                _celula_texto(
                    linha_totais,
                    1,
                    texto_totais,
                    3
                ) +
                _celula_texto(
                    linha_totais,
                    8,
                    _formatar_minutos(total_trabalhado),
                    3
                ) +
                _celula_texto(
                    linha_totais,
                    9,
                    _formatar_minutos(total_esperado),
                    3
                ) +
                _celula_texto(
                    linha_totais,
                    10,
                    _formatar_minutos(total_extra),
                    3
                ) +
                _celula_texto(
                    linha_totais,
                    11,
                    _formatar_minutos(total_saldo),
                    3
                ) +
                _celula_texto(
                    linha_totais,
                    12,
                    "",
                    3
                )
            )
        )
    )

    linhas_xml = "".join(
        (
            f'<row r="{numero}" '
            f'ht="{"34" if numero in (6, linha_totais) else ("30" if numero == 1 else "22")}" '
            'customHeight="1">'
            f'{celulas}</row>'
        )
        for numero, celulas in linhas
    )

    mesclagens_cabecalho = (
        '<mergeCell ref="A1:A3"/>'
        '<mergeCell ref="B1:L3"/>'
    )
    quantidade_mesclagens = 5
    desenho_logo = '<drawing r:id="rId1"/>'

    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
    xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
    <sheetPr>
        <pageSetUpPr fitToPage="1" autoPageBreaks="0"/>
    </sheetPr>
    <sheetViews>
        <sheetView showGridLines="0" workbookViewId="0">
            <pane ySplit="6" topLeftCell="A7" activePane="bottomLeft" state="frozen"/>
            <selection pane="bottomLeft" activeCell="A7" sqref="A7"/>
        </sheetView>
    </sheetViews>
    <cols>
        <col min="1" max="1" width="13" customWidth="1"/>
        <col min="2" max="2" width="30" customWidth="1"/>
        <col min="3" max="3" width="18" customWidth="1"/>
        <col min="4" max="7" width="16" customWidth="1"/>
        <col min="8" max="11" width="18" customWidth="1"/>
        <col min="12" max="12" width="42" customWidth="1"/>
    </cols>
    <sheetData>{linhas_xml}</sheetData>
    <autoFilter ref="A6:L{ultima_linha_dados}"/>
    <mergeCells count="{quantidade_mesclagens}">
        {mesclagens_cabecalho}
        <mergeCell ref="A4:L4"/>
        <mergeCell ref="A5:L5"/>
        <mergeCell ref="A{linha_totais}:G{linha_totais}"/>
    </mergeCells>
    <printOptions horizontalCentered="1" verticalCentered="0"/>
    <pageMargins left="0.2" right="0.2" top="0.2" bottom="0.2" header="0" footer="0"/>
    <pageSetup paperSize="9" orientation="landscape" pageOrder="downThenOver"
        fitToWidth="1" fitToHeight="0" usePrinterDefaults="0"
        blackAndWhite="{1 if preto_e_branco else 0}"
        horizontalDpi="300" verticalDpi="300"/>
    {desenho_logo}
</worksheet>"""


def gerar_planilha_relatorio_jornadas(
    jornadas: list[dict],
    data_inicio: date,
    data_fim: date,
    preto_e_branco: bool = False
) -> bytes:
    """
    Cria um arquivo XLSX compatível com Excel Desktop e Excel Online.
    """

    agora = datetime.now(
        timezone.utc
    ).replace(microsecond=0)

    data_iso = (
        agora.isoformat()
        .replace("+00:00", "Z")
    )

    jornadas_ordenadas = sorted(
        jornadas,
        key=_chave_ordenacao_jornada
    )

    linha_final_jornadas = (
        len(jornadas_ordenadas) + 7
    )

    planilha_resumo = _xml_planilha_resumo(
        jornadas=jornadas_ordenadas,
        data_inicio=data_inicio,
        data_fim=data_fim,
        preto_e_branco=preto_e_branco
    )

    planilha_jornadas = _xml_planilha_jornadas(
        jornadas=jornadas_ordenadas,
        data_inicio=data_inicio,
        data_fim=data_fim,
        preto_e_branco=preto_e_branco
    )

    tipo_conteudo_imagem = (
        '<Default Extension="png" ContentType="image/png"/>'
    )
    tipo_conteudo_desenho = (
        '<Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>'
    )

    conteudos = {
        "[Content_Types].xml": f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    {tipo_conteudo_imagem}
    <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
    <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
    <Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
    <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
    <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
    <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
    {tipo_conteudo_desenho}
</Types>""",
        "_rels/.rels": """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
    <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
    <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>""",
        "docProps/app.xml": """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
    <Application>Gestor de Jornadas</Application>
    <DocSecurity>0</DocSecurity>
    <ScaleCrop>false</ScaleCrop>
    <Company>Empresa Demonstração</Company>
    <AppVersion>1.0</AppVersion>
</Properties>""",
        "docProps/core.xml": f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <dc:title>Relatório de Jornadas</dc:title>
    <dc:subject>Gestor de Jornadas</dc:subject>
    <dc:creator>Gestor de Jornadas</dc:creator>
    <cp:lastModifiedBy>Gestor de Jornadas</cp:lastModifiedBy>
    <dcterms:created xsi:type="dcterms:W3CDTF">{data_iso}</dcterms:created>
    <dcterms:modified xsi:type="dcterms:W3CDTF">{data_iso}</dcterms:modified>
</cp:coreProperties>""",
        "xl/workbook.xml": f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
    <bookViews><workbookView activeTab="0"/></bookViews>
    <sheets>
        <sheet name="Jornadas" sheetId="1" r:id="rId1"/>
        <sheet name="Resumo" sheetId="2" r:id="rId2"/>
    </sheets>
    <definedNames>
        <definedName name="_xlnm.Print_Area" localSheetId="0">'Jornadas'!$A$1:$L${linha_final_jornadas}</definedName>
        <definedName name="_xlnm.Print_Titles" localSheetId="0">'Jornadas'!$1:$6</definedName>
    </definedNames>
    <calcPr calcId="191029" fullCalcOnLoad="1"/>
</workbook>""",
        "xl/_rels/workbook.xml.rels": """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
    <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>
    <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>""",
        "xl/styles.xml": _xml_estilos(
            preto_e_branco=preto_e_branco
        ),
        "xl/worksheets/sheet1.xml": planilha_jornadas,
        "xl/worksheets/sheet2.xml": planilha_resumo
    }

    efeito_logo = (
        '<a:grayscl/>'
        if preto_e_branco
        else ""
    )

    conteudos.update({
            "xl/worksheets/_rels/sheet1.xml.rels": """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/>
</Relationships>""",
            "xl/drawings/drawing1.xml": f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<xdr:wsDr
    xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing"
    xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
    xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
    <xdr:oneCellAnchor>
        <xdr:from>
            <xdr:col>0</xdr:col>
            <xdr:colOff>70000</xdr:colOff>
            <xdr:row>0</xdr:row>
            <xdr:rowOff>40000</xdr:rowOff>
        </xdr:from>
        <xdr:ext cx="700000" cy="700000"/>
        <xdr:pic>
            <xdr:nvPicPr>
                <xdr:cNvPr id="2" name="Logo Empresa Demonstração"/>
                <xdr:cNvPicPr>
                    <a:picLocks noChangeAspect="1"/>
                </xdr:cNvPicPr>
            </xdr:nvPicPr>
            <xdr:blipFill>
                <a:blip r:embed="rId1">{efeito_logo}</a:blip>
                <a:stretch><a:fillRect/></a:stretch>
            </xdr:blipFill>
            <xdr:spPr>
                <a:xfrm>
                    <a:off x="0" y="0"/>
                    <a:ext cx="700000" cy="700000"/>
                </a:xfrm>
                <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
            </xdr:spPr>
        </xdr:pic>
        <xdr:clientData/>
    </xdr:oneCellAnchor>
</xdr:wsDr>""",
            "xl/drawings/_rels/drawing1.xml.rels": """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/logo-gestor-jornadas.png"/>
</Relationships>""",
            "xl/media/logo-gestor-jornadas.png": CAMINHO_LOGO.read_bytes()
        })

    arquivo = BytesIO()

    with ZipFile(
        arquivo,
        mode="w",
        compression=ZIP_DEFLATED,
        compresslevel=6
    ) as pacote:
        for caminho, conteudo in conteudos.items():
            pacote.writestr(
                caminho,
                (
                    conteudo.encode("utf-8")
                    if isinstance(conteudo, str)
                    else conteudo
                )
            )

    return arquivo.getvalue()
