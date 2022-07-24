import icons from 'url:../../img/icons.svg';
export default class View {
  _data;
  /** How to do JS documentation:
   * Render the received object to the DOM
   * @param {object | Object[]} data The data to be rendered
   * @param {boolean} [render = true] If false, create markup string instead odf rendering to the DOM
   * @returns {undefined | string} A markup is returned if render is false
   * @this {Object} View instance
   * @author Mahta Jannatifar
   * @todo Finish implementation
   */
  render(data, render = true) {
    //check if data actually exists, and if the data is an array, if it's an empty array, we want to render an error:
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();

    this._data = data;
    const markup = this._generateMarkup();

    if (!render) return markup;

    //get rid of any mark up before adding a new one
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
  //now we want to only update the necessary parts instead of updating the whole page: update() will update text and attributes in DOM w/o re rendering whole view
  update(data) {
    this._data = data;
    // create a new markup but do not render it. we will compare the new html to the old html for changes:
    const newMarkup = this._generateMarkup();

    //convert this markUp string to a DOM so we can compare this DOM to the one that's currently on the page
    const newDom = document.createRange().createContextualFragment(newMarkup);

    //select all the elements in the newDom : returns a nodeList, to convert to array, use ARRAY.from()
    const newElements = Array.from(newDom.querySelectorAll('*'));

    //select actual elements that are currently on the actual DOM
    const currElements = Array.from(this._parentElement.querySelectorAll('*'));
    //compare the new DOM to actual dom that's on the page
    newElements.forEach((newEl, i) => {
      const curEl = currElements[i];
      //A method on all nodes that will determine if 2 nodes are equal
      //   console.log(curEl, newEl.isEqualNode(curEl));

      // we need the actual text content of an element to replace the old with new DOM, and we use nodeValue property for that:
      //prettier-ignore
      if (!newEl.isEqualNode(curEl) && newEl.firstChild?.nodeValue.trim() !== '') {
        //we have to update the text
        curEl.textContent = newEl.textContent;

      }
      //AND we have to change attributes when the new el is different than the old, but not when it contains text only( so it can't be in if block)
      if (!newEl.isEqualNode(curEl)) {
        //log the attributes of all the elements that have changed
        // console.log(newEl.attributes);
        //loop over the newElements and set attribute of the old ones to new ones:
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value)
        );
      }
    });
  }

  _clear() {
    this._parentElement.innerHTML = '';
  }
  renderSpinner() {
    const markup = `
    <div class="spinner">
      <svg>
        <use href="${icons}#icon-loader"></use>
      </svg>
    </div>
  `;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // if there was no error message specified, we define a default error msg:
  renderError(message = this._errorMessage) {
    const markup = `
      <div class="error">
      <div>
        <svg>
          <use href="${icons}#icon-alert-triangle"></use>
        </svg>
      </div>
      <p>${message}</p>
    </div>`;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
  //success messages
  renderMessage(message = this._successMessage) {
    const markup = `
      <div class="message">
      <div>
        <svg>
          <use href="${icons}#icon-smile"></use>
        </svg>
      </div>
      <p>${message}</p>
    </div>`;
    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
