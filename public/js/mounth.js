let sendMounthData = "";
const showValue = (target) => {
  const value = target.value;
  sendMounthData = value;
  cardUpdate();
};
let mounthData;
let sumMounthPrice = 0;
async function imagedata() {
  await fetch(
    `http://localhost:4000/managerPage/money/mounth?data=${sendMounthData}`
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (myJson) {
      var stringdata = JSON.stringify(myJson);
      mounthData = JSON.parse(stringdata);
    });
}
async function cardUpdate() {
  await imagedata();
  let mounth = document.getElementById("tbcreate");
  mounth.innerHTML = "";
  for (let i in mounthData) {
    mounth.innerHTML =
      mounth.innerHTML +
      `
      <tr class='table_data'>
       <td></td>
       <td>${mounthData[i].day}</td>
       <td>${mounthData[i].salesprice}</td>
      </tr>`;
    sumMounthPrice = sumMounthPrice + Number(mounthData[i].salesprice);
  }
  let sum = document.getElementById("sum");
  sum.innerHTML = `<tr>
    <td>월 매출</td>
    <td>${sumMounthPrice}</td>
   </tr>`;
  mounthData = [];
  sumMounthPrice = 0;
}
