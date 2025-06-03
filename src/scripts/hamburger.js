document.addEventListener("DOMContentLoaded", () => {
    let hamelmnts = document.querySelectorAll(".hamburger-zone");
    for (const btn of document.querySelectorAll(".hamburger-btn")) {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            for (const element of hamelmnts) {
                element.classList.toggle("active");
            }
        });
    }

    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdown = document.querySelector('.dropdown');

    dropdownToggle.addEventListener('click', function (e) {
        e.preventDefault(); // Zabrání skoku na #
        dropdown.classList.toggle('active');
    });

    // Zavření, pokud klikneš mimo menu
    document.addEventListener('click', function (e) {
        if (!dropdown.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

});