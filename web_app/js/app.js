/*
    model.js
*/
const modelURL = '/model/model.json';

// const inputImg = tf.fromPixels( /*fileUpload or deviceCamera*/ );

let model;


function chanNorm(image) {
    image = tf.Tensor.array.map((imgArr) => {
        console.log(imgArr)
    })
}


function decodeImage(bits) {
    console.log(bits);
    image = tf.browser.fromPixels(bits);
    image = tf.cast(image, tf.float64) / 255;
    image = tf.image.resize(image, image_size);
    image = chanNorm(image);
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

function renderImageLabel(label, accuracy, output) {
    output.innerHTML += `${label}, with a ${accuracy * 100}%.`;
};

function renderUserOutput() {
    // this function builds the cards for the user uploaded images
}