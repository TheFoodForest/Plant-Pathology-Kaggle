const userOutput = document.getElementById("user-output");
const userPredictButton = document.getElementById("predict");
const userClearButton = document.getElementById("clear");
const fileInput = document.getElementById("file-input");

userClearButton.addEventListener("click", () => userOutput.innerHTML = "");
userPredictButton.addEventListener("click", () => predict(modelURL, userOutput)); // needs to be made specific to user input images


fileInput.onchange = (e) => {

    var files = e.target.files
    files.forEach(file => {
        url = URL.createObjectURL(file)
        userOutput.innerHTML += `<div class="col s12 m6"> 
                                    <div class="card">
                                        <div class="card-image">
                                            <img data-src="${url}">
                                        </div>
                                        <span class="card-content green-text text-darken-4">
                                            <!-- prediction for user output to go here -->
                                            <h4>Prediction will show here.</h4>
                                        </span>
                                    </div>
                                </div>`
    })

    const UserImageLoaderWorker = new Worker('/js/workers/image-loader.worker.js')
    const userImgElements = document.querySelectorAll('img[data-src]')


    // We should attach the listener before we pass image URLs to the web worker
    // to catch messages sent prior to the event being attached
    UserImageLoaderWorker.addEventListener('message', event => {
        // Get the message data from the event
        const imageData = event.data

        // Select the original element for this image
        const imageElement = document.querySelectorAll(`img[data-src='${imageData.imageURL}']`)

        // We can use the `Blob` as an image source
        // We just need to convert it to an object URL first
        const objectURL = URL.createObjectURL(imageData.blob)

        // Once the image is loaded, cleanup memory
        imageElement.onload = () => {
            // Remove the original `data-src` attribute to make sure we don't
            // accidentally pass this image to the worker again in the future
            imageElement.removeAttribute('data-src')

            // Also revoke the object URL now that it's been used to cleanup
            URL.revokeObjectURL(objectURL)
        }
        imageElement[0].setAttribute('src', objectURL)
    })

    userImgElements.forEach(imageElement => {
        const imageURL = imageElement.getAttribute('data-src')
        UserImageLoaderWorker.postMessage(imageURL)
    })

}

// MaterializeCSS functions

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems);
});

// onclick event listener to draw hidden canvas to get imageData