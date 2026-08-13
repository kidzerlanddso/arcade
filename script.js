let themeList = document.querySelector(".theme-picker");
let defaultThemeItem = themeList.firstElementChild;
let themeListItems = themeList.childNodes;
let themeTracker = themeState();
let listItemTracker = itemState();
let bodyElement = document.body;
let form = document.querySelector(".form");

init();

function init() {
  bindEvents();
  setTheme();
  defaultThemeItem.click();
}

function bindEvents() {
  themeListItems.forEach(function (element) {
    element.addEventListener("click", handleThemeChange);
  });
}

function handleThemeChange(event) {
  let selectedItem = event.target;
  let selectedTheme = event.target.dataset.theme;

  if (
    !selectedItem.classList.contains("pressed") &&
    !form.classList.contains("rotate")
  ) {
    form.classList.add("rotate");

    setSelectedThemeItem(selectedItem);

    setTimeout(() => {
      setTheme(selectedTheme);
    }, 650);

    setTimeout(() => {
      form.classList.remove("rotate");
    }, 1500);
  }
}

function setTheme(selectedTheme) {
  bodyElement.classList.remove(themeTracker.get());
  themeTracker.set(selectedTheme);
  bodyElement.classList.add(themeTracker.get());
}

function setSelectedThemeItem(selectedItem) {
  listItemTracker.get()?.classList.remove("pressed");
  listItemTracker.set(selectedItem);
  listItemTracker.get().classList.add("pressed");
}

function themeState() {
  let selectedTheme = null;
  return {
    set: function (theme) {
      selectedTheme = theme;
    },

    get: function () {
      return selectedTheme;
    }
  };
}

function itemState() {
  let selectedItem = null;
  return {
    set: function (item) {
      selectedItem = item;
    },

    get: function () {
      return selectedItem;
    }
  };
}
