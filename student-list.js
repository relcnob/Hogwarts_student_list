"uses strict";
//declare constants and global variables
const jsonList = "https://petlatkea.dk/2021/hogwarts/students.json";
const bloodJson = "https://petlatkea.dk/2021/hogwarts/families.json";
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
  loadJSON(bloodJson, handleBlood);
  loadJSON(jsonList, handleData);
  document.querySelector("#sort").addEventListener("change", handleSort);
  document.querySelector("#filter").addEventListener("change", handleFilter);
  document
    .querySelector("#searchBar")
    .addEventListener("input", searchStudents);
  document.querySelector("#showAllButton").addEventListener("click", () => {
    searchTerm = false;
    activeArray = studentArray;
    document.querySelector("#filter").value = "default";
    document.querySelector("#sort").value = "default";
    document.querySelector("#searchBar").value = "";
    showStudents(activeArray);
  });
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
    fistName: "",
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
    // if there is multiple students with the same last name, should probably check if first letter of first name is matching TODO (?)
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
  function checkFileExist(urlToFile) {
    let xhr = new XMLHttpRequest();
    xhr.open("HEAD", urlToFile, false);
    xhr.send();
    if (xhr.status == "404") {
      console.log(`Image missing ... Replacing with default filepath`);
      return false;
    } else {
      return true;
    }
  }
  let result = checkFileExist(`/assets/student_images/${student.studentImage}`);
  if (!result) {
    student.studentImage = "imagemissing.png";
  }
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
  // filtering function
  function isValue(student) {
    if (student[filterProperty] == filterValue) {
      return true;
    } else return false;
  }
  console.log(`filtering: ${filterProperty} = ${filterValue}`);
  if (document.querySelector("#searchBar").value !== "") {
    activeArray = searchArray.filter(isValue);
  } else if (filterProperty == "isExpelled") {
    activeArray = expelledArray;
  } else if (filterProperty == "default") {
    activeArray = studentArray.concat(expelledArray);
  } else {
    activeArray = studentArray.filter(isValue);
  }

  // }

  showStudents(activeArray);
}

function sortByProperty(property, dir) {
  if (property !== "default") {
    if (dir == "asc") {
      sortDirection = 1;
    } else {
      sortDirection = -1;
    }
    sortProperty = property;
    console.log(`sorting: ${sortProperty}, ${sortDirection}`);
    // if (document.querySelector("#filter").value == "default") {
    //   activeArray = activeArray.concat(expelledArray);
    // }
    // if (searchEnabled == true) {
    //   activeArray = activeArray.sort(sortStudents);
    // } else if (document.querySelector("#filter").value != "default") {
    //   console.log(document.querySelector("#filter").value);
    //   activeArray = activeArray.sort(sortStudents);
    //   showStudents(activeArray);
    // } else {
    //   activeArray = activeArray.concat(expelledArray).sort(sortStudents);
    // }
    // activeArray = activeArray.sort(sortStudents)
    // sorting function
    function sortStudents(studentA, studentB) {
      if (studentA[sortProperty] < studentB[sortProperty]) {
        return -1 * sortDirection;
      } else {
        return 1 * sortDirection;
      }
    }
  }
  showStudents(activeArray.sort(sortStudents));
}

function handleSort() {
  // pass sort property and direction in one value and split it
  let options = event.target.value.split(" ");
  sortByProperty(options[0], options[1]);
}

function handleFilter() {
  let options = event.target.value.split(" ");
  filterByProperty(options[1], options[0]);
}

function searchStudents() {
  searchTerm = document.querySelector("#searchBar").value;
  searchEnabled = true;
  searchArray = studentArray.filter(isTerm);

  function isTerm(student) {
    firstName = student.firstName.toLowerCase();
    if (student.lastName != undefined) {
      lastName = student.lastName.toLowerCase();
    }
    if (lastName == undefined && firstName.toLowerCase().includes(searchTerm)) {
      return true;
    } else if (
      firstName.toLowerCase().includes(searchTerm) ||
      lastName.toLowerCase().includes(searchTerm)
    ) {
      return true;
    } else return false;
  }
  if (document.querySelector("#filter").value !== "default") {
    activeArray = searchArray;
    let options = document.querySelector("#filter").value.split(" ");
    filterByProperty(options[1], options[0]);
  } else {
    showStudents(searchArray);
  }
}

function updateAbout(array) {
  console.log("Updating About...");
  document.querySelector("#total-count").textContent =
    "Active Students: " + studentArray.length;
  document.querySelector(
    "#display-count"
  ).textContent = `Displayed Students: ${array.length}`;
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
    iconWrapper.appendChild(prefectIcon);
    // detailsIconWrapper.appendChild(prefectIcon);
  }
  if (student.isInquisition == 1) {
    const inquisitionIcon = document.createElement(`img`);
    inquisitionIcon.classList.add(`student-card-inquisitor-status`);
    inquisitionIcon.src = "assets/ui_elements/inquisition-icon.png";
    inquisitionIcon.title = "Inquisition Squad";
    iconWrapper.appendChild(inquisitionIcon);
    // detailsIconWrapper.appendChild(inquisitionIcon);
  }
  if (student.isExpelled == 1) {
    const expelledIcon = document.createElement(`img`);
    expelledIcon.classList.add(`student-card-expelled-status`);
    expelledIcon.src = "assets/ui_elements/expelled-icon.png";
    expelledIcon.title = "Expelled";
    iconWrapper.appendChild(expelledIcon);
    // detailsIconWrapper.appendChild(expelledIcon);
  }
  // blood icons
  if (student.bloodStatus == "Pure-blood") {
    const purebloodIcon = document.createElement(`img`);
    purebloodIcon.src = "assets/ui_elements/pure-blood.png";
    purebloodIcon.classList.add(`student-card-blood-status`);
    purebloodIcon.title = "Pure-blood";
    iconWrapper.appendChild(purebloodIcon);
    // detailsIconWrapper.appendChild(purebloodIcon);
  }
  if (student.bloodStatus == "Half-blood") {
    const halfbloodIcon = document.createElement(`img`);
    halfbloodIcon.src = "assets/ui_elements/half-blood.png";
    halfbloodIcon.classList.add(`student-card-blood-status`);
    halfbloodIcon.title = "Half-blood";
    iconWrapper.appendChild(halfbloodIcon);
    // detailsIconWrapper.appendChild(halfbloodIcon);
  }
  if (student.bloodStatus == "Muggle") {
    const muggleIcon = document.createElement(`img`);
    muggleIcon.src = "assets/ui_elements/muggle.png";
    muggleIcon.classList.add(`student-card-blood-status`);
    muggleIcon.title = "Muggle";
    iconWrapper.appendChild(muggleIcon);
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
  } else if (student.studentHouse == "Ravenclaw") {
    clone.querySelector(".student-details-ribbon").style.backgroundColor =
      "#4785f3";
    clone.querySelector(".student-details-ribbon").style.borderColor =
      "#e0e0e0";
    clone.querySelector(
      ".student-details-ribbon img:last-of-type"
    ).style.filter =
      "invert(100%) sepia(0%) saturate(1574%) hue-rotate(251deg) brightness(83%) contrast(115%)";
  } else if (student.studentHouse == "Hufflepuff") {
    clone.querySelector(".student-details-ribbon").style.backgroundColor =
      "#ffb63c";
    clone.querySelector(".student-details-ribbon").style.borderColor =
      "#131211";
    clone.querySelector(
      ".student-details-ribbon img:last-of-type"
    ).style.filter =
      "invert(4%) sepia(15%) saturate(249%) hue-rotate(349deg) brightness(97%) contrast(94%)";
  } else if (student.studentHouse == "Slytherin") {
    clone.querySelector(".student-details-ribbon").style.backgroundColor =
      "#34a569";
    clone.querySelector(".student-details-ribbon").style.borderColor =
      "#202020";
    clone.querySelector(
      ".student-details-ribbon img:last-of-type"
    ).style.filter =
      "invert(10%) sepia(0%) saturate(1%) hue-rotate(98deg) brightness(89%) contrast(91%)";
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

  // TODO
  // Prefect
  // Inquisition
  // expelled
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
// ADMIN PANEL

function addAsPrefect() {
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
      student.firstName == firstNameField &&
      student.lastName == lastNameField
    ) {
      let prefectCount = prefectArray.filter(
        (prefect) => prefect.studentHouse == student.studentHouse
      ).length;
      let prefectGender = prefectArray.filter(
        (prefect) => prefect.studentGender == student.studentGender
      ).length;
      console.log(`Current Prefects: ${prefectCount}`);
      if (prefectCount < "2" && prefectGender < "1") {
        student.isPrefect = 1;
        prefectArray.push(student);
      } else {
        console.log("too many prefects");
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
      student.firstName == firstNameField &&
      student.lastName == lastNameField
    ) {
      if (
        student.bloodStatus == "Pure-blood" &&
        student.studentHouse == "Slytherin"
      )
        student.isInquisition = 1;
      inquisitionArray.push(student);
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
      student.firstName == firstNameField &&
      student.lastName == lastNameField
    ) {
      student.isPrefect = 0;
      let prefectIndex = prefectArray.indexOf(student);
      prefectArray.splice(prefectIndex, 1);
    }
  });
  // let filterValues = document.querySelector("#filter").value.split(" ");
  // console.log(filterValues);
  // if (filterValues[0] !== "default") {
  //   filterByProperty(filterValues[1], filterValues[0]);
  // } else {
  //   console.log("default");
  //   activeArray = studentArray;
  // }
  setTimeout(() => {
    showStudents(activeArray);
  }, 1000);
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
      student.firstName == firstNameField &&
      student.lastName == lastNameField
    ) {
      student.isInquisition = 0;
      let inquisitionIndex = inquisitionArray.indexOf(student);
      inquisitionArray.splice(inquisitionIndex, 1);
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
    if (
      student.firstName == firstNameField &&
      student.lastName == lastNameField
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
