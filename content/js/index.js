getServers();

function getServers() {
    $("#clientList").empty();
    $.get("/servers", function (data) {
        console.log(data);
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var server = data[key];
                $("#clientList").append("<li>" + key + " <a href='/client?id=" + key + "'>join</a></li>");
            }
        }
    });
}