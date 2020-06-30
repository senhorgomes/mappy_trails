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
        let infowindow = new google.maps.InfoWindow({
          content: `<h5 >${marker.points_name}</h5>
          <p>${marker.description}</p>`
        })
        let googleMarker = new google.maps.Marker({
          position: { lat: Number(marker.latitude), lng: Number(marker.longitude) },
          map: googleMap,
        })
        googleMarker.addListener('click', function() {
          infowindow.open(googleMap, googleMarker);
        })
      }
      })
  }
  initMap();

})
