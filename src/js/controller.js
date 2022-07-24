//import model into controller: import everything named as model from the model.js
import * as model from './model.js';
//import recipe view
import recipeView from './views/recipeView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SECONDS } from './config.js';

//import the fractional to show 1/2 on the UI
// import { Fraction } from 'fractional';

import fracty from 'fracty';

//for pollyfilling install core-js and regenerator-runtime in the terminal and import them here:
import 'core-js/stable';
import 'regenerator-runtime/runtime';

//import the search
import searchView from './views/searchView.js';
//import the pagination
import paginationView from './views/paginationView.js';

//in parcel, to keep the state of the view of the app when code changes
if (module.hot) {
  module.hot.accept();
}

const { title } = require('process');

const recipeContainer = document.querySelector('.recipe');

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function () {
  try {
    //dynamically get the hash ID: read after the # symbol so we slide it from pos 1 to end:
    const id = window.location.hash.slice(1);
    // if there is no ID, we return
    if (!id) return;
    recipeView.renderSpinner();

    //0) update results view to mark selected search result: use update to not re-render the images and prevent image re-downloading
    resultsView.update(model.getSearchResultsPage());
    //every time we add a new bookmark, it has to be updated and highlighted, ( the current one on the page has to be highlighted)
    bookmarksView.update(model.state.bookmarks);

    //1) loading recipe: call the loadRecipe from model module, loadRevipe is an async and returns a promise, so we need to await the promise!
    await model.loadRecipe(id);

    // 2)Rendering recipe:
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};
const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    //1) get search query and clear the input field
    const query = searchView.getQuery();

    if (!query) return;

    //2) load search results
    await model.loadSearchResults(query);
    //3)render results
    // console.log(model.state.search.results);

    //to show only 10 results per page:
    resultsView.render(model.getSearchResultsPage());

    //render the initial pagination models
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

// every time that the hash ID of the browser changes, load the recipe related to the ID
// window .addEventListener('hashchange', controlRecipes);

// also listen for the load event for when we copy a recipe id directly to browser:
// window.addEventListener('load', controlRecipes);

const controlPagination = function (goToPage) {
  //we have to render the results on the page and also render the updated pagination buttons
  //Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //render NEW pag buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  //update the recipe servings in the state
  model.updateServings(newServings);
  //update the view to show the new info: Rendering recipe: downside is, every time we change the servings, we are re-rendering the whole page:
  // recipeView.render(model.state.recipe);
  //now we want to only update the necessary parts instead of updating the whole page: update() will update text and attributes in DOM w/o re rendering whole view
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  //1. add or remove bookmark
  // when the recipe is not yet bookmarked:
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else if (model.state.recipe.bookmarked) {
    model.deleteBookmark(model.state.recipe.id);
  }

  //2. update recipeview
  //update the recipe view to show the bookmarked filled
  recipeView.update(model.state.recipe);

  //3. render bookmarks
  bookmarksView.render(model.state.bookmarks);
};
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};
// has to be and async function since uploadRecipe is a async and we need to await for that in line 127:
const controlAddRecipe = async function (newRecipe) {
  try {
    //render spinner
    addRecipeView.renderSpinner();

    //upload new recipe to API:
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);
    //render the added recipe in recipe view
    recipeView.render(model.state.recipe);

    //display a success message
    //prettier-ignore
    addRecipeView.renderMessage()

    //add the new element to bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change the ID in the page URL when adding a new recipe: History API
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //close the form to see the recipe added in view, after some time
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SECONDS * 1000);
  } catch (err) {
    console.error('🤯', err);
    addRecipeView.renderError(err.message);
  }
};
const newFeature = function () {
  console.log('welcome to forkify');
};
//subscriber
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  newFeature();
};
init();
