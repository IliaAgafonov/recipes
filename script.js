(function () {
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
    const recipeFormSection = $('#recipeFormSection');
    const recipeForm = $('#recipeForm');
    const newRecipeBtn = $('#newRecipeBtn');

    /**
     * Creates a new ingredient row element.
     * @param {string} name - The ingredient name.
     * @returns {HTMLElement} The ingredient row element.
     */
    function createIngredientRow(name = '') {
        const div = $('div');
        div.classList.add('ingredient');

        const handle = $('div');
        handle.classList.add('drag-handle');
        handle.setAttribute('draggable', 'true');
        handle.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="5" cy="5" r="1.5"/>
              <circle cx="5" cy="12" r="1.5"/>
              <circle cx="5" cy="19" r="1.5"/>
              <circle cx="12" cy="5" r="1.5"/>
              <circle cx="12" cy="12" r="1.5"/>
              <circle cx="12" cy="19" r="1.5"/>
            </svg>
        `;

        const input = $('input');
        input.type = 'text';
        input.placeholder = "Ingredient name";
        input.value = name;
        input.required = true;

        const removeBtn = $('button');
        removeBtn.type = 'button';
        removeBtn.textContent = '✕';
        removeBtn.classList.add('remove-ingredient');
        removeBtn.addEventListener('click', () => div.remove());

        div.appendChild(handle);
        div.appendChild(input);
        div.appendChild(removeBtn);

        handle.addEventListener('dragstart', (e) => {
            div.classList.add('dragging');
            e.dataTransfer.setData('text/plain', '');
        });

        handle.addEventListener('dragend', () => {
            div.classList.remove('dragging');
        });

        handle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            div.classList.add('dragging');
            const move = (ev) => {
                const after = getDragAfterElement(ingredientsList, ev.touches[0].clientY);
                if (after == null) {
                    ingredientsList.appendChild(div);
                } else {
                    ingredientsList.insertBefore(div, after);
                }
            };
            const end = () => {
                div.classList.remove('dragging');
                document.removeEventListener('touchmove', move);
                document.removeEventListener('touchend', end);
            };
            document.addEventListener('touchmove', move);
            document.addEventListener('touchend', end);
        });

        div.addEventListener('dragover', (e) => {
            e.preventDefault();
            const dragging = document.querySelector('.ingredient.dragging');
            const after = getDragAfterElement(ingredientsList, e.clientY);
            if (after == null) {
                ingredientsList.appendChild(dragging);
            } else {
                ingredientsList.insertBefore(dragging, after);
            }
        });

        return div;
    }


    /**
     * Gets the element after which the dragged element should be placed.
     * @param {HTMLElement} container
     * @param {number} y
     * @returns {HTMLElement|null}
     */
    function getDragAfterElement(container, y) {
        const elements = [...container.querySelectorAll('.ingredient:not(.dragging)')];
        return elements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return {offset: offset, element: child};
            } else {
                return closest;
            }
        }, {offset: -Infinity}).element;
    }


    $('#addIngredientBtn').addEventListener('click', function () {
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
            'delicious': {text: "Delicious", class: 'green'},
            'okay': {text: "Okay", class: 'orange'},
            'meh': {text: "Meh", class: 'red'},
            'quick': {text: "Quick", class: 'green'},
            'about_hour': {text: "About an hour", class: 'orange'},
            'forever': {text: "Takes forever", class: 'red'},
        };

        recipes.forEach((recipe, index) => {
            const div = $('div');
            div.classList.add('recipe');
            const tagBlock = $('div');
            if (recipe.tags) {
                tagBlock.style.margin = '10px 0';
                for (const tag in recipe.tags) {
                    const data = statusMapping[recipe.tags[tag]] || {text: recipe.tags[tag], class: 'gray'};
                    const t = $('span');
                    t.textContent = data.text;
                    t.classList.add('tag', data.class);
                    t.title = tag.charAt(0).toUpperCase() + tag.slice(1) + ': ' + data.text;
                    tagBlock.appendChild(t);
                }

                div.appendChild(tagBlock);
            }
            if (recipe.tried === false) {
                const notTried = $('span');
                notTried.textContent = "Not tried yet";
                notTried.classList.add('tag', 'gray');
                tagBlock.appendChild(notTried);
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
            editBtn.addEventListener('click', function () {
                editRecipe(index);
            });
            div.appendChild(editBtn);
            const removeBtn = $('button');
            removeBtn.type = 'button';
            removeBtn.textContent = '✕';
            removeBtn.title = "Delete Recipe";
            removeBtn.classList.add('remove-button');
            removeBtn.addEventListener('click', function () {
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
        if (!confirm("Are you sure you want to delete this recipe?")) {
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
        $('#tagTastiness').value = recipe.tags?.tastiness || '';
        $('#tagTime').value = recipe.tags?.time || '';
        $('#recipeTried').checked = recipe.tried !== false;
        ingredientsList.innerHTML = '';
        recipe.ingredients.forEach(ing => {
            ingredientsList.appendChild(createIngredientRow(ing.name));
        });
        editingIndex = index;
        $('#formTitle').textContent = "Edit Recipe";
        $('#submitBtn').textContent = "Update Recipe";
        cancelEditBtn.style.display = 'inline-block';
        recipeFormSection.classList.add('open');
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

    cancelEditBtn.addEventListener('click', function () {
        editingIndex = null;
        recipeFormSection.classList.remove('open');
    });

    recipeForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const title = $('#recipeTitle').value.trim();
        const instructions = $('#instructions').value.trim();
        const tags = {};
        const tastiness = $('#tagTastiness').value;
        const time = $('#tagTime').value;
        if (tastiness) tags.tastiness = tastiness;
        if (time) tags.time = time;
        const tried = $('#recipeTried').checked;
        const ingredientDivs = document.querySelectorAll('#ingredientsList .ingredient');
        const ingredients = [];
        ingredientDivs.forEach(div => {
            const name = div.querySelector('input[type="text"]').value.trim();
            if (name !== '') {
                ingredients.push({name});
            }
        });
        if (title === '' || instructions === '' || ingredients.length === 0) {
            alert("Please fill in all fields and add at least one ingredient.");
            return;
        }
        const recipes = loadRecipes();
        const newRecipe = {title, ingredients, instructions, tags, tried};
        if (editingIndex !== null) {
            recipes[editingIndex] = newRecipe;
            editingIndex = null;
        } else {
            recipes.push(newRecipe);
        }
        saveRecipes(recipes);
        clearRecipeForm();
        recipeFormSection.classList.remove('open');
        renderRecipes();
    });

    function openModal(modal) {
        modal.style.display = "block";
    }

    function closeModal(modal) {
        modal.style.display = "none";
    }

    exportBtn.addEventListener('click', function () {
        const recipes = loadRecipes();
        const jsonStr = JSON.stringify(recipes);
        const compressed = LZString.compressToEncodedURIComponent(jsonStr);
        exportText.value = compressed;
        openModal(exportModal);
    });

    copyExport.addEventListener('click', function () {
        navigator.clipboard.writeText(exportText.value).then(() => {
            console.log('Copied to clipboard');
            setTimeout(() => {
                copyExport.textContent = "Copy to clipboard";
            }, 2000);
        }).catch(err => {
            console.error('Error copying to clipboard: ', err);
        });
    });

    importBtnShow.addEventListener('click', function () {
        importText.value = "";
        importText.placeholder = "Paste your exported recipes here";
        openModal(importModal);
    });

    closeExportModal.addEventListener('click', function () {
        closeModal(exportModal);
    });
    closeImportModal.addEventListener('click', function () {
        closeModal(importModal);
    });

    window.addEventListener('click', function (event) {
        if (event.target === exportModal) {
            closeModal(exportModal);
        } else if (event.target === importModal) {
            closeModal(importModal);
        }
    });

    importBtn.addEventListener('click', function () {
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

            importedRecipes.forEach(function (newRecipe) {
                const duplicateFound = currentRecipes.some(function (existingRecipe) {
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

    newRecipeBtn.addEventListener('click', () => {
        recipeFormSection.classList.add('open');
        clearRecipeForm()
        window.scrollTo(0, 0);
    });

    ingredientsList.appendChild(createIngredientRow());
    renderRecipes();
})();
