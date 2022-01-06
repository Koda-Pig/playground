/* Navigation dropdown */
function myFunction() {
    var x = document.getElementById("topNavigation");
    if (x.className === "navigation") {
      x.className += " responsive";
    } else {
      x.className = "navigation";
    }
  }

/* Change logo colour on click */
let myImage = document.querySelector('img');
myImage.onclick = function() {
    let mySrc = myImage.getAttribute('src');
    if(mySrc === 'pig.png') {
      myImage.setAttribute('src','pig-blue.png');
    } else if (mySrc === 'pig-blue.png') {
      myImage.setAttribute('src','pig-purple.png');
    } else if (mySrc === 'pig-purple.png') {
      myImage.setAttribute('src','pig-green.png');
    } else {
      myImage.setAttribute('src','pig.png');
    }
}

/* personalised welcome message */
let myButton = document.querySelector('button');
let myHeading = document.querySelector('h2'); // takes references to the new button and the heading, storing each inside variables

function setUserName() {
  let myName = prompt('put yo damn name in:');
  if(!myName) {
    setUserName();
  } else
  localStorage.setItem('name', myName);
  myHeading.textContent = myName + ", you're a fuckin twat";
}

if(!localStorage.getItem('name')) {
  setUserName();
} else {
  let storedName = localStorage.getItem('name');
  myHeading.textContent = myName + ", you're a fuckin twat";
}

myButton.onclick = function() {
  setUserName();
}
