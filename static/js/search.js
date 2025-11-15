// ==========================================================
// === ПОИСК ПО СТРАНИЦЕ С ПОДСВЕТКОЙ И АВТО-РАСКРЫТИЕМ ===
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("page-search-form");
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const resultsCount = document.getElementById("search-results-count");
    const contentToSearch = document.getElementById("faq-container"); // Ищем только в контейнере FAQ

    let allMatches = [];
    let currentMatchIndex = -1;
    let lastSearchTerm = "";

    // --- Очистка подсветки ---
    function clearHighlights() {
        // Удаляем все обёртки .highlight и .current-highlight
        contentToSearch.querySelectorAll(".highlight, .current-highlight").forEach((span) => {
            const parent = span.parentNode;
            while (span.firstChild) {
                parent.insertBefore(span.firstChild, span);
            }
            parent.removeChild(span);
        });

        allMatches = [];
        currentMatchIndex = -1;
        lastSearchTerm = "";
        resultsCount.textContent = "";
        if (searchButton) searchButton.textContent = "Искать";
    }

    // --- Подсветка совпадений и сбор ссылок на них ---
    function highlightAndStoreMatches(searchTerm) {
        const escapedTerm = searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        const searchRegex = new RegExp(`(${escapedTerm})`, "gi");

        function findAndReplace(element) {
            const excludeTags = [
                "SCRIPT",
                "STYLE",
                "INPUT",
                "TEXTAREA",
                "BUTTON",
                "SELECT",
                "NOSCRIPT",
                "IFRAME",
                // Фикс: исключаем блоки кода, чтобы не считать двойные совпадения
                "CODE",
                "PRE",
                "KBD",
                "SAMP"
            ];

            // Пропускаем нежелательные теги и саму шапку поиска
            if (
                excludeTags.includes(element.tagName) ||
                element.classList?.contains("search-bar-container")
            ) {
                return;
            }

            element.childNodes.forEach((node) => {
                // Текстовый узел
                if (node.nodeType === 3) {
                    const text = node.nodeValue;
                    if (!text || !searchRegex.test(text)) return;

                    // Не оборачиваем текст, который уже внутри .highlight
                    const alreadyHighlighted = element.closest(".highlight");
                    if (alreadyHighlighted) return;

                    // Меняем текст на HTML с обёртками подсветки
                    const newHtml = text.replace(searchRegex, (match) => {
                        return `<span class="highlight">${match}</span>`;
                    });

                    const tempDiv = document.createElement("div");
                    tempDiv.innerHTML = newHtml;

                    const parent = node.parentNode;
                    while (tempDiv.firstChild) {
                        parent.insertBefore(tempDiv.firstChild, node);
                    }
                    parent.removeChild(node);
                }
                // Элементный узел
                else if (node.nodeType === 1) {
                    // Не спускаемся внутрь уже подсвеченных элементов, чтобы избежать дублирования
                    if (node.classList?.contains("highlight") || node.classList?.contains("current-highlight")) {
                        return;
                    }
                    findAndReplace(node);
                }
            });
        }

        findAndReplace(contentToSearch);
        lastSearchTerm = searchTerm;
        allMatches = Array.from(contentToSearch.querySelectorAll(".highlight"));
        return allMatches.length;
    }

    // --- Навигация к следующему совпадению + авто-раскрытие аккордеона ---
    function navigateToNextMatch() {
        if (allMatches.length === 0) return;

        // Убираем .current-highlight с предыдущего
        if (currentMatchIndex >= 0) {
            allMatches[currentMatchIndex].classList.remove("current-highlight");
        }

        // Индекс следующего
        currentMatchIndex = (currentMatchIndex + 1) % allMatches.length;
        const currentMatch = allMatches[currentMatchIndex];

        // Помечаем текущий
        currentMatch.classList.add("current-highlight");

        // Если совпадение внутри ответа — раскрываем его аккордеон
        const answerBlock = currentMatch.closest(".answer-content");
        if (answerBlock) {
            const parentItem = answerBlock.closest(".accordion-item");
            if (parentItem) {
                // Закрываем все остальные элементы (классический режим "один открыт")
                document.querySelectorAll(".accordion-item").forEach((item) => {
                    item.classList.remove("active");
                    const content = item.querySelector(".answer-content");
                    if (content) content.classList.remove("show");
                });

                // Открываем нужный
                parentItem.classList.add("active");
                answerBlock.classList.add("show");
            }
        }

        // Прокручиваем к текущему совпадению
        currentMatch.scrollIntoView({ behavior: "smooth", block: "center" });

        // Обновляем счётчик
        resultsCount.textContent = `Найдено: ${allMatches.length} (${currentMatchIndex + 1} из ${allMatches.length})`;
    }

    // --- Обработчик формы ---
    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const searchTerm = searchInput.value.trim();

        if (!searchTerm || searchTerm.length < 2) {
            clearHighlights();
            resultsCount.textContent = "Введите минимум 2 символа.";
            return;
        }

        if (searchTerm !== lastSearchTerm) {
            clearHighlights();
            const count = highlightAndStoreMatches(searchTerm);

            if (count > 0) {
                searchButton.textContent = "Следующий (Next)";
                navigateToNextMatch();
            } else {
                searchButton.textContent = "Искать";
                resultsCount.textContent = "Совпадений не найдено.";
            }
        } else {
            navigateToNextMatch();
        }
    });

    // --- Очистка подсветки при изменении запроса ---
    searchInput.addEventListener("input", () => {
        if (searchInput.value.trim() !== lastSearchTerm) {
            clearHighlights();
        }
    });
});
