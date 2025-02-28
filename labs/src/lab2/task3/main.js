class ElementModel {
    constructor(id, name, img, contacts) {
        this.id = id;
        this.name = name;
        this.img = img;
        this.contacts = contacts;
    }
}

const ELEMENTS = [
    new ElementModel(0, 'Огонь', 'fire.jpg', { 1: 10, 3: 4, 5: 6, 7: 8 }),
    new ElementModel(1, 'Вода', 'water.jpg', { 0: 10, 6: 9, 2: 11, 12: 13, 3: 14 }),
    new ElementModel(2, 'Воздух', 'air.jpg', { 0: 26, 3: 5, 12: 27 }),
    new ElementModel(3, 'Земля', 'ground.jpg', { 0: 4, 10: 5, 2: 17, 18: 19 }),
    new ElementModel(4, 'Лава', 'lava.jpg', { 0: 3, 1: 14, 20: 21 }),
    new ElementModel(5, 'Пыль', 'dust.jpg', { 10: 3, 0: 6, 2: 22 }),
    new ElementModel(6, 'Порох', 'gunpowder.jpg', { 0: 5, 7: 23 }),
    new ElementModel(7, 'Взрыв', 'explosive.jpg', { 6: 0, 24: 25 }),
    new ElementModel(8, 'Дым', 'smoke.jpg', { 7: 0, 1: 24 }),
    new ElementModel(9, 'Камень', 'stone.jpg', { 1: 6 }),
    new ElementModel(10, 'Пар', 'steam.jpg', { 0: 1, 6: 14, 15: 16 }),
    new ElementModel(11, 'Энергия', 'energy.jpg', { 10: 7, 3: 18, 19: 26 }),
    new ElementModel(12, 'Металл', 'metal.jpg', { 0: 9, 10: 27 }),
    new ElementModel(13, 'Электричество', 'electricity.jpg', { 12: 2, 1: 28, 29: 30 }),
    new ElementModel(14, 'Водород', 'hydrogen.jpg', { 1: 13, 31: 32 }),
    new ElementModel(15, 'Кислород', 'oxygen.jpg', { 1: 13, 14: 33 }),
    new ElementModel(16, 'Озон', 'ozon.jpg', { 15: 13 }),
    new ElementModel(17, 'Грязь', 'dirt.jpg', { 3: 1 }),
    new ElementModel(18, 'Гейзер', 'geyser.jpg', { 10: 3 }),
    new ElementModel(19, 'Паровой котел', 'pipe.jpg', { 10: 12 }),
    new ElementModel(20, 'Давление', 'pressure.jpg', { 19: 10 }),
    new ElementModel(21, 'Вулкан', 'volcano.jpg', { 4: 20 }),
    new ElementModel(22, 'Гремучий газ', 'ga.jpg', { 14: 15 }),
    new ElementModel(23, 'Болото', 'swamp.jpg', { 1: 3, 2: 34 }),
    new ElementModel(24, 'Спирт', 'alcohol.jpg', { 0: 1, 23: 35 }),
    new ElementModel(25, 'Коктейль Молотова', 'molotov.jpg', { 24: 0 }),
    new ElementModel(26, 'Жизнь', 'life.jpg', { 23: 2 }),
    new ElementModel(27, 'Бактерии', 'bacteria.jpg', { 26: 23 }),
    new ElementModel(28, 'Водка', 'vodka.jpg', { 24: 1 }),
    new ElementModel(29, 'Буря', 'storm.jpg', { 2: 10 }),
    new ElementModel(30, 'Пыль', 'dust.jpg', { 2: 3 }),
    new ElementModel(31, 'Грязь', 'mud.jpg', { 3: 1 }),
    new ElementModel(32, 'Гейзер', 'geyser.jpg', { 10: 3 }),
    new ElementModel(33, 'Озон', 'ozone.jpg', { 15: 13 }),
    new ElementModel(34, 'Жизнь', 'life.jpg', { 23: 2 }),
    new ElementModel(35, 'Спирт', 'alcohol.jpg', { 23: 2 })
];

class ElementView {
    constructor() {
        this.got = document.querySelector('.got');
        this.messageBox = document.querySelector('.message-box');
        this.deleteIcon = document.querySelector('.delete-icon');
        this.openElementsContainer = document.getElementById('open-elements');
        this.sortButton = document.getElementById('sort-button');
        this.tableSelector = document.querySelector(".table");
        this.iconSize = 50;
        this.ww = window.innerWidth;
        this.wh = window.innerHeight;

        this.init();
    }

    init() {
        this.sortButton.addEventListener('click', () => this.sortElements());
    }

    showMessage(message) {
        this.messageBox.innerText = message;
        this.messageBox.style.display = 'block';
        setTimeout(() => {
            this.messageBox.style.display = 'none';
        }, 3000);
    }

    changeGot(myElements, elements, getNextElement) {
        this.got.innerText = `Получено элементов: ${myElements.length}/${elements.length}. Ближайший элемент: ${getNextElement()}`;
    }

    createElement(el) {
        const div = document.createElement('div');
        div.classList.add('icon');
        div.setAttribute('data-id', el.id);
        const p = document.createElement('p');
        p.classList.add('desc');
        p.innerText = el.name;
        div.append(p);
        div.style.background = `url(images/${el.img}) center center no-repeat`;
        div.style.backgroundSize = 'cover';
        return div;
    }

    addElementToTable(el, x, y, dragElement, doubleElement) {
        const div = this.createElement(el);
        div.style.position = 'absolute';
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;
        dragElement(div);
        div.ondblclick = () => doubleElement(el, div);
        this.tableSelector.append(div);
    }

    doubleElement(el, that, addElementToTable) {
        const x = parseInt(that.style.left, 10);
        const y = parseInt(that.style.top, 10);
        addElementToTable(el, x + 10, y + 10);
    }

    dragElement(el, connectElements, deleteElement, elements) {
        let offsetX, offsetY;

        const onMouseMove = (e) => {
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
        };

        const onMouseUp = (e) => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            el.style.pointerEvents = 'none';
            const elBelow = document.elementFromPoint(e.clientX, e.clientY);
            el.style.pointerEvents = 'auto';

            if (elBelow) {
                if (elBelow.classList.contains('icon')) {
                    connectElements(el, elBelow);
                } else if (elBelow.classList.contains('delete-icon')) {
                    deleteElement(el);
                    this.showMessage(`Элемент удален: ${elements[el.getAttribute('data-id')].name}`);
                }
            }
        };

        el.addEventListener('mousedown', (e) => {
            offsetX = e.clientX - el.offsetLeft;
            offsetY = e.clientY - el.offsetTop;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    }

    deleteElement(el) {
        el.remove();
    }

    createText(name) {
        const p = document.createElement('p');
        p.classList.add('element-text');
        p.innerText = name;
        p.style.textAlign = 'center';
        p.style.marginTop = '5px';
        return p;
    }

    addElementToList(el, addElementToTable) {
        const div = this.createElement(el);
        const divText = this.createText(el.name);
        div.style.position = 'static';
        div.style.margin = '5px';

        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';

        container.appendChild(div);
        container.appendChild(divText);
        this.openElementsContainer.appendChild(container);

        container.addEventListener('click', () => {
            const centerX = Math.random() * 600;
            const centerY = Math.random() * 600;
            addElementToTable(el, centerX, centerY);
        });
    }

    sortElements() {
        const elements = Array.from(this.openElementsContainer.children);
        elements.sort((a, b) => {
            const nameA = a.querySelector('.desc').innerText;
            const nameB = b.querySelector('.desc').innerText;
            return nameA.localeCompare(nameB);
        });
        this.openElementsContainer.innerHTML = '';
        elements.forEach(el => this.openElementsContainer.appendChild(el));
    }

    newGame(myElements, elements, addElementToTable, addElementToList, changeGot) {
        const centerX = this.ww / 3 - this.iconSize / 2;
        const centerY = this.wh / 3 - this.iconSize / 2;

        addElementToTable(elements[0], centerX - this.iconSize, centerY - this.iconSize);
        addElementToTable(elements[1], centerX + this.iconSize, centerY - this.iconSize);
        addElementToTable(elements[2], centerX - this.iconSize, centerY + this.iconSize);
        addElementToTable(elements[3], centerX + this.iconSize, centerY + this.iconSize);

        myElements.forEach(id => addElementToList(elements[id]));
        changeGot();
    }
}

class ElementPresenter {
    constructor(view, elements, myElements) {
        this.view = view;
        this.elements = elements;
        this.myElements = myElements;
    }

    showMessage(message) {
        this.view.showMessage(message);
    }

    changeGot() {
        this.view.changeGot(this.myElements, this.elements, () => this.getNextElement());
    }

    getNextElement() {
        for (let i = 0; i < this.elements.length; i++) {
            if (!this.myElements.includes(i) && this.canGetElement(i)) {
                return this.elements[i].name;
            }
        }
        return 'Ошибка.';
    }

    canGetElement(id) {
        for (let i = 0; i < this.myElements.length; i++) {
            if (this.elements[this.myElements[i]].contacts[id]) {
                return true;
            }
        }
        return false;
    }

    addElementToList(el) {
        this.view.addElementToList(el, (el, x, y) => this.addElementToTable(el, x, y));
    }

    addElementToTable(el, x, y) {
        this.view.addElementToTable(el, x, y, (el) => this.dragElement(el), (el, that) => this.doubleElement(el, that));
    }

    doubleElement(el, that) {
        this.view.doubleElement(el, that, (el, x, y) => this.addElementToTable(el, x, y));
    }

    dragElement(el) {
        this.view.dragElement(el, (el1, el2) => this.connectElements(el1, el2), (el) => this.deleteElement(el), this.elements);
    }

    deleteElement(el) {
        this.view.deleteElement(el);
    }

    connectElements(el1, el2) {
        const n1 = Number(el1.getAttribute('data-id'));
        const n2 = Number(el2.getAttribute('data-id'));

        const newElId = this.elements[n1].contacts[n2] || this.elements[n2].contacts[n1];

        if (newElId) {
            const x = (parseInt(el1.style.left, 10) + parseInt(el2.style.left, 10)) / 2;
            const y = (parseInt(el1.style.top, 10) + parseInt(el2.style.top, 10)) / 2;
            this.addElementToTable(this.elements[newElId], x, y);
            this.deleteElement(el1);
            this.deleteElement(el2);
            this.showMessage(`Создан новый элемент: ${this.elements[newElId].name}`);

            if (!this.myElements.includes(newElId)) {
                this.myElements.push(newElId);
                this.addElementToList(this.elements[newElId]);
                this.changeGot();
                if (this.myElements.length === this.elements.length) {
                    this.view.got.innerText = 'Вы открыли все элементы! Поздравляем!';
                }
            }
        } else {
            this.showMessage('Эти элементы нельзя соединить.');
        }
    }

    newGame() {
        this.view.newGame(this.myElements, this.elements, (el, x, y) => this.addElementToTable(el, x, y), (el) => this.addElementToList(el), () => this.changeGot());
    }
}

window.onload = function() {
    const myElements = [0, 1, 2, 3];
    const elementView = new ElementView();
    const elementPresenter = new ElementPresenter(elementView, ELEMENTS, myElements);
    // игровая модель какие элементы сейчас есть, какие

    elementPresenter.newGame();
};