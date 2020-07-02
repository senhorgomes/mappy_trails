let newMapOutput = undefined;
const geocoder = new google.maps.Geocoder();
$(() => {
  $('#new_point').hide();
  $('#new_point_address').hide();
  $('#all_done').hide();

  //On submission, it will hide the submission button and populate a form to add a point address
  $('#new_map').on('submit', (evt) => {
    evt.preventDefault();
    console.log("ready");
    $.ajax("/maps", {
      method: 'POST', data: $('form')
        .serialize()
    })
      .then((res) => {
        newMapOutput = res;
        console.log(res);
        $('#new_point_address').slideDown('slow');
        $('#new_map button').hide();
      });
  });
  //Submit point address for geocoding
  $('#new_point_address').on('submit', (evt) => {
    evt.preventDefault();
    console.log("ready", newMapOutput);
    var address = $('#point_add').val();
    console.log(address)
    geocoder.geocode(
      {
        address: address
      },
      function (results, status) {
        console.log('status', status);
        if (status == 'OK') {
          console.log(results[0].geometry.location.lng())
          $('#point_lat').val(results[0].geometry.location.lat())
          $('#point_long').val(results[0].geometry.location.lng())
          $('#new_point').slideDown('slow');
          $('#new_point_address button').hide();
        } else {
          alert('The address you typed in is incorrect, please try again ' + status);
        }
      });
  })
  //Final submission to point
  $('#new_point').on('submit', (evt) => {
    evt.preventDefault();
    console.log("ready");
    $.ajax(`/maps/${newMapOutput.id}/points/submission`, {
      method: 'POST', data: $('form')
        .serialize()
    })
      .then((res) => {
        $('#new_point textarea').val("");
        $('#new_point input').val("");
        $('#point_add').val("");
        $('#point_lat').val("");
        $('#point_long').val("");
        $('#new_point').hide();
        $('#new_point_address button').slideDown('slow');
        alert('The point has been added to your map!');
        $('#all_done').slideDown('slow');
        console.log(res);
      });
  });
  $('#all_done').on('submit', (evt) => {
    evt.preventDefault();
    window.location.href = `http://localhost:8080/maps/${newMapOutput.id}`
    // $.ajax(`/maps/submit/${newMapOutput.id}/`, {
    //   method: 'GET'})
    })
});
