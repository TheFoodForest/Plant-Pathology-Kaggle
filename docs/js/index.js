const TestImageLoaderWorker = new Worker('js/workers/image-loader.worker.js');
const testImgElements = document.querySelectorAll('img[data-src]');
const testImgPredictions = document.querySelectorAll('div.card-image');
const testCanvasDiv = document.querySelector('#canvas-div');
const testOutputs = document.querySelectorAll("div.card-content");
const loadDiv = document.querySelector('#loading-overlay');


const urlsForRec = {'Healthy': ['How to keep your apple trees healthy: ', 'https://www.indianapolisorchard.com/home-apple-tree-care-spray-guide/'],
            'Scab': [`Ahhh Scab! Here's a way to treat it: `, 'https://www.planetnatural.com/pest-problem-solver/plant-disease/apple-scab/'],
            'Rust': [`Rust it is! Here's how you can manage it: ` , 'https://www.planetnatural.com/pest-problem-solver/plant-disease/common-rust/'],
            'Multiple': [`Multiple Diseases? Here's a way to keep your tree healthy: `, 'https://homeguides.sfgate.com/controlling-fungus-apple-scabs-apple-trees-33679.html#:~:text=Sappy%20bark%20(Trametes%20versicolor)%20is,tree%20debris%20on%20the%20ground.']}

// We should attach the listener before we pass image URLs to the web worker
// to catch messages sent prior to the event being attached
TestImageLoaderWorker.addEventListener('message', event => {
    // Get the message data from the event
    const imageData = event.data;

    // Select the original element for this image
    const imageElement = document.querySelectorAll(`img[data-src='${imageData.imageURL}']`);

    // We can use the `Blob` as an image source
    // We just need to convert it to an object URL first

/* 

Changed the objectUrl constant here - the blob makes a special URL - seems to work on local and github when using this method

*/
    
    const objectURL = imageElement[0].attributes[1].nodeValue;

    // Once the image is loaded, cleanup memory
    imageElement.onload = () => {
        // Remove the original `data-src` attribute to make sure we don't
        // accidentally pass this image to the worker again in the future
        imageElement.removeAttribute('data-src');

        // Also revoke the object URL now that it's been used to cleanup
        URL.revokeObjectURL(objectURL);
    }
    imageElement[0].setAttribute('src', objectURL);
})

testImgElements.forEach(imageElement => {
    const imageURL = imageElement.getAttribute('data-src');
    TestImageLoaderWorker.postMessage(imageURL);
})


// Prediction button logic
// onclick draw img to hidden canvas and then get ImageData to pass to TensorFlow
testImgPredictions.forEach((item, index) => {

    const imgEl = item.querySelector('img');
    const spanEl = item.querySelector('span');
    const btnEl = item.querySelector('a');

    btnEl.addEventListener('click', event => {
        // show preloader
        loadDiv.classList.add('loading-overlay');
        loadDiv.innerHTML += `<div class="progress">
        <div class="indeterminate"></div>
    </div>`;

        // get image src and draw to hidden canvas then get ImageData and pass that to prediction functions, 
        testCanvasDiv.innerHTML += '<canvas id="hidden-canvas" width="2048" height="1365" hidden></canvas>';
        const testCanvas = document.querySelector('#hidden-canvas');
        const ctx = testCanvas.getContext("2d");
        const image = new Image;
        image.src = imgEl.getAttribute('data-src');

        image.onload = () => {
            ctx.drawImage(image, 0, 0);
            imageData = ctx.getImageData(0, 0, 2048, 1365);

            // pass imageDATA to TensorFlow here
            // adding a tiny to add a link to resources on index page 
           let prediction = predict(imageData, spanEl, index);
           
           prediction.then( data => {
            if (data === 'Rust and Scab') {
                data = 'Multiple'
            }
               console.log(`index-${data}`);
                var appendTxt = document.getElementById(`index-${data}`)
                appendTxt.innerHTML = null
                appendTxt.innerHTML += `<strong>${urlsForRec[data][0]} <a href="${urlsForRec[data][1]}">link</a> <strong><br>`
        });
        };

        // erase canvas to conserve memory
        testCanvasDiv.innerHTML = null;

    });
});