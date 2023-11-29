const middleDiv = document.querySelectorAll('.middle-div')
const state = document.querySelector('#state')

let flag = true

middleDiv.forEach((div) => {
  div.addEventListener('click', () => { 
    middleDiv.forEach((div) => {
      div.classList.remove('active')
    })
    if(flag){
      state.innerHTML = "on"
      flag = !flag
    }else{
      state.innerHTML = "off"
      flag = !flag  
    }
    div.classList.add('active')
  })
})
