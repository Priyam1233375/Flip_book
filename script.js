const pdfUpload = document.getElementById("pdfUpload");
const flipbook = document.getElementById("flipbook");
const prevPageButton = document.getElementById("prevPage");
const nextPageButton = document.getElementById("nextPage");

let pdfDoc = null;
let currentPage = 1;
let flipCount = 0; // Keeps track of the number of flips
let nextFlipCount = 0; // Counts next flips
let prevFlipCount = 0; // Counts previous flips

// Handle PDF Upload
pdfUpload.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file && file.type === "application/pdf") {
    const fileReader = new FileReader();
    fileReader.onload = function (e) {
      const typedArray = new Uint8Array(e.target.result);
      loadPDF(typedArray);
    };
    fileReader.readAsArrayBuffer(file);
  }
});

// Load PDF Document
function loadPDF(data) {
  pdfjsLib.getDocument(data).promise.then((pdf) => {
    pdfDoc = pdf;
    currentPage = 1;
    flipCount = 0; // Reset flip count when a new PDF is loaded
    nextFlipCount = 0;
    prevFlipCount = 0;
    renderPages();
    updateControls();
    console.log("Flipbook initialized. Flip counts reset.");
    displayFlipCounts();
  });
}

// Render Pages
function renderPages() {
  flipbook.innerHTML = "";

  const pagesToRender = [currentPage, currentPage + 1];
  pagesToRender.forEach((pageNum, index) => {
    if (pageNum <= pdfDoc.numPages) {
      pdfDoc.getPage(pageNum).then((page) => {
        const viewport = page.getViewport({ scale: 1 });
        const scale = flipbook.clientWidth / 2 / viewport.width;

        const scaledViewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport,
        };

        page.render(renderContext).promise.then(() => {
          const pageDiv = document.createElement("div");
          pageDiv.className = "page";
          pageDiv.classList.add(index === 0 ? "left" : "right");
          pageDiv.appendChild(canvas);
          flipbook.appendChild(pageDiv);
        });
      });
    }
  });
}

// Update Navigation Buttons
function updateControls() {
  prevPageButton.disabled = currentPage <= 1;
  nextPageButton.disabled = currentPage + 1 >= pdfDoc.numPages;
}

// Display Flip Counts on the Page
function displayFlipCounts() {
  const flipCountDisplay = document.getElementById("flipCountDisplay");
  if (!flipCountDisplay) {
    const display = document.createElement("div");
    display.id = "flipCountDisplay";
    display.style.marginTop = "10px";
    display.style.fontSize = "16px";
    display.style.fontWeight = "bold";
    display.textContent = `Total Flips: ${flipCount} | Next Flips: ${nextFlipCount} | Previous Flips: ${prevFlipCount}`;
    document.querySelector(".container").appendChild(display);
  } else {
    flipCountDisplay.textContent = `Total Flips: ${flipCount} | Next Flips: ${nextFlipCount} | Previous Flips: ${prevFlipCount}`;
  }
}

// Log Flip Count
function logFlip(action) {
  flipCount++;
  if (action === "Next Page") {
    nextFlipCount++;
  } else if (action === "Previous Page") {
    prevFlipCount++;
  }
  console.log(`Action: ${action}, Total Flips: ${flipCount}, Next Flips: ${nextFlipCount}, Previous Flips: ${prevFlipCount}`);
  displayFlipCounts();
}

// Flip Pages Forward
nextPageButton.addEventListener("click", () => {
  if (currentPage + 1 < pdfDoc.numPages) {
    const leftPage = flipbook.querySelector(".page.left");
    const rightPage = flipbook.querySelector(".page.right");

    leftPage.classList.add("flipping");
    leftPage.style.transform = "rotateY(-180deg)";
    rightPage.classList.add("flipping");
    rightPage.style.transform = "rotateY(-180deg)";

    setTimeout(() => {
      currentPage += 2;
      renderPages();
      updateControls();
      logFlip("Next Page");
    }, 700); // Match transition duration
  }
});

// Flip Pages Backward
prevPageButton.addEventListener("click", () => {
  if (currentPage > 1) {
    const leftPage = flipbook.querySelector(".page.left");
    const rightPage = flipbook.querySelector(".page.right");

    leftPage.classList.add("flipping");
    leftPage.style.transform = "rotateY(0deg)";
    rightPage.classList.add("flipping");
    rightPage.style.transform = "rotateY(0deg)";

    setTimeout(() => {
      currentPage -= 2;
      renderPages();
      updateControls();
      logFlip("Previous Page");
    }, 700); // Match transition duration
  }
});
