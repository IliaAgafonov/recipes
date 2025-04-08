(function() {
    // JQuery 4o-mini
    const $ = function (el) {
        if (el.startsWith('#')) {
          return document.getElementById(el.slice(1));
        } else if (el.startsWith('.')) {
          return document.getElementsByClassName(el.slice(1));
        } else {
          return document.createElement(el);
        }
    }
  
    let editingIndex = null; // Хранит индекс редактируемого рецепта

    // Функция для создания новой строки ингредиента
    function createIngredientRow(name = '', status = 'required') {
        const div = $('div');
        div.classList.add('ingredient');
        if (status === 'optional') {
            div.classList.add('optional');
        } else if (status === 'interchangeable') {
            div.classList.add('interchangeable');
        }
        
        const input = $('input');
        input.type = 'text';
        input.placeholder = 'Название ингредиента';
        input.value = name;
        input.required = true;
        
        const select = $('select');
        const options = [
            { value: 'required', text: 'Обязательный' },
            { value: 'optional', text: 'Опциональный' },
            { value: 'interchangeable', text: 'Взаимозаменяемый' }
        ];
        options.forEach(opt => {
            const option = $('option');
            option.value = opt.value;
            option.textContent = opt.text;
            if (opt.value === status) {
            option.selected = true;
            }
            select.appendChild(option);
        });
        
        // При смене статуса обновляем класс для визуального отображения
        select.addEventListener('change', function() {
            div.classList.remove('optional', 'interchangeable');
            if (select.value === 'optional') {
            div.classList.add('optional');
            } else if (select.value === 'interchangeable') {
            div.classList.add('interchangeable');
            }
        });
        
        const removeBtn = $('button');
        removeBtn.type = 'button';
        removeBtn.textContent = '✕';
        removeBtn.classList.add('remove-ingredient');
        removeBtn.addEventListener('click', function() {
            div.remove();
        });
        
        div.appendChild(input);
        div.appendChild(select);
        div.appendChild(removeBtn);
        
        return div;
    }
    
    // Добавляем первую строку ингредиента при загрузке
    const ingredientsList = $('#ingredientsList');
    ingredientsList.appendChild(createIngredientRow());
    
    // Обработчик кнопки "Добавить ингредиент"
    $('#addIngredientBtn').addEventListener('click', function() {
        ingredientsList.appendChild(createIngredientRow());
    });
    
    // Функция для получения рецептов из localStorage
    function loadRecipes() {
        const recipes = localStorage.getItem('recipes');
        return recipes ? JSON.parse(recipes) : [];
    }
    
    // Функция для сохранения рецептов в localStorage
    function saveRecipes(recipes) {
        localStorage.setItem('recipes', JSON.stringify(recipes));
    }
    
    // Функция для отображения сохраненных рецептов
    function renderRecipes() {
        const recipesList = $('#recipesList');
        recipesList.innerHTML = '';
        const recipes = loadRecipes();
        
        // Маппинг для статуса рецепта: текст и класс для оформления
        const statusMapping = {
            'tasty': { text: 'Вкусно', class: 'status-tasty' },
            'not-so-good': { text: 'Не очень', class: 'status-not-so-good' },
            'not-tried': { text: 'Не пробовал', class: 'status-not-tried' }
        };
        const ingStatusMapping = {
            'required': { text: 'Обязательный' },
            'optional': { text: 'Опциональный' },
            'interchangeable': { text: 'Взаимозаменяемый' }
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
            title.style = "margin: 0 10px";
            div.appendChild(title);
            
            const nbsp = $('span');
            nbsp.classList.add('u-cf');
            nbsp.innerHTML = '&nbsp;';
            div.appendChild(nbsp);

            const editBtn = $('button');
            editBtn.type = 'button';
            editBtn.textContent = '✎';
            editBtn.title = 'Edit recipe';
            editBtn.classList.add('edit-button');
            editBtn.addEventListener('click', function() {
                editRecipe(index);
            });
            div.appendChild(editBtn);

            const removeBtn = $('button');
            removeBtn.type = 'button';
            removeBtn.textContent = '✕';
            removeBtn.title = 'Remove recipe';
            removeBtn.classList.add('remove-button');
            removeBtn.addEventListener('click', function() {
                removeRecipe(index);
            });
            div.appendChild(removeBtn);

            const row = $('div');
            row.classList.add('row');

            const ingList = $('ul');
            ingList.classList.add('one-half');
            ingList.classList.add('column');
            recipe.ingredients.forEach(ing => {
                const mapping = ingStatusMapping[ing.status] || {};
                const li = $('li');
                li.textContent = ing.name + ' (' + (mapping.text || ing.status) + ')';
                ingList.appendChild(li);
            });
            row.appendChild(ingList);
            
            const instr = $('div');
            instr.classList.add('instructions');
            instr.classList.add('one-half');
            instr.classList.add('column');
            instr.textContent = recipe.instructions;
            row.appendChild(instr);
            div.appendChild(row)
            
            recipesList.appendChild(div);
        });
    }

    function removeRecipe(index) {
        // Retrieve the current recipes array from localStorage
        const recipes = loadRecipes();
        
        // Check if the index is valid
        if (index >= 0 && index < recipes.length) {
            // Remove the recipe at the specified index from the array
            recipes.splice(index, 1);
        
            // Save the updated recipes array back to localStorage
            saveRecipes(recipes);
        
            // Re-render the recipes list to update the DOM
            renderRecipes();
        } else {
            console.error('Invalid recipe index:', index);
        }
    }      
    
    // Функция для загрузки рецепта в форму редактирования
    function editRecipe(index) {
        const recipes = loadRecipes();
        const recipe = recipes[index];
        
        $('#recipeTitle').value = recipe.title;
        $('#instructions').value = recipe.instructions;
        $('#recipeStatus').value = recipe.status || 'tasty';
        
        // Очищаем список ингредиентов и загружаем ингредиенты рецепта
        ingredientsList.innerHTML = '';
        recipe.ingredients.forEach(ing => {
            ingredientsList.appendChild(createIngredientRow(ing.name, ing.status));
        });
        
        editingIndex = index;
        
        $('#formTitle').textContent = 'Редактировать рецепт';
        $('#submitBtn').textContent = 'Обновить рецепт';
        $('#cancelEditBtn').style.display = 'inline-block';
        
        // Прокрутка к форме
        window.scrollTo(0, 0);
    }
    
    // Отмена редактирования
    $('#cancelEditBtn').addEventListener('click', function() {
        editingIndex = null;
        $('#recipeForm').reset();
        ingredientsList.innerHTML = '';
        ingredientsList.appendChild(createIngredientRow());
        $('#formTitle').textContent = 'Добавить рецепт';
        $('#submitBtn').textContent = 'Сохранить рецепт';
        $('#cancelEditBtn').style.display = 'none';
    });
    
    // Обработчик отправки формы – сохранение или обновление рецепта
    $('#recipeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = $('#recipeTitle').value.trim();
        const instructions = $('#instructions').value.trim();
        const recipeStatus = $('#recipeStatus').value;
        
        // Собираем ингредиенты
        const ingredientDivs = document.querySelectorAll('#ingredientsList .ingredient');
        const ingredients = [];
        ingredientDivs.forEach(div => {
            const name = div.querySelector('input[type="text"]').value.trim();
            const status = div.querySelector('select').value;
            if (name !== '') {
            ingredients.push({ name, status });
            }
        });
        
        if (title === '' || instructions === '' || ingredients.length === 0) {
            alert('Пожалуйста, заполните все поля и добавьте хотя бы один ингредиент.');
            return;
        }
        
        const recipes = loadRecipes();
        if (editingIndex !== null) {
            // Обновление существующего рецепта
            recipes[editingIndex] = { title, status: recipeStatus, ingredients, instructions };
            editingIndex = null;
        } else {
            // Добавление нового рецепта
            recipes.push({ title, status: recipeStatus, ingredients, instructions });
        }
        
        saveRecipes(recipes);
        
        $('#recipeForm').reset();
        ingredientsList.innerHTML = '';
        ingredientsList.appendChild(createIngredientRow());
        $('#formTitle').textContent = 'Добавить рецепт';
        $('#submitBtn').textContent = 'Сохранить рецепт';
        $('#cancelEditBtn').style.display = 'none';
        
        renderRecipes();
    });

    // Get modal elements using the helper function $
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

    // Helper functions to open/close modals
    function openModal(modal) {
        modal.style.display = "block";
    }
    function closeModal(modal) {
        modal.style.display = "none";
    }

    // When "Export Recipes" is clicked: compress and show recipes in exportText
    exportBtn.addEventListener('click', function() {
        const recipes = loadRecipes();
        const jsonStr = JSON.stringify(recipes);
        // Compress the JSON string into a compact encoded string
        const compressed = LZString.compressToEncodedURIComponent(jsonStr);
        exportText.value = compressed;
        openModal(exportModal);
    });

    // "Copy to clipboard" functionality for the export modal
    copyExport.addEventListener('click', function() {
        exportText.select();
        document.execCommand("copy");
        copyExport.textContent = "Copied!";
        setTimeout(() => {
            copyExport.textContent = "Copy to clipboard";
        }, 2000);
    });

    // When "Import Recipes" trigger is clicked, clear textarea and show import modal
    importBtnShow.addEventListener('click', function() {
        importText.value = "";
        openModal(importModal);
    });

    // Close modal when clicking on the close button
    closeExportModal.addEventListener('click', function() {
        closeModal(exportModal);
    });
    closeImportModal.addEventListener('click', function() {
        closeModal(importModal);
    });

    // Close modals when clicking outside modal-content
    window.addEventListener('click', function(event) {
        if (event.target === exportModal) {
            closeModal(exportModal);
        } else if (event.target === importModal) {
            closeModal(importModal);
        }
    });

    // Handle the import process when "Import Recipes" button in modal is clicked
    importBtn.addEventListener('click', function() {
        const compressed = importText.value.trim();
        if (!compressed) {
            alert("Please paste the exported recipes string.");
            return;
        }
        const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
        if (!decompressed) {
            alert("Failed to decompress recipes. Please check your input.");
            return;
        }
        try {
            const importedRecipes = JSON.parse(decompressed);
            const currentRecipes = loadRecipes();
            let newCount = 0;

            // Helper function to check equality of two recipes
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
            alert("Error parsing recipes data.");
        }
    });
    
    // Первоначальное отображение рецептов
    renderRecipes();
})();
