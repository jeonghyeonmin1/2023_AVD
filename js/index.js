const URL = "https://teachablemachine.withgoogle.com/models/BidPy0cIW/";
const backBtn = document.querySelector(".back-btn")
const faceDec = document.querySelector("#face-dec")
const rightCanvas = document.querySelector("#right-canvas")
const leftCanvas = document.querySelector("#left-canvas")
const startBtn = document.querySelector(".start-btn")
const chartContainers = document.querySelectorAll(".chart-container")
const iframePractice = document.querySelector("#iframe-practice")
const mainIframe = document.querySelector(".iframe")
const chartPer = document.querySelectorAll("#chart-per")
const resetBtn = document.querySelector("#reset-btn")
const logOutBtn = document.querySelectorAll(".log-out-btn")
const endBtn = document.querySelector(".end-btn")
const main1 = document.querySelector("#main1")
const main2 = document.querySelector("#main2")
const canvasDiv = document.querySelector(".canvas-div")
let model, labelContainer, maxPredictions;
let classFocusAve = null
let eyesOpenAve = null
let eyesCloseAve = null
let uptime = 0
let uptime1 = 0
let eyeOpen = 0
let eyeClose = 0
let classFocus = 0
let flag = false
let opentime = 0
let closetime = 0

const eyes = ["eye open", "eye close"]

const init = async () => {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();
    window.requestAnimationFrame(loop);
    labelContainer = document.querySelector("#label")
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("span"));
    }
}

const loop = async () => {
    await predict();
    window.requestAnimationFrame(loop);
}

// const 
let numCount = 0

const predict = async () => {
    const prediction = await model.predict(leftCanvas);
    for (let i = 0; i < maxPredictions; i++) {
        let classPrediction = eyes[i] + " : " + Math.floor(prediction[i].probability * 100) + "%" + "&nbsp;"
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }

    numCountDiv.innerHTML = Math.floor(numCount/12)

    if (faceDec.dataset.num === "1" && flag) {
        classFocus++
        uptime1++
        if(opentime > 10){
            eyeClose = eyeClose + prediction[0].probability
        }else if(closetime < 100){
            numCount++
            eyeOpen = eyeOpen + prediction[0].probability
        }
        if (closetime > 30) {
            eyeClose = eyeClose + prediction[1].probability
        }
    }

    if(faceDec.dataset.num === "0"){
        rightCanvas.classList.remove("green-border")
        leftCanvas.classList.remove("green-border")
        rightCanvas.classList.remove("red-border")
        leftCanvas.classList.remove("red-border")
        rightCanvas.classList.add("white-border")
        leftCanvas.classList.add("white-border")
    } else if(prediction[0].probability > 0.8){
        rightCanvas.classList.add("green-border")
        leftCanvas.classList.add("green-border")
        rightCanvas.classList.remove("red-border")
        leftCanvas.classList.remove("red-border")
        rightCanvas.classList.remove("white-border")
        leftCanvas.classList.remove("white-border")
    } else if(prediction[0].probability < 0.8){
        rightCanvas.classList.add("red-border")
        leftCanvas.classList.add("red-border")
        rightCanvas.classList.remove("green-border")
        leftCanvas.classList.remove("green-border")
        rightCanvas.classList.remove("white-border")
        leftCanvas.classList.remove("white-border")
    }

    if (flag) {
        opentime++
        closetime++
        uptime++
    }
    if (prediction[0].probability > 0.8) {
        closetime = 0
    }else{
        opentime = 0
    }
    
    classFocusAve = Math.floor(classFocus / uptime * 100)
    eyesOpenAve = 100 - Math.floor(eyeClose / uptime1 * 100)
    eyesCloseAve = Math.floor(eyeClose / uptime1 * 100)
}

init()