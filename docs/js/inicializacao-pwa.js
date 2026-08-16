/*
 * Abre a area autenticada quando este aparelho ja possui um usuario salvo.
 * A sessao verdadeira continua no cookie HttpOnly e nunca e copiada para o
 * armazenamento local.
 */

(function redirecionarSessaoLembrada() {

    if (typeof obterUsuarioSalvo !== "function") {
        return;
    }

    const usuario = obterUsuarioSalvo();

    if (!usuario) {
        return;
    }

    if (
        usuario.precisa_trocar_senha &&
        !navigator.onLine
    ) {
        return;
    }

    const caminhoDestino =
        usuario.precisa_trocar_senha
            ? "paginas/perfil.html"
            : "paginas/inicio.html";

    window.location.replace(
        new URL(
            caminhoDestino,
            `${CONFIGURACAO.URL_API}/`
        ).href
    );

}());
