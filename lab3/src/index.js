'use strict';

function app(document, window){
  var categoriesNodeList = document.getElementsByClassName('category');
  var feedContainer = document.getElementById('feed');
  var openAsideButton = document.getElementById('open-aside');
  var closeAsideButton = document.getElementById('close-aside');
  var aside = document.getElementById('selected');
  var dropBlock = document.getElementById('drop');

  function addClass(element, className){
    if (element.classList){
      element.classList.add(className);
    } else {
      element.className += className;
    }
  }

  function removeClass(element, className){
    if (element.classList){
      element.classList.remove(className);
    } else {
      if (element.className.indexOf(className) !== -1) {
        element.className = element.className.replace(new RegExp(
            '(\\s|^)'+className+'(\\s|$)'),' ').replace(/^\s+|\s+$/g, ''
        );
      }
    }
  }

  function getSelectedCategory(nodeList){
    var i = 0;
    while (i < nodeList.length){
      if (nodeList[i].getAttribute('data-selected') === 'true'){
        return nodeList[i].getAttribute('data-value');
      }
      i = i + 1;
    }
    return 'all';
  }

  function fetch(url, callback) {
    var xhr = new window.XMLHttpRequest();

    xhr.open('GET', url, false);
    xhr.send();

    if (xhr.status !== 200) {
      console.log('error occured while downloading');
    } else {
      callback(JSON.parse(xhr.responseText));
    }
  }

  function getFeed(selectedCategory, callback){
    if (selectedCategory === 'all'){
      fetch('json/dogs.json', function(dogs){
        var arr = [];
        arr.push(dogs.data);

        fetch('json/cats.json', function(cats){

          arr.push(cats.data);
          fetch('json/hamsters.json', function (hamsters){
            arr.push(hamsters);
            var flattened = [];
            var i = 0;
            var j = 0;
            while (i < arr.length){
              j = 0;
              while (j < arr[i].length){
                flattened.push(arr[i][j]);
                j = j + 1;
              }
              i = i + 1;
            }
            callback(flattened);
          });
        });
      });
    }
    if (selectedCategory === 'dogs'){
      fetch('json/dogs.json', function(dogs){
        callback(dogs.data);
      });
    }
    if (selectedCategory === 'cats'){
      fetch('json/cats.json', function(cats){
        callback(cats.data);
      });
    }
    if (selectedCategory === 'hamsters'){
      fetch('json/hamsters.json', function(hamsters){
        callback(hamsters.data);
      });
    }
  }

  function addDraggableBehaviour(card){
    function handleMouseMove(event){
      var screenX = event.screenX;
      var screenY = event.screenY;

      card.style.top = event.screenY - card.offsetHeight + 'px';
      card.style.left = event.screenX - card.offsetWidth + 'px';

      const asideButtonStyle = window.getComputedStyle(openAsideButton);

      var dropRect = asideButtonStyle.display === 'block'
        ? openAsideButton
        : aside;

      var top = dropRect.offsetTop;
      var bottom = dropRect.offsetTop + dropRect.offsetHeight;
      var left = dropRect.offsetLeft;
      var right = dropRect.offsetLeft + dropRect.offsetWidth;

      var isUnderContainer = (
        screenX > left
        && screenX < right
        && screenY > top
        && screenY < bottom
      );

      if (isUnderContainer){
        addClass(card, 'ready');
      } else {
        removeClass(card, 'ready');
      }
    }

    card.addEventListener('mousedown', function(event){
      var cardCopy = card.cloneNode(true);
      card.parentNode.insertBefore(cardCopy, card);
      cardCopy.addEventListener('mousedown', function(){
        alert('вже додано у вибрані!');
      });

      addClass(card, 'draggable');
      window.startX = event.screenX;
      window.startY = event.screenY;
      card.style.top = window.startY - card.offsetHeight + 'px';
      card.style.left = window.startX - card.offsetWidth + 'px';

      document.addEventListener('mousemove', handleMouseMove);

      card.addEventListener('mouseup', function(event){
        var screenX = event.screenX;
        var screenY = event.screenY;

        const asideButtonStyle = window.getComputedStyle(openAsideButton);

        var dropRect = asideButtonStyle.display === 'block'
          ? openAsideButton
          : aside;

        var top = dropRect.offsetTop;
        var bottom = dropRect.offsetTop + dropRect.offsetHeight;
        var left = dropRect.offsetLeft;
        var right = dropRect.offsetLeft + dropRect.offsetWidth;

        var isDroppedInsideContainer = (
          screenX > left
          && screenX < right
          && screenY > top
          && screenY < bottom
        );

        if (isDroppedInsideContainer){
          removeClass(card, 'draggable');
          var cardCopy = card.cloneNode(true);
          dropBlock.appendChild(cardCopy);
          card.parentNode.removeChild(card);
        } else {
          removeClass(card, 'draggable');
          card.parentNode.removeChild(card);
        }

        document.removeEventListener('mousemove', handleMouseMove);
      }, {once: true});
    });
  }

  function createCards(feed){

    var cards = [];
    var i;
    var j;
    var card = null;
    var title = null;
    var price = null;
    var description = null;
    var tagsContainer = null;
    var tag = null;

    for (i = 0; i < feed.length; i+= 1){
      card = document.createElement('div');
      addClass(card, 'card');

      title = document.createElement('div');
      addClass(title, 'title');
      title.innerText = feed[i].title;
      card.appendChild(title);

      price = document.createElement('div');
      addClass(price, 'price');
      price.innerText = feed[i].price;
      card.appendChild(price);

      description = document.createElement('div');
      addClass(description, 'description');
      description.innerText = feed[i].description;
      card.appendChild(description);

      tagsContainer = document.createElement('div');
      addClass(tagsContainer, 'chips-container');

      for (j = 0; j < feed[i].tags.length; j+= 1){
        tag = document.createElement('div');
        addClass(tag, 'chip');
        tag.innerText = feed[i].tags[j];
        tagsContainer.appendChild(tag);
      }

      card.appendChild(tagsContainer);

      addDraggableBehaviour(card);
      cards.push(card);
    }

    return cards;
  }

  function appendFeed(feed){
    var wrapper = document.createElement('div');
    var cards = createCards(feed);
    var i;
    for (i = 0; i < cards.length; i+= 1){
      wrapper.appendChild(cards[i]);
    }
    feedContainer.appendChild(wrapper);
  }

  function clearFeed() {
    while (feedContainer.hasChildNodes()) {
      feedContainer.removeChild(feedContainer.firstChild);
    }
  }

  window.selectedCategory = getSelectedCategory(categoriesNodeList);

  getFeed(window.selectedCategory, appendFeed);
  var i;
  var j;

  function hack(index){
    categoriesNodeList[index].addEventListener('click', function(){

      for (j = 0; j < categoriesNodeList.length; j += 1){
        categoriesNodeList[j].setAttribute('data-selected', 'false');
        removeClass(categoriesNodeList[j], 'active');
      }
      categoriesNodeList[index].setAttribute('data-selected', 'true');
      addClass(categoriesNodeList[index], 'active');

      window.selectedCategory = getSelectedCategory(categoriesNodeList);
      clearFeed();
      getFeed(window.selectedCategory, appendFeed);
    });
  }
  for (i = 0; i < categoriesNodeList.length; i += 1){
    hack(i);
  }
  openAsideButton.addEventListener('click', function(){
    aside.style.display = 'block';
    openAsideButton.style.display = 'none';
  });

  closeAsideButton.addEventListener('click', function(){
    aside.style.display = 'none';
    openAsideButton.style.display = 'block';
  });
}

app(document, window);
