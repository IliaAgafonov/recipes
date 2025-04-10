(function() {

    const translations = {
        languageSwitch: { ru: "🇷🇺 Русский", en: "🇺🇸 English", ka: "🇬🇪 ქართული" },
        en: {
            headerTitle: "Recipes",
            formTitleAdd: "Add Recipe",
            formTitleEdit: "Edit Recipe",
            recipeTitleLabel: "Recipe Title:",
            recipeStatusLabel: "Recipe Status:",
            ingredientSectionTitle: "Ingredients",
            addIngredient: "Add Ingredient",
            instructionsLabel: "Instructions:",
            buttonRecipeEdit: "Edit Recipe",
            buttonRecipeDelete: "Delete Recipe",
            saveRecipe: "Save Recipe",
            updateRecipe: "Update Recipe",
            cancelEdit: "Cancel Edit",
            savedRecipes: "Saved Recipes",
            exportRecipes: "Export Recipes",
            importRecipes: "Import Recipes",
            copyToClipboard: "Copy to clipboard",
            exportModalTitle: "Export Recipes",
            importModalTitle: "Import Recipes",
            promptDelete: "Are you sure you want to delete this recipe?",
            ingredientName: "Ingredient name",
            optionTasty: "Tasty",
            optionNotSoGood: "Not so good",
            optionNotTried: "Not tried",
            importPlaceholder: "Paste your exported recipes here",
            fieldsRequired: "Please fill in all fields and add at least one ingredient.",
            errorParse: "Error parsing recipes data.",
            pasteExported: "Please paste the exported recipes string.",
            decompressError: "Failed to decompress recipes. Please check your input.",
        },
        ru: {
            headerTitle: "Рецепты",
            formTitleAdd: "Добавить рецепт",
            formTitleEdit: "Редактировать рецепт",
            recipeTitleLabel: "Название рецепта:",
            recipeStatusLabel: "Статус рецепта:",
            ingredientSectionTitle: "Ингредиенты",
            addIngredient: "Добавить ингредиент",
            instructionsLabel: "Инструкция:",
            buttonRecipeEdit: "Редактировать рецепт",
            buttonRecipeDelete: "Удалить рецепт",
            saveRecipe: "Сохранить рецепт",
            updateRecipe: "Обновить рецепт",
            cancelEdit: "Отмена редактирования",
            savedRecipes: "Сохраненные рецепты",
            exportRecipes: "Экспорт рецептов",
            importRecipes: "Импорт рецептов",
            copyToClipboard: "Скопировать",
            exportModalTitle: "Экспорт рецептов",
            importModalTitle: "Импорт рецептов",
            promptDelete: "Вы уверены, что хотите удалить этот рецепт?",
            ingredientName: "Название ингредиента",
            optionTasty: "Вкусно",
            optionNotSoGood: "Не очень",
            optionNotTried: "Не пробовал",
            importPlaceholder: "Вставьте сюда строку экспорта рецептов",
            fieldsRequired: "Пожалуйста, заполните все поля и добавьте хотя бы один ингредиент.",
            errorParse: "Ошибка импорта рецептов.",
            pasteExported: "Пожалуйста, вставьте экспортированную строку рецептов.",
            decompressError: "Ошибка декомпрессии рецептов. Пожалуйста, проверьте ваш ввод."
        },
        ka: {
            headerTitle: "რეცეპტები",
            formTitleAdd: "რეცეპტის დამატება",
            formTitleEdit: "რეცეპტის რედაქტირება",
            recipeTitleLabel: "რეცეპტის სათაური:",
            recipeStatusLabel: "რეცეპტის სტატუსი:",
            ingredientSectionTitle: "ინგრედიენტები",
            addIngredient: "ინგრედიენტის დამატება",
            instructionsLabel: "ინსტრუქცია:",
            buttonRecipeEdit: "რეცეპტის რედაქტირება",
            buttonRecipeDelete: "რეცეპტის წაშლა",
            saveRecipe: "რეცეპტის შენახვა",
            updateRecipe: "განახლება",
            cancelEdit: "გაუქმება",
            savedRecipes: "შენახული რეცეპტები",
            exportRecipes: "რეცეპტების ექსპორტი",
            importRecipes: "რეცეპტების იმპორტი",
            copyToClipboard: "კოპირება",
            exportModalTitle: "რეცეპტების ექსპორტი",
            importModalTitle: "რეცეპტების იმპორტი",
            promptDelete: "დარწმუნებული ხართ, რომ გსურთ ამ რეცეპტის წაშლა?",
            ingredientName: "ინგრედიენტის სახელი",
            optionTasty: "გემრიელი",
            optionNotSoGood: "არ არის კარგი",
            optionNotTried: "არ მიცდია",
            importPlaceholder: "ჩასვით აქ ექსპორტირებული რეცეპტების ტექსტი",
            fieldsRequired: "გთხოვთ შეავსოთ ყველა ველი და დაამატოთ მინიმუმ ერთი ინგრედიენტი.",
            errorParse: "რეცეპტების მონაცემების დამუშავების შეცდომა.",
            pasteExported: "გთხოვთ ჩასვით ექსპორტირებული რეცეპტების ტექსტი.",
            decompressError: "რეცეპტების გახსნა ვერ მოხერხდა. გთხოვთ შეამოწმოთ შეყვანილი მონაცემები."
        }
    };

    let currentLanguage = localStorage.getItem('language') || 'en';

    /**
     * Returns the translated text corresponding to the key.
     * @param {string} key - The translation key.
     * @returns {string}
     */
    const _ = function(key) {
        return translations[currentLanguage][key] || key;
    }

    /**
     * Helper function for DOM manipulation.
     * @param {string} el - Selector starting with '#' for id, '.' for class, or tag name.
     * @returns {HTMLElement|HTMLCollection}
     */
    const $ = function (el) {
        if (el.startsWith('#')) {
            return document.getElementById(el.slice(1));
        } else if (el.startsWith('.')) {
            return document.getElementsByClassName(el.slice(1));
        } else {
            return document.createElement(el);
        }
    }

    let editingIndex = null;

    /**
     * Creates a new ingredient row element.
     * @param {string} name - The ingredient name.
     * @returns {HTMLElement} The ingredient row element.
     */
    function createIngredientRow(name = '') {
        const div = $('div');
        div.classList.add('ingredient');

        const input = $('input');
        input.type = 'text';
        input.placeholder = _( "ingredientName" );
        input.setAttribute('data-i18n-placeholder', "ingredientName");
        input.value = name;
        input.required = true;

        const removeBtn = $('button');
        removeBtn.type = 'button';
        removeBtn.textContent = '✕';
        removeBtn.classList.add('remove-ingredient');
        removeBtn.addEventListener('click', function() {
            div.remove();
        });

        div.appendChild(input);
        div.appendChild(removeBtn);
        return div;
    }

    const ingredientsList = $('#ingredientsList');
    ingredientsList.appendChild(createIngredientRow());

    $('#addIngredientBtn').addEventListener('click', function() {
        ingredientsList.appendChild(createIngredientRow());
    });

    /**
     * Loads recipes from localStorage.
     * @returns {Array} The array of recipes.
     */
    function loadRecipes() {
        const recipes = localStorage.getItem('recipes');
        return recipes ? JSON.parse(recipes) : [];
    }

    /**
     * Saves the given recipes array to localStorage.
     * @param {Array} recipes - The recipes array to save.
     */
    function saveRecipes(recipes) {
        localStorage.setItem('recipes', JSON.stringify(recipes));
    }

    /**
     * Renders the list of recipes in the DOM.
     */
    function renderRecipes() {
        const recipesList = $('#recipesList');
        recipesList.innerHTML = '';
        const recipes = loadRecipes();
        const statusMapping = {
            'tasty': { text: _( "optionTasty" ), class: 'status-tasty' },
            'not-so-good': { text: _( "optionNotSoGood" ), class: 'status-not-so-good' },
            'not-tried': { text: _( "optionNotTried" ), class: 'status-not-tried' }
        };

        recipes.forEach((recipe, index) => {
            const div = $('div');
            div.classList.add('recipe');
            if (recipe.status) {
                const mapping = statusMapping[recipe.status] || {};
                const statusSpan = $('span');
                statusSpan.textContent = mapping.text || recipe.status;
                if (mapping.class) {
                    statusSpan.classList.add(mapping.class);
                }
                div.appendChild(statusSpan);
            }
            const title = $('h3');
            title.textContent = recipe.title;
            title.style.margin = "0 10px";
            div.appendChild(title);
            const editBtn = $('button');
            editBtn.type = 'button';
            editBtn.textContent = '✎';
            editBtn.title = _( "buttonRecipeEdit" );
            editBtn.classList.add('edit-button');
            editBtn.addEventListener('click', function() {
                editRecipe(index);
            });
            div.appendChild(editBtn);
            const removeBtn = $('button');
            removeBtn.type = 'button';
            removeBtn.textContent = '✕';
            removeBtn.title = _( "buttonRecipeDelete" );
            removeBtn.classList.add('remove-button');
            removeBtn.addEventListener('click', function() {
                removeRecipe(index);
            });
            div.appendChild(removeBtn);
            const spacer = $('span');
            spacer.classList.add('u-cf');
            spacer.innerHTML = '&nbsp;';
            div.appendChild(spacer);
            const row = $('div');
            row.classList.add('row');
            const ingList = $('ul');
            ingList.classList.add('one-half');
            ingList.classList.add('column');
            recipe.ingredients.forEach(ing => {
                const li = $('li');
                li.textContent = ing.name;
                ingList.appendChild(li);
            });
            row.appendChild(ingList);
            const instr = $('div');
            instr.classList.add('instructions');
            instr.classList.add('one-half');
            instr.classList.add('column');
            instr.textContent = recipe.instructions;
            row.appendChild(instr);
            div.appendChild(row);
            recipesList.appendChild(div);
        });
    }

    /**
     * Removes the recipe at the specified index from storage and DOM.
     * @param {number} index - The index of the recipe to remove.
     */
    function removeRecipe(index) {
        const recipes = loadRecipes();
        if (!confirm( _( "promptDelete" ) )) {
            return;
        }
        if (index >= 0 && index < recipes.length) {
            recipes.splice(index, 1);
            saveRecipes(recipes);
            renderRecipes();
        } else {
            console.error('Invalid recipe index:', index);
        }
    }

    /**
     * Loads a recipe into the form for editing.
     * @param {number} index - The index of the recipe to edit.
     */
    function editRecipe(index) {
        const recipes = loadRecipes();
        const recipe = recipes[index];
        $('#recipeTitle').value = recipe.title;
        $('#instructions').value = recipe.instructions;
        $('#recipeStatus').value = recipe.status || 'tasty';
        ingredientsList.innerHTML = '';
        recipe.ingredients.forEach(ing => {
            ingredientsList.appendChild(createIngredientRow(ing.name));
        });
        editingIndex = index;
        $('#formTitle').textContent = _( "formTitleEdit" );
        $('#submitBtn').textContent = _( "updateRecipe" );
        $('#cancelEditBtn').style.display = 'inline-block';
        window.scrollTo(0, 0);
    }

    $('#cancelEditBtn').addEventListener('click', function() {
        editingIndex = null;
        $('#recipeForm').reset();
        ingredientsList.innerHTML = '';
        ingredientsList.appendChild(createIngredientRow());
        $('#formTitle').textContent = _( "formTitleAdd" );
        $('#submitBtn').textContent = _( "saveRecipe" );
        $('#cancelEditBtn').style.display = 'none';
    });

    $('#recipeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const title = $('#recipeTitle').value.trim();
        const instructions = $('#instructions').value.trim();
        const recipeStatus = $('#recipeStatus').value;
        const ingredientDivs = document.querySelectorAll('#ingredientsList .ingredient');
        const ingredients = [];
        ingredientDivs.forEach(div => {
            const name = div.querySelector('input[type="text"]').value.trim();
            if (name !== '') {
                ingredients.push({ name });
            }
        });
        if (title === '' || instructions === '' || ingredients.length === 0) {
            alert(_("fieldsRequired"));
            return;
        }
        const recipes = loadRecipes();
        if (editingIndex !== null) {
            recipes[editingIndex] = { title, status: recipeStatus, ingredients, instructions };
            editingIndex = null;
        } else {
            recipes.push({ title, status: recipeStatus, ingredients, instructions });
        }
        saveRecipes(recipes);
        $('#recipeForm').reset();
        ingredientsList.innerHTML = '';
        ingredientsList.appendChild(createIngredientRow());
        $('#formTitle').textContent = _( "formTitleAdd" );
        $('#submitBtn').textContent = _( "saveRecipe" );
        $('#cancelEditBtn').style.display = 'none';
        renderRecipes();
    });

    const exportModal = $('#exportModal');
    const importModal = $('#importModal');
    const exportBtn = $('#exportBtn');
    const importBtnShow = $('#importBtnShow');
    const closeExportModal = $('#closeExportModal');
    const closeImportModal = $('#closeImportModal');
    const exportText = $('#exportText');
    const copyExport = $('#copyExport');
    const importText = $('#importText');
    const importBtn = $('#importBtn');

    function openModal(modal) {
        modal.style.display = "block";
    }
    function closeModal(modal) {
        modal.style.display = "none";
    }

    exportBtn.addEventListener('click', function() {
        const recipes = loadRecipes();
        const jsonStr = JSON.stringify(recipes);
        const compressed = LZString.compressToEncodedURIComponent(jsonStr);
        exportText.value = compressed;
        openModal(exportModal);
    });

    copyExport.addEventListener('click', function() {
        exportText.select();
        document.execCommand("copy");
        copyExport.textContent = "Copied!";
        setTimeout(() => {
            copyExport.textContent = _( "copyToClipboard" );
        }, 2000);
    });

    importBtnShow.addEventListener('click', function() {
        importText.value = "";
        importText.placeholder = _( "importPlaceholder" );
        openModal(importModal);
    });

    closeExportModal.addEventListener('click', function() {
        closeModal(exportModal);
    });
    closeImportModal.addEventListener('click', function() {
        closeModal(importModal);
    });

    window.addEventListener('click', function(event) {
        if (event.target === exportModal) {
            closeModal(exportModal);
        } else if (event.target === importModal) {
            closeModal(importModal);
        }
    });

    importBtn.addEventListener('click', function() {
        const compressed = importText.value.trim();
        if (!compressed) {
            alert(_("pasteExported"));
            return;
        }
        const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
        if (!decompressed) {
            alert(_("decompressError"));
            return;
        }
        try {
            const importedRecipes = JSON.parse(decompressed);
            const currentRecipes = loadRecipes();
            let newCount = 0;
            function recipesEqual(r1, r2) {
                return r1.title === r2.title &&
                    r1.instructions === r2.instructions &&
                    JSON.stringify(r1.ingredients) === JSON.stringify(r2.ingredients);
            }
            importedRecipes.forEach(function(newRecipe) {
                const duplicateFound = currentRecipes.some(function(existingRecipe) {
                    return recipesEqual(existingRecipe, newRecipe);
                });
                if (!duplicateFound) {
                    currentRecipes.push(newRecipe);
                    newCount++;
                }
            });
            saveRecipes(currentRecipes);
            renderRecipes();
            closeModal(importModal);
            alert("Recipes imported successfully! " + newCount + " new recipe(s) added.");
        } catch (e) {
            alert(_("errorParse"));
        }
    });

    function renderPage() {
        updateTexts();
        updateLanguageSwitch();
        renderRecipes();
    }

    function updateTexts() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = _(key);
            console.log(key, _(key));
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = _(key);
        });
    }

    function updateLanguageSwitch() {
        const langSwitchEl = $('#langSwitch');
        if (!langSwitchEl) return;
        langSwitchEl.innerHTML = '';
        const availableLanguages = Object.keys(translations.languageSwitch).filter(lng => lng !== currentLanguage);
        availableLanguages.forEach((lng, index) => {
            const link = $('a');
            link.href = "#";
            link.textContent = translations.languageSwitch[lng];
            link.addEventListener('click', function(e) {
                e.preventDefault();
                currentLanguage = lng;
                localStorage.setItem('language', currentLanguage);
                renderPage();
            });
            langSwitchEl.appendChild(link);
            if (index < availableLanguages.length - 1) {
                langSwitchEl.appendChild(document.createTextNode(" / "));
            }
        });
    }

    document.addEventListener("DOMContentLoaded", renderPage);

})();
