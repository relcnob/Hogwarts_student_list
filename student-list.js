"uses strict";
//declare constants and global variables
const jsonList = "assets/json_files/students.json";
const bloodJson = "assets/json_files/families.json";
const studentArray = [];
const expelledArray = [];
const prefectArray = [];
const inquisitionArray = [];
let searchArray = [];
let bloodArray = [];
// settings
let activeArray = studentArray;
let lastNameArr;
let duplicateLastNameArr;
let filterProperty;
let filterValue;
let sortProperty;
let searchEnabled;
let hackerMode = 0;
// init function on DOMContentLoaded
document.addEventListener("DOMContentLoaded", init);

function init() {
  jsonLoader();

  async function jsonLoader() {
    loadJSON(bloodJson, handleBlood);
    await loadJSON(jsonList, handleData);
    console.log("both JSON files loaded");
  }

  // Event listeners
  document.querySelector("#sort").addEventListener("change", handleSort);
  document.querySelector("#filter").addEventListener("change", handleFilter);
  document
    .querySelector("#searchBar")
    .addEventListener("input", searchStudents);
  // reset view
  document.querySelector("#showAllButton").addEventListener("click", () => {
    searchTerm = false;
    activeArray = studentArray;
    document.querySelector("#filter").value = "default";
    document.querySelector("#sort").value = "default";
    document.querySelector("#searchBar").value = "";
    showStudents(activeArray);
  });
  // hacking mode
  document.addEventListener("keydown", handleHack);
}

function loadJSON(url, callback) {
  fetch(url)
    .then((response) => response.json())
    .then((jsonData) => callback(jsonData));
}

function handleData(data) {
  // cleanup
  data.forEach(splitData);
  findDuplicateLastNames();
  showStudents(activeArray);
}

function handleBlood(data) {
  bloodArray = data;
}

function splitData(student) {
  const nameArray = student.fullname.trim().split(" ");
  const studentGender = capitalize(student.gender);
  const studentHouse = capitalize(student.house);
  const firstName = capitalize(nameArray[0]);
  let lastName = capitalize(nameArray[nameArray.length - 1]);
  if (firstName == lastName) {
    lastName = undefined;
  }
  let middleName, nickName, bloodStatus;
  // check for nickname
  if (
    nameArray.filter((name) => {
      return name.includes(`"`);
    }).length > 0
  ) {
    nickName = capitalize(nameArray[1]);
  }
  // check for middlename
  if (
    nameArray.filter((name) => {
      return name.includes(`"`);
    }).length !== 1 &&
    nameArray.length > 2
  ) {
    middleName = capitalize(nameArray[1]);
  }

  if (bloodArray.half.includes(lastName)) {
    bloodStatus = "Half-blood";
  } else if (bloodArray.pure.includes(lastName)) {
    bloodStatus = "Pure-blood";
  } else {
    bloodStatus = "Muggle";
  }
  // create student Object
  const studentObj = {
    firstName: "",
    lastName: "",
    middleName: "",
    nickName: "",
    studentHouse: "",
    studentGender: "",
    bloodStatus: "",
    isExpelled: "",
    isPrefect: "",
    isInquisition: "",
    bgPosX: "",
    bgPosY: "",
  };
  const studentObject = Object.create(studentObj);
  studentObject.firstName = firstName;
  studentObject.lastName = lastName;
  studentObject.middleName = middleName;
  studentObject.nickName = nickName;
  studentObject.studentHouse = studentHouse;
  studentObject.studentGender = studentGender;
  studentObject.bloodStatus = bloodStatus;
  studentObject.isExpelled = 0;
  studentObject.isPrefect = 0;
  studentObject.isInquisition = 0;
  studentObject.bgPosX = Math.floor(Math.random() * 120);
  studentObject.bgPosY = Math.floor(Math.random() * 120);
  // push student object into studentArray
  studentArray.push(studentObject);
}

function findDuplicateLastNames() {
  lastNameArr = studentArray.map((a) => a.lastName);
  duplicateLastNameArr = lastNameArr.filter(
    (lastName, i, arr) =>
      arr.indexOf(lastName) === i && arr.lastIndexOf(lastName) !== i
  );
  studentArray.forEach(addImageLinks);
}

function addImageLinks(student) {
  // check for duplicate lastnames or missing lastnames
  if (duplicateLastNameArr.includes(student.lastName)) {
    // if there is multiple students with the same last name, should probably check if first letter of first name is matching TODO
    student.studentImage =
      student.lastName.toLowerCase() +
      "_" +
      student.firstName.toLowerCase() +
      ".png";
  } else if (student.lastName !== undefined && student.lastName.includes("-")) {
    // check if it includes a - character
    student.studentImage = `${student.lastName
      .split("-")[1]
      .toLowerCase()}_${student.firstName[0].toLowerCase()}.png`;
  } else if (student.lastName !== undefined) {
    // if last name doesnt have duplicates and is not undefined
    student.studentImage =
      student.lastName.toLowerCase() +
      "_" +
      student.firstName[0].toLowerCase() +
      ".png";
  } else {
    // if last name is missing from student array
    student.studentImage = student.firstName.toLowerCase() + ".png";
  }
  // function in case image is missing from image folder - replaces with imagemissing.png
  // function checkFileExist(urlToFile) {
  //   let xhr = new XMLHttpRequest();
  //   xhr.open("HEAD", urlToFile, false);
  //   xhr.send();
  //   if (xhr.status == "404") {
  //     console.log(`Image missing ... Replacing with default filepath`);
  //     return false;
  //   } else {
  //     return true;
  //   }
  // }
  // let result = checkFileExist(`/assets/student_images/${student.studentImage}`);
  // if (!result) {
  //   student.studentImage = "imagemissing.png";
  // }
}

// Returns capitalized String, including multiple word strings and ones with
function capitalize(str) {
  // remove not needed whitespace and quotation marks
  str = str.trim().replaceAll(`"`, "");
  //   capitalize default name
  const capitalizedName = str[0].toUpperCase() + str.substring(1).toLowerCase();
  if (str.includes("-") || str.includes(" ")) {
    // if string includes hyphens or spaces replace first letter after either or both with a capital
    return capitalizedName.replace(/(\ |\-)(\S)/g, (letter) =>
      letter.toUpperCase()
    );
  } else {
    return capitalizedName;
  }
}

// display students and update About section
function showStudents(array) {
  activeArray = array;
  // uncomment next line to see displayed students
  // console.table(array);
  document.querySelector("#student-list").innerHTML = "";
  array.forEach(displayStudents);
  updateAbout(studentArray);
}
// pass a value and a property to be filtered on
// Value is fx. Gryffindor
// Property is fx. studentHouse
function filterByProperty(value, property) {
  filterValue = value;
  filterProperty = property;
  let notifText = property.split(/(?=[A-Z])/);
  // filtering function
  function isValue(student) {
    if (student[filterProperty] == filterValue) {
      return true;
    } else return false;
  }
  console.log(`filtering: ${filterProperty} = ${filterValue}`);
  // check which array to filter
  if (
    document.querySelector("#searchBar").value !== "" &&
    filterProperty !== "isExpelled"
  ) {
    activeArray = searchArray.filter(isValue);
    showBlueMessage("Filtering search results");
  } else if (
    filterProperty == "isExpelled" &&
    document.querySelector("#searchBar").value !== ""
  ) {
    activeArray = activeArray.filter(isValue);
    showBlueMessage("Filtering search results");
  } else if (
    filterProperty == "isExpelled" &&
    document.querySelector("#searchBar").value == ""
  ) {
    activeArray = expelledArray;
    showBlueMessage("Showing expelled students");
  } else if (filterProperty == "default") {
    activeArray = studentArray.concat(expelledArray);
    showBlueMessage("Showing all students");
  } else {
    activeArray = studentArray.filter(isValue);
    if (property == "studentHouse") {
      showBlueMessage(
        `Filtering ${capitalize(notifText[0])} ${notifText[1]} - ${value}`
      );
    } else if (property == "isExpelled" && value == "1") {
      showBlueMessage(`Showing expelled students`);
    } else if (property == "isExpelled" && value == "0") {
      showBlueMessage(`Showing active students`);
    } else if (property == "isPrefect") {
      showBlueMessage(`Showing Prefects`);
    } else if (property == "isInquisition") {
      showBlueMessage(`Showing Inquisitorial squad`);
    }
  }
  showStudents(activeArray);
}

function sortByProperty(property, dir) {
  let sortDirection;
  if (property !== "default") {
    if (dir == "asc") {
      sortDirection = 1;
    } else {
      sortDirection = -1;
    }
    sortProperty = property;
    console.log(`sorting: ${sortProperty}, ${sortDirection}`);

    function sortStudents(studentA, studentB) {
      if (studentA[sortProperty] < studentB[sortProperty]) {
        return -1 * sortDirection;
      } else {
        return 1 * sortDirection;
      }
    }
  }
  // notification
  let notifText = property.split(/(?=[A-Z])/);
  let direction;
  if (dir == "asc") {
    direction = "A-Z";
  } else if (dir == "desc") {
    direction = "Z-A";
  } else {
    direction = "";
  }
  if (notifText.length == 1) {
    showBlueMessage("Default sorting");
  } else {
    showBlueMessage(
      `Sorting by ${capitalize(notifText[0])} ${capitalize(
        notifText[1]
      )} - ${direction}`
    );
  }
  showStudents(activeArray.sort(sortStudents));
}

function handleSort() {
  // pass sort property and direction in one value and split it
  let options = event.target.value.split(" ");
  sortByProperty(options[0], options[1]);
}

function handleFilter() {
  // get value and property for filtering
  let options = event.target.value.split(" ");
  filterByProperty(options[1], options[0]);
}

function searchStudents() {
  searchTerm = document.querySelector("#searchBar").value.toLowerCase();
  searchEnabled = true;
  searchArray = studentArray.filter(isTerm);

  function isTerm(student) {
    firstName = student.firstName.toLowerCase();
    if (student.lastName != undefined) {
      lastName = student.lastName.toLowerCase();
      fullName = `${firstName} ${lastName}`;
    }
    if (lastName == undefined && firstName.toLowerCase().includes(searchTerm)) {
      // in case last name is undefined
      return true;
    } else if (
      firstName.toLowerCase().includes(searchTerm) ||
      lastName.toLowerCase().includes(searchTerm) ||
      fullName.toLowerCase().includes(searchTerm)
    ) {
      // check first name, last name and combination of both
      return true;
    } else return false;
  }
  console.log(searchTerm);

  if (document.querySelector("#filter").value == "isExpelled 1") {
    console.log("searching expelled");
    activeArray = expelledArray.concat(studentArray).filter(isTerm);
    console.log(activeArray);
    let options = document.querySelector("#filter").value.split(" ");
    console.log("options", options);
    filterByProperty(options[1], options[0]);
  } else if (document.querySelector("#filter").value !== "default") {
    // in case search is active, filter it
    activeArray = searchArray;
    let options = document.querySelector("#filter").value.split(" ");
    filterByProperty(options[1], options[0]);
  } else {
    showStudents(searchArray);
  }
}

function updateAbout() {
  // update about section
  console.log("Updating About...");
  document.querySelector("#total-count").textContent =
    "All Students: " + studentArray.concat(expelledArray).length;
  document.querySelector("#active-count").textContent =
    "Active Students: " + studentArray.length;
  document.querySelector(
    "#display-count"
  ).textContent = `Displayed Students: ${activeArray.length}`;
  document.querySelector(
    "#expelled-count"
  ).textContent = `Expelled Students: ${expelledArray.length}`;
  document.querySelector("#gryffindor-count").textContent = `Gryffindor: ${
    studentArray.filter((student) => {
      if (student.studentHouse == "Gryffindor" && student.isExpelled == 0) {
        return 1;
      } else return 0;
    }).length
  }`;
  document.querySelector("#ravenclaw-count").textContent = `Ravenclaw: ${
    studentArray.filter((student) => {
      if (student.studentHouse == "Ravenclaw" && student.isExpelled == 0) {
        return 1;
      } else return 0;
    }).length
  }`;
  document.querySelector("#hufflepuff-count").textContent = `Hufflepuff: ${
    studentArray.filter((student) => {
      if (student.studentHouse == "Hufflepuff" && student.isExpelled == 0) {
        return 1;
      } else return 0;
    }).length
  }`;
  document.querySelector("#slytherin-count").textContent = `Slytherin: ${
    studentArray.filter((student) => {
      if (student.studentHouse == "Slytherin" && student.isExpelled == 0) {
        return 1;
      } else return 0;
    }).length
  }`;
  document.querySelector(
    "#prefect-count"
  ).textContent = `Prefects: ${prefectArray.length}`;
  document.querySelector(
    "#inquisition-count"
  ).textContent = `Inquisitorial Squad: ${inquisitionArray.length}`;
}

function displayStudents(student) {
  const parent = document.querySelector("#student-list");
  const template = document.querySelector("#student-card").content;
  const clone = template.cloneNode(true);
  const bgPosition = `-${student.bgPosX}px -${student.bgPosY}px`;
  clone.querySelector(".student-card").style.backgroundPosition = bgPosition;
  clone.querySelector(
    ".student-card-student-image"
  ).src = `assets/student_images/${student.studentImage}`;

  clone.querySelector(
    ".student-card-house-image"
  ).src = `assets/house_crests/${student.studentHouse}.png`;
  clone.querySelector(
    ".student-card-house-image"
  ).alt = `${student.studentHouse}`;
  clone.querySelector(
    ".student-card-house-image"
  ).title = `${student.studentHouse}`;
  // check if last name isnt undefined
  if (student.lastName !== undefined) {
    clone.querySelector(
      ".student-card-name"
    ).textContent = `${student.firstName} ${student.lastName}`;
    clone.querySelector(
      ".student-card-student-image"
    ).title = `${student.firstName} ${student.lastName}`;
    clone.querySelector(
      ".student-card-student-image"
    ).alt = `${student.firstName} ${student.lastName}`;
  } else {
    clone.querySelector(
      ".student-card-name"
    ).textContent = `${student.firstName}`;
    clone.querySelector(
      ".student-card-student-image"
    ).title = `${student.firstName}`;
    clone.querySelector(
      ".student-card-student-image"
    ).alt = `${student.firstName}`;
  }
  // check for blood/prefect/inquisition/expelled
  const iconWrapper = clone.querySelector(".student-card-additional-info");
  const detailsIconWrapper = clone.querySelector(".student-details-icons");
  if (student.isPrefect == 1) {
    const prefectIcon = document.createElement(`img`);
    prefectIcon.classList.add(`student-card-prefect-status`);
    prefectIcon.src = "assets/ui_elements/prefect-icon.png";
    prefectIcon.title = "Prefect";
    secondIcon = prefectIcon.cloneNode(true);
    iconWrapper.appendChild(prefectIcon);
    detailsIconWrapper.appendChild(secondIcon);
  }
  if (student.isInquisition == 1) {
    const inquisitionIcon = document.createElement(`img`);
    inquisitionIcon.classList.add(`student-card-inquisitor-status`);
    inquisitionIcon.src = "assets/ui_elements/inquisition-icon.png";
    inquisitionIcon.title = "Inquisition Squad";
    secondIcon = inquisitionIcon.cloneNode(true);
    iconWrapper.appendChild(inquisitionIcon);
    detailsIconWrapper.appendChild(secondIcon);
  }
  if (student.isExpelled == 1) {
    const expelledIcon = document.createElement(`img`);
    expelledIcon.classList.add(`student-card-expelled-status`);
    expelledIcon.src = "assets/ui_elements/expelled-icon.png";
    expelledIcon.title = "Expelled";
    secondIcon = expelledIcon.cloneNode(true);
    iconWrapper.appendChild(expelledIcon);
    detailsIconWrapper.appendChild(secondIcon);
  }
  // blood icons

  if (student.bloodStatus == "Pure-blood") {
    const purebloodIcon = document.createElement(`img`);
    purebloodIcon.src = "assets/ui_elements/pure-blood.png";
    purebloodIcon.classList.add(`student-card-blood-status`);
    purebloodIcon.title = "Pure-blood";
    secondIcon = purebloodIcon.cloneNode(true);
    iconWrapper.appendChild(purebloodIcon);
    detailsIconWrapper.appendChild(secondIcon);
  }
  if (student.bloodStatus == "Half-blood") {
    const halfbloodIcon = document.createElement(`img`);
    halfbloodIcon.src = "assets/ui_elements/half-blood.png";
    halfbloodIcon.classList.add(`student-card-blood-status`);
    halfbloodIcon.title = "Half-blood";
    secondIcon = halfbloodIcon.cloneNode(true);
    iconWrapper.appendChild(halfbloodIcon);
    detailsIconWrapper.appendChild(secondIcon);
  }
  if (student.bloodStatus == "Muggle") {
    const muggleIcon = document.createElement(`img`);
    muggleIcon.src = "assets/ui_elements/muggle.png";
    muggleIcon.classList.add(`student-card-blood-status`);
    muggleIcon.title = "Muggle";
    secondIcon = muggleIcon.cloneNode(true);
    iconWrapper.appendChild(muggleIcon);
    detailsIconWrapper.appendChild(secondIcon);
  }
  // hide and show student details
  clone
    .querySelector(".student-card-details-button")
    .addEventListener("click", showStudentDetails);
  clone
    .querySelector(".close-details")
    .addEventListener("click", hideStudentDetails);
  // student details content
  // house crest
  clone.querySelector(
    ".student-details-house-crest"
  ).src = `assets/house_crests/${student.studentHouse}.png`;
  clone.querySelector(
    ".student-details-house-crest"
  ).alt = `${student.studentHouse}`;
  clone.querySelector(
    ".student-details-house-crest"
  ).title = `${student.studentHouse}`;
  // house ribbon colors
  if (student.studentHouse == "Gryffindor") {
    clone.querySelector(".student-details-ribbon").style.backgroundColor =
      "#b62c22";
    clone.querySelector(".student-details-ribbon").style.borderColor =
      "#e4b773";
    clone.querySelector(
      ".student-details-ribbon img:last-of-type"
    ).style.filter =
      "invert(87%) sepia(39%) saturate(713%) hue-rotate(323deg) brightness(95%) contrast(87%)";
    clone.querySelector(".student-details").style.borderColor = "#e4b773";
  } else if (student.studentHouse == "Ravenclaw") {
    clone.querySelector(".student-details-ribbon").style.backgroundColor =
      "#4785f3";
    clone.querySelector(".student-details-ribbon").style.borderColor =
      "#e0e0e0";
    clone.querySelector(
      ".student-details-ribbon img:last-of-type"
    ).style.filter =
      "invert(100%) sepia(0%) saturate(1574%) hue-rotate(251deg) brightness(83%) contrast(115%)";
    clone.querySelector(".student-details").style.borderColor = "#e0e0e0";
  } else if (student.studentHouse == "Hufflepuff") {
    clone.querySelector(".student-details-ribbon").style.backgroundColor =
      "#ffb63c";
    clone.querySelector(".student-details-ribbon").style.borderColor =
      "#131211";
    clone.querySelector(
      ".student-details-ribbon img:last-of-type"
    ).style.filter =
      "invert(4%) sepia(15%) saturate(249%) hue-rotate(349deg) brightness(97%) contrast(94%)";
    clone.querySelector(".student-details").style.borderColor = "#131211";
  } else if (student.studentHouse == "Slytherin") {
    clone.querySelector(".student-details-ribbon").style.backgroundColor =
      "#34a569";
    clone.querySelector(".student-details-ribbon").style.borderColor =
      "#202020";
    clone.querySelector(
      ".student-details-ribbon img:last-of-type"
    ).style.filter =
      "invert(10%) sepia(0%) saturate(1%) hue-rotate(98deg) brightness(89%) contrast(91%)";
    clone.querySelector(".student-details").style.borderColor = "#202020";
  }

  // student details
  clone.querySelector(
    ".student-details-img"
  ).src = `assets/student_images/${student.studentImage}`;
  clone.querySelector(".student-details-img").alt = `${student.studentImage}`;
  clone.querySelector(
    ".student-details-first-name"
  ).textContent = `First Name: ${student.firstName}`;
  if (student.middleName == undefined) {
    clone.querySelector(".student-details-middle-name").remove();
  } else {
    clone.querySelector(
      ".student-details-middle-name"
    ).textContent = `Middle Name: ${student.middleName}`;
  }
  if (student.lastName == undefined) {
    clone.querySelector(
      ".student-details-last-name"
    ).textContent = `Last Name: Missing Data`;
  } else {
    clone.querySelector(
      ".student-details-last-name"
    ).textContent = `Last Name: ${student.lastName}`;
  }
  if (student.nickName == undefined) {
    clone.querySelector(".student-details-nick-name").remove();
  } else {
    clone.querySelector(
      ".student-details-nick-name"
    ).textContent = `Nick Name: ${student.nickName}`;
  }
  clone.querySelector(
    ".student-details-house"
  ).textContent = `House: ${student.studentHouse}`;
  clone.querySelector(
    ".student-details-blood-status"
  ).textContent = `Blood Status: ${student.bloodStatus}`;
  // admin panel event listeners
  clone
    .querySelector(".admin-add-prefect")
    .addEventListener("click", addAsPrefect);
  clone
    .querySelector(".admin-add-inquisitor")
    .addEventListener("click", addAsInquisitor);
  clone.querySelector(".admin-expel").addEventListener("click", expelStudent);
  clone
    .querySelector(".admin-remove-prefect")
    .addEventListener("click", removePrefect);

  clone
    .querySelector(".admin-remove-inquisitor")
    .addEventListener("click", removeInquisitor);

  // append student card
  parent.appendChild(clone);
}

// hide/show student details
function showStudentDetails() {
  const studentCard = this.parentElement;
  studentCard
    .querySelector(".student-details-wrapper")
    .classList.add("show-student-details");
}

function hideStudentDetails() {
  const studentDetails = this.parentElement.parentElement.parentElement;
  studentDetails.classList.remove("show-student-details");
}
// ADMIN PANEL functions

function addAsPrefect() {
  const parent = this.parentElement.parentElement;
  parent.parentElement.classList.remove("show-student-details");
  const firstNameField = parent
    .querySelector(".student-details-first-name")
    .textContent.split(" ")[2];
  const lastNameField = parent
    .querySelector(".student-details-last-name")
    .textContent.split(" ")[2];

  // lastNameField == "Missing" // leanne or other missing lastnames
  studentArray.filter((student) => {
    if (
      (student.firstName == firstNameField &&
        student.lastName == lastNameField) ||
      (student.firstName == firstNameField && lastNameField == "Missing")
    ) {
      let prefectCount = prefectArray.filter(
        (prefect) => prefect.studentHouse == student.studentHouse
      );
      let prefectGender = prefectCount.filter(
        (prefect) => prefect.studentGender == student.studentGender
      ).length;
      console.log(`Current Prefects: ${prefectCount.length}`);
      if (prefectCount.length < "2" && prefectGender < "1") {
        student.isPrefect = 1;
        prefectArray.push(student);
        showGreenMessage("Student added as Prefect");
      } else {
        showRedMessage(`Too many prefects in ${student.studentHouse}`);
      }
    }
  });
  setTimeout(() => {
    showStudents(activeArray);
  }, 1000);
}

function addAsInquisitor() {
  const parent = this.parentElement.parentElement;
  parent.parentElement.classList.remove("show-student-details");
  const firstNameField = parent
    .querySelector(".student-details-first-name")
    .textContent.split(" ")[2];
  const lastNameField = parent
    .querySelector(".student-details-last-name")
    .textContent.split(" ")[2];
  studentArray.filter((student) => {
    if (
      (student.firstName == firstNameField &&
        student.lastName == lastNameField) ||
      (student.firstName == firstNameField && lastNameField == "Missing")
    ) {
      // check if inquisition requirements are met
      if (
        student.bloodStatus == "Pure-blood" ||
        (student.studentHouse == "Slytherin" && student.isInquisition !== 1)
      ) {
        student.isInquisition = 1;
        showGreenMessage("Student added to Inquisitorial Squad");
        inquisitionArray.push(student);
      } else if (
        student.bloodStatus !== "Pure-blood" &&
        student.studentHouse !== "Slytherin"
      ) {
        showRedMessage(
          "Only Pure-blooded or Slytherin students can join Inquisitorial Squad"
        );
      }
      if (
        hackerMode == 1 &&
        (student.studentHouse == "Slytherin" || student.isInquisition == 1)
      ) {
        // remove inquisitor status after some time
        setTimeout(() => {
          student.isInquisition = 0;
          showRedMessage("Nice try");
          showStudents(activeArray);
        }, 4000);
      }
    }
  });
  setTimeout(() => {
    showStudents(activeArray);
  }, 1000);
}

function removePrefect() {
  const parent = this.parentElement.parentElement;
  parent.parentElement.classList.remove("show-student-details");
  const firstNameField = parent
    .querySelector(".student-details-first-name")
    .textContent.split(" ")[2];
  const lastNameField = parent
    .querySelector(".student-details-last-name")
    .textContent.split(" ")[2];
  studentArray.filter((student) => {
    if (
      (student.firstName == firstNameField &&
        student.lastName == lastNameField) ||
      (student.firstName == firstNameField && lastNameField == "Missing")
    ) {
      student.isPrefect = 0;
      let prefectIndex = prefectArray.indexOf(student);
      prefectArray.splice(prefectIndex, 1);
    }
  });
  setTimeout(() => {
    showStudents(activeArray);
  }, 1000);
  showRedMessage("Prefect Removed");
}
function removeInquisitor() {
  const parent = this.parentElement.parentElement;
  parent.parentElement.classList.remove("show-student-details");
  const firstNameField = parent
    .querySelector(".student-details-first-name")
    .textContent.split(" ")[2];
  const lastNameField = parent
    .querySelector(".student-details-last-name")
    .textContent.split(" ")[2];
  studentArray.filter((student) => {
    if (
      (student.firstName == firstNameField &&
        student.lastName == lastNameField &&
        student.isInquisition == 1) ||
      (student.firstName == firstNameField &&
        lastNameField == "Missing" &&
        student.isInquisition == 1)
    ) {
      student.isInquisition = 0;
      let inquisitionIndex = inquisitionArray.indexOf(student);
      inquisitionArray.splice(inquisitionIndex, 1);
      showRedMessage("Student removed from Inquisitorial Squad");
    }
  });
  let filterValues = document.querySelector("#filter").value.split(" ");
  if (filterValues[0] !== "default") {
    filterByProperty(filterValues[1], filterValues[0]);
    return 0;
  }
  setTimeout(() => {
    showStudents(activeArray);
  }, 1000);
}

function expelStudent() {
  const parent = this.parentElement.parentElement;
  parent.parentElement.classList.remove("show-student-details");
  const firstNameField = parent
    .querySelector(".student-details-first-name")
    .textContent.split(" ")[2];
  const lastNameField = parent
    .querySelector(".student-details-last-name")
    .textContent.split(" ")[2];

  studentArray.filter((student) => {
    if (student.firstName == "Fryderyk" && hackerMode == 1) {
      showBlueMessage("Nice try");
      showGreenMessage("Nice try");
    } else if (
      (student.firstName == firstNameField &&
        student.lastName == lastNameField &&
        student.isExpelled !== 1) ||
      (student.firstName == firstNameField &&
        lastNameField == "Missing" &&
        student.isExpelled !== 1)
    ) {
      student.isExpelled = 1;
      student.isInquisition = 0;
      student.isPrefect = 0;
      expelledArray.push(student);
      let expelledIndex = studentArray.indexOf(student);
      let prefectIndex = prefectArray.indexOf(student);
      let inquisitionIndex = inquisitionArray.indexOf(student);
      studentArray.splice(expelledIndex, 1);
      prefectArray.splice(prefectIndex, 1);
      inquisitionArray.splice(inquisitionIndex, 1);
      showRedMessage("Student Expelled");
    }
  });
  // check if removed student isnt fitting
  let filterValues = document.querySelector("#filter").value.split(" ");
  if (filterValues[0] !== "default") {
    filterByProperty(filterValues[1], filterValues[0]);
    return 0;
  }
  setTimeout(() => {
    showStudents(activeArray);
  }, 1000);
}

// notification functions
function showRedMessage(text) {
  redNotif = document.querySelector(".notification-red");
  redNotif.textContent = text;
  redNotif.classList.add("show-notification");
  setTimeout(() => {
    redNotif.classList.remove("show-notification");
  }, 4000);
}

function showGreenMessage(text) {
  greenNotif = document.querySelector(".notification-green");
  greenNotif.textContent = text;
  greenNotif.classList.add("show-notification");
  setTimeout(() => {
    greenNotif.classList.remove("show-notification");
  }, 4000);
}

function showBlueMessage(text) {
  blueNotif = document.querySelector(".notification-blue");
  blueNotif.textContent = text;
  blueNotif.classList.add("show-notification");
  setTimeout(() => {
    blueNotif.classList.remove("show-notification");
  }, 4000);
}

function handleHack(e) {
  const searchBar = document.querySelector("#searchBar");
  if (
    e.key == "h" &&
    hackerMode !== 1 &&
    document.activeElement !== searchBar
  ) {
    hackTheSystem();
  }
}
// hacking function
function hackTheSystem() {
  if (hackerMode != 1) {
    console.log("Hacker mode engaged");
    hackerMode = 1;
    // hacker overlay
    document.querySelector(".hacker-overlay").classList.add("showHackOverlay");
    setTimeout(() => {
      document.querySelector(".hacker-loader").classList.add("startLoading");
    }, 500);
    document
      .querySelector(".loader-message")
      .addEventListener("animationend", () => {
        console.log("finished loading");
        document
          .querySelector(".hacker-overlay")
          .classList.remove("showHackOverlay");
        insertHacker();
        document.querySelector("body").classList.add("hacked");
      });

    // hacker object for insert
    function insertHacker() {
      const hackerObj = {
        firstName: "Fryderyk",
        lastName: "Boncler",
        middleName: undefined,
        nickName: undefined,
        studentHouse: "Gryffindor",
        studentGender: "Boy",
        studentImage: "me.png",
        bloodStatus: "Pure-blood",
        isExpelled: "0",
        isPrefect: "1",
        isInquisition: "1",
        bgPosX: "",
        bgPosY: "",
      };
      const hackerObject = Object.create(hackerObj);
      hackerObject.firstName;
      hackerObject.lastName;
      hackerObject.middleName;
      hackerObject.nickName;
      hackerObject.studentHouse;
      hackerObject.studentGender;
      hackerObject.bloodStatus;
      hackerObject.isExpelled;
      hackerObject.isPrefect;
      hackerObject.isInquisition;
      hackerObject.bgPosX = Math.floor(Math.random() * 120);
      hackerObject.bgPosY = Math.floor(Math.random() * 120);
      // push hacker object into studentArray, unshift so that its first
      studentArray.unshift(hackerObject);
      showStudents(activeArray);
    }
    // hack the blood status
    studentArray.forEach((student) => {
      if (
        student.bloodStatus == "Pure-blood" &&
        hackerMode == 1 &&
        student.firstName !== "Fryderyk"
      ) {
        let newBlood = Math.floor(Math.random() * 2 + 1);
        if (newBlood == 1) {
          student.bloodStatus = "Muggle";
        } else if (newBlood == 2) {
          student.bloodStatus = "Half-blood";
        }
      } else if (student.bloodStatus !== "Pure-blood" && hackerMode == 1) {
        student.bloodStatus = "Pure-blood";
        console.log(student.bloodStatus);
      }
    });
  } else {
    // in case somebody tries to activate it twice
    console.log("Hacking already enabled");
  }
}
