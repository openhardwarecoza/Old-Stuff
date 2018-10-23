var configItems = []

configparse = function(source) {
    // no source provided
    if (! source) {
        console.log('No source provided to parse.');
    }

    // no source provided
    if (typeof source != 'string') {
        console.log('The source must be a string.');
    }

    // split text on new lines
    var lines = source.split('\n');

    // no source provided
    if (! lines.length) {
        console.log('The source is empty.');
    } else {
      // console.log("Config Length: " +lines.length)
    }

    configItems = []

    for (i = 0; i <lines.length; i++) {
        // current line
        line = lines[i];

        var configItem = []
        if (line.trim().indexOf('# NOTE Lines must') == 0) {

        } else {
          // console.log("Line " +i + " matches? " + new RegExp(/^(#+)?([a-z0-9\.\_\-]+) ([^#]+)(.*)/).test(line));
          // console.log(line)

          var matches = line.match(/^(#+)?([a-z0-9\.\_\-]+) ([^#]+)(.*)/);

          if (matches) {
              // console.log("Line: " + i)
              // console.log("full " + matches[0])
              // console.log("disabled: " + matches[1])
              // console.log("name: " + matches[2])
              // console.log("value: " + matches[3])
              configItem.push(matches[1]);
              configItem.push(matches[2]);
              configItem.push(matches[3]);
              configItem.push(matches[4]);
              configItems.push(configItem);
          }

        }
      }

      // console.log(configItems)
      buildConfigTable(configItems);
}

function buildConfigTable(items) {
  $("#configlitems").empty();
  for (i=0; i<items.length; i++) {
    var line = items[i]
    var template = `<tr><td>`
    if ( typeof line[0] != "undefined") {
      template += `<i class="fa fa-check" aria-hidden="true"></i>`
    } else {
      template += `<i class="fa fa-times" aria-hidden="true"></i>`
    }
    template += '</td><td>' + line[1]+ `</td><td>` + line[2]+`</td><td>` + line[3]+`</td></tr>`;
    $("#configlitems").append(template)
  }
  $("#configModal").modal('show');
}
