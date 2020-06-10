const modelURL = '/model/model.json';

// const inputImg = tf.fromPixels( /*fileUpload or deviceCamera*/ );

let model;

const preview = document.getElementById("preview");
const predictButton = document.getElementById("predict");
const clearButton = document.getElementById("clear");
const fileCount = document.getElementById("file-count");
const fileInput = document.getElementById("file");

function decodeImage(filename, label = None, image_size = (512, 512)) {
    bits = tf.io.read_file(filename);
    image = tf.image.decode_jpeg(bits, channels = 3);
    image = tf.cast(image, tf.float32) / 255;
    image = tf.image.resize(image, image_size);
    if (!label) {
        return image
    } else {
        return image, label
    }
}

const predict = async(modelURL) => {
    if (!model) model = await tf.loadModel(modelURL);
    const files = fileInput.files;

    [...files].map(async(img) => {
        const data = new FormData();
        data.append("file", img);

        const processedImage = decodeImage(data)

        // shape has to be the same as it was for training of the model
        const prediction = model.predict(tf.reshape(processedImage, shape = [1, 28, 28, 1]));
        const label = prediction.argMax(axis = 1).get([0]);
        renderImageLabel(img, label);
    })
};
const renderImageLabel = (img, label) => {
    const reader = new FileReader();
    reader.onload = () => {
        preview.innerHTML += `<div class="image-block">
                                      <img src="${reader.result}" class="image-block_loaded" id="source"/>
                                       <h2 class="image-block__label">${label}</h2>
                              </div>`;

    };
    reader.readAsDataURL(img);
};


fileInput.addEventListener("change", () => numberOfFiles.innerHTML = "Selected " + fileInput.files.length + " files", false);
predictButton.addEventListener("click", () => predict(modelURL));
clearButton.addEventListener("click", () => preview.innerHTML = "");