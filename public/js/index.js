"use strict";
var socket = io("http://localhost:4000");
var productList = [];
const tag = document.querySelector("#info");
var overlap = 0;
var countProduct = {};
var product_Number = 1;
let countData = {};
let sumPrice = 0;
let marcketName = "";
var getProperty = function (propertyName) {
  return countProduct[propertyName];
};
var plusProperty = function (propertyName) {
  countProduct[propertyName] = getProperty(propertyName) + 1;
};

socket.on("connect", () => {
  console.log("connected server");
});
socket.on("emptyDB", (empty) => {
  alert(empty);
});
socket.on("sendCode", (data) => {
  const product = {
    companyName: data[0].company,
    productName: data[0].product_name,
    price: data[0].price,
  };
  if (productList.length == 0) {
    countProduct[`${data[0].product_name}`] = 1;
    tag.innerHTML =
      tag.innerHTML +
      `<tr id="${data[0].product_name}">
        <th scope="row">1</th>
        <td>${data[0].company}</td> 
        <td>${data[0].product_name}</td>
        <td>${data[0].price}</td>
        <td>${getProperty(data[0].product_name)}</td>
      </tr>`;
    product.productNumber = product_Number;
    product.productCount = 1;
    sumPrice = sumPrice + product.price;
    productList.push(product);
  } else {
    for (let list in productList) {
      if (productList[list].productName === data[0].product_name) {
        overlap = 1;
        product_Number = productList[list].productNumber;
        break;
      } else {
        overlap = 0;
      }
    }
    if (overlap != 0) {
      plusProperty(data[0].product_name);
      var li = document.getElementById(`${data[0].product_name}`);
      li.innerHTML = `
      <th scope="row">${product_Number}</th>
      <td>${data[0].company}</td> 
      <td>${data[0].product_name}</td>
      <td>${data[0].price}</td>
      <td>${getProperty(data[0].product_name)}</td>`;
      product.productNumber = product_Number;
      product.productCount = getProperty(data[0].product_name);
      sumPrice = sumPrice + product.price;
    } else {
      productList.forEach((productInfo) => {
        countData[productInfo.productName] = 1;
      });
      countProduct[`${data[0].product_name}`] = 1;
      tag.innerHTML =
        tag.innerHTML +
        `<tr id="${data[0].product_name}">
          <th scope="row">${Object.values(countData).length + 1}</th>
          <td>${data[0].company}</td> 
          <td>${data[0].product_name}</td>
          <td>${data[0].price}</td>
          <td>${getProperty(data[0].product_name)}</td>
        </tr>`;
      product.productNumber = Object.values(countData).length + 1;
      product.productCount = 1;
      sumPrice = sumPrice + product.price;
    }
    productList.push(product);
  }
  let priceInfo = document.getElementById("priceInfo");
  priceInfo.textContent = `${sumPrice}`;
});

var postdata = document.getElementById("postdata");

postdata.addEventListener("click", () => {
  var salesPrice = document.getElementById("salesPrice");
  salesPrice.textContent = `결제금액 : ${sumPrice}`;
  tag.innerHTML = "";
  socket.emit("sendList", JSON.stringify(productList));
  productList = [];
  console.log("전송완료");
  countProduct = {};
  countData = {};
  sumPrice = 0;
  let priceInfo = document.getElementById("priceInfo");
  priceInfo.textContent = `${sumPrice}`;
});

const showValue = (target) => {
  const value = target.value;
  socket.emit("setMarcket", value);
  if (value === "") {
    target.disabled = false;
  } else {
    target.disabled = true;
  }
};

// var marcket = document.getElementById("sendMarcket");
// marcket.addEventListener("click", () => {
//   let input = document.getElementById("nickname");
//   let nickname = input.options[input.selectedIndex].value;
//   socket.emit("setMarcket", nickname);
// });
