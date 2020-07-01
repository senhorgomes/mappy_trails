let newMapOutput = undefined;
const geocoder = new google.maps.Geocoder();
$(() => {
  $('#new_point').hide();
  $('#new_point_address').hide();
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
    console.log("ready");
    $.ajax(`/maps/${newMapOutput.id}/points`, {
      method: 'POST', data: $('form')
        .serialize()
    })
      .then((res) => {
        function geocodeAddress(geocoder, resultsMap) {
          var address = $('#new_point_address').value;
          geocoder.geocode(
            {
              address: address
            });
        console.log(res);
        $('#new_point').slideDown('slow');
        $('#new_point_address button').hide();
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
        console.log(res);
      });
  });
});
