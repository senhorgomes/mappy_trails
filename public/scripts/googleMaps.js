$(() => {
  console.log("ready");
  function initMap() {
    let myLatLng = { lat: 43.660, lng: -79.413 };

    var googleMap = new google.maps.Map(document.getElementById('map'), {
      zoom: 13,
      center: myLatLng
    });
    $.ajax({
      method: "GET",
      url: "/maps/" + window.location.href.split('/').filter(e => e !== "")[3] + "/markers"
    }).done((data) => {
      for (marker of (data.maps)) {
        let tempmarker = new google.maps.Marker({
          position: { lat: Number(marker.latitude), lng: Number(marker.longitude) },
          map: googleMap,
          title: 'Hello World!'
        })
      }
    });

  }
  initMap();

})
