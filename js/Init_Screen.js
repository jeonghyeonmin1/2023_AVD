const superDiv = document.querySelector('#super-div');
const main2 = document.querySelector('#main2');

superDiv.addEventListener('click', (e) => {
  superDiv.classList.add('display-none');
  main2.classList.remove('display-none');
});