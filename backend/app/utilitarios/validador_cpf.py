def limpar_cpf(cpf: str) -> str:
    """
    Remove pontos, traços e qualquer caractere que não seja número.
    """

    return "".join(numero for numero in cpf if numero.isdigit())


def validar_cpf(cpf: str) -> bool:
    """
    Verifica se o CPF possui formato e dígitos verificadores válidos.
    """

    cpf_limpo = limpar_cpf(cpf)

    # O CPF precisa possuir exatamente 11 números
    if len(cpf_limpo) != 11:
        return False

    # Sequências com todos os números iguais não são válidas
    if cpf_limpo == cpf_limpo[0] * 11:
        return False

    # Calcula o primeiro dígito verificador
    soma_primeiro_digito = 0

    for indice in range(9):
        numero = int(cpf_limpo[indice])
        peso = 10 - indice
        soma_primeiro_digito += numero * peso

    resto_primeiro_digito = soma_primeiro_digito % 11

    if resto_primeiro_digito < 2:
        primeiro_digito = 0
    else:
        primeiro_digito = 11 - resto_primeiro_digito

    if primeiro_digito != int(cpf_limpo[9]):
        return False

    # Calcula o segundo dígito verificador
    soma_segundo_digito = 0

    for indice in range(10):
        numero = int(cpf_limpo[indice])
        peso = 11 - indice
        soma_segundo_digito += numero * peso

    resto_segundo_digito = soma_segundo_digito % 11

    if resto_segundo_digito < 2:
        segundo_digito = 0
    else:
        segundo_digito = 11 - resto_segundo_digito

    return segundo_digito == int(cpf_limpo[10])