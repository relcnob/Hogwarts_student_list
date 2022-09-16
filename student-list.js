"uses strict";
//declare constants and global variables
const jsonList = "https://petlatkea.dk/2021/hogwarts/students.json";
const bloodJson = "";
const studentArray = [];
let lastNameArr;
let duplicateLastNameArr;
let filterProperty;
let filterValue;
let sortProperty;
// init function on DOMContentLoaded
document.addEventListener("DOMContentLoaded", init);
function init() {
  loadJSON(jsonList, handleData);
  document.querySelector("p").addEventListener("click", () => {
    sortByProperty("firstName");
  });
  document.querySelector("p:last-of-type").addEventListener("click", () => {
    sortByProperty("lastName");
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
  };
  const studentObject = Object.create(studentObj);
  studentObject.firstName = firstName;
  studentObject.lastName = lastName;
  studentObject.middleName = middleName;
  studentObject.nickName = nickName;
  studentObject.studentHouse = studentHouse;
  studentObject.studentGender = studentGender;
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
  } else if (student.lastName !== undefined) {
    // if last name doesnt have duplicates and is not undefined
    student.studentImage =
      student.lastName.toLowerCase() +
      "_" +
      student.firstName[0].toLowerCase() +
      ".png";
  } else {
    // if last name is missing from student array
    student.studentImage = "missing_image.png";
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
}

// pass a value and a property to be filtered on
// Value is fx. Gryffindor
// Property is fx. studentHouse
function filterByProperty(value, property) {
  filterValue = value;
  filterProperty = property;
  console.log(`filtering: ${filterProperty} = ${filterValue}`);
  console.table(studentArray.filter(isValue));
  // filtering function
  function isValue(student) {
    if (student[filterProperty] == filterValue) {
      return true;
    } else return false;
  }
}

function sortByProperty(property) {
  if (event.target.dataset.sortDirection == "asc") {
    event.target.dataset.sortDirection = "desc";
    sortDirection = 1;
  } else {
    event.target.dataset.sortDirection = "asc";
    sortDirection = -1;
  }
  let sortedStudents = studentArray;
  sortProperty = property;
  console.log(`sorting: ${sortProperty}, ${sortDirection}`);
  console.table(sortedStudents.sort(sortStudents));
  // sorting function
  function sortStudents(studentA, studentB) {
    if (studentA[sortProperty] < studentB[sortProperty]) {
      return -1 * sortDirection;
    } else {
      return 1 * sortDirection;
    }
  }
}
