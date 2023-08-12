// ---- ---- ---- ---- ---- ---- ---- ---- 

// -- IMPORT FIREBASE CORE, ANALYTICS AND REALTIME DATABASE --
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js'
import { getDatabase, onValue, ref, set, get, remove, child, update } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js"

// Initial variables to connect to firebase.
let firebaseConfig;
let app;
let database;

// ---- ---- ---- ---- ---- ---- ---- ---- 

// -- HTML ELEMENTS --
let viewsDisplay;
let selectQuestDifficulty;
let questAuthor;
let questName;
let questDescription;
let questDifficulty;
let questRedward;
let questBtn;

let questList;
let snapshotGlobal;

// -- VARIABLES --
let starsSelected = 1;

// ---- ---- ---- ---- ---- ---- ---- ---- 

// -- WAIT FOR DOM LOAD COMPLETE --
addEventListener("DOMContentLoaded", (e) => {

    // ---- ---- ---- ---- ---- ---- ---- ---- 

    // Debug.
    console.log("DOM load complete. Ready to work.");

    viewsDisplay = document.getElementById("views-display");
    selectQuestDifficulty = document.getElementById("select-quest-difficulty");
    questAuthor = document.getElementById("quest-author-name");
    questName = document.getElementById("quest-name-input");
    questDescription = document.getElementById("quest-description-input");
    questDifficulty = document.getElementById("quest-difficulty-stars-container");
    addStars(starsSelected, questDifficulty);
    questRedward = document.getElementById("quest-redward");
    questBtn = document.getElementById("create-quest-request-btn");

    questList = document.getElementById("quest-available-list");

    selectQuestDifficulty.addEventListener("change", (e) => {

        console.log(selectQuestDifficulty.value);

        updateQuestList(snapshotGlobal);
    });

    questRedward.addEventListener("input", (e) => {

        // ---- ---- ---- ---- ---- ---- ---- ---- 

        // Set max value.
        if (questRedward.value > 20) questRedward.value = 20;

        // ---- ---- ---- ---- ---- ---- ---- ---- 

        // Accept only numbers.
        let regEx = /^[0-9]+$/;
        if (!regEx.test(questRedward.value)) questRedward.value = "";

        // ---- ---- ---- ---- ---- ---- ---- ---- 
    });

    questBtn.addEventListener("click", (e) => {

        // ---- ---- ---- ---- ---- ---- ---- ---- 

        // -- GET DATA AND VALIDATE --

        // Get all data.
        let author = questAuthor.value.trim();
        let name = questName.value.trim();
        let description = questDescription.value.trim();
        let difficulty = starsSelected;
        let redward = parseInt(questRedward.value);

        // Check data input.
        if (author === "" || name === "" || description === "") return;
        if (redward === 0 || redward === "") redward = 1;

        console.log("Button Clicked.");
        console.log(author, name, description, difficulty, redward);

        // ---- ---- ---- ---- ---- ---- ---- ---- 

        // -- WRITE DATA ON REMOTE DATABASE --
        set(ref(database, "quest-list/" + author + " " + name), {
            author: author,
            name: name,
            description: description,
            difficulty: difficulty,
            redward: redward
        });

        // ---- ---- ---- ---- ---- ---- ---- ---- 

        // -- CLEAR VALUES --
        questAuthor.value = "";
        questName.value = "";
        questDescription.value = "";
        addStars(1, questDifficulty);
        questRedward.value = 1;
    });

    // ---- ---- ---- ---- ---- ---- ---- ---- 

    // -- FIREBASE SETUP --

    // Create firebase config object with database URL.
    firebaseConfig = {
        databaseURL: "https://the-mission-board-default-rtdb.firebaseio.com/"
    };

    // Initialize firebase and database.
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);

    // Get all views.
    get(child(ref(database), "views")).then((snapshot) => {

        if (snapshot.exists()) {

            let data = snapshot.val();
            data++;
            console.log(data);

            // Update views.
            const updates = {};
            updates["views"] = data;
            update(ref(database), updates);

            // Show views on HTML.
            viewsDisplay.innerText = "Views: " + data;

        } else {

            console.log("No data available");
        }

    }).catch((error) => {

        console.error(error);
    });

    // Listen for changes on views.
    let totalViews = ref(database, "views/");
    onValue(totalViews, (snapshot) => {

        const data = snapshot.val();
        // Show views on HTML.
        viewsDisplay.innerText = "Views: " + data;
    });

    // Listen to changes on DB.
    let questAvailables = ref(database, "quest-list/");
    onValue(questAvailables, (snapshot) => {

        // Access to all quest on database.
        snapshotGlobal = snapshot.val();

        // Update HTML display list.
        updateQuestList(snapshotGlobal);
    });

    // ---- ---- ---- ---- ---- ---- ---- ---- 
});

// ---- ---- ---- ---- ---- ---- ---- ---- 

// Function to update quest list with all items, using as filter
// a select.
function updateQuestList(data) {

    // Clear Quest List HTML data.
    questList.innerHTML = "";

    // Look through quest.
    for (let item in data) {

        // Get quest name to access its data.
        let quest = data[item];

        // Display quest data.
        // console.log(quest);

        // ---- ---- ---- ---- ---- ---- ---- ----

        // -- FILTER LIST BY SELECT QUEST DIFFICULTY --

        if (selectQuestDifficulty.value === "oneStar" && quest.difficulty != 1) continue;
        if (selectQuestDifficulty.value === "twoStars" && quest.difficulty != 2) continue;
        if (selectQuestDifficulty.value === "threeStars" && quest.difficulty != 3) continue;
        if (selectQuestDifficulty.value === "fourStars" && quest.difficulty != 4) continue;
        if (selectQuestDifficulty.value === "fiveStars" && quest.difficulty != 5) continue;

        // ---- ---- ---- ---- ---- ---- ---- ----

        // Get access to Quest data.
        let author = quest.author;
        let name = quest.name;
        let description = quest.description;
        let difficulty = quest.difficulty;
        let redward = quest.redward;

        // Create Quest Item.
        let divContainer = document.createElement("div");
        let divNameContainer = document.createElement("div");
        let divDescriptionContainer = document.createElement("div");
        let divButtonContainer = document.createElement("div");

        let authorHTML = document.createElement("h3");
        let nameHTML = document.createElement("h3");
        let descriptionHTML = document.createElement("p");
        let difficultyHTML = document.createElement("div");
        let redwardHTML = document.createElement("p");
        let buttonHTML = document.createElement("button");

        authorHTML.innerText = "By " + author;
        nameHTML.innerText = name;
        descriptionHTML.innerText = description;
        addStars(difficulty, difficultyHTML, false);
        redwardHTML.innerText = `Redward: ${redward} coins`;
        buttonHTML.innerText = "Accept Quest";

        divContainer.classList.add("quest-card");
        divNameContainer.classList.add("quest-card-title");
        divDescriptionContainer.classList.add("quest-card-description");
        divButtonContainer.classList.add("quest-card-button");

        if (difficulty === 1) divNameContainer.classList.add("one-star");
        if (difficulty === 2) divNameContainer.classList.add("two-star");
        if (difficulty === 3) divNameContainer.classList.add("three-star");
        if (difficulty === 4) divNameContainer.classList.add("four-star");
        if (difficulty === 5) divNameContainer.classList.add("five-star");

        divNameContainer.appendChild(nameHTML);
        divDescriptionContainer.appendChild(descriptionHTML);
        divDescriptionContainer.appendChild(authorHTML);
        divButtonContainer.appendChild(difficultyHTML);
        divButtonContainer.appendChild(redwardHTML);
        divButtonContainer.appendChild(buttonHTML);

        divContainer.appendChild(divNameContainer);
        divContainer.appendChild(divDescriptionContainer);
        divContainer.appendChild(divButtonContainer);
        questList.appendChild(divContainer);

        buttonHTML.addEventListener("click", (e) => {

            remove(ref(database, "quest-list/" + item));
        });
    }
}

// ---- ---- ---- ---- ---- ---- ---- ---- 

function addStars(selectedStars, HTML_Element, overriteData = true) {

    // Set stars selected.
    if (overriteData) starsSelected = selectedStars;

    // Clear HTML element.
    HTML_Element.innerHTML = "";

    // Loop to add 5 stars in total.
    for (let i = 0; i < 5; i++) {

        // Variable to store img src.
        let src;

        // Check number of selected stars to choose img src.
        if (i <= selectedStars - 1) {

            src = "./src/img/star-clicked.png";

        } else {

            src = "./src/img/star-unclicked.png";
        }

        // Create img and add its src.
        let img = document.createElement("img");
        img.src = src;

        img.classList.add("difficulty-stars");

        // Add star to difficultySelection div.
        HTML_Element.appendChild(img);

        if (overriteData) {

            // Add listener to re-add stars based on user selection.
            img.addEventListener("click", (e) => {

                addStars(i + 1, HTML_Element);
            });
        }
    }
}

// ---- ---- ---- ---- ---- ---- ---- ---- 
