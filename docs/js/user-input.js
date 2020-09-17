const userOutput = document.getElementById("user-output");
const userClearButton = document.getElementById("clear");
const fileInput = document.getElementById("file-input");
const loadDiv = document.querySelector('#loading-overlay');

userClearButton.addEventListener("click", () => userOutput.innerHTML = null);

fileInput.onchange = (uploadEvent) => {

    var files = uploadEvent.target.files;
    files.forEach(file => {
        url = URL.createObjectURL(file);
        userOutput.innerHTML += `<div class="col s12 m6">
        <div class="card">
            <div class="card-image">
                <img data-src="${url}">
                <div class="card-content green-text text-darken-4">
                    <span>
                        <p>Prediction will show here.</p>
                        <p>Graph will show here.</p>
                    </span>
                    
                </div>
                <a class="btn-floating halfway-fab waves-effect waves-light green"><i class="material-icons">online_prediction</i></a>
            </div>
            
        </div>
    </div>`;
    });

    const UserImageLoaderWorker = new Worker('js/workers/image-loader.worker.js');
    const userImgElements = document.querySelectorAll('img[data-src]');
    console.log(userImgElements);


    // We should attach the listener before we pass image URLs to the web worker
    // to catch messages sent prior to the event being attached
    UserImageLoaderWorker.addEventListener('message', event => {
        // Get the message data from the event
        const imageData = event.data;

        // Select the original element for this image
        const imageElement = document.querySelectorAll(`img[data-src='${imageData.imageURL}']`);

        // Changed this for github loading 
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

    userImgElements.forEach(imageElement => {
        const imageURL = imageElement.getAttribute('data-src');
        UserImageLoaderWorker.postMessage(imageURL);
    });


    const imgDivs = document.querySelectorAll('div.card-image');
    const canvasDiv = document.querySelector('#canvas-div');
    // Prediction button logic
    // onclick draw img to hidden canvas and then get ImageData to pass to TensorFlow
    imgDivs.forEach((item, index) => {

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
            canvasDiv.innerHTML += '<canvas id="hidden-canvas" width="2048" height="1365" hidden></canvas>';
            const canvas = document.querySelector('#hidden-canvas');
            const ctx = canvas.getContext("2d");

            const image = new Image;
            image.src = imgEl.getAttribute('data-src');
            image.onload = () => {
                ctx.drawImage(image, 0, 0);
                imageData = ctx.getImageData(0, 0, 2048, 1365);
                // console.log(imageData);

                // pass imageDATA to TensorFlow here
                predict(imageData, spanEl, index);
            };

            // erase canvas to conserve memory
            canvasDiv.innerHTML = null;

        });
    });
};