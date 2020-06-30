$(() => {
  console.log("ready");
  $.ajax("/maps/", { method: 'POST', data: $('form')
  .serialize() })
  .then((res) => {console.log(res)
  //$('new_point.children').empty()
  });
});
