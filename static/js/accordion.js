document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll(".accordion-item");

    items.forEach(item => {
        const header = item.querySelector(".question-header");
        const content = item.querySelector(".answer-content");

        header.addEventListener("click", () => {
            const isActive = item.classList.contains("active");

            // Закрываем все
            items.forEach(i => {
                i.classList.remove("active");
                i.querySelector(".answer-content").classList.remove("show");
            });

            // Открываем выбранный
            if (!isActive) {
                item.classList.add("active");
                content.classList.add("show");
            }
        });
    });
});
