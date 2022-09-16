"uses strict";
//declare constants and global variables
const jsonList = "https://petlatkea.dk/2021/hogwarts/students.json";
const bloodJson = "";
const studentArray = [];
let lastNameArr;
let duplicateLastNameArr;
// init function on DOMContentLoaded
document.addEventListener("DOMContentLoaded", init);
function init() {
  loadJSON(jsonList, handleData);
}

function loadJSON(url, callback) {
  fetch(url)
    .then((response) => response.json())
    .then((jsonData) => callback(jsonData));
}

function handleData(data) {
  data.forEach(splitData);
  findDuplicateLastNames();
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
  console.table(studentArray);
}
