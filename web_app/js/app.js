const modelURL = '/model/model.json';

// const inputImg = tf.fromPixels( /*fileUpload or deviceCamera*/ );

let model;

const userOutput = document.getElementById("user-output");
const predictButton = document.getElementById("predict");
const clearButton = document.getElementById("clear");
const fileInput = document.getElementById("file");

function decodeImage(bits) {
    console.log(bits);
    image = tf.browser.fromPixels(bits);
    image = tf.cast(image, tf.float64) / 255;
    image = tf.Tensor.array.map((imgArr) => {
        console.log(imgArr)
    })
    image = tf.image.resize(image, image_size);
    if (!label) {
        return image
    } else {
        return image, label
    }
}

const predict = async(modelURL) => {
    if (!model) model = await tf.loadLayersModel(modelURL);
    const files = fileInput.files;

    [...files].map(async(file) => {

        const reader = new FileReader();
        const img = reader.result
        const processedImage = decodeImage(img)

        // shape has to be the same as it was for training of the model
        const prediction = model.predict(tf.reshape(processedImage, shape = [1, 28, 28, 1]));
        const label = prediction.argMax(axis = 1).get([0]);
        renderImageLabel(img, label);
    })
};
const renderImageLabel = (img, label) => {
    const reader = new FileReader();
    reader.onload = () => {
        userOutput.innerHTML += `<div class="image-block">
                                      <img src="${reader.result}" class="image-block_loaded" id="source"/>
                                       <h2 class="image-block__label">${label}</h2>
                              </div>`;

    };
    reader.readAsDataURL(img);
};

predictButton.addEventListener("click", () => predict(modelURL));
clearButton.addEventListener("click", () => userOutput.innerHTML = "");