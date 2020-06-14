const modelURL = '/model/model.json';

// const inputImg = tf.fromPixels( /*fileUpload or deviceCamera*/ );

let model;

const userOutput = document.getElementById("user-output");
const userPredictButton = document.getElementById("predict");
const userClearButton = document.getElementById("clear");
const fileInput = document.getElementById("file");
const testOutputs = document.querySelectorAll("span.card-content")

function chanNorm(image) {

}


function decodeImage(bits) {
    console.log(bits);
    image = tf.browser.fromPixels(bits);
    image = tf.cast(image, tf.float64) / 255;
    image = tf.Tensor.array.map((imgArr) => {
        console.log(imgArr)
    })
    image = tf.image.resize(image, image_size);
    return image
}

const predict = async(modelURL, output) => {
    if (!model) model = await tf.loadLayersModel(modelURL);
    // const files = fileInput.files;

    // [...files].map(async(file) => {

    //     const reader = new FileReader();
    //     const img = reader.result

    // const processedImage = decodeImage(img)

    // shape has to be the same as it was for training of the model
    const prediction = model.predict(tf.reshape(processedImage, shape = [1, 28, 28, 1]));
    const label = prediction.argMax(axis = 1).get([0]);
    const accuracy = prediction.argMax(axis = 1).get([1]); // idk if this is how we get the accuracy but i'm hopeful
    renderImageLabel(label, accuracy, output);
    // })
};

<<<<<<< HEAD
function renderImageLabel(label, accuracy, output) {
=======

const renderImageLabel = (label, accuracy, output) => {
>>>>>>> 3b2486446f6b464f066b2899bbf101078f281379
    output.innerHTML += `${label}, with a ${accuracy * 100}%.`;
};

userPredictButton.addEventListener("click", () => predict(modelURL, userOutput)); // needs to be made specific to user input images
userClearButton.addEventListener("click", () => userOutput.innerHTML = "");