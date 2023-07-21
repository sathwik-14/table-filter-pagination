// script.js
const tbody = document.getElementById("tbody");

var data = [];
const itemsPerPage = 5;
let currentPage = 1;
let currentSortColumn = null;
let isAscendingSort = true;

// Add event listeners to rating input elements
document
  .getElementById("imdbRatingInput")
  .addEventListener("input", displayDataForCurrentPage);
document
  .getElementById("tomatoesRatingInput")
  .addEventListener("input", displayDataForCurrentPage);
document
  .getElementById("combinedRatingInput")
  .addEventListener("input", displayDataForCurrentPage);

function updateActive(i) {
  document.querySelectorAll(`.btn-${i}`).forEach((btn) => {
    btn.classList.toggle("btn-outline-secondary");
    btn.classList.toggle("btn-primary");
  });
}

function sortBy(column) {
  if (currentSortColumn === column) {
    isAscendingSort = !isAscendingSort;
  } else {
    currentSortColumn = column;
    isAscendingSort = false;
  }

  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentPageData = data.slice(startIdx, endIdx);

  currentPageData.sort((a, b) => {
    const aValue = getPropertyValueByPath(a, column);
    const bValue = getPropertyValueByPath(b, column);

    if (isAscendingSort) {
      if (aValue < bValue) return -1;
      if (aValue > bValue) return 1;
    } else {
      if (aValue > bValue) return -1;
      if (aValue < bValue) return 1;
    }

    return 0;
  });

  data.splice(startIdx, itemsPerPage, ...currentPageData);
}

function getPropertyValueByPath(obj, path) {
  const keys = path.split(".");
  let value = obj;
  for (const key of keys) {
    if (value.hasOwnProperty(key)) {
      value = value[key];
    } else {
      return null;
    }
  }
  return value;
}

function handleColumnSort(event) {
  const column = event.target.getAttribute("data-column");
  sortBy(column);
  displayDataForCurrentPage();
}

// Add event listeners to the sortable column headers
document.querySelectorAll(".sortable").forEach((th) => {
  th.addEventListener("click", handleColumnSort);
});

// Function to display the data for the current page
function displayDataForCurrentPage() {
  const imdbRatingInput = parseFloat(
    document.getElementById("imdbRatingInput").value
  );
  const tomatoesRatingInput = parseFloat(
    document.getElementById("tomatoesRatingInput").value
  );
  const combinedRatingInput = parseFloat(
    document.getElementById("combinedRatingInput").value
  );

  const imdbPreview = document.querySelectorAll(".imdb");
  const tomatoesPreview = document.querySelectorAll(".tomatoes");
  const combinedPreview = document.querySelectorAll(".combined");

  if (!isNaN(imdbRatingInput)) imdbPreview[0].textContent = imdbRatingInput;
  if (!isNaN(tomatoesRatingInput))
    tomatoesPreview[0].textContent = tomatoesRatingInput;
  if (!isNaN(combinedRatingInput))
    combinedPreview[0].textContent = combinedRatingInput;

  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentPageData = data.slice(startIdx, endIdx).filter((item) => {
    const imdbRating = parseFloat(item.imdb.rating);
    const tomatoesRating = parseFloat(item.tomatoes.viewer.rating);
    const combinedRating = parseFloat(item.combinedRating);

    const isImdbMatch = isNaN(imdbRatingInput) || imdbRating >= imdbRatingInput;
    const isTomatoesMatch =
      isNaN(tomatoesRatingInput) || tomatoesRating >= tomatoesRatingInput;
    const isCombinedMatch =
      isNaN(combinedRatingInput) || combinedRating >= combinedRatingInput;

    return isImdbMatch && isTomatoesMatch && isCombinedMatch;
  });

  tbody.innerHTML = "";

  currentPageData.forEach((item) => {
    // Create a table row with the fetched data
    const row = document.createElement("tr");

    // Create table data cells and set their content to the corresponding data properties
    const titleCell = document.createElement("td");
    titleCell.textContent = item.title;
    row.appendChild(titleCell);

    const imdbCell = document.createElement("td");
    imdbCell.textContent = item.imdb.rating;
    row.appendChild(imdbCell);

    const tomatoesCell = document.createElement("td");
    tomatoesCell.textContent = item.tomatoes.viewer.rating;
    row.appendChild(tomatoesCell);

    const combinedCell = document.createElement("td");
    combinedCell.textContent = item.combinedRating;
    row.appendChild(combinedCell);

    const plotCell = document.createElement("td");
    plotCell.textContent = item.plot;
    row.appendChild(plotCell);

    // Append the row to the tbody element
    tbody.appendChild(row);
  });
}

// Function to handle pagination controls
function handlePaginationClick(pageNumber) {
  let newPage = pageNumber;
  if (newPage !== currentPage) {
    updateActive(currentPage);
    currentPage = newPage;
    updateActive(currentPage);
    displayDataForCurrentPage();
  }
}

function initializePagination() {
  const paginationContainer = document.getElementById("paginationContainer");
  const totalPages = Math.ceil(data.length / itemsPerPage);

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("div");
    pageButton.classList.add("btn", "mx-2", "btn-outline-secondary");
    pageButton.classList.add(`btn-${i}`);
    pageButton.textContent = i;
    pageButton.addEventListener("click", () => handlePaginationClick(i));
    paginationContainer.appendChild(pageButton);
  }
  updateActive(1);
}

const pushItems = async () => {
  fetch("movies.json")
    .then((response) => response.json())
    .then((item) => {
      item.map((eachItem) => {
        data.push(eachItem);
      });

      data.map((item) => {
        let combinedRating =
          (item.imdb.rating / 2 + item.tomatoes.viewer.rating) / 2;
        item.combinedRating = combinedRating.toFixed(2);
      });
      data.sort((a, b) => {
        if (a["title"] < b["title"]) return -1;
        if (a["title"] > b["title"]) return 1;
        return 0;
      });

      displayDataForCurrentPage();
      initializePagination();
    })
    .catch((err) => {
      console.error(err);
    });
};

(async () => {
  await pushItems();
})();
