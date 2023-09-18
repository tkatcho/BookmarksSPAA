//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
let selectedCategory;

Init_UI();
function Init_UI() {
  renderBookmarks();

  $("#createBookmark").on("click", async function () {
    saveContentScrollPosition();
    renderCreateBookmarkForm();
  });
  $("#abort").on("click", async function () {
    renderBookmarks();
  });
  $("#aboutCmd").on("click", function () {
    renderAbout();
  });
}

function renderAbout() {
  saveContentScrollPosition();
  eraseContent();
  $("#createBookmark").hide();
  $("#abort").show();
  $("#actionTitle").text("À propos...");
  $("#content").append(
    $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de bookmarks</h2>
                <hr>
                <p>
                    Petite application de gestion de bookmarks à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Tristan Katcho
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `)
  );
}
function renderCategories(categories) {
  $("#DDMenu").empty();
  $("#DDMenu").append('<div class="dropdown-item menuItemLayout" id="allCatCmd"><i class="menuIcon fa fa-fw mx-2"></i> Toutes les catégories</div><div class="dropdown-divider"></div>');

  $("#allCatCmd").on("click", function () {
      selectedCategory = ""; 
      renderBookmarks();
  });



  categories.forEach((categorie) => {
      const categoryElement = renderCategorie(categorie);
      categoryElement.on("click", function () {
          selectedCategory = categorie; 
          renderBookmarks(selectedCategory);
      });
      const firstChild = categoryElement[0].firstElementChild;
      if(selectedCategory==categorie){
      firstChild.classList.add("fa-check");
      firstChild.classList.remove("fa-fw");
      }
      else{
        firstChild.classList.remove("fa-check");
      firstChild.classList.add("fa-fw");
      }
      $("#DDMenu").append(categoryElement);
  });

  $("#DDMenu").append(`<div class="dropdown-divider"></div><div class="dropdown-item" id="aboutCmd">
  <i class="menuIcon fa fa-info-circle mx-2"></i> À propos...
</div>`);

$("#aboutCmd").on("click", function () {
  renderAbout();
});
}

async function renderBookmarks(selectedCategory = "") {
  showWaitingGif();
  $("#actionTitle").text("Liste des bookmarks");
  $("#createBookmark").show();
  $("#abort").hide();
  let categories = [];
  let bookmarks = await Bookmarks_API.Get();

  eraseContent();
  if (bookmarks !== null) {
    bookmarks.forEach(bookmark => {
        if (
            !categories.includes(bookmark.Categorie) &&
            bookmark.Categorie != null
          ) {
            categories.push(bookmark.Categorie);
          }

        if (selectedCategory === "" || bookmark.Categorie === selectedCategory) {
            $("#content").append(renderBookmark(bookmark)); 
        }
    });
    restoreContentScrollPosition();
    // Attached click events on command icons
    $(".editCmd").on("click", function () {
      saveContentScrollPosition();
      renderEditBookmarkForm(parseInt($(this).attr("editBookmarkId")));
    });
    $(".deleteCmd").on("click", function () {
      saveContentScrollPosition();
      renderDeleteBookmarkForm(parseInt($(this).attr("deleteBookmarkId")));
    });
    $(".bookmarkRow").on("click", function (e) {
      e.preventDefault();
    });
  } else {
    renderError("Service introuvable");
  }
  renderCategories(categories);
}
function showWaitingGif() {
  $("#content").empty();
  $("#content").append(
    $(
      "<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"
    )
  );
}
function eraseCategories() {
  $("#DDMenu").empty();
}
function eraseContent() {
  $("#content").empty();
}
function saveContentScrollPosition() {
  contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
  $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
  eraseContent();
  $("#content").append(
    $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
  );
}
function renderCreateBookmarkForm() {
  renderBookmarkForm();
}
async function renderEditBookmarkForm(id) {
  showWaitingGif();
  let bookmark = await Bookmarks_API.Get(id);
  if (bookmark !== null) renderBookmarkForm(bookmark);
  else renderError("bookmark introuvable!");
}
async function renderDeleteBookmarkForm(id) {
  showWaitingGif();
  $("#createBookmark").hide();
  $("#abort").show();
  $("#actionTitle").text("Retrait");
  let bookmark = await Bookmarks_API.Get(id);
  eraseContent();
  if (bookmark !== null) {
    $("#content").append(`
        <div class="bookmarkdeleteForm">
            <h4>Effacer le bookmark suivant?</h4>
            <br>
            <div class="bookmarkRow" bookmark_id="${bookmark.Id}">
            <div class="bookmarkContainer noselect">
                <div class="bookmarkLayout">
                    <div class="big-favicon" style="background-image: url('http://www.google.com/s2/favicons?sz=64&domain=${bookmark.URL}'); display: inline-block; vertical-align: middle;"></div>
                    <span class="bookmarkTitre" style="display: inline-block; vertical-align: middle;">${bookmark.Title}</span>
                    <span class="bookmarkCategorie">${bookmark.Categorie}</span>
                </div>
            <br>
            <input type="button" value="Effacer" id="deleteBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
    $("#deleteBookmark").on("click", async function () {
      showWaitingGif();
      let result = await Bookmarks_API.Delete(bookmark.Id);
      if (result) renderBookmarks();
      else renderError("Une erreur est survenue!");
    });
    $("#cancel").on("click", function () {
      renderBookmarks();
    });
  } else {
    renderError("Bookmark introuvable!");
  }
}
function newBookmark() {
  bookmark = {};
  bookmark.Id = 0;
  bookmark.Title = "";
  bookmark.URL = "";
  bookmark.Categorie = "";
  return bookmark;
}
function renderBookmarkForm(bookmark = null) {
  $("#createBookmark").hide();
  $("#abort").show();
  eraseContent();
  let create = bookmark == null;
  if (create) bookmark = newBookmark();
  $("#actionTitle").text(create ? "Création" : "Modification");
  $("#content").append(`
        <form class="form" id="bookmarkForm">
            <input type="hidden" name="Id" value="${bookmark.Id}"/>
            <div class="big-favicon" style="background-image: url('http://www.google.com/s2/favicons?sz=64&domain=${bookmark.URL}'); display: inline-block; vertical-align: middle;"></div>

            <label for="Title" class="form-label">Title </label>
            <input 
                class="form-control Alpha"
                name="Title" 
                id="Title" 
                placeholder="Title"
                required
                RequireMessage="Veuillez entrer un titre"
                InvalidMessage="Le Titre comporte un caractère illégal" 
                value="${bookmark.Title}"
            />
            <label for="URL" class="form-label">Lien </label>
            <input
                class="form-control URL"
                name="URL"
                id="URL"
                placeholder="URL"
                required
                RequireMessage="Veuillez entrer votre URL" 
                InvalidMessage="Veuillez entrer un URL valide"
                value="${bookmark.URL}" 
            />
            <label for="Categorie" class="form-label">Categorie </label>
            <input 
                class="form-control Alpha"
                name="Categorie"
                id="Categorie"
                placeholder="Categorie"
                required
                RequireMessage="Veuillez entrer votre Categorie" 
                InvalidMessage="Veuillez entrer un Categorie valide"
                value="${bookmark.Categorie}"
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveBookmark" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
  initFormValidation();
  $("#bookmarkForm").on("submit", async function (event) {
    event.preventDefault();
    let bookmark = getFormData($("#bookmarkForm"));
    bookmark.Id = parseInt(bookmark.Id);
    showWaitingGif();
    let result = await Bookmarks_API.Save(bookmark, create);
    if (result) renderBookmarks();
    else renderError("Une erreur est survenue!");
  });
  $("#cancel").on("click", function () {
    renderBookmarks();
  });
}
function getFormData($form) {
  const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
  var jsonObject = {};
  $.each($form.serializeArray(), (index, control) => {
    jsonObject[control.name] = control.value.replace(removeTag, "");
  });
  return jsonObject;
}
function renderBookmark(bookmark) {
  return $(`
  <div class="bookmarkRow" bookmark_id="${bookmark.Id}">
      <div class="bookmarkContainer noselect">
          <div class="bookmarkLayout">
              <div class="big-favicon" style="background-image: url('http://www.google.com/s2/favicons?sz=64&domain=${bookmark.URL}'); display: inline-block; vertical-align: middle;"></div>
              <span class="bookmarkTitre" style="display: inline-block; vertical-align: middle;">${bookmark.Title}</span>
              <span class="bookmarkCategorie">${bookmark.Categorie}</span>
          </div>
          <div class="bookmarkCommandPanel">
              <span class="editCmd cmdIcon fa fa-pencil" editBookmarkId="${bookmark.Id}" title="Modifier ${bookmark.Title}"></span>
              <span class="deleteCmd cmdIcon fa fa-trash" deleteBookmarkId="${bookmark.Id}" title="Effacer ${bookmark.Title}"></span>
          </div>
      </div>
  </a>           
  `); 
}
function renderCategorie(categorie) {
  return $(`
    <div class="dropdown-item menuItemLayout category" id="allCatCmd">
        <i class="menuIcon fa fa-fw mx-2"></i> ${categorie}
    </div> `);
}
