function forms(button, data, contentType = true) {
    const url = $(button).data("url")
    if (typeof data === "string") {
        data += "&_token=" + csrf_token
    } else {
        data._token = csrf_token
    }
    swaload({}, function () {
        $.ajax({
            url: url,
            data: data,
            method: "POST",
            success: function (res) {
                Swal.fire({
                    title: res[0],
                    html: res[1],
                    confirmButtonText: 'Submit',
                    focusConfirm: true,
                    showCancelButton: true,
                    didOpen: () => {
                        $("#executeByAjax").html(res[2])
                    },
                    didClose: () => {
                        $("#executeByAjax").html("")
                    },
                    preConfirm: () => {
                        if ($('#form').get(0).reportValidity()) {
                            var formData = "";
                            if (!contentType) {
                                formData = new FormData($("#form").get(0))
                                formData.append('_token', csrf_token)
                            } else {
                                formData = $("#form").serialize()
                                formData += "&_token=" + csrf_token
                            }

                            ajaxMake($("#form").data("url"), "POST", formData, "code", function (res) {
                                if (typeof dbRefresh === 'function') {
                                    dbRefresh()
                                }

                                if (typeof aspiration_refresh === 'function') {
                                    aspiration_refresh()
                                }

                                if (typeof ajaxRefresh === 'function') {
                                    ajaxRefresh()
                                }

                                $("#executeByAjax").html("")

                            }, "swaload")
                        }
                        return false;
                    },
                })
            }
        })
    })
}

function ajaxMake(url, method, data, type = null, closure, func = "swaload") {
    var ajax = [];
    ajax.url = url
    ajax.method = method
    ajax.data = data
    ajax.type = type
    switch (func) {
        case "swaload":
            swaload(ajax, closure)
            break;
    }
}

function swaload(ajax = "", closure) {
    Swal.fire({
        title: 'Please wait...',
        text: 'Your request is being processed.',
        didOpen: () => {
            Swal.showLoading();
            if (ajax.url != null) {
                var _ajax = {
                    url: ajax.url,
                    method: ajax.method,
                    data: ajax.data,
                    success: function (res) {
                        if (ajax.type == "code") {
                            if (res.code == 0) {
                                Swal.fire({
                                    title: res.info,
                                    text: res.message,
                                    icon: "success"
                                });
                            } else if (res.code == 1) {
                                Swal.fire({
                                    icon: "error",
                                    title: "Oops...",
                                    text: res.message,
                                });
                            }
                        }
                        closure(res)
                    }
                }
                if (ajax.data instanceof FormData) {
                    _ajax.contentType = false
                    _ajax.processData = false
                }
                $.ajax(_ajax)
            } else {

                closure()
            }
        }
    });
}

function SwalDelay(res, closure) {
    Swal.fire({
        title: 'Success!',
        html: res.message,
        icon: 'success',
        timer: 3000,
        timerProgressBar: true,
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
            const timer = Swal.getPopup().querySelector("b");
            let timerInterval = setInterval(() => {
                timer.textContent = Math.ceil(Swal
                    .getTimerLeft() / 1000
                );
            }, 500);
            setTimeout(() => {
                closure()
            }, 2700)
        }
    });
}

function logoutSubmit() {

    Swal.fire({
        title: "Are you sure?",
        text: "",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Logout"
    }).then((result) => {
        if (result.isConfirmed) {
            ajaxMake(url_act_Logout, "POST", { _token: csrf_token }, null, function (res) {
                if (res.code == 0) {
                    SwalDelay(res, function () {
                        location.reload();
                    })
                } else {
                    Swal.fire({
                        title: 'Error!',
                        text: res.message,
                        icon: 'error',
                        confirmButtonText: 'Try Again'
                    });
                }
            })
        }
    });
}

$(document).ready(function () {
    sidebar()

    $("#form_login").on("submit", function (e) {
        e.preventDefault()
        ajaxMake(url_act_Login, "POST", $(this).serialize(), null, function (res) {
            if (res.code == 0) {
                SwalDelay(res, function () {
                    window.location.href = url_Root;
                })
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: res.message,
                    icon: 'error',
                    confirmButtonText: 'Try Again'
                });
            }
        })
    })
});

function sidebar() {
    $("#toggleSidebar").click(function () {
        $(".sidebar").toggleClass("show");

        if ($(".sidebar").hasClass("show")) {
            $(".main-content").addClass("overlay");
        } else {
            $(".main-content").removeClass("overlay");
        }
    });

    $(document).click(function (e) {
        if (!$(e.target).closest(".sidebar, #toggleSidebar").length) {
            $(".sidebar").removeClass("show");
            $(".main-content").removeClass("overlay"); // Hapus efek gelap
        }
    });

    $(".btn-toggle").click(function () {
        var icon = $(this).find(".toggle-icon");
        if ($(this).hasClass("collapsed")) {
            icon.removeClass("fa-chevron-down").addClass("fa-chevron-right");
        } else {
            icon.removeClass("fa-chevron-right").addClass("fa-chevron-down");
        }
    });
}
