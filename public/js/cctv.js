let image;
async function imagedata() {
  await fetch("http://localhost:4000/managerPage/cctv/images")
    .then(function (response) {
      return response.json();
    })
    .then(function (myJson) {
      var stringdata = JSON.stringify(myJson);
      image = JSON.parse(stringdata);
    });
}
async function cardUpdate() {
  await imagedata();
  let card = document.getElementById("card");
  card.innerHTML = "";
  for (let i in image) {
    card.innerHTML =
      card.innerHTML +
      `
    <div class="card">
          <img src="/${image[i].imagename}" alt "이미지" style="width:400px; height:300px;"/>
          <div>
            <h5>${image[i].imagename}</h5>
            <p>
              촬영시각 : ${image[i].date}
            </p>
          </div>
        </div>`;
  }
  image = [];
}
var getimages = document.getElementById("getimages");
getimages.addEventListener("click", () => {
  cardUpdate();
});

var cc = document.getElementById("cc");
cc.addEventListener("click", () => {
  //window.location.replace("http://192.168.0.199:8091/?action=stream");
  var link = "http://192.168.0.199:8091/?action=stream";
  var popOption = "_blank";
  window.open(link, popOption);
});
