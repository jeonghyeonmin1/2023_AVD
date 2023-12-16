const URL = "https://teachablemachine.withgoogle.com/models/BidPy0cIW/";
const backBtn = document.querySelector(".back-btn")
const faceDec = document.querySelector("#face-dec")
const rightCanvas = document.querySelector("#right-canvas")
const leftCanvas = document.querySelector("#left-canvas")
const main1 = document.querySelector("#camvas-div")
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
let numCount = 0

const middleDiv = document.querySelectorAll('.middle-div')
const state = document.querySelector('#state')

let flag1 = true

askNotificationPermission();

function makeNoti() {   
  // 사용자 응답에 따라 단추를 보이거나 숨기도록 설정
  if (Notification.permission === "denied" || Notification.permission === "default") {
    alert("알림이 차단된 상태입니다. 알림 권한을 허용해주세요.");
  } else {

    let notification = new Notification("test", { // "test" => 제목
      body: "눈을 깜빡이세요.", // 메세지
      icon: `../img/eye.png`,
    });


    //알림 클릭 시 이벤트
    // notification.addEventListener("click", () => {
    //  window.open('https://www.naver.com/');
    // });

  }
}

function askNotificationPermission() {
  console.log("권한 묻기");
  // 권한을 실제로 요구하는 함수
  function handlePermission(permission) {
    // 사용자의 응답에 관계 없이 크롬이 정보를 저장할 수 있도록 함
    if (!("permission" in Notification)) {
      Notification.permission = permission;
    }
  }

  // 브라우저가 알림을 지원하는지 확인
  if (!("Notification" in window)) {
    console.log("이 브라우저는 알림을 지원하지 않습니다.");
  } else {
    if (checkNotificationPromise()) {
      Notification.requestPermission().then((permission) => {
        handlePermission(permission);
      });
    } else {
      Notification.requestPermission(function (permission) {
        handlePermission(permission);
      });
    }
  }
}

function checkNotificationPromise() {
  try {
    Notification.requestPermission().then();
  } catch (e) {
    return false;
  }

  return true;
}

middleDiv.forEach((div) => {
  div.addEventListener('click', () => { 
    middleDiv.forEach((div) => {
      div.classList.remove('active')
    })
    if(flag1){
      state.innerHTML = "on"
      flag = !flag
      flag1 = !flag1
      numCount = 0
      setInterval(() => {
        if(Math.floor(numCount/14) <= 10){
          console.log("알림")
          makeNoti()
            
        }
        numCount = 0
    }, 1000 * 20);   //시간 설정하는 부분
    
    }else{
      state.innerHTML = "off"
      flag = !flag
      flag1 = !flag1
      numCount = 0
    }
    div.classList.add('active')
  })
})


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

const numCountDiv = document.querySelectorAll(".count")



const predict = async () => {
    const prediction = await model.predict(leftCanvas);
    for (let i = 0; i < maxPredictions; i++) {
        let classPrediction = eyes[i] + " : " + Math.floor(prediction[i].probability * 100) + "%" + "&nbsp;"
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
    let countdown = Math.floor(numCount/15)

    console.log(countdown)

    
    numCountDiv[0].innerHTML = countdown
    numCountDiv[1].innerHTML = countdown


    if (faceDec.dataset.num === "1" && flag) {
        classFocus++
        uptime1++
    
        if(opentime > 10){
            eyeClose = eyeClose + prediction[0].probability
        }else if(closetime < 30){
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