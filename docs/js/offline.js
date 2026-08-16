const botaoTentarNovamente = document.querySelector(
    "[data-tentar-novamente]"
);

if (botaoTentarNovamente) {
    botaoTentarNovamente.addEventListener(
        "click",
        () => window.location.reload()
    );
}
