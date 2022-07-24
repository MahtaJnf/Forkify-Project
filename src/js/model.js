import { async } from 'regenerator-runtime';
// import { getJSON,sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';
//import the config file
import { API_URL, KEY, RES_PER_PAGE } from './config.js';
import { stat } from 'fs';
export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};
const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    //** conditionally add objects
    //only want to add a key if key exists:&& short cuicuits: if recipe.key exists then the object of key will be created, then spread the object to put the values in here inside the return{}
    ...(recipe.key && { key: recipe.key }),
  };
};
//change the state object
export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);

    state.recipe = createRecipeObject(data);

    //format the data
    const { recipe } = data.data;
    state.recipe = {
      id: recipe.id,
      title: recipe.title,
      publisher: recipe.publisher,
      sourceUrl: recipe.source_url,
      image: recipe.image_url,
      servings: recipe.servings,
      cookingTime: recipe.cooking_time,
      ingredients: recipe.ingredients,
    };

    // bookmark check: loop over array return true if any of them are true for condition. ( for bookmark persistency )
    //if there is a bookmark in the array that has the id of the one on the page, set that bookmarked to true
    if (state.bookmarks.some(bookmark => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }

    console.log(state.recipe);
  } catch (err) {
    //to propagate the error to the controller and then controller calls renderError in view:
    throw err;
  }
};
export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    //format the data name:
    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    // for the new search, we want to go to page 1 again:
    state.search.page = 1;
  } catch (err) {
    throw err;
  }
};
//since we passed a default, we do not have to pass anuthing to this function
export const getSearchResultsPage = function (page = state.search.page) {
  //current page: save it
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage; //0
  const end = page * state.search.resultsPerPage; //9

  return state.search.results.slice(start, end);
};
export const updateServings = function (newServings) {
  //change the quantity in each ingredient
  state.recipe.ingredients.forEach(ing => {
    // new QT = old QT * newServings/oldServings : 2 * 8/4 = 4
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });
  state.recipe.servings = newServings;
};
//data persistence when we add and remove a bookmark
const persistBookmark = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  //add bookmark
  state.bookmarks.push(recipe);
  //mark current recipe as bookmark
  if (recipe.id === state.recipe.id) {
    //add a new property in recipe called bookmarked and set to true
    state.recipe.bookmarked = true;
  }
  persistBookmark();
};
// delete bookmark getting the ID
export const deleteBookmark = function (id) {
  //delete bookmark:
  // find the index that its ID is the same as the id on the page and get its index, use the index to then delete from bookmarks array:
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  //mark the recipe as not bookmarked anymore:
  if (id === state.recipe.id) {
    state.recipe.bookmarked = false;
  }
  persistBookmark();
};
//to get the data back from the local storage
const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) {
    //to convert the string back to an object
    state.bookmarks = JSON.parse(storage);
  }
};
init();

// this function clears all the bookmarks from the local storage as we reload:
const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
// clearBookmarks();

//function that upload new recipe to API:
export const uploadRecipe = async function (newRecipe) {
  try {
    //make an array from the object using entries:
    //prettier-ignore
    const ingredients = Object.entries(newRecipe).filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '').map(ing=>{

    // const ingArr = ing[1].replaceAll(' ','').split(',')
    const ingArr = ing[1].split(',').map(el => el.trim());
    
    const [quantity, unit, description] = ingArr;
    if(ingArr.length !== 3) throw new Error('Wrong Ingredient Format! Please use the correct format!')
    return{quantity: quantity ? +quantity: null,unit,description}
  
        

    });
    //create the recipe to upload to API:
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    console.log(recipe);
    // send recipe back to us
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    //since we want to also render the newly added recipe to UI, we have to convert the data back to the accepable way, so we use createRecipeObject:
    state.recipe = createRecipeObject(data);
    //bookmark it
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
