// ==========================================================
// === ФУНКЦИОНАЛ КОПИРОВАНИЯ ССЫЛКИ ===
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
    const copyButton = document.getElementById("copyButton");
    const copyMessage = document.getElementById("copyMessage");

    if (copyButton) {
        copyButton.addEventListener("click", async () => {
            const currentUrl = window.location.href;

            try {
                // Используем современный Clipboard API
                await navigator.clipboard.writeText(currentUrl);

                // Обновляем сообщение для пользователя
                copyMessage.textContent = "Ссылка скопирована! ✅";
                copyMessage.classList.add("visible");

                // Скрываем сообщение через 2 секунды
                setTimeout(() => {
                    copyMessage.classList.remove("visible");
                    copyMessage.textContent = "";
                }, 2000);
            } catch (err) {
                // Если Clipboard API недоступен (например, старые браузеры)
                console.error("Не удалось скопировать текст: ", err);
                copyMessage.textContent =
                    "Ошибка копирования (попробуйте Ctrl+C) ❌";
                copyMessage.classList.add("visible");
            }
        });
    }
});
