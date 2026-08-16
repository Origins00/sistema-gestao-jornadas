/*
 * Ativa os recursos instaláveis do Gestor de Jornadas. O service worker guarda a
 * estrutura estática da página Hoje; respostas da API não são armazenadas.
 * Horários criados sem conexão ficam numa fila local separada por usuário.
 */

(function ativarPwa() {

    const protocoloSeguro =
        window.location.protocol === "https:" ||
        ["localhost", "127.0.0.1"].includes(
            window.location.hostname
        );

    if (!("serviceWorker" in navigator) || !protocoloSeguro) {
        return;
    }

    let paginaRecarregando = false;

    navigator.serviceWorker.addEventListener(
        "controllerchange",
        () => {

            if (paginaRecarregando) {
                return;
            }

            paginaRecarregando = true;
            window.location.reload();

        }
    );

    window.addEventListener("load", async () => {

        try {

            const registro = await navigator.serviceWorker.register(
                "/service-worker.js",
                { scope: "/" }
            );

            await registro.update();

        } catch (erro) {

            console.warn(
                "Não foi possível ativar os recursos PWA:",
                erro
            );

        }

    });

}());
