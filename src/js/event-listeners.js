import Geocode from './services/geocode';
import Location from './services/location';
import DOM from './dom';
import Globals from './globals';
import RecentSearch from "./search-recent";
import State from "./state";
import { SafeAreaController } from '@aashu-dubey/capacitor-statusbar-safe-area';

/**
 * Ecouteurs generiques
 * @todo terminer le nettoyage avec les ecouteurs pour les classes layerManager & MyAccount
 */
function addListeners() {

  const map = Globals.map;

  /* event listeners pour élément non existants au démarrage */
  document.querySelector('body').addEventListener('click', (evt) => {
    var geocode = false;
    /* Résultats autocompletion  et recherche récente */
    if ( evt.target.classList.contains('autocompresult') || evt.target.classList.contains('recentresult')) {
      geocode = true;
      evt.target.classList.add("autocompresultselected");
      DOM.$rech.value = evt.target.getAttribute("fulltext");
    }
    // si recherches recentes ou autocompletion, on realise un geocodage
    if (geocode) {
      if (Globals.backButtonState === "searchDirections") {
        setTimeout(() => {
          Geocode.search(DOM.$rech.value);
          Globals.menu.open("directions");
        }, 250);
      } else if(Globals.backButtonState === "searchIsochrone") {
        setTimeout(() => {
          Geocode.search(DOM.$rech.value);
          Globals.menu.open("isochrone");
        }, 250);
      } else {
        Geocode.searchAndMoveTo(DOM.$rech.value);
        setTimeout(() => Globals.menu.close("search"), 250);
      }
      setTimeout(() =>  RecentSearch.add(DOM.$rech.value.trim()), 260);
    }
  }, true);
  document.querySelector('body').addEventListener('wheel', (evt) => {
    if ( evt.target.classList.contains('compare-swiper-horizontal') || evt.target.classList.contains('compare-swiper-vertical')) {
      evt.preventDefault();
    }
  }, { passive: false });

  // Ecouteurs sur les sous menus Compte
  document.getElementById('menuItemParamsIcon').addEventListener('click', () => {
    DOM.$whiteScreen.style.animation = "unset";
    Globals.menu.close('myaccount');
    Globals.menu.open('parameterScreen');
  });
  document.getElementById('menuItemLegal').addEventListener('click', () => {
    DOM.$whiteScreen.style.animation = "unset";
    Globals.menu.close('myaccount');
    Globals.menu.open('legalScreen');
  });
  document.getElementById('menuItemPrivacy').addEventListener('click', () => {
    DOM.$whiteScreen.style.animation = "unset";
    Globals.menu.close('myaccount');
    Globals.menu.open('privacyScreen');
  });

  // Rotation du marqueur de position
  window.addEventListener("deviceorientationabsolute", Location.getOrientation, true);

  // Action du backbutton
  document.addEventListener("backbutton", State.onBackKeyDown, false);

  // Sauvegarde de l'état de l'application
  document.addEventListener('pause', () => {
    localStorage.setItem("lastMapLat", map.getCenter().lat);
    localStorage.setItem("lastMapLng", map.getCenter().lng);
    localStorage.setItem("lastMapZoom", map.getZoom());
    localStorage.setItem("lastLayersDisplayed", JSON.stringify(Globals.layersDisplayed));
    localStorage.setItem("savedRoutes", JSON.stringify(Globals.myaccount.routes));
  });

  window.addEventListener('beforeunload', () => {
    localStorage.setItem("lastMapLat", map.getCenter().lat);
    localStorage.setItem("lastMapLng", map.getCenter().lng);
    localStorage.setItem("lastMapZoom", map.getZoom());
    localStorage.setItem("lastLayersDisplayed", JSON.stringify(Globals.layersDisplayed));
    localStorage.setItem("savedRoutes", JSON.stringify(Globals.myaccount.routes));
  });

  // Screen dimentions change
  window.addEventListener("resize", () => {
    SafeAreaController.injectCSSVariables();

    if (Globals.backButtonState !== 'default') {
      Globals.currentScrollIndex = 1;
    }
    if (["searchDirections", "searchIsochrone", "search"].includes(Globals.backButtonState)) {
      document.body.style.removeProperty("overflow-y");
      DOM.$backTopLeftBtn.style.removeProperty("box-shadow");
      DOM.$backTopLeftBtn.style.removeProperty("height");
      DOM.$backTopLeftBtn.style.removeProperty("width");
      DOM.$backTopLeftBtn.style.removeProperty("top");
      DOM.$backTopLeftBtn.style.removeProperty("left");
      if (!window.matchMedia("(min-width: 615px), screen and (min-aspect-ratio: 1/1) and (min-width:400px)").matches) {
        document.body.style.overflowY = "scroll";
        DOM.$backTopLeftBtn.style.boxShadow = "unset";
        DOM.$backTopLeftBtn.style.height = "44px";
        DOM.$backTopLeftBtn.style.width = "24px";
        DOM.$backTopLeftBtn.style.top = "12px";
        DOM.$backTopLeftBtn.style.left = "15px";
      }
    }
    if (Globals.backButtonState === "routeDraw") {
      DOM.$bottomButtons.style.removeProperty('bottom');
      DOM.$bottomButtons.style.removeProperty('left');
      DOM.$bottomButtons.style.removeProperty('width');
      if (!window.matchMedia("(min-width: 615px), screen and (min-aspect-ratio: 1/1) and (min-width:400px)").matches) {
        DOM.$bottomButtons.style.bottom = "calc(220px + var(--safe-area-inset-bottom))";
      } else {
        DOM.$bottomButtons.style.left = "calc(100vh + var(--safe-area-inset-left) + 42px)";
        DOM.$bottomButtons.style.width = "auto";
      }
    }
    if (["selectOnMapDirections", "selectOnMapIsochrone", "compare"].includes(Globals.backButtonState)) {
      Globals.currentScrollIndex = 0;
    }
    if (Globals.backButtonState === "compareLayers2") {
      DOM.$sideBySideLeftLayer.style.removeProperty("left");
      if (window.matchMedia("(min-width: 615px), screen and (min-aspect-ratio: 1/1) and (min-width:400px)").matches) {
        DOM.$sideBySideLeftLayer.style.left = "calc(100vh + var(--safe-area-inset-left) - 20px)";
      }
    }
    Globals.menu.updateScrollAnchors();
  });

}

export default {
  addListeners,
};
