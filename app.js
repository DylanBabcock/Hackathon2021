
const container = document.getElementById("container")
const markMessage = document.createElement("div")
const noMaskMessage = document.createElement("div")
const maskMessageDiv = document.createElement("div")
const maskMessageCont = document.createElement("div")
const headingMask = document.createElement("h3")
const headingDescription = document.createElement("p")
headingMask.textContent = "Mask detected"
headingDescription.textContent = "You are good to go"
maskMessageDiv.classList.add("maskDiv")
maskMessageCont.classList.add("maskCont")
headingMask.classList.add("heading")
headingDescription.classList.add("desc")
maskMessageCont.appendChild(headingMask)
maskMessageCont.appendChild(headingDescription)
maskMessageDiv.appendChild(maskMessageCont)

const nomaskMessageDiv = document.createElement("div")
const nomaskMessageCont = document.createElement("div")
const noheadingMask = document.createElement("h3")
const noheadingDescription = document.createElement("p")
noheadingMask.textContent = "Mask not detected"
noheadingDescription.textContent = "Please wear a mask :("
nomaskMessageDiv.classList.add("nomaskDiv")
nomaskMessageCont.classList.add("nomaskCont")
noheadingMask.classList.add("heading")
noheadingDescription.classList.add("desc")
nomaskMessageCont.appendChild(noheadingMask)
nomaskMessageCont.appendChild(noheadingDescription)
nomaskMessageDiv.appendChild(nomaskMessageCont)
markMessage.classList.add("mask")
noMaskMessage.classList.add("no-mask")


console.log(container)
const startDetectBtn = document.querySelector(".btn")
const loader = document.createElement("img")
loader.src = "loading (1).png"
loader.classList.add("rotate")





async function compare() {
    const maskImageCount = 7;
    const noMaskImageCount = 8;
    const trainImagesContainer = document.querySelector(".train-images");
    // Add mask images to the DOM and give them a class of `mask-img`
    for (let i = 1; i <= maskImageCount; i++) {
        const newImage = document.createElement('IMG');
        newImage.setAttribute('src', `mask/${i}.jpg`);
        newImage.classList.add('mask-img');
        trainImagesContainer.appendChild(newImage);
    }
    // Add no mask images to the DOM and give them a class of `no-mask-img`
    for (let i = 1; i <= noMaskImageCount; i++) {
        const newImage = document.createElement('IMG');
        newImage.setAttribute('src', `no_mask/${i}.jpg`);
        newImage.classList.add('no-mask-img');
        trainImagesContainer.appendChild(newImage);
    }

    container.innerHTML = ""
    container.appendChild(loader)



    // Load mobilenet module
    const mobilenetModule = await mobilenet.load({version: 2, alpha: 1});
        // Add examples to the KNN Classifier
        const classifier = await trainClassifier(mobilenetModule);
    // Predict class for the test image
        const testImage = document.getElementById('photo');
        const tfTestImage = tf.browser.fromPixels(testImage);
        const logits = mobilenetModule.infer(tfTestImage, 'conv_preds');
        const prediction = await classifier.predictClass(logits);
    // Add a border to the test image to display the prediction result
        if (prediction.label == 0) {
            loader.style.display = "none"
            container.appendChild(maskMessageDiv)
            console.log("no")

        } else  if(prediction.label == 1){ // has mask - green border
            loader.style.display = "none"
            container.appendChild(nomaskMessageDiv)


        }


  }

  async function trainClassifier(mobilenetModule) {
    // Create a new KNN Classifier
    const classifier = knnClassifier.create();
   // Train using mask images
    const maskImages = document.querySelectorAll('.mask-img');
    maskImages.forEach(img => {
        const tfImg = tf.browser.fromPixels(img);
        const logits = mobilenetModule.infer(tfImg, 'conv_preds');
        classifier.addExample(logits, 0); // has mask
    });
    // Train using no mask images
    const noMaskImages = document.querySelectorAll('.no-mask-img');
    noMaskImages.forEach(img => {
        const tfImg = tf.browser.fromPixels(img);
        const logits = mobilenetModule.infer(tfImg, 'conv_preds');
        classifier.addExample(logits, 1); // no mask
    });
return classifier;
}




    (function() {
        var width = 320; // We will scale the photo width to this
        var height = 0; // This will be computed based on the input stream
        var streaming = false;
        var video = null;
        var canvas = null;
        var photo = null;
        var startbutton = null;

        function startup() {
            video = document.getElementById('video');
            canvas = document.getElementById('canvas');
            photo = document.getElementById('photo');
            startbutton = document.getElementById('startbutton');

            navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                })
                .then(function(stream) {
                    video.srcObject = stream;
                    video.play();
                })
                .catch(function(err) {
                    console.log("An error occurred: " + err);
                });

            video.addEventListener('canplay', function(ev) {
                if (!streaming) {
                    height = video.videoHeight / (video.videoWidth / width);

                    if (isNaN(height)) {
                        height = width / (4 / 3);
                    }

                    video.setAttribute('width', width);
                    video.setAttribute('height', height);
                    canvas.setAttribute('width', width);
                    canvas.setAttribute('height', height);
                    streaming = true;
                }
            }, false);

            startbutton.addEventListener('click', function(ev) {
                takepicture();
                ev.preventDefault();
            }, false);

            clearphoto();
        }


        function clearphoto() {
            var context = canvas.getContext('2d');
            context.fillStyle = "#AAA";
            context.fillRect(0, 0, canvas.width, canvas.height);
            let  data = canvas.toDataURL('image/png');
            photo.setAttribute('src', data);
        }

        function takepicture() {
            var context = canvas.getContext('2d');
            if (width && height) {
                canvas.width = width;
                canvas.height = height;
                context.drawImage(video, 0, 0, width, height);
                var data = canvas.toDataURL('image/png');
                canvas.style.display = "none"
                photo.setAttribute('src', data);

                compare();




            } else {
                clearphoto();
            }
        }

        startDetectBtn.addEventListener("click",function(){
            startup()
            startbutton.style.display = "flex"
            window.scrollBy(0,1000)
        },false)
    })();
