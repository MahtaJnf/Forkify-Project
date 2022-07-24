import View from './view.js';
import icons from 'url:../../img/icons.svg';
import previewView from './previewView.js';

class bookmarksView extends View {
  _parentElement = document.querySelector('.bookmarks__list');
  _errorMessage = 'No bookmarks yet! Find a nice recipe and bookmark it!';
  _successMessage = '';

  //as the page tries to reload,
  addHandlerRender(handler) {
    window.addEventListener('load', function () {
      handler();
    });
  }
  _generateMarkup() {
    //this is an array to loop through
    // console.log(this._data);
    return this._data
      .map(bookmark => previewView.render(bookmark, false))
      .join('');
  }
}
export default new bookmarksView();
