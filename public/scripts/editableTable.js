const $tableID = $('#table');
const $BTN = $('#export-btn');
const $EXPORT = $('#export');

const newTr = `
 <tr>
 <td class="pt-3-half" contenteditable="true"><input type=hidden name="points_name"></td>
 <td class="pt-3-half" contenteditable="true"><input type=hidden name="points_description"></td>
 <td class="pt-3-half" contenteditable="true"><input type=hidden name="latitude"></td>
 <td class="pt-3-half" contenteditable="true"><input type=hidden name="longitude"></td>
 <td>
    <span class="table-add-button" ><button type="submit"
      class="btn btn-outline-primary btn-sm my-0 add">Add</button></span>
  </td>
 <td>
   <span class="table-remove"><button type="button"
       class="btn btn-danger btn-rounded btn-sm my-0">Remove</button></span>
 </td>
</tr>`;

$('.table-add').click(() => {

  $('tbody').append(newTr);
});
//edits an existing point
$(document).on('click', 'button.save', function () {
  window.alert("Refresh the page to see changes");
  const data = {};
  console.log($(this)[0])
  const row = $(this).parents('tr')
  data.pointId = row.data("pointid")
  data.mapId = row.data("mapid")

  row.find('td').each(function () {
    const tableCell = $(this)
    console.log(tableCell);

    const valueName = $(tableCell).find("input").attr("name")
    const value = $(tableCell).text();
    if (valueName) {
      data[valueName] = value;
    }
  })
  $.ajax({
    method: "POST",
    url: "/maps/" + data.mapId + "/add/"+data.pointId +"/",
    data: data
  })

});

//adds a new point to map
$(document).on('click', 'button.add', function () {
  window.alert("Refresh the page to see changes");
  const data = {};
  console.log($(this)[0])
  const row = $(this).parents('tr')

  row.find('td').each(function () {
    const tableCell = $(this)
    console.log(tableCell);

    const valueName = $(tableCell).find("input").attr("name")
    const value = $(tableCell).text();
    if (valueName) {
      data[valueName] = value;
    }
  })
  $.ajax({
    method: "POST",
    url: "/maps/" + window.location.href.split('/').filter(e=>e!=="")[3] + "/add/point",
    data: data
  })

});

$tableID.on('click', '.table-remove', function () {

  $(this).parents('tr').detach();
});

$tableID.on('click', '.table-up', function () {

  const $row = $(this).parents('tr');

  if ($row.index() === 0) {
    return;
  }

  $row.prev().before($row.get(0));
});

$tableID.on('click', '.table-down', function () {

  const $row = $(this).parents('tr');
  $row.next().after($row.get(0));
});

// A few jQuery helpers for exporting only
jQuery.fn.pop = [].pop;
jQuery.fn.shift = [].shift;

$BTN.on('click', () => {

  const $rows = $tableID.find('tr:not(:hidden)');
  const headers = [];
  const data = [];

  // Get the headers (add special header logic here)
  $($rows.shift()).find('th:not(:empty)').each(function () {

    headers.push($(this).text().toLowerCase());
  });

  // Turn all existing rows into a loopable array
  $rows.each(function () {
    const $td = $(this).find('td');
    const h = {};

    // Use the headers from earlier to name our hash keys
    headers.forEach((header, i) => {

      h[header] = $td.eq(i).text();
    });

    data.push(h);
  });

  // Output the result
  $EXPORT.text(JSON.stringify(data));
});
