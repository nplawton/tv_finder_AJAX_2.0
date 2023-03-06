/*
    I: User Searches a title 
    O: Title appears in the carosel slide. 
        Upon selecting a slide the display area/window will show all information
    C: keep the carousel to a set amount (##)
    E: Items not in database
*/

//Global Variables for project
//slide carousel variables
let slideCon = $('.slide_container');
let slideTrack = $('#slide_track');

let card = {};

//display variables
let display = $('.display-holder');
//console.log(display);

//search button setup
let userInput = $('#search');
let searchBtn = $('#submit');

//This will allow the user to have randomly generated letter when the screen is first loaded
let alphabet = "abcdefghijklmnopqrstuvwxyz";
let startSearch = alphabet[Math.floor(Math.random()*alphabet.length)];
console.log(`Starting letter is ${startSearch}`);

//pop-up Window Variables
let overlay = $('#overlay');
let content = $('#content');
let closeBtn = $('#close');
let popupName = $('#name');
let popupDetail = $('#desc');

//Global Variables END

//startup scripts
slideActivate();
userStart();


//This will allow the user to type text in the input bar of the search area
function userStart(){
    userInput.keyup((e) => {
        let searchValue = e.target.value;
        if(searchValue && searchValue.trim().length > 0){
            let searchValues = searchValue.toLowerCase();
            userInput.text(searchValues);
        }
    });
}


searchBtn.click((e) => {
    startSearch = userInput.val();
    //console.log(searchValue);
    searchReview(startSearch);
    console.log(startSearch);
    //When switching from the current slide array to the next search input 
    //the display covers the new search this will close the current display window
    display.empty();
    display.removeClass('active');

});

//Search Function form the API
function searchReview(startTxt){
    let vault = dataReview(startTxt);
    $.get(vault, (data) => {
        console.log(data);
        slideTrack.empty();
        slideActivate(data);
    });
}

//Initial Data pull
function dataReview(startTxt){
    return `https://api.tvmaze.com/search/shows?q=${startSearch}`;
    
}

//slide results functions
//Main feeder for the project --> if this fails then the project won't operate
function slideActivate (searchTxt){
    
    let searchVaults = dataReview(startSearch);

    //When starting with initial data rerun the get request
    $.get(searchVaults, (data) => {
        //console.log(data);
        for (let i = 0; i < data.length; i++){
                    
            const searchVault = data[i].show;
            //console.log(searchVault);

            let cardWindow = cardCreator(searchVault);
            
            //blank OBJ created in global currently called 'Card'
            card[cardWindow.id] = cardWindow;
            //console.log(cardWindow.id);
            //the ID is the linking point between the slide and display

            //Placing the title and image at the bottom of the screen
            let slideBox = $('<div id="holder" class="slide-box"></div>');
            slideTrack.append(slideBox);
            let slideBackground = $(`<span class="slide-info"></span>`);
            slideBox.append(slideBackground);
            slideBackground.append(cardWindow.slideTitle);
            slideBackground.append(cardWindow.slideImg);

        }

        //asign current slide to the first child element
        //console.log('current track', slideTrack)
        let firstChild = slideTrack[0].children[0];
        //console.log('this is the first child', firstChild);
        //This will effect how the carousel tracks the various slides
        firstChild.classList.add('active');

        //Allign the Slides
        const slides = [... slideTrack[0].children];
        //console.log('Im working here', slides);
        let slideWidth = slides[0].getBoundingClientRect().width;
        //console.log(slideWidth);
        slides.forEach((slide, index) => {
            slide.style.left = slideWidth * index + 'px';
        });

    });


    slideTrack.click((e) => {
        //console.log(test());
        //When selecting class make sure you select the element storing the id of the object to be selected
        let resultElement = e.target.getAttribute('class') === 'slide-img';
        console.log(resultElement);
        if(resultElement){
        //     //console.log(resultElement);
            display.addClass('active');
            display.empty();
            
            let cardId = e.target.id;
            console.log(cardId);
            //the global defind OBJ is the start of the right arugment
            let cardDispaly = card[cardId];
            //console.log(cardDispaly);
            let cardReveal = displayWindow(cardDispaly);
            //console.log(cardReveal);
            display.append(cardReveal);
        }

        //To display extra information to keep from cluttering up the display window
        let moreInfo = $('.title-img');

        moreInfo.click((e) => {
            //console.log(test());
            let popId = e.target.id;
            let popDisplay = card[popId];
            //console.log(popDisplay);
            popupName.text(`This show is ${popDisplay.disType}`);
            //console.log(popDisplay.disType);
            overlay.addClass('active');
            content.addClass('active');
        });

        closeBtn.click(() => {
            overlay.removeClass('active');
            content.removeClass('active');
        });

        overlay.click(() => {
            overlay.removeClass('active');
            content.removeClass('active');
        });

    });
}


/*
    This function will allow the user to select a result from the slide carousel
    & have it displayed in the display window area
*/
//Display window function -- results from selecting a slide
function displayWindow(cardDispaly){
    //Build the return the dev wnats the DOM to look upon rendering
    //All values are coming from the cardCreator function Object
    return `
        <div id="display-box">
            <h1 id="dis-title">${cardDispaly.disTitle}</h1>
            <img id="${cardDispaly.id}" class="title-img" src="${cardDispaly.disImg}"></img>
            <div id="base-detail"> 
                <div id="genreal-info">Genre: ${cardDispaly.disGenre} / Rating: ${cardDispaly.disRate}</div>
                ${cardDispaly.disDesrip}
            </div>
            ${cardDispaly.disUrl}
        </div>
    `;
}

//Blank Card Holder to hold information using the id of the selected item
function cardCreator(searchVault){
    return {
        id: searchVault.id,
        slideTitle: `<h1 id="${searchVault.id}" class="slide-title">${searchVault.name}</h1>`,
        slideImg: `<img id="${searchVault.id}" class="slide-img" src="${searchVault.image.medium}"></img>`,
        disTitle: searchVault.name.toUpperCase(),
        disImg: searchVault.image.medium,
        //With API that have DOM formatting you don't need to DOM format them
        disDesrip: searchVault.summary, 
        disGenre: searchVault.genres,
        disRate: searchVault.rating.average,
        disUrl: `<a id="dis-link" href="${searchVault.url}">Click here for more information</a>`,
        disType: searchVault.type
    }
}

function test(){
    console.log('This has been a test of the Emergency Broadcasting System');
}

//Carousel functionality
let nextBtn = $('#next');
let prevBtn = $('#prev');

nextBtn.click(() => {
    console.log(slideTrack);
    const currentSlide = $('.active');
    //If the carousel reaches the last child allow the carousel not to throw an err
    const nextSlide = currentSlide[0].nextElementSibling || slideTrack[0].lastElementChild;
    console.log(currentSlide);
    //Clear the current display window
    display.empty();
    //how to much to move towards the next slide
    const moveAmount = nextSlide.style.left;
    console.log(moveAmount);
    
    //move to the next slide
    slideTrack.css('transform', `translateX(-${moveAmount})`);
    currentSlide.removeClass('active');
    nextSlide.classList.add('active');
});

prevBtn.click(() => {
    console.log(slideTrack);
    const currentSlide = $('.active');
    const prevSlide = currentSlide[0].previousElementSibling || slideTrack[0].firstElementChild;
    console.log(currentSlide);
    display.empty();
    //how to much to move towards the next slide
    const moveAmount = prevSlide.style.left;
    console.log(moveAmount);
    
    //move to the next slide
    slideTrack.css('transform', `translateX(-${moveAmount})`);
    currentSlide.removeClass('active');
    prevSlide.classList.add('active');
});