"use strict";

// Кнопка "Ваш город?"

const headerCityButton = document.querySelector(".header__city-button");
const cartListGoods = document.querySelector(".cart__list-goods");
const cartTotalCost = document.querySelector(".cart__total-cost");
const subheaderCart = document.querySelector(".subheader__cart");
const cartOverlay = document.querySelector(".cart-overlay");

const declOfNum = (n, titles) => {
  return n + ' ' + titles[n % 10 === 1 && n % 100 !== 11 ?
    0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];
};


let hash = location.hash.substring(1); // Определение хэша для всех страниц  + обрезание символа #

headerCityButton.textContent =
  localStorage.getItem("lomoda-location") || "Ваш город?";

headerCityButton.addEventListener("click", () => {
  const city = prompt("Укажите свой город?");

  if (city !== null) {
    headerCityButton.textContent = city;
    localStorage.setItem("lomoda-location", city);
  }
});

const getLocalStorage = () =>
  JSON.parse(localStorage.getItem("card-lomoda")) || [];
const setLocalStorage = (data) =>
  localStorage.setItem("card-lomoda", JSON.stringify(data));

const updateCountGoodsCart = () => {
  if (getLocalStorage().length) {
    subheaderCart.textContent = declOfNum(getLocalStorage().length, [
      "товар",
      "товара",
      "товаров",
    ]);
  } else {
    subheaderCart.textContent = "Корзина";
  }
};

updateCountGoodsCart();

const renderCart = () => {
  cartListGoods.textContent = "";
  let totalCost = 0;

  // при открытии корзины мы получаем данные для этой корзины
  const cartItems = getLocalStorage(); //получим все данные из localStorage
  cartItems.forEach((item, i) => {
    // и перебираем их, чтобы создать строчки товаров в корзине
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${item.brand} ${item.name}</td>
        ${item.color ? `<td>${item.color}</td>` : `<td>-</td>`} 
        ${item.size ? `<td>${item.size}</td>` : `<td>-</td>`} 
        <td>${item.cost} &#8381;</td>
        <td><button class="btn-delete" data-id="${item.id
      }">&times;</button></td>`;
    totalCost += item.cost;
    cartListGoods.append(tr);
  });

  cartTotalCost.textContent = totalCost + " ₽";
};

// удаление элемента из корзины
//(чье id мы посылаем, то и удаляется, а возвращается item.id !== id )
const deleteItemCart = (id) => {
  const cartItems = getLocalStorage();
  const newCartItems = cartItems.filter((item) => item.id !== id);
  setLocalStorage(newCartItems);
  updateCountGoodsCart();
};

cartListGoods.addEventListener("click", (e) => {
  if (e.target.matches(".btn-delete")) {
    deleteItemCart(e.target.dataset.id);
    renderCart();
  }
});

// Блокировка скролла
const disableScroll = () => {
  // выключить
  const widthScroll = window.innerWidth - document.body.offsetWidth;
  document.body.dbScrollY = window.scrollY;
  document.body.style.cssText = `
        position: fixed;
        width: 100%;
        height: 100vh;
        left: 0;
        top: ${-window.scrollY}px;
        overflow: hidden;
        padding-right: ${widthScroll}px;
    `;
};

const enableScroll = () => {
  // включить
  document.body.style.cssText = "";
  window.scroll({
    top: document.body.dbScrollY,
  });
};

// Модальное окно

const cartModalOpen = () => {
  cartOverlay.classList.add("cart-overlay-open");
  disableScroll();
  renderCart();
};

const cartModalClose = () => {
  cartOverlay.classList.remove("cart-overlay-open");
  enableScroll();
};

// Функция для получния данных с сервера
// Запрос БД

// 1 = скрипт для получения данных
const getData = async () => {
  const data = await fetch("db.json");
  if (data.ok) {
    return data.json();
  } else {
    throw new Error(
      `Данные не были получены. Ошибка:  + ${data.status} ${data.statusText}`
    );
  }
};

// 2 = скрипт для получения и обработки данных

const getGoods = (callback, prop, value) => {
  getData()
    .then((data) => {
      if (value) {
        callback(data.filter((item) => item[prop] === value));
      } else {
        callback(data);
      }
    })
    .catch((err) => {
      console.error(err);
    });
};

/* //  Вызов в консоль
getGoods((data) => {
     console.warn(data)
});
  */

subheaderCart.addEventListener("click", cartModalOpen);

subheaderCart.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    cartModalClose();
  }
});

cartOverlay.addEventListener("click", (event) => {
  const target = event.target;
  if (
    target.classList.contains("cart__btn-close") ||
    target.matches(".cart-overlay")
  ) {
    // 2 способ target.matches(".selector_class") - проверяет selector
    cartModalClose();
  }
});

// Рендер корзины

///////////////////////////////////////////////////////////////////////////////////////////////////

try {
  // страница КАТЕГОРИИ товаров
  const goodsList = document.querySelector(".goods__list");
  if (!goodsList) {
    throw "This is not a goods page!!!";
  }

  const goodsTitle = document.querySelector(".goods__title");
  const changeTitle = () => {
    goodsTitle.textContent = document.querySelector(
      `[href*="#${hash}"]`
    ).textContent;
  };

  /*   const pageTitleChange = () => {
    const pageTitle = document.querySelector(".goods__title");
    if (hash === "men") {
      pageTitle.textContent = "Мужчинам";
    } else if (hash === "women") {
      pageTitle.textContent = "Женщинам";
    } else if (hash === "kids") {
      pageTitle.textContent = "Детям";
    } else {
      pageTitle.textContent = "Все товары";
    }
  };
 */
  const createCard = ({ id, preview, cost, brand, name, sizes }) => {
    // Деструктуризация
    // const { id, preview, cost, brand, name, sizes } = data;

    /*   const id = data.id;                  ==== колхозный метод, как я люблю
        const preview = data.preview;
        const cost = data.cost;
        const brand = data.brand;
        const name = data.name;
        const sizes = data.sizes; */

    const li = document.createElement("li");
    li.classList.add("goods__item");
    li.innerHTML = `
        <article class="good">
            <a class="good__link-img" href="card-good.html#${id}">
                <img class="good__img" src="goods-image/${preview}" alt=""/>
            </a>
            <div class="good__description">
                <p class="good__price">${cost} &#8381;</p>
                <h3 class="good__title">${brand} <span class="good__title__grey">/ ${name}</span></h3>
                <p class="good__sizes">Размеры (RUS):
                ${sizes ? `<span class="good__sizes-list">${sizes.join(" ")}</span></p>`
        : ""
      }
            <a class="good__link" href="card-good.html#${id}">Подробнее</a>
            </div>
        </article>
    `;
    return li;
  };

  const renderGoodsList = (data) => {
    goodsList.textContent = "";
    data.forEach((item) => {
      const card = createCard(item);
      goodsList.append(card);
    });
  };

  window.addEventListener("hashchange", () => {
    hash = location.hash.substring(1);
    changeTitle();
    getGoods(renderGoodsList, "category", hash);

    /*     pageTitleChange(); */
  });

  changeTitle();
  getGoods(renderGoodsList, "category", hash);

  /*  pageTitleChange(); */
} catch (err) {
  console.warn(err);
}

try {
  // страница ОДНОГО товара
  if (!document.querySelector(".card-good")) {
    throw "This is not a card good page!!!";
  }

  const cardGoodImage = document.querySelector(".card-good__image");
  const cardGoodBrand = document.querySelector(".card-good__brand");
  const cardGoodTitle = document.querySelector(".card-good__title");
  const cardGoodPrice = document.querySelector(".card-good__price");
  const cardGoodColor = document.querySelector(".card-good__color");
  const cardGoodSelectWrapper = document.querySelectorAll(
    ".card-good__select__wrapper"
  );
  const cardGoodColorList = document.querySelector(".card-good__color-list");
  const cardGoodSizes = document.querySelector(".card-good__sizes");
  const cardGoodSizesList = document.querySelector(".card-good__sizes-list");
  const cardGoodBuy = document.querySelector(".card-good__buy");

  const generateList = (data) =>
    data.reduce(
      // добавляем li в выпадающий список
      (html, item, i) =>
        html + `<li class="card-good__select-item" data-id="${i}">${item}</li>`,
      ""
    );
  // вместо Goods (в ед.ч. не существует) => Product & Products
  const renderCardGood = ([{ id, brand, name, sizes, photo, cost, color }]) => {
    const data = { brand, name, cost, id };

    cardGoodImage.src = `goods-image/${photo}`;
    cardGoodImage.alt = `${brand} ${name}`;
    cardGoodBrand.textContent = brand;
    cardGoodTitle.textContent = name;
    cardGoodPrice.textContent = `${cost} ₽`;
    if (color) {
      cardGoodColor.textContent = color[0];
      cardGoodColor.dataset.id = 0;
      cardGoodColorList.innerHTML = generateList(color);
    } else {
      cardGoodColor.style.display = "none";
    }
    if (sizes) {
      cardGoodSizes.textContent = sizes[0];
      cardGoodSizes.dataset.id = 0;
      cardGoodSizesList.innerHTML = generateList(sizes);
    } else {
      cardGoodSizes.style.display = "none";

      if (getLocalStorage().some((item) => item.id === id)) {
        cardGoodBuy.classList.add("delete");
        cardGoodBuy.textContent = "Удалить из корзины";
      }
    }

    cardGoodBuy.addEventListener("click", () => {
      if (cardGoodBuy.classList.contains("delete")) {
        deleteItemCart(id);
        cardGoodBuy.classList.remove("delete");
        cardGoodBuy.textContent = "Добавить в корзину";
        return;
      }

      if (color) {
        data.color = cardGoodColor.textContent;
      }
      if (sizes) {
        data.size = cardGoodSizes.textContent;
      }

      cardGoodBuy.classList.add("delete");
      cardGoodBuy.textContent = "Удалить из корзины";

      const cardData = getLocalStorage();
      cardData.push(data);
      setLocalStorage(cardData);
      updateCountGoodsCart();
    });
  };

  cardGoodSelectWrapper.forEach((item) => {
    item.addEventListener("click", (e) => {
      const target = e.target;
      console.log(target);
      if (target.closest(".card-good__select")) {
        target.classList.toggle("card-good__select__open");
      }

      if (target.closest(".card-good__select-item")) {
        const cardGoodSelect = item.querySelector(".card-good__select");
        cardGoodSelect.textContent = target.textContent;
        cardGoodSelect.dataset.id = target.dataset.id;
        cardGoodSelect.classList.remove("card-good__select__open");
      }
    });
  });

  getGoods(renderCardGood, "id", hash);
} catch (err) {
  console.warn(err);
}

// CTRL + SHIFT + L  =  console.log();
