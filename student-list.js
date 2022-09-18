"uses strict";
//declare constants and global variables
const jsonList = "https://petlatkea.dk/2021/hogwarts/students.json";
const bloodJson = "";
const studentArray = [];
const bloodArray = [];
let activeArray = studentArray;
let expelledArray = [];
let lastNameArr;
let duplicateLastNameArr;
let filterProperty;
let filterValue;
let sortProperty;
// init function on DOMContentLoaded
document.addEventListener("DOMContentLoaded", init);
function init() {
  loadJSON(jsonList, handleData);
  document.querySelector("#sort").addEventListener("change", handleSort);
  document.querySelector("#filter").addEventListener("change", handleFilter);
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
  showStudents();
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
  let middleName, nickName;
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

  const studentObj = {
    fistName: "",
    lastName: "",
    middleName: "",
    nickName: "",
    studentHouse: "",
    studentGender: "",
    isExpelled: "",
    isPrefect: "",
    isInquisition: "",
  };
  const studentObject = Object.create(studentObj);
  studentObject.firstName = firstName;
  studentObject.lastName = lastName;
  studentObject.middleName = middleName;
  studentObject.nickName = nickName;
  studentObject.studentHouse = studentHouse;
  studentObject.studentGender = studentGender;
  studentObject.isExpelled = 0;
  studentObject.isPrefect = 0;
  studentObject.isInquisition = 0;
  studentArray.push(studentObject);
}

function findDuplicateLastNames() {
  lastNameArr = studentArray.map((a) => a.lastName);
  duplicateLastNameArr = lastNameArr.filter(
    (lastName, i, aar) =>
      aar.indexOf(lastName) === i && aar.lastIndexOf(lastName) !== i
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
    student.studentImage = student.firstName.toLowerCase();
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

function showStudents() {
  //   filterByProperty("Gryffindor", "studentHouse");
  //   sortByProperty("lastName");
  document.querySelector("#student-list").innerHTML = "";
  updateAbout();
  activeArray.forEach(displayStudents);
}

// pass a value and a property to be filtered on
// Value is fx. Gryffindor
// Property is fx. studentHouse
function filterByProperty(value, property) {
  filterValue = value;
  filterProperty = property;
  console.log(`filtering: ${filterProperty} = ${filterValue}`);
  activeArray = studentArray.filter(isValue);
  // filtering function
  function isValue(student) {
    if (student[filterProperty] == filterValue) {
      return true;
    } else return false;
  }
  showStudents();
}

function sortByProperty(property, dir) {
  if (property !== "default") {
    if (dir == "asc") {
      sortDirection = 1;
    } else {
      sortDirection = -1;
    }
    let sortedStudents = studentArray;
    sortProperty = property;
    console.log(`sorting: ${sortProperty}, ${sortDirection}`);
    activeArray = sortedStudents.sort(sortStudents);
    // sorting function
    function sortStudents(studentA, studentB) {
      if (studentA[sortProperty] < studentB[sortProperty]) {
        return -1 * sortDirection;
      } else {
        return 1 * sortDirection;
      }
    }
  }
  showStudents();
}

function handleSort() {
  // pass sort property and direction in one value and split it
  let options = event.target.value.split(" ");
  sortByProperty(options[0], options[1]);
}

function handleFilter() {
  console.log(studentArray);
  let options = event.target.value.split(" ");
  console.log(options);
  filterByProperty(options[1], options[0]);
}

function updateAbout() {
  document.querySelector("#total-count").textContent =
    "Total Students: " + studentArray.length;
  document.querySelector("#display-count").textContent = "Displayed Students: ";
  document.querySelector("#expelled-count").textContent = "Expelled Students: ";
  document.querySelector("#gryffindor-count").textContent = "Gryffindor: ";
  document.querySelector("#ravenclaw-count").textContent = "Ravenclaw: ";
  document.querySelector("#hufflepuff-count").textContent = "Hufflepuff: ";
  document.querySelector("#slytherin-count").textContent = "Slytherin: ";
  document.querySelector("#prefect-count").textContent = "Prefects: ";
  document.querySelector("#inquisition-count").textContent =
    "Inquisitorial Squad: ";
}

function displayStudents(student) {
  const parent = document.querySelector("#student-list");
  const template = document.querySelector("#student-card").content;
  const clone = template.cloneNode(true);
  clone.querySelector(
    ".student-card-student-image"
  ).src = `assets/student_images/${student.studentImage}`;
  clone
    .querySelector(".student-card-student-image")
    .addEventListener("error", imageMissing);
  clone.querySelector(
    ".student-card-house-image"
  ).src = `assets/house_crests/${student.studentHouse}.svg`;
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
  if (student.isPrefect == 1) {
    const prefectIcon = document.createElement(`span`);
    prefectIcon.classList.add(`student-card-prefect-status`);
    prefectIcon.textContent = "P";
    iconWrapper.appendChild(prefectIcon);
  }
  if (student.isInquisition == 1) {
    const inquisitionIcon = document.createElement(`span`);
    inquisitionIcon.classList.add(`student-card-inquisition-status`);
    inquisitionIcon.textContent = "I";
    iconWrapper.appendChild(inquisitionIcon);
  }
  if (student.isExpelled == 1) {
    const expelledIcon = document.createElement(`span`);
    expelledIcon.classList.add(`student-card-expelled-status`);
    expelledIcon.textContent = "EX";
    iconWrapper.appendChild(expelledIcon);
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
  ).src = `assets/house_crests/${student.studentHouse}.svg`;
  clone.querySelector(
    ".student-details-house-crest"
  ).alt = `${student.studentHouse}`;
  clone.querySelector(
    ".student-details-house-crest"
  ).title = `${student.studentHouse}`;
  // house ribbon colors
  if (student.studentHouse == "Gryffindor") {
    clone.querySelector(".student-details-ribbon").style.backgroundColor =
      "#D3000B";
    clone.querySelector(".student-details-ribbon").style.borderColor =
      "#F9A935";
  } else if (student.studentHouse == "Ravenclaw") {
    clone.querySelector(".student-details-ribbon").style.backgroundColor =
      "#1637D8";
    clone.querySelector(".student-details-ribbon").style.borderColor =
      "#D1D1D1";
  } else if (student.studentHouse == "Hufflepuff") {
    clone.querySelector(".student-details-ribbon").style.backgroundColor =
      "#F2D319";
    clone.querySelector(".student-details-ribbon").style.borderColor =
      "#E27E05";
  } else if (student.studentHouse == "Slytherin") {
    clone.querySelector(".student-details-ribbon").style.backgroundColor =
      "#00843F";
    clone.querySelector(".student-details-ribbon").style.borderColor =
      "#D1D1D1";
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

  // TODO
  // blood status
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

// missingImage
function imageMissing() {
  this.src = `assets/student_images/imagemissing.png`;
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
// add as prefect

function addAsPrefect() {
  const parent = this.parentElement.parentElement;
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
      student.isPrefect = 1;
    }
  });
  showStudents();
}

function addAsInquisitor() {
  const parent = this.parentElement.parentElement;
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
      student.isInquisition = 1;
    }
  });
  showStudents();
}
function removePrefect() {
  const parent = this.parentElement.parentElement;
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
    }
  });
  showStudents();
}
function removeInquisitor() {
  const parent = this.parentElement.parentElement;
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
    }
  });
  showStudents();
}

function expelStudent() {
  const parent = this.parentElement.parentElement;
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
    }
  });
  showStudents();
}
