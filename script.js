(function() {
    'use strict';

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

    const ingredientsList = $('#ingredientsList');
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
    const cancelEditBtn = $('#cancelEditBtn');
    const recipeForm = $('#recipeForm');

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
        input.placeholder = "Ingredient name";
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
            'tasty': { text: "Tasty", class: 'status-tasty' },
            'not-so-good': { text: "Not so good", class: 'status-not-so-good' },
            'not-tried': { text: "Not tried", class: 'status-not-tried' }
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
            editBtn.title = "Edit Recipe";
            editBtn.classList.add('edit-button');
            editBtn.addEventListener('click', function() {
                editRecipe(index);
            });
            div.appendChild(editBtn);
            const removeBtn = $('button');
            removeBtn.type = 'button';
            removeBtn.textContent = '✕';
            removeBtn.title = "Delete Recipe";
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
        if (!confirm( "Are you sure you want to delete this recipe?" )) {
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
        $('#formTitle').textContent = "Edit Recipe";
        $('#submitBtn').textContent = "Update Recipe";
        cancelEditBtn.style.display = 'inline-block';
        window.scrollTo(0, 0);
    }

    function clearRecipeForm() {
        recipeForm.reset();
        ingredientsList.innerHTML = '';
        ingredientsList.appendChild(createIngredientRow());
        $('#formTitle').textContent = "Add Recipe";
        $('#submitBtn').textContent = "Save Recipe";
        cancelEditBtn.style.display = 'none';
    }

    cancelEditBtn.addEventListener('click', function() {
        editingIndex = null;
        clearRecipeForm();
    });

    recipeForm.addEventListener('submit', function(e) {
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
            alert("Please fill in all fields and add at least one ingredient.");
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
        clearRecipeForm();
        renderRecipes();
    });

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
        navigator.clipboard.writeText(exportText.value).then(() => {
            console.log('Copied to clipboard');
            setTimeout(() => {
                copyExport.textContent = "Copy to clipboard";
            }, 2000);
        }).catch(err => {
            console.error('Error copying to clipboard: ', err);
        });
    });

    importBtnShow.addEventListener('click', function() {
        importText.value = "";
        importText.placeholder = "Paste your exported recipes here";
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

    ingredientsList.appendChild(createIngredientRow());
    renderRecipes();
})();
