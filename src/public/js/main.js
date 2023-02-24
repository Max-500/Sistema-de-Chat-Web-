$(function () {
  const socket = io();

  const $messageForm = $("#message-form");
  const $messageBox = $("#message");

  const $chat = $("#chat");

  const $nickForm = $("#nicknameForm");
  const $nickError = $("#error");
  const $nickname = $("#nickname");

  const $users = $("#usernames");

  $nickForm.submit((e) => {
    e.preventDefault();
    socket.emit("new user", $nickname.val(), (data) => {
      if (data) {
        console.log("entro");
        $("#nicknameDiv").hide();
        $("#contentImportant").show();
      } else {
        console.log("Nombre no validado");
        let error = `<div class alert alert-danger>
                                <p>Nombre de usuario no disponible, se encuentra en uso</p>
                            </div>`;
        $nickError.html(error);
      }
      $nickname.val("");
    });
  });

  $messageForm.submit((e) => {
    e.preventDefault();
    console.log("Enviando Datos");
    socket.emit("send message", $messageBox.val());
    $messageBox.val("");
    var archivo = $("#file")[0].files[0];
    var archivoN = $("#file")[0].files[0].name;
    console.log(archivoN)
    console.log(archivo)
    var reader = new FileReader();
    reader.readAsDataURL(archivo);
    reader.onloadend = function () {
      var base64 = reader.result
      console.log("---");
      console.log(base64);
      socket.emit("send file", base64);
    };
  });

  socket.on("new message", function (data) {
    console.log("Nuevo mensaje " + data);
    $chat.append("<b>" + data.nick + "</b>" + " -> " + data.msg + "<br>");
  });

  socket.on("new file", function (file) {
    const base64Img = file;
    const imgElement = $("<img>").css({
      width: "100%",
      height: "100%",
    });

    imgElement.attr("src", base64Img);
    console.log("new file main")
    console.log(imgElement)
    $chat.append(imgElement);
  });

  socket.on("usernames", (data) => {
    console.log("entro2");
    let html = "";
    for (const element of data) {
      html = html + `<p>${element}</p>`;
    }
    $users.html(html);
  });
});
