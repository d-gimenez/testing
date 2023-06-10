// We can define here the behavior for the elements on the website...

// URL for POST requests
const dalleEndpoint = 'https://api.openai.com/v1/images/generations';

// Fetch DOM elements
const reqButton = document.getElementById('button-request');
const reqStatus = document.getElementById('request-status');
const instructions = document.getElementById("instructions");

//TO-DO: IS THIS NEEDED?
const imgContainer = document.getElementById("image-container");

//3.1 CREATE HTML Elements
linebreak = document.createElement("br");

// Instructions change with requests
let counter = 0;
let initialPrompt; // Variable to store the initial prompt


// Attach click behavior to the button
reqButton.onclick = function () {

  reqButton.disabled = true; 

  // TO-DO: Change to animation, change to what step was completed in the game
  // Give some feedback to user
  reqStatus.innerHTML = "Request started...";

  /**
   * not needed we are using localStorage data
   * 
   // remove data not needed to be fetch
   const key = document.getElementById('api-key').value;
   const count = Number(document.getElementById('image-count').value);
   const radios = document.getElementsByName('image-size');
   document.getElementById("num-players").value = numPlayers; 
   */
  
  // Fetch image request data
  const prompt = document.getElementById('text-prompt').value;

  // Retrieve the settings from localStorage - apiKey, imageCount, imageSize available
  var sessionName = localStorage.getItem("sessionName");
  var numPlayers = localStorage.getItem("numPlayers");
  var key = localStorage.getItem("apiKey"); //renamed
  var count = Number(localStorage.getItem("imageCount")); //renamed & count may be need to be moved to Number
  var radios = localStorage.getItem("imageSize"); //renamed

  //3.3 testing & validation
  console.log("retrieved variables...")
  console.log("session-name --> " + sessionName)
  console.log("num-players --> " + numPlayers)
  console.log("apiKey --> " + key)
  console.log("imageCount --> " + count)
  console.log("imageSize --> " + radios)

  /**
   * updated radio to include have the format Dall-e needs
   * 
   let size;
   for (let i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      size = Number(radios[i].value);
      break;
    }
   }
   */


  // Form the request body according to the API:
  // https://beta.openai.com/docs/api-reference/images/create
  const reqBody = {
    prompt: prompt,
    n: count,
    size: radios + "x" + radios,
    response_format: 'url',
  };

  // Form the data for a POST request:
  const reqParams = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify(reqBody)
  }

  // Use the Fetch API to do an async POST request to OpenAI:
  // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
  fetch(dalleEndpoint, reqParams)
    .then(res => res.json())
    .then(json => addImages(json, prompt))
    .catch(error => {
        reqStatus.innerHTML = error;
        reqButton.disabled = false;
    });


  // Update instructions 
  counter++;
  if (counter === 1) {
    document.getElementById("instructions").innerHTML = "Review the image/s generated together. A player in the group will change the original sentence without other players seeing it and generate a new Request";
  } else if (counter === 2) {
    document.getElementById("instructions").innerHTML = "What word changed from the original sentence?";
  } else if (counter === 3) {
    document.getElementById("instructions").innerHTML = "Give the winner/s the point deserved. Create a sentence that will generate an image using Dall-E. Each player should provide one word at a time.";
    counter = 0;
  }

}

/**
 * TO=DO's
 * Add checkAnswer() funciton
 * Add restart() function
 */




/**
 * Adds images on the page 
 * @param {Obj} jsonData The Dall-E API response
 * @param {String} generatedPrompt The original prompt that generated the images
 */
function addImages(jsonData, generatedPrompt) {
    
  // console.log(jsonData);
  reqButton.disabled = false;

  // Handle a possible error response from the API
  if (jsonData.error)
  {
    reqStatus.innerHTML = 'ERROR: ' + jsonData.error.message;
    return;
  }
  
  // Parse the response object, deserialize the image data, 
  // and attach new images to the page.
    //const container = document.getElementById('image-container');
  
  //create new container
  const container = document.createElement("div"); // Create a new container element
  const legend = document.createElement("p"); //create legend for container
  const legendBtn = document.createElement("button"); // create a button for toggling the legend
  const legendNumber = document.querySelectorAll(".container").length + 1; // determine the number of the new legend
  //legend.id = "legend-id" + counter;
  //legendBtn.id = "legendBtn-id" + counter;
  legend.innerHTML = `${legendNumber}. ${generatedPrompt}`; //pass in prompt to the legend


  legendBtn.innerHTML = "Hide / Unhide Prompt"; // set the text content of the button
  legendBtn.classList.add("legend-toggle-btn"); // add a class to the button for styling

  container.appendChild(legend);

  //3.1 Hide Legend by default
  legend.style.display = "none";


  container.appendChild(legendBtn); // add the button to the container
  
  //3.1: add linebreak to split button and images
  container.appendChild(linebreak);

  container.classList.add("container");

  
  
  //TO-DO: insert up top: document.body.appendChild(container); --> insertBefore
  document.body.appendChild(container);

  // Append a line break to the container
  // to consistenly append a line break between button and the img elements
  container.appendChild(document.createElement("br"));

  for (let i = 0; i < jsonData.data.length; i++) {
    let imgData = jsonData.data[i];
    let img = document.createElement('img');
    img.src = imgData.url;
    img.alt = generatedPrompt;
    
    // TO-DO: Create Ramdomizer Logi
      //container.prepend(img); // to show it earlier
        //container.append(img); // to show it after

    //Add to new container
    //container.insertBefore(img, _____); // Add the image to the new container up top
    container.appendChild(img); // Add the image to the new container
  }

  reqStatus.innerHTML = jsonData.data.length +' images received for the prompt provided';

  // attach the toggle behavior to the button
  legendBtn.addEventListener("click", function() {

    // finds all the img elements inside the container element and stores them in the images constant.
    const images = container.querySelectorAll("img");
    if (legend.style.display !== "none") {
      legend.style.display = "none";
    } else {
      legend.style.display = "block";
    }
  });

  if (counter === 1) {
    initialPrompt = generatedPrompt;
    console.log("counter: " + counter)
    console.log("initialPrompt: " + initialPrompt)
    console.log("generatedPrompt: " + generatedPrompt)
    
    //3.2: display legend
    legend.style.display = "block";

  }
  else if (counter === 2) {
    console.log("counter: " + counter)
    console.log("initialPrompt: " + initialPrompt)
    console.log("generatedPrompt: " + generatedPrompt)

    createGuessForm(initialPrompt, generatedPrompt);
  }
}

/**
 * 3.2 Creates Guess Form element
 * @param {String} initialPrompt The initial prompt to pre-fill the input field
 * @param {String} generatedPrompt The last prompt generated that needs to be guessed

 */
function createGuessForm(initialPrompt, generatedPrompt) {
  // Create a div element with the "container" class
  const container = document.createElement('div');
  container.classList.add('container');

  // Create an h2 element
  const heading = document.createElement('h2');
  heading.textContent = 'Guess the Prompt';

  // Create a paragraph element
  const paragraph = document.createElement('p');
  paragraph.textContent = 'What do you think the prompt is? Change one word of the original prompt and submit your guess:';

  // Create a form element
  const form = document.createElement('form');

  // Create a label element
  const label = document.createElement('label');
  label.setAttribute('for', 'guess');
  label.textContent = 'Guess:';

  // Create an input element
  const input = document.createElement('input');
  input.setAttribute('type', 'text');
  input.setAttribute('id', 'guess');
  input.setAttribute('name', 'guess');
  input.setAttribute('value', initialPrompt);

  // Create a p element for spacing
  const spacing = document.createElement('p');

  // Create an input element of type "submit"
  const submitBtn = document.createElement('input');
  submitBtn.setAttribute('type', 'submit');
  submitBtn.setAttribute('value', 'Submit');

  // Append the elements to the container div
  container.appendChild(heading);
  container.appendChild(paragraph);
  form.appendChild(label);
  form.appendChild(input);
  form.appendChild(spacing);
  form.appendChild(submitBtn);
  container.appendChild(form);

  // Create a style element for the CSS
  const style = document.createElement('style');
  style.textContent = 'input[type="text"]#guess { width: 1200px; }';

  // Append the style element to the document's head
  document.head.appendChild(style);

  // Append the container to the document body
  document.body.appendChild(container);

  // Attach event listener to form submit
  form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission

    const guess = input.value.trim();
    if (guess === generatedPrompt) {
      console.log("guess: " + guess)
      console.log("initialPrompt is not used: " + initialPrompt)
      console.log("generatedPrompt: " + generatedPrompt)
      // Display "Your guess was correct" message
      displayMessage("Your guess was correct!");

      //TO-DO: add a point to the winner

    } else {
      // Display "That was not quite right" message
      console.log("guess: " + guess)
      console.log("initialPrompt is not used: " + initialPrompt)
      console.log("generatedPrompt: " + generatedPrompt)
      displayMessage("That was not quite right...");
      displayMessage("The correct guess was: " + generatedPrompt);
    }
      //TO-DO: add a point to the winner
  });

  // Function to display a message on the screen
  function displayMessage(message) {
    // Check if message element already exists, if yes, remove it
    const messageElement = document.getElementById('message');
    if (messageElement) {
      messageElement.remove();
    }

    // Create a new p element for the message
    const messageParagraph = document.createElement('p');
    messageParagraph.setAttribute('id', 'message');
    messageParagraph.textContent = message;

    // Append the message element to the container div
    container.appendChild(messageParagraph);
  }
}
